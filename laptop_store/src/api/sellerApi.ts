import axiosClient from './axiosClient';

export const sellerApi = {
    getProfile: () => axiosClient.get('/api/seller/profile'),
    updateProfile: (data: any) => axiosClient.put('/api/seller/profile', data),
    getStats: () => axiosClient.get('/api/seller/stats'),
    getReviews: () => axiosClient.get('/api/seller/reviews'),
};
