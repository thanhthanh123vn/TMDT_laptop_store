import React, { useState, useEffect } from "react";
import { userApi } from "../../api/userApi";
import { Camera, CheckCircle2, ChevronDown, User, Eye, EyeOff, Shield, XCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AdminProfilePage: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        gender: "Nam",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    // Password change states
    const [pwdCurrent, setPwdCurrent] = useState("");
    const [pwdNew, setPwdNew] = useState("");
    const [pwdConfirm, setPwdConfirm] = useState("");
    const [showPwdCurrent, setShowPwdCurrent] = useState(false);
    const [showPwdNew, setShowPwdNew] = useState(false);
    const [showPwdConfirm, setShowPwdConfirm] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdError, setPwdError] = useState("");
    const [pwdSuccess, setPwdSuccess] = useState("");

    // Password validation checks
    const pwdMinLength = pwdNew.length >= 8;
    const pwdSpecialChar = /[!@#$%^&*]/.test(pwdNew);
    const pwdNumberAndUppercase = /[0-9]/.test(pwdNew) && /[A-Z]/.test(pwdNew);
    const pwdNotSameAsOld = pwdNew !== pwdCurrent && pwdNew.length > 0;

    const BASE_URL = "http://localhost:8080";

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await userApi.getMyProfile();
            const user = res.data;
            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                phone: user.phone || "",
                gender: "Nam"
            });
            if (user.avatarUrl) {
                setAvatarUrl(user.avatarUrl.startsWith('http') ? user.avatarUrl : BASE_URL + user.avatarUrl);
            }
        } catch (err) {
            setError("Không thể tải thông tin quản trị viên.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await userApi.updateProfile({
                fullName: formData.fullName,
                phone: formData.phone
            });
            setSuccess("Cập nhật hồ sơ thành công!");
        } catch (err) {
            setError("Có lỗi xảy ra khi cập nhật hồ sơ.");
        } finally {
            setSaving(false);
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const res = await userApi.uploadAvatar(file);
            const newUrl = res.data.url;
            setAvatarUrl(newUrl.startsWith('http') ? newUrl : BASE_URL + newUrl);
            setSuccess("Cập nhật ảnh đại diện thành công!");
        } catch (err) {
            setError("Không thể tải ảnh lên. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    }

    const handleRemoveAvatar = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await userApi.updateProfile({ ...formData, avatarUrl: "" });
            setAvatarUrl("");
            setSuccess("Đã gỡ bỏ ảnh đại diện thành công!");
        } catch (err) {
            setError("Có lỗi xảy ra khi gỡ bỏ ảnh đại diện.");
        } finally {
            setSaving(false);
        }
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwdError("");
        setPwdSuccess("");

        if (pwdNew !== pwdConfirm) {
            setPwdError("Mật khẩu xác nhận không khớp.");
            return;
        }

        if (!pwdMinLength || !pwdSpecialChar || !pwdNumberAndUppercase) {
            setPwdError("Mật khẩu không đạt yêu cầu bảo mật.");
            return;
        }

        setPwdLoading(true);
        try {
            const res = await userApi.changePassword({ oldPassword: pwdCurrent, newPassword: pwdNew });
            setPwdSuccess(res.data.message || "Đổi mật khẩu thành công!");
            setPwdCurrent("");
            setPwdNew("");
            setPwdConfirm("");
        } catch (err: any) {
            const msg = err.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.";
            setPwdError(msg);
        } finally {
            setPwdLoading(false);
        }
    };

    const handlePasswordCancel = () => {
        setPwdCurrent("");
        setPwdNew("");
        setPwdConfirm("");
        setPwdError("");
        setPwdSuccess("");
    };

    return (
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Hồ sơ quản trị viên</h1>
            <p className="text-muted-foreground text-sm mb-8">
                Cập nhật thông tin tài khoản quản trị của bạn.
            </p>

            <form onSubmit={handleSubmit}>
                {error && <div className="p-3 mb-5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm">{error}</div>}
                {success && <div className="p-3 mb-5 bg-green-50 text-green-600 border border-green-100 rounded-xl text-sm">{success}</div>}
                {loading && <div className="p-3 mb-5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-sm">Đang tải dữ liệu tài khoản...</div>}

                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center border border-gray-200">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="h-9 w-9 text-primary" />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                            className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                        >
                            <Camera className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">Ảnh đại diện</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                            Dung lượng tối đa 1MB. Định dạng hỗ trợ: .JPG, .PNG
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <Button
                                type="button"
                                size="sm"
                                className="bg-primary hover:bg-primary/90 rounded-xl"
                                onClick={() => document.getElementById('avatar-upload')?.click()}
                                disabled={saving}
                            >
                                {saving ? "Đang tải..." : "Chọn hình mới"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-100"
                                onClick={handleRemoveAvatar}
                                disabled={saving || !avatarUrl}
                            >
                                Gỡ bỏ
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ và tên
                        </label>
                        <Input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="h-12 rounded-xl border-gray-200 focus-visible:ring-primary/20"
                            placeholder="Nhập đầy đủ họ tên"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Địa chỉ Email
                        </label>
                        <Input
                            type="email"
                            value={formData.email}
                            disabled
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại
                        </label>
                        <div className="flex shadow-sm rounded-xl overflow-hidden">
                            <span className="inline-flex items-center px-3.5 border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm font-medium">
                                +84
                            </span>
                            <Input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="h-12 rounded-l-none border-gray-200 rounded-r-xl focus-visible:ring-primary/20"
                                placeholder="Nhập số điện thoại"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giới tính
                        </label>
                        <div className="relative">
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full h-12 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium shadow-sm"
                            >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Status Badges */}
                <div className="bg-gray-50/50 rounded-xl p-4 mb-8 border border-gray-100 flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl text-xs font-semibold text-emerald-700 border border-emerald-100 shadow-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Tài khoản đã xác thực
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 border-t border-gray-50 pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-xl text-gray-500 hover:bg-gray-50"
                        onClick={() => fetchProfile()}
                    >
                        Hủy thay đổi
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving || loading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm px-6"
                    >
                        {saving ? "Đang lưu..." : "Lưu thông tin"}
                    </Button>
                </div>
            </form>
            {/* Password Change Section */}
            <div className="mt-12 pt-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Đổi mật khẩu</h2>
                <p className="text-muted-foreground text-sm mb-6">
                    Bảo vệ tài khoản của bạn bằng một mật khẩu mạnh.
                </p>

                <form onSubmit={handlePasswordSubmit}>
                    {pwdError && <div className="p-3 mb-5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm">{pwdError}</div>}
                    {pwdSuccess && <div className="p-3 mb-5 bg-green-50 text-green-600 border border-green-100 rounded-xl text-sm">{pwdSuccess}</div>}

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                            <div className="relative">
                                <Input
                                    type={showPwdCurrent ? "text" : "password"}
                                    value={pwdCurrent}
                                    onChange={(e) => setPwdCurrent(e.target.value)}
                                    className="h-12 rounded-xl pr-10 border-gray-200 focus-visible:ring-primary/20"
                                    placeholder="Nhập mật khẩu hiện tại"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPwdCurrent(!showPwdCurrent)}
                                >
                                    {showPwdCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                            <div className="relative">
                                <Input
                                    type={showPwdNew ? "text" : "password"}
                                    value={pwdNew}
                                    onChange={(e) => setPwdNew(e.target.value)}
                                    className="h-12 rounded-xl pr-10 border-gray-200 focus-visible:ring-primary/20"
                                    placeholder="Nhập mật khẩu mới"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPwdNew(!showPwdNew)}
                                >
                                    {showPwdNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {/* Password requirements indicators */}
                            {pwdNew && (
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        {pwdMinLength ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Circle className="h-3.5 w-3.5 text-gray-300" />}
                                        <span className={pwdMinLength ? "text-emerald-700 font-medium" : "text-gray-500"}>Tối thiểu 8 ký tự</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        {pwdSpecialChar ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Circle className="h-3.5 w-3.5 text-gray-300" />}
                                        <span className={pwdSpecialChar ? "text-emerald-700 font-medium" : "text-gray-500"}>Ít nhất 1 ký tự đặc biệt (!@#$...)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        {pwdNumberAndUppercase ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Circle className="h-3.5 w-3.5 text-gray-300" />}
                                        <span className={pwdNumberAndUppercase ? "text-emerald-700 font-medium" : "text-gray-500"}>Có chứa số và chữ in hoa</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        {pwdNotSameAsOld ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-red-500" />}
                                        <span className={pwdNotSameAsOld ? "text-emerald-700 font-medium" : "text-red-500"}>Khác mật khẩu hiện tại</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                            <div className="relative">
                                <Input
                                    type={showPwdConfirm ? "text" : "password"}
                                    value={pwdConfirm}
                                    onChange={(e) => setPwdConfirm(e.target.value)}
                                    className="h-12 rounded-xl pr-10 border-gray-200 focus-visible:ring-primary/20"
                                    placeholder="Nhập lại mật khẩu mới"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPwdConfirm(!showPwdConfirm)}
                                >
                                    {showPwdConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-xl text-gray-500 hover:bg-gray-50"
                            onClick={handlePasswordCancel}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            disabled={pwdLoading || !pwdMinLength || !pwdSpecialChar || !pwdNumberAndUppercase || !pwdNotSameAsOld || pwdNew !== pwdConfirm}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm px-6"
                        >
                            {pwdLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
