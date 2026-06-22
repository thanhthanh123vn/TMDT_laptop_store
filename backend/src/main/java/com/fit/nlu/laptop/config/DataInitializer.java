package com.fit.nlu.laptop.config;

import com.fit.nlu.laptop.entity.Category;
import com.fit.nlu.laptop.entity.Product;
import com.fit.nlu.laptop.repository.CategoryRepository;
import com.fit.nlu.laptop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {

        // ── Seed categories ──
        if (categoryRepository.count() == 0) {
            Category c1 = new Category();
            c1.setName("Laptop Văn Phòng");
            c1.setImageUrl("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80");

            Category c2 = new Category();
            c2.setName("Laptop Gaming");
            c2.setImageUrl("https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80");

            Category c3 = new Category();
            c3.setName("Laptop Đồ Họa");
            c3.setImageUrl("https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80");

            Category c4 = new Category();
            c4.setName("Macbook");
            c4.setImageUrl("https://images.unsplash.com/photo-1611186871525-9c4a3b5e3e3e?w=600&q=80");

            Category c5 = new Category();
            c5.setName("Laptop Sinh Viên");
            c5.setImageUrl("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80");

            Category c6 = new Category();
            c6.setName("Laptop Doanh Nhân");
            c6.setImageUrl("https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&q=80");

            categoryRepository.saveAll(Arrays.asList(c1, c2, c3, c4, c5, c6));
            System.out.println("Categories initialized.");
        }


        if (productRepository.count() == 0) {

            List<Category> cats = categoryRepository.findAll();

            Long idVP  = cats.get(0).getId(); // Văn Phòng
            Long idGM  = cats.get(1).getId(); // Gaming
            Long idDH  = cats.get(2).getId(); // Đồ Họa
            Long idMB  = cats.get(3).getId(); // Macbook
            Long idSV  = cats.get(4).getId(); // Sinh Viên
            Long idDN  = cats.get(5).getId(); // Doanh Nhân

            Product p1 = new Product();
            p1.setName("Dell XPS 15 9500");
            p1.setBrand("Dell");
            p1.setPrice(new BigDecimal("29900000"));
            p1.setOldPrice(new BigDecimal("36900000"));
            p1.setImageUrl("https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800");
            p1.setCpu("Intel Core i7-10750H");
            p1.setGpu("NVIDIA GTX 1650 Ti");
            p1.setRam("16GB");
            p1.setStorage("512GB");
            p1.setStorageType("SSD");
            p1.setScreenSize("15.6\" FHD");
            p1.setWeight("2.0 kg");
            p1.setBatteryCondition("90% health");
            p1.setCondition("Like New");
            p1.setRating(4.8);
            p1.setReviews(124);
            p1.setCategoryId(idGM);
            p1.setDescription("Laptop cao cấp với hiệu năng mạnh mẽ, màn hình sắc nét. Phù hợp cho dân văn phòng và gaming nhẹ.");
            p1.setBestSeller(true);
            p1.setSale(true);

            Product p2 = new Product();
            p2.setName("HP Pavilion Gaming 15");
            p2.setBrand("HP");
            p2.setPrice(new BigDecimal("20500000"));
            p2.setOldPrice(new BigDecimal("25000000"));
            p2.setImageUrl("https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800");
            p2.setCpu("AMD Ryzen 5 4600H");
            p2.setGpu("NVIDIA GTX 1660 Ti");
            p2.setRam("16GB");
            p2.setStorage("512GB");
            p2.setStorageType("SSD");
            p2.setScreenSize("15.6\" FHD 144Hz");
            p2.setWeight("2.3 kg");
            p2.setBatteryCondition("85% health");
            p2.setCondition("99%");
            p2.setRating(4.6);
            p2.setReviews(89);
            p2.setCategoryId(idGM);
            p2.setDescription("Laptop gaming tầm trung với màn hình 144Hz, hiệu năng tốt cho các tựa game phổ biến.");
            p2.setHot(true);

            Product p3 = new Product();
            p3.setName("Lenovo ThinkPad X1 Carbon");
            p3.setBrand("Lenovo");
            p3.setPrice(new BigDecimal("25200000"));
            p3.setOldPrice(new BigDecimal("32000000"));
            p3.setImageUrl("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800");
            p3.setCpu("Intel Core i5-10210U");
            p3.setGpu("Integrated Intel UHD");
            p3.setRam("8GB");
            p3.setStorage("256GB");
            p3.setStorageType("SSD");
            p3.setScreenSize("14\" FHD");
            p3.setWeight("1.1 kg");
            p3.setBatteryCondition("92% health");
            p3.setCondition("Like New");
            p3.setRating(4.9);
            p3.setReviews(156);
            p3.setCategoryId(idDN);
            p3.setDescription("Laptop doanh nhân siêu nhẹ với bàn phím huyền thoại ThinkPad, pin trâu cả ngày làm việc.");
            p3.setBestSeller(true);

            Product p4 = new Product();
            p4.setName("ASUS ROG Strix G15");
            p4.setBrand("Asus");
            p4.setPrice(new BigDecimal("34500000"));
            p4.setOldPrice(new BigDecimal("43000000"));
            p4.setImageUrl("https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800");
            p4.setCpu("AMD Ryzen 7 5800H");
            p4.setGpu("NVIDIA RTX 3060");
            p4.setRam("16GB");
            p4.setStorage("1TB");
            p4.setStorageType("SSD");
            p4.setScreenSize("15.6\" QHD 165Hz");
            p4.setWeight("2.3 kg");
            p4.setBatteryCondition("88% health");
            p4.setCondition("Good");
            p4.setRating(4.7);
            p4.setReviews(203);
            p4.setCategoryId(idGM);
            p4.setDescription("Laptop gaming hiệu năng cao với RTX 3060, màn hình QHD 165Hz cho trải nghiệm gaming đỉnh cao.");
            p4.setHot(true);
            p4.setBestSeller(true);

            Product p5 = new Product();
            p5.setName("Dell Inspiron 15 3000");
            p5.setBrand("Dell");
            p5.setPrice(new BigDecimal("10300000"));
            p5.setImageUrl("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800");
            p5.setCpu("Intel Core i3-1115G4");
            p5.setGpu("Integrated Intel UHD");
            p5.setRam("8GB");
            p5.setStorage("256GB");
            p5.setStorageType("SSD");
            p5.setScreenSize("15.6\" HD");
            p5.setWeight("1.9 kg");
            p5.setBatteryCondition("80% health");
            p5.setCondition("Refurbished");
            p5.setRating(4.2);
            p5.setReviews(67);
            p5.setCategoryId(idSV);
            p5.setDescription("Laptop giá rẻ cho sinh viên và công việc văn phòng cơ bản, nhỏ gọn dễ mang theo.");

            Product p6 = new Product();
            p6.setName("HP EliteBook 840 G7");
            p6.setBrand("HP");
            p6.setPrice(new BigDecimal("21800000"));
            p6.setOldPrice(new BigDecimal("27500000"));
            p6.setImageUrl("https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800");
            p6.setCpu("Intel Core i7-10510U");
            p6.setGpu("Integrated Intel UHD");
            p6.setRam("16GB");
            p6.setStorage("512GB");
            p6.setStorageType("SSD");
            p6.setScreenSize("14\" FHD");
            p6.setWeight("1.5 kg");
            p6.setBatteryCondition("93% health");
            p6.setCondition("Like New");
            p6.setRating(4.8);
            p6.setReviews(92);
            p6.setCategoryId(idVP);
            p6.setDescription("Laptop doanh nghiệp cao cấp với tính năng bảo mật vượt trội, lý tưởng cho môi trường công sở.");
            p6.setBestSeller(true);

            Product p7 = new Product();
            p7.setName("Lenovo Legion 5 Pro");
            p7.setBrand("Lenovo");
            p7.setPrice(new BigDecimal("39000000"));
            p7.setOldPrice(new BigDecimal("48000000"));
            p7.setImageUrl("https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800");
            p7.setCpu("AMD Ryzen 7 5800H");
            p7.setGpu("NVIDIA RTX 3070");
            p7.setRam("32GB");
            p7.setStorage("1TB");
            p7.setStorageType("SSD");
            p7.setScreenSize("16\" QHD 165Hz");
            p7.setWeight("2.5 kg");
            p7.setBatteryCondition("90% health");
            p7.setCondition("99%");
            p7.setRating(4.9);
            p7.setReviews(178);
            p7.setCategoryId(idGM);
            p7.setDescription("Laptop gaming cao cấp với RTX 3070, màn hình 16 inch QHD, hiệu năng đỉnh cho game thủ chuyên nghiệp.");
            p7.setHot(true);
            p7.setSale(true);

            Product p8 = new Product();
            p8.setName("ASUS VivoBook 15");
            p8.setBrand("Asus");
            p8.setPrice(new BigDecimal("12600000"));
            p8.setImageUrl("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800");
            p8.setCpu("Intel Core i5-1135G7");
            p8.setGpu("Integrated Intel Iris Xe");
            p8.setRam("8GB");
            p8.setStorage("512GB");
            p8.setStorageType("SSD");
            p8.setScreenSize("15.6\" FHD");
            p8.setWeight("1.8 kg");
            p8.setBatteryCondition("87% health");
            p8.setCondition("Good");
            p8.setRating(4.4);
            p8.setReviews(145);
            p8.setCategoryId(idSV);
            p8.setDescription("Laptop mỏng nhẹ, thiết kế trẻ trung, phù hợp cho sinh viên và người dùng phổ thông.");

            Product p9 = new Product();
            p9.setName("MacBook Air M1 2020");
            p9.setBrand("Apple");
            p9.setPrice(new BigDecimal("22000000"));
            p9.setOldPrice(new BigDecimal("28000000"));
            p9.setImageUrl("https://images.unsplash.com/photo-1611186871525-9c4a3b5e3e3e?w=800");
            p9.setCpu("Apple M1 8-core");
            p9.setGpu("Apple M1 7-core GPU");
            p9.setRam("8GB");
            p9.setStorage("256GB");
            p9.setStorageType("SSD");
            p9.setScreenSize("13.3\" Retina");
            p9.setWeight("1.29 kg");
            p9.setBatteryCondition("95% health");
            p9.setCondition("Like New");
            p9.setRating(4.9);
            p9.setReviews(312);
            p9.setCategoryId(idMB);
            p9.setDescription("MacBook Air với chip M1 cách mạng, hiệu năng vượt trội, pin 18 giờ, không quạt tản nhiệt.");
            p9.setBestSeller(true);
            p9.setHot(true);

            Product p10 = new Product();
            p10.setName("Dell Latitude 7420");
            p10.setBrand("Dell");
            p10.setPrice(new BigDecimal("28700000"));
            p10.setOldPrice(new BigDecimal("35500000"));
            p10.setImageUrl("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800");
            p10.setCpu("Intel Core i7-1185G7");
            p10.setGpu("Integrated Intel Iris Xe");
            p10.setRam("16GB");
            p10.setStorage("512GB");
            p10.setStorageType("SSD");
            p10.setScreenSize("14\" FHD");
            p10.setWeight("1.4 kg");
            p10.setBatteryCondition("91% health");
            p10.setCondition("Like New");
            p10.setRating(4.7);
            p10.setReviews(88);
            p10.setCategoryId(idVP);
            p10.setDescription("Laptop doanh nghiệp bền bỉ với pin lâu, bảo mật cao, lý tưởng cho người hay di chuyển.");

            Product p11 = new Product();
            p11.setName("ASUS ZenBook 14");
            p11.setBrand("Asus");
            p11.setPrice(new BigDecimal("19500000"));
            p11.setOldPrice(new BigDecimal("24000000"));
            p11.setImageUrl("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800");
            p11.setCpu("Intel Core i5-1135G7");
            p11.setGpu("Integrated Intel Iris Xe");
            p11.setRam("8GB");
            p11.setStorage("512GB");
            p11.setStorageType("SSD");
            p11.setScreenSize("14\" FHD");
            p11.setWeight("1.2 kg");
            p11.setBatteryCondition("90% health");
            p11.setCondition("99%");
            p11.setRating(4.6);
            p11.setReviews(112);
            p11.setCategoryId(idDH);
            p11.setDescription("Ultrabook mỏng nhẹ cao cấp với thiết kế sang trọng, hiệu năng ổn định cho công việc hàng ngày.");

            Product p12 = new Product();
            p12.setName("HP OMEN 17");
            p12.setBrand("HP");
            p12.setPrice(new BigDecimal("43600000"));
            p12.setOldPrice(new BigDecimal("55000000"));
            p12.setImageUrl("https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800");
            p12.setCpu("Intel Core i7-11800H");
            p12.setGpu("NVIDIA RTX 3080");
            p12.setRam("32GB");
            p12.setStorage("1TB");
            p12.setStorageType("SSD");
            p12.setScreenSize("17.3\" QHD 165Hz");
            p12.setWeight("2.8 kg");
            p12.setBatteryCondition("89% health");
            p12.setCondition("99%");
            p12.setRating(4.8);
            p12.setReviews(134);
            p12.setCategoryId(idGM);
            p12.setDescription("Laptop gaming flagship với RTX 3080, màn hình 17 inch QHD, thay thế hoàn toàn máy tính bàn.");
            p12.setSale(true);

            productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12));
            System.out.println("Products initialized with 12 items.");
        }
    }
}
