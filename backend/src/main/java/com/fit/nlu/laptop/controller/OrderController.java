package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.entity.Address;
import com.fit.nlu.laptop.entity.Order;
import com.fit.nlu.laptop.entity.OrderItem;
import com.fit.nlu.laptop.entity.User;
import com.fit.nlu.laptop.entity.enums.NotificationType;
import com.fit.nlu.laptop.jwt.UserPrincipal;
import com.fit.nlu.laptop.repository.AddressRepository;
import com.fit.nlu.laptop.repository.OrderRepository;
import com.fit.nlu.laptop.repository.UserRepository;
import com.fit.nlu.laptop.service.NotificationService;
import com.fit.nlu.laptop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final com.fit.nlu.laptop.repository.ProductRepository productRepository;
    private final com.fit.nlu.laptop.repository.OrderItemRepository orderItemRepository;
    private final OrderService orderService;
    private final NotificationService notificationService;
    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findById(principal.getId().longValue()).orElseThrow();
        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal == null) return ResponseEntity.status(401).build();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        if (!order.getUser().getId().equals(principal.getId().longValue())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(order);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal == null) return ResponseEntity.status(401).build();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        if (!order.getUser().getId().equals(principal.getId().longValue())) {
            return ResponseEntity.status(403).build();
        }
        if (!List.of("PENDING", "PROCESSING").contains(order.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể hủy đơn hàng ở trạng thái hiện tại"));
        }
        order.setStatus("CANCELLED");
        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("message", "Đã hủy đơn hàng"));
    }

    @PutMapping("/{id}/return-request")
    public ResponseEntity<?> requestReturn(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal == null) return ResponseEntity.status(401).build();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        if (!order.getUser().getId().equals(principal.getId().longValue())) {
            return ResponseEntity.status(403).build();
        }
        if (!"DELIVERED".equals(order.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Chỉ có thể yêu cầu trả hàng sau khi đã giao"));
        }
        order.setStatus("RETURN_REQUESTED");
        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("message", "Đã gửi yêu cầu trả hàng"));
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> orderRequest
    ) {

        try {

            if (principal == null) {
                return ResponseEntity.status(401).build();
            }

            User user = userRepository
                    .findById(principal.getId().longValue())
                    .orElseThrow();

            Order order =
                    orderService.createOrder(user, orderRequest);
            notificationService.sendNotification(
                    user.getId(),
                    NotificationType.ORDER,
                    "Đặt hàng thành công",
                    "Đơn hàng #" + order.getId() + " của bạn đã được tạo thành công"
            );
            return ResponseEntity.ok(order);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message", e.getMessage()
                    )
            );
        }
    }

}
