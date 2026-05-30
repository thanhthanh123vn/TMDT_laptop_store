package com.fit.nlu.laptop.service.impl;

import com.fit.nlu.laptop.entity.Product;
import com.fit.nlu.laptop.entity.Review;
import com.fit.nlu.laptop.entity.User;
import com.fit.nlu.laptop.repository.ProductRepository;
import com.fit.nlu.laptop.repository.ReviewRepository;
import com.fit.nlu.laptop.repository.UserRepository;
import com.fit.nlu.laptop.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {


    private final ReviewRepository reviewRepository;


    private final ProductRepository productRepository;


    private final UserRepository userRepository;

    @Override
    public List<Review> getReviewsByProductId(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    @Override
    public Review createReview(Long productId, Long userId, int rating, String comment) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(rating);
        review.setComment(comment);

        return reviewRepository.save(review);
    }
}