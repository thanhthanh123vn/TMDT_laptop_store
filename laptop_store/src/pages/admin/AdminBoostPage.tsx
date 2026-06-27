import React, { useEffect, useState, useCallback } from 'react';
import { Zap, CheckCircle, XCircle, Clock, AlertCircle, Package, Eye, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import axiosClient, { getImageUrl } from '../../api/axiosClient';

// ─── Types ──────────────────────────────────────────────────────────────────

interface BoostProduct { id: number; name: string; imageUrl?: string; brand: string; price: number; }
interface BoostSeller  { id: number; storeName: string; }

interface BoostPackage {
    id: number;
    seller: BoostSeller;
    product: BoostProduct;
    durationMonths: number;
    amount: number;
    status: string;
    purchasedAt?: string;
    approvedAt?: string;
    expiredAt?: string;
    createdAt: string;
    transferProofUrl?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt  = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const fmtD = (d?: string) => d ? new Date(d).toLocaleString('vi-VN') : '—';
const DURATION_LABELS: Record<number, string> = { 1: '1 tháng', 3: '3 tháng', 6: '6 tháng', 12: '12 tháng' };

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const map: Record<string, { label: string; cls: string }> = {
        PENDING_PAYMENT:  { label: 'Chờ TT',        cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
        PENDING_APPROVAL: { label: 'Chờ duyệt',     cls: 'bg-blue-50 text-blue-700 border-blue-200' },
        ACTIVE:           { label: 'Hoạt động',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        EXPIRED:          { label: 'Hết hạn',        cls: 'bg-slate-100 text-slate-500 border-slate-200' },
        REJECTED:         { label: 'Từ chối',        cls: 'bg-red-50 text-red-600 border-red-200' },
        CANCELLED:        { label: 'Đã hủy',         cls: 'bg-slate-100 text-slate-500 border-slate-200' },
    };
    const s = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600 border-slate-200' };
    return (
        <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>{s.label}</span>
    );
};

// ─── Detail Modal ────────────────────────────────────────────────────────────

const DetailModal: React.FC<{
    pkg: BoostPackage | null;
    onClose: () => void;
    onApprove: (id: number) => void;
    onReject:  (id: number) => void;
}> = ({ pkg, onClose, onApprove, onReject }) => {
    if (!pkg) return null;
    return (
        <Dialog open={!!pkg} onOpenChange={() => onClose()}>
            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" /> Chi tiết gói đẩy tin #{pkg.id}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2 text-sm">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        {pkg.product.imageUrl && (
                            <img src={pkg.product.imageUrl} alt={pkg.product.name}
                                className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
                        )}
                        <div className="min-w-0">
                            <p className="font-semibold text-slate-800 line-clamp-2">{pkg.product.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{pkg.product.brand} · {fmt(pkg.product.price)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div><p className="text-xs text-slate-500">Seller</p><p className="font-medium">{pkg.seller?.storeName}</p></div>
                        <div><p className="text-xs text-slate-500">Gói</p><p className="font-medium">{DURATION_LABELS[pkg.durationMonths]}</p></div>
                        <div><p className="text-xs text-slate-500">Phí</p><p className="font-medium text-amber-600">{fmt(pkg.amount)}</p></div>
                        <div><p className="text-xs text-slate-500">Trạng thái</p><StatusBadge status={pkg.status} /></div>
                        <div><p className="text-xs text-slate-500">Thanh toán lúc</p><p className="font-medium">{fmtD(pkg.purchasedAt)}</p></div>
                        <div><p className="text-xs text-slate-500">Duyệt lúc</p><p className="font-medium">{fmtD(pkg.approvedAt)}</p></div>
                        <div className="col-span-2"><p className="text-xs text-slate-500">Hết hạn</p><p className="font-medium">{fmtD(pkg.expiredAt)}</p></div>
                    </div>

                    {/* Ảnh chuyển khoản */}
                    {pkg.transferProofUrl && (
                        <div>
                            <p className="text-xs text-slate-500 mb-1.5">Ảnh xác nhận chuyển khoản</p>
                            <a href={getImageUrl(pkg.transferProofUrl)} target="_blank" rel="noopener noreferrer">
                                <img src={getImageUrl(pkg.transferProofUrl)} alt="Chuyển khoản"
                                    className="w-full max-h-52 object-contain rounded-xl border border-slate-200 bg-slate-50 hover:opacity-90 transition-opacity cursor-zoom-in" />
                            </a>
                        </div>
                    )}

                    {pkg.status === 'PENDING_APPROVAL' && (
                        <div className="flex gap-3 pt-2">
                            <Button
                                onClick={() => { onReject(pkg.id); onClose(); }}
                                variant="outline"
                                className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                            >
                                <XCircle className="w-4 h-4 mr-2" /> Từ chối
                            </Button>
                            <Button
                                onClick={() => { onApprove(pkg.id); onClose(); }}
                                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Duyệt
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS = ['ALL', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED'] as const;
type Tab = typeof TABS[number];

export default function AdminBoostPage() {
    const [packages, setPackages] = useState<BoostPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>('PENDING_APPROVAL');
    const [detail, setDetail] = useState<BoostPackage | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/api/admin/boost/packages');
            setPackages(res.data || []);
        } catch { setPackages([]); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleApprove = async (id: number) => {
        await axiosClient.post(`/api/admin/boost/packages/${id}/approve`);
        load();
    };

    const handleReject = async (id: number) => {
        await axiosClient.post(`/api/admin/boost/packages/${id}/reject`);
        load();
    };

    const filtered = tab === 'ALL' ? packages : packages.filter(p => p.status === tab);
    const pendingCount = packages.filter(p => p.status === 'PENDING_APPROVAL').length;
    const activeCount  = packages.filter(p => p.status === 'ACTIVE').length;

    const TAB_LABELS: Record<Tab, string> = {
        ALL: 'Tất cả',
        PENDING_APPROVAL: `Chờ duyệt${pendingCount > 0 ? ` (${pendingCount})` : ''}`,
        ACTIVE: 'Đang hoạt động',
        EXPIRED: 'Hết hạn',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-amber-500" /> Quản lý gói đẩy tin
                </h2>
                <p className="text-sm text-slate-500 mt-1">Duyệt và quản lý các gói đẩy tin của seller</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng gói', value: packages.length, cls: 'text-slate-700' },
                    { label: 'Chờ duyệt', value: pendingCount, cls: 'text-blue-600' },
                    { label: 'Đang hoạt động', value: activeCount, cls: 'text-emerald-600' },
                    { label: 'Hết hạn', value: packages.filter(p => p.status === 'EXPIRED').length, cls: 'text-slate-400' },
                ].map(s => (
                    <Card key={s.label} className="rounded-2xl border-slate-200 shadow-sm">
                        <CardContent className="p-4 text-center">
                            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
                            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit flex-wrap">
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {TAB_LABELS[t]}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-2xl border animate-pulse" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Không có gói nào trong mục này</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left p-4 font-semibold text-slate-600">Sản phẩm</th>
                                <th className="text-left p-4 font-semibold text-slate-600">Seller</th>
                                <th className="text-left p-4 font-semibold text-slate-600">Gói</th>
                                <th className="text-left p-4 font-semibold text-slate-600">Phí</th>
                                <th className="text-left p-4 font-semibold text-slate-600">Ngày TT</th>
                                <th className="text-left p-4 font-semibold text-slate-600">Trạng thái</th>
                                <th className="p-4" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(pkg => (
                                <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {pkg.product.imageUrl && (
                                                <img src={pkg.product.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0" />
                                            )}
                                            <span className="line-clamp-1 font-medium text-slate-800 max-w-[160px]">{pkg.product.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600">{pkg.seller?.storeName}</td>
                                    <td className="p-4 text-slate-600">{DURATION_LABELS[pkg.durationMonths]}</td>
                                    <td className="p-4 font-medium text-amber-600">{fmt(pkg.amount)}</td>
                                    <td className="p-4 text-slate-500 text-xs">{fmtD(pkg.purchasedAt)}</td>
                                    <td className="p-4"><StatusBadge status={pkg.status} /></td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 justify-end">
                                            {pkg.status === 'PENDING_APPROVAL' && (
                                                <>
                                                    <button onClick={() => handleReject(pkg.id)}
                                                        className="w-7 h-7 rounded-lg border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                                                        title="Từ chối">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleApprove(pkg.id)}
                                                        className="w-7 h-7 rounded-lg border border-emerald-200 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                        title="Duyệt">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => setDetail(pkg)}
                                                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors">
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <DetailModal
                pkg={detail}
                onClose={() => setDetail(null)}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    );
}
