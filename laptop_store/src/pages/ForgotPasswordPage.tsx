"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { authApi } from "../api/authApi"
import { Mail, Lock, ArrowLeft } from "lucide-react"
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

        <div className="min-h-[calc(100vh-160px)] flex flex-col justify-center bg-transparent">
            {/* Main Content */}
            <main className="w-full flex flex-col items-center justify-center px-4 py-12">

                {/* Icon Khóa */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary shadow-sm">
                    <Lock className="h-8 w-8" />
                </div>

                {/* Card Form */}
                <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h1>
                        <p className="text-muted-foreground text-sm">
                            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu nhanh chóng.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm">{error}</div>}
                        {success && <div className="p-3 bg-green-50 text-green-600 border border-green-100 rounded-xl text-sm">Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.</div>}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Email của bạn
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="email"
                                    placeholder="example@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-12 bg-muted/40 border-border rounded-xl focus-visible:ring-primary/20"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base rounded-xl disabled:opacity-50 transition-all shadow-sm"
                        >
                            {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
                        </Button>
                    </form>

                    <div className="my-6 border-t border-gray-100" />

                    {/* Sửa link dẫn về đúng trang /login */}
                    <Link
                        to="/login"
                        className="flex items-center justify-center gap-2 text-sm text-primary font-medium hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại trang Đăng nhập
                    </Link>
                </div>

                <p className="mt-6 text-sm text-muted-foreground">
                    Cần hỗ trợ?{" "}
                    <Link to="/support" className="text-primary hover:underline font-medium">
                        Liên hệ trung tâm trợ giúp
                    </Link>
                </p>
            </main>
        </div>
    )
}