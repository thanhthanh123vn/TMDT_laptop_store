"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { authApi } from "../api/authApi"
import { Mail, Lock, ShoppingCart, User, ArrowLeft } from "lucide-react"
import { getErrorMessage } from "../utils/errorUtils";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);
        try {
            await authApi.forgotPassword({ email });
            setSuccess(true);
        } catch (err: any) {
            setError(getErrorMessage(err, "Gửi yêu cầu thất bại. Vui lòng thử lại."));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-muted">
            {/* Header */}
            <header className="bg-background border-b border-border">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold text-primary">
                        LAPTOPRE
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-sm text-foreground hover:text-primary transition-colors">
                            Trang chủ
                        </Link>
                        <Link to="/about" className="text-sm text-foreground hover:text-primary transition-colors">
                            Giới thiệu
                        </Link>
                        <Link to="/policy" className="text-sm text-foreground hover:text-primary transition-colors">
                            Chính sách
                        </Link>
                        <Link to="/faq" className="text-sm text-foreground hover:text-primary transition-colors">
                            FAQ
                        </Link>
                        <Link to="/contact" className="text-sm text-foreground hover:text-primary transition-colors">
                            Liên hệ
                        </Link>
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <button className="text-foreground hover:text-primary transition-colors">
                            <ShoppingCart className="h-5 w-5" />
                        </button>
                        <button className="text-foreground hover:text-primary transition-colors">
                            <User className="h-5 w-5" />
                        </button>
                        <Link to="/">
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                                Đăng nhập
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                {/* Lock Icon */}
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-8">
                    <Lock className="h-10 w-10 text-primary-foreground" />
                </div>

                {/* Card */}
                <div className="w-full max-w-md bg-background rounded-lg border border-border shadow-sm p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-primary mb-3">Quên mật khẩu?</h1>
                        <p className="text-muted-foreground text-sm">
                            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>}
                        {success && <div className="p-3 bg-green-100 text-green-600 rounded-lg text-sm">Hướng dẫn đã được gửi đến email của bạn.</div>}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Email của bạn
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="example@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-12 bg-muted border-border"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium disabled:opacity-50"
                        >
                            {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
                        </Button>
                    </form>

                    <div className="my-6 border-t border-border" />

                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại trang Đăng nhập
                    </Link>
                </div>

                {/* Help Link */}
                <p className="mt-6 text-sm text-muted-foreground">
                    Cần hỗ trợ?{" "}
                    <Link to="/support" className="text-primary hover:underline font-medium">
                        Liên hệ trung tâm trợ giúp
                    </Link>
                </p>
            </main>

            {/* Footer */}
            <footer className="bg-primary text-primary-foreground py-10">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-xl font-bold mb-6">LAPTOPRE</h2>

                    <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-6">
                        <Link to="/terms" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                            Điều khoản sử dụng
                        </Link>
                        <Link to="/warranty" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                            Chính sách bảo hành
                        </Link>
                        <Link to="/process" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                            Quy trình kiểm định
                        </Link>
                        <Link to="/about" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                            Về chúng tôi
                        </Link>
                        <Link to="/support" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                            Trung tâm hỗ trợ
                        </Link>
                    </nav>

                    <p className="text-sm text-primary-foreground/60">
                        © 2024 LAPTOPRE. Chuyên gia laptop cũ chính hãng.
                    </p>
                </div>
            </footer>
        </div>
    )
}
