import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Search, RefreshCw, ChevronLeft, ChevronRight, Store, Clock,
    CheckCircle, XCircle, Eye, ShieldCheck, Mail, Phone, MapPin,
    CreditCard, IdCard, Lock, AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../../components/ui/dialog';
import { sellerAdminService, type AdminSeller } from '../../api/adminService';

const APPROVAL_OPTIONS = [
    { value: 'all', label: 'Tất cả duyệt' },
    { value: 'false', label: 'Chờ duyệt' },
    { value: 'true', label: 'Đã duyệt' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'ACTIVE', label: 'Đang hoạt động' },
    { value: 'REJECTED', label: 'Đã từ chối' },
    { value: 'LOCKED', label: 'Bị khóa' },
];

const fmtDate = (s: string) => (s ? new Date(s).toLocaleDateString('vi-VN') : '—');

const ApprovalBadge: React.FC<{ approved: boolean; status: string }> = ({ approved, status }) => {
    if (approved) {
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shadow-none gap-1"><CheckCircle className="w-3 h-3" /> Đã duyệt</Badge>;
    }
    if (status === 'REJECTED') {
        return <Badge className="bg-rose-100 text-rose-700 border-rose-200 shadow-none gap-1"><XCircle className="w-3 h-3" /> Từ chối</Badge>;
    }
    return <Badge className="bg-amber-100 text-amber-700 border-amber-200 shadow-none gap-1"><Clock className="w-3 h-3" /> Chờ duyệt</Badge>;
};

const EmailVerifiedBadge: React.FC<{ verified: boolean }> = ({ verified }) =>
    verified
        ? <span className="text-xs text-emerald-600 font-medium">Đã xác thực OTP</span>
        : <span className="text-xs text-amber-600 font-medium">Chưa xác thực OTP</span>;

