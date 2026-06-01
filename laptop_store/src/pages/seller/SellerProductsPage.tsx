import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Plus, Search, Edit2, Trash2, X, Save,
    CheckCircle, Clock, Package, ChevronDown,
    AlertTriangle, RefreshCw, ImagePlus, GripVertical, Star
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle
} from '../../components/ui/alert-dialog';
import { sellerApi } from '../../api/sellerApi';
import { categoryApi, type Category } from '../../api/categoryApi';

const BASE_URL = 'http://localhost:8080';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductImage { id: number; url: string; sortOrder: number; }

interface Product {
    id: number;
    name: string;
    brand: string;
    price: number;
    oldPrice?: number;
    imageUrl?: string;
    images?: ProductImage[];
    description?: string;
    cpu?: string; gpu?: string; ram?: string;
    storage?: string; storageType?: string;
    screenSize?: string; weight?: string;
    batteryCondition?: string; condition?: string;
    categoryId?: number;
    stock: number;
    approved: boolean;
}

const EMPTY_FORM = (): Partial<Product> => ({
    name: '', brand: '', price: undefined, oldPrice: undefined,
    description: '', cpu: '', gpu: '', ram: '',
    storage: '', storageType: 'SSD', screenSize: '', weight: '',
    batteryCondition: '', condition: 'Good', categoryId: undefined, stock: 1,
});

const CONDITIONS = ['Like New', '99%', 'Good', 'Refurbished'];
const STORAGE_TYPES = ['SSD', 'HDD', 'SSD + HDD'];
const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// ─── Shared style constants (module-level, never re-created) ──────────────────

const INPUT_CLS = "w-full h-9 text-sm border border-slate-200 rounded-lg px-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-colors";
const SELECT_CLS = `${INPUT_CLS} appearance-none pr-8 cursor-pointer`;

// ─── FormField — defined at module level so it's never re-mounted ─────────────

const FormField: React.FC<{ label: string; req?: boolean; children: React.ReactNode }> =
    ({ label, req, children }) => (
        <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {label}{req && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );

// ─── Badges ───────────────────────────────────────────────────────────────────

const StockBadge: React.FC<{ stock: number }> = ({ stock }) =>
    stock > 0 ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Còn hàng ({stock})
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Hết hàng
        </span>
    );

const ApprovalBadge: React.FC<{ approved: boolean }> = ({ approved }) =>
    approved ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle className="w-3 h-3" /> Đã duyệt
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Chờ duyệt
        </span>
    );

// ─── ImageUploader ────────────────────────────────────────────────────────────

