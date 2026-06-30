package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.dto.response.ProductDetailResponse;

import com.fit.nlu.laptop.entity.*;

import com.fit.nlu.laptop.entity.Product;
import com.fit.nlu.laptop.entity.Review;

import com.fit.nlu.laptop.entity.ReviewImage;



import com.fit.nlu.laptop.repository.ReviewImageRepository;
import com.fit.nlu.laptop.repository.ReviewRepository;

import com.fit.nlu.laptop.entity.User;

import com.fit.nlu.laptop.jwt.UserPrincipal;
import com.fit.nlu.laptop.repository.ProductRepository;

import com.fit.nlu.laptop.repository.UserRepository;
import com.fit.nlu.laptop.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

import java.util.LinkedHashMap;

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

    private final S3Service s3Service;
    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;

    private final SellerService sellerService;




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
        List<Map<String, Object>> result = reviews.stream().map(r -> {
            Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("id", r.getId());
            map.put("rating", r.getRating());
            map.put("comment", r.getComment());
            map.put("createdAt", r.getCreatedAt());
            map.put("sellerReply", r.getSellerReply());
            map.put("repliedAt", r.getRepliedAt());


            List<String> imageUrls =
                    reviewImageRepository
                            .findByReviewId(r.getId())
                            .stream()
                            .map(ReviewImage::getImageUrl)
                            .toList();


            map.put("images", imageUrls);

            Map<String, Object> userMap = new java.util.LinkedHashMap<>();
            userMap.put("id", r.getUser().getId());
            userMap.put("fullName", r.getUser().getFullName());
            userMap.put("avatarUrl", r.getUser().getAvatarUrl());
            map.put("user", userMap);

            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }




    @PostMapping(
            value = "/{productId}/reviews",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> addReview(
            @PathVariable Long productId,

            @RequestParam("rating") int rating,

            @RequestParam("comment") String comment,

            @RequestPart(value = "images", required = false) List<MultipartFile> images,

            @AuthenticationPrincipal UserPrincipal principal
    ) {

        if (principal == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Vui lòng đăng nhập để đánh giá!");
        }



        try {

            boolean hasPurchased =
                    orderService.hasUserPurchasedProduct(
                            Long.valueOf(principal.getId()),
                            productId
                    );


            if (!hasPurchased) {
                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body("Bạn chỉ có thể đánh giá sau khi đã mua và nhận sản phẩm này thành công!");
            }


            Review savedReview = reviewService.createReview(
                    productId,
                    Long.valueOf(principal.getId()),
                    rating,
                    comment
            );



            if(images != null && !images.isEmpty()) {

                for(MultipartFile file : images){

                    String url = s3Service.uploadFile(file);
                    System.out.println("S3 URL: " + url);


                    ReviewImage img = new ReviewImage();

                    img.setImageUrl(url);
                    img.setReview(savedReview);



                    ReviewImage saved = reviewImageRepository.save(img);
                    System.out.println(
                            "Lưu ảnh ID: " + saved.getId()
                    );
                }
            }


            Map<String,Object> result = new LinkedHashMap<>();

            result.put("id", savedReview.getId());
            result.put("rating", savedReview.getRating());
            result.put("comment", savedReview.getComment());
            result.put("createdAt", savedReview.getCreatedAt());


            Map<String,Object> userMap = new LinkedHashMap<>();

            userMap.put(
                    "id",
                    savedReview.getUser().getId()
            );

            userMap.put(
                    "fullName",
                    savedReview.getUser().getFullName()
            );

            userMap.put(
                    "avatarUrl",
                    savedReview.getUser().getAvatarUrl()
            );


            result.put("user", userMap);


            return ResponseEntity.ok(result);


        } catch(Exception e){
            e.printStackTrace();
            return ResponseEntity
                    .badRequest()
                    .body("Không thể lưu đánh giá: " + e.getMessage());
        }
    }
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Product>> getProductsBySeller(@PathVariable Long sellerId) {
        List<Product> products = productService.getProductsBySellerId(sellerId);
        return ResponseEntity.ok(products);
    }
    @GetMapping("/{shopId}/public")
    public ResponseEntity<SellerProfile> getShopInfo(@PathVariable Long shopId) {
        SellerProfile profile = sellerService.getProfileById(shopId);
        return ResponseEntity.ok(profile);
    }
}
