package com.fit.nlu.laptop.service;

import com.fit.nlu.laptop.entity.Order;
import com.fit.nlu.laptop.repository.CategoryRepository;
import com.fit.nlu.laptop.repository.OrderRepository;
import com.fit.nlu.laptop.repository.ProductRepository;
import com.fit.nlu.laptop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public Map<String, Object> getStats() {
        List<Order> allOrders = orderRepository.findAll();

        long totalOrders = allOrders.size();
        long pendingOrders = allOrders.stream().filter(o -> "PENDING".equals(o.getStatus())).count();
        long processingOrders = allOrders.stream().filter(o -> "PROCESSING".equals(o.getStatus())).count();
        long completedOrders = allOrders.stream().filter(o -> "DELIVERED".equals(o.getStatus()) || "COMPLETED".equals(o.getStatus())).count();
        long cancelledOrders = allOrders.stream().filter(o -> "CANCELLED".equals(o.getStatus())).count();

        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> "DELIVERED".equals(o.getStatus()) || "COMPLETED".equals(o.getStatus()) || "PROCESSING".equals(o.getStatus()))
                .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalProducts = productRepository.count();
        long totalUsers = userRepository.count();
        long totalCategories = categoryRepository.count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalOrders", totalOrders);
        stats.put("totalProducts", totalProducts);
        stats.put("totalUsers", totalUsers);
        stats.put("totalCategories", totalCategories);
        stats.put("pendingOrders", pendingOrders);
        stats.put("processingOrders", processingOrders);
        stats.put("completedOrders", completedOrders);
        stats.put("cancelledOrders", cancelledOrders);
        return stats;
    }

    public List<Map<String, Object>> getRevenue(String period) {
        List<Order> allOrders = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt() != null)
                .filter(o -> !"CANCELLED".equals(o.getStatus()))
                .toList();

        return switch (period.toLowerCase()) {
            case "daily" -> buildDailyRevenue(allOrders);
            case "yearly" -> buildYearlyRevenue(allOrders);
            default -> buildMonthlyRevenue(allOrders);
        };
    }

    private List<Map<String, Object>> buildDailyRevenue(List<Order> orders) {
        LocalDate today = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM");

        // Last 30 days
        Map<String, BigDecimal> revenueMap = new LinkedHashMap<>();
        Map<String, Long> orderMap = new LinkedHashMap<>();
        for (int i = 29; i >= 0; i--) {
            String label = today.minusDays(i).format(fmt);
            revenueMap.put(label, BigDecimal.ZERO);
            orderMap.put(label, 0L);
        }

        for (Order order : orders) {
            String label = order.getCreatedAt().toLocalDate().format(fmt);
            if (revenueMap.containsKey(label)) {
                revenueMap.merge(label, order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add);
                orderMap.merge(label, 1L, Long::sum);
            }
        }

        return buildResult(revenueMap, orderMap);
    }

    private List<Map<String, Object>> buildMonthlyRevenue(List<Order> orders) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM/yyyy");
        LocalDate today = LocalDate.now();

        // Last 12 months
        Map<String, BigDecimal> revenueMap = new LinkedHashMap<>();
        Map<String, Long> orderMap = new LinkedHashMap<>();
        for (int i = 11; i >= 0; i--) {
            String label = today.minusMonths(i).format(fmt);
            revenueMap.put(label, BigDecimal.ZERO);
            orderMap.put(label, 0L);
        }

        for (Order order : orders) {
            String label = order.getCreatedAt().toLocalDate().format(fmt);
            if (revenueMap.containsKey(label)) {
                revenueMap.merge(label, order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add);
                orderMap.merge(label, 1L, Long::sum);
            }
        }

        return buildResult(revenueMap, orderMap);
    }

    private List<Map<String, Object>> buildYearlyRevenue(List<Order> orders) {
        int currentYear = LocalDate.now().getYear();

        Map<String, BigDecimal> revenueMap = new LinkedHashMap<>();
        Map<String, Long> orderMap = new LinkedHashMap<>();
        for (int i = 4; i >= 0; i--) {
            String label = String.valueOf(currentYear - i);
            revenueMap.put(label, BigDecimal.ZERO);
            orderMap.put(label, 0L);
        }

        for (Order order : orders) {
            String label = String.valueOf(order.getCreatedAt().getYear());
            if (revenueMap.containsKey(label)) {
                revenueMap.merge(label, order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add);
                orderMap.merge(label, 1L, Long::sum);
            }
        }

        return buildResult(revenueMap, orderMap);
    }

    private List<Map<String, Object>> buildResult(Map<String, BigDecimal> revenueMap, Map<String, Long> orderMap) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (String label : revenueMap.keySet()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("label", label);
            item.put("revenue", revenueMap.get(label));
            item.put("orders", orderMap.get(label));
            result.add(item);
        }
        return result;
    }
}
