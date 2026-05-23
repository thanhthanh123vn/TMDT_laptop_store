package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.entity.CartItem;
import com.fit.nlu.laptop.jwt.UserPrincipal;
import com.fit.nlu.laptop.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /** Lấy giỏ hàng của user hiện tại */
    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(cartService.getCart(principal.getId().longValue()));
    }

    /** Thêm sản phẩm vào giỏ (hoặc tăng số lượng nếu đã có) */
    @PostMapping
    public ResponseEntity<CartItem> addToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> body) {
        Long productId = Long.valueOf(body.get("productId").toString());
        int quantity = body.containsKey("quantity") ? Integer.parseInt(body.get("quantity").toString()) : 1;
        return ResponseEntity.ok(cartService.addToCart(principal.getId().longValue(), productId, quantity));
    }

    /** Cập nhật số lượng; nếu quantity <= 0 thì xóa khỏi giỏ */
    @PutMapping("/{productId}")
    public ResponseEntity<?> updateQuantity(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @RequestBody Map<String, Object> body) {
        int quantity = Integer.parseInt(body.get("quantity").toString());
        CartItem updated = cartService.updateQuantity(principal.getId().longValue(), productId, quantity);
        if (updated == null) {
            return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm khỏi giỏ hàng"));
        }
        return ResponseEntity.ok(updated);
    }

    /** Xóa một sản phẩm khỏi giỏ */
    @DeleteMapping("/{productId}")
    public ResponseEntity<Map<String, String>> removeFromCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        cartService.removeFromCart(principal.getId().longValue(), productId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm khỏi giỏ hàng"));
    }

    /** Xóa toàn bộ giỏ hàng */
    @DeleteMapping
    public ResponseEntity<Map<String, String>> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        cartService.clearCart(principal.getId().longValue());
        return ResponseEntity.ok(Map.of("message", "Đã xóa toàn bộ giỏ hàng"));
    }
}
