package com.fit.nlu.laptop.service;


import com.fit.nlu.laptop.dto.response.ProductDetailResponse;

public interface ProductService {

    ProductDetailResponse getProductDetailById(Long id);
}