package com.fit.nlu.laptop.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @JsonIgnore
    private Conversation conversation;

    private Long senderId;
    @Column(name = "receiver_id", nullable = false)
    private Long receiverId;
    private String senderName;



    @Column(columnDefinition = "TEXT")
    private String content;
    @OneToMany(
            mappedBy = "message",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<MessageMedia> media = new ArrayList<>();

    private Long productId;


    private Long orderId;

    private LocalDateTime timestamp;
    private boolean isRead = false;

    private boolean isRecalled = false;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }


}