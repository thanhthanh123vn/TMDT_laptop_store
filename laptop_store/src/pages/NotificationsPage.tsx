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
    User,
    Package,
    Truck,
    Monitor,
    AlertTriangle,
    Percent,
} from "lucide-react"
import { Button } from "@/components/ui/button"

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
                    message: n.content || n.message || "Không có nội dung",
                    time: n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : "",
                    read: n.read,
                    icon: n.icon || "info",
                    image: n.imageUrl,
                    actions: (n.actionUrl || n.actionLink) ? [{ label: "Chi tiết", href: (n.actionUrl || n.actionLink) }] : []
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
    const systemNotificationsAPI = notifications.filter((n) => n.type !== "order")

    const markAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        } catch(err) {
            console.error(err);
        }
    }

    return (
        <div className="min-h-[calc(100vh-160px)] bg-transparent flex flex-col justify-center">
            {/* Main Content */}
            <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Sidebar bên trái */}
                    <aside className="w-full lg:w-64 shrink-0">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                                <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-gray-100">
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
                                <div className="truncate">
                                    <h2 className="font-semibold text-gray-900 text-sm truncate">{userProfile.fullName}</h2>
                                    <p className="text-xs text-muted-foreground">Quản lý cá nhân</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                            item.active
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Content chính bên phải */}
                    <main className="flex-1 w-full">
                        {/* Title Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Trung tâm thông báo</h1>
                                <p className="text-muted-foreground text-sm mt-0.5">
                                    Cập nhật các hoạt động mới nhất về tài khoản, đơn hàng và ưu đãi dành cho bạn.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={markAllAsRead}
                                className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl h-11 px-5 text-xs font-semibold shadow-sm shrink-0"
                            >
                                Đánh dấu tất cả là đã đọc
                            </Button>
                        </div>

                        <div className="flex flex-col xl:flex-row gap-6 items-start">
                            {/* Cột thông báo Đơn hàng */}
                            <div className="flex-1 w-full space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-5 bg-primary rounded-full" />
                                    <h2 className="font-bold text-gray-900 text-base">
                                        Cập nhật đơn hàng ({orderNotifications.length})
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {loading && (
                                        <div className="p-4 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-sm font-medium">
                                            Đang tải dữ liệu thông báo...
                                        </div>
                                    )}

                                    {!loading && orderNotifications.length === 0 && (
                                        <div className="p-8 bg-white border border-gray-100 rounded-2xl text-center text-muted-foreground text-sm shadow-sm">
                                            Không có thông báo về đơn hàng nào gần đây.
                                        </div>
                                    )}

                                    {orderNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`bg-white rounded-2xl p-5 border shadow-sm transition-all ${
                                                !notification.read ? "border-l-4 border-l-primary border-gray-100" : "border-gray-100"
                                            }`}
                                        >
                                            <div className="flex gap-4">
                                                {notification.image ? (
                                                    <div className="relative w-16 h-16 shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                                        <img
                                                            src={notification.image}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 shrink-0 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center">
                                                        {notification.icon === "truck" ? (
                                                            <Truck className="h-6 w-6 text-gray-400" />
                                                        ) : (
                                                            <Package className="h-6 w-6 text-gray-400" />
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <h3 className={`font-semibold text-gray-900 text-sm ${!notification.read ? "font-bold" : ""}`}>
                                                            {notification.title}
                                                        </h3>
                                                        <span className="text-[11px] text-muted-foreground whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                                            {notification.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    {notification.actions && (
                                                        <div className="flex gap-4 mt-3 pt-2 border-t border-gray-50">
                                                            {notification.actions.map((action) => (
                                                                <Link
                                                                    key={action.label}
                                                                    to={action.href}
                                                                    className="text-xs text-primary hover:underline font-semibold"
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

                            {/* Cột Hệ thống & Khuyến mãi bên phải */}
                            <div className="w-full xl:w-80 shrink-0 space-y-6">
                                {/* Thông báo Hệ thống */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-5 bg-indigo-500 rounded-full" />
                                        <h2 className="font-bold text-gray-900 text-base">Hệ thống</h2>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                                        {systemNotificationsAPI.length === 0 && (
                                            <div className="p-5 text-xs text-muted-foreground text-center">
                                                Không có thông báo hệ thống.
                                            </div>
                                        )}
                                        {systemNotificationsAPI.map((item) => (
                                            <div key={item.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                                                <div className="flex gap-3">
                                                    <div
                                                        className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
                                                            item.type === "warning" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                                                        }`}
                                                    >
                                                        {item.icon === "monitor" ? (
                                                            <Monitor className="h-4 w-4" />
                                                        ) : (
                                                            <AlertTriangle className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs font-bold text-gray-900 truncate">{item.title}</h4>
                                                        <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{item.message}</p>
                                                        {item.type === "warning" && (
                                                            <span className="inline-block text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-md mt-1.5">
                                                                Cảnh báo bảo mật
                                                            </span>
                                                        )}
                                                        <p className="text-[10px] text-gray-400 mt-2">{item.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Chương trình Ưu đãi */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-5 bg-red-500 rounded-full" />
                                        <h2 className="font-bold text-gray-900 text-base">Tin khuyến mãi</h2>
                                    </div>

                                    {/* Hot Deal Banner Card */}
                                    <div className="bg-primary rounded-2xl p-5 text-primary-foreground relative overflow-hidden shadow-sm">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                        <span className="inline-block bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md mb-2 shadow-sm">
                                            HOT DEAL
                                        </span>
                                        <h3 className="font-bold text-base leading-snug">Xả kho lớn ThinkPad L-Series</h3>
                                        <p className="text-primary-foreground/80 text-xs mt-1 leading-relaxed">
                                            Giảm thêm trực tiếp 10% cho thành viên cũ. Số lượng có hạn!
                                        </p>
                                        <Button className="w-full mt-4 bg-white text-primary hover:bg-white/90 text-xs font-semibold h-9 rounded-xl shadow-sm">
                                            Nhận mã ưu đãi ngay
                                        </Button>
                                    </div>

                                    {/* Gift Promotion Mini Card */}
                                    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:border-gray-200/80 transition-all">
                                        <div className="flex gap-3 items-center">
                                            <div className="w-9 h-9 shrink-0 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                                                <Percent className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-bold text-gray-900 truncate">Quà tặng tri ân đặc biệt</h4>
                                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                                    Tặng kèm túi chống sốc cao cấp cho mọi dòng máy.
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
        </div>
    )
}