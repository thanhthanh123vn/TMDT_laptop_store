import React, { useState, useMemo } from "react";
import { 
  Search, 
  User, // Icon của bạn bè
  Laptop, 
  Gamepad2, 
  Briefcase, 
  GraduationCap, 
  Filter, 
  X, 
  Flame, 
  Clock, 
  Star,
  Sparkles,
  Lightbulb
} from "lucide-react";
import { Link } from "react-router"; // Import của bạn bè
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import type { FilterOptions, SortOption } from "../types";
import { laptops, getLaptopsByIds } from "../data/laptops.ts";
import { useStore } from "../context/StoreContext";

// Cấu hình giá trị mặc định
const initialFilters: FilterOptions & { brand: string } = {
  priceRange: [0, 99999],
  ram: [],
  cpu: [],
  gpu: [],
  storageType: [],
  condition: [],
  category: "All",
  brand: "All",
};

// Cấu hình danh mục visual (UI Mới)
const categoryCards = [
  { id: "Office", label: "Văn phòng", icon: Briefcase, desc: "Mỏng nhẹ, pin trâu", color: "bg-blue-50 text-blue-600" },
  { id: "Gaming", label: "Gaming", icon: Gamepad2, desc: "Hiệu năng cực đỉnh", color: "bg-red-50 text-red-600" },
  { id: "Design", label: "Đồ họa", icon: Laptop, desc: "Màn hình chuẩn màu", color: "bg-purple-50 text-purple-600" },
  { id: "Student", label: "Học tập", icon: GraduationCap, desc: "Giá tốt cho SV", color: "bg-green-50 text-green-600" },
];

