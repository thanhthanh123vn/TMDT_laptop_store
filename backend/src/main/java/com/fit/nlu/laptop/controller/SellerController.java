package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.dto.request.ReplyReviewReq;
import com.fit.nlu.laptop.dto.request.UpdateSellerProfileReq;
import com.fit.nlu.laptop.dto.response.SellerStatsResponse;
import com.fit.nlu.laptop.entity.Product;
import com.fit.nlu.laptop.entity.ProductImage;
import com.fit.nlu.laptop.entity.Review;
import com.fit.nlu.laptop.entity.SellerProfile;
import com.fit.nlu.laptop.jwt.UserPrincipal;
import com.fit.nlu.laptop.repository.ProductImageRepository;
import com.fit.nlu.laptop.repository.ProductRepository;
import com.fit.nlu.laptop.repository.SellerProfileRepository;
import com.fit.nlu.laptop.service.FileService;
import com.fit.nlu.laptop.service.ReviewService;
import com.fit.nlu.laptop.service.SellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SellerController {

    private final SellerService sellerService;
    private final ProductRepository productRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final ProductImageRepository productImageRepository;
    private final FileService fileService;
    private final ReviewService reviewService;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(sellerService.getProfileWithUser((long) principal.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<SellerProfile> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateSellerProfileReq req) {
        return ResponseEntity.ok(sellerService.updateProfile((long) principal.getId(), req));
    }

    @GetMapping("/stats")
    public ResponseEntity<SellerStatsResponse> getStats(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(sellerService.getStats((long) principal.getId()));
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<Review>> getReviews(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(sellerService.getReviews((long) principal.getId()));
    }

    // ─── Product Management ───────────────────────────────────────────────────

    private SellerProfile getSellerProfile(long userId) {
        return sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ người bán"));
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getMyProducts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Boolean approved,
            @RequestParam(required = false) Boolean inStock) {
        SellerProfile seller = getSellerProfile((long) principal.getId());
        List<Product> products = productRepository.findSellerProducts(
                seller.getId(), name, categoryId, brand, approved, inStock);
        return ResponseEntity.ok(products);
    }

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> body) {
        SellerProfile seller = getSellerProfile((long) principal.getId());

        Product p = new Product();
        p.setSeller(seller);
        p.setApproved(false);
        p.setDeleted(false);
        applyProductFields(p, body);

        if (p.getStock() == null || p.getStock() <= 0) {
            return ResponseEntity.badRequest().build();
        }

        Product saved = productRepository.save(p);

        // Persist image URLs passed as imageUrls array
        @SuppressWarnings("unchecked")
        List<String> imageUrls = (List<String>) body.get("imageUrls");
        if (imageUrls != null && !imageUrls.isEmpty()) {
            for (int i = 0; i < imageUrls.size(); i++) {
                productImageRepository.save(new ProductImage(saved, imageUrls.get(i), i));
            }
            saved.setImageUrl(imageUrls.get(0));
            productRepository.save(saved);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(productRepository.findById(saved.getId()).orElse(saved));
    }

    @Transactional
    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        SellerProfile seller = getSellerProfile((long) principal.getId());
        Product p = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!p.getSeller().getId().equals(seller.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        applyProductFields(p, body);

        // Replace images if provided
        @SuppressWarnings("unchecked")
        List<String> imageUrls = (List<String>) body.get("imageUrls");
        if (imageUrls != null) {
            // Clear the in-memory collection first to prevent Hibernate re-inserting them on save
            p.getImages().clear();
            productRepository.saveAndFlush(p);          // flush the clear
            productImageRepository.deleteByProductId(id);
            for (int i = 0; i < imageUrls.size(); i++) {
                productImageRepository.save(new ProductImage(p, imageUrls.get(i), i));
            }
            if (!imageUrls.isEmpty()) p.setImageUrl(imageUrls.get(0));
        }

        return ResponseEntity.ok(productRepository.save(p));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        SellerProfile seller = getSellerProfile((long) principal.getId());
        Product p = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!p.getSeller().getId().equals(seller.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        p.setDeleted(true);
        productRepository.save(p);
        return ResponseEntity.noContent().build();
    }

    // ─── Image Upload ─────────────────────────────────────────────────────────

    /** Upload a single image for a product, returns { url } */
    @PostMapping("/products/{id}/images")
    public ResponseEntity<Map<String, String>> uploadProductImage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        SellerProfile seller = getSellerProfile((long) principal.getId());
        Product p = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!p.getSeller().getId().equals(seller.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        String url = fileService.saveProductImage(file);
        int order = p.getImages().size();
        ProductImage img = new ProductImage(p, url, order);
        productImageRepository.save(img);

        // keep imageUrl in sync with first image
        if (order == 0) {
            p.setImageUrl(url);
            productRepository.save(p);
        }
        return ResponseEntity.ok(Map.of("url", url, "id", String.valueOf(img.getId())));
    }

    /** Replace all images for a product with a new ordered list of URLs */
    @PutMapping("/products/{id}/images")
    public ResponseEntity<List<ProductImage>> replaceProductImages(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody List<String> urls) {
        SellerProfile seller = getSellerProfile((long) principal.getId());
        Product p = productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!p.getSeller().getId().equals(seller.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        productImageRepository.deleteByProductId(id);
        List<ProductImage> saved = new java.util.ArrayList<>();
        for (int i = 0; i < urls.size(); i++) {
            saved.add(productImageRepository.save(new ProductImage(p, urls.get(i), i)));
        }
        if (!urls.isEmpty()) {
            p.setImageUrl(urls.get(0));
            productRepository.save(p);
        }
        return ResponseEntity.ok(saved);
    }

    /** Upload image without product (for new product form before save) */
    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadTempImage(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file) throws IOException {
        // just verify seller exists
        getSellerProfile((long) principal.getId());
        String url = fileService.saveProductImage(file);
        return ResponseEntity.ok(Map.of("url", url));
    }

    // ─── Order Management ─────────────────────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getSellerOrders(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(orderService.getSellerOrders((long) principal.getId()));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Map<String, Object>> getSellerOrderDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getSellerOrderDetail((long) principal.getId(), orderId));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> body) {
        String status = body.get("status") != null ? body.get("status").toString() : null;
        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu trường status");
        }
        return ResponseEntity.ok(orderService.updateSellerOrderStatus((long) principal.getId(), orderId, status));
    }

    private void applyProductFields(Product p, Map<String, Object> body) {
        if (body.containsKey("name")) p.setName((String) body.get("name"));
        if (body.containsKey("brand")) p.setBrand((String) body.get("brand"));
        if (body.containsKey("price") && body.get("price") != null)
            p.setPrice(new BigDecimal(body.get("price").toString()));
        if (body.containsKey("oldPrice") && body.get("oldPrice") != null)
            p.setOldPrice(new BigDecimal(body.get("oldPrice").toString()));
        if (body.containsKey("imageUrl")) p.setImageUrl((String) body.get("imageUrl"));
        if (body.containsKey("description")) p.setDescription((String) body.get("description"));
        if (body.containsKey("cpu")) p.setCpu((String) body.get("cpu"));
        if (body.containsKey("gpu")) p.setGpu((String) body.get("gpu"));
        if (body.containsKey("ram")) p.setRam((String) body.get("ram"));
        if (body.containsKey("storage")) p.setStorage((String) body.get("storage"));
        if (body.containsKey("storageType")) p.setStorageType((String) body.get("storageType"));
        if (body.containsKey("screenSize")) p.setScreenSize((String) body.get("screenSize"));
        if (body.containsKey("weight")) p.setWeight((String) body.get("weight"));
        if (body.containsKey("batteryCondition")) p.setBatteryCondition((String) body.get("batteryCondition"));
        if (body.containsKey("condition")) p.setCondition((String) body.get("condition"));
        if (body.containsKey("categoryId") && body.get("categoryId") != null)
            p.setCategoryId(Long.parseLong(body.get("categoryId").toString()));
        if (body.containsKey("stock") && body.get("stock") != null)
            p.setStock(Integer.parseInt(body.get("stock").toString()));
        if (body.containsKey("badge")) p.setBadge((String) body.get("badge"));
        if (body.containsKey("badgeColor")) p.setBadgeColor((String) body.get("badgeColor"));
    }
    @PostMapping("/reviews/{reviewId}/reply")
    @PreAuthorize("hasAuthority('SELLER')")
    public ResponseEntity<?> replyToReview(
            @PathVariable Long reviewId,
            @RequestBody ReplyReviewReq request,
            @AuthenticationPrincipal UserPrincipal principal) {
        try {
            var updatedReview = reviewService.replyToReview(reviewId, Long.valueOf(principal.getId()), request.getReplyContent());
            return ResponseEntity.ok(updatedReview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
