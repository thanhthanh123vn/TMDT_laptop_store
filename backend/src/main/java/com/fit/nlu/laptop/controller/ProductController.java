package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.dto.response.ProductDetailResponse;
import com.fit.nlu.laptop.entity.Product;
import com.fit.nlu.laptop.entity.Review;
import com.fit.nlu.laptop.entity.User;
import com.fit.nlu.laptop.jwt.UserPrincipal;
import com.fit.nlu.laptop.repository.ProductRepository;
import com.fit.nlu.laptop.repository.UserRepository;
import com.fit.nlu.laptop.service.OrderService;
import com.fit.nlu.laptop.service.ProductService;
import com.fit.nlu.laptop.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final ReviewService reviewService;
    private final ProductService productService;
    @GetMapping
    public List<Product> getAllProducts(@RequestParam(required = false) Long categoryId) {
        return productRepository.findPublicProducts(categoryId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {

        ProductDetailResponse response = productService.getProductDetailById(id);

        if (response == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String query) {
        return productRepository.findByNameContainingIgnoreCase(query);
    }
    @GetMapping("/{productId}/check-review-eligibility")
    public ResponseEntity<?> checkReviewEligibility(@PathVariable Long productId,@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.ok(Map.of("canReview", false));
        }

        try {
            System.out.println(userPrincipal.getId());

            boolean canReview = orderService.hasUserPurchasedProduct(Long.valueOf(userPrincipal.getId()), productId);

            return ResponseEntity.ok(Map.of("canReview", canReview));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("canReview", false));
        }
    }
    @GetMapping("/{productId}/reviews")
    public ResponseEntity<?> getProductReviews(@PathVariable Long productId) {
        List<Review> reviews = reviewService.getReviewsByProductId(productId);
        return ResponseEntity.ok(reviews);
    }


    @PostMapping("/{productId}/reviews")
    public ResponseEntity<?> addReview(@PathVariable Long productId,
                                       @RequestBody Map<String, Object> payload,
                                       @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Vui lòng đăng nhập để đánh giá!");
        }

        try {

            boolean hasPurchased = orderService.hasUserPurchasedProduct(Long.valueOf(principal.getId()), productId);
            if (!hasPurchased) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Bạn chỉ có thể đánh giá sau khi đã mua và nhận sản phẩm này thành công!");
            }


            int rating = Integer.parseInt(payload.get("rating").toString());
            String comment = (String) payload.get("comment");

            Review savedReview = reviewService.createReview(productId, Long.valueOf(principal.getId()), rating, comment);
            return ResponseEntity.ok(savedReview);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không thể lưu đánh giá: " + e.getMessage());
        }
    }
}
