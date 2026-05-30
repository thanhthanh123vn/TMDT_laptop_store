"use client"

import {useState, useEffect} from "react"
import {Link, useNavigate} from "react-router-dom"
import {orderApi} from "../api/orderApi"
import {userApi} from "../api/userApi"
import {
    LayoutDashboard,
    UserPen,
    KeyRound,
    MapPin,
    Bell,
    ClipboardList,
    Heart,
    User,
    ChevronDown,
    RotateCcw,
    CheckCircle2,
    Truck,
    XCircle,
} from "lucide-react"
import {Button} from "@/components/ui/button"

const menuItems = [
    {icon: LayoutDashboard, label: "Tổng quan", href: "/account"},
    {icon: UserPen, label: "Chỉnh sửa hồ sơ", href: "/account/profile"},
    {icon: KeyRound, label: "Đổi mật khẩu", href: "/account/password"},
    {icon: MapPin, label: "Địa chỉ", href: "/account/address"},
    {icon: Bell, label: "Thông báo", href: "/account/notifications"},
    {icon: ClipboardList, label: "Lịch sử đơn hàng", href: "/account/orders", active: true},
    {icon: Heart, label: "Danh sách yêu thích", href: "/account/wishlist"},
]

type OrderStatus = "processing" | "delivered" | "shipped" | "cancelled"

interface Order {
    id: string
    orderNumber: string
    orderDate: string
    total: string
    status: OrderStatus
    product: {
        id:string
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
        label: "Đang xử lý",
        icon: RotateCcw,
        className: "text-amber-600 bg-amber-50 border-amber-100",
    },
    delivered: {
        label: "Đã giao hàng",
        icon: CheckCircle2,
        className: "text-green-600 bg-green-50 border-green-100",
    },
    shipped: {
        label: "Đang vận chuyển",
        icon: Truck,
        className: "text-blue-600 bg-blue-50 border-blue-100",
    },
    cancelled: {
        label: "Đã hủy đơn",
        icon: XCircle,
        className: "text-red-500 bg-red-50 border-red-100",
    },
}

