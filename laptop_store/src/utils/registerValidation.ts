export interface SellerFormData {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    warehouseProvince: string;
    warehouseDistrict: string;
    warehouseWard: string;
    warehouseStreet: string;
    cccd: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
}

const EMAIL_RE = /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
const PHONE_RE = /^0\d{9}$/;
const CCCD_RE = /^\d{12}$/;
const BANK_ACCOUNT_RE = /^\d{6,20}$/;

export function normalizePhone(phone: string): string {
    return phone.replace(/\s+/g, "");
}

export function validateSellerForm(data: SellerFormData): string | null {
    if (!data.fullName.trim() || data.fullName.trim().length < 2) {
        return "Họ tên phải có ít nhất 2 ký tự.";
    }
    if (!EMAIL_RE.test(data.email.trim())) {
        return "Email không hợp lệ.";
    }
    const phone = normalizePhone(data.phone);
    if (!PHONE_RE.test(phone)) {
        return "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.";
    }
    if (data.password.length < 6) {
        return "Mật khẩu phải có ít nhất 6 ký tự.";
    }
    if (data.password !== data.confirmPassword) {
        return "Mật khẩu xác nhận không khớp.";
    }
    if (!data.warehouseProvince || !data.warehouseDistrict || !data.warehouseWard) {
        return "Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện và Phường/Xã cho địa chỉ kho.";
    }
    if (!data.warehouseStreet.trim() || data.warehouseStreet.trim().length < 5) {
        return "Địa chỉ chi tiết kho phải có ít nhất 5 ký tự.";
    }
    if (!CCCD_RE.test(data.cccd.trim())) {
        return "CCCD phải gồm đúng 12 chữ số.";
    }
    if (!data.bankName.trim() || data.bankName.trim().length < 2) {
        return "Tên ngân hàng không hợp lệ.";
    }
    if (!BANK_ACCOUNT_RE.test(data.bankAccountNumber.trim())) {
        return "Số tài khoản ngân hàng phải gồm 6–20 chữ số.";
    }
    if (!data.bankAccountHolder.trim() || data.bankAccountHolder.trim().length < 2) {
        return "Tên chủ tài khoản không hợp lệ.";
    }
    return null;
}
