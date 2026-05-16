package com.fit.nlu.laptop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String type; // order, system, promo

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read")
    private boolean isRead = false;
    
    private String icon; // package, truck, monitor, warning
    
    @Column(name = "image_url")
    private String imageUrl; // optional
    
    @Column(name = "action_link")
    private String actionLink; // optional href

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
