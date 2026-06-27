package com.fit.nlu.laptop.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Configuration
public class VNPayConfig {

    public static String vnp_TmnCode;
    public static String secretKey;
    public static String vnp_PayUrl;
    public static String vnp_ApiUrl;
    public static String vnp_ReturnUrl;

    @Value("${vnpay.tmn-code:7UWK3F28}")
    public void setVnpTmnCode(String code) {
        vnp_TmnCode = code;
    }

    @Value("${vnpay.secret-key:AR8C4EF8LLT9DSI1CER8GQVL7K4Q1SA0}")
    public void setSecretKey(String key) {
        secretKey = key;
    }

    @Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    public void setVnpPayUrl(String url) {
        vnp_PayUrl = url;
    }

    @Value("${vnpay.api-url:https://sandbox.vnpayment.vn/merchant_webapi/api/transaction}")
    public void setVnpApiUrl(String url) {
        vnp_ApiUrl = url;
    }

    @Value("${vnpay.return-url:http://localhost:5173/checkout/vnpay-return}")
    public void setVnpReturnUrl(String url) {
        vnp_ReturnUrl = url;
    }
    /** VNPay yêu cầu encode theo UTF-8, khoảng trắng dùng %20 thay vì + */
    public static String vnpayUrlEncode(String value) {
        if (value == null) {
            return "";
        }

        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    /** Tạo chuỗi hash khi gửi sang VNPay (Trong VNPay 2.1.0, HashData giống hệt Query String) */
    public static String buildPaymentHashData(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames); // Sắp xếp theo Alphabet

        List<String> segments = new ArrayList<>();
        for (String fieldName : fieldNames) {
            String fieldValue = params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {

                segments.add(vnpayUrlEncode(fieldName) + "=" + vnpayUrlEncode(fieldValue));
            }
        }
        return String.join("&", segments);
    }

    public static String buildPaymentQuery(Map<String, String> params) {
        return buildPaymentHashData(params);
    }

    /** Xác minh chữ ký callback/IPN: dùng giá trị tham số đã decode */
    public static String buildReturnHashData(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        List<String> segments = new ArrayList<>();
        for (String fieldName : fieldNames) {
            String fieldValue = params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {

                segments.add(fieldName + "=" + fieldValue);
            }
        }
        return String.join("&", segments);
    }

    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKeySpec = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKeySpec);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    public static String getIpAddress(HttpServletRequest request) {
        String ipAddress;
        try {
            ipAddress = request.getHeader("X-FORWARDED-FOR");
            if (ipAddress == null || ipAddress.isBlank()) {
                ipAddress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAddress = "127.0.0.1";
        }
        return normalizeIpAddress(ipAddress);
    }

    public static String normalizeIpAddress(String ipAddress) {
        if (ipAddress == null || ipAddress.isBlank()) {
            return "127.0.0.1";
        }
        if (ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }
        if ("0:0:0:0:0:0:0:1".equals(ipAddress) || "::1".equals(ipAddress)) {
            return "127.0.0.1";
        }
        return ipAddress;
    }

    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }
}