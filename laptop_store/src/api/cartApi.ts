import axiosClient from './axiosClient';

export const cartApi = {
    getCart: () => axiosClient.get('/api/cart'),

    addToCart: (productId: number | string, quantity: number = 1) =>
        axiosClient.post('/api/cart', { productId, quantity }),

    updateQuantity: (productId: number | string, quantity: number) =>
        axiosClient.put(`/api/cart/${productId}`, { quantity }),

    removeFromCart: (productId: number | string) =>
        axiosClient.delete(`/api/cart/${productId}`),

    clearCart: () => axiosClient.delete('/api/cart'),
};
