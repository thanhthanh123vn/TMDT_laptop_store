import React, { useCallback, useEffect, useState } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { orderAdminService, type AdminOrder } from '../../api/adminService';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ duyệt' },
    { value: 'PROCESSING', label: 'Đang xử lý' },
    { value: 'SHIPPED', label: 'Đang giao' },
    { value: 'DELIVERED', label: 'Đã giao' },
    { value: 'CANCELLED', label: 'Đã hủy' },
];

const getStatusBadge = (status: string) => {
    switch (status.toUpperCase() as OrderStatus) {
        case 'DELIVERED': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shadow-none">Đã giao</Badge>;
        case 'PROCESSING': return <Badge className="bg-blue-100 text-blue-700 border-blue-200 shadow-none">Đang xử lý</Badge>;
        case 'SHIPPED': return <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 shadow-none">Đang giao</Badge>;
        case 'PENDING': return <Badge className="bg-amber-100 text-amber-700 border-amber-200 shadow-none">Chờ duyệt</Badge>;
        case 'CANCELLED': return <Badge className="bg-rose-100 text-rose-700 border-rose-200 shadow-none">Đã hủy</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

const fmt = (n: number) => n?.toLocaleString('vi-VN') + 'đ';
const fmtDate = (s: string) => s ? new Date(s).toLocaleDateString('vi-VN') : '—';

export const AdminOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await orderAdminService.list({
                page,
                size: 20,
                status: statusFilter === 'all' ? '' : statusFilter,
                keyword,
            });
            setOrders(data.items);
            setTotalItems(data.totalItems);
            setTotalPages(data.totalPages);
        } catch {
            setError('Không thể tải danh sách đơn hàng.');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, keyword]);

    useEffect(() => { void load(); }, [load]);
    useEffect(() => { setPage(1); }, [statusFilter, keyword]);

    const handleUpdateStatus = async (id: number, status: string) => {
        setUpdatingId(id);
        try {
            await orderAdminService.updateStatus(id, status);
            setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
        } catch {
            setError('Cập nhật trạng thái thất bại.');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Đơn hàng</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Tổng {totalItems.toLocaleString()} đơn hàng</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => void load()} className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Làm mới
                </Button>
            </div>

            {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50/50">
                    <div className="relative w-full sm:max-w-xs flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Mã ĐH, tên khách..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="pl-9 h-10 rounded-xl bg-white"
                        />
                    </div>
                    <div className="w-full sm:w-[180px]">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-10 rounded-xl bg-white">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow className="border-slate-100">
                                <TableHead className="pl-4 text-slate-500 font-medium">Mã ĐH</TableHead>
                                <TableHead className="text-slate-500 font-medium">Khách hàng</TableHead>
                                <TableHead className="text-slate-500 font-medium">Ngày đặt</TableHead>
                                <TableHead className="text-slate-500 font-medium">Trạng thái</TableHead>
                                <TableHead className="text-right text-slate-500 font-medium">Tổng tiền</TableHead>
                                <TableHead className="text-right text-slate-500 font-medium pr-4">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                        <div className="flex justify-center"><div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" /></div>
                                    </TableCell>
                                </TableRow>
                            ) : orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-slate-400">Không có đơn hàng nào.</TableCell>
                                </TableRow>
                            ) : orders.map((order) => (
                                <TableRow key={order.id} className="border-slate-100 hover:bg-slate-50/80 group">
                                    <TableCell className="font-semibold text-slate-900 pl-4">{order.code || `#${order.id}`}</TableCell>
                                    <TableCell>
                                        <p className="font-medium text-slate-900">{order.customerName}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{order.customerEmail}</p>
                                    </TableCell>
                                    <TableCell className="text-slate-600 text-sm">{fmtDate(order.createdAt)}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={order.status}
                                            onValueChange={(val) => void handleUpdateStatus(order.id, val)}
                                            disabled={updatingId === order.id}
                                        >
                                            <SelectTrigger className="h-8 w-36 text-xs border-0 shadow-none p-0 bg-transparent focus:ring-0">
                                                <SelectValue>{getStatusBadge(order.status)}</SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUS_OPTIONS.filter(o => o.value !== 'all').map((o) => (
                                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-blue-600">
                                        {fmt(order.amount)}
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                    <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="gap-1">
                        <ChevronLeft className="w-4 h-4" /> Trước
                    </Button>
                    <span className="text-sm text-slate-500">Trang {page} / {totalPages}</span>
                    <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="gap-1">
                        Tiếp <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
