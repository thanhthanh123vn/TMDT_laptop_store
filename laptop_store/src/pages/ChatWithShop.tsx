import React, {useState, useRef, useEffect} from 'react';
import {
    MessageCircle,
    X,
    Send,
    Store,
    Image as ImageIcon,
    Loader2,
    Smile,
    Video,
    Package,
    ShoppingBag
} from 'lucide-react';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import EmojiPicker from 'emoji-picker-react';

import axiosClient from "@/api/axiosClient.ts";
import {userApi} from "@/api/userApi.ts";
import {uploadApi} from "@/api/uploadApi.ts";
import {orderApi} from "@/api/orderApi.ts";
import {productApi} from "@/api/productApi.ts";
import {useNavigate} from "react-router";

interface User {
    id: number;
    fullName: string;
    email: string;
}

interface Message {
    id: number;
    roomId: string;
    senderId: number;
    receiverId: number;
    senderName: string;
    content: string;
    timestamp: string;
    recalled: boolean;
    imageUrls?: string[];
    videoUrl?: string;
    productId?: number;
    orderId?: number;

    productData?: {
        name: string;
        image: string;
        price: number;
    };
    orderData?: {
        id: number;
        status: string;
        productName: string;
        productImage: string;
    };
}

interface ChatProps {
    productId?: string | number;
    shopId: string | number;
    shopName?: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const ChatWithShop: React.FC<ChatProps> = ({productId, shopId, shopName, isOpen, setIsOpen}) => {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        userApi.getMyProfile().then((res) => setUser(res.data)).catch(console.error);
    }, []);
    const token = localStorage.getItem('token');

    const navigate = useNavigate();
    const roomId = `room_buyer_${user?.id}_seller_${shopId}`;

    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [shopProducts, setShopProducts] = useState<any[]>([]);
    // Upload Ảnh & Video
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const stompClientRef = useRef<Client | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [userOrders, setUserOrders] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [isOpen, messages]);
    const formatIncomingMessage = (rawMsg: any): Message => {
        const imageUrls = rawMsg.media?.filter((m: any) => m.type === 'IMAGE').map((m: any) => m.url) || [];
        const videoUrl = rawMsg.media?.find((m: any) => m.type === 'VIDEO')?.url;

        return {
            ...rawMsg,
            imageUrls: imageUrls,
            videoUrl: videoUrl
        };
    };
    // Kết nối WebSocket
    useEffect(() => {
        if (isOpen && user) {
            const client = new Client({
                webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
                connectHeaders: {Authorization: `Bearer ${token}`},
                debug: () => {
                },
                onConnect: () => {
                    client.subscribe(`/topic/chat/${roomId}`, (msg) => {

                        const incomingMsg: Message = formatIncomingMessage(JSON.parse(msg.body));
                        setMessages((prev) => prev.find(m => m.id === incomingMsg.id) ? prev.map(m => m.id === incomingMsg.id ? incomingMsg : m) : [...prev, incomingMsg]);
                    });
                },
            });
            client.activate();
            stompClientRef.current = client;
            axiosClient.get(`/api/chat/${roomId}`).then((res) => {
                const formattedMessages = res.data.map(formatIncomingMessage);
                setMessages(formattedMessages);
            });
        }
        return () => {
            if (stompClientRef.current) stompClientRef.current.deactivate();
        };
    }, [isOpen, user, roomId]);


    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setSelectedFiles(prev => [...prev, ...files]);
        setPreviewUrls(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
        if (imageInputRef.current) imageInputRef.current.value = '';
    };
    const fetchShopProducts = async () => {
        try {
            const res = await productApi.getProductsByShop(shopId);
            setShopProducts(res.data);
            setShowProductModal(true);
        } catch (error) {
            console.error("Lỗi lấy sản phẩm:", error);
        }
    };
    const fetchUserOrders = async () => {
        try {
            const res = await orderApi.getOrdersByShop(shopId);
            setUserOrders(res.data);
            setShowOrderModal(true);
        } catch (error) {
            console.error("Lỗi lấy đơn hàng:", error);
        }
    };
    const hydrateMessages = async (msgList: Message[]) => {
        const newMessages = [...msgList];

        for (let i = 0; i < newMessages.length; i++) {
            const msg = newMessages[i];


            if (msg.productId && !msg.productData) {
                try {
                    const res = await productApi.getProductById(msg.productId);
                    newMessages[i].productData = res.data;
                } catch (err) { console.error("Lỗi tải SP", err); }
            }


            if (msg.orderId && !msg.orderData) {
                try {
                    const res = await orderApi.getOrderDetailById(msg.orderId);
                    newMessages[i].orderData = res.data;
                } catch (err) { console.error("Lỗi tải ĐH", err); }
            }
        }

        setMessages(newMessages);
    };
    useEffect(() => {

        const needsHydration = messages.some(msg =>
            (msg.productId && !msg.productData) || (msg.orderId && !msg.orderData)
        );

        if (needsHydration) {
            hydrateMessages(messages);
        }
    }, [messages]);
    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 20 * 1024 * 1024) {
            alert("Vui lòng chọn video dưới 20MB");
            return;
        }
        setSelectedVideo(file);
        if (videoInputRef.current) videoInputRef.current.value = '';
    };


    const handleSendMessage = async (e: React.FormEvent, attachProductId?: number, attachOrderId?: number) => {
        e?.preventDefault();
        console.log("đã gọi gửi sản phẩm")
        const hasText = inputText.trim().length > 0;
        const hasImages = selectedFiles.length > 0;
        const hasVideo = selectedVideo !== null;
        const isAttachmentOnly = attachProductId || attachOrderId;
        console.log(attachProductId);
        if ((!hasText && !hasImages && !hasVideo && !isAttachmentOnly) || !stompClientRef.current?.connected || !user) return;

        try {
            setIsUploading(true);
            let uploadedImageUrls: string[] = [];
            let uploadedVideoUrl: string | undefined = undefined;


            if (hasImages) {
                const uploadRes = await uploadApi.uploadMultipleImages(selectedFiles);
                uploadedImageUrls = uploadRes.data;
            }


            if (hasVideo) {
                const formData = new FormData();
                formData.append("files", selectedVideo); // Sửa key cho khớp API của bạn
                const videoRes = await uploadApi.uploadMultipleImages([selectedVideo]);
                uploadedVideoUrl = videoRes.data[0];
            }


            const chatMsg = {
                roomId: roomId,
                senderId: user.id,
                receiverId: typeof shopId === 'string' ? parseInt(shopId) : shopId,
                senderName: user.fullName || "User",
                content: hasText ? inputText.trim() : (attachProductId ? "[Sản phẩm]" : attachOrderId ? "[Đơn hàng]" : ""),
                imageUrls: uploadedImageUrls,
                videoUrl: uploadedVideoUrl,
                productId: attachProductId || null,
                orderId: attachOrderId || null
            };

            stompClientRef.current!.publish({
                destination: `/app/chat/${roomId}/send`,
                body: JSON.stringify(chatMsg)
            });


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

    if (!user) return null;
    // 1. Render Card Sản phẩm
    const renderProductCard = (productData: any) => (
        <div
            onClick={() => navigate(`/product/${productData.id}`)}
            className="bg-white border border-gray-200 rounded-lg p-2 mt-1 w-64 shadow-sm hover:border-blue-400 cursor-pointer transition-all"
        >
            <div className="flex gap-2">
                <img
                    src={productData.imageUrl || productData.image}
                    alt="Product"
                    className="w-12 h-12 object-cover rounded border border-gray-100"
                />
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{productData.name}</p>
                    <p className="text-[11px] text-gray-500">Mã: #{productData.id}</p>
                    <p className="text-[12px] text-orange-600 font-bold mt-0.5">{productData.price.toLocaleString()} đ</p>
                </div>
            </div>
        </div>
    );

    // 2. Render Card Đơn hàng
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

        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            {showOrderModal && (
                <div className="absolute inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-0 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50">
                            <h4 className="font-bold text-gray-700">Đơn hàng của bạn</h4>
                            <button onClick={() => setShowOrderModal(false)} className="hover:bg-gray-200 p-1 rounded-full"><X size={18} /></button>
                        </div>
                        <div className="max-h-80 overflow-y-auto p-2">
                            {userOrders.map(order => (
                                <button
                                    key={order.id}
                                    onClick={() => { handleSendMessage(undefined as any, undefined, order.id); setShowOrderModal(false); }}
                                    className="w-full text-left p-3 border-b last:border-0 hover:bg-orange-50 transition-colors"
                                >
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

            {/* Modal Chọn Sản phẩm - Tinh chỉnh giao diện */}
            {showProductModal && (
                <div className="absolute inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-0 shadow-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b flex justify-between items-center">
                            <h4 className="font-bold text-gray-700">Chọn sản phẩm</h4>
                            <button onClick={() => setShowProductModal(false)}><X size={18} /></button>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {shopProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => { handleSendMessage(undefined as any, product.id, undefined); setShowProductModal(false); }}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 transition-colors border-b last:border-0"
                                >
                                    <img src={product.imageUrl} className="w-12 h-12 object-cover rounded border" />
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                                        <p className="text-xs text-orange-600 font-bold">{product.price.toLocaleString()} đ</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {!isOpen && (
                <button onClick={() => setIsOpen(true)}
                        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300">
                    <MessageCircle size={28}/>
                </button>
            )}

            {isOpen && (
                <div
                    className="w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-blue-600 px-4 py-3 flex items-center justify-between text-white shadow-md z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center relative">
                                <Store size={20} className="text-blue-600"/>
                                <span
                                    className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">{shopName}</h3>
                                <p className="text-[11px] text-blue-100">Đang hoạt động</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full"><X
                            size={20}/></button>
                    </div>

                    {/* Danh sách tin nhắn */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
                        {messages.map((msg) => {
                            const isMe = msg.senderId === user.id;
                            const isRecalled = msg.recalled;

                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] px-4 py-2.5 text-sm shadow-sm relative group ${
                                        isRecalled ? 'bg-transparent border border-gray-300 text-gray-400 italic rounded-2xl'
                                            : isMe ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                                                : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                                    }`}>
                                        {isRecalled ? 'Tin nhắn đã bị thu hồi' : (
                                            <div className="flex flex-col gap-2">


                                                {msg.content && !msg.content.includes("[") && (
                                                    <span
                                                        className="whitespace-pre-wrap break-words">{msg.content}</span>
                                                )}

                                                {/* 2. Hiển thị thẻ Sản phẩm */}
                                                {msg.productId && msg.productData && renderProductCard(msg.productData)}
                                                {msg.orderId && msg.orderData && renderOrderCard(msg.orderData)}
                                                {/* 4. Hiển thị Lưới Ảnh */}
                                                {msg.imageUrls && msg.imageUrls.length > 0 && (
                                                    <div
                                                        className={`grid gap-1 ${msg.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} mt-1`}>
                                                        {msg.imageUrls.map((url, i) => (
                                                            <img key={i} src={url} alt="Ảnh chat"
                                                                 className="w-full h-auto max-h-40 object-cover rounded-md border border-gray-200/50"/>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* 5. Hiển thị Video */}
                                                {msg.videoUrl && (
                                                    <video controls className="w-full max-h-48 rounded-md bg-black">
                                                        <source src={msg.videoUrl} type="video/mp4"/>
                                                    </video>
                                                )}

                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef}/>
                    </div>

                    {/* Vùng nhập liệu */}
                    <div className="flex flex-col bg-white border-t border-gray-100 relative">

                        {/* Thanh Tiện ích Gửi Phụ (Gửi Sản Phẩm / Đơn hàng) */}
                        <div className="flex gap-4 px-4 pt-2 pb-1 border-b border-gray-50">
                            <button onClick={fetchShopProducts}
                                    className="text-[11px] font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-blue-100 transition">
                                <ShoppingBag size={12}/> Gửi Sản phẩm đang xem
                            </button>
                            <button onClick={fetchUserOrders}
                                    className="text-[11px] font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-orange-100 transition">
                                <Package size={12}/> Gửi Đơn hàng
                            </button>
                        </div>

                        {showEmojiPicker && (
                            <div className="absolute bottom-full right-0 z-50 mb-2 drop-shadow-2xl">
                                <EmojiPicker onEmojiClick={(e) => setInputText(prev => prev + e.emoji)} width={320}
                                             height={350}/>
                            </div>
                        )}

                        {/* Preview Ảnh / Video */}
                        {(previewUrls.length > 0 || selectedVideo) && (
                            <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50 border-b border-gray-100">
                                {previewUrls.map((url, i) => (
                                    <img key={i} src={url}
                                         className="w-16 h-16 object-cover rounded-lg border border-gray-200"/>
                                ))}
                                {selectedVideo && (
                                    <div
                                        className="w-16 h-16 bg-black rounded-lg flex items-center justify-center relative">
                                        <Video className="text-white opacity-50"/>
                                        <button onClick={() => setSelectedVideo(null)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                                            <X size={12}/></button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="p-3">
                            <form onSubmit={(e) => handleSendMessage(e)}
                                  className="flex items-center gap-2 bg-gray-100 rounded-full pr-1.5 pl-4 py-1.5 focus-within:ring-2 focus-within:ring-blue-100">
                                {/* Nút Chọn Ảnh & Video */}
                                <input type="file" accept="image/*" multiple className="hidden" ref={imageInputRef}
                                       onChange={handleImageSelect}/>
                                <input type="file" accept="video/*" className="hidden" ref={videoInputRef}
                                       onChange={handleVideoSelect}/>

                                <button type="button" disabled={isUploading}
                                        onClick={() => imageInputRef.current?.click()}
                                        className="text-gray-400 hover:text-blue-600"><ImageIcon size={20}/></button>
                                <button type="button" disabled={isUploading}
                                        onClick={() => videoInputRef.current?.click()}
                                        className="text-gray-400 hover:text-blue-600"><Video size={20}/></button>
                                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="text-gray-400 hover:text-blue-600"><Smile size={20}/></button>

                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onFocus={() => setShowEmojiPicker(false)}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 ml-1"
                                />

                                <button
                                    type="submit"
                                    disabled={(!inputText.trim() && !selectedFiles.length && !selectedVideo) || isUploading}
                                    className="w-9 h-9 flex flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 relative"
                                >
                                    {isUploading ? <Loader2 size={16} className="animate-spin"/> :
                                        <Send size={16} className="-ml-0.5"/>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};