import axiosClient from './axiosClient';

// Định nghĩa lại cấu trúc Conversation khớp với Backend
export interface Conversation {
    id: string;
    shopName: string;
    lastMessage: string;
    lastMessageTime: string;
    // Có thể thêm các trường khác nếu Backend trả về
}

export const chatApi = {

    getUserConversations: (userId: number) =>
        axiosClient.get<Conversation[]>(`/api/chat/user/${userId}/conversations`),


    getSellerConversations: (sellerUserId: number) =>
        axiosClient.get<Conversation[]>(`/api/chat/seller/${sellerUserId}`),


    getChatHistory: (conversationId: string) =>
        axiosClient.get(`/api/chat/${conversationId}`),
};