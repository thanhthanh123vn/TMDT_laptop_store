package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.dto.request.SellerRegisterReq;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.regex.Pattern;

public final class SellerRegistrationValidator {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[\\w.+-]+@[\\w.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^0\\d{9}$");
    private static final Pattern CCCD_PATTERN = Pattern.compile("^\\d{12}$");
    private static final Pattern BANK_ACCOUNT_PATTERN = Pattern.compile("^\\d{6,20}$");

    private SellerRegistrationValidator() {
    }

    public static void validate(SellerRegisterReq req) {
        if (isBlank(req.fullName()) || req.fullName().trim().length() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Họ tên phải có ít nhất 2 ký tự");
        }
        if (isBlank(req.email()) || !EMAIL_PATTERN.matcher(req.email().trim()).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email không hợp lệ");
        }
        if (isBlank(req.phone()) || !PHONE_PATTERN.matcher(normalizePhone(req.phone())).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0");
        }
        if (isBlank(req.password()) || req.password().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu phải có ít nhất 6 ký tự");
        }
        if (isBlank(req.warehouseProvince()) || isBlank(req.warehouseDistrict())
                || isBlank(req.warehouseWard()) || isBlank(req.warehouseStreet())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng nhập đầy đủ địa chỉ kho");
        }
        if (req.warehouseStreet().trim().length() < 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Địa chỉ chi tiết kho phải có ít nhất 5 ký tự");
        }
        String cccd = req.cccd() != null ? req.cccd().trim() : "";
        if (!CCCD_PATTERN.matcher(cccd).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CCCD phải gồm đúng 12 chữ số");
        }
        if (isBlank(req.bankName()) || req.bankName().trim().length() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên ngân hàng không hợp lệ");
        }
        String accountNumber = req.bankAccountNumber() != null ? req.bankAccountNumber().trim() : "";
        if (!BANK_ACCOUNT_PATTERN.matcher(accountNumber).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số tài khoản ngân hàng phải gồm 6–20 chữ số");
        }
        if (isBlank(req.bankAccountHolder()) || req.bankAccountHolder().trim().length() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên chủ tài khoản không hợp lệ");
        }
    }

    public static String normalizePhone(String phone) {
        return phone.replaceAll("\\s+", "");
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
