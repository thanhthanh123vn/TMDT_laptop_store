package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.entity.Order;
import com.fit.nlu.laptop.entity.User;
import com.fit.nlu.laptop.jwt.UserPrincipal;
import com.fit.nlu.laptop.repository.OrderRepository;
import com.fit.nlu.laptop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final com.fit.nlu.laptop.repository.ProductRepository productRepository;
    private final com.fit.nlu.laptop.repository.OrderItemRepository orderItemRepository;

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findById(principal.getId().longValue()).orElseThrow();
        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(orders);
    }

    @org.springframework.web.bind.annotation.PostMapping
    public ResponseEntity<?> createOrder(@AuthenticationPrincipal UserPrincipal principal, @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> orderRequest) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findById(principal.getId().longValue()).orElseThrow();

        Order order = new Order();
        order.setUser(user);
        order.setOrderCode("LTR-" + System.currentTimeMillis());
        order.setTotalAmount(new java.math.BigDecimal(orderRequest.get("totalAmount").toString()));
        order.setFullName(orderRequest.get("fullName").toString());
        order.setPhone(orderRequest.get("phone").toString());
        order.setAddress(orderRequest.get("address").toString());
        order.setStatus("PROCESSING");
        
        final Order savedOrder = orderRepository.save(order);

        List<java.util.Map<String, Object>> items = (List<java.util.Map<String, Object>>) orderRequest.get("items");
        for (java.util.Map<String, Object> itemData : items) {
            com.fit.nlu.laptop.entity.OrderItem item = new com.fit.nlu.laptop.entity.OrderItem();
            item.setOrder(savedOrder);
            Long productId = Long.valueOf(itemData.get("productId").toString());
            item.setProduct(productRepository.findById(productId).orElseThrow());
            item.setQuantity(Integer.valueOf(itemData.get("quantity").toString()));
            item.setPrice(new java.math.BigDecimal(itemData.get("price").toString()));
            orderItemRepository.save(item);
        }

        return ResponseEntity.ok(savedOrder);
    }
}
