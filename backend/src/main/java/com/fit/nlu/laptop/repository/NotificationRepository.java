package com.fit.nlu.laptop.repository;

import com.fit.nlu.laptop.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserIdOrUserIdIsNullOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Notification> findByUserId(Long userId, Pageable pageable);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.userId = :userId OR n.userId IS NULL) AND n.read = false")
    long countUnreadByUserId(@Param("userId") Long userId);
    
    @Query("SELECT n FROM Notification n WHERE (n.userId = :userId OR n.userId IS NULL) AND (:type IS NULL OR n.type = :type) AND (:isRead IS NULL OR n.read = :isRead) ORDER BY n.createdAt DESC")
    Page<Notification> findUserNotificationsWithFilter(
            @Param("userId") Long userId,
            @Param("type") String type,
            @Param("isRead") Boolean isRead,
            Pageable pageable
    );
}
