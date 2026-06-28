package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.entity.Notification;
import com.fit.nlu.laptop.entity.enums.NotificationType;
import com.fit.nlu.laptop.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    // USER NOTIFICATIONS
    public Page<Notification> getUserNotifications(Long userId, String type, Boolean isRead, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page-1,0), Math.max(size,1));
        return notificationRepository.findUserNotificationsWithFilter(userId, type, isRead, pageable);
    }

    public Notification markAsRead(Long id, Long userId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (n.getUserId() != null && !n.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        n.setRead(true);
        return notificationRepository.save(n);
    }

    public void markAllAsRead(Long userId) {
        Page<Notification> page = notificationRepository.findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(userId, PageRequest.of(0, Integer.MAX_VALUE));
        for (Notification n : page.getContent()) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        }
    }

    public void deleteNotification(Long id, Long userId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (n.getUserId() != null && !n.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        notificationRepository.delete(n);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    // ADMIN NOTIFICATIONS
    public Page<Notification> adminList(String type, Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page-1,0), Math.max(size,1));
        // TODO: implement admin filter with status
        return notificationRepository.findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(userId, pageable);
    }

    public Notification adminSend(Map<String, Object> body) {
        Notification n = new Notification();
        n.setTitle((String) body.getOrDefault("title", ""));
        n.setContent((String) body.getOrDefault("body", ""));
        n.setType(NotificationType.valueOf((String) body.getOrDefault("type", "system")));
        n.setTags((String) body.getOrDefault("tags", "[]"));
        n.setActionUrl((String) body.getOrDefault("actionUrl", ""));
        Object userIdObj = body.get("userId");
        n.setUserId(userIdObj != null ? Long.valueOf(userIdObj.toString()) : null);
        n.setRead(false);
        return notificationRepository.save(n);
    }
    public void sendNotification(Long userId, NotificationType type, String title, String message) {

        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .content(message)
                .read(false)
                .build();

        Notification savedNotification = notificationRepository.save(notification);



        messagingTemplate.convertAndSend("/topic/notifications/" + userId, savedNotification);
    }
    public void adminDelete(Long id) {
        notificationRepository.deleteById(id);
    }
}
