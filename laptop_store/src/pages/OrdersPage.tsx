"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { orderApi } from "../api/orderApi"
import {
    LayoutDashboard,
    UserPen,
    KeyRound,
    MapPin,
    Bell,
    ClipboardList,
    Heart,
    ShoppingCart,
    User,
    Search,
    ChevronDown,
    RotateCcw,
    CheckCircle2,
    Truck,
    XCircle,
    FileText,
    Globe,
    Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const menuItems = [
    { icon: LayoutDashboard, label: "Tổng quan", href: "/account" },
    { icon: UserPen, label: "Chỉnh sửa hồ sơ", href: "/account/profile" },
    { icon: KeyRound, label: "Đổi mật khẩu", href: "/account/password" },
    { icon: MapPin, label: "Địa chỉ", href: "/account/address" },
    { icon: Bell, label: "Thông báo", href: "/account/notifications" },
    { icon: ClipboardList, label: "Lịch sử đơn hàng", href: "/account/orders", active: true },
    { icon: Heart, label: "Danh sách yêu thích", href: "/account/wishlist" },
]

type OrderStatus = "processing" | "delivered" | "shipped" | "cancelled"

interface Order {
    id: string
    orderNumber: string
    orderDate: string
    total: string
    status: OrderStatus
    product: {
        name: string
        condition: string
        image: string
        tags: { label: string; color: "orange" | "blue" | "green" }[]
        deliveryDate?: string
        cancelReason?: string
    }
}


const statusConfig: Record<
    OrderStatus,
    { label: string; icon: React.ElementType; className: string }
> = {
    processing: {
        label: "Processing",
        icon: RotateCcw,
        className: "text-muted-foreground",
    },
    delivered: {
        label: "Delivered",
        icon: CheckCircle2,
        className: "text-green-600",
    },
    shipped: {
        label: "Shipped",
        icon: Truck,
        className: "text-blue-600",
    },
    cancelled: {
        label: "Cancelled",
        icon: XCircle,
        className: "text-red-500",
    },
}

export default function OrderHistoryPage() {
    const [statusFilter, setStatusFilter] = useState("all")
    const [dateFilter, setDateFilter] = useState("30days")
    const [ordersData, setOrdersData] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await orderApi.getMyOrders();
                setOrdersData(res.data.map((o: any) => ({
                    id: o.id?.toString() || "",
                    orderNumber: o.orderCode || "#LTR-???",
                    orderDate: o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : "",
                    total: (o.totalAmount || 0) + "đ",
                    status: (o.status || 'processing').toLowerCase() as OrderStatus,
                    product: {
                        name: o.items && o.items.length > 0 ? o.items[0].product?.name : 'Sản phẩm',
                        condition: '',
                        image: o.items && o.items.length > 0 ? o.items[0].product?.imageUrl : '/placeholder.svg',
                        tags: []
                    }
                })));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="text-xl font-bold tracking-tight">
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
                            <div className="hidden md:flex items-center bg-white/10 rounded-lg px-3 py-2">
                                <Search className="h-4 w-4 text-white/60" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm đơn hàng..."
                                    className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/60 ml-2 w-40"
                                />
                            </div>
                            <button className="p-2 hover:bg-white/10 rounded-lg">
                                <ShoppingCart className="h-5 w-5" />
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded-lg">
                                <User className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 shrink-0">
                        <div className="bg-primary text-primary-foreground rounded-t-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20">
                                    <img
                                        src="/placeholder.svg?height=48&width=48"
                                        alt="Avatar"
                                        className="w-12 h-12 object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Tài khoản của tôi</h3>
                                    <p className="text-sm text-white/70">Quản lý thông tin cá nhân</p>
                                </div>
                            </div>
                        </div>

                        <nav className="bg-card border border-t-0 rounded-b-xl">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                                        item.active
                                            ? "bg-primary text-primary-foreground"
                                            : "text-foreground hover:bg-muted"
                                    }`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-primary">Lịch sử đơn hàng</h1>
                                <p className="text-muted-foreground mt-1">
                                    Theo dõi và quản lý các đơn hàng đã đặt của bạn.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button variant="outline" className="gap-2">
                                    Tất cả trạng thái
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    30 ngày gần nhất
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Orders List */}
                        <div className="space-y-4">
                            {loading && <div className="p-4 bg-blue-50 text-blue-600 rounded-lg">Đang tải dữ liệu...</div>}
                            {!loading && ordersData.length === 0 && <div className="p-4 bg-muted text-muted-foreground rounded-lg">Bạn chưa có đơn hàng nào.</div>}
                            {ordersData.map((order) => {
                                const status = statusConfig[order.status]
                                const StatusIcon = status.icon

                                return (
                                    <div key={order.id} className="bg-card border rounded-xl p-6">
                                        {/* Order Header */}
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">MÃ ĐƠN HÀNG</span>
                                                    <p className="font-semibold text-primary">{order.orderNumber}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">NGÀY ĐẶT</span>
                                                    <p className="font-medium">{order.orderDate}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">TỔNG TIỀN</span>
                                                    <p className="font-semibold text-primary">{order.total}</p>
                                                </div>
                                            </div>

                                            <div className={`flex items-center gap-2 ${status.className}`}>
                                                <StatusIcon className="h-5 w-5" />
                                                <span className="font-medium">{status.label}</span>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden shrink-0">
                                                <img
                                                    src={order.product.image}
                                                    alt={order.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground mb-1">
                                                    {order.product.name}
                                                </h3>
                                                {order.product.condition && (
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {order.product.condition}
                                                    </p>
                                                )}
                                                {order.product.deliveryDate && (
                                                    <p className="text-sm text-primary mb-2">
                                                        Dự kiến giao hàng: {order.product.deliveryDate}
                                                    </p>
                                                )}
                                                {order.product.cancelReason && (
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {order.product.cancelReason}
                                                    </p>
                                                )}
                                                {order.product.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {order.product.tags.map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className={`text-xs font-medium px-2 py-1 rounded ${
                                                                    tag.color === "orange"
                                                                        ? "bg-orange-100 text-orange-600"
                                                                        : tag.color === "green"
                                                                            ? "bg-green-100 text-green-600"
                                                                            : "bg-blue-100 text-blue-600"
                                                                }`}
                                                            >
                                {tag.label}
                              </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2 sm:items-end">
                                                {order.status === "processing" && (
                                                    <>
                                                        <span className="text-sm text-primary font-medium">Xem chi tiết</span>
                                                        <Button variant="outline" size="sm">
                                                            Mua lại
                                                        </Button>
                                                    </>
                                                )}
                                                {order.status === "delivered" && (
                                                    <>
                                                        <span className="text-sm text-primary font-medium">Viết đánh giá</span>
                                                        <Button variant="outline" size="sm">
                                                            Mua lại
                                                        </Button>
                                                    </>
                                                )}
                                                {order.status === "shipped" && (
                                                    <>
                                                        <Button size="sm" className="bg-primary">
                                                            Theo dõi
                                                        </Button>
                                                        <span className="text-sm text-primary font-medium">Xem chi tiết</span>
                                                    </>
                                                )}
                                                {order.status === "cancelled" && (
                                                    <Button variant="outline" size="sm">
                                                        Mua lại
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-primary text-primary-foreground mt-12">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-1">
                            <h3 className="text-xl font-bold mb-4">LAPTOPRE</h3>
                            <p className="text-sm text-white/70 leading-relaxed">
                                Hệ thống phân phối laptop cũ, laptop refurbished chuyên nghiệp với quy trình kiểm
                                soát chất lượng khắt khe nhất.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Dịch vụ</h4>
                            <ul className="space-y-2 text-sm text-white/70">
                                <li>
                                    <Link to="#" className="hover:text-white">
                                        Chính sách bảo hành
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="hover:text-white">
                                        Quy trình kiểm định
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="hover:text-white">
                                        Hướng dẫn thanh toán
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="hover:text-white">
                                        Liên hệ hỗ trợ
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Kết nối với chúng tôi</h4>
                            <div className="flex items-center gap-4">
                                <button className="p-2 hover:bg-white/10 rounded-lg">
                                    <FileText className="h-5 w-5" />
                                </button>
                                <button className="p-2 hover:bg-white/10 rounded-lg">
                                    <FileText className="h-5 w-5" />
                                </button>
                                <button className="p-2 hover:bg-white/10 rounded-lg">
                                    <Globe className="h-5 w-5" />
                                </button>
                                <button className="p-2 hover:bg-white/10 rounded-lg">
                                    <Mail className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Bản tin công nghệ</h4>
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    placeholder="Email của bạn"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                />
                                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                    Đăng ký
                                </Button>
                            </div>
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
