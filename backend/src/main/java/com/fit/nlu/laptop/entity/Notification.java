package com.fit.nlu.laptop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // null nếu gửi cho tất cả
    private String title;
    private String content; // description
    private String type; // order, ai, offer, system
    @Column(columnDefinition = "JSON")
    private String tags; // JSON array [{"label": "Track Package", "variant": "outline"}]
    private String actionUrl; // URL redirect khi click
    @Column(name = "is_read")
    private boolean read = false;
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
