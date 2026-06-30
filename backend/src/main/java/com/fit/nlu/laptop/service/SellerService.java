package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.dto.request.UpdateSellerProfileReq;
import com.fit.nlu.laptop.dto.response.SellerStatsResponse;
import com.fit.nlu.laptop.entity.Review;
import com.fit.nlu.laptop.entity.SellerProfile;
import com.fit.nlu.laptop.entity.User;
import com.fit.nlu.laptop.repository.OrderRepository;
import com.fit.nlu.laptop.repository.ProductRepository;
import com.fit.nlu.laptop.repository.ReviewRepository;
import com.fit.nlu.laptop.repository.SellerProfileRepository;
import com.fit.nlu.laptop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final SellerProfileRepository sellerProfileRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public SellerProfile getProfile(Long userId) {
        return sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ người bán"));
    }

    /** Returns combined seller profile + user info (phone, avatarUrl, fullName, email) */
    public Map<String, Object> getProfileWithUser(Long userId) {
        SellerProfile profile = getProfile(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", profile.getId());
        result.put("storeName", profile.getStoreName());
        result.put("rating", profile.getRating());
        result.put("status", profile.getStatus());
        result.put("approved", profile.isApproved());
        result.put("warehouseProvince", profile.getWarehouseProvince());
        result.put("warehouseDistrict", profile.getWarehouseDistrict());
        result.put("warehouseWard", profile.getWarehouseWard());
        result.put("warehouseStreet", profile.getWarehouseStreet());
        result.put("bankName", profile.getBankName());
        result.put("bankAccountNumber", profile.getBankAccountNumber());
        result.put("bankAccountHolder", profile.getBankAccountHolder());
        // from user
        result.put("fullName", user.getFullName());
        result.put("email", user.getEmail());
        result.put("phone", user.getPhone());
        result.put("avatarUrl", user.getAvatarUrl());
        return result;
    }

    public SellerProfile updateProfile(Long userId, UpdateSellerProfileReq req) {
        SellerProfile profile = getProfile(userId);
        if (req.storeName() != null && !req.storeName().isBlank()) profile.setStoreName(req.storeName());
        if (req.warehouseProvince() != null) profile.setWarehouseProvince(req.warehouseProvince());
        if (req.warehouseDistrict() != null) profile.setWarehouseDistrict(req.warehouseDistrict());
        if (req.warehouseWard() != null) profile.setWarehouseWard(req.warehouseWard());
        if (req.warehouseStreet() != null) profile.setWarehouseStreet(req.warehouseStreet());
        if (req.bankName() != null) profile.setBankName(req.bankName());
        if (req.bankAccountNumber() != null) profile.setBankAccountNumber(req.bankAccountNumber());
        if (req.bankAccountHolder() != null) profile.setBankAccountHolder(req.bankAccountHolder());
        return sellerProfileRepository.save(profile);
    }

    public SellerStatsResponse getStats(Long userId) {
        SellerProfile profile = getProfile(userId);
        Long sellerId = profile.getId();

        long totalProducts = productRepository.countBySellerIdAndIsDeletedFalse(sellerId);
        long totalOrders = orderRepository.countBySellerId(sellerId);
        long totalReviews = reviewRepository.countBySellerId(sellerId);
        Double avgRating = reviewRepository.avgRatingBySellerId(sellerId);
        BigDecimal totalRevenue = orderRepository.sumRevenueBySellerId(sellerId);

        return new SellerStatsResponse(
                totalProducts,
                totalOrders,
                totalReviews,
                avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0,
                totalRevenue != null ? totalRevenue : BigDecimal.ZERO
        );
    }

    public List<Review> getReviews(Long userId) {
        SellerProfile profile = getProfile(userId);
        return reviewRepository.findBySellerIdOrderByCreatedAtDesc(profile.getId());
    }
    public SellerProfile getProfileById(Long shopId) {

        return sellerProfileRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin cửa hàng với ID: " + shopId));
    }
}
