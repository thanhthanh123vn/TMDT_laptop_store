package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.entity.BoostPackage;
import com.fit.nlu.laptop.jwt.UserPrincipal;
import com.fit.nlu.laptop.service.BoostPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    /** Tạo gói mới → trả về packageId + thông tin CK */
    @PostMapping("/api/seller/boost/create")
    public ResponseEntity<Map<String, Object>> createBoost(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> body) {
        Long productId = Long.valueOf(body.get("productId").toString());
        int durationMonths = Integer.parseInt(body.get("durationMonths").toString());
        BoostPackage pkg = boostPackageService.createBoostPackage(
                (long) principal.getId(), productId, durationMonths);
        return ResponseEntity.ok(Map.of("packageId", pkg.getId()));
    }

    /**
     * Seller nộp ảnh chuyển khoản → đơn sang PENDING_APPROVAL
     * multipart/form-data: file = ảnh CK
     */
    @PostMapping("/api/seller/boost/packages/{id}/submit-payment")
    public ResponseEntity<BoostPackage> submitPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(
                boostPackageService.submitPaymentProof((long) principal.getId(), id, file));
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
