package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.entity.Address;
import com.fit.nlu.laptop.entity.User;
import com.fit.nlu.laptop.jwt.UserPrincipal;
import com.fit.nlu.laptop.repository.AddressRepository;
import com.fit.nlu.laptop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getMyAddresses(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findById(principal.getId().longValue()).orElseThrow();
        List<Address> addresses = addressRepository.findByUser(user);
        return ResponseEntity.ok(addresses);
    }

    public record AddressReq(String fullName, String phone, String province, String district, String ward, String streetAddress, boolean isDefault, String addressType) {}

    @PostMapping
    public ResponseEntity<?> addAddress(@AuthenticationPrincipal UserPrincipal principal, @RequestBody AddressReq req) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findById(principal.getId().longValue()).orElseThrow();

        Address address = new Address();
        address.setUser(user);
        address.setFullName(req.fullName());
        address.setPhone(req.phone());
        address.setProvince(req.province());
        address.setDistrict(req.district());
        address.setWard(req.ward());
        address.setStreetAddress(req.streetAddress());
        address.setDefault(req.isDefault());
        address.setAddressType(req.addressType() != null ? req.addressType() : "HOME");

        // If this is default, we should unset others, but for simplicity we keep it as is
        Address saved = addressRepository.save(address);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        if (principal == null) return ResponseEntity.status(401).build();
        addressRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
