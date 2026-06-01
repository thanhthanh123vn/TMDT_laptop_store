import React, { useEffect, useRef, useState } from 'react';
import {
    Package, ShoppingCart, Star, TrendingUp,
    Edit2, Save, X, Camera, User,
    MapPin, CreditCard, Store, CheckCircle, Lock, Clock
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { sellerApi } from '../../api/sellerApi';
import { userApi } from '../../api/userApi';

const BASE_URL = 'http://localhost:8080';

interface Profile {
    id: number;
    storeName: string;
    rating: number;
    status: string;
    approved: boolean;
    warehouseProvince: string;
    warehouseDistrict: string;
    warehouseWard: string;
    warehouseStreet: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    fullName: string;
    email: string;
    phone: string;
    avatarUrl: string;
}

interface Stats {
    totalProducts: number;
    totalOrders: number;
    totalReviews: number;
    avgRating: number;
    totalRevenue: number;
}

const StatusBadge: React.FC<{ status: string; approved: boolean }> = ({ status, approved }) => {
    if (!approved) return (
        <span className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-300">
            <Clock className="w-4 h-4" /> Chờ duyệt
        </span>
    );
    if (status === 'ACTIVE') return (
        <span className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-200">
            <CheckCircle className="w-4 h-4" /> Đang hoạt động
        </span>
    );
    if (status === 'LOCKED') return (
        <span className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-300">
            <Lock className="w-4 h-4" /> Bị khóa
        </span>
    );
    return (
        <span className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-full bg-blue-500 text-white shadow-sm shadow-blue-200">
            {status}
        </span>
    );
};

export const SellerDashboardPage: React.FC = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<Partial<Profile>>({});
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [pRes, sRes] = await Promise.all([sellerApi.getProfile(), sellerApi.getStats()]);
            setProfile(pRes.data);
            setStats(sRes.data);
            setForm(pRes.data);
        } catch {
            setError('Không thể tải dữ liệu.');
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        try {
            const res = await userApi.uploadAvatar(file);
            const url = res.data.url;
            const fullUrl = url.startsWith('http') ? url : BASE_URL + url;
            setProfile(p => p ? { ...p, avatarUrl: fullUrl } : p);
            setForm(f => ({ ...f, avatarUrl: fullUrl }));
            setSuccess('Cập nhật ảnh thành công!');
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Không thể tải ảnh lên.');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            await sellerApi.updateProfile({
                storeName: form.storeName,
                warehouseProvince: form.warehouseProvince,
                warehouseDistrict: form.warehouseDistrict,
                warehouseWard: form.warehouseWard,
                warehouseStreet: form.warehouseStreet,
                bankName: form.bankName,
                bankAccountNumber: form.bankAccountNumber,
                bankAccountHolder: form.bankAccountHolder,
            });
            await fetchData();
            setEditing(false);
            setSuccess('Đã lưu thay đổi!');
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Lưu thất bại, vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const avatarSrc = profile?.avatarUrl
        ? (profile.avatarUrl.startsWith('http') ? profile.avatarUrl : BASE_URL + profile.avatarUrl)
        : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Tổng quan</h2>
                {profile && <StatusBadge status={profile.status} approved={profile.approved} />}
            </div>

            {/* Alerts */}
            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
                    <X className="w-4 h-4 shrink-0" /> {error}
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-xl">
                    <CheckCircle className="w-4 h-4 shrink-0" /> {success}
                </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Sản phẩm', value: stats?.totalProducts ?? '—', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Đơn hàng', value: stats?.totalOrders ?? '—', icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Đánh giá', value: stats ? `${stats.totalReviews} (${stats.avgRating.toFixed(1)}★)` : '—', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
                    {
                        label: 'Doanh thu',
                        value: stats ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(stats.totalRevenue) : '—',
                        icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50'
                    },
                ].map(s => (
                    <Card key={s.label} className="bg-white border border-slate-200 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                                <s.icon className={`w-5 h-5 ${s.color}`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500 truncate">{s.label}</p>
                                <p className="text-lg font-bold text-slate-800 leading-tight truncate">{s.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Profile card */}
            <Card className="bg-white border border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-6">
                    {/* Card header */}
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Store className="w-4 h-4 text-emerald-600" /> Hồ sơ cửa hàng
                        </h3>
                        {!editing ? (
                            <Button variant="outline" size="sm" onClick={() => { setEditing(true); setError(''); }} className="gap-1.5 h-8 text-xs">
                                <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setForm(profile || {}); setError(''); }} className="h-8 text-xs text-slate-500">
                                    <X className="w-3.5 h-3.5 mr-1" /> Hủy
                                </Button>
                                <Button size="sm" onClick={handleSave} disabled={saving} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1.5">
                                    <Save className="w-3.5 h-3.5" /> {saving ? 'Đang lưu...' : 'Lưu'}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Avatar + basic info */}
                    <div className="flex items-start gap-5">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-8 h-8 text-slate-400" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                                className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-60"
                            >
                                <Camera className="w-3.5 h-3.5" />
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                            {editing ? (
                                <Input
                                    value={form.storeName || ''}
                                    onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))}
                                    className="h-9 text-sm font-semibold"
                                    placeholder="Tên cửa hàng"
                                />
                            ) : (
                                <p className="font-semibold text-slate-800 text-base truncate">{profile?.storeName}</p>
                            )}
                            <p className="text-sm text-slate-500 truncate">{profile?.fullName} · {profile?.email}</p>
                            <p className="text-sm text-slate-500">{profile?.phone || <span className="italic text-slate-400">Chưa có SĐT</span>}</p>
                            <div className="flex items-center gap-1 text-sm text-amber-500 font-medium">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                {profile?.rating?.toFixed(1) ?? '0.0'}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* Warehouse */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> Địa chỉ kho hàng
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Tỉnh/Thành phố" value={form.warehouseProvince} editing={editing} onChange={v => setForm(f => ({ ...f, warehouseProvince: v }))} />
                            <Field label="Quận/Huyện" value={form.warehouseDistrict} editing={editing} onChange={v => setForm(f => ({ ...f, warehouseDistrict: v }))} />
                            <Field label="Phường/Xã" value={form.warehouseWard} editing={editing} onChange={v => setForm(f => ({ ...f, warehouseWard: v }))} />
                            <Field label="Số nhà, đường" value={form.warehouseStreet} editing={editing} onChange={v => setForm(f => ({ ...f, warehouseStreet: v }))} />
                        </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* Bank */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5" /> Tài khoản ngân hàng
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Field label="Ngân hàng" value={form.bankName} editing={editing} onChange={v => setForm(f => ({ ...f, bankName: v }))} />
                            <Field label="Số tài khoản" value={form.bankAccountNumber} editing={editing} onChange={v => setForm(f => ({ ...f, bankAccountNumber: v }))} />
                            <Field label="Chủ tài khoản" value={form.bankAccountHolder} editing={editing} onChange={v => setForm(f => ({ ...f, bankAccountHolder: v }))} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const Field: React.FC<{ label: string; value?: string; editing: boolean; onChange: (v: string) => void }> = ({ label, value, editing, onChange }) => (
    <div className="space-y-1">
        <p className="text-xs text-slate-400">{label}</p>
        {editing ? (
            <Input value={value || ''} onChange={e => onChange(e.target.value)} className="h-8 text-sm" />
        ) : (
            <p className="text-sm font-medium text-slate-700">{value || <span className="text-slate-400 italic text-xs">Chưa cập nhật</span>}</p>
        )}
    </div>
);
