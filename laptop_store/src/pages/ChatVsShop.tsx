import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Send, Store, User as UserIcon, MessageSquare,
    Image as ImageIcon, Video, Smile, ShoppingBag, Package, X, Loader2, ChevronRight
} from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import EmojiPicker from 'emoji-picker-react';

import axiosClient from '@/api/axiosClient.ts';
import { userApi } from '@/api/userApi.ts';
import { uploadApi } from "@/api/uploadApi.ts";
import { orderApi } from "@/api/orderApi.ts";
import { productApi } from "@/api/productApi.ts";

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
    };
    seller: {
        id: number;
        storeName: string;
    };
    lastMessage: string;
    lastMessageTime: string;
    unreadCount?: number;
}

export default function ChatVsShop() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const activeRoomId = searchParams.get('id');

    const [user, setUser] = useState<any>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
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

    const currentConv = conversations.find(c => c.id === activeRoomId);
    const activeShopId = currentConv?.seller.id;

    // 1. Fetch Profile & Danh sách Conversation
    useEffect(() => {
        userApi.getMyProfile().then(async (res) => {
            const currentUser = res.data;
            setUser(currentUser);
            try {
                const convRes = await axiosClient.get(`/api/chat/user/${currentUser.id}/conversations`);
                let rawConversations = convRes.data;
                const chatsWithUnread = await Promise.all(rawConversations.map(async (conv: Conversation) => {
                    const historyRes = await axiosClient.get(`/api/chat/${conv.id}`);
                    const historyMsgs = historyRes.data;
                    const unread = historyMsgs.filter(
                        (msg: any) => msg.senderId !== currentUser.id && msg.isRead === false
                    ).length;
                    return { ...conv, unreadCount: unread };
                }));
                chatsWithUnread.sort((a, b) => (b.unreadCount || 0) - (a.unreadCount || 0));
                setConversations(chatsWithUnread);
            } catch (error) { console.error(error); }
        }).catch(console.error);
    }, []);
    const formatIncomingMessage = (rawMsg: any): Message => {
        const imageUrls = rawMsg.media?.filter((m: any) => m.type === 'IMAGE').map((m: any) => m.url) || [];
        const videoUrl = rawMsg.media?.find((m: any) => m.type === 'VIDEO')?.url;

        return {
            ...rawMsg,
            imageUrls: imageUrls,
            videoUrl: videoUrl
        };
    };
    // 2. Setup WebSocket
    useEffect(() => {
        if (activeRoomId && user) {

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
                    client.subscribe(`/topic/chat/${activeRoomId}`, (msg) => {
                        const incomingMsg: Message = formatIncomingMessage(JSON.parse(msg.body));
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
            axiosClient.get(`/api/chat/${activeRoomId}`).then((res) => {
                const formattedMessages = res.data.map(formatIncomingMessage);
                setMessages(formattedMessages);
            });

            return () => {
                if (stompClientRef.current) stompClientRef.current.deactivate();
            };
        }
    }, [activeRoomId, user]);


    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    // --- HYDRATE DỮ LIỆU SẢN PHẨM/ĐƠN HÀNG ---
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
        if (!activeShopId) return;
        try {
            const res = await productApi.getProductsByShop(activeShopId);
            setShopProducts(res.data);
            setShowProductModal(true);
        } catch (error) { console.error(error); }
    };

    const fetchUserOrders = async () => {
        if (!activeShopId) return;
        try {
            const res = await orderApi.getOrdersByShop(activeShopId);
            setUserOrders(res.data);
            setShowOrderModal(true);
        } catch (error) { console.error(error); }
    };


    const handleSendMessage = async (e?: React.FormEvent, attachProductId?: number, attachOrderId?: number) => {
        e?.preventDefault();
        const hasText = inputText.trim().length > 0;
        const hasImages = selectedFiles.length > 0;
        const hasVideo = selectedVideo !== null;
        const isAttachmentOnly = attachProductId || attachOrderId;

        if ((!hasText && !hasImages && !hasVideo && !isAttachmentOnly) || !stompClientRef.current?.connected || !user || !activeRoomId || !activeShopId) return;

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
                roomId: activeRoomId,
                senderId: user.id,
                receiverId: activeShopId,
                senderName: user.fullName || "User",
                content: hasText ? inputText.trim() : (attachProductId ? "[Sản phẩm]" : attachOrderId ? "[Đơn hàng]" : ""),
                imageUrls: uploadedImageUrls,
                videoUrl: uploadedVideoUrl,
                productId: attachProductId || null,
                orderId: attachOrderId || null
            };

            stompClientRef.current!.publish({ destination: `/app/chat/${activeRoomId}/send`, body: JSON.stringify(chatMsg) });

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

    // RENDER THẺ SẢN PHẨM / ĐƠN HÀNG
    const renderProductCard = (productData: any) => (
        <div onClick={() => navigate(`/product/${productData.id}`)} className="bg-white border border-gray-200 rounded-lg p-2 mt-1 w-64 shadow-sm hover:border-blue-400 cursor-pointer transition-all">
            <div className="flex gap-2">
                <img src={productData.imageUrl || productData.image} alt="Product" className="w-12 h-12 object-cover rounded border border-gray-100" />
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{productData.name}</p>
                    <p className="text-[11px] text-gray-500">Mã: #{productData.id}</p>
                    <p className="text-[12px] text-orange-600 font-bold mt-0.5">{productData.price?.toLocaleString()} đ</p>
                </div>
            </div>
        </div>
    );

    const renderOrderCard = (orderData: any) => (
        <div
            onClick={() => navigate(`/account/orders`)}
            className="bg-orange-50 border border-orange-100 rounded-lg p-2 mt-1 w-64 shadow-sm hover:border-orange-300 cursor-pointer transition-all"
        >
            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-orange-100">
                <Package size={16} className="text-orange-600" />
                <span className="text-[11px] font-bold text-orange-800">Đơn hàng #{orderData.id}</span>
                <span className="ml-auto text-[10px] bg-orange-100 text-orange-600 px-1.5 rounded">{orderData.status}</span>
            </div>
            <div className="flex gap-2">
                <img
                    src={orderData.productImage}
                    alt="Product"
                    className="w-10 h-10 object-cover rounded"
                />
                <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-gray-700 line-clamp-2">{orderData.productName}</p>
                </div>
            </div>
        </div>
    );
    return (
        <div className="max-w-6xl mx-auto p-4 py-8 relative">

            {/* --- MODALS --- */}
            {showOrderModal && (
                <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-0 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50">
                            <h4 className="font-bold text-gray-700">Đơn hàng của bạn</h4>
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
                <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-0 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b flex justify-between items-center">
                            <h4 className="font-bold text-gray-700">Chọn sản phẩm</h4>
                            <button onClick={() => setShowProductModal(false)}><X size={18} /></button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {shopProducts.map(product => (
                                <button key={product.id} onClick={() => { handleSendMessage(undefined, product.id, undefined); setShowProductModal(false); }} className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 transition-colors border-b last:border-0">
                                    <img src={product.imageUrl} className="w-12 h-12 object-cover rounded border" />
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                                        <p className="text-xs text-orange-600 font-bold">{product.price?.toLocaleString()} đ</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                {/* ================= CỘT TRÁI: DANH SÁCH HỘI THOẠI ================= */}
                <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col z-10">
                    <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-2">
                        <MessageSquare className="text-blue-600" />
                        <h2 className="font-bold text-slate-800 text-lg">Tin nhắn</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 && <p className="p-6 text-center text-sm text-slate-400">Bạn chưa có cuộc trò chuyện nào.</p>}
                        {conversations.map((conv) => (
                            <div key={conv.id} onClick={() => navigate(`/chat?id=${conv.id}`)} className={`p-4 border-b border-slate-100 cursor-pointer transition-colors flex items-center gap-3 ${ activeRoomId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-white' }`}>
                                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold shrink-0"><Store size={20} /></div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className={`text-sm truncate pr-2 ${activeRoomId === conv.id ? 'font-bold text-blue-800' : 'font-medium text-slate-700'}`}>{conv.seller?.storeName || 'Cửa hàng'}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-xs truncate ${conv.unreadCount && conv.unreadCount > 0 ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>{conv.lastMessage}</p>
                                        {conv.unreadCount && conv.unreadCount > 0 ? (
                                            <span className="bg-pink-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{conv.unreadCount > 99 ? '99+' : conv.unreadCount}</span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= CỘT PHẢI: KHUNG CHAT ================= */}
                <div className="w-2/3 flex flex-col bg-slate-50 relative z-0">
                    {activeRoomId ? (
                        <>
                            {/* Header chat */}
                            <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 shadow-sm z-10">
                                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600"><Store size={20} /></div>
                                <div>
                                    <h2 className="font-bold text-slate-800">{currentConv?.seller?.storeName || "Cửa hàng"}</h2>
                                    <span className="text-[11px] text-green-500 font-medium flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Đang hoạt động</span>
                                </div>
                            </div>

                            {/* Nội dung chat */}
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                                {messages.map((msg) => {
                                    const isMe = Number(msg.senderId) === Number(user?.id);
                                    const isRecalled = msg.recalled;
                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[85%] px-4 py-2.5 text-sm shadow-sm relative group ${ isRecalled ? 'bg-transparent border border-gray-300 text-gray-400 italic rounded-2xl' : isMe ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-gray-200 text-slate-800 rounded-2xl rounded-tl-sm' }`}>
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
                                            </div>
                                            <span className="text-[10px] text-slate-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}</span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* --- THANH NHẬP LIỆU --- */}
                            <div className="flex flex-col bg-white border-t border-gray-100 relative">
                                {/* Thanh Công cụ phụ (Sản phẩm/Đơn hàng) */}
                                <div className="flex gap-4 px-4 pt-2 pb-1 border-b border-gray-50">
                                    <button onClick={fetchShopProducts} className="text-[11px] font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-100 transition"><ShoppingBag size={12}/> Gửi Sản phẩm</button>
                                    <button onClick={fetchUserOrders} className="text-[11px] font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-orange-100 transition"><Package size={12}/> Gửi Đơn hàng</button>
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
                                    <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2 bg-gray-100 rounded-full pr-1.5 pl-4 py-1.5 focus-within:ring-2 focus-within:ring-blue-100">
                                        <input type="file" accept="image/*" multiple className="hidden" ref={imageInputRef} onChange={handleImageSelect}/>
                                        <input type="file" accept="video/*" className="hidden" ref={videoInputRef} onChange={handleVideoSelect}/>

                                        <button type="button" disabled={isUploading} onClick={() => imageInputRef.current?.click()} className="text-gray-400 hover:text-blue-600 transition"><ImageIcon size={20}/></button>
                                        <button type="button" disabled={isUploading} onClick={() => videoInputRef.current?.click()} className="text-gray-400 hover:text-blue-600 transition"><Video size={20}/></button>
                                        <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-400 hover:text-blue-600 transition"><Smile size={20}/></button>

                                        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onFocus={() => setShowEmojiPicker(false)} placeholder="Nhắn tin với cửa hàng..." className="flex-1 bg-transparent text-sm text-slate-700 outline-none ml-1"/>

                                        <button type="submit" disabled={(!inputText.trim() && !selectedFiles.length && !selectedVideo) || isUploading} className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 transition-colors">
                                            {isUploading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16} className="-ml-0.5" />}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <MessageSquare size={56} className="mb-4 opacity-30" />
                            <p className="font-medium">Chọn một cửa hàng để bắt đầu trò chuyện</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}