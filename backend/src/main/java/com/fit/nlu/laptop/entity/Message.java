package com.fit.nlu.laptop.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomId;

    private Long senderId;

    private String senderName;



    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime timestamp;


    private boolean isRecalled = false;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }


}