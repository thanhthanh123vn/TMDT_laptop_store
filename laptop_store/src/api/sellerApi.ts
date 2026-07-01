import axiosClient from './axiosClient';

export interface SellerProductFilters {
    name?: string;
    categoryId?: number;
    brand?: string;
    approved?: boolean;
    inStock?: boolean;
}

export const sellerApi = {
    getProfile: () => axiosClient.get('/api/seller/profile'),
    updateProfile: (data: any) => axiosClient.put('/api/seller/profile', data),
    getStats: () => axiosClient.get('/api/seller/stats'),
    getReviews: () => axiosClient.get('/api/seller/reviews'),
    getOrders: () => axiosClient.get('/api/seller/orders'),
    // Product management
    getProducts: (filters?: SellerProductFilters) =>
        axiosClient.get('/api/seller/products', { params: filters }),
    createProduct: (data: any) => axiosClient.post('/api/seller/products', data),
    updateProduct: (id: number, data: any) => axiosClient.put(`/api/seller/products/${id}`, data),
    deleteProduct: (id: number) => axiosClient.delete(`/api/seller/products/${id}`),

    // Image upload (before product is saved — temp upload)
    uploadImage: (file: File) => {
        const fd = new FormData();
        fd.append('file', file);
        return axiosClient.post<{ url: string }>('/api/seller/upload-image', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // Replace all images for an existing product
    replaceImages: (productId: number, urls: string[]) =>
        axiosClient.put(`/api/seller/products/${productId}/images`, urls),
    replyToReview: (reviewId: number, data: { replyContent: string }) => {
        return axiosClient.post(`/api/seller/reviews/${reviewId}/reply`, data);
    },
    updateRating: (rating:number)=>{
        return axiosClient.post(`/api/seller/rating/${rating}`);
    }
};
