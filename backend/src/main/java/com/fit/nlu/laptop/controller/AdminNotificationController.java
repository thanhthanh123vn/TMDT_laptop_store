package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.entity.Notification;
import com.fit.nlu.laptop.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<?> adminList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long userId
    ) {
        Page<Notification> notifications = notificationService.adminList(type, userId, page, size);
        return ResponseEntity.ok(notifications);
    }

    @PostMapping
    public ResponseEntity<?> adminSend(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(notificationService.adminSend(body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> adminDelete(@PathVariable Long id) {
        notificationService.adminDelete(id);
        return ResponseEntity.ok().build();
    }
}

