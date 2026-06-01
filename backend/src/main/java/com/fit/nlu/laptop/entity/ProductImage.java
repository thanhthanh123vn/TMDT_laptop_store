package com.fit.nlu.laptop.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_images")
@Getter
@Setter
@NoArgsConstructor
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    @com.fasterxml.jackson.annotation.JsonBackReference
    private Product product;

    @Column(name = "url", nullable = false, length = 1024)
    private String url;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    public ProductImage(Product product, String url, int sortOrder) {
        this.product = product;
        this.url = url;
        this.sortOrder = sortOrder;
    }
}
