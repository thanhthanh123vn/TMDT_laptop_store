"use client"

import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { wishlistApi } from "../api/wishlistApi"
import { userApi } from "../api/userApi"
import {
    LayoutGrid,
    UserCog,
    KeyRound,
    MapPin,
    Bell,
    ClipboardList,
    Heart,
    X,
    Star,
    User,
    ShoppingBasket,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const menuItems = [
    { icon: LayoutGrid, label: "Tổng quan", href: "/account" },
    { icon: UserCog, label: "Chỉnh sửa hồ sơ", href: "/account/profile" },
    { icon: KeyRound, label: "Đổi mật khẩu", href: "/account/password" },
    { icon: MapPin, label: "Địa chỉ", href: "/account/address" },
    { icon: Bell, label: "Thông báo", href: "/account/notifications" },
    { icon: ClipboardList, label: "Lịch sử đơn hàng", href: "/account/orders" },
    { icon: Heart, label: "Danh sách yêu thích", href: "/account/wishlist", active: true },
]

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [userProfile, setUserProfile] = useState<{ fullName: string; avatarUrl: string }>({ fullName: "Tài khoản của tôi", avatarUrl: "" })

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const res = await wishlistApi.getMyWishlist();
                setWishlistItems(res.data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    image: p.imageUrl || '/placeholder.svg',
                    price: p.price,
                    rating: p.rating || 5.0,
                    reviews: p.reviews || 0,
                    badge: p.badge || '99% LIKE NEW',
                    badgeColor: p.badgeColor || 'bg-emerald-500',
                    specs: []
                })));
            } catch (err) {
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
        fetchWishlist();
        fetchProfile();
    }, []);

    const removeFromWishlist = async (id: number) => {
        try {
            await wishlistApi.toggleWishlist(id);
            setWishlistItems(wishlistItems.filter((item) => item.id !== id))
        } catch (err) {
            console.error(err);
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ"
    }

    return (
        <div className="min-h-[calc(100vh-160px)] bg-transparent flex flex-col justify-center">
            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
                                    <p className="font-semibold text-gray-900 text-sm truncate">{userProfile.fullName}</p>
                                    <p className="text-xs text-muted-foreground">Quản lý cá nhân</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {menuItems.map((item) => (
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
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Content chính sản phẩm yêu thích */}
                    <div className="flex-1 w-full">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Danh sách yêu thích</h1>
                            <p className="text-muted-foreground text-sm mt-0.5">
                                Bạn đang lưu trữ {wishlistItems.length} sản phẩm trong danh sách quan tâm.
                            </p>
                        </div>

                        {loading && (
                            <div className="p-4 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-sm font-medium mb-6">
                                Đang tải danh sách yêu thích...
                            </div>
                        )}

                        {!loading && wishlistItems.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                                <Heart className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-base font-bold text-gray-900 mb-1">Danh sách yêu thích trống</h3>
                                <p className="text-muted-foreground text-sm mb-5">
                                    Hãy thêm những sản phẩm bạn ưng ý vào danh sách này nhé.
                                </p>
                                <Button asChild className="rounded-xl h-10 px-5 shadow-sm font-semibold">
                                    <Link to="/products">Khám phá sản phẩm</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {wishlistItems.map((item) => (
                                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md/50 hover:border-gray-200 transition-all group relative flex flex-col">

                                        {/* Phần ảnh & Badge */}
                                        <div className="relative p-4 bg-gray-50/50 flex items-center justify-center border-b border-gray-50">
                                            <span className={`absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold text-white rounded-md shadow-sm ${item.badgeColor}`}>
                                                {item.badge}
                                            </span>
                                            <button
                                                onClick={() => removeFromWishlist(item.id)}
                                                className="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 rounded-xl border border-gray-100 shadow-sm transition-colors z-10"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            <div className="aspect-[4/3] w-full max-h-40 relative flex items-center justify-center p-2">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        </div>

                                        {/* Thông tin sản phẩm */}
                                        <div className="p-5 flex flex-col flex-1">
                                            <div className="flex items-center gap-1 mb-2">
                                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                <span className="text-xs font-bold text-gray-700">{item.rating}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ({item.reviews} đánh giá)
                                                </span>
                                            </div>

                                            <h3 className="font-semibold text-gray-900 text-sm mb-3 line-clamp-2 min-h-[40px] leading-relaxed group-hover:text-primary transition-colors">
                                                {item.name}
                                            </h3>

                                            {/* Specs tags */}
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {item.specs?.map((spec: any, index: number) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-md text-[11px] text-gray-500"
                                                    >
                                                        {spec.icon && <spec.icon className="h-3 w-3" />}
                                                        {spec.label}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Giá & Button hành động */}
                                            <div className="mt-auto pt-2 border-t border-gray-50 flex flex-col gap-3">
                                                <p className="text-lg font-bold text-primary">
                                                    {formatPrice(item.price)}
                                                </p>

                                                <Button className="w-full gap-2 rounded-xl h-10 text-xs font-semibold shadow-sm">
                                                    <ShoppingBasket className="h-4 w-4" />
                                                    Thêm vào giỏ hàng
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    )
}