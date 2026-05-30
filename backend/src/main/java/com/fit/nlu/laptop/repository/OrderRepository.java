package com.fit.nlu.laptop.repository;

import com.fit.nlu.laptop.entity.Order;
import com.fit.nlu.laptop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);


    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END " +
            "FROM Order o JOIN o.items i " +
            "WHERE o.user.id = :userId " +
            "AND i.product.id = :productId " +
            "AND o.status = 'PROCESSING'")
    boolean hasUserPurchasedProduct(@Param("userId") Long userId, @Param("productId") Long productId);
}
