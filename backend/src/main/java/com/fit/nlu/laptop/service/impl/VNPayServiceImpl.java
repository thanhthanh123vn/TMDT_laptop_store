package com.fit.nlu.laptop.service.impl;

import com.fit.nlu.laptop.config.VNPayConfig;
import com.fit.nlu.laptop.entity.Order;
import com.fit.nlu.laptop.repository.OrderRepository;
import com.fit.nlu.laptop.service.VNPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class VNPayServiceImpl implements VNPayService {

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public boolean verifySignature(Map<String, String> queryParams) {
        String vnp_SecureHash = queryParams.get("vnp_SecureHash");

        // Loại bỏ SecureHash khỏi map để tính toán lại hash
        Map<String, String> fields = new HashMap<>(queryParams);
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        // Sắp xếp các tham số theo thứ tự alphabet
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName).append('=').append(fieldValue);
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        // Dùng hàm băm HMAC-SHA512 để kiểm tra
        String signValue = VNPayConfig.hmacSHA512(VNPayConfig.secretKey, hashData.toString());
        return signValue.equals(vnp_SecureHash);
    }

    @Override
    public void updateOrderStatus(String vnp_TxnRef, String status) {
        // Tìm đơn hàng theo mã tham chiếu và cập nhật trạng thái
        // Lưu ý: vnp_TxnRef thường là ID đơn hàng bạn tạo ra lúc đầu
        Order order = orderRepository.findById(Long.parseLong(vnp_TxnRef))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        order.setStatus(status);
        orderRepository.save(order);
    }
}