import React, { useEffect, useState, useCallback } from 'react';
import {
    Search, RefreshCw, Package, ChevronDown, X,
    Eye, MessageCircle, User, MapPin, Phone, Mail,
    ShoppingBag, AlertTriangle, CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { sellerApi } from '../../api/sellerApi';
import {useNavigate} from "react-router";

const BASE_URL = 'http://localhost:8080';
const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const fmtDate = (s: string) =>
    new Date(s).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Status config ────────────────────────────────────────────────────────────

type StatusKey = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED';

const STATUS_CONFIG: Record<StatusKey, { label: string; bg: string; text: string; dot: string }> = {
    PENDING:          { label: 'Chờ xác nhận', bg: 'bg-yellow-50',  text: 'text-yellow-700', dot: 'bg-yellow-400' },
    PROCESSING:       { label: 'Đang xử lý',   bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-500'   },
    SHIPPED:          { label: 'Đang giao',     bg: 'bg-indigo-50',  text: 'text-indigo-700', dot: 'bg-indigo-500' },
    DELIVERED:        { label: 'Đã giao',       bg: 'bg-emerald-50', text: 'text-emerald-700',dot: 'bg-emerald-500'},
    CANCELLED:        { label: 'Đã hủy',        bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-500'    },
    RETURN_REQUESTED: { label: 'Yêu cầu trả',   bg: 'bg-orange-50',  text: 'text-orange-700', dot: 'bg-orange-500' },
};

// Statuses seller CAN set (not RETURN_REQUESTED — only user can)
const SELLER_SETTABLE: StatusKey[] = ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const cfg = STATUS_CONFIG[status as StatusKey] ?? { label: status, bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border border-transparent ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderSummary {
    id: number;
    orderCode: string;
    status: string;
    totalAmount: number;
    fullName: string;
    phone: string;
    address: string;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
    itemCount: number;
}

interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    imageUrl: string;
    brand: string;
    cpu: string;
    ram: string;
    storage: string;
    quantity: number;
    price: number;
}

interface OrderDetail extends OrderSummary {
    buyerEmail: string;
    buyerPhone: string;
    buyerId: number;
    items: OrderItem[];
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

interface DetailModalProps {
    orderId: number | null;
    onClose: () => void;
    onStatusUpdated: () => void;
}

const OrderDetailModal: React.FC<DetailModalProps> = ({ orderId, onClose, onStatusUpdated }) => {
    const [detail, setDetail] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');


    useEffect(() => {
        if (!orderId) { setDetail(null); return; }
        setLoading(true);
        setError('');
        setSuccess('');
        sellerApi.getOrderDetail(orderId)
            .then(r => {
                setDetail(r.data);
                setSelectedStatus(r.data.status);
            })
            .catch(() => setError('Không thể tải chi tiết đơn hàng'))
            .finally(() => setLoading(false));
    }, [orderId]);

    const handleUpdateStatus = async () => {
        if (!detail || selectedStatus === detail.status) return;
        setUpdating(true);
        setError('');
        try {
            await sellerApi.updateOrderStatus(detail.id, selectedStatus);
            setDetail(d => d ? { ...d, status: selectedStatus } : d);
            setSuccess('Đã cập nhật trạng thái');
            onStatusUpdated();
            setTimeout(() => setSuccess(''), 3000);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Cập nhật thất bại');
        } finally {
            setUpdating(false);
        }
    };

    const isReturnRequested = detail?.status === 'RETURN_REQUESTED';
    const canUpdate = selectedStatus !== detail?.status && !isReturnRequested;

    return (
        <Dialog open={!!orderId} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
                    <DialogTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        Chi tiết đơn hàng {detail?.orderCode}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-slate-400 gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin" /> Đang tải...
                        </div>
                    ) : !detail ? null : (
                        <>
                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg">
                                    <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                                </div>
                            )}
                            {success && (
                                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2.5 rounded-lg">
                                    <CheckCircle className="w-4 h-4 shrink-0" /> {success}
                                </div>
                            )}

                            {/* Status update */}
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 mb-1.5">Trạng thái hiện tại</p>
                                    <StatusBadge status={detail.status} />
                                    {isReturnRequested && (
                                        <p className="text-xs text-orange-600 mt-1.5">Khách yêu cầu trả hàng. Chỉ có thể chấp nhận giao lại (DELIVERED) hoặc hủy (CANCELLED).</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <select
                                            value={selectedStatus}
                                            onChange={e => setSelectedStatus(e.target.value)}
                                            disabled={isReturnRequested}
                                            className="h-9 text-sm border border-slate-200 rounded-lg pl-3 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {SELLER_SETTABLE.map(s => (
                                                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleUpdateStatus}
                                        disabled={!canUpdate || updating}
                                        className="h-9 bg-emerald-600 hover:bg-emerald-700 px-4"
                                    >
                                        {updating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Cập nhật'}
                                    </Button>
                                </div>
                            </div>

                            {/* Buyer info */}
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" /> Thông tin người mua
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Họ tên" value={detail.fullName} />
                                    <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Số điện thoại" value={detail.phone || detail.buyerPhone} />
                                    <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={detail.buyerEmail} />
                                    <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Địa chỉ" value={detail.address} />
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 h-8 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                    onClick={() => {/* chat handled later */}}
                                >
                                    <MessageCircle className="w-3.5 h-3.5" /> Liên hệ người mua
                                </Button>
                            </div>

                            <div className="border-t border-slate-100" />

                            {/* Order info */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thông tin đơn hàng</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <InfoRow label="Mã đơn" value={detail.orderCode} />
                                    <InfoRow label="Ngày đặt" value={fmtDate(detail.createdAt)} />
                                    <InfoRow label="Thanh toán" value={detail.paymentMethod} />
                                    <InfoRow label="Tổng tiền" value={fmt(detail.totalAmount)} />
                                </div>
                            </div>

                            <div className="border-t border-slate-100" />

                            {/* Products */}
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sản phẩm</p>
                                <div className="space-y-2">
                                    {detail.items.map(item => {
                                        const thumb = item.imageUrl
                                            ? (item.imageUrl.startsWith('http') ? item.imageUrl : BASE_URL + item.imageUrl)
                                            : null;
                                        return (
                                            <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                                                    {thumb
                                                        ? <img src={thumb} alt={item.productName} className="w-full h-full object-cover" />
                                                        : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-slate-300" /></div>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-slate-800 truncate">{item.productName}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {[item.cpu, item.ram, item.storage].filter(Boolean).join(' · ')}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-0.5">x{item.quantity}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-semibold text-sm text-slate-800">{fmt(item.price * item.quantity)}</p>
                                                    <p className="text-xs text-slate-400">{fmt(item.price)} / cái</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

const InfoRow: React.FC<{ icon?: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-2">
        {icon && <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>}
        <div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-sm font-medium text-slate-700 break-all">{value || <span className="text-slate-400 italic text-xs">—</span>}</p>
        </div>
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const ALL_STATUSES: (StatusKey | '')[] = ['', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED'];

export const SellerOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<StatusKey | ''>('');
    const [detailId, setDetailId] = useState<number | null>(null);
    const navigate = useNavigate() ;
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await sellerApi.getOrders();
            setOrders(res.data);
        } catch {
            setError('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const filtered = orders.filter(o => {
        const matchStatus = !filterStatus || o.status === filterStatus;
        const kw = search.toLowerCase();
        const matchSearch = !kw
            || o.orderCode.toLowerCase().includes(kw)
            || o.fullName.toLowerCase().includes(kw)
            || o.phone.includes(kw);
        return matchStatus && matchSearch;
    });

    const SEL = "h-9 text-sm border border-slate-200 rounded-lg pl-3 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 appearance-none cursor-pointer";

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Quản lý đơn hàng</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {loading ? '...' : `${filtered.length} đơn hàng`}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading} className="h-9 gap-1.5">
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
                </Button>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </div>
            )}

            {/* Filters */}
            <Card className="bg-white border border-slate-200 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2.5 items-center">
                        <div className="relative flex-1 min-w-[220px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Mã đơn, tên, SĐT..."
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                        <div className="relative">
                            <select
                                className={SEL}
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value as StatusKey | '')}
                            >
                                <option value="">Tất cả trạng thái</option>
                                {(Object.keys(STATUS_CONFIG) as StatusKey[]).map(s => (
                                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                        {(search || filterStatus) && (
                            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterStatus(''); }} className="h-9 text-slate-500 gap-1.5">
                                <X className="w-3.5 h-3.5" /> Xóa bộ lọc
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-52 text-slate-400 gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" /><span className="text-sm">Đang tải...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-52 text-slate-400 gap-3">
                        <Package className="w-10 h-10 opacity-40" />
                        <p className="text-sm font-medium">Không có đơn hàng nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80">
                                    {['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Tổng tiền', 'Trạng thái', 'Ngày đặt', ''].map((h, i) => (
                                        <th key={i} className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${h === 'Tổng tiền' ? 'text-right' : h === '' ? 'text-center' : 'text-left'}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(o => (
                                    <tr key={o.id} className="hover:bg-slate-50/60 transition-colors group">
                                        <td className="px-4 py-3">
                                            <p className="font-mono text-xs font-medium text-slate-700">{o.orderCode}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-700 whitespace-nowrap">{o.fullName}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{o.phone}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-slate-500">{o.itemCount} sản phẩm</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="font-semibold text-slate-800 whitespace-nowrap">{fmt(o.totalAmount)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={o.status} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-slate-500 whitespace-nowrap">{fmtDate(o.createdAt)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => navigate(`/seller/orders/${o.id}`)}
                                                className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Eye className="w-3.5 h-3.5"/> Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <OrderDetailModal
                orderId={detailId}
                onClose={() => setDetailId(null)}
                onStatusUpdated={fetchOrders}
            />
        </div>
    );
};
