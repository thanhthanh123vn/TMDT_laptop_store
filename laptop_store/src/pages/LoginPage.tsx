import React, { useState } from "react"
import { Eye, EyeOff, User, Lock, Phone, Mail, MapPin, Share2, MessageSquare, Shield, CheckCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { authApi } from "../api/authApi"
import { getErrorMessage } from "../utils/errorUtils";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("");
        setLoading(true);
        try {
            const response = await authApi.login({ email, password });
            if (response.data && response.data.token) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("refreshToken", response.data.refreshToken);
                navigate("/");
            } else {
                 navigate("/"); // fallback
            }
        } catch (err: any) {
            setError(getErrorMessage(err, "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Header */}
            <header className="border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold text-blue-600">
                        LAPTOPRE
                    </Link>
                    <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                        Quay lại Trang chủ
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-sm text-blue-700">
                            <CheckCircle className="w-4 h-4" />
                            <span>Chứng nhận Laptop Chính hãng</span>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                            Nâng tầm trải nghiệm công nghệ cùng <span className="text-blue-600">LAPTOPRE.</span>
                        </h1>

                        <p className="text-gray-600 text-lg">
                            Đăng nhập để xem lịch sử mua hàng, theo dõi bảo hành và nhận các ưu đãi dành riêng cho thành viên.
                        </p>

                        <div className="relative max-w-md">
                            {/* Thay next/image bằng img tiêu chuẩn */}
                            <img
                                src="/laptop-hero.jpg"
                                alt="Laptop chính hãng"
                                className="w-full h-auto object-contain rounded-lg shadow-md"
                            />
                        </div>
                    </div>

                    {/* Right Column - Login Form */}
                    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
                        <div className="space-y-2 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Đăng nhập</h2>
                            <p className="text-gray-500">Chào mừng bạn trở lại với LAPTOPRE</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email hoặc Số điện thoại
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="email"
                                        type="text"
                                        placeholder="username@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                        Mật khẩu
                                    </label>
                                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
                            >
                                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500 uppercase tracking-wider text-xs">Hoặc đăng nhập với</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                                <span className="text-sm font-medium">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook" />
                                <span className="text-sm font-medium">Facebook</span>
                            </button>
                        </div>

                        <p className="text-center text-sm text-gray-600 mt-8">
                            Chưa có tài khoản?{" "}
                            <Link to="/register" className="text-blue-600 font-bold hover:underline">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer tương tự như trên, thay các thẻ Link href thành Link to */}
            <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
                <div className="container mx-auto px-4 py-8">
                    <p className="text-center text-gray-500 text-sm">© 2024 LAPTOPRE. Chuyên gia laptop cũ chính hãng.</p>
                </div>
            </footer>
        </div>
    )
}