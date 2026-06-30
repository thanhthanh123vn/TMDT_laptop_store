package com.fit.nlu.laptop.service;


import com.fit.nlu.laptop.dto.response.ProductDetailResponse;
import com.fit.nlu.laptop.entity.Product;

import java.util.List;

public interface ProductService {

    ProductDetailResponse getProductDetailById(Long id);
    List<Product> getProductsBySellerId(Long sellerId);
}