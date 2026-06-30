import React, {useState, useEffect, useRef} from 'react';
import {Send, Store, User as UserIcon, X} from 'lucide-react';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosClient from '../../api/axiosClient';
import {userApi} from '../../api/userApi';


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
    const [user, setUser] = useState<any>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const stompClientRef = useRef<Client | null>(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        userApi.getMyProfile().then((res) => {
            setUser(res.data);
            axiosClient.get(`/api/chat/seller/${res.data.id}`).then((r) => setConversations(r.data));
        }).catch(console.error);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    // Setup WebSocket
    useEffect(() => {
        if (activeRoom && user) {
            const client = new Client({
                webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
                connectHeaders: {Authorization: `Bearer ${token}`},
                debug: () => {},
                onConnect: () => {
                    client.subscribe(`/topic/chat/${activeRoom}`, (msg) => {
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

            axiosClient.get(`/api/chat/${activeRoom}`).then((res) => setMessages(res.data));

            return () => {
                if (stompClientRef.current) stompClientRef.current.deactivate();
            };
        }
    }, [activeRoom, user]);

    // 1. GỬI TIN NHẮN (Đã sửa lỗi receiverId)
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !stompClientRef.current?.connected || !user || !activeRoom) return;

        // Tìm đúng hội thoại hiện tại
        const currentConv = conversations.find(c => c.id === activeRoom);
        if (!currentConv) return;

        const chatMessage = {
            roomId: activeRoom,
            senderId: user.id,
            receiverId: currentConv.buyer.id, // Sửa thành buyer của hội thoại hiện tại
            senderName: user.fullName || 'Shop',
            content: inputText.trim(),
        };

        stompClientRef.current.publish({
            destination: `/app/chat/${activeRoom}/send`,
            body: JSON.stringify(chatMessage),
        });
        setInputText('');
    };

    // 2. THU HỒI TIN NHẮN
    const handleRecall = (messageId: number) => {
        if (stompClientRef.current?.connected && user && activeRoom) {
            stompClientRef.current.publish({
                destination: `/app/chat/${activeRoom}/recall`,
                body: JSON.stringify({ messageId: messageId, senderId: user.id })
            });
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
            {/* Cột trái: Danh sách Chat */}
            <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
                <div className="p-4 bg-white border-b border-slate-200 font-bold text-slate-800">
                    Hộp thư Khách Hàng
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 && <p className="p-4 text-sm text-slate-500">Chưa có tin nhắn nào.</p>}
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => setActiveRoom(conv.id)}
                            className={`p-4 border-b border-slate-100 cursor-pointer transition-colors flex items-center gap-3 ${
                                activeRoom === conv.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : 'hover:bg-white'
                            }`}
                        >
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
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
            <div className="w-2/3 flex flex-col bg-slate-50 relative">
                {activeRoom ? (
                    <>
                        <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                <UserIcon size={20}/>
                            </div>
                            <h2 className="font-bold text-slate-800">
                                {conversations.find(c => c.id === activeRoom)?.buyer.fullName || "Khách hàng"}
                            </h2>
                        </div>

                        {/* Nội dung chat */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                            {messages.map((msg) => {
                                const isMe = Number(msg.senderId) === Number(user?.id);
                                const isRecalled = msg.recalled;

                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        {/* Thêm class relative và group để xử lý hover */}
                                        <div className={`max-w-[70%] px-4 py-2.5 text-sm shadow-sm relative group ${
                                            isRecalled ? 'bg-transparent border border-gray-300 text-gray-400 italic rounded-2xl'
                                                : isMe ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-sm'
                                                    : 'bg-white border border-gray-200 text-slate-800 rounded-2xl rounded-tl-sm'
                                        }`}>
                                            {isRecalled ? 'Tin nhắn đã bị thu hồi' : msg.content}

                                            {/* Nút thu hồi */}
                                            {isMe && !isRecalled && (
                                                <button
                                                    className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Thu hồi tin nhắn"
                                                    onClick={() => handleRecall(msg.id)}
                                                >
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

                        {/* Ô nhập tin nhắn */}
                        <div className="p-4 bg-white border-t border-slate-200">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-slate-100 rounded-full pr-1.5 pl-4 py-1.5 focus-within:ring-2 focus-within:ring-emerald-200">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Trả lời khách hàng..."
                                    className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
                                />
                                <button type="submit" disabled={!inputText.trim()} className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300 transition-colors">
                                    <Send size={18} className="-ml-0.5"/>
                                </button>
                            </form>
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