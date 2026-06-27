package com.fit.nlu.laptop.entity;

import com.fit.nlu.laptop.entity.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; 
    private String title;
    private String content; // description
    @Enumerated(EnumType.STRING)
    private NotificationType type;
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
