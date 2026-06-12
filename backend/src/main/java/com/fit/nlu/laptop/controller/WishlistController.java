package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.entity.Product;
import com.fit.nlu.laptop.entity.User;
import com.fit.nlu.laptop.jwt.UserPrincipal;
import com.fit.nlu.laptop.repository.ProductRepository;
import com.fit.nlu.laptop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
public class WishlistController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final com.fit.nlu.laptop.service.WishlistService wishlistService;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMyWishlist(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findById(principal.getId().longValue()).orElseThrow();
        List<Map<String, Object>> result = user.getWishlist().stream()
            .map(p -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", p.getId());
                m.put("name", p.getName());
                m.put("price", p.getPrice());
                m.put("oldPrice", p.getOldPrice() != null ? p.getOldPrice() : "");
                m.put("imageUrl", p.getImageUrl() != null ? p.getImageUrl() : "");
                m.put("badge", p.getBadge() != null ? p.getBadge() : "");
                m.put("badgeColor", p.getBadgeColor() != null ? p.getBadgeColor() : "bg-emerald-500");
                m.put("rating", p.getRating() != null ? p.getRating() : 5.0);
                m.put("reviews", p.getReviews() != null ? p.getReviews() : 0);
                m.put("brand", p.getBrand() != null ? p.getBrand() : "");
                m.put("cpu", p.getCpu() != null ? p.getCpu() : "");
                m.put("ram", p.getRam() != null ? p.getRam() : "");
                m.put("storage", p.getStorage() != null ? p.getStorage() : "");
                m.put("condition", p.getCondition() != null ? p.getCondition() : "");
                return m;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<?> toggleWishlist(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long productId) {
        if (principal == null) return ResponseEntity.status(401).build();
        boolean inWishlist = wishlistService.toggleWishlist(principal.getId().longValue(), productId);
        return ResponseEntity.ok(Map.of("inWishlist", inWishlist, "productId", productId));
    }
}
