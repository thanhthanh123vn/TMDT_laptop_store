package com.fit.nlu.laptop.repository;

import com.fit.nlu.laptop.entity.Order;
import com.fit.nlu.laptop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
}
