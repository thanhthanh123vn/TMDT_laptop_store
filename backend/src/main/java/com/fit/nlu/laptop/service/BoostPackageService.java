package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.config.VNPayConfig;
import com.fit.nlu.laptop.entity.BoostPackage;
import com.fit.nlu.laptop.entity.Product;
import com.fit.nlu.laptop.entity.SellerProfile;
import com.fit.nlu.laptop.repository.BoostPackageRepository;
import com.fit.nlu.laptop.repository.ProductRepository;
import com.fit.nlu.laptop.repository.SellerProfileRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BoostPackageService {

    private final BoostPackageRepository boostPackageRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final ProductRepository productRepository;

    private static final Map<Integer, BigDecimal> PRICE_TABLE;
    static {
        PRICE_TABLE = new java.util.LinkedHashMap<>();
        PRICE_TABLE.put(1,  BigDecimal.valueOf(99_000));
        PRICE_TABLE.put(3,  BigDecimal.valueOf(249_000));
        PRICE_TABLE.put(6,  BigDecimal.valueOf(449_000));
        PRICE_TABLE.put(12, BigDecimal.valueOf(799_000));
    }

    public Map<Integer, BigDecimal> getPriceTable() {
        return PRICE_TABLE;
    }

    // ─── Lấy lịch sử gói của seller ─────────────────────────────────────────

    public List<BoostPackage> getSellerPackages(Long userId) {
        SellerProfile seller = getSellerProfile(userId);
        return boostPackageRepository.findBySellerId(seller.getId());
    }

    // ─── Tạo gói + URL thanh toán VNPay ─────────────────────────────────────

    @Transactional
    public Map<String, Object> createPaymentUrl(Long userId, Long productId,
                                                int durationMonths, HttpServletRequest request) {
        // Validate duration
        if (!PRICE_TABLE.containsKey(durationMonths)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời hạn không hợp lệ");
        }

        SellerProfile seller = getSellerProfile(userId);

        // Validate product belongs to seller and in stock
        Product product = productRepository.findByIdAndIsDeletedFalse(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sản phẩm không thuộc về bạn");
        }
        if (product.getStock() == null || product.getStock() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sản phẩm đã hết hàng");
        }

        BigDecimal amount = PRICE_TABLE.get(durationMonths);
        String txnRef = VNPayConfig.getRandomNumber(8) + System.currentTimeMillis() % 10000;

        // Tạo bản ghi gói trước khi thanh toán
        BoostPackage pkg = new BoostPackage();
        pkg.setTxnRef(txnRef);
        pkg.setSeller(seller);
        pkg.setProduct(product);
        pkg.setDurationMonths(durationMonths);
        pkg.setAmount(amount);
        pkg.setStatus("PENDING_PAYMENT");
        boostPackageRepository.save(pkg);

        String paymentUrl = buildVNPayUrl(txnRef, amount.longValue(),
                "Goi day tin " + durationMonths + " thang san pham " + productId, request);

        Map<String, Object> result = new HashMap<>();
        result.put("paymentUrl", paymentUrl);
        result.put("txnRef", txnRef);
        result.put("packageId", pkg.getId());
        return result;
    }

    // ─── Xử lý callback VNPay cho boost ─────────────────────────────────────

    @Transactional
    public void handlePaymentReturn(String txnRef, String responseCode) {
        BoostPackage pkg = boostPackageRepository.findByTxnRef(txnRef)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy gói đẩy tin"));

        if (!"PENDING_PAYMENT".equals(pkg.getStatus())) return; // idempotent

        if ("00".equals(responseCode)) {
            pkg.setStatus("PENDING_APPROVAL");
            pkg.setPurchasedAt(LocalDateTime.now());
        } else {
            pkg.setStatus("CANCELLED");
        }
        boostPackageRepository.save(pkg);
    }

    // ─── Admin: lấy danh sách chờ duyệt ─────────────────────────────────────

    public List<BoostPackage> getPendingApproval() {
        return boostPackageRepository.findByStatus("PENDING_APPROVAL");
    }

    public List<BoostPackage> getAllPackages() {
        return boostPackageRepository.findAll();
    }

    // ─── Admin: duyệt gói ────────────────────────────────────────────────────

    @Transactional
    public BoostPackage approvePackage(Long packageId) {
        BoostPackage pkg = findPackage(packageId);
        if (!"PENDING_APPROVAL".equals(pkg.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gói không ở trạng thái chờ duyệt");
        }
        LocalDateTime now = LocalDateTime.now();
        pkg.setStatus("ACTIVE");
        pkg.setApprovedAt(now);
        pkg.setExpiredAt(now.plusMonths(pkg.getDurationMonths()));
        boostPackageRepository.save(pkg);

        // Cập nhật flag boosted trên sản phẩm
        Product p = pkg.getProduct();
        p.setBestSeller(true);
        productRepository.save(p);

        return pkg;
    }

    // ─── Admin: từ chối gói ──────────────────────────────────────────────────

    @Transactional
    public BoostPackage rejectPackage(Long packageId) {
        BoostPackage pkg = findPackage(packageId);
        pkg.setStatus("REJECTED");
        return boostPackageRepository.save(pkg);
    }

    // ─── Seller: chi tiết gói ────────────────────────────────────────────────

    public BoostPackage getPackageDetail(Long userId, Long packageId) {
        SellerProfile seller = getSellerProfile(userId);
        BoostPackage pkg = findPackage(packageId);
        if (!pkg.getSeller().getId().equals(seller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền xem gói này");
        }
        return pkg;
    }

    // ─── Tự động expire gói hết hạn (chạy mỗi 1 giờ) ────────────────────────

    @Scheduled(fixedDelay = 3_600_000)
    @Transactional
    public void expirePackages() {
        List<BoostPackage> expired = boostPackageRepository.findExpiredActive(LocalDateTime.now());
        for (BoostPackage pkg : expired) {
            pkg.setStatus("EXPIRED");
            boostPackageRepository.save(pkg);

            // Tắt boost nếu không còn gói ACTIVE nào khác
            boolean stillBoosted = boostPackageRepository.existsActiveBoostedProduct(pkg.getProduct().getId());
            if (!stillBoosted) {
                Product p = pkg.getProduct();
                p.setBestSeller(false);
                productRepository.save(p);
            }
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private SellerProfile getSellerProfile(Long userId) {
        return sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ người bán"));
    }

    private BoostPackage findPackage(Long id) {
        return boostPackageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy gói đẩy tin"));
    }

    private String buildVNPayUrl(String txnRef, long amount, String orderInfo, HttpServletRequest request) {
        try {
            Map<String, String> params = new HashMap<>();
            params.put("vnp_Version", "2.1.0");
            params.put("vnp_Command", "pay");
            params.put("vnp_TmnCode", VNPayConfig.vnp_TmnCode);
            params.put("vnp_Amount", String.valueOf(amount * 100));
            params.put("vnp_CurrCode", "VND");
            params.put("vnp_TxnRef", txnRef);
            params.put("vnp_OrderInfo", orderInfo);
            params.put("vnp_OrderType", "other");
            params.put("vnp_Locale", "vn");
            params.put("vnp_ReturnUrl", VNPayConfig.vnp_BoostReturnUrl);
            params.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            params.put("vnp_CreateDate", formatter.format(cld.getTime()));
            cld.add(Calendar.MINUTE, 15);
            params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

            // Sort và build — dùng đúng logic như PaymentController gốc
            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();

            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = params.get(fieldName);
                if (fieldValue != null && fieldValue.length() > 0) {
                    hashData.append(fieldName).append('=').append(fieldValue);
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString()))
                            .append('=')
                            .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                        query.append('&');
                    }
                }
            }

            String secureHash = VNPayConfig.hmacSHA512(VNPayConfig.secretKey, hashData.toString());
            query.append("&vnp_SecureHash=").append(secureHash);
            return VNPayConfig.vnp_PayUrl + "?" + query;
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo URL thanh toán VNPay", e);
        }
    }
}
