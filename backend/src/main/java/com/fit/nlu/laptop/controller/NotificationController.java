package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.entity.Notification;
import com.fit.nlu.laptop.entity.User;
import com.fit.nlu.laptop.jwt.UserPrincipal;
import com.fit.nlu.laptop.repository.NotificationRepository;
import com.fit.nlu.laptop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getMyNotifications(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findById(principal.getId().longValue()).orElseThrow();
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        if (principal == null) return ResponseEntity.status(401).build();
        Notification notification = notificationRepository.findById(id).orElseThrow();
        if (notification.getUser().getId().equals(principal.getId().longValue())) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findById(principal.getId().longValue()).orElseThrow();
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok().build();
    }
}
