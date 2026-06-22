package com.fit.nlu.laptop.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "boost_packages")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BoostPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Mã giao dịch VNPay (vnp_TxnRef) để map callback */
    @Column(name = "txn_ref", unique = true)
    private String txnRef;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonIgnoreProperties({"user", "warehouseProvince", "warehouseDistrict", "warehouseWard",
            "warehouseStreet", "cccd", "bankName", "bankAccountNumber", "bankAccountHolder",
            "hibernateLazyInitializer", "handler"})
    private SellerProfile seller;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"seller", "images", "hibernateLazyInitializer", "handler"})
    private Product product;

    /** Số tháng đẩy tin: 1, 3, 6, 12 */
    @Column(name = "duration_months", nullable = false)
    private Integer durationMonths;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    /**
     * PENDING_PAYMENT - chờ thanh toán
     * PENDING_APPROVAL - đã thanh toán, chờ admin duyệt
     * ACTIVE           - đang hoạt động
     * EXPIRED          - hết hạn
     * REJECTED         - bị từ chối
     */
    @Column(name = "status", nullable = false, length = 20)
    private String status = "PENDING_PAYMENT";

    @Column(name = "purchased_at")
    private LocalDateTime purchasedAt;   // thời điểm thanh toán thành công

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;    // thời điểm admin duyệt

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;     // thời điểm hết hạn

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
