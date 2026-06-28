package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.config.VNPayConfig;
import com.fit.nlu.laptop.service.VNPayService;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin("*")
public class PaymentController {
    @Autowired
    private VNPayService vnpayService;

    @GetMapping("/vnpay/create")
    public ResponseEntity<?> createPayment(HttpServletRequest request,
                                           @RequestParam("amount") long amount,
                                           @RequestParam("orderInfo") String orderInfo,
                                           @RequestParam(value = "bankCode", required = false) String bankCode) {
        try {
            long amountVNPay = amount * 100;
            Map<String, String> vnp_Params = new HashMap<>();

            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", VNPayConfig.vnp_TmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amountVNPay));
            vnp_Params.put("vnp_CurrCode", "VND");


            vnp_Params.put("vnp_TxnRef", VNPayConfig.getRandomNumber(8));
            vnp_Params.put("vnp_OrderInfo", orderInfo);
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", VNPayConfig.vnp_ReturnUrl);
            vnp_Params.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));

//            if (bankCode != null && !bankCode.isEmpty()) {
//                vnp_Params.put("vnp_BankCode", bankCode);
//            }
            vnp_Params.put("vnp_Locale", "vn");
            TimeZone vnTz = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");
            Calendar cld = Calendar.getInstance(vnTz);
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            formatter.setTimeZone(vnTz);

            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            String hashData = VNPayConfig.buildPaymentHashData(vnp_Params);
            String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.secretKey, hashData);
            String query = VNPayConfig.buildPaymentQuery(vnp_Params);
            String paymentUrl = VNPayConfig.vnp_PayUrl + "?" + query + "&vnp_SecureHash=" + vnp_SecureHash;

            Map<String, String> response = new HashMap<>();
            response.put("paymentUrl", paymentUrl);
            response.put("txnRef", vnp_Params.get("vnp_TxnRef"));
            System.out.println(paymentUrl);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Create payment failed");
        }
    }

    @GetMapping("/vnpay/return")
    public ResponseEntity<?> paymentReturn(@RequestParam Map<String, String> queryParams) {
        if (!vnpayService.verifySignature(queryParams)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "Chữ ký không hợp lệ"
            ));
        }

        String responseCode = queryParams.get("vnp_ResponseCode");
        if ("00".equals(responseCode)) {
            String txnRef = queryParams.get("vnp_TxnRef");
            try {
                vnpayService.updateOrderStatus(txnRef, "PAID");
            } catch (RuntimeException ignored) {
                // TxnRef có thể chưa map với order id — vẫn báo thanh toán thành công
            }
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Thanh toán thành công",
                    "txnRef", txnRef != null ? txnRef : ""
            ));
        }

        return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Thanh toán thất bại",
                "responseCode", responseCode != null ? responseCode : ""
        ));
    }

    @PostMapping("/credit-card")
    public ResponseEntity<?> pay(
            @RequestBody Map<String, Object> payload
    ) {

        try {

            System.out.println(payload);

            Object tokenObj = payload.get("token");
            Object amountObj = payload.get("amount");
            Object currencyObj = payload.get("currency");

            if (tokenObj == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Token bị null")
                );
            }

            if (amountObj == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Amount bị null")
                );
            }

            if (currencyObj == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Currency bị null")
                );
            }

            String paymentMethodId = tokenObj.toString();

            Long amount =
                    Long.valueOf(amountObj.toString());

            String currency =
                    currencyObj.toString();

            PaymentIntentCreateParams params =
                    PaymentIntentCreateParams.builder()
                            .setAmount(amount)
                            .setCurrency(currency)
                            .setPaymentMethod(paymentMethodId)
                            .setConfirm(true)
                            .setAutomaticPaymentMethods(
                                    PaymentIntentCreateParams
                                            .AutomaticPaymentMethods
                                            .builder()
                                            .setEnabled(true)
                                            .setAllowRedirects(
                                                    PaymentIntentCreateParams
                                                            .AutomaticPaymentMethods
                                                            .AllowRedirects
                                                            .NEVER
                                            )
                                            .build()
                            )
                            .build();

            PaymentIntent paymentIntent =
                    PaymentIntent.create(params);

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "paymentIntentId", paymentIntent.getId(),
                            "status", paymentIntent.getStatus()
                    )
            );

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
