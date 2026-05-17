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
  ShoppingCart,
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold text-primary">
              LAPTOPRE
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sản phẩm
              </Link>
              <Link to="/promotions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Khuyến mãi
              </Link>
              <Link to="/news" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Tin công nghệ
              </Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Về chúng tôi
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link to="/cart" className="p-2 hover:bg-muted rounded-full transition-colors">
                <ShoppingCart className="w-5 h-5 text-foreground" />
              </Link>
              <Link to="/account" className="p-2 hover:bg-muted rounded-full transition-colors">
                <User className="w-5 h-5 text-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 shrink-0">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {userProfile.avatarUrl ? (
                      <img
                        src={userProfile.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{userProfile.fullName}</h3>
                    <p className="text-sm text-muted-foreground">Quản lý thông tin cá nhân</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        item.active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Form */}
            <div className="flex-1">
              <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm">
                <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-2">Đổi mật khẩu</h1>
                <p className="text-muted-foreground mb-8">
                  Đảm bảo tài khoản của bạn luôn được bảo mật bằng mật khẩu mạnh.
                </p>

                {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">{error}</div>}
                {success && <div className="p-4 mb-6 bg-green-50 text-green-600 rounded-xl border border-green-100 text-sm">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Mật khẩu hiện tại</label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="h-12 pr-12 bg-muted/50 border-border"
                        placeholder="Nhập mật khẩu hiện tại"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Mật khẩu mới</label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-12 pr-12 bg-muted/50 border-border"
                        placeholder="Nhập mật khẩu mới"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Xác nhận mật khẩu mới</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 pr-12 bg-muted/50 border-border"
                        placeholder="Nhập lại mật khẩu mới"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-4">
                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12"
                    >
                      {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="border-border text-foreground hover:bg-muted px-8 h-12"
                    >
                      Hủy bỏ
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="w-full lg:w-80 shrink-0 space-y-6">
              {/* Password Requirements */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Yêu cầu bảo mật</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    {hasMinLength ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">Độ dài tối thiểu</p>
                      <p className="text-xs text-muted-foreground">Mật khẩu phải có ít nhất 8 ký tự.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    {hasSpecialChar ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">Ký tự đặc biệt</p>
                      <p className="text-xs text-muted-foreground">{"Bao gồm ít nhất một ký tự (!@#$%^&*)."}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    {hasNumberAndUppercase ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">Số và chữ hoa</p>
                      <p className="text-xs text-muted-foreground">Sử dụng hỗn hợp các chữ số và chữ cái viết hoa.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    {isNotSameAsOld ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">Không trùng mật khẩu cũ</p>
                      <p className="text-xs text-muted-foreground">Mật khẩu mới phải khác mật khẩu hiện tại.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2FA Promotion */}
              <div className="bg-primary rounded-xl p-6 text-primary-foreground relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 translate-x-1/2" />
                
                <h3 className="text-lg font-bold mb-2 relative z-10">Bảo mật đa lớp</h3>
                <p className="text-sm text-primary-foreground/80 mb-4 relative z-10">
                  Chúng tôi khuyến khích bạn kích hoạt xác thực 2 yếu tố (2FA) để tăng cường bảo vệ tối đa cho tài khoản LAPTOPRE của mình.
                </p>
                <Link 
                  to="/account/2fa" 
                  className="inline-flex items-center text-sm font-medium text-primary-foreground hover:underline relative z-10"
                >
                  Tìm hiểu thêm về 2FA
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              {/* Security Status */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-4">Tình trạng bảo mật</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 text-sm font-medium rounded-full border border-green-200">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã xác minh Email
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 text-sm font-medium rounded-full border border-amber-200">
                    <XCircle className="w-4 h-4" />
                    Chưa bật 2FA
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link to="/" className="text-xl font-bold">
              LAPTOPRE
            </Link>

            <nav className="flex flex-wrap items-center justify-center gap-6">
              <Link to="/warranty" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Chính sách bảo hành
              </Link>
              <Link to="/inspection" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Quy trình kiểm định
              </Link>
              <Link to="/payment" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Hướng dẫn thanh toán
              </Link>
              <Link to="/support" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Liên hệ hỗ trợ
              </Link>
            </nav>
          </div>

          <div className="border-t border-primary-foreground/20 mt-6 pt-6 text-center">
            <p className="text-sm text-primary-foreground/60">
              © 2024 LAPTOPRE. Certified Refurbished Excellence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
