package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.entity.Notification;
import com.fit.nlu.laptop.jwt.UserPrincipal;
import com.fit.nlu.laptop.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<?> getMyNotifications(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        Long userId = principal.getId().longValue();
        List<Notification> notifications = notificationRepository.findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(userId, PageRequest.of(0, 50)).getContent();
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        if (principal == null) return ResponseEntity.status(401).build();
        Notification notification = notificationRepository.findById(id).orElseThrow();
        if (notification.getUserId() == null || notification.getUserId().equals(principal.getId().longValue())) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        Long userId = principal.getId().longValue();
        List<Notification> notifications = notificationRepository.findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(userId, Pageable.unpaged()).getContent();
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok().build();
    }
}
