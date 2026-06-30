package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.entity.BoostPackage;
import com.fit.nlu.laptop.entity.Product;
import com.fit.nlu.laptop.entity.SellerProfile;
import com.fit.nlu.laptop.repository.BoostPackageRepository;
import com.fit.nlu.laptop.repository.ProductRepository;
import com.fit.nlu.laptop.repository.SellerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BoostPackageService {

    private final BoostPackageRepository boostPackageRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final ProductRepository productRepository;
    private final FileService fileService;

    private static final Map<Integer, BigDecimal> PRICE_TABLE;
    static {
        PRICE_TABLE = new java.util.LinkedHashMap<>();
        PRICE_TABLE.put(1,  BigDecimal.valueOf(99_000));
        PRICE_TABLE.put(3,  BigDecimal.valueOf(249_000));
        PRICE_TABLE.put(6,  BigDecimal.valueOf(449_000));
        PRICE_TABLE.put(12, BigDecimal.valueOf(799_000));
    }

    public Map<Integer, BigDecimal> getPriceTable() {
        return PRICE_TABLE;
    }

    // ─── Lấy lịch sử gói của seller ─────────────────────────────────────────

    public List<BoostPackage> getSellerPackages(Long userId) {
        SellerProfile seller = getSellerProfile(userId);
        return boostPackageRepository.findBySellerId(seller.getId());
    }

    // ─── Tạo gói (PENDING_PAYMENT) ───────────────────────────────────────────

    @Transactional
    public BoostPackage createBoostPackage(Long userId, Long productId, int durationMonths) {
        if (!PRICE_TABLE.containsKey(durationMonths)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời hạn không hợp lệ");
        }

        SellerProfile seller = getSellerProfile(userId);

        Product product = productRepository.findByIdAndIsDeletedFalse(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sản phẩm không thuộc về bạn");
        }
        if (product.getStock() == null || product.getStock() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sản phẩm đã hết hàng");
        }

        BigDecimal amount = PRICE_TABLE.get(durationMonths);

        BoostPackage pkg = new BoostPackage();
        pkg.setSeller(seller);
        pkg.setProduct(product);
        pkg.setDurationMonths(durationMonths);
        pkg.setAmount(amount);
        pkg.setStatus("PENDING_PAYMENT");
        return boostPackageRepository.save(pkg);
    }

    // ─── Seller submit ảnh CK → sang PENDING_APPROVAL ────────────────────────

    @Transactional
    public BoostPackage submitPaymentProof(Long userId, Long packageId, MultipartFile proofFile) {
        SellerProfile seller = getSellerProfile(userId);
        BoostPackage pkg = findPackage(packageId);

        if (!pkg.getSeller().getId().equals(seller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền thao tác gói này");
        }
        if (!"PENDING_PAYMENT".equals(pkg.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gói không ở trạng thái chờ thanh toán");
        }

        try {
            String proofUrl = fileService.saveProductImage(proofFile);
            pkg.setTransferProofUrl(proofUrl);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể upload ảnh chuyển khoản");
        }

        pkg.setStatus("PENDING_APPROVAL");
        pkg.setPurchasedAt(LocalDateTime.now());
        return boostPackageRepository.save(pkg);
    }

    // ─── Admin: lấy danh sách chờ duyệt ─────────────────────────────────────

    public List<BoostPackage> getPendingApproval() {
        return boostPackageRepository.findByStatus("PENDING_APPROVAL");
    }

    public List<BoostPackage> getAllPackages() {
        return boostPackageRepository.findAll();
    }

    // ─── Admin: duyệt gói ────────────────────────────────────────────────────

    @Transactional
    public BoostPackage approvePackage(Long packageId) {
        BoostPackage pkg = findPackage(packageId);
        if (!"PENDING_APPROVAL".equals(pkg.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gói không ở trạng thái chờ duyệt");
        }
        LocalDateTime now = LocalDateTime.now();
        pkg.setStatus("ACTIVE");
        pkg.setApprovedAt(now);
        pkg.setExpiredAt(now.plusMonths(pkg.getDurationMonths()));
        boostPackageRepository.save(pkg);

        Product p = pkg.getProduct();
        p.setBestSeller(true);
        productRepository.save(p);

        return pkg;
    }

    // ─── Admin: từ chối gói ──────────────────────────────────────────────────

    @Transactional
    public BoostPackage rejectPackage(Long packageId) {
        BoostPackage pkg = findPackage(packageId);
        pkg.setStatus("REJECTED");
        return boostPackageRepository.save(pkg);
    }

    // ─── Seller: chi tiết gói ────────────────────────────────────────────────

    public BoostPackage getPackageDetail(Long userId, Long packageId) {
        SellerProfile seller = getSellerProfile(userId);
        BoostPackage pkg = findPackage(packageId);
        if (!pkg.getSeller().getId().equals(seller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền xem gói này");
        }
        return pkg;
    }

    // ─── Tự động expire gói hết hạn (chạy mỗi 1 giờ) ────────────────────────

    @Scheduled(fixedDelay = 3_600_000)
    @Transactional
    public void expirePackages() {
        List<BoostPackage> expired = boostPackageRepository.findExpiredActive(LocalDateTime.now());
        for (BoostPackage pkg : expired) {
            pkg.setStatus("EXPIRED");
            boostPackageRepository.save(pkg);

            boolean stillBoosted = boostPackageRepository.existsActiveBoostedProduct(pkg.getProduct().getId());
            if (!stillBoosted) {
                Product p = pkg.getProduct();
                p.setBestSeller(false);
                productRepository.save(p);
            }
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private SellerProfile getSellerProfile(Long userId) {
        return sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ người bán"));
    }

    private BoostPackage findPackage(Long id) {
        return boostPackageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy gói đẩy tin"));
    }
}
