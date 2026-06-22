package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.dto.request.UpdateSellerStatusReq;
import com.fit.nlu.laptop.dto.response.PagedResponse;
import com.fit.nlu.laptop.service.AdminSellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/sellers")
@RequiredArgsConstructor
public class AdminSellerController {

    private final AdminSellerService adminSellerService;

    @GetMapping
    public ResponseEntity<PagedResponse<Map<String, Object>>> listSellers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean approved,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(adminSellerService.listSellers(page, size, approved, status, keyword));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getSeller(@PathVariable Long id) {
        return ResponseEntity.ok(adminSellerService.getSeller(id));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveSeller(@PathVariable Long id) {
        return ResponseEntity.ok(adminSellerService.approveSeller(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectSeller(@PathVariable Long id) {
        return ResponseEntity.ok(adminSellerService.rejectSeller(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateSellerStatusReq req
    ) {
        return ResponseEntity.ok(adminSellerService.updateSellerStatus(id, req.status()));
    }
}
