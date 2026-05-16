import axiosClient from "./axiosClient";

export const productApi = {
    getAllProducts: () => {
        return axiosClient.get("/api/products");
    },
    getProductById: (id: string | number) => {
        return axiosClient.get(`/api/products/${id}`);
    },
    searchProducts: (query: string) => {
        return axiosClient.get(`/api/products/search?query=${query}`);
    },
};
