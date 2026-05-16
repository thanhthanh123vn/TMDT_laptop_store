package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.entity.Product;
import com.fit.nlu.laptop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductRepository productRepository;

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productRepository.findById(id).orElse(null);
    }
    
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String query) {
        return productRepository.findByNameContainingIgnoreCase(query);
    }
}
