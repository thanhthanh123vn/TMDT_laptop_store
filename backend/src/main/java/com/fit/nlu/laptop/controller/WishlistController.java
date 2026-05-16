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

import java.util.List;

@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
public class WishlistController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<?> getMyWishlist(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findById(principal.getId().longValue()).orElseThrow();
        return ResponseEntity.ok(user.getWishlist());
    }

    @PostMapping("/{productId}")
    public ResponseEntity<?> toggleWishlist(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long productId) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findById(principal.getId().longValue()).orElseThrow();
        Product product = productRepository.findById(productId).orElseThrow();

        if (user.getWishlist().contains(product)) {
            user.getWishlist().remove(product);
        } else {
            user.getWishlist().add(product);
        }
        userRepository.save(user);
        return ResponseEntity.ok(user.getWishlist());
    }
}
