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
    getOrderDetailById: (id: number) => {
        return axiosClient.get(`/api/orders/orderDetail/${id}`);
    },

    // Hủy đơn hàng
    cancelOrder: (id: number) => {
        return axiosClient.put(`/api/orders/${id}/cancel`);
    },

    // Thanh toán VNPay
    createVNPayPayment: (amount: number, orderInfo: string, bankCode?: string) => {

        const params: any = { amount, orderInfo };


        if (bankCode && bankCode.trim() !== '') {
            params.bankCode = bankCode;
        }

        return axiosClient.get('/api/payment/vnpay/create', { params });
    },
    // Thanh toán Credit Card
    payWithCreditCard: (cardData: any) => {
        return axiosClient.post(
            "/api/payment/credit-card",
            cardData
        );
    },
    checkCanReview: (productId: number | string) => {
        return axiosClient.get(`/products/${productId}/check-review-eligibility`);
    },
    getOrdersByShop:(shopId: number | string) => {
        return axiosClient.get(`/api/orders/user/shop/${shopId}`);
    }
};