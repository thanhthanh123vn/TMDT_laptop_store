package com.fit.nlu.laptop.repository;

import com.fit.nlu.laptop.entity.SellerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface SellerProfileRepository extends JpaRepository<SellerProfile, Long>, JpaSpecificationExecutor<SellerProfile> {
    Optional<SellerProfile> findByUserId(Long userId);
    boolean existsByCccd(String cccd);
}
