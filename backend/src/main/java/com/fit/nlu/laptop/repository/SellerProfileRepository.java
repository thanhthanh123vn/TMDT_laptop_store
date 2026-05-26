package com.fit.nlu.laptop.repository;

import com.fit.nlu.laptop.entity.SellerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerProfileRepository extends JpaRepository<SellerProfile, Long> {
    Optional<SellerProfile> findByUserId(Long userId);
    boolean existsByCccd(String cccd);
}
