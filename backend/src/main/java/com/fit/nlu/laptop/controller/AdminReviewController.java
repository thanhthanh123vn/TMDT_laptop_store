package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.dto.response.PagedResponse;
import com.fit.nlu.laptop.service.AdminReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final AdminReviewService adminReviewService;

    @GetMapping
    public ResponseEntity<PagedResponse<Map<String, Object>>> listReviews(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer rating
    ) {
        return ResponseEntity.ok(adminReviewService.listReviews(page, size, keyword, rating));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        return ResponseEntity.ok(adminReviewService.deleteReview(id));
    }
}
