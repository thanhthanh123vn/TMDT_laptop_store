package com.fit.nlu.laptop.service.impl;

import com.fit.nlu.laptop.config.VNPayConfig;
import com.fit.nlu.laptop.entity.Order;
import com.fit.nlu.laptop.repository.OrderRepository;
import com.fit.nlu.laptop.service.VNPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class VNPayServiceImpl implements VNPayService {

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public boolean verifySignature(Map<String, String> queryParams) {
        String vnp_SecureHash = queryParams.get("vnp_SecureHash");
        if (vnp_SecureHash == null || vnp_SecureHash.isBlank()) {
            return false;
        }

        Map<String, String> fields = new HashMap<>(queryParams);
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");


        String hashData = VNPayConfig.buildReturnHashData(fields);
        String signValue = VNPayConfig.hmacSHA512(VNPayConfig.secretKey, hashData);
        return signValue.equalsIgnoreCase(vnp_SecureHash);
    }

    @Override
    public void updateOrderStatus(String vnp_TxnRef, String status) {
        Order order = orderRepository.findById(Long.parseLong(vnp_TxnRef))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        order.setStatus(status);
        orderRepository.save(order);
    }
}