export const AdminSellersPage: React.FC = () => {
    const [sellers, setSellers] = useState<AdminSeller[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [keyword, setKeyword] = useState('');
    const [approvedFilter, setApprovedFilter] = useState('false');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [actionId, setActionId] = useState<number | null>(null);
    const [detail, setDetail] = useState<AdminSeller | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await sellerAdminService.list({
                page,
                size: 20,
                approved: approvedFilter === 'all' ? '' : approvedFilter,
                status: statusFilter === 'all' ? '' : statusFilter,
                keyword,
            });
            setSellers(data.items);
            setTotalItems(data.totalItems);
            setTotalPages(data.totalPages);
        } catch {
            setError('Không thể tải danh sách người bán.');
        } finally {
            setLoading(false);
        }
    }, [page, approvedFilter, statusFilter, keyword]);

    useEffect(() => { void load(); }, [load]);
    useEffect(() => { setPage(1); }, [approvedFilter, statusFilter, keyword]);

    const pendingCount = useMemo(
        () => sellers.filter((s) => !s.approved && s.status !== 'REJECTED').length,
        [sellers]
    );
    const approvedCount = useMemo(
        () => sellers.filter((s) => s.approved).length,
        [sellers]
    );

    const openDetail = async (id: number) => {
        setDetailOpen(true);
        setDetailLoading(true);
        try {
            const data = await sellerAdminService.detail(id);
            setDetail(data);
        } catch {
            setError('Không thể tải chi tiết người bán.');
            setDetailOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const updateLocalSeller = (id: number, patch: Partial<AdminSeller>) => {
        setSellers((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
        if (detail?.id === id) setDetail((prev) => (prev ? { ...prev, ...patch } : prev));
    };

    const handleApprove = async (id: number) => {
        setActionId(id);
        try {
            await sellerAdminService.approve(id);
            updateLocalSeller(id, { approved: true, status: 'ACTIVE' });
        } catch {
            setError('Duyệt người bán thất bại.');
        } finally {
            setActionId(null);
        }
    };

    const handleReject = async (id: number) => {
        if (!window.confirm('Bạn có chắc muốn từ chối hồ sơ người bán này?')) return;
        setActionId(id);
        try {
            await sellerAdminService.reject(id);
            updateLocalSeller(id, { approved: false, status: 'REJECTED' });
        } catch {
            setError('Từ chối người bán thất bại.');
        } finally {
            setActionId(null);
        }
    };

    const handleLockToggle = async (seller: AdminSeller) => {
        const nextStatus = seller.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
        if (!seller.approved && nextStatus === 'ACTIVE') return;
        setActionId(seller.id);
        try {
            await sellerAdminService.updateStatus(seller.id, nextStatus);
            updateLocalSeller(seller.id, { status: nextStatus });
        } catch {
            setError('Cập nhật trạng thái thất bại.');
        } finally {
            setActionId(null);
        }
    };

    const warehouseAddress = detail
        ? [detail.warehouseStreet, detail.warehouseWard, detail.warehouseDistrict, detail.warehouseProvince]
            .filter(Boolean)
            .join(', ')
        : '';

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Quản lý Người bán</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Duyệt và quản lý tài khoản người bán trên nền tảng</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => void load()} className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Làm mới
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Tổng người bán</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{totalItems.toLocaleString('vi-VN')}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Chờ duyệt (trang này)</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Đã duyệt (trang này)</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 bg-slate-50/50">
                    <div className="relative w-full lg:max-w-xs flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Tên cửa hàng, email, SĐT, CCCD..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="pl-9 h-10 rounded-xl bg-white"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Select value={approvedFilter} onValueChange={setApprovedFilter}>
                            <SelectTrigger className="h-10 rounded-xl bg-white w-full sm:w-[160px]">
                                <SelectValue placeholder="Duyệt" />
                            </SelectTrigger>
                            <SelectContent>
                                {APPROVAL_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-10 rounded-xl bg-white w-full sm:w-[180px]">
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
                        <TableHeader>
                            <TableRow className="bg-slate-50/80">
                                <TableHead>Cửa hàng</TableHead>
                                <TableHead>Liên hệ</TableHead>
                                <TableHead>Email OTP</TableHead>
                                <TableHead>Đăng ký</TableHead>
                                <TableHead>Duyệt</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-slate-500">Đang tải...</TableCell>
                                </TableRow>
                            ) : sellers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-slate-500">Không có người bán nào.</TableCell>
                                </TableRow>
                            ) : sellers.map((seller) => (
                                <TableRow key={seller.id} className="hover:bg-slate-50/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                                                <Store className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{seller.storeName}</p>
                                                <p className="text-xs text-slate-500">{seller.fullName}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm text-slate-700">{seller.email}</p>
                                        <p className="text-xs text-slate-500">{seller.phone || '—'}</p>
                                    </TableCell>
                                    <TableCell><EmailVerifiedBadge verified={seller.emailVerified} /></TableCell>
                                    <TableCell className="text-sm text-slate-600">{fmtDate(seller.createdAt)}</TableCell>
                                    <TableCell><ApprovalBadge approved={seller.approved} status={seller.status} /></TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => void openDetail(seller.id)} title="Xem chi tiết">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            {!seller.approved && seller.status !== 'REJECTED' && seller.emailVerified && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700"
                                                        disabled={actionId === seller.id}
                                                        onClick={() => void handleApprove(seller.id)}
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5" /> Duyệt
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 gap-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                                                        disabled={actionId === seller.id}
                                                        onClick={() => void handleReject(seller.id)}
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" /> Từ chối
                                                    </Button>
                                                </>
                                            )}
                                            {seller.approved && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 gap-1"
                                                    disabled={actionId === seller.id}
                                                    onClick={() => void handleLockToggle(seller)}
                                                >
                                                    {seller.status === 'LOCKED'
                                                        ? <><ShieldCheck className="w-3.5 h-3.5" /> Mở khóa</>
                                                        : <><Lock className="w-3.5 h-3.5" /> Khóa</>}
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                    <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="gap-1">
                        <ChevronLeft className="w-4 h-4" /> Trước
                    </Button>
                    <span className="text-sm text-slate-600">Trang {page} / {totalPages}</span>
                    <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="gap-1">
                        Tiếp <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chi tiết người bán</DialogTitle>
                        <DialogDescription>Hồ sơ đăng ký và thông tin xác minh</DialogDescription>
                    </DialogHeader>

                    {detailLoading || !detail ? (
                        <p className="text-sm text-slate-500 py-6 text-center">Đang tải...</p>
                    ) : (
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <Store className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">{detail.storeName}</p>
                                    <p className="text-slate-500">{detail.fullName}</p>
                                    <div className="flex gap-2 mt-1">
                                        <ApprovalBadge approved={detail.approved} status={detail.status} />
                                        <EmailVerifiedBadge verified={detail.emailVerified} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center gap-2 text-slate-700"><Mail className="w-4 h-4 text-slate-400" /> {detail.email}</div>
                                <div className="flex items-center gap-2 text-slate-700"><Phone className="w-4 h-4 text-slate-400" /> {detail.phone || '—'}</div>
                                <div className="flex items-start gap-2 text-slate-700"><MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> {warehouseAddress || '—'}</div>
                                <div className="flex items-center gap-2 text-slate-700"><IdCard className="w-4 h-4 text-slate-400" /> CCCD: {detail.cccd || '—'}</div>
                                <div className="flex items-center gap-2 text-slate-700"><CreditCard className="w-4 h-4 text-slate-400" /> {detail.bankName} · {detail.bankAccountNumber} · {detail.bankAccountHolder}</div>
                            </div>
                        </div>
                    )}

                    {detail && !detail.approved && detail.status !== 'REJECTED' && detail.emailVerified && (
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" className="text-rose-600 border-rose-200" disabled={actionId === detail.id} onClick={() => void handleReject(detail.id)}>
                                Từ chối
                            </Button>
                            <Button className="bg-emerald-600 hover:bg-emerald-700" disabled={actionId === detail.id} onClick={() => void handleApprove(detail.id)}>
                                Duyệt tài khoản
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminSellersPage;
