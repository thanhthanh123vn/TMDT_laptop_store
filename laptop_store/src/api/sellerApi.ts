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

    // Order management
    getOrders: () => axiosClient.get('/api/seller/orders'),
    getOrderDetail: (id: number) => axiosClient.get(`/api/seller/orders/${id}`),
    updateOrderStatus: (id: number, status: string) =>
        axiosClient.patch(`/api/seller/orders/${id}/status`, { status }),

    // Boost packages
    getBoostPrices: () => axiosClient.get('/api/seller/boost/prices'),
    getBoostPackages: () => axiosClient.get('/api/seller/boost/packages'),
    getBoostPackageDetail: (id: number) => axiosClient.get(`/api/seller/boost/packages/${id}`),
    createBoost: (productId: number, durationMonths: number) =>
        axiosClient.post<{ packageId: number }>('/api/seller/boost/create', { productId, durationMonths }),
    submitBoostPayment: (packageId: number, file: File) => {
        const fd = new FormData();
        fd.append('file', file);
        return axiosClient.post(`/api/seller/boost/packages/${packageId}/submit-payment`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};
