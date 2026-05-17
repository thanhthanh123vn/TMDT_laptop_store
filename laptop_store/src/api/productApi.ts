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
};
