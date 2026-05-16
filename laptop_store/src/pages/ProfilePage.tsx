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
    Search,
    ShoppingCart,
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

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="text-xl font-bold text-primary">
                            LAPTOPRE
                        </Link>

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            <Link to="/products" className="text-sm text-foreground hover:text-primary transition-colors">
                                Sản phẩm
                            </Link>
                            <Link to="/promotions" className="text-sm text-foreground hover:text-primary transition-colors">
                                Khuyến mãi
                            </Link>
                            <Link to="/news" className="text-sm text-foreground hover:text-primary transition-colors">
                                Tin công nghệ
                            </Link>
                            <Link to="/about" className="text-sm text-foreground hover:text-primary transition-colors">
                                Về chúng tôi
                            </Link>
                        </nav>

                        {/* Search and Icons */}
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center bg-muted rounded-lg px-3 py-2">
                                <Input
                                    type="text"
                                    placeholder="Tìm kiếm laptop..."
                                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 w-40 lg:w-56"
                                />
                                <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <ShoppingCart className="h-5 w-5 text-foreground" />
                            </button>
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <User className="h-5 w-5 text-foreground" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 shrink-0">
                        <div className="bg-card rounded-xl p-6 border border-border">
                            {/* User Info */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                                    <img
                                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Chi%CC%89nh%20su%CC%9B%CC%89a%20ho%CC%82%CC%80%20so%CC%9B%20-%20LAPTOPRE-rHmPziui8KK5tlvkbrWmaQTrXM5W7w.png"
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground text-sm">Tài khoản của tôi</h3>
                                    <p className="text-xs text-muted-foreground">Quản lý thông tin cá nhân</p>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="space-y-1">
                                {sidebarItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                            item.active
                                                ? "bg-primary text-primary-foreground"
                                                : "text-foreground hover:bg-muted"
                                        }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Form Content */}
                    <div className="flex-1">
                        <div className="bg-card rounded-xl p-6 lg:p-8 border border-border">
                            <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-2">Chỉnh sửa hồ sơ</h1>
                            <p className="text-muted-foreground mb-8">
                                Cập nhật thông tin tài khoản của bạn để nhận các ưu đãi tốt nhất từ LAPTOPRE.
                            </p>

                            <form onSubmit={handleSubmit}>
                                {error && <div className="p-3 mb-6 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>}
                                {success && <div className="p-3 mb-6 bg-green-100 text-green-600 rounded-lg text-sm">{success}</div>}
                                {loading && <div className="p-3 mb-6 bg-blue-50 text-blue-600 rounded-lg text-sm">Đang tải dữ liệu...</div>}
                                {/* Avatar Section */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-primary/10">
                                            <img
                                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Chi%CC%89nh%20su%CC%9B%CC%89a%20ho%CC%82%CC%80%20so%CC%9B%20-%20LAPTOPRE-rHmPziui8KK5tlvkbrWmaQTrXM5W7w.png"
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center"
                                        >
                                            <Camera className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">Ảnh đại diện</h3>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Dung lượng tối đa 1MB. Định dạng: .JPG, .PNG
                                        </p>
                                        <div className="flex gap-3">
                                            <Button type="button" size="sm" className="bg-primary hover:bg-primary/90">
                                                Chọn hình mới
                                            </Button>
                                            <Button type="button" variant="outline" size="sm">
                                                Gỡ bỏ
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Họ và tên
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="h-12"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Địa chỉ Email
                                        </label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="h-12 bg-muted"
                                        />
                                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                            <span className="inline-block w-3 h-3 rounded-full border border-amber-600 text-[8px] flex items-center justify-center">i</span>
                                            Liên hệ hỗ trợ để thay đổi email
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Số điện thoại
                                        </label>
                                        <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                        +84
                      </span>
                                            <Input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="h-12 rounded-l-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Giới tính
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                className="w-full h-12 px-3 rounded-md border border-input bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                                            >
                                                <option value="Nam">Nam</option>
                                                <option value="Nữ">Nữ</option>
                                                <option value="Khác">Khác</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badges */}
                                <div className="bg-muted/50 rounded-lg p-4 mb-8 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-card rounded-full text-sm border border-border">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Tài khoản xác thực
                  </span>
                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-card rounded-full text-sm border border-border">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    SĐT đã liên kết
                  </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-4">
                                    <Button type="button" variant="ghost" onClick={() => fetchProfile()}>
                                        Hủy thay đổi
                                    </Button>
                                    <Button type="submit" disabled={saving || loading} className="bg-primary hover:bg-primary/90 disabled:opacity-50">
                                        {saving ? "Đang lưu..." : "Lưu thông tin"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-card border-t border-border mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                        <Link to="/" className="text-xl font-bold text-primary">
                            LAPTOPRE
                        </Link>
                        <nav className="flex flex-wrap justify-center gap-6">
                            <Link to="/warranty" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Chính sách bảo hành
                            </Link>
                            <Link to="/inspection" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Quy trình kiểm định
                            </Link>
                            <Link to="/payment" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Hướng dẫn thanh toán
                            </Link>
                            <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Liên hệ hỗ trợ
                            </Link>
                        </nav>
                    </div>
                    <div className="border-t border-border pt-6">
                        <p className="text-center text-sm text-muted-foreground">
                            © 2024 LAPTOPRE. Certified Refurbished Excellence.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
