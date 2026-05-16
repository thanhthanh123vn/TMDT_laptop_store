package com.fit.nlu.laptop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private BigDecimal price;
    
    @Column(name = "old_price")
    private BigDecimal oldPrice;

    @Column(name = "image_url")
    private String imageUrl;
    
    private String badge; // Ví dụ: "99% LIKE NEW"
    
    @Column(name = "badge_color")
    private String badgeColor; // bg-emerald-500
    
    private Double rating = 5.0;
    
    private Integer reviews = 0;

    private String brand;
    private String cpu;
    private String gpu;
    private String ram;
    private String storage;
    
    @Column(name = "storage_type")
    private String storageType;
    
    @Column(name = "screen_size")
    private String screenSize;
    
    private String weight;
    
    @Column(name = "battery_condition")
    private String batteryCondition;
    
    @Column(name = "`condition`")
    private String condition;
    
    private String category; // Có thể lưu dạng string cách nhau bởi dấu phẩy
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "is_best_seller")
    private boolean isBestSeller = false;
    
    @Column(name = "is_hot")
    private boolean isHot = false;
    
    @Column(name = "is_sale")
    private boolean isSale = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
