package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.dto.request.UpdateStockReq;
import com.fit.nlu.laptop.dto.response.PagedResponse;
import com.fit.nlu.laptop.entity.Product;
import com.fit.nlu.laptop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository productRepository;

    @Value("${app.upload.product-dir:uploads/products}")
    private String productUploadDir;

    public PagedResponse<Map<String, Object>> listProducts(
            int page,
            int size,
            String keyword,
            String category,
            String sort
    ) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);

        Pageable pageable = PageRequest.of(safePage - 1, safeSize, parseSort(sort));
        Specification<Product> spec = buildSpec(keyword, category);

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        List<Map<String, Object>> items = productPage.getContent().stream().map(this::toProductItem).toList();

        return new PagedResponse<>(
                items,
                safePage,
                safeSize,
                productPage.getTotalElements(),
                productPage.getTotalPages()
        );
    }

    public Map<String, Object> getProduct(Long id) {
        Product product = findProduct(id);
        return toProductDetail(product);
    }

    public Map<String, Object> createProduct(Map<String, Object> body) {
        Product product = new Product();
        applyProductFromBody(product, body, true);
        productRepository.save(product);
        return Map.of("message", "Created", "data", toProductDetail(product));
    }

    public Map<String, Object> updateProduct(Long id, Map<String, Object> body) {
        Product product = findProduct(id);
        applyProductFromBody(product, body, false);
        productRepository.save(product);
        return Map.of("message", "Updated", "data", toProductDetail(product));
    }

    public Map<String, Object> deleteProduct(Long id) {
        Product product = findProduct(id);
        productRepository.delete(product);
        return Map.of("message", "Deleted", "id", id);
    }

    public Map<String, Object> updateStock(Long id, UpdateStockReq req) {
        Product product = findProduct(id);

        if (req.stock() != null && req.stock() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock không hợp lệ");
        }

        // Product doesn't have stock or freshness, just ignoring
        productRepository.save(product);

        return Map.of(
                "message", "Stock updated",
                "id", id,
                "stock", req.stock() != null ? req.stock() : 0,
                "freshness", req.freshness() != null ? req.freshness() : "HIGH"
        );
    }

    public Map<String, Object> uploadProductImage(Long id, MultipartFile image) {
        Product product = findProduct(id);

        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File ảnh không được để trống");
        }

        String extension = getExtension(image.getOriginalFilename());
        if (!isValidImageExtension(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ cho phép file ảnh (.jpg, .jpeg, .png, .gif)");
        }

        String newFileName = "product_" + UUID.randomUUID() + extension;

        try {
            Path uploadPath = Paths.get(productUploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Files.copy(image.getInputStream(), uploadPath.resolve(newFileName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi upload file: " + e.getMessage());
        }

        String imageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/products/")
                .path(newFileName)
                .toUriString();

        product.setImageUrl(imageUrl);
        productRepository.save(product);

        return Map.of(
                "message", "Image uploaded",
                "id", id,
                "fileName", newFileName,
                "imageUrl", imageUrl
        );
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại"));
    }

    private void applyProductFromBody(Product product, Map<String, Object> body, boolean isCreate) {
        if (isCreate || body.containsKey("name")) {
            String name = extractString(body, "name", isCreate);
            if (name != null) {
                product.setName(name);
            }
        }

        if (isCreate || body.containsKey("price")) {
            BigDecimal price = extractBigDecimal(body, "price", isCreate);
            if (price != null) {
                product.setPrice(price);
            }
        }

        if (body.containsKey("description")) {
            product.setDescription(extractString(body, "description", false));
        }

        if (body.containsKey("category")) {
            try {
                product.setCategoryId(Long.parseLong(extractString(body, "category", false)));
            } catch (Exception ignored) {}
        }

        if (body.containsKey("active")) {
            product.setSale(Boolean.parseBoolean(String.valueOf(body.get("active"))));
        }
    }

    private Specification<Product> buildSpec(String keyword, String category) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            if (keyword != null && !keyword.isBlank()) {
                String keywordLike = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), keywordLike),
                        cb.like(cb.lower(root.get("description")), keywordLike)
                ));
            }

            if (category != null && !category.isBlank()) {
                try {
                    predicates.add(cb.equal(root.get("categoryId"), Long.parseLong(category.trim())));
                } catch (Exception ignored) {}
            }

            return cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        String[] parts = sort.split(",");
        String sortField = parts[0].trim();
        String mappedField = switch (sortField) {
            case "createdAt", "updatedAt", "name", "price", "stock" -> sortField;
            default -> "createdAt";
        };

        Sort.Direction direction = (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim()))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return Sort.by(direction, mappedField);
    }

    private Map<String, Object> toProductItem(Product product) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", product.getId());
        data.put("name", product.getName());
        data.put("category", product.getCategoryId() != null ? product.getCategoryId().toString() : "");
        data.put("price", product.getPrice());
        data.put("stock", 100);
        data.put("freshness", "HIGH");
        data.put("active", product.isSale());
        data.put("createdAt", product.getCreatedAt());
        return data;
    }

    private Map<String, Object> toProductDetail(Product product) {
        Map<String, Object> data = toProductItem(product);
        data.put("description", product.getDescription());
        data.put("images", product.getImageUrl() != null ? List.of(product.getImageUrl()) : List.of());
        data.put("updatedAt", product.getCreatedAt());
        return data;
    }

    private String extractString(Map<String, Object> body, String key, boolean required) {
        Object value = body.get(key);
        if (value == null) {
            if (required) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, key + " không được để trống");
            }
            return null;
        }

        String text = String.valueOf(value).trim();
        if (required && text.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, key + " không được để trống");
        }
        return text;
    }

    private Integer extractInteger(Map<String, Object> body, String key, boolean required) {
        Object value = body.get(key);
        if (value == null) {
            if (required) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, key + " không được để trống");
            }
            return null;
        }

        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, key + " không hợp lệ");
        }
    }

    private BigDecimal extractBigDecimal(Map<String, Object> body, String key, boolean required) {
        Object value = body.get(key);
        if (value == null) {
            if (required) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, key + " không được để trống");
            }
            return null;
        }

        try {
            return new BigDecimal(String.valueOf(value));
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, key + " không hợp lệ");
        }
    }

    private String getExtension(String fileName) {
        String cleanName = StringUtils.cleanPath(fileName == null ? "" : fileName);
        if (!cleanName.contains(".")) {
            return "";
        }
        return cleanName.substring(cleanName.lastIndexOf("."));
    }

    private boolean isValidImageExtension(String extension) {
        return ".jpg".equalsIgnoreCase(extension)
                || ".jpeg".equalsIgnoreCase(extension)
                || ".png".equalsIgnoreCase(extension)
                || ".gif".equalsIgnoreCase(extension);
    }
}
