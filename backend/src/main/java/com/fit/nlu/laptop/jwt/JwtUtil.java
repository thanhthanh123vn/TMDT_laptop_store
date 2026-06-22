package com.fit.nlu.laptop.jwt;

import com.fit.nlu.laptop.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final String TOKEN_TYPE_ACCESS = "access";
    private static final String TOKEN_TYPE_REFRESH = "refresh";

    @Value("${app.jwt.access-token-ttl:15m}")
    private Duration accessTokenTtl;

    @Value("${app.jwt.refresh-token-ttl:7d}")
    private Duration refreshTokenTtl;

    @Value("${app.jwt.secret-key}")
    private String secretKey;

    // 1. Lấy Username (Email) từ Token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 2. Alias để phục vụ JwtFilter (Sửa lỗi "cannot find symbol getEmail")
    public String getEmail(String token) {
        return extractUsername(token);
    }

    // 3. Trích xuất một Claim cụ thể
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateAccessToken(User user) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole());
        extraClaims.put("tokenType", TOKEN_TYPE_ACCESS);
        return generateToken(extraClaims, user.getEmail(), accessTokenTtl);
    }

    public String generateRefreshToken(User user) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("tokenType", TOKEN_TYPE_REFRESH);
        return generateToken(extraClaims, user.getEmail(), refreshTokenTtl);
    }

    public String getTokenType(String token) {
        return extractClaim(token, claims -> claims.get("tokenType", String.class));
    }

    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hashed.length * 2);
            for (byte b : hashed) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Cannot hash token", e);
        }
    }

    public Duration getAccessTokenTtl() {
        return accessTokenTtl;
    }

    private String generateToken(Map<String, Object> extraClaims, String subject, Duration ttl) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + ttl.toMillis()))
                .signWith(getSignInKey())
                .compact();
    }

    // 5. Kiểm tra Token hợp lệ (Dùng cho JwtFilter)
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    // 6. Giải mã Token (Cú pháp chuẩn JJWT 0.12.5)
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // 7. Tạo SecretKey từ chuỗi Base64
    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

}