package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.entity.*;
import com.fit.nlu.laptop.entity.enums.NotificationType;
import com.fit.nlu.laptop.jwt.UserPrincipal;
import com.fit.nlu.laptop.repository.AddressRepository;
import com.fit.nlu.laptop.repository.OrderRepository;
import com.fit.nlu.laptop.repository.UserRepository;
import com.fit.nlu.laptop.service.NotificationService;
import com.fit.nlu.laptop.service.OrderService;
import com.fit.nlu.laptop.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.HashMap;
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
    private final ReviewService reviewService;

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

    @GetMapping("/seller/{id}")
    public ResponseEntity<?> getOrderBySellerId(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal == null) return ResponseEntity.status(401).build();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        return ResponseEntity.ok(order);
    }

    @GetMapping("/orderDetail/{id}")
    public ResponseEntity<?> getOrderDetailById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        if (principal == null) return ResponseEntity.status(401).build();

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

//        if (!order.getUser().getId().equals(principal.getId().longValue())) {
//            return ResponseEntity.status(403).build();
//        }


        String displayProductName = "Đơn hàng rỗng";
        String displayProductImage = "";


        if (order.getItems() != null && !order.getItems().isEmpty()) {
            Product firstProduct = order.getItems().get(0).getProduct();
            displayProductName = firstProduct.getName();
            displayProductImage = firstProduct.getImageUrl();


            if (order.getItems().size() > 1) {
                displayProductName += " và " + (order.getItems().size() - 1) + " sản phẩm khác";
            }
        }


        Map<String, Object> responseData = new HashMap<>();
        responseData.put("id", order.getId());
        responseData.put("status", order.getStatus());
        responseData.put("productName", displayProductName);
        responseData.put("productImage", displayProductImage);

        return ResponseEntity.ok(responseData);
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

    @GetMapping("/user/shop/{shopId}")
    public ResponseEntity<List<Order>> getOrdersByShop(@AuthenticationPrincipal UserPrincipal principal,
                                                       @PathVariable Long shopId) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findById(principal.getId().longValue()).orElseThrow();

        return ResponseEntity.ok(orderService.findOrdersByBuyerAndShop(user.getId(), shopId));
    }

    @GetMapping("{userId}/shop/{shopId}")
    public ResponseEntity<List<Order>> getOrdersForSeller(@PathVariable Long userId,
                                                          @PathVariable Long shopId) {


        return ResponseEntity.ok(orderService.findOrdersByBuyerAndShop(userId, shopId));
    }

    @PostMapping("/{id}/updateOrderStatus/{newStatus}")
    public ResponseEntity<?> updateOrderStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id, @PathVariable String newStatus) {
        if (principal == null) return ResponseEntity.status(401).build();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!List.of("PENDING", "PROCESSING").contains(order.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không thể hủy đơn hàng ở trạng thái hiện tại"));
        }
        order.setStatus(newStatus);
        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("message", "Đã hủy đơn hàng"));
    }
    @GetMapping("/responseCustomer/{productId}")
    public ResponseEntity<?> getResponseCustomer(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId
    ){
        if (principal == null) return ResponseEntity.status(401).build();

        double  countResponseCustomer = orderService.getResponseCustomer(productId);
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("countResponseCustomer", countResponseCustomer);

        return ResponseEntity.ok(responseData);


    }





}
