package com.fit.nlu.laptop.repository;

import com.fit.nlu.laptop.entity.ReviewImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewImageRepository
        extends JpaRepository<ReviewImage, Long> {
    List<ReviewImage> findByReviewId(Long reviewId);

}
