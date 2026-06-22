package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.config.VNPayConfig;
import com.fit.nlu.laptop.entity.BoostPackage;
import com.fit.nlu.laptop.jwt.UserPrincipal;
import com.fit.nlu.laptop.service.BoostPackageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("*")
@RequiredArgsConstructor
public class BoostPackageController {

    private final BoostPackageService boostPackageService;

    // ═══════════════════════════════════════════════════════
    //  SELLER endpoints  /api/seller/boost
    // ═══════════════════════════════════════════════════════

    /** Bảng giá các gói */
    @GetMapping("/api/seller/boost/prices")
    public ResponseEntity<Map<Integer, java.math.BigDecimal>> getPrices() {
        return ResponseEntity.ok(boostPackageService.getPriceTable());
    }

    /** Lịch sử gói của seller đang đăng nhập */
    @GetMapping("/api/seller/boost/packages")
    public ResponseEntity<List<BoostPackage>> getMyPackages(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(boostPackageService.getSellerPackages((long) principal.getId()));
    }

    /** Chi tiết 1 gói */
    @GetMapping("/api/seller/boost/packages/{id}")
    public ResponseEntity<BoostPackage> getPackageDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(boostPackageService.getPackageDetail((long) principal.getId(), id));
    }

    /** Tạo gói + lấy URL thanh toán VNPay */
    @PostMapping("/api/seller/boost/create")
    public ResponseEntity<Map<String, Object>> createBoost(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        Long productId = Long.valueOf(body.get("productId").toString());
        int durationMonths = Integer.parseInt(body.get("durationMonths").toString());
        return ResponseEntity.ok(
                boostPackageService.createPaymentUrl((long) principal.getId(), productId, durationMonths, request));
    }

    // ═══════════════════════════════════════════════════════
    //  VNPay return  /api/boost/vnpay-return  (public)
    // ═══════════════════════════════════════════════════════

    @GetMapping("/api/boost/vnpay-return")
    public ResponseEntity<Map<String, String>> vnpayReturn(
            @RequestParam Map<String, String> params) {
        // Verify signature
        Map<String, String> copy = new java.util.HashMap<>(params);
        copy.remove("vnp_SecureHashType");
        copy.remove("vnp_SecureHash");

        List<String> keys = new java.util.ArrayList<>(copy.keySet());
        java.util.Collections.sort(keys);
        StringBuilder hashData = new StringBuilder();
        java.util.Iterator<String> itr = keys.iterator();
        while (itr.hasNext()) {
            String k = itr.next();
            String v = copy.get(k);
            if (v != null && !v.isEmpty()) {
                hashData.append(k).append('=').append(v);
                if (itr.hasNext()) hashData.append('&');
            }
        }
        boolean valid = VNPayConfig.hmacSHA512(VNPayConfig.secretKey, hashData.toString())
                .equals(params.get("vnp_SecureHash"));

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");

        if (valid && txnRef != null) {
            boostPackageService.handlePaymentReturn(txnRef, responseCode);
        }

        return ResponseEntity.ok(Map.of(
                "vnp_ResponseCode", responseCode != null ? responseCode : "99",
                "txnRef", txnRef != null ? txnRef : ""
        ));
    }

    // ═══════════════════════════════════════════════════════
    //  ADMIN endpoints  /api/admin/boost
    // ═══════════════════════════════════════════════════════

    /** Tất cả gói (admin xem tổng quan) */
    @GetMapping("/api/admin/boost/packages")
    public ResponseEntity<List<BoostPackage>> adminGetAll() {
        return ResponseEntity.ok(boostPackageService.getAllPackages());
    }

    /** Danh sách chờ duyệt */
    @GetMapping("/api/admin/boost/pending")
    public ResponseEntity<List<BoostPackage>> adminGetPending() {
        return ResponseEntity.ok(boostPackageService.getPendingApproval());
    }

    /** Duyệt gói */
    @PostMapping("/api/admin/boost/packages/{id}/approve")
    public ResponseEntity<BoostPackage> adminApprove(@PathVariable Long id) {
        return ResponseEntity.ok(boostPackageService.approvePackage(id));
    }

    /** Từ chối gói */
    @PostMapping("/api/admin/boost/packages/{id}/reject")
    public ResponseEntity<BoostPackage> adminReject(@PathVariable Long id) {
        return ResponseEntity.ok(boostPackageService.rejectPackage(id));
    }
}
