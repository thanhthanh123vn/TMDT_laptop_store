package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.entity.Category;
import com.fit.nlu.laptop.repository.CategoryRepository;
import com.fit.nlu.laptop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminCategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public List<Map<String, Object>> listCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toCategoryItem)
                .toList();
    }

    public Map<String, Object> getCategory(Long id) {
        return toCategoryItem(findCategory(id));
    }

    public Map<String, Object> createCategory(Map<String, Object> body) {
        String name = extractRequired(body, "name");

        if (categoryRepository.existsByName(name)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên danh mục đã tồn tại");
        }

        Category category = new Category();
        category.setName(name);
        category.setDescription(extractOptional(body, "description"));
        category.setImageUrl(extractOptional(body, "imageUrl"));
        categoryRepository.save(category);

        return Map.of("message", "Tạo danh mục thành công", "data", toCategoryItem(category));
    }

    public Map<String, Object> updateCategory(Long id, Map<String, Object> body) {
        Category category = findCategory(id);

        if (body.containsKey("name")) {
            String name = extractRequired(body, "name");
            if (!name.equals(category.getName()) && categoryRepository.existsByName(name)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên danh mục đã tồn tại");
            }
            category.setName(name);
        }
        if (body.containsKey("description")) {
            category.setDescription(extractOptional(body, "description"));
        }
        if (body.containsKey("imageUrl")) {
            category.setImageUrl(extractOptional(body, "imageUrl"));
        }

        categoryRepository.save(category);
        return Map.of("message", "Cập nhật thành công", "data", toCategoryItem(category));
    }

    public Map<String, Object> deleteCategory(Long id) {
        Category category = findCategory(id);
        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Không thể xóa danh mục đang có " + productCount + " sản phẩm");
        }
        categoryRepository.delete(category);
        return Map.of("message", "Xóa danh mục thành công", "id", id);
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Danh mục không tồn tại"));
    }

    private Map<String, Object> toCategoryItem(Category category) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", category.getId());
        data.put("name", category.getName());
        data.put("description", category.getDescription() != null ? category.getDescription() : "");
        data.put("imageUrl", category.getImageUrl() != null ? category.getImageUrl() : "");
        data.put("productCount", productRepository.countByCategoryId(category.getId()));
        data.put("createdAt", category.getCreatedAt());
        return data;
    }

    private String extractRequired(Map<String, Object> body, String key) {
        Object value = body.get(key);
        if (value == null || String.valueOf(value).isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, key + " không được để trống");
        }
        return String.valueOf(value).trim();
    }

    private String extractOptional(Map<String, Object> body, String key) {
        Object value = body.get(key);
        return value != null ? String.valueOf(value).trim() : null;
    }
}
