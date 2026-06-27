import React, { useEffect, useState } from "react";
import { userApi } from "@/api/userApi";
import { chatApi } from "@/api/chatAPi";
import { useNavigate } from "react-router-dom";

interface ChatConversation {
    id: string;
    shopName: string;
    lastMessage: string;
    unreadCount: number;
    time: string;
}

export default function ChatPage() {
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const userRes = await userApi.getMyProfile();
                const userId = userRes.data.id;

                // Lấy danh sách Conversations từ API mới (đã cập nhật)
                const res = await chatApi.getUserConversations(userId);
                const rawConversations = res.data;

                // Map dữ liệu từ Backend sang giao diện
                // Lưu ý: Backend cần trả về danh sách Conversation có sẵn thông tin
                const chats = await Promise.all(rawConversations.map(async (conv) => {
                    const historyRes = await chatApi.getChatHistory(conv.id);
                    const messages = historyRes.data;
                    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;

                    // Tính tin nhắn chưa đọc:
                    // Tin nhắn không phải của mình gửi (senderId !== userId) VÀ isRead === false
                    const unread = messages.filter(
                        (msg: any) => msg.senderId !== userId && msg.isRead === false
                    ).length;

                    return {
                        id: conv.id,
                        shopName: conv.shopName || "Cửa hàng",
                        lastMessage: lastMsg ? lastMsg.content : "Chưa có tin nhắn",
                        unreadCount: unread,
                        time: lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString("vi-VN", {
                            hour: "2-digit", minute: "2-digit"
                        }) : ""
                    };
                }));

                // Sắp xếp: Phòng chưa đọc lên đầu
                chats.sort((a, b) => b.unreadCount - a.unreadCount);
                setConversations(chats);
            } catch (err) {
                console.error("Lỗi load tin nhắn:", err);
            }
        };
        fetchChats();
    }, []);

    // Lọc danh sách theo Tab
    const filteredConversations = activeTab === "unread"
        ? conversations.filter(c => c.unreadCount > 0)
        : conversations;

    return (
        <div className="max-w-5xl mx-auto p-5">
            <h1 className="text-xl font-bold mb-5">Tin nhắn</h1>

            {/* Tab điều hướng */}
            <div className="flex gap-6 border-b mb-5">
                <button
                    onClick={() => setActiveTab("all")}
                    className={`pb-2 text-sm font-medium ${activeTab === "all" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                >
                    Tất cả
                </button>
                <button
                    onClick={() => setActiveTab("unread")}
                    className={`pb-2 text-sm font-medium flex gap-1 ${activeTab === "unread" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
                >
                    Chưa đọc
                    {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                        <span className="bg-pink-500 text-white rounded-full text-xs px-2">
                            {conversations.filter(c => c.unreadCount > 0).length}
                        </span>
                    )}
                </button>
            </div>

            {/* Danh sách */}
            <div className="bg-white rounded-xl shadow">
                {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">Không có tin nhắn nào.</div>
                ) : (
                    filteredConversations.map((chat) => (
                        <button
                            key={chat.id}
                            onClick={() => navigate(`/chat?id=${chat.id}`)}
                            className={`w-full flex gap-3 p-4 border-b hover:bg-slate-50 transition-colors ${chat.unreadCount > 0 ? 'bg-blue-50/30' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold shrink-0">
                                {chat.shopName[0]}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`truncate pr-2 ${chat.unreadCount > 0 ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                                        {chat.shopName}
                                    </h3>
                                    <span className="text-xs text-gray-400">{chat.time}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-sm truncate pr-4 ${chat.unreadCount > 0 ? "font-semibold text-gray-800" : "text-gray-500"}`}>
                                        {chat.lastMessage}
                                    </p>
                                    {chat.unreadCount > 0 && (
                                        <span className="bg-pink-500 text-white text-[11px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}