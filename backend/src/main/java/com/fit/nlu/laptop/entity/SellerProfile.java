package com.fit.nlu.laptop.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "seller_profiles")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SellerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @Column(name = "warehouse_province", nullable = false)
    private String warehouseProvince;

    @Column(name = "warehouse_district", nullable = false)
    private String warehouseDistrict;

    @Column(name = "warehouse_ward", nullable = false)
    private String warehouseWard;

    @Column(name = "warehouse_street", nullable = false)
    private String warehouseStreet;

    @Column(nullable = false, length = 12)
    private String cccd;

    @Column(name = "bank_name", nullable = false)
    private String bankName;

    @Column(name = "bank_account_number", nullable = false)
    private String bankAccountNumber;

    @Column(name = "bank_account_holder", nullable = false)
    private String bankAccountHolder;

    @Column(name = "approved", nullable = false)
    private boolean approved = false;

}
