package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.entity.User;
import com.fit.nlu.laptop.jwt.UserPrincipal;
import com.fit.nlu.laptop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.io.IOException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final com.fit.nlu.laptop.service.FileService fileService;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findById(principal.getId().longValue()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(user);
    }

    public record ProfileUpdateReq(String fullName, String phone, String avatarUrl) {}

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserPrincipal principal, @RequestBody ProfileUpdateReq req) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findById(principal.getId().longValue()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        if (req.fullName() != null) user.setFullName(req.fullName());
        if (req.phone() != null) user.setPhone(req.phone());
        if (req.avatarUrl() != null) user.setAvatarUrl(req.avatarUrl());

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    private final com.fit.nlu.laptop.service.AuthService authService;
    
    public record ChangePasswordReq(String oldPassword, String newPassword) {}

    @PostMapping("/me/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserPrincipal principal, @RequestBody ChangePasswordReq req) {
        if (principal == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(Map.of("message", authService.changePassword(principal.getId().longValue(), req.oldPassword(), req.newPassword())));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<?> uploadAvatar(@AuthenticationPrincipal UserPrincipal principal, @RequestParam("file") MultipartFile file) throws IOException {
        if (principal == null) return ResponseEntity.status(401).build();
        String url = fileService.saveAvatar(file);
        
        User user = userRepository.findById(principal.getId().longValue()).orElseThrow();
        user.setAvatarUrl(url);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("url", url));
    }
}
