"use client"

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { orderApi } from "../api/orderApi";
import { userApi } from "../api/userApi";
import { Button } from "@/components/ui/button";
import { User, LayoutDashboard, UserPen, KeyRound, MapPin, Bell, ClipboardList, Heart } from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/account" },
  { icon: UserPen, label: "Chỉnh sửa hồ sơ", href: "/account/profile" },
  { icon: KeyRound, label: "Đổi mật khẩu", href: "/account/password" },
  { icon: MapPin, label: "Địa chỉ", href: "/account/address" },
  { icon: Bell, label: "Thông báo", href: "/account/notifications" },
  { icon: ClipboardList, label: "Lịch sử đơn hàng", href: "/account/orders", active: true },
  { icon: Heart, label: "Danh sách yêu thích", href: "/account/wishlist" },
];

type OrderStatus = "processing" | "delivered" | "shipped" | "cancelled";

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  total: string;
  status: OrderStatus;
  product: { id: string; name: string; condition: string; image: string; tags: { label: string; color: string }[] };
}

export default function OrderHistoryPage() {
  const [ordersData, setOrdersData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ fullName: string; avatarUrl: string }>({ fullName: "Tài khoản của tôi", avatarUrl: "" });
  const navigate = useNavigate();

  const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

  const mapApiOrder = (o: unknown): Order => {
    if (!isRecord(o)) return { id: "", orderNumber: "#LTR-???", orderDate: "", total: "0đ", status: "processing", product: { id: "", name: "Sản phẩm không tên", condition: "", image: "/placeholder.svg", tags: [] } };
    const rec = o as Record<string, unknown>;
    const id = String(rec.id ?? "");
    const orderNumber = String(rec.orderCode ?? rec.code ?? "#LTR-???");
    const orderDate = rec.createdAt ? new Date(String(rec.createdAt)).toLocaleDateString("vi-VN") : "";
    const total = (Number(rec.totalAmount ?? 0)).toLocaleString("vi-VN") + "đ";
    const status = (String(rec.status ?? "processing") as OrderStatus);
    const items = Array.isArray(rec.items) ? (rec.items as unknown[]) : [];
    const firstItem = items.length > 0 ? items[0] : null;
    const productRec = isRecord(firstItem) && isRecord((firstItem as Record<string, unknown>).product) ? (firstItem as Record<string, unknown>).product as Record<string, unknown> : null;
    const product = { id: productRec?.id ? String(productRec.id) : "", name: String(productRec?.name ?? "Sản phẩm không tên"), condition: "", image: String(productRec?.imageUrl ?? "/placeholder.svg"), tags: [] };
    return { id, orderNumber, orderDate, total, status, product };
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setFetchError(null);
      try {
        const res = await orderApi.getMyOrders();
        const arr = Array.isArray(res.data) ? res.data : [];
        setOrdersData(arr.map(mapApiOrder));
      } catch (err) {
        console.error(err);
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        setFetchError(e?.response?.data?.message || e?.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await userApi.getMyProfile();
        const user = res.data;
        const BASE_URL = "http://localhost:8080";
        setUserProfile({ fullName: user.fullName || "Tài khoản của tôi", avatarUrl: user.avatarUrl ? (String(user.avatarUrl).startsWith("http") ? String(user.avatarUrl) : BASE_URL + String(user.avatarUrl)) : "" });
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrders();
    fetchProfile();
  }, []);

  return (
    <div className="min-h-[calc(100vh-160px)] bg-transparent flex flex-col justify-center">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-gray-100">
                  {userProfile.avatarUrl ? <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <User className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="truncate">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{userProfile.fullName}</h3>
                  <p className="text-xs text-muted-foreground">Quản lý cá nhân</p>
                </div>
              </div>
              <nav className="space-y-1">{menuItems.map((item) => (<Link key={item.label} to={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.active ? "bg-primary text-primary-foreground shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}><item.icon className="h-4 w-4"/>{item.label}</Link>))}</nav>
            </div>
          </aside>

          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Theo dõi và quản lý các đơn hàng bạn đã đặt mua gần đây.</p>
              </div>
              <div className="flex items-center gap-2">{fetchError ? <div className="text-sm text-red-600 mr-2">Lỗi tải đơn hàng: {fetchError}</div> : null}<Button variant="outline" onClick={async () => { setLoading(true); setFetchError(null); try { const res = await orderApi.getMyOrders(); const arr = Array.isArray(res.data) ? res.data : []; setOrdersData(arr.map(mapApiOrder)); } catch (err) { const e = err as { response?: { data?: { message?: string } }; message?: string }; setFetchError(e?.response?.data?.message || e?.message || String(err)); } finally { setLoading(false); } }}>Làm mới</Button></div>
            </div>

            <div className="space-y-4">
              {loading && <div className="p-4 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-sm font-medium">Đang tải dữ liệu lịch sử đơn hàng...</div>}
              {!loading && ordersData.length === 0 && <div className="p-8 bg-white border border-gray-100 rounded-2xl text-center text-muted-foreground text-sm shadow-sm">Bạn chưa thực hiện đơn hàng nào trên hệ thống.</div>}
              {ordersData.map((order) => (
                <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 lg:p-6 shadow-sm hover:border-gray-200/80 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4 mb-4">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                      <div><span className="text-muted-foreground block mb-0.5 uppercase tracking-wider text-[10px]">Mã đơn hàng</span><p className="font-bold text-primary">{order.orderNumber}</p></div>
                      <div><span className="text-muted-foreground block mb-0.5 uppercase tracking-wider text-[10px]">Ngày đặt</span><p className="font-semibold text-gray-800">{order.orderDate}</p></div>
                      <div><span className="text-muted-foreground block mb-0.5 uppercase tracking-wider text-[10px]">Tổng thanh toán</span><p className="font-bold text-gray-900 text-sm">{order.total}</p></div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center p-1"><img src={order.product.image} alt={order.product.name} className="w-full h-full object-contain rounded-lg" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} /></div>
                    <div className="flex-1 min-w-0"><h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-relaxed">{order.product.name}</h3>{order.product.condition && <p className="text-xs text-muted-foreground mt-0.5">Tình trạng: {order.product.condition}</p>}</div>
                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">{order.status === 'processing' && (<><span onClick={() => navigate(`/product/${order.product.id}`)} className="text-xs text-primary font-semibold hover:underline cursor-pointer">Xem chi tiết</span><Button variant="outline" size="sm" onClick={() => navigate(`/product/${order.product.id}`)} className="rounded-xl border-gray-200 text-xs font-medium h-9 px-4 w-full sm:w-auto">Mua lại</Button></>)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}