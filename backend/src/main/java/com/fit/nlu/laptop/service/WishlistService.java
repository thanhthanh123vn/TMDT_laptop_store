package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.entity.Product;
import com.fit.nlu.laptop.entity.User;
import com.fit.nlu.laptop.repository.ProductRepository;
import com.fit.nlu.laptop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public boolean toggleWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId).orElseThrow();
        Product product = productRepository.findById(productId).orElseThrow();

        boolean removed = user.getWishlist().removeIf(p -> p.getId().equals(product.getId()));
        if (!removed) {
            user.getWishlist().add(product);
        }
        userRepository.save(user);
        return !removed;
    }
}
