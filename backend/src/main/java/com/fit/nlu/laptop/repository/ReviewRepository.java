package com.fit.nlu.laptop.repository;

import com.fit.nlu.laptop.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    @Query("SELECT r FROM Review r WHERE r.product.seller.id = :sellerId ORDER BY r.createdAt DESC")
    List<Review> findBySellerIdOrderByCreatedAtDesc(@Param("sellerId") Long sellerId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.seller.id = :sellerId")
    long countBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.seller.id = :sellerId")
    Double avgRatingBySellerId(@Param("sellerId") Long sellerId);
}