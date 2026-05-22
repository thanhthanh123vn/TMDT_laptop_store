import axiosClient from "./axiosClient";

export const compareApi = {
    // Lấy danh sách sản phẩm để so sánh (theo IDs)
    getProductsForCompare: (productIds: number[]) => {
        return axiosClient.post("/api/products/compare", { productIds });
    },

    // Lấy sản phẩm xem gần đây
    getRecentlyViewed: (limit: number = 4) => {
        return axiosClient.get("/api/products/recently-viewed", { params: { limit } });
    },

    // Thêm vào danh sách xem gần đây
    addToRecentlyViewed: (productId: number) => {
        return axiosClient.post(`/api/products/${productId}/view`);
    },
};

