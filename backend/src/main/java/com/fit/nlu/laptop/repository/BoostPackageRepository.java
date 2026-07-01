package com.fit.nlu.laptop.repository;

import com.fit.nlu.laptop.entity.BoostPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BoostPackageRepository extends JpaRepository<BoostPackage, Long> {

    List<BoostPackage> findBySellerId(Long sellerId);

    Optional<BoostPackage> findByTxnRef(String txnRef);

    /** Tất cả gói ACTIVE cho 1 sản phẩm (dùng để check trước khi tạo mới) */
    @Query("SELECT b FROM BoostPackage b WHERE b.product.id = :productId AND b.status = 'ACTIVE'")
    List<BoostPackage> findActiveByProductId(@Param("productId") Long productId);

    /** Gói đang ACTIVE và đã hết hạn → cần cron expire */
    @Query("SELECT b FROM BoostPackage b WHERE b.status = 'ACTIVE' AND b.expiredAt <= :now")
    List<BoostPackage> findExpiredActive(@Param("now") LocalDateTime now);

    /** Admin: tất cả gói chờ duyệt */
    List<BoostPackage> findByStatus(String status);

    /** Check sản phẩm có đang được boost không */
    @Query("SELECT COUNT(b) > 0 FROM BoostPackage b WHERE b.product.id = :productId AND b.status = 'ACTIVE'")
    boolean existsActiveBoostedProduct(@Param("productId") Long productId);
}
