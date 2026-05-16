"use client";

import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { Eye, EyeOff, Shield, Lock, CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import { getErrorMessage } from "../utils/errorUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordRequirements = useMemo(() => {
        return {
            minLength: password.length >= 8,
            hasUpperAndLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        }
    }, [password]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setLoading(true);
        try {
            await authApi.resetPassword({ email, otp, newPassword: password });
            setSuccess(true);
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err: any) {
            setError(getErrorMessage(err, "Đặt lại mật khẩu thất bại. Vui lòng thử lại."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <Link to="/" className="text-xl font-bold text-primary">
                        LAPTOPRE
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12 bg-muted/30">
                <div className="w-full max-w-md">
                    {/* Reset Password Card */}
                    <div className="bg-card rounded-lg border border-border p-8">
                        <h1 className="text-2xl font-bold text-primary mb-2">
                            Đặt lại mật khẩu mới
                        </h1>
                        <p className="text-muted-foreground mb-6">
                            Vui lòng nhập mã OTP và mật khẩu mới để khôi phục tài khoản.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>}
                            {success && <div className="p-3 bg-green-100 text-green-600 rounded-lg text-sm">Đặt lại mật khẩu thành công! Đang chuyển hướng...</div>}
                            
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your-email@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-background"
                                    required
                                />
                            </div>

                            {/* OTP */}
                            <div className="space-y-2">
                                <Label htmlFor="otp" className="text-foreground">
                                    Mã OTP
                                </Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="Mã OTP nhận từ email"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="bg-background"
                                    required
                                />
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-foreground">
                                    Mật khẩu mới
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Nhập mật khẩu mới"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pr-10 bg-background"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-foreground">
                                    Xác nhận mật khẩu mới
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Nhập lại mật khẩu mới"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pr-10 bg-background"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading || !passwordRequirements.minLength}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-medium disabled:opacity-50"
                            >
                                {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                            </Button>
                        </form>

                        {/* Back to Login */}
                        <div className="mt-4 pt-4 border-t border-border">
                            <Link
                                to="/login"
                                className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Quay lại trang đăng nhập</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