export const HomePage: React.FC = () => {
  const { recentlyViewed } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("best-selling");

  const [filters, setFilters] = useState(initialFilters);

  // Hàm dọn dẹp bộ lọc khi bấm "Xóa bộ lọc"
  const handleClearAllFilters = () => {
    setFilters(initialFilters);
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("best-selling");
  };

  // Kiểm tra xem có bộ lọc nào đang được áp dụng hay không
  const hasActiveFilters =
      searchQuery !== "" ||
      selectedCategory !== "All" ||
      filters.brand !== "All" ||
      filters.priceRange[0] !== 0 ||
      filters.priceRange[1] !== 99999 ||
      filters.ram.length > 0 ||
      filters.cpu.length > 0 ||
      sortBy !== "best-selling";

  // Xử lý Lọc và Sắp xếp (Giữ nguyên logic của bạn bè)
  const filteredLaptops = useMemo(() => {
    if (!laptops || laptops.length === 0) return [];

    let result = [...laptops];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
          (laptop) =>
              laptop.name.toLowerCase().includes(query) ||
              laptop.brand.toLowerCase().includes(query) ||
              laptop.cpu.toLowerCase().includes(query) ||
              laptop.gpu.toLowerCase().includes(query),
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((laptop) =>
          laptop.category.includes(selectedCategory),
      );
    }

    if (filters.brand !== "All") {
      result = result.filter((laptop) =>
          laptop.brand.toLowerCase() === filters.brand.toLowerCase()
      );
    }

    result = result.filter(
        (laptop) =>
            Number(laptop.price || 0) >= filters.priceRange[0] &&
            Number(laptop.price || 0) <= filters.priceRange[1],
    );

    if (filters.ram.length > 0) {
      result = result.filter((laptop) => filters.ram.includes(laptop.ram));
    }

    if (filters.cpu.length > 0) {
      result = result.filter((laptop) =>
          filters.cpu.some((cpu) =>
              laptop.cpu.includes(cpu.replace("Intel ", "i").replace("AMD ", "")),
          ),
      );
    }

    if (filters.gpu.length > 0) {
      result = result.filter((laptop) =>
          filters.gpu.some((gpu) => laptop.gpu.includes(gpu)),
      );
    }

    if (filters.storageType.length > 0) {
      result = result.filter((laptop) =>
          filters.storageType.includes(laptop.storageType),
      );
    }

    if (filters.condition.length > 0) {
      result = result.filter((laptop) =>
          filters.condition.includes(laptop.condition),
      );
    }

    switch (sortBy) {
      case "price-low": result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0)); break;
      case "price-high": result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0)); break;
      case "top-rated": result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)); break;
      case "newest": result.sort((a, b) => String(b.id).localeCompare(String(a.id))); break;
      case "best-selling":
        result.sort((a, b) => {
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return Number(b.reviewCount || 0) - Number(a.reviewCount || 0);
        });
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, filters, sortBy]);

  // Các list dùng cho UI section dưới cùng
  const recentlyViewedLaptops = getLaptopsByIds(recentlyViewed).slice(0, 4);
  const bestSellers = useMemo(() => laptops.filter((l) => l.isBestSeller).slice(0, 4), []);
  const hotDeals = useMemo(() => laptops.filter((l) => l.isHot).slice(0, 4), []);
  const newestLaptops = useMemo(() => [...laptops].sort((a, b) => String(b.id).localeCompare(String(a.id))).slice(0, 4), []);
  const recommendedLaptops = useMemo(() => laptops.slice(2, 6), []); // Giả lập data gợi ý

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* 1. HERO SECTION & SEARCH */}
      <section className="bg-slate-900 text-white pt-20 pb-24 px-4 relative overflow-hidden">
        
        {/* NÚT TÀI KHOẢN (Đã fix UI cho hợp với nền tối) */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-50">
          <Link
            to="/profile"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-full backdrop-blur-md transition-all font-medium border border-white/20 shadow-sm"
          >
            <User className="w-5 h-5" />
            <span className="hidden sm:inline">Tài khoản của tôi</span>
          </Link>
        </div>

        {/* Abstract background effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Tìm Laptop Cũ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Chất Lượng</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Khám phá hàng ngàn mẫu laptop đã qua sử dụng với mức giá tốt nhất, bảo hành dài hạn và chất lượng được kiểm định nghiêm ngặt.
          </p>

          <div className="relative max-w-2xl mx-auto shadow-2xl rounded-2xl">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <Input
              type="text"
              placeholder="Nhập tên máy, CPU, hoặc hãng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-7 text-lg rounded-2xl bg-white text-slate-900 border-none focus-visible:ring-4 focus-visible:ring-blue-500/50 shadow-inner"
            />
          </div>
        </div>
      </section>

      {/* 2. VISUAL CATEGORIES (Thẻ phân loại trực quan) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categoryCards.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? "All" : cat.id)}
              className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 bg-white hover:shadow-lg hover:-translate-y-1 ${
                selectedCategory === cat.id ? "border-blue-500 shadow-md" : "border-transparent shadow-sm"
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${cat.color}`}>
                <cat.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{cat.label}</h3>
              <p className="text-sm text-slate-500 mt-1">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PROMO CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <Carousel className="w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200">
          <CarouselContent>
            <CarouselItem>
              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[200px]">
                <Flame className="w-10 h-10 mb-3 text-orange-300" />
                <h2 className="text-3xl font-bold mb-2">Xả Kho Laptop Gaming</h2>
                <p className="text-lg text-indigo-100">Giảm sâu lên đến 30% cho các dòng RTX 3000 Series</p>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[200px]">
                <Briefcase className="w-10 h-10 mb-3 text-teal-200" />
                <h2 className="text-3xl font-bold mb-2">Tuần Lễ Doanh Nhân</h2>
                <p className="text-lg text-teal-100">Mua ThinkPad & Latitude tặng ngay túi chống sốc</p>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-white/20 text-white border-none hover:bg-white/40" />
          <CarouselNext className="right-4 bg-white/20 text-white border-none hover:bg-white/40" />
        </Carousel>
      </section>

      {/* 4. MAIN SHOP AREA (Filters & Grid) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Tất cả sản phẩm</h2>
          <span className="bg-slate-200 text-slate-700 text-sm font-semibold px-3 py-1 rounded-full">
            {filteredLaptops.length}
          </span>
        </div>

        {/* Filter Control Center */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col lg:flex-row gap-4 justify-between items-center z-30 relative">
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center text-slate-500 font-medium text-sm mr-2">
              <Filter className="w-4 h-4 mr-2" />
              Bộ lọc:
            </div>

            <Select value={filters.brand} onValueChange={(val) => setFilters({ ...filters, brand: val })}>
              <SelectTrigger className="w-[130px] bg-slate-50 border-slate-200 focus:ring-blue-500 rounded-xl">
                <SelectValue placeholder="Hãng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Tất cả hãng</SelectItem>
                <SelectItem value="Apple">Apple</SelectItem>
                <SelectItem value="Dell">Dell</SelectItem>
                <SelectItem value="HP">HP</SelectItem>
                <SelectItem value="Asus">Asus</SelectItem>
                <SelectItem value="Lenovo">Lenovo</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.priceRange[1] === 500 ? "under-500" : filters.priceRange[0] === 500 ? "500-1000" : filters.priceRange[0] === 1000 ? "over-1000" : "All"}
              onValueChange={(val) => {
                let range: [number, number] = [0, 99999];
                if (val === "under-500") range = [0, 500];
                if (val === "500-1000") range = [500, 1000];
                if (val === "over-1000") range = [1000, 99999];
                setFilters({ ...filters, priceRange: range });
              }}
            >
              <SelectTrigger className="w-[150px] bg-slate-50 border-slate-200 focus:ring-blue-500 rounded-xl">
                <SelectValue placeholder="Mức giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Mọi mức giá</SelectItem>
                <SelectItem value="under-500">Dưới $500</SelectItem>
                <SelectItem value="500-1000">$500 - $1000</SelectItem>
                <SelectItem value="over-1000">Trên $1000</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.ram.length > 0 ? filters.ram[0] : "All"} 
              onValueChange={(val) => setFilters({ ...filters, ram: val === "All" ? [] : [val] })}
            >
              <SelectTrigger className="w-[120px] bg-slate-50 border-slate-200 focus:ring-blue-500 rounded-xl">
                <SelectValue placeholder="RAM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Mọi RAM</SelectItem>
                <SelectItem value="8GB">8 GB</SelectItem>
                <SelectItem value="16GB">16 GB</SelectItem>
                <SelectItem value="32GB">32 GB</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                onClick={handleClearAllFilters}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-4 transition-colors"
              >
                <X className="w-4 h-4 mr-1.5" />
                Bỏ lọc
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
            <span className="text-sm font-medium text-slate-500 hidden sm:block whitespace-nowrap">
              Sắp xếp theo:
            </span>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[200px] border-slate-200 focus:ring-blue-500 rounded-xl font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best-selling">Bán chạy nhất</SelectItem>
                <SelectItem value="newest">Sản phẩm mới</SelectItem>
                <SelectItem value="price-low">Giá: Thấp đến Cao</SelectItem>
                <SelectItem value="price-high">Giá: Cao đến Thấp</SelectItem>
                <SelectItem value="top-rated">Đánh giá cao nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredLaptops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLaptops.map((laptop) => (
              <ProductCard key={laptop.id} laptop={laptop} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-slate-500 mb-6 max-w-md">
              Rất tiếc, chúng tôi không có sản phẩm nào khớp với bộ lọc hiện tại của bạn. Hãy thử thay đổi tiêu chí hoặc xóa bộ lọc.
            </p>
            <Button onClick={handleClearAllFilters} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6">
              Xóa tất cả bộ lọc
            </Button>
          </div>
        )}
      </div>

      {/* 5. BOTTOM SECTIONS */}
      {!hasActiveFilters && (
        <div className="bg-white border-t border-slate-200 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            
            {/* Sản Phẩm Nổi Bật */}
            {bestSellers.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
                    <Star className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Sản phẩm nổi bật</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {bestSellers.map((laptop) => (
                    <ProductCard key={laptop.id} laptop={laptop} />
                  ))}
                </div>
              </section>
            )}

            {/* Sản Phẩm Mới */}
            {newestLaptops.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Sản phẩm mới về</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {newestLaptops.map((laptop) => (
                    <ProductCard key={laptop.id} laptop={laptop} />
                  ))}
                </div>
              </section>
            )}

            {/* Hot Deals */}
            {hotDeals.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-red-100 p-2 rounded-lg text-red-600">
                    <Flame className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Khuyến mãi cực nóng</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {hotDeals.map((laptop) => (
                    <ProductCard key={laptop.id} laptop={laptop} />
                  ))}
                </div>
              </section>
            )}

            {/* Gợi ý cho bạn */}
            {recommendedLaptops.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Gợi ý cho bạn</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendedLaptops.map((laptop) => (
                    <ProductCard key={laptop.id} laptop={laptop} />
                  ))}
                </div>
              </section>
            )}

            {/* Recently Viewed */}
            {recentlyViewedLaptops.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Sản phẩm bạn vừa xem</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recentlyViewedLaptops.map((laptop) => (
                    <ProductCard key={laptop.id} laptop={laptop} />
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      )}
      
    </div>
  );
};