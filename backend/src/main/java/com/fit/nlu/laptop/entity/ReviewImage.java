package com.fit.nlu.laptop.entity;


import jakarta.persistence.*;
import lombok.Data;


@Entity
@Table(name = "review_images")
@Data
public class ReviewImage {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String imageUrl;



    @ManyToOne
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

}