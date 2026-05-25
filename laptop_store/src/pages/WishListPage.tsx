import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { wishlistApi } from "../api/wishlistApi"
import { userApi } from "../api/userApi"
import { useStore } from "../context/StoreContext"
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
    CreditCard,
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

interface WishlistItem {
    id: number
    name: string
    image: string
    price: number
    oldPrice?: number
    rating: number
    reviews: number
    badge: string
    badgeColor: string
    brand: string
    cpu: string
    ram: string
    storage: string
    condition: string
}

function formatVND(price: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
}

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
    const [loading, setLoading] = useState(true)
    const [userProfile, setUserProfile] = useState<{ fullName: string; avatarUrl: string }>({
        fullName: "Tài khoản của tôi",
        avatarUrl: "",
    })
    const { addToCart, syncWishlistFromServer } = useStore()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const res = await wishlistApi.getMyWishlist()
                setWishlistItems(
                    res.data.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        image: p.imageUrl || "/placeholder.svg",
                        price: Number(p.price),
                        oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
                        rating: p.rating || 5.0,
                        reviews: p.reviews || 0,
                        badge: p.badge || "",
                        badgeColor: p.badgeColor || "bg-emerald-500",
                        brand: p.brand || "",
                        cpu: p.cpu || "",
                        ram: p.ram || "",
                        storage: p.storage || "",
                        condition: p.condition || "",
                    }))
                )
            } catch {
                // not logged in or error
            } finally {
                setLoading(false)
            }
        }

        const fetchProfile = async () => {
            try {
                const res = await userApi.getMyProfile()
                const user = res.data
                const BASE_URL = "http://localhost:8080"
                setUserProfile({
                    fullName: user.fullName || "Tài khoản của tôi",
                    avatarUrl: user.avatarUrl
                        ? user.avatarUrl.startsWith("http")
                            ? user.avatarUrl
                            : BASE_URL + user.avatarUrl
                        : "",
                })
            } catch {
                // ignore
            }
        }

        fetchWishlist()
        fetchProfile()
    }, [])

    const removeFromWishlist = async (id: number) => {
        try {
            await wishlistApi.toggleWishlist(id)
            setWishlistItems((prev) => prev.filter((item) => item.id !== id))
            syncWishlistFromServer()
        } catch {
            // ignore
        }
    }

    const handleBuyNow = (item: WishlistItem) => {
        navigate("/checkout", {
            state: {
                isBuyNow: true,
                item: {
                    laptop: {
                        id: String(item.id),
                        name: item.name,
                        brand: item.brand,
                        price: item.price,
                        originalPrice: item.oldPrice,
                        image: item.image,
                        images: [item.image],
                        cpu: item.cpu,
                        gpu: "",
                        ram: item.ram,
                        storage: item.storage,
                        storageType: "SSD",
                        screenSize: "",
                        weight: "",
                        batteryCondition: "",
                        condition: item.condition as any,
                        rating: item.rating,
                        reviewCount: item.reviews,
                        category: [],
                        description: "",
                        seller: { name: "", rating: 5, soldCount: 0 },
                    },
                    quantity: 1,
                },
            },
        })
    }

    return (
        <div className="min-h-[calc(100vh-160px)] bg-transparent flex flex-col justify-center">
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 shrink-0">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                                <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-gray-100">
                                    {userProfile.avatarUrl ? (
                                        <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
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

                    {/* Content */}
                    <div className="flex-1 w-full">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Danh sách yêu thích</h1>
                            <p className="text-muted-foreground text-sm mt-0.5">
                                {wishlistItems.length > 0
                                    ? `Bạn đang lưu ${wishlistItems.length} sản phẩm quan tâm.`
                                    : "Những sản phẩm bạn yêu thích sẽ hiển thị ở đây."}
                            </p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-gray-100 h-72 animate-pulse" />
                                ))}
                            </div>
                        ) : wishlistItems.length === 0 ? (
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
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {wishlistItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-100 transition-all group flex flex-col"
                                    >
                                        {/* Image */}
                                        <Link to={`/product/${item.id}`} className="relative block bg-gray-50 border-b border-gray-50">
                                            {item.badge && (
                                                <span className={`absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold text-white rounded-md z-10 ${item.badgeColor}`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                            <button
                                                onClick={(e) => { e.preventDefault(); removeFromWishlist(item.id) }}
                                                className="absolute top-3 right-3 p-1.5 bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 rounded-xl border border-gray-100 shadow-sm transition-colors z-10"
                                                aria-label="Xóa khỏi yêu thích"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            <div className="aspect-[4/3] flex items-center justify-center p-4">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="max-w-full max-h-36 object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        </Link>

                                        {/* Info */}
                                        <div className="p-4 flex flex-col flex-1">
                                            {item.brand && (
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{item.brand}</p>
                                            )}
                                            <Link to={`/product/${item.id}`}>
                                                <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 leading-snug min-h-[2.5rem] group-hover:text-primary transition-colors">
                                                    {item.name}
                                                </h3>
                                            </Link>

                                            {/* Specs */}
                                            {(item.cpu || item.ram || item.storage) && (
                                                <div className="text-xs text-slate-500 space-y-0.5 mb-3">
                                                    {item.cpu && <p><span className="font-medium text-slate-600">CPU:</span> {item.cpu}</p>}
                                                    {(item.ram || item.storage) && (
                                                        <p>
                                                            {item.ram && <><span className="font-medium text-slate-600">RAM:</span> {item.ram}</>}
                                                            {item.ram && item.storage && " | "}
                                                            {item.storage && <><span className="font-medium text-slate-600">SSD:</span> {item.storage}</>}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Rating + condition */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                    <span className="text-xs font-bold text-gray-700">{item.rating}</span>
                                                    <span className="text-xs text-muted-foreground">({item.reviews})</span>
                                                </div>
                                                {item.condition && (
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                                        {item.condition}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Price + actions */}
                                            <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                                                <div>
                                                    <p className="text-base font-bold text-blue-600">{formatVND(item.price)}</p>
                                                    {item.oldPrice && (
                                                        <p className="text-xs text-slate-400 line-through">{formatVND(item.oldPrice)}</p>
                                                    )}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="gap-1.5 rounded-xl text-xs font-semibold shrink-0"
                                                    onClick={() => handleBuyNow(item)}
                                                >
                                                    <CreditCard className="h-3.5 w-3.5" />
                                                    Mua ngay
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
