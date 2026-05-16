import axiosClient from './axiosClient';

export const wishlistApi = {
    getMyWishlist: () => {
        return axiosClient.get('/api/wishlists');
    },
    toggleWishlist: (productId: number) => {
        return axiosClient.post(`/api/wishlists/${productId}`);
    }
};
