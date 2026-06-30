import axiosClient from './axiosClient';


export interface Conversation {
    id: string;
    shopName: string;
    lastMessage: string;
    lastMessageTime: string;

}

export const chatApi = {

    getUserConversations: (userId: number) =>
        axiosClient.get<Conversation[]>(`/api/chat/user/${userId}/conversations`),


    getSellerConversations: (sellerUserId: number) =>
        axiosClient.get<Conversation[]>(`/api/chat/seller/${sellerUserId}`),


    getChatHistory: (conversationId: string) =>
        axiosClient.get(`/api/chat/${conversationId}`),


};