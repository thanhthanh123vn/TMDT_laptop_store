"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { notificationApi } from "../api/notificationApi"
import { userApi } from "../api/userApi"
import {
    LayoutGrid,
    UserPen,
    KeyRound,
    MapPin,
    Bell,
    Clock,
    Heart,
    Search,
    ShoppingCart,
    User,
    Package,
    Truck,
    Monitor,
    AlertTriangle,
    Percent,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const menuItems = [
    { icon: LayoutGrid, label: "Tổng quan", href: "/account" },
    { icon: UserPen, label: "Chỉnh sửa hồ sơ", href: "/account/profile" },
    { icon: KeyRound, label: "Đổi mật khẩu", href: "/account/password" },
    { icon: MapPin, label: "Địa chỉ", href: "/account/address" },
    { icon: Bell, label: "Thông báo", href: "/account/notifications", active: true },
    { icon: Clock, label: "Lịch sử đơn hàng", href: "/account/orders" },
    { icon: Heart, label: "Danh sách yêu thích", href: "/account/wishlist" },
]

interface Notification {
    id: string
    type: "order" | "system" | "promo" | "info" | "warning"
    title: string
    message: string
    time: string
    read: boolean
    icon?: "package" | "truck" | "monitor" | "warning"
    image?: string
    actions?: { label: string; href: string }[]
}



export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [userProfile, setUserProfile] = useState<{ fullName: string; avatarUrl: string }>({ fullName: "Tài khoản của tôi", avatarUrl: "" })

    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const res = await notificationApi.getMyNotifications();
                setNotifications(res.data.map((n: any) => ({
                    id: n.id.toString(),
                    type: n.type || "system",
                    title: n.title,
                    message: n.message,
                    time: n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : "",
                    read: n.read,
                    icon: n.icon || "info",
                    image: n.imageUrl,
                    actions: n.actionLink ? [{ label: "Chi tiết", href: n.actionLink }] : []
                })));
            } catch(err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        const fetchProfile = async () => {
            try {
                const res = await userApi.getMyProfile();
                const user = res.data;
                const BASE_URL = "http://localhost:8080";
                setUserProfile({
                    fullName: user.fullName || "Tài khoản của tôi",
                    avatarUrl: user.avatarUrl ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : BASE_URL + user.avatarUrl) : ""
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchNotifs();
        fetchProfile();
    }, []);

    const orderNotifications = notifications.filter((n) => n.type === "order")
    const systemNotificationsAPI = notifications.filter((n) => n.type === "system" || n.type === "promo" || n.type === "info" || n.type === "warning")
    const unreadCount = notifications.filter((n) => !n.read).length

    const markAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        } catch(err) {
            console.error(err);
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="text-xl font-bold">
                            LAPTOPRE
                        </Link>

                        <nav className="hidden md:flex items-center gap-8">
                            <Link to="/products" className="text-sm hover:text-white/80">
                                Sản phẩm
                            </Link>
                            <Link to="/promotions" className="text-sm hover:text-white/80">
                                Khuyến mãi
                            </Link>
                            <Link to="/news" className="text-sm hover:text-white/80">
                                Tin công nghệ
                            </Link>
                            <Link to="/about" className="text-sm hover:text-white/80">
                                Về chúng tôi
                            </Link>
                        </nav>

                        <div className="flex items-center gap-4">
                            <div className="relative hidden md:block">
                                <Input
                                    type="text"
                                    placeholder="Tìm kiếm laptop..."
                                    className="w-64 bg-white/10 border-white/20 text-white placeholder:text-white/60 pr-10"
                                />
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                            </div>
                            <button className="p-2 hover:bg-white/10 rounded-full">
                                <ShoppingCart className="h-5 w-5" />
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded-full">
                                <User className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 shrink-0">
                        <div className="bg-card rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                                    {userProfile.avatarUrl ? (
                                        <img
                                            src={userProfile.avatarUrl}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-semibold text-foreground text-sm">{userProfile.fullName}</h2>
                                    <p className="text-xs text-muted-foreground">Quản lý thông tin cá nhân</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                            item.active
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-primary">Trung tâm thông báo</h1>
                                <p className="text-muted-foreground mt-1">
                                    Cập nhật tin tức mới nhất về tài khoản và đơn hàng của bạn.
                                </p>
                            </div>
                            <Button variant="outline" onClick={markAllAsRead} className="shrink-0">
                                Đánh dấu tất cả là đã đọc
                            </Button>
                        </div>

                        <div className="flex flex-col xl:flex-row gap-6">
                            {/* Order Notifications */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-primary rounded-full" />
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                    <h2 className="font-semibold text-foreground">
                                        Đơn hàng ({orderNotifications.length})
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {loading && <div className="p-4 bg-blue-50 text-blue-600 rounded-lg">Đang tải dữ liệu...</div>}
                                    {!loading && orderNotifications.length === 0 && <div className="p-4 bg-muted text-muted-foreground rounded-lg">Không có thông báo đơn hàng nào.</div>}
                                    {orderNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`bg-card rounded-lg p-4 border shadow-sm ${
                                                !notification.read ? "border-l-4 border-l-primary" : ""
                                            }`}
                                        >
                                            <div className="flex gap-4">
                                                {notification.image ? (
                                                    <div className="relative w-16 h-16 shrink-0 bg-muted rounded-lg overflow-hidden">
                                                        <img
                                                            src={notification.image}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 shrink-0 bg-muted rounded-lg flex items-center justify-center">
                                                        {notification.icon === "truck" ? (
                                                            <Truck className="h-6 w-6 text-muted-foreground" />
                                                        ) : (
                                                            <Package className="h-6 w-6 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h3 className="font-medium text-foreground text-sm">
                                                            {notification.title}
                                                        </h3>
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {notification.time}
                            </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {notification.message}
                                                    </p>
                                                    {notification.actions && (
                                                        <div className="flex gap-4 mt-3">
                                                            {notification.actions.map((action) => (
                                                                <Link
                                                                    key={action.label}
                                                                    to={action.href}
                                                                    className="text-sm text-primary hover:underline font-medium"
                                                                >
                                                                    {action.label}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Sidebar */}
                            <div className="w-full xl:w-80 shrink-0 space-y-6">
                                {/* System Notifications */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-6 bg-primary rounded-full" />
                                        <h2 className="font-semibold text-primary">HỆ THỐNG</h2>
                                    </div>

                                    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                                        {systemNotificationsAPI.length === 0 && <div className="p-4 text-sm text-muted-foreground">Không có thông báo hệ thống.</div>}
                                        {systemNotificationsAPI.map((item, index) => (
                                            <div
                                                key={item.id}
                                                className={`p-4 ${index !== systemNotificationsAPI.length - 1 ? "border-b" : ""}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div
                                                        className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
                                                            item.type === "warning" ? "bg-red-100" : "bg-primary/10"
                                                        }`}
                                                    >
                                                        {item.icon === "monitor" ? (
                                                            <Monitor
                                                                className={`h-5 w-5 ${item.type === "warning" ? "text-red-500" : "text-primary"}`}
                                                            />
                                                        ) : (
                                                            <AlertTriangle className="h-5 w-5 text-red-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-foreground">{item.title}</h4>
                                                        <p className="text-xs text-muted-foreground mt-0.5">{item.message}</p>
                                                        {item.type === "warning" && (
                                                            <p className="text-xs text-red-500 font-medium mt-1">Cảnh báo bảo mật</p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Promotions */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-6 bg-red-500 rounded-full" />
                                        <h2 className="font-semibold text-red-500">KHUYẾN MÃI</h2>
                                    </div>

                                    {/* Hot Deal Card */}
                                    <div className="bg-primary rounded-lg p-4 mb-4">
                    <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                      HOT DEAL
                    </span>
                                        <h3 className="text-white font-bold text-lg">Xả kho ThinkPad L-series</h3>
                                        <p className="text-white/80 text-sm mt-1">
                                            Giảm thêm 10% cho khách hàng cũ. Số lượng có hạn!
                                        </p>
                                        <Button className="w-full mt-4 bg-white text-primary hover:bg-white/90">
                                            Nhận mã ngay
                                        </Button>
                                    </div>

                                    {/* Gift Promotion */}
                                    <div className="bg-card rounded-lg border p-4 shadow-sm">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 shrink-0 rounded-full bg-muted flex items-center justify-center">
                                                <Percent className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-foreground">Quà tặng 20/10</h4>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Tặng túi chống sốc cao cấp cho mỗi đơn hàng.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-primary text-primary-foreground mt-12">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-2">
                            <h3 className="text-xl font-bold mb-4">LAPTOPRE</h3>
                            <p className="text-white/80 text-sm leading-relaxed max-w-md">
                                Chuyên cung cấp laptop nhập khẩu, refurbished đạt chuẩn quân đội với chế độ bảo hành
                                vàng 12 tháng.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Chính sách</h4>
                            <ul className="space-y-2 text-sm text-white/80">
                                <li>
                                    <Link to="/warranty" className="hover:text-white">
                                        Chính sách bảo hành
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/inspection" className="hover:text-white">
                                        Quy trình kiểm định
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
                            <ul className="space-y-2 text-sm text-white/80">
                                <li>
                                    <Link to="/payment-guide" className="hover:text-white">
                                        Hướng dẫn thanh toán
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/support" className="hover:text-white">
                                        Liên hệ hỗ trợ
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
                        © 2024 LAPTOPRE. Certified Refurbished Excellence.
                    </div>
                </div>
            </footer>
        </div>
    )
}
