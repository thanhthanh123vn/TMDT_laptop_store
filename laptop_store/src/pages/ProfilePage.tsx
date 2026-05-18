"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { userApi } from "../api/userApi"
import {
    LayoutGrid,
    UserCog,
    KeyRound,
    MapPin,
    Bell,
    Package,
    Heart,
    User,
    Camera,
    CheckCircle2,
    ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const sidebarItems = [
    { icon: LayoutGrid, label: "Tổng quan", href: "/account" },
    { icon: UserCog, label: "Chỉnh sửa hồ sơ", href: "/account/profile", active: true },
    { icon: KeyRound, label: "Đổi mật khẩu", href: "/account/password" },
    { icon: MapPin, label: "Địa chỉ", href: "/account/address" },
    { icon: Bell, label: "Thông báo", href: "/account/notifications" },
    { icon: Package, label: "Lịch sử đơn hàng", href: "/account/orders" },
    { icon: Heart, label: "Danh sách yêu thích", href: "/account/wishlist" },
]

export default function ProfilePage() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        gender: "Nam",
    })
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    const BASE_URL = "http://localhost:8080";

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await userApi.getMyProfile();
            const user = res.data;
            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                phone: user.phone || "",
                gender: "Nam"
            });
            if (user.avatarUrl) {
                setAvatarUrl(user.avatarUrl.startsWith('http') ? user.avatarUrl : BASE_URL + user.avatarUrl);
            }
        } catch (err) {
            setError("Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await userApi.updateProfile({
                fullName: formData.fullName,
                phone: formData.phone
            });
            setSuccess("Cập nhật hồ sơ thành công!");
        } catch (err) {
            setError("Có lỗi xảy ra khi cập nhật hồ sơ.");
        } finally {
            setSaving(false);
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const res = await userApi.uploadAvatar(file);
            const newUrl = res.data.url;
            setAvatarUrl(newUrl.startsWith('http') ? newUrl : BASE_URL + newUrl);
            setSuccess("Cập nhật ảnh đại diện thành công!");
        } catch (err) {
            setError("Không thể tải ảnh lên. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    }

    const handleRemoveAvatar = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            // Đồng bộ xóa ảnh lên thẳng Database của Sơn
            await userApi.updateProfile({ ...formData, avatarUrl: "" });
            setAvatarUrl("");
            setSuccess("Đã gỡ bỏ ảnh đại diện thành công!");
        } catch (err) {
            setError("Có lỗi xảy ra khi gỡ bỏ ảnh đại diện.");
        } finally {
            setSaving(false);
        }
    }

    return (
        // Sử dụng min-h vừa vặn để trừ hao không gian trống của Layout bọc ngoài
        <div className="min-h-[calc(100vh-160px)] bg-transparent flex flex-col justify-center">

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Sidebar bên trái */}
                    <aside className="w-full lg:w-64 shrink-0">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            {/* User Info */}
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                                <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-gray-100">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="truncate">
                                    <h3 className="font-semibold text-gray-900 text-sm truncate">{formData.fullName || "Tài khoản cá nhân"}</h3>
                                    <p className="text-xs text-muted-foreground">Quản lý tài khoản</p>
                                </div>
                            </div>

                            {/* Navigation List */}
                            <nav className="space-y-1">
                                {sidebarItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                            item.active
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Form chỉnh sửa chính bên phải */}
                    <div className="flex-1 w-full">
                        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Chỉnh sửa hồ sơ</h1>
                            <p className="text-muted-foreground text-sm mb-8">
                                Cập nhật thông tin tài khoản của bạn để bảo mật và quản lý đơn hàng tốt hơn.
                            </p>

                            <form onSubmit={handleSubmit}>
                                {error && <div className="p-3 mb-5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm">{error}</div>}
                                {success && <div className="p-3 mb-5 bg-green-50 text-green-600 border border-green-100 rounded-xl text-sm">{success}</div>}
                                {loading && <div className="p-3 mb-5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-sm">Đang tải dữ liệu tài khoản...</div>}

                                {/* Avatar Section */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center border border-gray-200">
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="h-9 w-9 text-primary" />
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('avatar-upload')?.click()}
                                            className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                                        >
                                            <Camera className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm mb-1">Ảnh đại diện</h3>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Dung lượng tối đa 1MB. Định dạng hỗ trợ: .JPG, .PNG
                                        </p>
                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                id="avatar-upload"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="bg-primary hover:bg-primary/90 rounded-xl"
                                                onClick={() => document.getElementById('avatar-upload')?.click()}
                                                disabled={saving}
                                            >
                                                {saving ? "Đang tải..." : "Chọn hình mới"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-100"
                                                onClick={handleRemoveAvatar}
                                                disabled={saving || !avatarUrl}
                                            >
                                                Gỡ bỏ
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Họ và tên
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="h-12 rounded-xl border-gray-200 focus-visible:ring-primary/20"
                                            placeholder="Nhập đầy đủ họ tên"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Địa chỉ Email
                                        </label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="h-12 bg-gray-50 border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                        />
                                        <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1 font-medium">
                                            <span className="inline-block w-3.5 h-3.5 rounded-full border border-amber-600 text-[9px] flex items-center justify-center font-bold">i</span>
                                            Liên hệ CSKH để thay đổi địa chỉ email của bạn
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số điện thoại
                                        </label>
                                        <div className="flex shadow-sm rounded-xl overflow-hidden">
                                            <span className="inline-flex items-center px-3.5 border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm font-medium">
                                                +84
                                            </span>
                                            <Input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="h-12 rounded-l-none border-gray-200 rounded-r-xl focus-visible:ring-primary/20"
                                                placeholder="Nhập số điện thoại"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Giới tính
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                className="w-full h-12 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium shadow-sm"
                                            >
                                                <option value="Nam">Nam</option>
                                                <option value="Nữ">Nữ</option>
                                                <option value="Khác">Khác</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badges */}
                                <div className="bg-gray-50/50 rounded-xl p-4 mb-8 border border-gray-100 flex flex-wrap gap-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl text-xs font-semibold text-emerald-700 border border-emerald-100 shadow-sm">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        Tài khoản đã xác thực
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl text-xs font-semibold text-emerald-700 border border-emerald-100 shadow-sm">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        Số điện thoại đã liên kết
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 border-t border-gray-50 pt-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="rounded-xl text-gray-500 hover:bg-gray-50"
                                        onClick={() => fetchProfile()}
                                    >
                                        Hủy thay đổi
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={saving || loading}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm px-6"
                                    >
                                        {saving ? "Đang lưu..." : "Lưu thông tin"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}