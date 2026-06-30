package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.entity.*;
import com.fit.nlu.laptop.repository.AddressRepository;
import com.fit.nlu.laptop.repository.OrderItemRepository;
import com.fit.nlu.laptop.repository.OrderRepository;
import com.fit.nlu.laptop.repository.ProductRepository;
import com.fit.nlu.laptop.repository.SellerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final SellerProfileRepository sellerProfileRepository;

    // Statuses seller is allowed to set
    private static final List<String> SELLER_ALLOWED_STATUSES =
            List.of("PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED");
    private static final String RETURN_REQUESTED = "RETURN_REQUESTED";

    public Order createOrder(User user, Map<String, Object> orderRequest) {



        Long addressId = Long.valueOf(
                orderRequest.get("addressId").toString()
        );

        Address shippingAddress = addressRepository
                .findById(addressId)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy địa chỉ"));



        Order order = new Order();

        order.setUser(user);

        order.setOrderCode("LTR-" + System.currentTimeMillis());

        order.setTotalAmount(
                new BigDecimal(
                        orderRequest.get("totalAmount").toString()
                )
        );

        order.setFullName(shippingAddress.getFullName());

        order.setPhone(shippingAddress.getPhone());
        order.setPaymentMethod(orderRequest.get("paymentMethod").toString());

        order.setAddress(
                shippingAddress.getStreetAddress()
                        + ", "
                        + shippingAddress.getWard()
                        + ", "
                        + shippingAddress.getDistrict()
                        + ", "
                        + shippingAddress.getProvince()
        );


        order.setStatus("PROCESSING");

        Order savedOrder = orderRepository.save(order);



        List<Map<String, Object>> items =
                (List<Map<String, Object>>) orderRequest.get("items");

        for (Map<String, Object> itemData : items) {

            OrderItem item = new OrderItem();

            item.setOrder(savedOrder);

            Long productId = Long.valueOf(
                    itemData.get("productId").toString()
            );

            Product product = productRepository
                    .findById(productId)
                    .orElseThrow(() ->
                            new RuntimeException("Không tìm thấy sản phẩm"));

            item.setProduct(product);

            item.setQuantity(
                    Integer.valueOf(
                            itemData.get("quantity").toString()
                    )
            );

            item.setPrice(
                    new BigDecimal(
                            itemData.get("price").toString()
                    )
            );

            orderItemRepository.save(item);
        }

        return savedOrder;
    }



    public boolean hasUserPurchasedProduct(Long userId, Long productId) {
        return orderRepository.hasUserPurchasedProduct(userId, productId);
    }

    // ─── Seller Order Methods ─────────────────────────────────────────────────

    public List<Map<String, Object>> getSellerOrders(Long userId) {
        SellerProfile seller = sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ người bán"));
        List<Order> orders = orderRepository.findBySellerIdOrderByCreatedAtDesc(seller.getId());
        List<Map<String, Object>> result = new ArrayList<>();
        for (Order o : orders) {
            result.add(toSellerOrderSummary(o, seller.getId()));
        }
        return result;
    }

    public Map<String, Object> getSellerOrderDetail(Long userId, Long orderId) {
        SellerProfile seller = sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ người bán"));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));

        // Check this order belongs to seller
        boolean belongs = order.getItems().stream()
                .anyMatch(i -> i.getProduct() != null
                        && i.getProduct().getSeller() != null
                        && i.getProduct().getSeller().getId().equals(seller.getId()));
        if (!belongs) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền xem đơn hàng này");

        Map<String, Object> data = toSellerOrderSummary(order, seller.getId());

        // Buyer info
        User buyer = order.getUser();
        if (buyer != null) {
            data.put("buyerEmail", buyer.getEmail());
            data.put("buyerPhone", buyer.getPhone());
            data.put("buyerId", buyer.getId());
        }

        // Only items belonging to this seller
        List<Map<String, Object>> items = order.getItems().stream()
                .filter(i -> i.getProduct() != null
                        && i.getProduct().getSeller() != null
                        && i.getProduct().getSeller().getId().equals(seller.getId()))
                .map(i -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id", i.getId());
                    item.put("productId", i.getProduct().getId());
                    item.put("productName", i.getProduct().getName());
                    item.put("imageUrl", i.getProduct().getImageUrl());
                    item.put("brand", i.getProduct().getBrand());
                    item.put("cpu", i.getProduct().getCpu());
                    item.put("ram", i.getProduct().getRam());
                    item.put("storage", i.getProduct().getStorage());
                    item.put("quantity", i.getQuantity());
                    item.put("price", i.getPrice());
                    return item;
                }).toList();
        data.put("items", items);

        return data;
    }

    public Map<String, Object> updateSellerOrderStatus(Long userId, Long orderId, String newStatus) {
        SellerProfile seller = sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ người bán"));

        String status = newStatus.toUpperCase();
        if (!SELLER_ALLOWED_STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Seller không được phép đặt trạng thái này. Các trạng thái hợp lệ: " + SELLER_ALLOWED_STATUSES);
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));

        boolean belongs = order.getItems().stream()
                .anyMatch(i -> i.getProduct() != null
                        && i.getProduct().getSeller() != null
                        && i.getProduct().getSeller().getId().equals(seller.getId()));
        if (!belongs) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền cập nhật đơn hàng này");

        // Cannot change a RETURN_REQUESTED order unless delivering/cancelling
        if (RETURN_REQUESTED.equals(order.getStatus()) && !List.of("DELIVERED", "CANCELLED").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Đơn hàng đang yêu cầu trả hàng, chỉ có thể chấp nhận (DELIVERED) hoặc từ chối (CANCELLED)");
        }

        order.setStatus(status);
        orderRepository.save(order);

        return Map.of("message", "Cập nhật trạng thái thành công", "orderId", orderId, "status", status);
    }

    private Map<String, Object> toSellerOrderSummary(Order o, Long sellerId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", o.getId());
        data.put("orderCode", o.getOrderCode());
        data.put("status", o.getStatus());
        data.put("totalAmount", o.getTotalAmount());
        data.put("fullName", o.getFullName());
        data.put("phone", o.getPhone());
        data.put("address", o.getAddress());
        data.put("paymentMethod", o.getPaymentMethod());
        data.put("paymentStatus", o.getPaymentStatus());
        data.put("createdAt", o.getCreatedAt());
        data.put("updatedAt", o.getUpdatedAt());
        int itemCount = (int) o.getItems().stream()
                .filter(i -> i.getProduct() != null
                        && i.getProduct().getSeller() != null
                        && i.getProduct().getSeller().getId().equals(sellerId))
                .count();
        data.put("itemCount", itemCount);
        return data;
    }

    public List<Order> findOrdersByBuyerAndShop(Long buyerId, Long shopId) {
        return orderRepository.findOrdersByBuyerAndSeller(buyerId, shopId);
    }
}