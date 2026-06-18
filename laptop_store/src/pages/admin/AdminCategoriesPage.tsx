import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tag, X, Save, ImageIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import axiosClient from '../../api/axiosClient';

type Category = {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    productCount: number;
    createdAt: string;
};

const emptyForm = { name: '', description: '', imageUrl: '' };

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/api/admin/categories');
            setCategories(Array.isArray(res.data) ? res.data : []);
        } catch {
            setError('Không thể tải danh mục.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void load(); }, []);

    const openCreate = () => { setEditing(null); setForm(emptyForm); setFormError(''); setShowModal(true); };
    const openEdit = (cat: Category) => {
        setEditing(cat);
        setForm({ name: cat.name, description: cat.description || '', imageUrl: cat.imageUrl || '' });
        setFormError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) { setFormError('Tên danh mục không được để trống.'); return; }
        setSaving(true);
        setFormError('');
        try {
            if (editing) {
                await axiosClient.put(`/api/admin/categories/${editing.id}`, form);
            } else {
                await axiosClient.post('/api/admin/categories', form);
            }
            setShowModal(false);
            await load();
        } catch (err: any) {
            setFormError(err?.response?.data?.message || 'Lưu thất bại. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!window.confirm(`Xóa danh mục "${name}"?`)) return;
        try {
            await axiosClient.delete(`/api/admin/categories/${id}`);
            await load();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Xóa thất bại.');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Danh mục</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{categories.length} danh mục sản phẩm</p>
                </div>
                <Button onClick={openCreate} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Thêm danh mục
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
                    {error}
                    <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
            ) : categories.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/60 p-16 text-center shadow-sm">
                    <Tag size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">Chưa có danh mục nào</p>
                    <Button onClick={openCreate} variant="link" className="mt-2 text-blue-600">Tạo danh mục đầu tiên</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                            {cat.imageUrl ? (
                                <img src={cat.imageUrl} alt={cat.name} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                                <div className="w-full h-36 bg-slate-100 flex items-center justify-center">
                                    <ImageIcon size={32} className="text-slate-300" />
                                </div>
                            )}
                            <div className="p-4">
                                <h3 className="font-bold text-slate-900 truncate">{cat.name}</h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[2rem]">
                                    {cat.description || 'Chưa có mô tả'}
                                </p>
                                <div className="flex items-center justify-between mt-3">
                                    <Badge className="bg-blue-50 text-blue-700 border-blue-100 shadow-none text-xs">
                                        {cat.productCount ?? 0} sản phẩm
                                    </Badge>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => openEdit(cat)}>
                                            <Pencil size={14} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => void handleDelete(cat.id, cat.name)}>
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h2 className="font-bold text-slate-900">{editing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowModal(false)}>
                                <X size={18} />
                            </Button>
                        </div>

                        <div className="p-6 space-y-4">
                            {formError && <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">{formError}</div>}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên danh mục <span className="text-red-500">*</span></label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="VD: Laptop Gaming"
                                    className="rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Mô tả ngắn về danh mục..."
                                    rows={3}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">URL hình ảnh</label>
                                <Input
                                    value={form.imageUrl}
                                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                    placeholder="https://..."
                                    className="rounded-xl"
                                />
                                {form.imageUrl && (
                                    <img
                                        src={form.imageUrl}
                                        alt="preview"
                                        className="mt-2 h-24 w-full object-cover rounded-xl border border-slate-100"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
                            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowModal(false)}>Hủy</Button>
                            <Button
                                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 gap-2"
                                onClick={() => void handleSave()}
                                disabled={saving}
                            >
                                <Save size={15} />
                                {saving ? 'Đang lưu...' : 'Lưu'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
