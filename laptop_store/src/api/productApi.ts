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
    getShopInfo: (shopId: number) => {
        return axiosClient.get(`/api/products/${shopId}/public`);
    },


    getProductsByShop: (shopId: number) => {
        return axiosClient.get(`/api/products/seller/${shopId}`);
    },


    submitReview: (
        productId: number | string,
        formData: FormData
    ) => {
        return axiosClient.post(
            `/api/products/${productId}/reviews`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );
    },
    checkCanReview: (productId: number | string) => {
        return axiosClient.get(`/api/products/${productId}/check-review-eligibility`);
    },
    responseCustomer(productId: number | string) {
        return axiosClient.get(`/api/orders/responseCustomer/${productId}`);
    }
};
