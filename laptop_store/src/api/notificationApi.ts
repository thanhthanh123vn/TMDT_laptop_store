import axiosClient from './axiosClient';

export const notificationApi = {
    getMyNotifications: () => {
        return axiosClient.get('/api/notifications');
    },
    markAsRead: (id: number) => {
        return axiosClient.put(`/api/notifications/${id}/read`);
    },
    markAllAsRead: () => {
        return axiosClient.put('/api/notifications/read-all');
    }
};
