package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.dto.request.UpdateSellerProfileReq;
import com.fit.nlu.laptop.dto.response.SellerStatsResponse;
import com.fit.nlu.laptop.entity.Review;
import com.fit.nlu.laptop.entity.SellerProfile;
import com.fit.nlu.laptop.jwt.UserPrincipal;
import com.fit.nlu.laptop.service.SellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SellerController {

    private final SellerService sellerService;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(sellerService.getProfileWithUser((long) principal.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<SellerProfile> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateSellerProfileReq req) {
        return ResponseEntity.ok(sellerService.updateProfile((long) principal.getId(), req));
    }

    @GetMapping("/stats")
    public ResponseEntity<SellerStatsResponse> getStats(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(sellerService.getStats((long) principal.getId()));
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<Review>> getReviews(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(sellerService.getReviews((long) principal.getId()));
    }
}
