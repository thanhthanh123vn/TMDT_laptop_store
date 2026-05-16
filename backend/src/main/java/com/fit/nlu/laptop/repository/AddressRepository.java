package com.fit.nlu.laptop.repository;

import com.fit.nlu.laptop.entity.Address;
import com.fit.nlu.laptop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUser(User user);
}
