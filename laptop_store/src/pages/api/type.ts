
export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export interface Order {
    id: string;
    customerName: string;
    email: string;
    date: string;
    total: number;
    status: OrderStatus;
    paymentMethod: string;
}
