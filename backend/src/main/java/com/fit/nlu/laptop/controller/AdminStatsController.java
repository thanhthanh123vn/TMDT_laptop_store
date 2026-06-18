package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(adminStatsService.getStats());
    }

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenue(
            @RequestParam(defaultValue = "monthly") String period
    ) {
        return ResponseEntity.ok(adminStatsService.getRevenue(period));
    }
}
