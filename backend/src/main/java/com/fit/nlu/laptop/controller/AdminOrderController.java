package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.entity.Order;
import com.fit.nlu.laptop.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderRepository orderRepository;

    private static final List<String> VALID_STATUSES =
            List.of("PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED");

    @GetMapping
    public ResponseEntity<?> listOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword
    ) {
        int safePage = Math.max(page - 1, 0);
        int safeSize = Math.max(size, 1);

        Page<Order> orderPage = orderRepository.findAll(
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        List<Map<String, Object>> items = orderPage.getContent().stream()
                .filter(o -> status == null || status.isBlank() || status.equalsIgnoreCase(o.getStatus()))
                .filter(o -> {
                    if (keyword == null || keyword.isBlank()) return true;
                    String kw = keyword.toLowerCase();
                    return (o.getOrderCode() != null && o.getOrderCode().toLowerCase().contains(kw))
                            || (o.getFullName() != null && o.getFullName().toLowerCase().contains(kw))
                            || (o.getPhone() != null && o.getPhone().contains(kw));
                })
                .map(this::toOrderItem)
                .toList();

        return ResponseEntity.ok(Map.of(
                "items", items,
                "page", page,
                "size", safeSize,
                "totalItems", orderPage.getTotalElements(),
                "totalPages", orderPage.getTotalPages()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        Order order = findOrder(id);
        return ResponseEntity.ok(toOrderDetail(order));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        String status = body.get("status") != null ? String.valueOf(body.get("status")).toUpperCase() : null;
        if (status == null || !VALID_STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Trạng thái không hợp lệ. Các giá trị hợp lệ: " + VALID_STATUSES);
        }

        Order order = findOrder(id);
        order.setStatus(status);
        orderRepository.save(order);

        return ResponseEntity.ok(Map.of(
                "message", "Cập nhật trạng thái thành công",
                "id", id,
                "status", status
        ));
    }

    private Order findOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Đơn hàng không tồn tại"));
    }

    private Map<String, Object> toOrderItem(Order order) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", order.getId());
        data.put("orderCode", order.getOrderCode());
        data.put("customerName", order.getFullName());
        data.put("customerEmail", order.getUser() != null ? order.getUser().getEmail() : "");
        data.put("phone", order.getPhone());
        data.put("address", order.getAddress());
        data.put("totalAmount", order.getTotalAmount());
        data.put("status", order.getStatus());
        data.put("paymentMethod", order.getPaymentMethod());
        data.put("paymentStatus", order.getPaymentStatus());
        data.put("createdAt", order.getCreatedAt());
        data.put("itemCount", order.getItems() != null ? order.getItems().size() : 0);
        return data;
    }

    private Map<String, Object> toOrderDetail(Order order) {
        Map<String, Object> data = toOrderItem(order);
        if (order.getItems() != null) {
            data.put("items", order.getItems().stream().map(item -> {
                Map<String, Object> i = new LinkedHashMap<>();
                i.put("id", item.getId());
                i.put("productId", item.getProduct() != null ? item.getProduct().getId() : null);
                i.put("productName", item.getProduct() != null ? item.getProduct().getName() : "");
                i.put("imageUrl", item.getProduct() != null ? item.getProduct().getImageUrl() : "");
                i.put("quantity", item.getQuantity());
                i.put("price", item.getPrice());
                return i;
            }).toList());
        }
        return data;
    }
}
