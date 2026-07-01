package com.fit.nlu.laptop.service.impl;

import com.fit.nlu.laptop.entity.Product;
import com.fit.nlu.laptop.entity.ProductImage;
import com.fit.nlu.laptop.entity.SellerProfile;
import com.fit.nlu.laptop.repository.OrderRepository;
import com.fit.nlu.laptop.repository.ProductRepository;
import com.fit.nlu.laptop.service.ProductService;
import com.fit.nlu.laptop.dto.response.ProductDetailResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

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

        // Map danh sách ảnh từ product_images, fallback về imageUrl nếu rỗng
        List<String> imageUrls = product.getImages().stream()
                .map(ProductImage::getUrl)
                .collect(Collectors.toList());
        if (imageUrls.isEmpty() && product.getImageUrl() != null) {
            imageUrls = List.of(product.getImageUrl());
        }
        response.setImages(imageUrls);

        // 2. Map thông tin Seller an toàn
        SellerProfile seller = product.getSeller();
        if (seller != null) {
            response.setSellerId(seller.getId());
            response.setSellerName(seller.getStoreName());
            response.setSellerRating(seller.getRating());
            response.setSellerSoldCount(orderRepository.countBySellerId(seller.getId()));
            if (seller.getUser() != null) {
                response.setSellerLogo(seller.getUser().getAvatarUrl());
            }
        } else {
            response.setSellerName("LaptopStore Official");
        }

        return response;
    }
    @Override
    public List<Product> getProductsBySellerId(Long sellerId) {

        return productRepository.findBySellerId(sellerId);
    }
}