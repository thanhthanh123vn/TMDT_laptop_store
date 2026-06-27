import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send, Store, User as UserIcon, MessageSquare } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosClient from '@/api/axiosClient.ts';
import { userApi } from '@/api/userApi.ts';

interface Message {
    id: number;
    roomId: string;
    senderId: number;
    senderName: string;
    content: string;
    timestamp: string;
    recalled: boolean;
}

export interface Conversation {
    id: string;
    buyer: {
        id: number;
        fullName: string;
    };
    seller: {
        id: number;
        storeName: string; // Tên cửa hàng
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

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const stompClientRef = useRef<Client | null>(null);
    const token = localStorage.getItem('token');

    // 1. Fetch Profile & Danh sách Conversation
    useEffect(() => {
        userApi.getMyProfile().then(async (res) => {
            const currentUser = res.data;
            setUser(currentUser);

            try {
                // Gọi API lấy danh sách hội thoại của User
                const convRes = await axiosClient.get(`/api/chat/user/${currentUser.id}/conversations`);
                let rawConversations = convRes.data;

                // Tính toán tin nhắn chưa đọc (nếu cần)
                const chatsWithUnread = await Promise.all(rawConversations.map(async (conv: Conversation) => {
                    const historyRes = await axiosClient.get(`/api/chat/${conv.id}`);
                    const historyMsgs = historyRes.data;

                    const unread = historyMsgs.filter(
                        (msg: any) => msg.senderId !== currentUser.id && msg.isRead === false
                    ).length;

                    return { ...conv, unreadCount: unread };
                }));

                // Đưa các phòng có tin nhắn chưa đọc lên đầu
                chatsWithUnread.sort((a, b) => (b.unreadCount || 0) - (a.unreadCount || 0));
                setConversations(chatsWithUnread);

            } catch (error) {
                console.error("Lỗi tải danh sách hội thoại:", error);
            }
        }).catch(console.error);
    }, []);

    // Scroll xuống cuối khi có tin nhắn mới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 2. Setup WebSocket theo activeRoomId
    useEffect(() => {
        if (activeRoomId && user) {
            const client = new Client({
                webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
                connectHeaders: { Authorization: `Bearer ${token}` },
                debug: () => {},
                onConnect: () => {
                    client.subscribe(`/topic/chat/${activeRoomId}`, (msg) => {
                        const incomingMsg: Message = JSON.parse(msg.body);
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

            // Lấy lịch sử chat
            axiosClient.get(`/api/chat/${activeRoomId}`).then((res) => setMessages(res.data));

            return () => {
                if (stompClientRef.current) stompClientRef.current.deactivate();
            };
        }
    }, [activeRoomId, user]);

    // 3. Gửi tin nhắn
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !stompClientRef.current?.connected || !user || !activeRoomId) return;

        const currentConv = conversations.find(c => c.id === activeRoomId);
        if (!currentConv) return;

        const chatMessage = {
            roomId: activeRoomId,
            senderId: user.id,
            receiverId: currentConv.seller.id, // Lấy ID của cửa hàng để làm receiver
            senderName: user.fullName || 'User',
            content: inputText.trim(),
        };

        stompClientRef.current.publish({
            destination: `/app/chat/${activeRoomId}/send`,
            body: JSON.stringify(chatMessage),
        });
        setInputText('');
    };

    return (
        <div className="max-w-6xl mx-auto p-4 py-8">
            <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">

                {/* ================= CỘT TRÁI: DANH SÁCH ================= */}
                <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
                    <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-2">
                        <MessageSquare className="text-blue-600" />
                        <h2 className="font-bold text-slate-800 text-lg">Tin nhắn</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 && <p className="p-6 text-center text-sm text-slate-400">Bạn chưa có cuộc trò chuyện nào.</p>}

                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => navigate(`/chat?id=${conv.id}`)}
                                className={`p-4 border-b border-slate-100 cursor-pointer transition-colors flex items-center gap-3 ${
                                    activeRoomId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-white'
                                }`}
                            >
                                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold shrink-0">
                                    <Store size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className={`text-sm truncate pr-2 ${activeRoomId === conv.id ? 'font-bold text-blue-800' : 'font-medium text-slate-700'}`}>
                                            {conv.seller?.storeName || 'Cửa hàng'}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-xs truncate ${conv.unreadCount && conv.unreadCount > 0 ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                                            {conv.lastMessage}
                                        </p>
                                        {/* Badge tin nhắn chưa đọc */}
                                        {conv.unreadCount && conv.unreadCount > 0 ? (
                                            <span className="bg-pink-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                                                {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= CỘT PHẢI: KHUNG CHAT ================= */}
                <div className="w-2/3 flex flex-col bg-slate-50 relative">
                    {activeRoomId ? (
                        <>
                            {/* Header chat */}
                            <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 shadow-sm z-10">
                                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
                                    <Store size={20} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-800">
                                        {conversations.find(c => c.id === activeRoomId)?.seller?.storeName || "Cửa hàng"}
                                    </h2>
                                    <span className="text-[11px] text-green-500 font-medium flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Đang hoạt động
                                    </span>
                                </div>
                            </div>

                            {/* Nội dung chat */}
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                                {messages.map((msg) => {
                                    const isMe = Number(msg.senderId) === Number(user?.id);
                                    const isRecalled = msg.recalled;
                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[70%] px-4 py-2.5 text-sm shadow-sm ${
                                                isRecalled ? 'bg-transparent border border-gray-300 text-gray-400 italic rounded-2xl'
                                                    : isMe ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                                                        : 'bg-white border border-gray-200 text-slate-800 rounded-2xl rounded-tl-sm'
                                            }`}>
                                                {isRecalled ? 'Tin nhắn đã bị thu hồi' : msg.content}
                                            </div>
                                            <span className="text-[10px] text-slate-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString('vi-VN')}</span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Ô nhập tin nhắn */}
                            <div className="p-4 bg-white border-t border-slate-200">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-slate-100 rounded-full pr-1.5 pl-4 py-1.5 focus-within:ring-2 focus-within:ring-blue-200">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Nhắn tin với cửa hàng..."
                                        className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
                                    />
                                    <button type="submit" disabled={!inputText.trim()} className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 transition-colors">
                                        <Send size={18} className="-ml-0.5" />
                                    </button>
                                </form>
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