package com.fit.nlu.laptop.service.impl;

import com.fit.nlu.laptop.entity.Product;
import com.fit.nlu.laptop.entity.SellerProfile;
import com.fit.nlu.laptop.repository.ProductRepository;
import com.fit.nlu.laptop.service.ProductService;
import com.fit.nlu.laptop.dto.response.ProductDetailResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true) // Đảm bảo FetchType.LAZY hoạt động mượt mà
    public ProductDetailResponse getProductDetailById(Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return null;
        }

        ProductDetailResponse response = new ProductDetailResponse();

        // 1. Map thông tin Product
        response.setId(product.getId());
        response.setName(product.getName());
        response.setPrice(product.getPrice());
        response.setOldPrice(product.getOldPrice());
        response.setImageUrl(product.getImageUrl());
        response.setBadge(product.getBadge());
        response.setRating(product.getRating());
        response.setReviews(product.getReviews());
        response.setBrand(product.getBrand());
        response.setCpu(product.getCpu());
        response.setRam(product.getRam());
        response.setStorage(product.getStorage());
        response.setScreenSize(product.getScreenSize());
        response.setDescription(product.getDescription());
        response.setCondition(product.getCondition());

        // 2. Map thông tin Seller an toàn
        SellerProfile seller = product.getSeller();
        if (seller != null) {
            response.setSellerId(seller.getId());
            response.setSellerName(seller.getStoreName());
            response.setSellerLogo(seller.getLogoUrl());
            response.setSellerRating(seller.getRating());
        } else {
            response.setSellerName("LaptopStore Official");
        }

        return response;
    }
}