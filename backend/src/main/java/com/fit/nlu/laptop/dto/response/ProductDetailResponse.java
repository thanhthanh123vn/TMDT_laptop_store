package com.fit.nlu.laptop.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class ProductDetailResponse {

    private Long id;
    private String name;
    private BigDecimal price;
    private BigDecimal oldPrice;
    private String imageUrl;
    private String badge;
    private Double rating;
    private Integer reviews;
    private String brand;
    private String cpu;
    private String ram;
    private String storage;
    private String screenSize;
    private String description;
    private String condition;


    private Long sellerId;
    private String sellerName;
    private String sellerLogo;
    private Double sellerRating;
}