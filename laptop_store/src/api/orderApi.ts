import axiosClient from './axiosClient';

export interface OrderItem {
    productId: number;
    quantity: number;
    price: number;
}

export interface CreateOrderPayload {
    addressId: number;
    shippingMethod: string;
    paymentMethod: string;
    totalAmount: number;
    items: OrderItem[];
}

export const orderApi = {

    // Lấy danh sách đơn hàng của user
    getMyOrders: () => {
        return axiosClient.get("/api/orders/my-orders");
    },

    // Tạo đơn hàng
    createOrder: (orderData: CreateOrderPayload) => {
        return axiosClient.post("/api/orders", orderData);
    },

    // Lấy chi tiết đơn hàng theo id
    getOrderById: (id: number) => {
        return axiosClient.get(`/api/orders/${id}`);
    },

    // Hủy đơn hàng
    cancelOrder: (id: number) => {
        return axiosClient.put(`/api/orders/${id}/cancel`);
    },

    // Thanh toán VNPay
    createVNPayPayment: (amount: number, orderInfo: string) => {
        return axiosClient.get(
            `/api/payment/vnpay/create?amount=${amount}&orderInfo=${orderInfo}`
        );
    },

    // Thanh toán Credit Card
    payWithCreditCard: (cardData: any) => {
        return axiosClient.post(
            "/api/payment/credit-card",
            cardData
        );
    }
};