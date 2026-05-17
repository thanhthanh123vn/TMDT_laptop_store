"use client"

import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { wishlistApi } from "../api/wishlistApi"
import { userApi } from "../api/userApi"
import {
    Search,
    ShoppingCart,
    User,
    LayoutGrid,
    UserCog,
    KeyRound,
    MapPin,
    Bell,
    ClipboardList,
    Heart,
    X,
    Star,
    Cpu,
    MemoryStick,
    Monitor,
    Battery,
    ShoppingBasket,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-8">
                        <Link to="/" className="text-xl font-bold tracking-tight">
                            LAPTOPRE
                        </Link>

                        <nav className="hidden md:flex items-center gap-8">
                            <Link to="/products" className="text-sm hover:text-white/80 transition-colors">
                                Sản phẩm
                            </Link>
                            <Link to="/promotions" className="text-sm hover:text-white/80 transition-colors">
                                Khuyến mãi
                            </Link>
                            <Link to="/news" className="text-sm hover:text-white/80 transition-colors">
                                Tin công nghệ
                            </Link>
                            <Link to="/about" className="text-sm hover:text-white/80 transition-colors">
                                Về chúng tôi
                            </Link>
                        </nav>

                        <div className="flex items-center gap-4">
                            <div className="relative hidden md:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Tìm kiếm laptop..."
                                    className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
                                />
                            </div>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                                <ShoppingCart className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                                <User className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-card rounded-lg border p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                                    {userProfile.avatarUrl ? (
                                        <img
                                            src={userProfile.avatarUrl}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-6 w-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{userProfile.fullName}</p>
                                    <p className="text-sm text-muted-foreground">Quản lý thông tin cá nhân</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                            item.active
                                                ? "bg-rose-500 text-white"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="mb-6">
                            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Danh sách yêu thích</h1>
                            <p className="text-muted-foreground">
                                Bạn đang lưu trữ {wishlistItems.length} sản phẩm trong danh sách quan tâm.
                            </p>
                        </div>

                        {loading && <div className="p-4 bg-blue-50 text-blue-600 rounded-lg mb-6">Đang tải dữ liệu...</div>}

                        {!loading && wishlistItems.length === 0 ? (
                            <div className="bg-card rounded-lg border p-12 text-center">
                                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Danh sách yêu thích trống</h3>
                                <p className="text-muted-foreground mb-4">
                                    Bạn chưa có sản phẩm nào trong danh sách yêu thích.
                                </p>
                                <Button asChild>
                                    <Link to="/products">Khám phá sản phẩm</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {wishlistItems.map((item) => (
                                    <div key={item.id} className="bg-card rounded-lg border overflow-hidden group">
                                        <div className="relative p-4 bg-muted/30">
                      <span
                          className={`absolute top-4 left-4 px-2 py-1 text-xs font-medium text-white rounded ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                                            <button
                                                onClick={() => removeFromWishlist(item.id)}
                                                className="absolute top-4 right-4 p-1 hover:bg-muted rounded transition-colors"
                                            >
                                                <X className="h-5 w-5 text-muted-foreground" />
                                            </button>
                                            <div className="aspect-[4/3] relative">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-center gap-1 mb-2">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-medium">{item.rating}</span>
                                                <span className="text-sm text-muted-foreground">
                          ({item.reviews} đánh giá)
                        </span>
                                            </div>

                                            <h3 className="font-semibold text-sm mb-3 line-clamp-2 min-h-[40px]">
                                                {item.name}
                                            </h3>

                                            <div className="flex gap-2 mb-4">
                                                {item.specs?.map((spec: any, index: number) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs text-muted-foreground"
                                                    >
                                                        {spec.icon && <spec.icon className="h-3 w-3" />}
                                                        {spec.label}
                                                    </div>
                                                ))}
                                            </div>

                                            <p className="text-xl font-bold text-primary mb-4">
                                                {formatPrice(item.price)}
                                            </p>

                                            <Button className="w-full gap-2">
                                                <ShoppingBasket className="h-4 w-4" />
                                                Thêm vào giỏ
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-primary text-primary-foreground mt-auto">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">LAPTOPRE</h3>
                            <p className="text-sm text-white/70 leading-relaxed">
                                Cung cấp giải pháp máy tính xách tay Certified Refurbished uy tín hàng đầu, đảm bảo
                                quy trình kiểm định khắt khe và chế độ hậu mãi tận tâm.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Dịch vụ</h4>
                            <ul className="space-y-2 text-sm text-white/70">
                                <li>
                                    <Link to="/warranty" className="hover:text-white transition-colors">
                                        Chính sách bảo hành
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/inspection" className="hover:text-white transition-colors">
                                        Quy trình kiểm định
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/payment" className="hover:text-white transition-colors">
                                        Hướng dẫn thanh toán
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Kết nối</h4>
                            <div className="flex gap-3 mb-4">
                                <Button variant="outline" size="icon" className="bg-transparent border-white/30 hover:bg-white/10">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </Button>
                                <Button variant="outline" size="icon" className="bg-transparent border-white/30 hover:bg-white/10">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </Button>
                                <Button variant="outline" size="icon" className="bg-transparent border-white/30 hover:bg-white/10">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                                        <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                                    </svg>
                                </Button>
                                <Button variant="outline" size="icon" className="bg-transparent border-white/30 hover:bg-white/10">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                                    </svg>
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <img
                                    src="/placeholder.svg?height=32&width=48"
                                    alt="Momo"
                                    className="h-8 w-auto rounded"
                                />
                                <img
                                    src="/placeholder.svg?height=32&width=48"
                                    alt="Shopee Pay"
                                    className="h-8 w-auto rounded"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10">
                    <div className="container mx-auto px-4 py-4">
                        <p className="text-sm text-white/60 text-center">
                            © 2024 LAPTOPRE. Certified Refurbished Excellence.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
