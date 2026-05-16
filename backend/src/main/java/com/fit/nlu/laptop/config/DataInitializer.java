package com.fit.nlu.laptop.config;

import com.fit.nlu.laptop.entity.Product;
import com.fit.nlu.laptop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.Arrays;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            Product p1 = new Product();
            p1.setName("Dell XPS 15 9500");
            p1.setBrand("Dell");
            p1.setPrice(new BigDecimal("1299"));
            p1.setOldPrice(new BigDecimal("1599"));
            p1.setImageUrl("https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800");
            p1.setCpu("Intel Core i7-10750H");
            p1.setGpu("NVIDIA GTX 1650 Ti");
            p1.setRam("16GB");
            p1.setStorage("512GB");
            p1.setStorageType("SSD");
            p1.setScreenSize("15.6\" FHD");
            p1.setCondition("Like New");
            p1.setRating(4.8);
            p1.setReviews(124);
            p1.setCategory("Gaming,Office");
            p1.setBestSeller(true);
            p1.setSale(true);

            Product p2 = new Product();
            p2.setName("HP Pavilion Gaming 15");
            p2.setBrand("HP");
            p2.setPrice(new BigDecimal("899"));
            p2.setOldPrice(new BigDecimal("1099"));
            p2.setImageUrl("https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800");
            p2.setCpu("AMD Ryzen 5 4600H");
            p2.setGpu("NVIDIA GTX 1660 Ti");
            p2.setRam("16GB");
            p2.setStorage("512GB");
            p2.setStorageType("SSD");
            p2.setScreenSize("15.6\" FHD 144Hz");
            p2.setCondition("99%");
            p2.setRating(4.6);
            p2.setReviews(89);
            p2.setCategory("Gaming,Budget");
            p2.setHot(true);

            Product p3 = new Product();
            p3.setName("Lenovo ThinkPad X1 Carbon");
            p3.setBrand("Lenovo");
            p3.setPrice(new BigDecimal("1099"));
            p3.setOldPrice(new BigDecimal("1399"));
            p3.setImageUrl("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800");
            p3.setCpu("Intel Core i5-10210U");
            p3.setGpu("Integrated Intel UHD");
            p3.setRam("8GB");
            p3.setStorage("256GB");
            p3.setStorageType("SSD");
            p3.setScreenSize("14\" FHD");
            p3.setCondition("Like New");
            p3.setRating(4.9);
            p3.setReviews(156);
            p3.setCategory("Office,Student");
            p3.setBestSeller(true);

            productRepository.saveAll(Arrays.asList(p1, p2, p3));
            System.out.println("Data initialized with 3 products.");
        }
    }
}
