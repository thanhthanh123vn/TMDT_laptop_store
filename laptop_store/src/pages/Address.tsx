"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { addressApi } from "../api/addressApi"
import { userApi } from "../api/userApi"
import {
    LayoutDashboard,
    UserPen,
    KeyRound,
    MapPin,
    Bell,
    Package,
    Heart,
    User,
    Plus,
    Pencil,
    Trash2,
    MapPinPlus,
    Info,
    CheckCircle2,
    X,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// --- Định nghĩa Interfaces cho API Tỉnh Thành ---
interface APIWard { code: string; name: string; }
interface APIDistrict { code: string; name: string; wards: APIWard[]; }
interface APIProvince { code: string; name: string; districts: APIDistrict[]; }

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
    const [userProfile, setUserProfile] = useState<{ fullName: string; avatarUrl: string }>({ fullName: "Tài khoản của tôi", avatarUrl: "" })

    // --- State quản lý dữ liệu cây Tỉnh Thành từ API ngoài ---
    const [apiProvinces, setApiProvinces] = useState<APIProvince[]>([]);
    const [apiDistricts, setApiDistricts] = useState<APIDistrict[]>([]);
    const [apiWards, setApiWards] = useState<APIWard[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formFullName, setFormFullName] = useState("");
    const [formPhone, setFormPhone] = useState("");
    const [formProvince, setFormProvince] = useState("");
    const [formDistrict, setFormDistrict] = useState("");
    const [formWard, setFormWard] = useState("");
    const [formStreet, setFormStreet] = useState("");
    const [formType, setFormType] = useState<"HOME" | "OFFICE">("HOME");
    const [formIsDefault, setFormIsDefault] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Fetch dữ liệu tỉnh thành 1 lần duy nhất từ API công cộng khi mở trang
    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/?depth=3")
            .then((res) => res.json())
            .then((data: APIProvince[]) => setApiProvinces(data))
            .catch((err) => console.error("Không thể tải danh sách tỉnh thành", err));
    }, []);

    // Xử lý logic thay đổi Tỉnh / Thành phố
    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceName = e.target.value;
        setFormProvince(provinceName);

        // Reset dữ liệu cấp dưới
        setFormDistrict("");
        setFormWard("");
        setApiWards([]);

        const selectedProv = apiProvinces.find((p) => p.name === provinceName);
        setApiDistricts(selectedProv ? selectedProv.districts : []);
    };

    // Xử lý logic thay đổi Quận / Huyện
    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const districtName = e.target.value;
        setFormDistrict(districtName);

        // Reset dữ liệu cấp xã
        setFormWard("");

        const selectedDist = apiDistricts.find((d) => d.name === districtName);
        setApiWards(selectedDist ? selectedDist.wards : []);
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addressApi.addAddress({
                fullName: formFullName,
                phone: formPhone,
                province: formProvince,
                district: formDistrict,
                ward: formWard,
                streetAddress: formStreet,
                isDefault: formIsDefault,
                addressType: formType,
            });
            setIsModalOpen(false);
            // Reset form
            setFormFullName("");
            setFormPhone("");
            setFormProvince("");
            setFormDistrict("");
            setFormWard("");
            setFormStreet("");
            setFormType("HOME");
            setFormIsDefault(false);
            setApiDistricts([]);
            setApiWards([]);
            // Re-fetch addresses
            fetchAddresses();
        } catch (err) {
            console.error("Error adding address:", err);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
        fetchProfile();
    }, []);

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
        <div className="min-h-[calc(100vh-160px)] bg-transparent flex flex-col justify-center">
            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Sidebar bên trái */}
                    <aside className="w-full lg:w-64 shrink-0">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            {/* User Info */}
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
                                    <h3 className="font-semibold text-gray-900 text-sm truncate">{userProfile.fullName}</h3>
                                    <p className="text-xs text-muted-foreground">Quản lý cá nhân</p>
                                </div>
                            </div>

                            {/* Menu */}
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
                                        <item.icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{item.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Content bên phải */}
                    <div className="flex-1 w-full">
                        {/* Header Content */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Danh sách địa chỉ</h1>
                                <p className="text-muted-foreground text-sm mt-0.5">
                                    Thêm hoặc quản lý các địa chỉ nhận hàng của bạn để thanh toán nhanh chóng hơn.
                                </p>
                            </div>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl h-11 px-5 shadow-sm font-medium w-full sm:w-auto"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm địa chỉ mới
                            </Button>
                        </div>

                        {/* Address Cards */}
                        <div className="space-y-4">
                            {loading && (
                                <div className="p-4 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-sm font-medium">
                                    Đang tải dữ liệu địa chỉ...
                                </div>
                            )}

                            {!loading && addresses.length === 0 && (
                                <div className="p-8 bg-white border border-gray-100 rounded-2xl text-center text-muted-foreground text-sm shadow-sm">
                                    Bạn chưa tạo địa chỉ giao hàng nào.
                                </div>
                            )}

                            {addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-gray-200/80 transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                                        <div className="flex-1">
                                            {/* Name and Badge */}
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-gray-900 text-base">{address.name}</h3>
                                                {address.isDefault && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[11px] font-semibold bg-green-50 text-green-600 border border-green-100">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Mặc định
                                                    </span>
                                                )}
                                            </div>

                                            {/* Phone */}
                                            <p className="text-gray-600 text-sm font-medium mb-2">{address.phone}</p>

                                            {/* Address */}
                                            <p className="text-gray-800 text-sm leading-relaxed mb-0.5">{address.address}</p>
                                            <p className="text-gray-800 text-sm font-medium mb-3">{address.city}</p>

                                            {/* Type Tag */}
                                            <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-gray-50 border border-gray-100 rounded-lg text-gray-500">
                                                {address.type === "home" ? "Nhà riêng" : "Văn phòng"}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                                            <button className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline transition-colors">
                                                <Pencil className="w-3.5 h-3.5" />
                                                Chỉnh sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(address.id)}
                                                className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Xóa
                                            </button>
                                            {!address.isDefault && (
                                                <button
                                                    onClick={() => handleSetDefault(address.id)}
                                                    className="sm:mt-2 px-3 py-1.5 text-xs font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                                                >
                                                    Đặt làm mặc định
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Add New Address Card */}
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-gray-50/50 transition-colors group"
                            >
                                <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <MapPinPlus className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                                </div>
                                <span className="text-sm font-medium text-gray-500 group-hover:text-gray-800 transition-colors">
                                    Thêm địa chỉ giao hàng mới
                                </span>
                            </button>

                            {/* Privacy Notice */}
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 sm:p-5">
                                <div className="flex gap-3">
                                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-sm mb-0.5">Cam kết bảo mật thông tin</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Thông tin địa chỉ và số điện thoại của bạn hoàn toàn được mã hóa bảo mật. Hệ thống chỉ cung cấp thông tin này cho đơn vị vận chuyển khi đơn hàng của bạn được xác nhận gửi đi.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Thêm / Sửa Địa Chỉ Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <MapPinPlus className="w-5 h-5 text-primary" />
                                Thêm địa chỉ nhận hàng
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <form onSubmit={handleAddAddress}>
                            <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-700">Họ và tên người nhận</label>
                                        <input
                                            type="text"
                                            required
                                            value={formFullName}
                                            onChange={(e) => setFormFullName(e.target.value)}
                                            placeholder="Ví dụ: Nguyễn Văn A"
                                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-700">Số điện thoại</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formPhone}
                                            onChange={(e) => setFormPhone(e.target.value)}
                                            placeholder="Ví dụ: 09XXXXXXXX"
                                            className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                {/* --- ĐOẠN ĐÃ ĐƯỢC THAY THẾ SANG THẺ SELECT CASCADING ĐỒNG BỘ --- */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-700">Tỉnh / Thành phố</label>
                                        <select
                                            required
                                            value={formProvince}
                                            onChange={handleProvinceChange}
                                            className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                                        >
                                            <option value="">-- Chọn Tỉnh/Thành --</option>
                                            {apiProvinces.map((p) => (
                                                <option key={p.code} value={p.name}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-700">Quận / Huyện</label>
                                        <select
                                            required
                                            value={formDistrict}
                                            onChange={handleDistrictChange}
                                            disabled={!formProvince}
                                            className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                                        >
                                            <option value="">-- Chọn Quận/Huyện --</option>
                                            {apiDistricts.map((d) => (
                                                <option key={d.code} value={d.name}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-700">Phường / Xã</label>
                                        <select
                                            required
                                            value={formWard}
                                            onChange={(e) => setFormWard(e.target.value)}
                                            disabled={!formDistrict}
                                            className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                                        >
                                            <option value="">-- Chọn Phường/Xã --</option>
                                            {apiWards.map((w) => (
                                                <option key={w.code} value={w.name}>{w.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {/* ------------------------------------------------------------- */}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700">Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formStreet}
                                        onChange={(e) => setFormStreet(e.target.value)}
                                        placeholder="Số 12, Đường Hàn Thuyên"
                                        className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-700">Loại địa chỉ</label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setFormType("HOME")}
                                                className={`flex-1 h-11 rounded-xl border text-xs font-semibold transition-all ${
                                                    formType === "HOME"
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                                                }`}
                                            >
                                                Nhà riêng
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormType("OFFICE")}
                                                className={`flex-1 h-11 rounded-xl border text-xs font-semibold transition-all ${
                                                    formType === "OFFICE"
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                                                }`}
                                            >
                                                Văn phòng
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-6 sm:pt-7">
                                        <input
                                            type="checkbox"
                                            id="isDefault"
                                            checked={formIsDefault}
                                            onChange={(e) => setFormIsDefault(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                                        />
                                        <label htmlFor="isDefault" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
                                            Đặt làm địa chỉ mặc định
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-2.5 p-5 border-t border-gray-50 bg-gray-50/50">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 h-10 text-xs font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 h-10 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl disabled:opacity-50 shadow-sm transition-colors"
                                >
                                    {submitting ? "Đang lưu..." : "Lưu địa chỉ"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}