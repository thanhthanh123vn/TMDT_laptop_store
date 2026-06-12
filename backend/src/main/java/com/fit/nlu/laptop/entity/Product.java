package com.fit.nlu.laptop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private SellerProfile seller;

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
    
    @Column(name = "category_id")
    private Long categoryId;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "is_best_seller")
    private Boolean isBestSeller = false;
    
    @Column(name = "is_hot")
    private Boolean isHot = false;
    
    @Column(name = "is_sale")
    private Boolean isSale = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "stock")
    private Integer stock = 0;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "approved")
    private Boolean approved = false;

    // Manual compatibility getters and setters for boolean primitive fallback
    public boolean isBestSeller() {
        return isBestSeller != null && isBestSeller;
    }

    public void setBestSeller(boolean isBestSeller) {
        this.isBestSeller = isBestSeller;
    }

    public boolean isHot() {
        return isHot != null && isHot;
    }

    public void setHot(boolean isHot) {
        this.isHot = isHot;
    }

    public boolean isSale() {
        return isSale != null && isSale;
    }

    public void setSale(boolean isSale) {
        this.isSale = isSale;
    }

    public boolean isDeleted() {
        return isDeleted != null && isDeleted;
    }

    public void setDeleted(boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public boolean isApproved() {
        return approved != null && approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private List<ProductImage> images = new ArrayList<>();

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
