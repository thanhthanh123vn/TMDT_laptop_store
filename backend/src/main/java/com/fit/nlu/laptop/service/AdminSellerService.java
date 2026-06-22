package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.dto.response.PagedResponse;
import com.fit.nlu.laptop.entity.Role;
import com.fit.nlu.laptop.entity.SellerProfile;
import com.fit.nlu.laptop.entity.User;
import com.fit.nlu.laptop.repository.SellerProfileRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminSellerService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_REJECTED = "REJECTED";
    private static final String STATUS_LOCKED = "LOCKED";

    private final SellerProfileRepository sellerProfileRepository;
    private final EmailService emailService;

    public PagedResponse<Map<String, Object>> listSellers(
            int page,
            int size,
            Boolean approved,
            String status,
            String keyword
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);

        Pageable pageable = PageRequest.of(safePage - 1, safeSize);
        Specification<SellerProfile> spec = buildSpec(approved, status, keyword);
        Page<SellerProfile> sellerPage = sellerProfileRepository.findAll(spec, pageable);

        List<Map<String, Object>> items = sellerPage.getContent().stream()
                .map(this::toSellerItem)
                .toList();

        return new PagedResponse<>(
                items,
                safePage,
                safeSize,
                sellerPage.getTotalElements(),
                sellerPage.getTotalPages()
        );
    }

    public Map<String, Object> getSeller(Long id) {
        SellerProfile profile = findSeller(id);
        return toSellerDetail(profile);
    }

    public Map<String, Object> approveSeller(Long id) {
        SellerProfile profile = findSeller(id);
        User user = profile.getUser();

        if (!user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Người bán chưa xác thực email OTP");
        }
        if (profile.isApproved()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tài khoản người bán đã được duyệt");
        }

        profile.setApproved(true);
        profile.setStatus(STATUS_ACTIVE);
        sellerProfileRepository.save(profile);

        emailService.sendSimpleMessage(
                user.getEmail(),
                "Tai khoan nguoi ban da duoc duyet",
                "Xin chao " + user.getFullName() + ",\n"
                        + "Tai khoan nguoi ban cua ban tren LAPTOPRE da duoc duyet. "
                        + "Ban co the dang nhap va bat dau ban hang ngay bay gio."
        );

        return Map.of(
                "message", "Đã duyệt người bán",
                "id", profile.getId(),
                "approved", true,
                "status", STATUS_ACTIVE
        );
    }

    public Map<String, Object> rejectSeller(Long id) {
        SellerProfile profile = findSeller(id);
        User user = profile.getUser();

        if (profile.isApproved()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể từ chối tài khoản đã được duyệt");
        }

        profile.setApproved(false);
        profile.setStatus(STATUS_REJECTED);
        sellerProfileRepository.save(profile);

        emailService.sendSimpleMessage(
                user.getEmail(),
                "Tai khoan nguoi ban chua duoc duyet",
                "Xin chao " + user.getFullName() + ",\n"
                        + "Ho so dang ky nguoi ban cua ban chua duoc duyet. "
                        + "Vui long lien he ho tro de biet them chi tiet."
        );

        return Map.of(
                "message", "Đã từ chối người bán",
                "id", profile.getId(),
                "approved", false,
                "status", STATUS_REJECTED
        );
    }

    public Map<String, Object> updateSellerStatus(Long id, String rawStatus) {
        SellerProfile profile = findSeller(id);
        String status = parseStatus(rawStatus);

        if (STATUS_ACTIVE.equals(status) && !profile.isApproved()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cần duyệt tài khoản trước khi kích hoạt");
        }

        profile.setStatus(status);
        sellerProfileRepository.save(profile);

        return Map.of(
                "message", "Cập nhật trạng thái thành công",
                "id", profile.getId(),
                "status", status
        );
    }

    private Specification<SellerProfile> buildSpec(Boolean approved, String status, String keyword) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            Join<SellerProfile, User> userJoin = root.join("user", JoinType.INNER);

            predicates.add(cb.equal(userJoin.get("role"), Role.SELLER));

            if (approved != null) {
                predicates.add(cb.equal(root.get("approved"), approved));
            }

            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }

            if (keyword != null && !keyword.isBlank()) {
                String keywordLike = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("storeName")), keywordLike),
                        cb.like(cb.lower(userJoin.get("fullName")), keywordLike),
                        cb.like(cb.lower(userJoin.get("email")), keywordLike),
                        cb.like(cb.lower(userJoin.get("phone")), keywordLike),
                        cb.like(root.get("cccd"), "%" + keyword.trim() + "%")
                ));
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private SellerProfile findSeller(Long id) {
        return sellerProfileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ người bán"));
    }

    private Map<String, Object> toSellerItem(SellerProfile profile) {
        User user = profile.getUser();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", profile.getId());
        data.put("userId", user.getId());
        data.put("storeName", profile.getStoreName());
        data.put("fullName", user.getFullName());
        data.put("email", user.getEmail());
        data.put("phone", user.getPhone());
        data.put("approved", profile.isApproved());
        data.put("status", profile.getStatus());
        data.put("emailVerified", user.isEnabled());
        data.put("createdAt", user.getCreatedAt());
        return data;
    }

    private Map<String, Object> toSellerDetail(SellerProfile profile) {
        User user = profile.getUser();
        Map<String, Object> data = toSellerItem(profile);
        data.put("warehouseProvince", profile.getWarehouseProvince());
        data.put("warehouseDistrict", profile.getWarehouseDistrict());
        data.put("warehouseWard", profile.getWarehouseWard());
        data.put("warehouseStreet", profile.getWarehouseStreet());
        data.put("cccd", profile.getCccd());
        data.put("bankName", profile.getBankName());
        data.put("bankAccountNumber", profile.getBankAccountNumber());
        data.put("bankAccountHolder", profile.getBankAccountHolder());
        data.put("rating", profile.getRating());
        data.put("avatarUrl", user.getAvatarUrl());
        return data;
    }

    private String parseStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ");
        }

        String status = rawStatus.trim().toUpperCase();
        if (!STATUS_ACTIVE.equals(status)
                && !STATUS_PENDING.equals(status)
                && !STATUS_REJECTED.equals(status)
                && !STATUS_LOCKED.equals(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ");
        }
        return status;
    }
}
