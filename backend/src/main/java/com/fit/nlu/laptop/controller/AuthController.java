package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.dto.request.RefreshTokenReq;
import com.fit.nlu.laptop.dto.request.RegisterReq;
import com.fit.nlu.laptop.dto.request.ResetPasswordReq;
import com.fit.nlu.laptop.dto.request.VerifyReq;
import com.fit.nlu.laptop.dto.response.AuthResponse;
import com.fit.nlu.laptop.dto.request.LoginReq;
import com.fit.nlu.laptop.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterReq r) {
        authService.register(r);
        return ResponseEntity.ok(Map.of("message", "Đăng ký thành công, vui lòng kiểm tra email để lấy OTP xác thực"));
    }

    @PostMapping("/verify-register-otp")
    public ResponseEntity<?> verifyRegisterOtp(@RequestBody VerifyReq req) {
        return ResponseEntity.ok(Map.of("message", authService.verifyRegisterOtp(req)));
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginReq r) {
        return authService.login(r);
    }

    @PostMapping("/firebase")
    public ResponseEntity<AuthResponse> loginFirebase(@RequestBody Map<String, String> body)
            throws Exception {
        return ResponseEntity.ok(authService.loginFirebase(body.get("idToken")));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenReq req) {
        return ResponseEntity.ok(authService.refreshToken(req));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshTokenReq req) {
        try {
            return ResponseEntity.ok(authService.logout(req));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getReason());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token không hợp lệ");
        }
    }

    @PostMapping("/forgot-password")
    public void forgotPassword(@RequestBody Map<String, String> body) {
        authService.forgotPassword(body);
    }

    @PostMapping("/verify-otp")
    public void verifyOtp(@RequestBody VerifyReq req) {
        authService.verifyOtp(req);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordReq req) {
        try {
            return ResponseEntity.ok(authService.resetPassword(req));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getReason());
        }
    }
}