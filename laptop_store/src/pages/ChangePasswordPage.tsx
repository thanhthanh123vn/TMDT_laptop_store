"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  LayoutDashboard,
  UserPen,
  KeyRound,
  MapPin,
  Bell,
  ClipboardList,
  Heart,
  User,
  Eye,
  EyeOff,
  Shield,
  XCircle,
  CheckCircle2,
  Circle,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { userApi } from "../api/userApi"
import { getErrorMessage } from "../utils/errorUtils"

const menuItems = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/account" },
  { icon: UserPen, label: "Chỉnh sửa hồ sơ", href: "/account/profile" },
  { icon: KeyRound, label: "Đổi mật khẩu", href: "/account/password", active: true },
  { icon: MapPin, label: "Địa chỉ", href: "/account/address" },
  { icon: Bell, label: "Thông báo", href: "/account/notifications" },
  { icon: ClipboardList, label: "Lịch sử đơn hàng", href: "/account/orders" },
  { icon: Heart, label: "Danh sách yêu thích", href: "/account/wishlist" },
]

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [userProfile, setUserProfile] = useState<{ fullName: string; avatarUrl: string }>({ fullName: "Tài khoản của tôi", avatarUrl: "" })

  useEffect(() => {
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
    fetchProfile();
  }, []);

  // Password validation
  const hasMinLength = newPassword.length >= 8
  const hasSpecialChar = /[!@#$%^&*]/.test(newPassword)
  const hasNumberAndUppercase = /[0-9]/.test(newPassword) && /[A-Z]/.test(newPassword)
  const isNotSameAsOld = newPassword !== currentPassword && newPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.")
      return
    }

    if (!hasMinLength || !hasSpecialChar || !hasNumberAndUppercase) {
      setError("Mật khẩu không đạt yêu cầu bảo mật.")
      return
    }

    setLoading(true)
    try {
      const res = await userApi.changePassword({ oldPassword: currentPassword, newPassword })
      setSuccess(res.data.message || "Đổi mật khẩu thành công!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError(getErrorMessage(err, "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại."))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess("")
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
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{userProfile.fullName}</h3>
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
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Form đổi mật khẩu chính */}
            <div className="flex-1 w-full">
              <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Đổi mật khẩu</h1>
                <p className="text-muted-foreground text-sm mb-8">
                  Đảm bảo tài khoản của bạn luôn được an toàn bằng cách thiết lập một mật khẩu mạnh.
                </p>

                {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">{error}</div>}
                {success && <div className="p-4 mb-6 bg-green-50 text-green-600 rounded-xl border border-green-100 text-sm">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
                  {/* Mật khẩu hiện tại */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <Input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="h-12 pr-12 bg-muted/40 border-gray-200 rounded-xl focus-visible:ring-primary/20"
                          placeholder="Nhập mật khẩu hiện tại"
                          required
                      />
                      <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Mật khẩu mới */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
                    <div className="relative">
                      <Input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-12 pr-12 bg-muted/40 border-gray-200 rounded-xl focus-visible:ring-primary/20"
                          placeholder="Nhập mật khẩu mới"
                          required
                      />
                      <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Xác nhận mật khẩu */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                    <div className="relative">
                      <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-12 pr-12 bg-muted/40 border-gray-200 rounded-xl focus-visible:ring-primary/20"
                          placeholder="Nhập lại mật khẩu mới"
                          required
                      />
                      <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Nút tác vụ */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-11 rounded-xl font-medium shadow-sm"
                    >
                      {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="border-gray-200 text-gray-600 hover:bg-gray-50 px-6 h-11 rounded-xl font-medium"
                    >
                      Hủy bỏ
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar kiểm tra điều kiện bảo mật bên phải */}
            <aside className="w-full lg:w-80 shrink-0 space-y-6">
              {/* Yêu cầu bảo mật */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-50">
                  <Shield className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-gray-900 text-sm">Yêu cầu bảo mật</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    {hasMinLength ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Độ dài tối thiểu</p>
                      <p className="text-[11px] text-muted-foreground">Mật khẩu phải có ít nhất 8 ký tự.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    {hasSpecialChar ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                        <Circle className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Ký tự đặc biệt</p>
                      <p className="text-[11px] text-muted-foreground">Bao gồm ít nhất một ký tự (!@#$%^&*).</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    {hasNumberAndUppercase ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                        <Circle className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Số và chữ hoa</p>
                      <p className="text-[11px] text-muted-foreground">Sử dụng kết hợp chữ số và chữ viết hoa (A-Z).</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    {isNotSameAsOld ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                        <Circle className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Không trùng mật khẩu cũ</p>
                      <p className="text-[11px] text-muted-foreground">Mật khẩu mới phải khác mật khẩu hiện tại.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Khuyên dùng 2FA */}
              <div className="bg-primary rounded-2xl p-6 text-primary-foreground relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 translate-x-1/2" />

                <h3 className="text-base font-bold mb-2 relative z-10">Bảo mật đa lớp</h3>
                <p className="text-xs text-primary-foreground/80 mb-4 relative z-10 leading-relaxed">
                  Kích hoạt bảo mật 2 yếu tố (2FA) để nhận mã OTP qua thiết bị di động khi đăng nhập tài khoản.
                </p>
                <Link
                    to="/account/2fa"
                    className="inline-flex items-center text-xs font-semibold text-white hover:underline relative z-10"
                >
                  Tìm hiểu về 2FA
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>

              {/* Tình trạng tài khoản */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 text-xs mb-3 uppercase tracking-wider">Tình trạng bảo mật</h3>
                <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-xl border border-green-100">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã xác minh Email
                </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-xl border border-amber-100">
                  <XCircle className="w-3.5 h-3.5" />
                  Chưa bật 2FA
                </span>
                </div>
              </div>
            </aside>

          </div>
        </main>
      </div>
  )
}