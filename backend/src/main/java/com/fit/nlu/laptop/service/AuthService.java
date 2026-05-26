package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.dto.request.LoginReq;
import com.fit.nlu.laptop.dto.request.RefreshTokenReq;
import com.fit.nlu.laptop.dto.request.RegisterReq;
import com.fit.nlu.laptop.dto.request.ResetPasswordReq;
import com.fit.nlu.laptop.dto.request.SellerRegisterReq;
import com.fit.nlu.laptop.dto.request.VerifyReq;
import com.fit.nlu.laptop.dto.response.AuthResponse;
import com.fit.nlu.laptop.entity.AuthProvider;
import com.fit.nlu.laptop.entity.Role;
import com.fit.nlu.laptop.entity.SellerProfile;
import com.fit.nlu.laptop.entity.User;
import com.fit.nlu.laptop.jwt.JwtUtil;
import com.fit.nlu.laptop.repository.SellerProfileRepository;
import com.fit.nlu.laptop.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final int REGISTER_OTP_EXPIRE_MINUTES = 10;
    private static final int RESET_PASSWORD_OTP_EXPIRE_MINUTES = 5;

    private final UserRepository repo;
    private final SellerProfileRepository sellerProfileRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder encoder;
    private final EmailService emailService;

    public void register(RegisterReq req) {
        User user = repo.findByEmail(req.email()).orElseGet(User::new);

        if (user.getId() != null && user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email đã tồn tại");
        }

        String otp = String.format("%04d", new Random().nextInt(10000));

        user.setEmail(req.email());
        user.setPassword(encoder.encode(req.password()));
        user.setFullName(req.fullName());
        user.setRole(Role.USER);
        user.setProvider(AuthProvider.LOCAL);
        user.setEnabled(false);
        user.setRegisterOtp(otp);
        user.setRegisterOtpExpiry(LocalDateTime.now(APP_ZONE).plusMinutes(REGISTER_OTP_EXPIRE_MINUTES));
        user.setPasswordResetOtp(null);
        user.setPasswordResetOtpExpiry(null);
        repo.save(user);

        emailService.sendSimpleMessage(
                req.email(),
                "Ma OTP xac thuc tai khoan",
                "Ma OTP dang ky cua ban la: " + otp + " (hieu luc " + REGISTER_OTP_EXPIRE_MINUTES + " phut)"
        );
    }

    public void registerSeller(SellerRegisterReq req) {
        SellerRegistrationValidator.validate(req);

        if (sellerProfileRepository.existsByCccd(req.cccd().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CCCD đã được đăng ký");
        }

        User user = repo.findByEmail(req.email().trim()).orElseGet(User::new);

        if (user.getId() != null && user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email đã tồn tại");
        }

        String otp = String.format("%04d", new Random().nextInt(10000));

        user.setEmail(req.email().trim());
        user.setPassword(encoder.encode(req.password()));
        user.setFullName(req.fullName().trim());
        user.setPhone(SellerRegistrationValidator.normalizePhone(req.phone()));
        user.setRole(Role.SELLER);
        user.setProvider(AuthProvider.LOCAL);
        user.setEnabled(false);
        user.setRegisterOtp(otp);
        user.setRegisterOtpExpiry(LocalDateTime.now(APP_ZONE).plusMinutes(REGISTER_OTP_EXPIRE_MINUTES));
        user.setPasswordResetOtp(null);
        user.setPasswordResetOtpExpiry(null);
        user = repo.save(user);

        SellerProfile profile = sellerProfileRepository.findByUserId(user.getId()).orElseGet(SellerProfile::new);
        profile.setUser(user);
        profile.setWarehouseProvince(req.warehouseProvince().trim());
        profile.setWarehouseDistrict(req.warehouseDistrict().trim());
        profile.setWarehouseWard(req.warehouseWard().trim());
        profile.setWarehouseStreet(req.warehouseStreet().trim());
        profile.setCccd(req.cccd().trim());
        profile.setBankName(req.bankName().trim());
        profile.setBankAccountNumber(req.bankAccountNumber().trim());
        profile.setBankAccountHolder(req.bankAccountHolder().trim());
        profile.setApproved(false);
        sellerProfileRepository.save(profile);

        emailService.sendSimpleMessage(
                req.email().trim(),
                "Ma OTP xac thuc tai khoan nguoi ban",
                "Ma OTP dang ky cua ban la: " + otp + " (hieu luc " + REGISTER_OTP_EXPIRE_MINUTES + " phut)"
        );
    }

    public String verifyRegisterOtp(VerifyReq req) {
        User user = repo.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email không tồn tại"));

        if (user.isEnabled()) {
            return "Tài khoản đã được xác thực trước đó";
        }

        if (user.getRegisterOtp() == null || !user.getRegisterOtp().equals(req.otp())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã OTP không đúng");
        }

        if (user.getRegisterOtpExpiry() == null || user.getRegisterOtpExpiry().isBefore(LocalDateTime.now(APP_ZONE))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã OTP đã hết hạn");
        }

        user.setEnabled(true);
        user.setRegisterOtp(null);
        user.setRegisterOtpExpiry(null);
        repo.save(user);

        return "Xác thực tài khoản thành công";
    }

    public AuthResponse login(LoginReq req) {
        User user = repo.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu sai"));

        if (!user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản chưa xác thực OTP đăng ký");
        }

        if (user.getPassword() == null || !encoder.matches(req.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu sai");
        }

        // seller kiểm tra approved
        if (user.getRole() == Role.SELLER) {
            SellerProfile profile = sellerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Không tìm thấy hồ sơ người bán"));
            if (!profile.isApproved()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản người bán của bạn chưa được duyệt. Vui lòng thử lại sau.");
            }
        }

        return issueTokens(user);
    }

    public AuthResponse loginFirebase(String idToken) {
        try {
            FirebaseToken decoded = FirebaseAuth.getInstance().verifyIdToken(idToken);

            String email = decoded.getEmail();
            String nameFromClaim = (String) decoded.getClaims().get("name");
            final String name = nameFromClaim != null ? nameFromClaim : (email != null ? email.split("@")[0] : "User");
            Object firebaseClaimsObj = decoded.getClaims().get("firebase");

            String provider = "password";
            if (firebaseClaimsObj instanceof Map<?, ?> firebaseClaims) {
                Object signInProvider = firebaseClaims.get("sign_in_provider");
                if (signInProvider instanceof String providerValue) {
                    provider = providerValue;
                }
            }

            AuthProvider authProvider = provider.equals("google.com") ? AuthProvider.GOOGLE : AuthProvider.FACEBOOK;

            User user = repo.findByEmail(email).orElseGet(() -> {
                User u = new User();
                u.setEmail(email);
                u.setFullName(name);
                u.setRole(Role.USER);
                u.setProvider(authProvider);
                u.setEnabled(true);
                return repo.save(u);
            });

            return issueTokens(user);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi xác thực Firebase: " + e.getMessage());
        }
    }

    public AuthResponse refreshToken(RefreshTokenReq req) {
        if (req.refreshToken() == null || req.refreshToken().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refresh token không hợp lệ");
        }

        String email;
        try {
            email = jwtUtil.extractUsername(req.refreshToken());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ");
        }

        if (!"refresh".equals(jwtUtil.getTokenType(req.refreshToken()))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Đây không phải refresh token");
        }

        User user = repo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ"));

        if (user.getRefreshTokenHash() == null
                || !user.getRefreshTokenHash().equals(jwtUtil.hashToken(req.refreshToken()))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ");
        }

        if (user.getRefreshTokenExpiry() == null || user.getRefreshTokenExpiry().isBefore(LocalDateTime.now(APP_ZONE))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token đã hết hạn");
        }

        return issueTokens(user);
    }

    public String logout(RefreshTokenReq req) {
        if (req.refreshToken() == null || req.refreshToken().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refresh token không hợp lệ");
        }

        try {
            String email = jwtUtil.extractUsername(req.refreshToken());
            User user = repo.findByEmail(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ"));

            if (user.getRefreshTokenHash() != null
                    && user.getRefreshTokenHash().equals(jwtUtil.hashToken(req.refreshToken()))) {
                user.setRefreshTokenHash(null);
                user.setRefreshTokenExpiry(null);
                repo.save(user);
            }

            return "Đăng xuất thành công";
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ");
        }
    }

    public void forgotPassword(Map<String, String> body) {
        String email = body.get("email");
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email không tồn tại"));

        if (!user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản chưa xác thực OTP đăng ký");
        }

        String otp = String.format("%04d", new Random().nextInt(10000));
        user.setPasswordResetOtp(otp);
        user.setPasswordResetOtpExpiry(LocalDateTime.now(APP_ZONE).plusMinutes(RESET_PASSWORD_OTP_EXPIRE_MINUTES));
        repo.save(user);

        emailService.sendSimpleMessage(email, "Mã OTP lấy lại mật khẩu", "Mã OTP của bạn là: " + otp);
    }

    public void verifyOtp(VerifyReq req) {
        User user = repo.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (user.getPasswordResetOtp() == null || !user.getPasswordResetOtp().equals(req.otp())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã OTP không đúng");
        }

        if (user.getPasswordResetOtpExpiry() == null || user.getPasswordResetOtpExpiry().isBefore(LocalDateTime.now(APP_ZONE))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã OTP đã hết hạn");
        }
    }

    public String resetPassword(ResetPasswordReq req) {
        User user = repo.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email không tồn tại"));

        if (user.getPasswordResetOtp() == null || !user.getPasswordResetOtp().equals(req.otp())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP không khớp hoặc đã hết hạn");
        }

        if (user.getPasswordResetOtpExpiry() == null || user.getPasswordResetOtpExpiry().isBefore(LocalDateTime.now(APP_ZONE))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP không khớp hoặc đã hết hạn");
        }

        user.setPassword(encoder.encode(req.newPassword()));
        user.setPasswordResetOtp(null);
        user.setPasswordResetOtpExpiry(null);
        user.setRefreshTokenHash(null);
        user.setRefreshTokenExpiry(null);
        repo.save(user);

        return "Đổi mật khẩu thành công";
    }

    public String changePassword(Long userId, String oldPassword, String newPassword) {
        User user = repo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        if (user.getPassword() != null && !encoder.matches(oldPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không đúng");
        }

        user.setPassword(encoder.encode(newPassword));
        user.setRefreshTokenHash(null);
        user.setRefreshTokenExpiry(null);
        repo.save(user);

        return "Đổi mật khẩu thành công";
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        user.setRefreshTokenHash(jwtUtil.hashToken(refreshToken));
        user.setRefreshTokenExpiry(LocalDateTime.ofInstant(
                jwtUtil.extractClaim(refreshToken, claims -> claims.getExpiration()).toInstant(),
                APP_ZONE
        ));
        repo.save(user);

        return new AuthResponse(
                accessToken,
                refreshToken,
                user.getEmail(),
                user.getFullName(),
                user.getProvider() != null ? user.getProvider().name() : null
        );
    }
}

