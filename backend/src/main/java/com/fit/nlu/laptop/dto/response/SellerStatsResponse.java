package com.fit.nlu.laptop.dto.response;

import java.math.BigDecimal;

public record SellerStatsResponse(
        long totalProducts,
        long totalOrders,
        long totalReviews,
        double avgRating,
        BigDecimal totalRevenue
) {}
