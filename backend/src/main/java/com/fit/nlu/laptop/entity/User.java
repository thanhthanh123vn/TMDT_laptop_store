package com.fit.nlu.laptop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private String password;

    @Column(name = "full_name")
    private String fullName;

    private String phone;

    private String bio;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    private boolean enabled = true;

    @Column(name = "register_otp")
    private String registerOtp;

    @Column(name = "register_otp_expiry")
    private LocalDateTime registerOtpExpiry;

    @Column(name = "password_reset_otp")
    private String passwordResetOtp;

    @Column(name = "password_reset_otp_expiry")
    private LocalDateTime passwordResetOtpExpiry;

    @Column(name = "refresh_token_hash", length = 64)
    private String refreshTokenHash;

    @Column(name = "refresh_token_expiry")
    private LocalDateTime refreshTokenExpiry;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "wishlists",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private List<Product> wishlist = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}