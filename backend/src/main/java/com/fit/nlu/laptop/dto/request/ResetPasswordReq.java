package com.fit.nlu.laptop.dto.request;

// Lưu ý: Record tự sinh hàm getter là .email(), .otp() (không có chữ 'get')
public record ResetPasswordReq(String email, String otp, String newPassword) {
}
