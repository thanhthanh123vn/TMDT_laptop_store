package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.entity.Review;
import java.util.List;

public interface ReviewService {
    List<Review> getReviewsByProductId(Long productId);
    Review createReview(Long productId, Long userId, int rating, String comment);
    Review replyToReview(Long reviewId, Long sellerUserId, String replyContent);
}