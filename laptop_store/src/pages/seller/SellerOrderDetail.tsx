import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Package, MapPin, Phone,
    User, Printer, CheckCircle, XCircle, RefreshCw, AlertTriangle
} from 'lucide-react';

import {orderApi} from "@/api/orderApi.ts";

const BASE_URL = 'http://localhost:8080';

// ─── Types theo API mới nhất ──────────────────────────────────────────────────
interface ProductInfo {
    id: number;
    name: string;
    imageUrl: string;
    brand: string;
    cpu: string;
    ram: string;
    storage: string;
}

interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    product: ProductInfo;
}

interface OrderDetail {
    id: number;
    orderCode: string;
    status: string;
    totalAmount: number;
    fullName: string;
    phone: string;
    address: string;
    paymentMethod: string;
    paymentStatus: string | null;
    createdAt: string;
    items: OrderItem[];
}

// ─── Status config ────────────────────────────────────────────────────────────
const getStatusConfig = (status: string) => {
    switch (status) {
        case 'PENDING': return { text: 'Chờ xác nhận', color: 'text-amber-600 bg-amber-50 border-amber-200' };
        case 'PROCESSING': return { text: 'Đang xử lý', color: 'text-blue-600 bg-blue-50 border-blue-200' };
        case 'SHIPPED': return { text: 'Đang giao hàng', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
        case 'DELIVERED': return { text: 'Đã giao', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
        case 'CANCELLED': return { text: 'Đã hủy', color: 'text-red-600 bg-red-50 border-red-200' };
        case 'RETURN_REQUESTED': return { text: 'Yêu cầu trả hàng', color: 'text-orange-600 bg-orange-50 border-orange-200' };
        default: return { text: status, color: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
};

const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const fmtDate = (s: string) => new Date(s).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const SellerOrderDetail: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!orderId) return;

        const fetchOrderDetail = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await orderApi.getOrderBySellerId(Number(orderId));
                setOrder(res.data);
            } catch (err: any) {
                setError(err?.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId]);

    const handleUpdateStatus = async (newStatus: string) => {
        if (!order) return;
        setUpdating(true);
        try {
            await orderApi.updateOrderStatus(order.id, newStatus);
            setOrder({ ...order, status: newStatus });
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setUpdating(false);
        }
    };


    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 text-slate-500 gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" /> Đang tải thông tin...
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 gap-3">
                <AlertTriangle className="w-10 h-10 text-red-400" />
                <p className="text-slate-600 font-medium">{error || 'Không tìm thấy đơn hàng'}</p>
                <button onClick={() => navigate(-1)} className="text-blue-600 text-sm hover:underline">Quay lại</button>
            </div>
        );
    }

    const statusConfig = getStatusConfig(order.status);
    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        // Thêm print:bg-white để xóa nền xám khi in
        <div className="min-h-screen bg-slate-50 pb-24 md:pb-8 font-sans print:bg-white print:pb-0">

            {/* Header */}
            <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm print:shadow-none print:border-b-2 print:border-black print:mb-6 print:static">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1 hover:bg-slate-100 rounded-full transition print:hidden">
                        <ChevronLeft size={24} className="text-slate-700" />
                    </button>
                    <div>
                        <h1 className="font-bold text-slate-900 text-lg print:text-2xl">Hóa Đơn Bán Hàng</h1>
                        <p className="text-xs text-slate-500 print:text-sm print:text-black">Mã đơn: #{order.orderCode}</p>
                    </div>
                </div>
                {/* Nút in sẽ bị ẩn khi đang trong chế độ in (print:hidden) */}
                <button
                    onClick={handlePrint}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition flex items-center gap-2 text-sm font-medium print:hidden"
                >
                    <Printer size={18} /> <span className="hidden md:inline">In đơn</span>
                </button>
            </div>

            <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4 mt-2 print:p-0 print:m-0 print:max-w-full">

                {/* 1. Trạng thái đơn hàng */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between print:shadow-none print:border print:border-black print:rounded-none">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center print:hidden">
                            <Package className="text-slate-600" size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 print:text-black">Thời gian đặt</p>
                            <p className="text-sm font-bold text-slate-900">
                                {fmtDate(order.createdAt)}
                            </p>
                        </div>
                    </div>
                    {/* Giữ viền khi in để phân biệt trạng thái */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border print:border-black print:text-black print:bg-white ${statusConfig.color}`}>
                        {statusConfig.text}
                    </span>
                </div>

                {/* 2. Thông tin khách hàng */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border print:border-black print:rounded-none">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center print:bg-white print:border-black">
                        <h2 className="font-bold text-slate-800 text-sm print:text-base">Thông tin nhận hàng</h2>
                        <span className="text-xs text-slate-500 uppercase print:text-black">Thanh toán: {order.paymentMethod}</span>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                            <User size={18} className="text-slate-400 mt-0.5 shrink-0 print:text-black" />
                            <span className="text-sm font-medium text-slate-700 print:text-black">{order.fullName}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone size={18} className="text-slate-400 mt-0.5 shrink-0 print:text-black" />
                            <span className="text-sm font-medium text-slate-700 print:text-black">{order.phone}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-slate-400 mt-0.5 shrink-0 print:text-black" />
                            <span className="text-sm text-slate-600 leading-relaxed print:text-black">{order.address}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Danh sách sản phẩm */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border print:border-black print:rounded-none">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 print:bg-white print:border-black">
                        <h2 className="font-bold text-slate-800 text-sm print:text-base">Sản phẩm ({totalItems})</h2>
                    </div>
                    <div className="p-4 flex flex-col gap-4">
                        {order.items.map((item) => {
                            const product = item.product;
                            const thumb = product?.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : BASE_URL + product.imageUrl) : null;

                            return (
                                <div key={item.id} className="flex gap-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0 print:border-black">
                                    <div className="w-20 h-20 bg-slate-100 rounded-lg border border-slate-100 shrink-0 overflow-hidden print:border-black print:rounded-none">
                                        {thumb ? (
                                            <img src={thumb} alt={product?.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><Package className="text-slate-300" /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                        <p className="text-sm font-medium text-slate-800 line-clamp-2 print:text-black print:line-clamp-none">{product?.name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 truncate print:text-black print:whitespace-normal">
                                            {[product?.cpu, product?.ram, product?.storage].filter(Boolean).join(' · ')}
                                        </p>
                                        <div className="flex justify-between items-end mt-2">
                                            <span className="text-xs text-slate-500 print:text-black">Số lượng: x{item.quantity}</span>
                                            <span className="text-sm font-bold text-slate-900 print:text-black">{fmt(item.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Tổng quan thanh toán */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 print:shadow-none print:border print:border-black print:rounded-none">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm text-slate-600 print:text-black">
                            <span>Tạm tính ({totalItems} sản phẩm)</span>
                            <span>{fmt(subtotal)}</span>
                        </div>
                        {order.totalAmount > subtotal && (
                            <div className="flex justify-between text-sm text-slate-600 print:text-black">
                                <span>Phí phát sinh / Vận chuyển</span>
                                <span>{fmt(order.totalAmount - subtotal)}</span>
                            </div>
                        )}
                        <div className="border-t border-slate-100 mt-2 pt-2 flex justify-between items-center print:border-black">
                            <span className="font-bold text-slate-800 text-sm print:text-base print:text-black">Thành tiền</span>
                            <span className="font-bold text-emerald-600 text-lg print:text-xl print:text-black">{fmt(order.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Chữ ký (Chỉ hiển thị khi in) */}
                <div className="hidden print:flex justify-between mt-8 px-8">
                    <div className="text-center">
                        <p className="font-bold text-sm">Người nhận</p>
                        <p className="text-xs italic mt-1">(Ký & ghi rõ họ tên)</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-sm">Người bán</p>
                        <p className="text-xs italic mt-1">(Ký & ghi rõ họ tên)</p>
                    </div>
                </div>
            </div>

            {/* CÁC NÚT BẤM (Sẽ tự động bị ẩn khi in nhờ class print:hidden) */}
            {order.status === 'PENDING' && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:relative md:bg-transparent md:border-0 md:shadow-none md:p-4 md:max-w-3xl md:mx-auto z-50 print:hidden">
                    <div className="flex gap-3 max-w-3xl mx-auto">
                        <button
                            onClick={() => handleUpdateStatus('CANCELLED')}
                            disabled={updating}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-3 md:py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                        >
                            <XCircle size={18} /> Hủy đơn
                        </button>
                        <button
                            onClick={() => handleUpdateStatus('PROCESSING')}
                            disabled={updating}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 md:py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-md md:shadow-sm disabled:opacity-50"
                        >
                            {updating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle size={18} />}
                            {updating ? 'Đang xử lý...' : 'Xác nhận đơn'}
                        </button>
                    </div>
                </div>
            )}

            {order.status === 'PROCESSING' && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 md:relative md:bg-transparent md:border-0 md:p-4 md:max-w-3xl md:mx-auto z-50 print:hidden">
                    <button
                        onClick={() => handleUpdateStatus('SHIPPED')}
                        disabled={updating}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 md:py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-md md:shadow-sm disabled:opacity-50"
                    >
                        {updating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Package size={18} />}
                        Giao cho ĐVVC (Đã đóng gói)
                    </button>
                </div>
            )}
        </div>
    );
};