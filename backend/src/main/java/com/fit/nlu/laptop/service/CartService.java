package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.entity.CartItem;
import com.fit.nlu.laptop.entity.Product;
import com.fit.nlu.laptop.entity.User;
import com.fit.nlu.laptop.repository.CartItemRepository;
import com.fit.nlu.laptop.repository.ProductRepository;
import com.fit.nlu.laptop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<CartItem> getCart(Long userId) {
        User user = getUser(userId);
        return cartItemRepository.findByUser(user);
    }

    @Transactional
    public CartItem addToCart(Long userId, Long productId, int quantity) {
        User user = getUser(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại"));

        CartItem item = cartItemRepository.findByUserAndProductId(user, productId)
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setUser(user);
                    newItem.setProduct(product);
                    newItem.setQuantity(0);
                    return newItem;
                });

        item.setQuantity(item.getQuantity() + quantity);
        return cartItemRepository.save(item);
    }

    @Transactional
    public CartItem updateQuantity(Long userId, Long productId, int quantity) {
        User user = getUser(userId);
        CartItem item = cartItemRepository.findByUserAndProductId(user, productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sản phẩm không có trong giỏ hàng"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return null;
        }

        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    @Transactional
    public void removeFromCart(Long userId, Long productId) {
        User user = getUser(userId);
        CartItem item = cartItemRepository.findByUserAndProductId(user, productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sản phẩm không có trong giỏ hàng"));
        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(Long userId) {
        User user = getUser(userId);
        cartItemRepository.deleteByUser(user);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
    }
}
