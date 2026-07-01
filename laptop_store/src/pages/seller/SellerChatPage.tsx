import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Send, Store, User as UserIcon, X, Image as ImageIcon,
    Video, Smile, ShoppingBag, Package, Loader2
} from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import EmojiPicker from 'emoji-picker-react';

import axiosClient from '../../api/axiosClient';
import { userApi } from '../../api/userApi';
import { uploadApi } from '../../api/uploadApi';
import { productApi } from '../../api/productApi';
import { orderApi } from '../../api/orderApi';

interface Message {
    id: number;
    roomId: string;
    senderId: number;
    senderName: string;
    content: string;
    timestamp: string;
    recalled: boolean;
    imageUrls?: string[];
    videoUrl?: string;
    productId?: number;
    orderId?: number;
    productData?: any;
    orderData?: any;
}

export interface Conversation {
    id: string;
    buyer: {
        id: number;
        fullName: string;
        avatarUrl: string;
    };
    seller: {
        id: number;
        fullName: string;
    };
    lastMessage: string;
    lastMessageTime: string;
}

export const SellerChatPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');


    const [isUploading, setIsUploading] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [shopProducts, setShopProducts] = useState<any[]>([]);
    const [userOrders, setUserOrders] = useState<any[]>([]);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const stompClientRef = useRef<Client | null>(null);
    const token = localStorage.getItem('token');

    const currentConv = conversations.find(c => c.id === activeRoom);


    const formatIncomingMessage = (rawMsg: any): Message => {
        const imageUrls = rawMsg.media?.filter((m: any) => m.type === 'IMAGE').map((m: any) => m.url) || [];
        const videoUrl = rawMsg.media?.find((m: any) => m.type === 'VIDEO')?.url;
        return { ...rawMsg, imageUrls, videoUrl };
    };

    // 1. Fetch Profile & Danh sách Conversation
    useEffect(() => {
        userApi.getMyProfile().then((res) => {
            setUser(res.data);
            axiosClient.get(`/api/chat/seller/${res.data.id}`).then((r) => setConversations(r.data));
        }).catch(console.error);
    }, []);


    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // 2. Setup WebSocket
    useEffect(() => {
        if (activeRoom && user) {
            setInputText('');
            setSelectedFiles([]);
            setPreviewUrls([]);
            setSelectedVideo(null);
            setShowEmojiPicker(false);

            const client = new Client({
                webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
                connectHeaders: { Authorization: `Bearer ${token}` },
                debug: () => {},
                onConnect: () => {
                    client.subscribe(`/topic/chat/${activeRoom}`, (msg) => {
                        const incomingMsg = formatIncomingMessage(JSON.parse(msg.body));
                        setMessages((prev) => {
                            const exists = prev.find((m) => m.id === incomingMsg.id);
                            if (exists) return prev.map((m) => (m.id === incomingMsg.id ? incomingMsg : m));
                            return [...prev, incomingMsg];
                        });
                    });
                },
            });

            client.activate();
            stompClientRef.current = client;

            axiosClient.get(`/api/chat/${activeRoom}`).then((res) => {
                setMessages(res.data.map(formatIncomingMessage));
            });

            return () => {
                if (stompClientRef.current) stompClientRef.current.deactivate();
            };
        }
    }, [activeRoom, user]);

    //  HYDRATE DỮ LIỆU SẢN PHẨM/ĐƠN HÀNG
    const hydrateMessages = async (msgList: Message[]) => {
        const newMessages = [...msgList];
        for (let i = 0; i < newMessages.length; i++) {
            const msg = newMessages[i];
            if (msg.productId && !msg.productData) {
                try {
                    const res = await productApi.getProductById(msg.productId);
                    newMessages[i].productData = res.data;
                } catch (err) { console.error(err); }
            }
            if (msg.orderId && !msg.orderData) {
                try {
                    console.log(msg.orderId);
                    const res = await orderApi.getOrderDetailById(msg.orderId);
                    newMessages[i].orderData = res.data;
                } catch (err) { console.error(err); }
            }
        }
        setMessages(newMessages);
    };

    useEffect(() => {
        const needsHydration = messages.some(msg => (msg.productId && !msg.productData) || (msg.orderId && !msg.orderData));
        if (needsHydration) { hydrateMessages(messages); }
    }, [messages]);

    // --- XỬ LÝ FILE & MODAL ---
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setSelectedFiles(prev => [...prev, ...files]);
        setPreviewUrls(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) return alert("Vui lòng chọn video dưới 20MB");
        setSelectedVideo(file);
        if (videoInputRef.current) videoInputRef.current.value = '';
    };

    const fetchShopProducts = async () => {
        if (!currentConv) return;
        try {
            const res = await productApi.getProductsByShop(currentConv.seller.id);
            setShopProducts(res.data);
            setShowProductModal(true);
        } catch (error) { console.error(error); }
    };

    const fetchUserOrders = async () => {
        if (!currentConv) return;
        try {
            const res = await orderApi.getOrdersForSeller(currentConv.buyer.id,currentConv.seller.id);
            setUserOrders(res.data);
            setShowOrderModal(true);
        } catch (error) { console.error(error); }
    };

    // --- GỬI TIN NHẮN TỔNG HỢP ---
    const handleSendMessage = async (e?: React.FormEvent, attachProductId?: number, attachOrderId?: number) => {
        e?.preventDefault();
        const hasText = inputText.trim().length > 0;
        const hasImages = selectedFiles.length > 0;
        const hasVideo = selectedVideo !== null;
        const isAttachmentOnly = attachProductId || attachOrderId;

        if ((!hasText && !hasImages && !hasVideo && !isAttachmentOnly) || !stompClientRef.current?.connected || !user || !activeRoom || !currentConv) return;

        try {
            setIsUploading(true);
            let uploadedImageUrls: string[] = [];
            let uploadedVideoUrl: string | undefined = undefined;

            if (hasImages) {
                const uploadRes = await uploadApi.uploadMultipleImages(selectedFiles);
                uploadedImageUrls = uploadRes.data;
            }
            if (hasVideo) {
                const videoRes = await uploadApi.uploadMultipleImages([selectedVideo]);
                uploadedVideoUrl = videoRes.data[0];
            }

            const chatMsg = {
                roomId: activeRoom,
                senderId: user.id,
                receiverId: currentConv.buyer.id,
                senderName: user.fullName || "Shop",
                content: hasText ? inputText.trim() : (attachProductId ? "[Sản phẩm]" : attachOrderId ? "[Đơn hàng]" : ""),
                imageUrls: uploadedImageUrls,
                videoUrl: uploadedVideoUrl,
                productId: attachProductId || null,
                orderId: attachOrderId || null
            };

            stompClientRef.current.publish({ destination: `/app/chat/${activeRoom}/send`, body: JSON.stringify(chatMsg) });

            setInputText('');
            setSelectedFiles([]);
            setPreviewUrls([]);
            setSelectedVideo(null);
            setShowEmojiPicker(false);
        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRecall = (messageId: number) => {
        if (stompClientRef.current?.connected && user && activeRoom) {
            stompClientRef.current.publish({
                destination: `/app/chat/${activeRoom}/recall`,
                body: JSON.stringify({ messageId: messageId, senderId: user.id })
            });
        }
    };

    console.log(currentConv);

    // --- RENDER THẺ ---
    const renderProductCard = (productData: any) => (
        <div onClick={() => navigate(`/product/${productData.id}`)} className="bg-white border border-gray-200 rounded-lg p-2 mt-1 w-64 shadow-sm hover:border-emerald-400 cursor-pointer transition-all text-left">
            <div className="flex gap-2">
                <img src={productData.imageUrl || productData.image} alt="Product" className="w-12 h-12 object-cover rounded border border-gray-100" />
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{productData.name}</p>
                    <p className="text-[11px] text-gray-500">Mã: #{productData.id}</p>
                    <p className="text-[12px] text-emerald-600 font-bold mt-0.5">{productData.price?.toLocaleString()} đ</p>
                </div>
            </div>
        </div>
    );

    const renderOrderCard = (orderData: any) => (
        <div onClick={() => navigate(`/seller/orders/${orderData.id}`)} className="bg-orange-50 border border-orange-100 rounded-lg p-2 mt-1 w-64 shadow-sm hover:border-orange-300 cursor-pointer transition-all text-left">
            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-orange-100">
                <Package size={16} className="text-orange-600" />
                <span className="text-[11px] font-bold text-orange-800">Đơn hàng #{orderData.id}</span>
                <span className="ml-auto text-[10px] bg-orange-100 text-orange-600 px-1.5 rounded">{orderData.status}</span>
            </div>
            <div className="flex gap-2">
                <img src={orderData.productImage} alt="Product" className="w-10 h-10 object-cover rounded" />
                <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-gray-700 line-clamp-2">{orderData.productName}</p>
                </div>
            </div>
        </div>
    );
    console.log(messages);

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white rounded-xl shadow border border-slate-200 overflow-hidden relative">

            {/* --- MODALS --- */}
            {showOrderModal && (
                <div className="absolute inset-0 z-[100] bg-black/40 flex items-center justify-center p-4 rounded-xl">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-0 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50">
                            <h4 className="font-bold text-gray-700">Gửi thông tin đơn hàng</h4>
                            <button onClick={() => setShowOrderModal(false)} className="hover:bg-gray-200 p-1 rounded-full"><X size={18} /></button>
                        </div>
                        <div className="max-h-80 overflow-y-auto p-2">
                            {userOrders.map(order => (
                                <button key={order.id} onClick={() => { handleSendMessage(undefined, undefined, order.id); setShowOrderModal(false); }} className="w-full text-left p-3 border-b last:border-0 hover:bg-orange-50 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-sm text-gray-700">Đơn #{order.id}</span>
                                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">{order.status}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showProductModal && (
                <div className="absolute inset-0 z-[100] bg-black/40 flex items-center justify-center p-4 rounded-xl">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-0 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50">
                            <h4 className="font-bold text-gray-700">Chọn sản phẩm gợi ý</h4>
                            <button onClick={() => setShowProductModal(false)}><X size={18} /></button>
                        </div>
                        <div className="max-h-80 overflow-y-auto p-2">
                            {shopProducts.map(product => (
                                <button key={product.id} onClick={() => { handleSendMessage(undefined, product.id, undefined); setShowProductModal(false); }} className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50 transition-colors border-b last:border-0 rounded-lg">
                                    <img src={product.imageUrl} className="w-12 h-12 object-cover rounded border" />
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                                        <p className="text-xs text-emerald-600 font-bold">{product.price?.toLocaleString()} đ</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Cột trái: Danh sách Chat */}
            <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col z-10">
                <div className="p-4 bg-white border-b border-slate-200 font-bold text-slate-800">
                    Hộp thư Khách Hàng
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 && <p className="p-4 text-sm text-slate-500">Chưa có tin nhắn nào.</p>}
                    {conversations.map((conv) => (
                        <div key={conv.id} onClick={() => setActiveRoom(conv.id)} className={`p-4 border-b border-slate-100 cursor-pointer transition-colors flex items-center gap-3 ${ activeRoom === conv.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : 'hover:bg-white' }`}>
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                                <UserIcon size={20}/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm truncate ${activeRoom === conv.id ? 'font-bold text-emerald-800' : 'font-medium text-slate-700'}`}>
                                    {conv.buyer.fullName}
                                </p>
                                <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cột phải: Khung Chat */}
            <div className="w-2/3 flex flex-col bg-slate-50 relative z-0">
                {activeRoom ? (
                    <>
                        <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 shadow-sm z-10">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                <UserIcon size={20}/>
                            </div>
                            <h2 className="font-bold text-slate-800">
                                {currentConv?.buyer.fullName || "Khách hàng"}
                            </h2>
                        </div>

                        {/* Nội dung chat */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                            {messages.map((msg) => {
                                const isMe = Number(msg.senderId) === Number(user?.id);
                                const isRecalled = msg.recalled;

                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[85%] px-4 py-2.5 text-sm shadow-sm relative group ${ isRecalled ? 'bg-transparent border border-gray-300 text-gray-400 italic rounded-2xl' : isMe ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-gray-200 text-slate-800 rounded-2xl rounded-tl-sm' }`}>
                                            {isRecalled ? 'Tin nhắn đã bị thu hồi' : (
                                                <div className="flex flex-col gap-2">
                                                    {msg.content && !msg.content.includes("[") && <span className="whitespace-pre-wrap break-words">{msg.content}</span>}
                                                    {msg.productId && msg.productData && renderProductCard(msg.productData)}
                                                    {msg.orderId && msg.orderData && renderOrderCard(msg.orderData)}
                                                    {msg.imageUrls && msg.imageUrls.length > 0 && (
                                                        <div className={`grid gap-1 ${msg.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} mt-1`}>
                                                            {msg.imageUrls.map((url, i) => <img key={i} src={url} alt="Ảnh chat" className="w-full h-auto max-h-40 object-cover rounded-md border border-gray-200/50"/>)}
                                                        </div>
                                                    )}
                                                    {msg.videoUrl && <video controls className="w-full max-h-48 rounded-md bg-black"><source src={msg.videoUrl} type="video/mp4"/></video>}
                                                </div>
                                            )}

                                            {/* Nút thu hồi */}
                                            {isMe && !isRecalled && (
                                                <button className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Thu hồi tin nhắn" onClick={() => handleRecall(msg.id)}>
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-1">
                                            {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef}/>
                        </div>

                        {/* --- THANH NHẬP LIỆU --- */}
                        <div className="flex flex-col bg-white border-t border-gray-100 relative">
                            {/* Thanh Công cụ phụ */}
                            <div className="flex gap-4 px-4 pt-2 pb-1 border-b border-gray-50">
                                <button onClick={fetchShopProducts} className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-emerald-100 transition"><ShoppingBag size={12}/> Gửi Sản phẩm</button>
                                <button onClick={fetchUserOrders} className="text-[11px] font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-orange-100 transition"><Package size={12}/> Đơn hàng</button>
                            </div>

                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                                <div className="absolute bottom-full right-4 z-50 mb-2 drop-shadow-2xl">
                                    <EmojiPicker onEmojiClick={(e) => setInputText(prev => prev + e.emoji)} width={320} height={350}/>
                                </div>
                            )}

                            {/* Preview File */}
                            {(previewUrls.length > 0 || selectedVideo) && (
                                <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50 border-b border-gray-100">
                                    {previewUrls.map((url, i) => <img key={i} src={url} className="w-16 h-16 object-cover rounded-lg border border-gray-200"/>)}
                                    {selectedVideo && (
                                        <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center relative">
                                            <Video className="text-white opacity-50"/>
                                            <button onClick={() => setSelectedVideo(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Form Nhập chính */}
                            <div className="p-3">
                                <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2 bg-slate-100 rounded-full pr-1.5 pl-4 py-1.5 focus-within:ring-2 focus-within:ring-emerald-200">
                                    <input type="file" accept="image/*" multiple className="hidden" ref={imageInputRef} onChange={handleImageSelect}/>
                                    <input type="file" accept="video/*" className="hidden" ref={videoInputRef} onChange={handleVideoSelect}/>

                                    <button type="button" disabled={isUploading} onClick={() => imageInputRef.current?.click()} className="text-slate-400 hover:text-emerald-600 transition"><ImageIcon size={20}/></button>
                                    <button type="button" disabled={isUploading} onClick={() => videoInputRef.current?.click()} className="text-slate-400 hover:text-emerald-600 transition"><Video size={20}/></button>
                                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-slate-400 hover:text-emerald-600 transition"><Smile size={20}/></button>

                                    <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onFocus={() => setShowEmojiPicker(false)} placeholder="Trả lời khách hàng..." className="flex-1 bg-transparent text-sm text-slate-700 outline-none ml-1"/>

                                    <button type="submit" disabled={(!inputText.trim() && !selectedFiles.length && !selectedVideo) || isUploading} className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300 transition-colors">
                                        {isUploading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16} className="-ml-0.5" />}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Store size={48} className="mb-4 opacity-50"/>
                        <p>Chọn một cuộc hội thoại để bắt đầu</p>
                    </div>
                )}
            </div>
        </div>
    );
};