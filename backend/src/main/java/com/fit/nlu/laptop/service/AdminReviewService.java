package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.dto.response.PagedResponse;
import com.fit.nlu.laptop.entity.Review;
import com.fit.nlu.laptop.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminReviewService {

    private final ReviewRepository reviewRepository;

    public PagedResponse<Map<String, Object>> listReviews(
            int page,
            int size,
            String keyword,
            Integer rating
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);

        Pageable pageable = PageRequest.of(safePage - 1, safeSize, Sort.by("createdAt").descending());
        Specification<Review> spec = buildReviewSpec(keyword, rating);

        Page<Review> reviewPage = reviewRepository.findAll(spec, pageable);
        List<Map<String, Object>> items = reviewPage.getContent().stream().map(this::toReviewItem).toList();

        return new PagedResponse<>(
                items,
                safePage,
                safeSize,
                reviewPage.getTotalElements(),
                reviewPage.getTotalPages()
        );
    }

    public Map<String, Object> deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá"));
        reviewRepository.delete(review);
        return Map.of("message", "Đã xóa đánh giá thành công");
    }

    private Specification<Review> buildReviewSpec(String keyword, Integer rating) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (rating != null) {
                predicates.add(cb.equal(root.get("rating"), rating));
            }

            if (keyword != null && !keyword.isBlank()) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                Predicate commentLike = cb.like(cb.lower(root.get("comment")), likePattern);
                Predicate userNameLike = cb.like(cb.lower(root.get("user").get("fullName")), likePattern);
                Predicate productNameLike = cb.like(cb.lower(root.get("product").get("name")), likePattern);
                predicates.add(cb.or(commentLike, userNameLike, productNameLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Map<String, Object> toReviewItem(Review review) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", review.getId());
        map.put("rating", review.getRating());
        map.put("comment", review.getComment());
        map.put("createdAt", review.getCreatedAt());
        map.put("sellerReply", review.getSellerReply());
        map.put("repliedAt", review.getRepliedAt());

        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("id", review.getUser().getId());
        userMap.put("fullName", review.getUser().getFullName());
        userMap.put("email", review.getUser().getEmail());
        map.put("user", userMap);

        Map<String, Object> productMap = new LinkedHashMap<>();
        productMap.put("id", review.getProduct().getId());
        productMap.put("name", review.getProduct().getName());
        productMap.put("imageUrl", review.getProduct().getImageUrl());
        map.put("product", productMap);

        return map;
    }
}
