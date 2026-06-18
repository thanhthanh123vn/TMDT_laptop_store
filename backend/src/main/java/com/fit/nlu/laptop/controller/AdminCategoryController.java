package com.fit.nlu.laptop.controller;

import com.fit.nlu.laptop.entity.Category;
import com.fit.nlu.laptop.service.AdminCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final AdminCategoryService adminCategoryService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listCategories() {
        return ResponseEntity.ok(adminCategoryService.listCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategory(@PathVariable Long id) {
        return ResponseEntity.ok(adminCategoryService.getCategory(id));
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(adminCategoryService.createCategory(body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(adminCategoryService.updateCategory(id, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        return ResponseEntity.ok(adminCategoryService.deleteCategory(id));
    }
}
