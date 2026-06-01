"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Eye,
    EyeOff,
    User,
    Mail,
    Phone,
    Lock,
    RefreshCw,
    Shield,
    Laptop,
    Store,
    MapPin,
    CreditCard,
    IdCard,
} from "lucide-react";
import { authApi } from "../api/authApi";
import { bankApi } from "../api/bankApi";
import { getErrorMessage } from "../utils/errorUtils";
import {
    normalizePhone,
    validateSellerForm,
    type SellerFormData,
} from "../utils/registerValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import banksData from "../data/banks.json";

const PANEL_IMAGE =
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&q=80";

interface APIWard {
    name: string;
}
interface APIDistrict {
    name: string;
    wards: APIWard[];
}
interface APIProvince {
    code: string;
    name: string;
    districts: APIDistrict[];
}

const initialForm: SellerFormData = {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    storeName: "",
    warehouseProvince: "",
    warehouseDistrict: "",
    warehouseWard: "",
    warehouseStreet: "",
    cccd: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountHolder: "",
};

export default function SellerRegisterPage() {
    const [form, setForm] = useState<SellerFormData>(initialForm);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState("");

    const [apiProvinces, setApiProvinces] = useState<APIProvince[]>([]);
    const [apiDistricts, setApiDistricts] = useState<APIDistrict[]>([]);
    const [apiWards, setApiWards] = useState<APIWard[]>([]);
    const [banks, setBanks] = useState<{ code: string; name: string }[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/?depth=3")
            .then((res) => res.json())
            .then((data: APIProvince[]) => setApiProvinces(data))
            .catch(() => setError("Không thể tải danh sách tỉnh thành. Vui lòng thử lại sau."));
        // Load banks từ file local
        setBanks(banksData);
    }, []);

    const updateField = <K extends keyof SellerFormData>(key: K, value: SellerFormData[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleProvinceChange = (provinceName: string) => {
        updateField("warehouseProvince", provinceName);
        updateField("warehouseDistrict", "");
        updateField("warehouseWard", "");
        setApiWards([]);
        const selected = apiProvinces.find((p) => p.name === provinceName);
        setApiDistricts(selected ? selected.districts : []);
    };

    const handleDistrictChange = (districtName: string) => {
        updateField("warehouseDistrict", districtName);
        updateField("warehouseWard", "");
        const selected = apiDistricts.find((d) => d.name === districtName);
        setApiWards(selected ? selected.wards : []);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const validationError = validateSellerForm(form);
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            await authApi.registerSeller({
                email: form.email.trim(),
                password: form.password,
                fullName: form.fullName.trim(),
                phone: normalizePhone(form.phone),
                storeName: form.storeName.trim(),
                warehouseProvince: form.warehouseProvince,
                warehouseDistrict: form.warehouseDistrict,
                warehouseWard: form.warehouseWard,
                warehouseStreet: form.warehouseStreet.trim(),
                cccd: form.cccd.trim(),
                bankName: form.bankName.trim(),
                bankAccountNumber: form.bankAccountNumber.trim(),
                bankAccountHolder: form.bankAccountHolder.trim(),
            });
            setStep(2);
        } catch (err: unknown) {
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
            await authApi.verifyRegisterOtp({ email: form.email.trim(), otp });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Xác thực OTP thất bại."));
        } finally {
            setLoading(false);
        }
    };

    const selectClass =
        "w-full h-12 px-3 bg-muted/40 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm";

    return (
        <div className="min-h-[calc(100vh-160px)] bg-background flex flex-col justify-center">
            <main className="w-full flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-5xl flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-sm border border-border bg-card">
                    <div className="relative lg:w-[38%] flex flex-col justify-between min-h-[240px] lg:min-h-[640px] overflow-hidden">
                        <img
                            src={PANEL_IMAGE}
                            alt="Laptop workspace"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/85 via-emerald-950/70 to-gray-900/80" />
                        <div className="relative z-10 p-8 lg:p-10 flex items-center gap-2">
                            <Laptop className="h-6 w-6 text-white" />
                            <span className="text-white font-bold text-lg tracking-wide">LAPTOPRE</span>
                        </div>
                        <div className="relative z-10 px-8 lg:px-10 pb-4 my-auto">
                            <div className="flex items-center gap-2 text-emerald-300 mb-3">
                                <Store className="h-5 w-5" />
                                <span className="text-sm font-medium uppercase tracking-wider">
                                    Đăng ký người bán
                                </span>
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4 leading-tight">
                                Mở cửa hàng laptop trên LAPTOPRE
                            </h1>
                            <p className="text-white/70 text-sm lg:text-base leading-relaxed">
                                Hoàn tất hồ sơ kho hàng và ngân hàng để bắt đầu bán hàng sau khi xác thực email.
                            </p>
                        </div>
                    </div>

                    <div className="lg:w-[62%] p-8 lg:p-10">
                        <div className="max-w-lg mx-auto">
                            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                                {step === 1 ? "Đăng ký người bán" : "Xác thực tài khoản"}
                            </h2>
                            <p className="text-muted-foreground mb-6 text-sm">
                                {step === 1
                                    ? "Nhập thông tin cá nhân, địa chỉ kho và tài khoản ngân hàng."
                                    : `Chúng tôi đã gửi mã OTP 4 số đến ${form.email}. Nhập mã để hoàn tất đăng ký.`}
                            </p>

                            {step === 1 ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {error && (
                                        <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Thông tin tài khoản
                                    </p>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            Họ tên
                                        </label>
                                        <Input
                                            value={form.fullName}
                                            onChange={(e) => updateField("fullName", e.target.value)}
                                            placeholder="Nguyễn Văn A"
                                            className="h-11 bg-muted/40 rounded-xl"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium">
                                            <Store className="h-4 w-4 text-muted-foreground" />
                                            Tên cửa hàng
                                        </label>
                                        <Input
                                            value={form.storeName}
                                            onChange={(e) => updateField("storeName", e.target.value)}
                                            placeholder="Cửa hàng laptop ABC"
                                            className="h-11 bg-muted/40 rounded-xl"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-medium">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                Email
                                            </label>
                                            <Input
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => updateField("email", e.target.value)}
                                                placeholder="seller@email.com"
                                                className="h-11 bg-muted/40 rounded-xl"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-medium">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                Số điện thoại
                                            </label>
                                            <Input
                                                type="tel"
                                                value={form.phone}
                                                onChange={(e) => updateField("phone", e.target.value)}
                                                placeholder="0901234567"
                                                className="h-11 bg-muted/40 rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-medium">
                                                <Lock className="h-4 w-4 text-muted-foreground" />
                                                Mật khẩu
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    value={form.password}
                                                    onChange={(e) => updateField("password", e.target.value)}
                                                    className="h-11 bg-muted/40 rounded-xl pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-medium">
                                                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                                                Xác nhận mật khẩu
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={form.confirmPassword}
                                                    onChange={(e) =>
                                                        updateField("confirmPassword", e.target.value)
                                                    }
                                                    className="h-11 bg-muted/40 rounded-xl pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowConfirmPassword(!showConfirmPassword)
                                                    }
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2">
                                        Địa chỉ kho
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-medium">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                Tỉnh/Thành
                                            </label>
                                            <select
                                                className={selectClass}
                                                value={form.warehouseProvince}
                                                onChange={(e) => handleProvinceChange(e.target.value)}
                                                required
                                            >
                                                <option value="">Chọn tỉnh/thành</option>
                                                {apiProvinces.map((p) => (
                                                    <option key={p.code} value={p.name}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Quận/Huyện</label>
                                            <select
                                                className={selectClass}
                                                value={form.warehouseDistrict}
                                                onChange={(e) => handleDistrictChange(e.target.value)}
                                                required
                                                disabled={!form.warehouseProvince}
                                            >
                                                <option value="">Chọn quận/huyện</option>
                                                {apiDistricts.map((d) => (
                                                    <option key={d.name} value={d.name}>
                                                        {d.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Phường/Xã</label>
                                            <select
                                                className={selectClass}
                                                value={form.warehouseWard}
                                                onChange={(e) =>
                                                    updateField("warehouseWard", e.target.value)
                                                }
                                                required
                                                disabled={!form.warehouseDistrict}
                                            >
                                                <option value="">Chọn phường/xã</option>
                                                {apiWards.map((w) => (
                                                    <option key={w.name} value={w.name}>
                                                        {w.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Địa chỉ chi tiết kho</label>
                                        <Input
                                            value={form.warehouseStreet}
                                            onChange={(e) =>
                                                updateField("warehouseStreet", e.target.value)
                                            }
                                            placeholder="Số nhà, tên đường..."
                                            className="h-11 bg-muted/40 rounded-xl"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium">
                                            <IdCard className="h-4 w-4 text-muted-foreground" />
                                            Số CCCD (12 số)
                                        </label>
                                        <Input
                                            value={form.cccd}
                                            onChange={(e) =>
                                                updateField(
                                                    "cccd",
                                                    e.target.value.replace(/\D/g, "").slice(0, 12)
                                                )
                                            }
                                            placeholder="001234567890"
                                            className="h-11 bg-muted/40 rounded-xl"
                                            inputMode="numeric"
                                            required
                                        />
                                    </div>

                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2">
                                        Thông tin ngân hàng
                                    </p>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium">
                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            Tên ngân hàng
                                        </label>
                                        <select
                                            className={selectClass}
                                            value={form.bankName}
                                            onChange={(e) => updateField("bankName", e.target.value)}
                                            required
                                        >
                                            <option value="">Chọn ngân hàng</option>
                                            {banks.map((b) => (
                                                <option key={b.code} value={b.name}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Số tài khoản</label>
                                            <Input
                                                value={form.bankAccountNumber}
                                                onChange={(e) =>
                                                    updateField(
                                                        "bankAccountNumber",
                                                        e.target.value.replace(/\D/g, "").slice(0, 20)
                                                    )
                                                }
                                                placeholder="1234567890"
                                                className="h-11 bg-muted/40 rounded-xl"
                                                inputMode="numeric"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Chủ tài khoản</label>
                                            <Input
                                                value={form.bankAccountHolder}
                                                onChange={(e) =>
                                                    updateField("bankAccountHolder", e.target.value)
                                                }
                                                placeholder="NGUYEN VAN A"
                                                className="h-11 bg-muted/40 rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 py-1">
                                        <Checkbox
                                            id="seller-terms"
                                            checked={agreed}
                                            onCheckedChange={(checked) => setAgreed(checked as boolean)}
                                            className="mt-0.5"
                                        />
                                        <label
                                            htmlFor="seller-terms"
                                            className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                                        >
                                            Tôi cam kết thông tin cung cấp là chính xác và đồng ý với{" "}
                                            <Link to="/terms" className="text-primary font-medium hover:underline">
                                                Điều khoản người bán
                                            </Link>
                                            .
                                        </label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-xl"
                                        disabled={!agreed || loading}
                                    >
                                        {loading ? "Đang đăng ký..." : "Đăng ký người bán"}
                                    </Button>

                                    <p className="text-center text-sm text-muted-foreground">
                                        Đã có tài khoản?{" "}
                                        <Link to="/login" className="text-primary font-semibold hover:underline">
                                            Đăng nhập
                                        </Link>
                                        {" · "}
                                        <Link
                                            to="/register"
                                            className="text-primary font-semibold hover:underline"
                                        >
                                            Đăng ký người mua
                                        </Link>
                                    </p>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    {error && (
                                        <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm">
                                            {error}
                                        </div>
                                    )}
                                    {success && (
                                        <div className="p-3 bg-green-50 text-green-600 border border-green-100 rounded-xl text-sm">
                                            Xác thực thành công! Đang chuyển hướng...
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium">
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                            Mã OTP (4 số)
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="0000"
                                            value={otp}
                                            onChange={(e) =>
                                                setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
                                            }
                                            className="h-12 bg-muted/40 text-center text-2xl tracking-[0.5em] font-bold rounded-xl"
                                            required
                                            maxLength={4}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-xl"
                                        disabled={loading || otp.length !== 4}
                                    >
                                        {loading ? "Đang xác thực..." : "Xác thực tài khoản"}
                                    </Button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="text-sm text-primary hover:underline font-medium"
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
        </div>
    );
}
