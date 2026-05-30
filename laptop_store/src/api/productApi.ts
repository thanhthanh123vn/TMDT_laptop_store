import axiosClient from "./axiosClient";

export const productApi = {
    getAllProducts: (categoryId?: number) => {
        const params = categoryId ? { categoryId } : {};
        return axiosClient.get("/api/products", { params });
    },
    getProductById: (id: string | number) => {
        return axiosClient.get(`/api/products/${id}`);
    },
    searchProducts: (query: string) => {
        return axiosClient.get(`/api/products/search?query=${query}`);
    },

    getProductReviews: (productId: number | string) => {
        return axiosClient.get(`/api/products/${productId}/reviews`);
    },


    submitReview: (productId: number | string, data: { rating: number; comment: string }) => {
        return axiosClient.post(`/api/products/${productId}/reviews`, data);
    },
    checkCanReview: (productId: number | string) => {
        return axiosClient.get(`/api/products/${productId}/check-review-eligibility`);
    }
};
