import React, { useEffect, useState, useCallback } from 'react';
import {
    Zap, Clock, CheckCircle, XCircle, AlertCircle, Eye, RefreshCw,
    Package, CalendarDays, ShoppingBag
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { sellerApi } from '../../api/sellerApi';

// ─── Types ─────────────────────────────────────────────────────────────────

interface BoostProduct {
    id: number;
    name: string;
    imageUrl?: string;
    brand: string;
    price: number;
    stock: number;
}

interface BoostPackage {
    id: number;
    product: BoostProduct;
    durationMonths: number;
    amount: number;
    status: 'PENDING_PAYMENT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'EXPIRED' | 'REJECTED' | 'CANCELLED';
    purchasedAt?: string;
    approvedAt?: string;
    expiredAt?: string;
    createdAt: string;
}

type FilterTab = 'ALL' | 'ACTIVE' | 'EXPIRED';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const fmtDate = (d?: string) => d ? new Date(d).toLocaleString('vi-VN') : '—';

const DURATION_LABELS: Record<number, string> = { 1: '1 tháng', 3: '3 tháng', 6: '6 tháng', 12: '12 tháng' };

const StatusBadge: React.FC<{ status: BoostPackage['status'] }> = ({ status }) => {
    const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
        PENDING_PAYMENT:  { label: 'Chờ thanh toán', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200',  icon: <Clock className="w-3 h-3" /> },
        PENDING_APPROVAL: { label: 'Chờ duyệt',      cls: 'bg-blue-50 text-blue-700 border-blue-200',        icon: <AlertCircle className="w-3 h-3" /> },
        ACTIVE:           { label: 'Đang hoạt động',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> },
        EXPIRED:          { label: 'Hết hạn',          cls: 'bg-slate-100 text-slate-500 border-slate-200',   icon: <XCircle className="w-3 h-3" /> },
        REJECTED:         { label: 'Bị từ chối',       cls: 'bg-red-50 text-red-600 border-red-200',          icon: <XCircle className="w-3 h-3" /> },
        CANCELLED:        { label: 'Đã hủy',           cls: 'bg-slate-100 text-slate-500 border-slate-200',   icon: <XCircle className="w-3 h-3" /> },
    };
    const s = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600 border-slate-200', icon: null };
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>
            {s.icon}{s.label}
        </span>
    );
};

// ─── Detail Modal ───────────────────────────────────────────────────────────

