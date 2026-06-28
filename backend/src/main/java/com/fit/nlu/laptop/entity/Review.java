package com.fit.nlu.laptop.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reviews")
@Data
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Do ai đánh giá
    @Column(columnDefinition = "TEXT")
    private String sellerReply;
    private LocalDateTime repliedAt;
    private LocalDateTime createdAt;

    @OneToMany(
            mappedBy = "review",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ReviewImage> images;
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }


}