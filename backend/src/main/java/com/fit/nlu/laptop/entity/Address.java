package com.fit.nlu.laptop.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "addresses")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "full_name")
    private String fullName;

    private String phone;
    
    private String province; // Tỉnh / Thành phố
    private String district; // Quận / Huyện
    private String ward;     // Phường / Xã
    
    @Column(name = "street_address")
    private String streetAddress; // Địa chỉ cụ thể

    @Column(name = "is_default")
    private boolean isDefault = false;

    @Column(name = "address_type") // HOME / OFFICE
    private String addressType = "HOME";
}
