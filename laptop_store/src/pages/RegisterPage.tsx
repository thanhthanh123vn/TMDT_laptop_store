"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { Eye, EyeOff, User, Mail, Phone, Lock, RefreshCw, CheckCircle, Shield } from "lucide-react";
import { getErrorMessage } from "../utils/errorUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState(1); // 1: Register, 2: OTP
    const [otp, setOtp] = useState("");
    
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            await authApi.register({ email, password, fullName: name });
            setStep(2);
        } catch (err: any) {
            setError(getErrorMessage(err, "Đăng ký thất bại. Vui lòng thử lại."));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await authApi.verifyRegisterOtp({ email, otp });
            setSuccess(true);
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err: any) {
            setError(getErrorMessage(err, "Xác thực OTP thất bại."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-5xl flex flex-col lg:flex-row rounded-xl overflow-hidden shadow-lg border border-border">
                    {/* Left Panel - Hero */}
                    <div className="relative lg:w-[45%] bg-primary p-8 lg:p-10 flex flex-col justify-between min-h-[300px] lg:min-h-[600px]">
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <img
                                src="/laptop-hero.jpg"
                                alt="Laptop background"
                                className="w-full h-full object-cover opacity-30"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold text-primary-foreground mb-4">LAPTOPRE</h2>
                            <h1 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-4 leading-tight">
                                Chứng nhận chất lượng, an tâm sử dụng.
                            </h1>
                            <p className="text-primary-foreground/80 text-sm lg:text-base leading-relaxed">
                                Tham gia cộng đồng LAPTOPRE để nhận những ưu đãi đặc quyền cho các dòng laptop chính hãng đã qua kiểm định khắt khe.
                            </p>
                        </div>

                        {/* Badges */}
                        <div className="relative z-10 flex flex-wrap gap-3 mt-6">
                            <div className="flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <CheckCircle className="h-4 w-4 text-primary-foreground" />
                                <span className="text-primary-foreground text-sm font-medium">Đã kiểm tra 100%</span>
                            </div>
                            <div className="flex items-center gap-2 bg-transparent border border-primary-foreground/30 px-4 py-2 rounded-full">
                                <Shield className="h-4 w-4 text-primary-foreground" />
                                <span className="text-primary-foreground text-sm font-medium">Bảo hành 12 tháng</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Register Form */}
                    <div className="lg:w-[55%] bg-card p-8 lg:p-10">
                        <div className="max-w-md mx-auto">
                            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                                {step === 1 ? "Tạo tài khoản mới" : "Xác thực tài khoản"}
                            </h2>
                            <p className="text-muted-foreground mb-8">
                                {step === 1 
                                    ? "Vui lòng nhập thông tin để bắt đầu trải nghiệm." 
                                    : `Chúng tôi đã gửi mã OTP đến email ${email}. Vui lòng nhập mã để hoàn tất đăng ký.`}
                            </p>

                            {step === 1 ? (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {error && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>}
                                    {success && <div className="p-3 bg-green-100 text-green-600 rounded-lg text-sm">Đăng ký thành công! Đang chuyển hướng...</div>}
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        Họ tên
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Nguyễn Văn A"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-12 bg-muted/50 border-border"
                                        required
                                    />
                                </div>

                                {/* Email and Phone */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            Email
                                        </label>
                                        <Input
                                            type="email"
                                            placeholder="example@gmail.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-12 bg-muted/50 border-border"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            Số điện thoại
                                        </label>
                                        <Input
                                            type="tel"
                                            placeholder="0901 234 567"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="h-12 bg-muted/50 border-border"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                        Mật khẩu
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-12 bg-muted/50 border-border pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                                        Xác nhận mật khẩu
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="h-12 bg-muted/50 border-border pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Terms Checkbox */}
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="terms"
                                        checked={agreed}
                                        onCheckedChange={(checked) => setAgreed(checked as boolean)}
                                        className="mt-0.5"
                                    />
                                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                                        Tôi đồng ý với các{" "}
                                        <Link to="/terms" className="text-primary font-medium hover:underline">
                                            Điều khoản sử dụng
                                        </Link>{" "}
                                        và{" "}
                                        <Link to="/privacy" className="text-primary font-medium hover:underline">
                                            Chính sách bảo mật
                                        </Link>{" "}
                                        của LAPTOPRE.
                                    </label>
                                </div>

                                {/* Register Button */}
                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base disabled:opacity-50"
                                    disabled={!agreed || loading}
                                >
                                    {loading ? "Đang đăng ký..." : "Đăng ký"}
                                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Button>

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-card px-4 text-muted-foreground">Hoặc đăng ký bằng</span>
                                    </div>
                                </div>

                                {/* Social Login */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-12 border-border hover:bg-muted/50"
                                    >
                                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                            <path
                                                fill="#4285F4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        Google
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-12 border-border hover:bg-muted/50"
                                    >
                                        <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                        Facebook
                                    </Button>
                                </div>

                                {/* Login Link */}
                                <p className="text-center text-sm text-muted-foreground mt-6">
                                    Đã có tài khoản?{" "}
                                    <Link to="/" className="text-primary font-semibold hover:underline">
                                        Đăng nhập
                                    </Link>
                                </p>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    {error && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>}
                                    {success && <div className="p-3 bg-green-100 text-green-600 rounded-lg text-sm">Xác thực thành công! Đang chuyển hướng đến trang đăng nhập...</div>}
                                    
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                            Mã OTP
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Nhập mã 6 chữ số"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="h-12 bg-muted/50 border-border text-center text-2xl tracking-[1em] font-bold"
                                            required
                                            maxLength={6}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base disabled:opacity-50"
                                        disabled={loading || otp.length < 4}
                                    >
                                        {loading ? "Đang xác thực..." : "Xác thực tài khoản"}
                                    </Button>

                                    <div className="text-center">
                                        <button 
                                            type="button" 
                                            onClick={() => setStep(1)}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            Quay lại chỉnh sửa thông tin
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                            © 2024 LAPTOPRE. Chuyên gia laptop cũ chính hãng.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link to="/account" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Tài khoản
                            </Link>
                            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Bảo mật
                            </Link>
                            <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Hỗ trợ
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
