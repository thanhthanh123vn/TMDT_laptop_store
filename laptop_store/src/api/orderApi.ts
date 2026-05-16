import axiosClient from './axiosClient';

export const orderApi = {
    getMyOrders: () => {
        return axiosClient.get("/api/orders/my-orders");
    },
    createOrder: (orderData: any) => {
        return axiosClient.post("/api/orders", orderData);
    }
};
