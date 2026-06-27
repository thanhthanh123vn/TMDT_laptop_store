import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Store, MoreVertical } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import axiosClient from "@/api/axiosClient.ts";
import {userApi} from "@/api/userApi.ts";


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
}
interface ChatProps {
    productId: string | number;
    shopId: string | number;
    shopName?: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}
export const ChatWithShop: React.FC<ChatProps> = ({ productId, shopId, shopName, isOpen, setIsOpen }) => {

    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        userApi.getMyProfile()
            .then((res) => setUser(res.data))
            .catch(console.error);
    }, []);
    const token = localStorage.getItem('token');





    const roomId = `room_buyer_${user?.id}_seller_${shopId}_prod_${productId}`;


    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const stompClientRef = useRef<Client | null>(null);


    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isOpen, messages]);

    useEffect(() => {

        if (isOpen && user) {

            const client = new Client({
                webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
                connectHeaders: {

                    Authorization: `Bearer ${token}`
                },
                debug: (str) => console.log(str),
                onConnect: () => {
                    console.log("Đã kết nối WebSocket Chat!");


                    client.subscribe(`/topic/chat/${roomId}`, (msg) => {
                        const incomingMsg: Message = JSON.parse(msg.body);

                        setMessages((prevMessages) => {
                            // Kiểm tra xem tin nhắn này đã tồn tại chưa
                            const exists = prevMessages.find(m => m.id === incomingMsg.id);

                            if (exists) {

                                return prevMessages.map(m => m.id === incomingMsg.id ? incomingMsg : m);
                            } else {
                                // Nếu chưa có -> Thêm tin nhắn mới vào danh sách
                                return [...prevMessages, incomingMsg];
                            }
                        });
                    });
                },
                onStompError: (frame) => {
                    console.error('Broker reported error: ' + frame.headers['message']);
                    console.error('Additional details: ' + frame.body);
                },
            });

            client.activate();
            stompClientRef.current = client;


            axiosClient.get(`/api/chat/${roomId}`).then(res => setMessages(res.data));
        }


        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [isOpen, user, roomId]);



    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputText.trim() || !stompClientRef.current?.connected || !user) {
            console.error("Thiếu thông tin kết nối hoặc user!");
            return;
        }

        const chatMessage = {
            roomId: roomId,
            senderId: user.id,

            receiverId: typeof shopId === 'string' ? parseInt(shopId) : shopId,
            senderName: user.fullName || "User",
            content: inputText.trim(),
        };

        stompClientRef.current.publish({
            destination: `/app/chat/${roomId}/send`,
            body: JSON.stringify(chatMessage)
        });

        setInputText('');
    };
    console.log(shopName)

    // ==========================================
    // XỬ LÝ THU HỒI TIN NHẮN
    // ==========================================
    const handleRecall = (messageId: number) => {
        if (stompClientRef.current?.connected && user) {
            // Bắn dữ liệu lên endpoint @MessageMapping("/chat/{roomId}/recall")
            stompClientRef.current.publish({
                destination: `/app/chat/${roomId}/recall`,
                body: JSON.stringify({ messageId: messageId, senderId: user.id })
            });
        }
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            {/* Nút Bong bóng Chat */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 relative group"
                >
                    <MessageCircle size={28} />
                </button>
            )}

            {/* Cửa sổ Chat */}
            {isOpen && (
                <div className="w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-5 fade-in duration-300">

                    <div className="bg-blue-600 px-4 py-3 flex items-center justify-between text-white shadow-md z-10">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                    <Store size={20} className="text-blue-600" />
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm leading-tight">{shopName}</h3>
                                <p className="text-[11px] text-blue-100">Đang hoạt động</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4 scroll-smooth">
                        {messages.length === 0 && (
                            <p className="text-center text-xs text-gray-400 mt-4">Bắt đầu cuộc trò chuyện với Shop</p>
                        )}

                        {messages.map((msg) => {
                            const isMe = msg.senderId === user.id;
                            // Xử lý trường isRecalled hoặc recalled từ backend
                            const isRecalled = msg.recalled || (msg as any).isRecalled;

                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`max-w-[80%] px-4 py-2.5 text-sm shadow-sm relative group ${
                                            isRecalled
                                                ? 'bg-transparent border border-gray-300 text-gray-400 italic rounded-2xl'
                                                : isMe
                                                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                                                    : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                                        }`}
                                    >
                                        {isRecalled ? 'Tin nhắn đã bị thu hồi' : msg.content}

                                        {/* Nút thu hồi (Chỉ hiện khi hover vào tin nhắn của mình, và tin đó chưa bị thu hồi) */}
                                        {isMe && !isRecalled && (
                                            <button
                                                className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Thu hồi"
                                                onClick={() => handleRecall(msg.id)} // GỌI HÀM THU HỒI
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white border-t border-gray-100">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-gray-100 rounded-full pr-1.5 pl-4 py-1.5 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="w-9 h-9 flex flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
                            >
                                <Send size={16} className="-ml-0.5" />
                            </button>
                        </form>
                    </div>

                </div>
            )}
        </div>
    );
};