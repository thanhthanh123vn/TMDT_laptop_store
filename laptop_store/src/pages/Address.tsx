"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { addressApi } from "../api/addressApi"
import {
    LayoutDashboard,
    UserPen,
    KeyRound,
    MapPin,
    Bell,
    Package,
    Heart,
    ShoppingCart,
    User,
    Plus,
    Pencil,
    Trash2,
    MapPinPlus,
    Info,
    CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Address {
    id: number
    name: string
    phone: string
    address: string
    city: string
    type: "home" | "office"
    isDefault: boolean
}

const menuItems = [
    { icon: LayoutDashboard, label: "Tổng quan", href: "/account" },
    { icon: UserPen, label: "Chỉnh sửa hồ sơ", href: "/account/profile" },
    { icon: KeyRound, label: "Đổi mật khẩu", href: "/account/password" },
    { icon: MapPin, label: "Địa chỉ", href: "/account/address", active: true },
    { icon: Bell, label: "Thông báo", href: "/account/notifications" },
    { icon: Package, label: "Lịch sử đơn hàng", href: "/account/orders" },
    { icon: Heart, label: "Danh sách yêu thích", href: "/account/wishlist" },
]

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([])
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await addressApi.getMyAddresses();
            setAddresses(res.data.map((a: any) => ({
                id: a.id,
                name: a.fullName,
                phone: a.phone,
                address: `${a.streetAddress || ''}, ${a.ward || ''}, ${a.district || ''}`,
                city: a.province || '',
                type: (a.addressType || 'home').toLowerCase() as "home" | "office",
                isDefault: a.isDefault,
            })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefault = (id: number) => {
        setAddresses(
            addresses.map((addr) => ({
                ...addr,
                isDefault: addr.id === id,
            }))
        )
    }

    const handleDelete = async (id: number) => {
        try {
            await addressApi.deleteAddress(id);
            setAddresses(addresses.filter((addr) => addr.id !== id))
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="bg-background border-b border-border sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="text-xl sm:text-2xl font-bold text-primary">
                            LAPTOPRE
                        </Link>

                        {/* Navigation - Hidden on mobile */}
                        <nav className="hidden md:flex items-center gap-8">
                            <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Sản phẩm
                            </Link>
                            <Link to="/promotions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Khuyến mãi
                            </Link>
                            <Link to="/news" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Tin công nghệ
                            </Link>
                            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Về chúng tôi
                            </Link>
                        </nav>

                        {/* Right actions */}
                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-muted rounded-full transition-colors">
                                <ShoppingCart className="w-5 h-5 text-foreground" />
                            </button>
                            <button className="p-2 hover:bg-muted rounded-full transition-colors">
                                <User className="w-5 h-5 text-foreground" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 shrink-0">
                        <div className="bg-card rounded-lg p-4 lg:p-6 border border-border">
                            {/* User Info */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                                    <img
                                        src="/placeholder.svg?height=48&width=48"
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Tài khoản của tôi</h3>
                                    <p className="text-sm text-muted-foreground">Quản lý thông tin cá nhân</p>
                                </div>
                            </div>

                            {/* Menu */}
                            <nav className="space-y-1">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                            item.active
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="flex-1">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-primary">Danh sách địa chỉ</h1>
                                <p className="text-muted-foreground mt-1">
                                    Thêm hoặc quản lý các địa chỉ giao hàng của bạn.
                                </p>
                            </div>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 w-full sm:w-auto">
                                <Plus className="w-4 h-4" />
                                Thêm địa chỉ mới
                            </Button>
                        </div>

                        {/* Address Cards */}
                        <div className="space-y-4">
                            {loading && <div className="p-4 bg-blue-50 text-blue-600 rounded-lg">Đang tải dữ liệu...</div>}
                            {!loading && addresses.length === 0 && <div className="p-4 bg-muted text-muted-foreground rounded-lg">Bạn chưa có địa chỉ nào.</div>}
                            {addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className="bg-card border border-border rounded-lg p-4 sm:p-6"
                                >
                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                                        <div className="flex-1">
                                            {/* Name and Badge */}
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-foreground">{address.name}</h3>
                                                {address.isDefault && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Mặc định
                          </span>
                                                )}
                                            </div>

                                            {/* Phone */}
                                            <p className="text-muted-foreground mb-2">{address.phone}</p>

                                            {/* Address */}
                                            <p className="text-foreground">{address.address}</p>
                                            <p className="text-foreground mb-3">{address.city}</p>

                                            {/* Type Tag */}
                                            <span className="inline-block px-3 py-1 text-sm border border-border rounded-md text-muted-foreground">
                        {address.type === "home" ? "Nhà riêng" : "Văn phòng"}
                      </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex sm:flex-col items-start sm:items-end gap-2 sm:gap-3">
                                            <button className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
                                                <Pencil className="w-4 h-4" />
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(address.id)}
                                                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Xóa
                                            </button>
                                            {!address.isDefault && (
                                                <button
                                                    onClick={() => handleSetDefault(address.id)}
                                                    className="mt-2 px-3 py-1.5 text-sm border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors"
                                                >
                                                    Thiết lập mặc định
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add New Address Card */}
                            <button className="w-full border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-muted/50 transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <MapPinPlus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Thêm địa chỉ giao hàng mới
                </span>
                            </button>

                            {/* Privacy Notice */}
                            <div className="bg-muted/50 border border-border rounded-lg p-4 sm:p-5">
                                <div className="flex gap-3">
                                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-1">Lưu ý về bảo mật</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Chúng tôi cam kết bảo mật thông tin địa chỉ của bạn. Địa chỉ chỉ được chia sẻ với các đối tác vận chuyển khi bạn thực hiện đơn đặt hàng thành công.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-primary text-primary-foreground mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    {/* Logo */}
                    <div className="text-center mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold">LAPTOPRE</h2>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-6 text-sm">
                        <Link to="/warranty" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                            Chính sách bảo hành
                        </Link>
                        <Link to="/inspection" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                            Quy trình kiểm định
                        </Link>
                        <Link to="/payment" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                            Hướng dẫn thanh toán
                        </Link>
                        <Link to="/support" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                            Liên hệ hỗ trợ
                        </Link>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-primary-foreground/20 pt-6">
                        <p className="text-center text-sm text-primary-foreground/60">
                            © 2024 LAPTOPRE. Certified Refurbished Excellence.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
