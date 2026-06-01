package com.fit.nlu.laptop.repository;

import com.fit.nlu.laptop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Product> {
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findBySellerId(Long sellerId);
    long countBySellerId(Long sellerId);

    // Seller product management - exclude soft-deleted
    List<Product> findBySellerIdAndIsDeletedFalse(Long sellerId);
    long countBySellerIdAndIsDeletedFalse(Long sellerId);

    @Query("SELECT p FROM Product p WHERE p.seller.id = :sellerId AND p.isDeleted = false " +
           "AND (:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
           "AND (:categoryId IS NULL OR p.categoryId = :categoryId) " +
           "AND (:brand IS NULL OR LOWER(p.brand) = LOWER(:brand)) " +
           "AND (:approved IS NULL OR p.approved = :approved) " +
           "AND (:inStock IS NULL OR (:inStock = true AND p.stock > 0) OR (:inStock = false AND p.stock = 0))")
    List<Product> findSellerProducts(
            @Param("sellerId") Long sellerId,
            @Param("name") String name,
            @Param("categoryId") Long categoryId,
            @Param("brand") String brand,
            @Param("approved") Boolean approved,
            @Param("inStock") Boolean inStock
    );

    // For public listing - only approved, not deleted
    @Query("SELECT p FROM Product p WHERE p.isDeleted = false AND p.approved = true " +
           "AND (:categoryId IS NULL OR p.categoryId = :categoryId)")
    List<Product> findPublicProducts(@Param("categoryId") Long categoryId);

    Optional<Product> findByIdAndIsDeletedFalse(Long id);
}