const ImageUploader: React.FC<{ images: string[]; onChange: (urls: string[]) => void }> = ({ images, onChange }) => {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const uploadFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        try {
            const newUrls: string[] = [];
            for (const file of Array.from(files)) {
                const res = await sellerApi.uploadImage(file);
                const url: string = res.data.url;
                newUrls.push(url.startsWith('http') ? url : BASE_URL + url);
            }
            onChange([...images, ...newUrls]);
        } catch { /* silent */ } finally {
            setUploading(false);
        }
    };

    const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

    const move = (idx: number, dir: -1 | 1) => {
        const next = [...images];
        [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
        onChange(next);
    };

    return (
        <div className="space-y-3">
            <div
                onClick={() => !uploading && inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files); }}
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all
                    ${dragOver ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'}
                    ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
            >
                {uploading
                    ? <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
                    : <ImagePlus className="w-6 h-6 text-slate-400" />}
                <p className="text-sm text-slate-500 text-center">
                    {uploading ? 'Đang tải lên...' : <><span className="font-medium text-emerald-600">Nhấn để chọn</span> hoặc kéo thả ảnh vào đây</>}
                </p>
                <p className="text-xs text-slate-400">PNG, JPG, WEBP · Tối đa 10MB mỗi ảnh</p>
                <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={e => uploadFiles(e.target.files)} />
            </div>

            {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                    {images.map((url, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-50">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            {idx === 0 && (
                                <div className="absolute top-1 left-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-white" /> Chính
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0}
                                    className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center text-slate-700 hover:bg-white disabled:opacity-30">
                                    <GripVertical className="w-3.5 h-3.5 rotate-90" />
                                </button>
                                <button type="button" onClick={() => remove(idx)}
                                    className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center text-white hover:bg-red-600">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                                <button type="button" onClick={() => move(idx, 1)} disabled={idx === images.length - 1}
                                    className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center text-slate-700 hover:bg-white disabled:opacity-30">
                                    <GripVertical className="w-3.5 h-3.5 -rotate-90" />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={() => inputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-slate-50 flex items-center justify-center transition-colors">
                        <Plus className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── ProductForm ──────────────────────────────────────────────────────────────

interface ProductFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initial?: Partial<Product>;
    categories: Category[];
    mode: 'create' | 'edit';
}

const TABS = [
    { key: 'basic' as const, label: 'Thông tin cơ bản' },
    { key: 'specs' as const, label: 'Thông số kỹ thuật' },
    { key: 'images' as const, label: 'Hình ảnh' },
];

const ProductForm: React.FC<ProductFormProps> = ({ open, onClose, onSave, initial, categories, mode }) => {
    const [form, setForm] = useState<Partial<Product>>(EMPTY_FORM());
    const [images, setImages] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [tab, setTab] = useState<'basic' | 'specs' | 'images'>('basic');

    useEffect(() => {
        if (open) {
            setForm(initial ? { ...initial } : EMPTY_FORM());
            setImages(initial?.images?.map(i => i.url) ?? (initial?.imageUrl ? [initial.imageUrl] : []));
            setError('');
            setTab('basic');
        }
    }, [open, initial]);

    const set = (key: keyof Product, val: any) => setForm(f => ({ ...f, [key]: val }));

    const handleSave = async () => {
        if (!form.name?.trim()) { setError('Tên sản phẩm không được để trống.'); return; }
        if (!form.brand?.trim()) { setError('Thương hiệu không được để trống.'); return; }
        if (!form.price || Number(form.price) <= 0) { setError('Giá bán phải lớn hơn 0.'); return; }
        if (!form.stock || Number(form.stock) <= 0) { setError('Số lượng phải lớn hơn 0.'); return; }
        if (!form.categoryId) { setError('Vui lòng chọn danh mục.'); return; }
        if (images.length === 0) { setError('Vui lòng thêm ít nhất 1 ảnh sản phẩm.'); setTab('images'); return; }
        setSaving(true);
        setError('');
        try {
            await onSave({ ...form, imageUrls: images });
            onClose();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Lưu thất bại, vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const imageTabLabel = `Hình ảnh${images.length > 0 ? ` (${images.length})` : ''}`;

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden max-h-[92vh] flex flex-col">
                {/* Header */}
                <DialogHeader className="px-6 pt-5 pb-0 shrink-0">
                    <DialogTitle className="text-base font-semibold text-slate-800">
                        {mode === 'create' ? '✦ Đăng sản phẩm mới' : '✎ Chỉnh sửa sản phẩm'}
                    </DialogTitle>
                </DialogHeader>

                {/* Tabs */}
                <div className="flex px-6 mt-4 border-b border-slate-100 shrink-0">
                    {TABS.map(t => (
                        <button key={t.key} type="button" onClick={() => setTab(t.key)}
                            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
                                ${tab === t.key ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                            {t.key === 'images' ? imageTabLabel : t.label}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-6 mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg shrink-0">
                        <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">

                    {/* Tab: Basic */}
                    {tab === 'basic' && (
                        <div className="space-y-4">
                            <FormField label="Tên sản phẩm" req>
                                <input className={INPUT_CLS} value={form.name ?? ''} onChange={e => set('name', e.target.value)} placeholder="VD: MacBook Pro 14 M3 Pro 18GB 512GB" />
                            </FormField>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Thương hiệu" req>
                                    <input className={INPUT_CLS} value={form.brand ?? ''} onChange={e => set('brand', e.target.value)} placeholder="VD: Apple" />
                                </FormField>
                                <FormField label="Danh mục" req>
                                    <div className="relative">
                                        <select className={SELECT_CLS} value={form.categoryId ?? ''} onChange={e => set('categoryId', e.target.value ? Number(e.target.value) : undefined)}>
                                            <option value="">-- Chọn danh mục --</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    </div>
                                </FormField>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <FormField label="Giá bán (VNĐ)" req>
                                    <input className={INPUT_CLS} type="number" value={form.price ?? ''} onChange={e => set('price', e.target.value)} placeholder="0" />
                                </FormField>
                                <FormField label="Giá gốc (VNĐ)">
                                    <input className={INPUT_CLS} type="number" value={form.oldPrice ?? ''} onChange={e => set('oldPrice', e.target.value)} placeholder="0" />
                                </FormField>
                                <FormField label="Số lượng" req>
                                    <input className={INPUT_CLS} type="number" min={1} value={form.stock ?? ''} onChange={e => set('stock', e.target.value)} placeholder="1" />
                                </FormField>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Tình trạng máy">
                                    <div className="relative">
                                        <select className={SELECT_CLS} value={form.condition ?? 'Good'} onChange={e => set('condition', e.target.value)}>
                                            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    </div>
                                </FormField>
                                <FormField label="Tình trạng pin">
                                    <input className={INPUT_CLS} value={form.batteryCondition ?? ''} onChange={e => set('batteryCondition', e.target.value)} placeholder="VD: 95%" />
                                </FormField>
                            </div>

                            <FormField label="Mô tả sản phẩm">
                                <textarea
                                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 resize-none transition-colors"
                                    rows={4}
                                    value={form.description ?? ''}
                                    onChange={e => set('description', e.target.value)}
                                    placeholder="Mô tả chi tiết về tình trạng, phụ kiện đi kèm, lý do bán..."
                                />
                            </FormField>
                        </div>
                    )}

                    {/* Tab: Specs */}
                    {tab === 'specs' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="CPU">
                                    <input className={INPUT_CLS} value={form.cpu ?? ''} onChange={e => set('cpu', e.target.value)} placeholder="VD: Apple M3 Pro 11-core" />
                                </FormField>
                                <FormField label="GPU">
                                    <input className={INPUT_CLS} value={form.gpu ?? ''} onChange={e => set('gpu', e.target.value)} placeholder="VD: 14-core GPU" />
                                </FormField>
                                <FormField label="RAM">
                                    <input className={INPUT_CLS} value={form.ram ?? ''} onChange={e => set('ram', e.target.value)} placeholder="VD: 18GB" />
                                </FormField>
                                <FormField label="Bộ nhớ">
                                    <input className={INPUT_CLS} value={form.storage ?? ''} onChange={e => set('storage', e.target.value)} placeholder="VD: 512GB" />
                                </FormField>
                                <FormField label="Loại ổ cứng">
                                    <div className="relative">
                                        <select className={SELECT_CLS} value={form.storageType ?? 'SSD'} onChange={e => set('storageType', e.target.value)}>
                                            {STORAGE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    </div>
                                </FormField>
                                <FormField label="Kích thước màn hình">
                                    <input className={INPUT_CLS} value={form.screenSize ?? ''} onChange={e => set('screenSize', e.target.value)} placeholder='VD: 14.2"' />
                                </FormField>
                                <FormField label="Trọng lượng">
                                    <input className={INPUT_CLS} value={form.weight ?? ''} onChange={e => set('weight', e.target.value)} placeholder="VD: 1.61 kg" />
                                </FormField>
                            </div>

                            {(form.cpu || form.ram || form.storage) && (
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Xem trước thông số</p>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                                        {([
                                            ['CPU', form.cpu], ['GPU', form.gpu],
                                            ['RAM', form.ram], ['Bộ nhớ', form.storage ? `${form.storage} ${form.storageType ?? ''}` : ''],
                                            ['Màn hình', form.screenSize], ['Trọng lượng', form.weight],
                                        ] as [string, string | undefined][]).filter(([, v]) => v).map(([k, v]) => (
                                            <div key={k} className="flex items-center gap-2">
                                                <span className="text-xs text-slate-400 w-20 shrink-0">{k}</span>
                                                <span className="text-xs font-medium text-slate-700">{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Images */}
                    {tab === 'images' && (
                        <div className="space-y-3">
                            <p className="text-xs text-slate-500">Ảnh đầu tiên sẽ là ảnh đại diện. Dùng nút mũi tên để sắp xếp thứ tự.</p>
                            <ImageUploader images={images} onChange={setImages} />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                        {images.length > 0 && (
                            <span className="flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {images.length} ảnh đã thêm
                            </span>
                        )}
                        {mode === 'create' && (
                            <span className="text-amber-600 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Cần admin duyệt trước khi hiển thị
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-9 text-slate-500">Hủy</Button>
                        <Button size="sm" onClick={handleSave} disabled={saving}
                            className="h-9 bg-emerald-600 hover:bg-emerald-700 gap-1.5 px-5">
                            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            {saving ? 'Đang lưu...' : mode === 'create' ? 'Đăng sản phẩm' : 'Lưu thay đổi'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const SellerProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState<number | ''>('');
    const [filterBrand, setFilterBrand] = useState('');
    const [filterApproved, setFilterApproved] = useState<boolean | ''>('');
    const [filterStock, setFilterStock] = useState<boolean | ''>('');

    const [createOpen, setCreateOpen] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

    const fetchProducts = useCallback(async (nameQuery?: string) => {
        setLoading(true);
        setError('');
        try {
            const params: any = {};
            if (nameQuery) params.name = nameQuery;
            if (filterCategory !== '') params.categoryId = filterCategory;
            if (filterBrand !== '') params.brand = filterBrand;
            if (filterApproved !== '') params.approved = filterApproved;
            if (filterStock !== '') params.inStock = filterStock;
            const res = await sellerApi.getProducts(params);
            setProducts(res.data);
        } catch {
            setError('Không thể tải danh sách sản phẩm.');
        } finally {
            setLoading(false);
        }
    }, [filterCategory, filterBrand, filterApproved, filterStock]);

    useEffect(() => {
        categoryApi.getAllCategories().then(r => setCategories(r.data)).catch(() => {});
    }, []);

    useEffect(() => { fetchProducts(search); }, [filterCategory, filterBrand, filterApproved, filterStock]);

    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => fetchProducts(val), 350);
    };

    const handleCreate = async (data: any) => { await sellerApi.createProduct(data); fetchProducts(search); };
    const handleEdit = async (data: any) => { if (!editProduct) return; await sellerApi.updateProduct(editProduct.id, data); fetchProducts(search); };
    const handleDelete = async () => { if (deleteId == null) return; await sellerApi.deleteProduct(deleteId); setDeleteId(null); fetchProducts(search); };

    const getCategoryName = (id?: number) => categories.find(c => c.id === id)?.name ?? '—';
    const hasFilters = filterCategory !== '' || filterBrand !== '' || filterApproved !== '' || filterStock !== '' || search !== '';

    const SEL = "h-9 text-sm border border-slate-200 rounded-lg pl-3 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 appearance-none cursor-pointer";

    const filterDefs = [
        { value: String(filterCategory), onChange: (v: string) => setFilterCategory(v === '' ? '' : Number(v)), options: [{ value: '', label: 'Tất cả danh mục' }, ...categories.map(c => ({ value: String(c.id), label: c.name }))] },
        { value: filterBrand, onChange: (v: string) => setFilterBrand(v), options: [{ value: '', label: 'Tất cả thương hiệu' }, ...brands.map(b => ({ value: b, label: b }))] },
        { value: filterStock === '' ? '' : String(filterStock), onChange: (v: string) => setFilterStock(v === '' ? '' : v === 'true'), options: [{ value: '', label: 'Tất cả tồn kho' }, { value: 'true', label: 'Còn hàng' }, { value: 'false', label: 'Hết hàng' }] },
        { value: filterApproved === '' ? '' : String(filterApproved), onChange: (v: string) => setFilterApproved(v === '' ? '' : v === 'true'), options: [{ value: '', label: 'Tất cả trạng thái' }, { value: 'true', label: 'Đã duyệt' }, { value: 'false', label: 'Chờ duyệt' }] },
    ];

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Quản lý sản phẩm</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{loading ? '...' : `${products.length} sản phẩm`}</p>
                </div>
                <Button size="sm" onClick={() => setCreateOpen(true)} className="h-9 bg-emerald-600 hover:bg-emerald-700 gap-1.5 shadow-sm">
                    <Plus className="w-4 h-4" /> Đăng sản phẩm
                </Button>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                    <button onClick={() => fetchProducts(search)} className="ml-auto"><RefreshCw className="w-3.5 h-3.5" /></button>
                </div>
            )}

            {/* Filters */}
            <Card className="bg-white border border-slate-200 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2.5 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input value={search} onChange={e => handleSearchChange(e.target.value)} placeholder="Tìm theo tên sản phẩm..." className="pl-9 h-9 text-sm" />
                        </div>
                        {filterDefs.map((f, i) => (
                            <div key={i} className="relative">
                                <select className={SEL} value={f.value} onChange={e => f.onChange(e.target.value)}>
                                    {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            </div>
                        ))}
                        {hasFilters && (
                            <Button variant="ghost" size="sm" onClick={() => { setFilterCategory(''); setFilterBrand(''); setFilterApproved(''); setFilterStock(''); setSearch(''); }} className="h-9 text-slate-500 gap-1.5">
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
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-52 text-slate-400 gap-3">
                        <Package className="w-10 h-10 opacity-40" />
                        <p className="text-sm font-medium">Không có sản phẩm nào</p>
                        {hasFilters && <button onClick={() => { setFilterCategory(''); setFilterBrand(''); setFilterApproved(''); setFilterStock(''); setSearch(''); }} className="text-xs text-emerald-600 hover:underline">Xóa bộ lọc</button>}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80">
                                    {['Sản phẩm', 'Danh mục', 'Giá', 'Tồn kho', 'Duyệt', ''].map((h, i) => (
                                        <th key={i} className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === 'Giá' ? 'text-right' : h === '' ? 'text-center' : 'text-left'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {products.map(p => {
                                    const thumb = p.images?.[0]?.url ?? p.imageUrl;
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                        {thumb ? <img src={thumb} alt={p.name} className="w-full h-full object-cover" />
                                                            : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-slate-300" /></div>}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-slate-800 truncate max-w-[200px]">{p.name}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">{p.brand}{p.condition && ` · ${p.condition}`}{p.images && p.images.length > 1 && <span className="ml-1.5 text-slate-300">· {p.images.length} ảnh</span>}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500">{getCategoryName(p.categoryId)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <p className="font-semibold text-slate-800">{fmt(p.price)}</p>
                                                {p.oldPrice && <p className="text-xs text-slate-400 line-through">{fmt(p.oldPrice)}</p>}
                                            </td>
                                            <td className="px-4 py-3"><StockBadge stock={p.stock} /></td>
                                            <td className="px-4 py-3"><ApprovalBadge approved={p.approved} /></td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setEditProduct(p)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Chỉnh sửa">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => setDeleteId(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Xóa">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <ProductForm open={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} categories={categories} mode="create" />
            <ProductForm open={!!editProduct} onClose={() => setEditProduct(null)} onSave={handleEdit} initial={editProduct ?? undefined} categories={categories} mode="edit" />

            <AlertDialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
                        <AlertDialogDescription>Sản phẩm sẽ bị ẩn khỏi cửa hàng. Hành động này có thể được khôi phục bởi admin.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Xóa</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
