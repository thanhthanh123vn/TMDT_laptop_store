import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Save, ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { productAdminService } from '../../api/adminService';
import axiosClient from '../../api/axiosClient';

type Category = { id: number; name: string };

type FormData = {
    name: string;
    brand: string;
    price: number;
    oldPrice: number;
    imageUrl: string;
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
    storageType: string;
    screenSize: string;
    condition: string;
    description: string;
    isBestSeller: boolean;
    isHot: boolean;
    isSale: boolean;
    categoryId: string;
    stock: number;
};

const defaultForm: FormData = {
    name: '', brand: '', price: 0, oldPrice: 0, imageUrl: '',
    cpu: '', gpu: '', ram: '', storage: '', storageType: 'SSD',
    screenSize: '', condition: 'Like New', description: '',
    isBestSeller: false, isHot: false, isSale: false,
    categoryId: '', stock: 0,
};

export const AdminProductFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState<FormData>(defaultForm);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Load categories
    useEffect(() => {
        axiosClient.get('/api/admin/categories')
            .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
            .catch(console.error);
    }, []);

    // Load product nếu edit mode
    useEffect(() => {
        if (!isEditMode || !id) return;
        setLoading(true);
        productAdminService.detail(Number(id))
            .then((data: any) => {
                setFormData({
                    name: data.name || '',
                    brand: data.brand || '',
                    price: data.price || 0,
                    oldPrice: data.oldPrice || data.old_price || 0,
                    imageUrl: data.imageUrl || data.image_url || '',
                    cpu: data.cpu || '',
                    gpu: data.gpu || '',
                    ram: data.ram || '',
                    storage: data.storage || '',
                    storageType: data.storageType || 'SSD',
                    screenSize: data.screenSize || '',
                    condition: data.condition || 'Like New',
                    description: data.description || '',
                    isBestSeller: data.isBestSeller || false,
                    isHot: data.isHot || false,
                    isSale: data.isSale || false,
                    categoryId: data.categoryId ? String(data.categoryId) : '',
                    stock: data.stock || 0,
                });
            })
            .catch(() => setError('Không thể tải thông tin sản phẩm.'))
            .finally(() => setLoading(false));
    }, [id, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleSelectChange = (name: string, value: string) =>
        setFormData((prev) => ({ ...prev, [name]: value }));

    const handleCheckedChange = (name: string, checked: boolean) =>
        setFormData((prev) => ({ ...prev, [name]: checked }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) { setError('Tên sản phẩm không được để trống.'); return; }
        if (!formData.price || formData.price <= 0) { setError('Giá bán phải lớn hơn 0.'); return; }

        setSaving(true);
        setError('');

        const payload = {
            name: formData.name,
            brand: formData.brand,
            price: formData.price,
            oldPrice: formData.oldPrice,
            imageUrl: formData.imageUrl,
            cpu: formData.cpu,
            gpu: formData.gpu,
            ram: formData.ram,
            storage: formData.storage,
            storageType: formData.storageType,
            screenSize: formData.screenSize,
            condition: formData.condition,
            description: formData.description,
            isBestSeller: formData.isBestSeller,
            isHot: formData.isHot,
            isSale: formData.isSale,
            category: formData.categoryId,
            stock: formData.stock,
        };

        try {
            if (isEditMode && id) {
                await productAdminService.update(Number(id), payload as any);
            } else {
                await productAdminService.create(payload as any);
            }
            navigate('/admin/products');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Lưu thất bại. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <form onSubmit={(e) => void handleSubmit(e)}
            className="relative pb-24 md:pb-10 max-w-5xl mx-auto space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex items-center gap-3 md:gap-4 mb-2">
                <Button type="button" variant="ghost" size="icon" onClick={() => navigate('/admin/products')}
                    className="rounded-full bg-white shadow-sm border border-slate-200">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </Button>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                        {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {isEditMode ? `Đang chỉnh sửa sản phẩm #${id}` : 'Điền thông tin để thêm sản phẩm mới'}
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-100">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-semibold text-slate-800">Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium">Tên sản phẩm <span className="text-red-500">*</span></Label>
                                <Input required name="name" value={formData.name} onChange={handleChange}
                                    placeholder="VD: Dell XPS 15 9530" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Hãng sản xuất</Label>
                                    <Select value={formData.brand} onValueChange={(val) => handleSelectChange('brand', val)}>
                                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Chọn hãng" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['Dell', 'HP', 'Asus', 'Lenovo', 'Apple', 'Acer', 'MSI', 'Samsung', 'LG', 'Razer'].map((b) => (
                                                <SelectItem key={b} value={b}>{b}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Danh mục</Label>
                                    <Select value={formData.categoryId} onValueChange={(val) => handleSelectChange('categoryId', val)}>
                                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Tình trạng</Label>
                                    <Select value={formData.condition} onValueChange={(val) => handleSelectChange('condition', val)}>
                                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Tình trạng" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['Like New', '99%', '98%', 'Good', 'Refurbished', 'New'].map((c) => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Tồn kho</Label>
                                    <Input type="number" name="stock" value={formData.stock} onChange={handleChange}
                                        min={0} className="h-11 rounded-xl bg-slate-50" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Giá bán (đ) <span className="text-red-500">*</span></Label>
                                    <Input required type="number" name="price" value={formData.price || ''}
                                        onChange={handleChange} min={0}
                                        className="h-11 rounded-xl bg-slate-50 font-semibold text-blue-700" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Giá gốc (đ)</Label>
                                    <Input type="number" name="oldPrice" value={formData.oldPrice || ''}
                                        onChange={handleChange} min={0} className="h-11 rounded-xl bg-slate-50" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium">Mô tả chi tiết</Label>
                                <Textarea name="description" value={formData.description} onChange={handleChange}
                                    rows={5} placeholder="Mô tả chi tiết về sản phẩm..."
                                    className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white resize-none" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-semibold text-slate-800">Thông số kỹ thuật</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6">
                            <div className="space-y-2">
                                <Label>CPU</Label>
                                <Input name="cpu" value={formData.cpu} onChange={handleChange}
                                    placeholder="VD: Intel Core i7-13700H" className="h-11 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label>GPU</Label>
                                <Input name="gpu" value={formData.gpu} onChange={handleChange}
                                    placeholder="VD: NVIDIA RTX 4060" className="h-11 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label>RAM</Label>
                                <Select value={formData.ram} onValueChange={(val) => handleSelectChange('ram', val)}>
                                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Chọn RAM" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['4GB', '8GB', '16GB', '32GB', '64GB'].map((r) => (
                                            <SelectItem key={r} value={r}>{r}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Loại ổ cứng</Label>
                                <Select value={formData.storageType} onValueChange={(val) => handleSelectChange('storageType', val)}>
                                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="Loại ổ cứng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['SSD', 'HDD', 'SSD + HDD'].map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Dung lượng ổ cứng</Label>
                                <Input name="storage" value={formData.storage} onChange={handleChange}
                                    placeholder="VD: 512GB" className="h-11 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label>Màn hình</Label>
                                <Input name="screenSize" value={formData.screenSize} onChange={handleChange}
                                    placeholder="VD: 15.6 inch FHD" className="h-11 rounded-xl" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right - Image & Status */}
                <div className="space-y-6">
                    <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-semibold text-slate-800">Hình ảnh</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="w-full aspect-square bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden relative group">
                                {formData.imageUrl ? (
                                    <>
                                        <img src={formData.imageUrl} alt="Preview"
                                            className="w-full h-full object-contain p-4"
                                            onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <span className="text-white text-sm font-medium">Đổi ảnh</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-slate-400 flex flex-col items-center">
                                        <ImagePlus className="w-10 h-10 mb-2 opacity-50" />
                                        <span className="text-sm font-medium">Chưa có ảnh</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">URL Hình ảnh</Label>
                                <Input name="imageUrl" value={formData.imageUrl} onChange={handleChange}
                                    placeholder="https://..." className="h-11 rounded-xl bg-slate-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200/60 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-semibold text-slate-800">Huy hiệu</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-6">
                            {[
                                { key: 'isBestSeller', label: 'Best Seller (Bán chạy)' },
                                { key: 'isHot', label: 'Hot Deal 🔥' },
                                { key: 'isSale', label: 'Đang Sale (Giảm giá)' },
                            ].map(({ key, label }) => (
                                <div key={key} className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                    <Checkbox
                                        id={key}
                                        checked={formData[key as keyof FormData] as boolean}
                                        onCheckedChange={(c) => handleCheckedChange(key, c as boolean)}
                                        className="w-5 h-5 rounded-md"
                                    />
                                    <Label htmlFor={key} className="cursor-pointer flex-1 font-medium text-slate-700">{label}</Label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="hidden lg:block">
                        <Button type="submit" disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl text-base shadow-lg gap-2">
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {saving ? 'Đang lưu...' : isEditMode ? 'Lưu cập nhật' : 'Thêm sản phẩm'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Submit */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-50">
                <Button type="submit" disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl text-base font-semibold gap-2">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Đang lưu...' : isEditMode ? 'Lưu cập nhật' : 'Thêm sản phẩm'}
                </Button>
            </div>
        </form>
    );
};
