package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.entity.*;
import com.fit.nlu.laptop.repository.AddressRepository;
import com.fit.nlu.laptop.repository.OrderItemRepository;
import com.fit.nlu.laptop.repository.OrderRepository;
import com.fit.nlu.laptop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    private final OrderItemRepository orderItemRepository;

    private final ProductRepository productRepository;

    private final AddressRepository addressRepository;

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
}