export default function OrderHistoryPage() {
    const [ordersData, setOrdersData] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [userProfile, setUserProfile] = useState<{
        fullName: string;
        avatarUrl: string
    }>({fullName: "Tài khoản của tôi", avatarUrl: ""})
    const navigate = useNavigate();
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await orderApi.getMyOrders();
                console.log(res);
                setOrdersData(res.data.map((o: any) => ({
                    id: o.id?.toString() || "",
                    orderNumber: o.orderCode || "#LTR-???",
                    orderDate: o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : "",
                    total: (o.totalAmount || 0).toLocaleString('vi-VN') + "đ",
                    status: (o.status || 'processing').toLowerCase() as OrderStatus,
                    product: {
                        id:o.items[0].product?.id,
                        name: o.items && o.items.length > 0 ? o.items[0].product?.name : 'Sản phẩm không tên',
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

        fetchOrders();
        fetchProfile();
    }, []);

    return (
        <div className="min-h-[calc(100vh-160px)] bg-transparent flex flex-col justify-center">
            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 shrink-0">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            {/* User Info */}
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                                <div
                                    className="relative w-11 h-11 rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-gray-100">
                                    {userProfile.avatarUrl ? (
                                        <img
                                            src={userProfile.avatarUrl}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-5 w-5 text-muted-foreground"/>
                                    )}
                                </div>
                                <div className="truncate">
                                    <h3 className="font-semibold text-gray-900 text-sm truncate">{userProfile.fullName}</h3>
                                    <p className="text-xs text-muted-foreground">Quản lý cá nhân</p>
                                </div>
                            </div>

                            {/* Navigation List */}
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
                                        <item.icon className="h-4 w-4"/>
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
                                <p className="text-muted-foreground text-sm mt-0.5">
                                    Theo dõi và quản lý các đơn hàng bạn đã đặt mua gần đây.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline"
                                        className="gap-2 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 text-xs">
                                    Tất cả trạng thái
                                    <ChevronDown className="h-4 w-4 text-gray-400"/>
                                </Button>
                                <Button variant="outline"
                                        className="gap-2 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 text-xs">
                                    30 ngày gần nhất
                                    <ChevronDown className="h-4 w-4 text-gray-400"/>
                                </Button>
                            </div>
                        </div>

                        {/* Orders List */}
                        <div className="space-y-4">
                            {loading && (
                                <div
                                    className="p-4 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-sm font-medium">
                                    Đang tải dữ liệu lịch sử đơn hàng...
                                </div>
                            )}

                            {!loading && ordersData.length === 0 && (
                                <div
                                    className="p-8 bg-white border border-gray-100 rounded-2xl text-center text-muted-foreground text-sm shadow-sm">
                                    Bạn chưa thực hiện đơn hàng nào trên hệ thống.
                                </div>
                            )}

                            {ordersData.map((order) => {
                                const status = statusConfig[order.status] || statusConfig["processing"]
                                const StatusIcon = status.icon

                                return (
                                    <div key={order.id}
                                         className="bg-white border border-gray-100 rounded-2xl p-5 lg:p-6 shadow-sm hover:border-gray-200/80 transition-all">
                                        {/* Order Header */}
                                        <div
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4 mb-4">
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                                                <div>
                                                    <span
                                                        className="text-muted-foreground block mb-0.5 uppercase tracking-wider text-[10px]">Mã đơn hàng</span>
                                                    <p className="font-bold text-primary">{order.orderNumber}</p>
                                                </div>
                                                <div>
                                                    <span
                                                        className="text-muted-foreground block mb-0.5 uppercase tracking-wider text-[10px]">Ngày đặt</span>
                                                    <p className="font-semibold text-gray-800">{order.orderDate}</p>
                                                </div>
                                                <div>
                                                    <span
                                                        className="text-muted-foreground block mb-0.5 uppercase tracking-wider text-[10px]">Tổng thanh toán</span>
                                                    <p className="font-bold text-gray-900 text-sm">{order.total}</p>
                                                </div>
                                            </div>

                                            <div
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${status.className} h-fit self-start sm:self-center`}>
                                                <StatusIcon className="h-3.5 w-3.5"/>
                                                <span>{status.label}</span>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                            <div
                                                className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center p-1">
                                                <img
                                                    src={order.product.image}
                                                    alt={order.product.name}
                                                    className="w-full h-full object-contain rounded-lg"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                                                    }}
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-relaxed">
                                                    {order.product.name}
                                                </h3>
                                                {order.product.condition && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        Tình trạng: {order.product.condition}
                                                    </p>
                                                )}
                                                {order.product.deliveryDate && (
                                                    <p className="text-xs text-primary font-medium mt-1">
                                                        Dự kiến giao: {order.product.deliveryDate}
                                                    </p>
                                                )}
                                                {order.product.cancelReason && (
                                                    <p className="text-xs text-red-500 font-medium mt-1">
                                                        Lý do hủy: {order.product.cancelReason}
                                                    </p>
                                                )}
                                            </div>

                                            <div
                                                className="flex sm:flex-col gap-2 w-full sm:w-auto sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                                                {order.status === "processing" && (
                                                    <>
                                                          <span
                                                              onClick={() => navigate(`/product/${order.product.id}`)}
                                                              className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                                                          >
            Xem chi tiết
        </span>
                                                        <Button variant="outline" size="sm"
                                                                onClick={() => navigate(`/product/${order.product.id}`)}
                                                                className="rounded-xl border-gray-200 text-xs font-medium h-9 px-4 w-full sm:w-auto">
                                                            Mua lại
                                                        </Button>
                                                    </>
                                                )}
                                                {order.status === "delivered" && (
                                                    <>
                                                        <span
                                                            className="text-xs text-primary font-semibold hover:underline cursor-pointer">Viết đánh giá</span>
                                                        <Button variant="outline" size="sm"
                                                                className="rounded-xl border-gray-200 text-xs font-medium h-9 px-4 w-full sm:w-auto">
                                                            Mua lại
                                                        </Button>
                                                    </>
                                                )}
                                                {order.status === "shipped" && (
                                                    <>
                                                        <Button size="sm"
                                                                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium h-9 px-4 rounded-xl w-full sm:w-auto shadow-sm">
                                                            Theo dõi
                                                        </Button>
                                                        <span
                                                            className="text-xs text-primary font-semibold hover:underline cursor-pointer sm:mt-1">Chi tiết</span>
                                                    </>
                                                )}
                                                {order.status === "cancelled" && (
                                                    <Button variant="outline" size="sm"
                                                            className="rounded-xl border-gray-200 text-xs font-medium h-9 px-4 w-full sm:w-auto">
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
        </div>
    )
}