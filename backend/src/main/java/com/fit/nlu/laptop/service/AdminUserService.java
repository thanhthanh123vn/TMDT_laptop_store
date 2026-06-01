package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.dto.request.InviteUserReq;
import com.fit.nlu.laptop.dto.request.UpdateUserRoleReq;
import com.fit.nlu.laptop.dto.request.UpdateUserStatusReq;
import com.fit.nlu.laptop.dto.response.PagedResponse;
import com.fit.nlu.laptop.entity.AuthProvider;
import com.fit.nlu.laptop.entity.Role;
import com.fit.nlu.laptop.entity.User;
import com.fit.nlu.laptop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private static final String STATUS_ACTIVE = "active";
    private static final String STATUS_BLOCKED = "blocked";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public PagedResponse<Map<String, Object>> listUsers(
            int page,
            int size,
            String role,
            String status,
            String keyword
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);

        Pageable pageable = PageRequest.of(safePage - 1, safeSize);
        Specification<User> spec = buildUserSpec(role, status, keyword);

        Page<User> userPage = userRepository.findAll(spec, pageable);
        List<Map<String, Object>> items = userPage.getContent().stream().map(this::toUserItem).toList();

        return new PagedResponse<>(
                items,
                safePage,
                safeSize,
                userPage.getTotalElements(),
                userPage.getTotalPages()
        );
    }

    public Map<String, Object> getUser(Long id) {
        User user = findUser(id);
        return toUserDetail(user);
    }

    public Map<String, Object> updateRole(Long id, UpdateUserRoleReq req) {
        User user = findUser(id);
        Role role = parseRole(req.role());

        user.setRole(role);
        userRepository.save(user);

        return Map.of(
                "message", "Role updated",
                "id", user.getId(),
                "role", role.name()
        );
    }

    public Map<String, Object> updateStatus(Long id, UpdateUserStatusReq req) {
        User user = findUser(id);
        String status = parseStatus(req.status());

        user.setEnabled(STATUS_ACTIVE.equals(status));
        userRepository.save(user);

        return Map.of(
                "message", "Status updated",
                "id", user.getId(),
                "status", status
        );
    }

    public Map<String, Object> inviteUser(InviteUserReq req) {
        String email = normalizeRequired(req.email(), "Email không được để trống");
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email đã tồn tại");
        }

        Role role = req.role() == null || req.role().isBlank() ? Role.USER : parseRole(req.role());
        String fullName = req.fullName() == null ? "" : req.fullName().trim();
        String tempPassword = generateTempPassword(10);

        User user = new User();
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setRole(role);
        user.setProvider(AuthProvider.LOCAL);
        user.setEnabled(true);
        userRepository.save(user);

        emailService.sendSimpleMessage(
                email,
                "Tai khoan quan tri vien vua moi duoc tao",
                "Thong tin dang nhap tam thoi\nEmail: " + email + "\nMat khau tam: " + tempPassword + "\nVui long doi mat khau sau khi dang nhap."
        );

        return Map.of(
                "message", "Invite sent",
                "email", email,
                "fullName", fullName,
                "role", role.name()
        );
    }

    private Specification<User> buildUserSpec(String role, String status, String keyword) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            if (role != null && !role.isBlank()) {
                Role parsedRole = parseRole(role);
                predicates.add(cb.equal(root.get("role"), parsedRole));
            }

            if (status != null && !status.isBlank()) {
                String parsedStatus = parseStatus(status);
                predicates.add(cb.equal(root.get("enabled"), STATUS_ACTIVE.equals(parsedStatus)));
            }

            if (keyword != null && !keyword.isBlank()) {
                String keywordLike = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("email")), keywordLike),
                        cb.like(cb.lower(root.get("fullName")), keywordLike),
                        cb.like(cb.lower(root.get("phone")), keywordLike)
                ));
            }

            return cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private Role parseRole(String rawRole) {
        String role = normalizeRequired(rawRole, "Role không hợp lệ").toUpperCase();
        try {
            return Role.valueOf(role);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role không hợp lệ");
        }
    }

    private String parseStatus(String rawStatus) {
        String status = normalizeRequired(rawStatus, "Status không hợp lệ").toLowerCase();
        if (!STATUS_ACTIVE.equals(status) && !STATUS_BLOCKED.equals(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status không hợp lệ");
        }
        return status;
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User không tồn tại"));
    }

    private Map<String, Object> toUserItem(User user) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", user.getId());
        data.put("email", user.getEmail());
        data.put("fullName", user.getFullName());
        data.put("role", user.getRole() != null ? user.getRole().name() : null);
        data.put("status", user.isEnabled() ? STATUS_ACTIVE : STATUS_BLOCKED);
        data.put("provider", user.getProvider() != null ? user.getProvider().name() : null);
        data.put("createdAt", user.getCreatedAt());
        return data;
    }

    private Map<String, Object> toUserDetail(User user) {
        Map<String, Object> data = toUserItem(user);
        data.put("phone", user.getPhone());
        data.put("bio", user.getBio());
        data.put("avatarUrl", user.getAvatarUrl());
        data.put("updatedAt", user.getUpdatedAt());
        return data;
    }

    private String normalizeRequired(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private String generateTempPassword(int length) {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
    }
}