const DetailModal: React.FC<{
    pkg: BoostPackage | null;
    onClose: () => void;
    onRenew: (pkg: BoostPackage) => void;
}> = ({ pkg, onClose, onRenew }) => {
    if (!pkg) return null;
    return (
        <Dialog open={!!pkg} onOpenChange={() => onClose()}>
            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-slate-800">
                        <Zap className="w-5 h-5 text-amber-500" /> Chi tiết gói đẩy tin
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                    {/* Product */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        {pkg.product.imageUrl && (
                            <img src={pkg.product.imageUrl} alt={pkg.product.name}
                                className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
                        )}
                        <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-sm line-clamp-2">{pkg.product.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{pkg.product.brand} · {fmt(pkg.product.price)}</p>
                        </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <InfoRow icon={<Package className="w-4 h-4 text-slate-400" />} label="Gói" value={DURATION_LABELS[pkg.durationMonths]} />
                        <InfoRow icon={<Zap className="w-4 h-4 text-amber-400" />} label="Phí" value={fmt(pkg.amount)} />
                        <InfoRow icon={<CalendarDays className="w-4 h-4 text-slate-400" />} label="Thời gian mua" value={fmtDate(pkg.purchasedAt)} />
                        <InfoRow icon={<CheckCircle className="w-4 h-4 text-emerald-500" />} label="Duyệt lúc" value={fmtDate(pkg.approvedAt)} />
                        <InfoRow icon={<Clock className="w-4 h-4 text-red-400" />} label="Hết hạn" value={fmtDate(pkg.expiredAt)} />
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-500">Trạng thái</span>
                            <StatusBadge status={pkg.status} />
                        </div>
                    </div>

                    {/* Renew button for expired */}
                    {pkg.status === 'EXPIRED' && (
                        <Button
                            onClick={() => { onClose(); onRenew(pkg); }}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Gia hạn gói đẩy tin
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500 flex items-center gap-1">{icon}{label}</span>
        <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
);

// ─── Buy Modal ──────────────────────────────────────────────────────────────

const BuyModal: React.FC<{
    open: boolean;
    onClose: () => void;
    renewProduct?: BoostProduct | null;   // nếu có => gia hạn (không chọn sản phẩm)
}> = ({ open, onClose, renewProduct }) => {
    const [products, setProducts] = useState<BoostProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<BoostProduct | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<number>(1);
    const [prices, setPrices] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const DURATIONS = [1, 3, 6, 12];

    useEffect(() => {
        if (!open) return;
        // Load prices
        sellerApi.getBoostPrices().then(r => setPrices(r.data)).catch(() => {});
        // Load products (only if not renewing)
        if (!renewProduct) {
            setLoadingProducts(true);
            sellerApi.getProducts({ inStock: true, approved: true })
                .then(r => setProducts(r.data || []))
                .catch(() => setProducts([]))
                .finally(() => setLoadingProducts(false));
        } else {
            setSelectedProduct(renewProduct);
        }
    }, [open, renewProduct]);

    const handlePay = async () => {
        const product = renewProduct || selectedProduct;
        if (!product) return;
        setLoading(true);
        try {
            const res = await sellerApi.createBoost(product.id, selectedDuration);
            window.location.href = res.data.paymentUrl;
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Lỗi tạo thanh toán');
        } finally {
            setLoading(false);
        }
    };

    const price = prices[selectedDuration] ?? 0;
    const product = renewProduct || selectedProduct;

    return (
        <Dialog open={open} onOpenChange={() => onClose()}>
            <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-slate-800">
                        <Zap className="w-5 h-5 text-amber-500" />
                        {renewProduct ? 'Gia hạn gói đẩy tin' : 'Mua gói đẩy tin mới'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 pt-2">
                    {/* Product selection */}
                    {renewProduct ? (
                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                            {renewProduct.imageUrl && (
                                <img src={renewProduct.imageUrl} alt={renewProduct.name}
                                    className="w-12 h-12 rounded-lg object-cover border border-amber-200" />
                            )}
                            <div className="min-w-0">
                                <p className="font-semibold text-slate-800 text-sm line-clamp-1">{renewProduct.name}</p>
                                <p className="text-xs text-slate-500">{renewProduct.brand}</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Chọn sản phẩm <span className="text-red-500">*</span>
                            </label>
                            {loadingProducts ? (
                                <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                            ) : products.length === 0 ? (
                                <p className="text-sm text-slate-500 p-3 bg-slate-50 rounded-lg border">
                                    Không có sản phẩm nào còn hàng và đã được duyệt.
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                    {products.map(p => (
                                        <button key={p.id}
                                            onClick={() => setSelectedProduct(p)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                                                selectedProduct?.id === p.id
                                                    ? 'border-amber-400 bg-amber-50'
                                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                        >
                                            {p.imageUrl && (
                                                <img src={p.imageUrl} alt={p.name}
                                                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-slate-800 line-clamp-1">{p.name}</p>
                                                <p className="text-xs text-slate-500">{fmt(p.price)} · Còn {p.stock} sp</p>
                                            </div>
                                            {selectedProduct?.id === p.id && (
                                                <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Duration selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn thời hạn</label>
                        <div className="grid grid-cols-2 gap-2">
                            {DURATIONS.map(d => (
                                <button key={d}
                                    onClick={() => setSelectedDuration(d)}
                                    className={`p-3 rounded-xl border text-left transition-all ${
                                        selectedDuration === d
                                            ? 'border-amber-400 bg-amber-50'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                                >
                                    <p className="font-semibold text-slate-800 text-sm">{DURATION_LABELS[d]}</p>
                                    <p className="text-xs text-amber-600 font-medium mt-0.5">
                                        {prices[d] ? fmt(prices[d]) : '...'}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    {product && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                            <span className="text-sm text-slate-600">Tổng thanh toán</span>
                            <span className="text-lg font-bold text-amber-600">{fmt(price)}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-slate-200">
                            Hủy
                        </Button>
                        <Button
                            onClick={handlePay}
                            disabled={loading || (!renewProduct && !selectedProduct)}
                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Đang xử lý...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Zap className="w-4 h-4" />Thanh toán VNPay</span>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// ─── Main Page ──────────────────────────────────────────────────────────────

export const SellerBoostPage: React.FC = () => {
    const [packages, setPackages] = useState<BoostPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
    const [detailPkg, setDetailPkg] = useState<BoostPackage | null>(null);
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [renewProduct, setRenewProduct] = useState<BoostProduct | null>(null);

    const loadPackages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await sellerApi.getBoostPackages();
            setPackages(res.data || []);
        } catch {
            setPackages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadPackages(); }, [loadPackages]);

    const handleRenew = (pkg: BoostPackage) => {
        setRenewProduct(pkg.product);
        setBuyModalOpen(true);
    };

    const handleBuyClose = () => {
        setBuyModalOpen(false);
        setRenewProduct(null);
    };

    const filtered = packages.filter(p => {
        if (filterTab === 'ACTIVE') return p.status === 'ACTIVE' || p.status === 'PENDING_APPROVAL';
        if (filterTab === 'EXPIRED') return p.status === 'EXPIRED' || p.status === 'REJECTED' || p.status === 'CANCELLED';
        return true;
    });

    const activeCount = packages.filter(p => p.status === 'ACTIVE').length;
    const pendingCount = packages.filter(p => p.status === 'PENDING_APPROVAL').length;
    const expiredCount = packages.filter(p => p.status === 'EXPIRED').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-amber-500" /> Gói đẩy tin
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Tăng hiển thị sản phẩm của bạn lên top trang sản phẩm</p>
                </div>
                <Button
                    onClick={() => { setRenewProduct(null); setBuyModalOpen(true); }}
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl gap-2"
                >
                    <Zap className="w-4 h-4" /> Mua gói mới
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
                        <p className="text-xs text-slate-500 mt-1">Đang hoạt động</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
                        <p className="text-xs text-slate-500 mt-1">Chờ duyệt</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-slate-500">{expiredCount}</p>
                        <p className="text-xs text-slate-500 mt-1">Hết hạn</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                {(['ALL', 'ACTIVE', 'EXPIRED'] as FilterTab[]).map(tab => {
                    const labels: Record<FilterTab, string> = { ALL: 'Tất cả', ACTIVE: 'Còn hạn', EXPIRED: 'Hết hạn' };
                    return (
                        <button key={tab}
                            onClick={() => setFilterTab(tab)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                filterTab === tab
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {labels[tab]}
                        </button>
                    );
                })}
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-semibold text-slate-700">Chưa có gói đẩy tin nào</p>
                    <p className="text-sm text-slate-400 mt-1">Mua gói để sản phẩm của bạn nổi bật hơn</p>
                    <Button
                        onClick={() => setBuyModalOpen(true)}
                        className="mt-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                    >
                        <Zap className="w-4 h-4 mr-2" /> Mua gói ngay
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(pkg => (
                        <div key={pkg.id}
                            className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                            {/* Product image */}
                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                                {pkg.product.imageUrl ? (
                                    <img src={pkg.product.imageUrl} alt={pkg.product.name}
                                        className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-6 h-6 text-slate-300" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-800 text-sm line-clamp-1">{pkg.product.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {DURATION_LABELS[pkg.durationMonths]} · {fmt(pkg.amount)}
                                    {pkg.expiredAt && (
                                        <> · Hết hạn: {new Date(pkg.expiredAt).toLocaleDateString('vi-VN')}</>
                                    )}
                                </p>
                            </div>

                            {/* Status */}
                            <StatusBadge status={pkg.status} />

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                {pkg.status === 'EXPIRED' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRenew(pkg)}
                                        className="rounded-lg border-amber-300 text-amber-600 hover:bg-amber-50 text-xs"
                                    >
                                        <RefreshCw className="w-3 h-3 mr-1" /> Gia hạn
                                    </Button>
                                )}
                                <button
                                    onClick={() => setDetailPkg(pkg)}
                                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <DetailModal
                pkg={detailPkg}
                onClose={() => setDetailPkg(null)}
                onRenew={handleRenew}
            />
            <BuyModal
                open={buyModalOpen}
                onClose={handleBuyClose}
                renewProduct={renewProduct}
            />
        </div>
    );
};

export default SellerBoostPage;
