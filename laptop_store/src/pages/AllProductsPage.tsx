import React, { useState, useMemo, useEffect } from "react";
import { Search, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui/button";
import type { SortOption } from "../types";
import { laptops as mockLaptops } from "../data/laptops";
import { productApi } from "../api/productApi";
import { categoryApi, type Category } from "../api/categoryApi";
import { useSearchParams } from "react-router-dom";

const initialFilters = {
  priceRange: [0, 99999999] as [number, number],
  ram: [] as string[],
  brand: "All",
  categoryId: 0, // 0 = tất cả
  condition: "All",
};

const brands = ["Apple", "Dell", "HP", "Asus", "Lenovo"];
const ramOptions = ["8GB", "16GB", "32GB"];
const conditions = ["Like New", "99%", "Good", "Refurbished"];
const priceRanges = [
  { label: "Tất cả mức giá", value: [0, 99999999] as [number, number] },
  { label: "Dưới 10 triệu", value: [0, 10000000] as [number, number] },
  { label: "10 – 20 triệu", value: [10000000, 20000000] as [number, number] },
  { label: "20 – 30 triệu", value: [20000000, 30000000] as [number, number] },
  { label: "Trên 30 triệu", value: [30000000, 99999999] as [number, number] },
];

function mapProduct(p: any) {
  return {
    ...p,
    id: p.id?.toString(),
    image: p.imageUrl || "/placeholder.svg",
    price: Number(p.price),
    originalPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
    categoryId: p.categoryId,
    category: p.categoryId ? [String(p.categoryId)] : [],
    isBestSeller: p.bestSeller,
    isHot: p.hot,
    isSale: p.sale,
    reviewCount: p.reviews,
    seller: { name: p.brand, rating: p.rating, soldCount: p.reviews },
    images: [p.imageUrl || "/placeholder.svg"],
    weight: p.weight || "N/A",
    batteryCondition: p.batteryCondition || "N/A",
  };
}

// Reusable filter section
const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-slate-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <span className="text-sm font-semibold text-slate-800">{title}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && children}
    </div>
  );
};

export const AllProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("best-selling");
  const [laptops, setLaptops] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchParams] = useSearchParams();

  // Read categoryId from URL on mount
  useEffect(() => {
    const urlCatId = Number(searchParams.get('categoryId') || 0);
    if (urlCatId) setFilters((f) => ({ ...f, categoryId: urlCatId }));
  }, [searchParams]);

  useEffect(() => {
    categoryApi.getAllCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    productApi.getAllProducts()
      .then((res) => {
        if (res.data?.length > 0) setLaptops(res.data.map(mapProduct));
        else setLaptops(mockLaptops);
      })
      .catch(() => setLaptops(mockLaptops))
      .finally(() => setLoading(false));
  }, []);

  const hasActiveFilters =
    searchQuery !== "" ||
    filters.brand !== "All" ||
    filters.categoryId !== 0 ||
    filters.condition !== "All" ||
    filters.ram.length > 0 ||
    filters.priceRange[1] !== 99999999;

  const handleClear = () => {
    setFilters(initialFilters);
    setSearchQuery("");
    setSortBy("best-selling");
  };

  const toggleRam = (ram: string) => {
    setFilters((prev) => ({
      ...prev,
      ram: prev.ram.includes(ram) ? prev.ram.filter((r) => r !== ram) : [...prev.ram, ram],
    }));
  };

  const filtered = useMemo(() => {
    let result = [...laptops];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) => l.name?.toLowerCase().includes(q) || l.brand?.toLowerCase().includes(q) || l.cpu?.toLowerCase().includes(q)
      );
    }
    if (filters.brand !== "All") result = result.filter((l) => l.brand?.toLowerCase() === filters.brand.toLowerCase());
    if (filters.categoryId !== 0) {
      result = result.filter((l) => {
        // BE data: l.categoryId is number; mock data: l.category is array of strings
        if (l.categoryId !== undefined) return Number(l.categoryId) === filters.categoryId;
        return true;
      });
    }
    if (filters.condition !== "All") result = result.filter((l) => l.condition === filters.condition);
    if (filters.ram.length > 0) result = result.filter((l) => filters.ram.includes(l.ram));
    result = result.filter((l) => Number(l.price) >= filters.priceRange[0] && Number(l.price) <= filters.priceRange[1]);

    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "top-rated": result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case "newest": result.sort((a, b) => String(b.id).localeCompare(String(a.id))); break;
      case "best-selling":
        result.sort((a, b) => {
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        });
        break;
    }
    return result;
  }, [laptops, searchQuery, filters, sortBy]);

  const SidebarContent = () => (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          Bộ lọc
        </h3>
        {hasActiveFilters && (
          <button onClick={handleClear} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
            <X className="w-3 h-3" /> Xóa tất cả
          </button>
        )}
      </div>

      {/* Danh mục */}
      <FilterSection title="Danh mục">
        <div className="space-y-1.5">
          <button
            onClick={() => setFilters({ ...filters, categoryId: 0 })}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              filters.categoryId === 0 ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilters({ ...filters, categoryId: cat.id })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.categoryId === cat.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Hãng */}
      <FilterSection title="Hãng sản xuất">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters({ ...filters, brand: "All" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filters.brand === "All"
                ? "bg-blue-600 text-white border-blue-600"
                : "border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            Tất cả
          </button>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setFilters({ ...filters, brand: b })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filters.brand === b
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Mức giá */}
      <FilterSection title="Mức giá">
        <div className="space-y-1.5">
          {priceRanges.map((range) => {
            const isSelected = filters.priceRange[0] === range.value[0] && filters.priceRange[1] === range.value[1];
            return (
              <button
                key={range.label}
                onClick={() => setFilters({ ...filters, priceRange: range.value })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  isSelected ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* RAM */}
      <FilterSection title="RAM">
        <div className="flex flex-wrap gap-2">
          {ramOptions.map((ram) => (
            <button
              key={ram}
              onClick={() => toggleRam(ram)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filters.ram.includes(ram)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {ram}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Tình trạng */}
      <FilterSection title="Tình trạng">
        <div className="space-y-1.5">
          <button
            onClick={() => setFilters({ ...filters, condition: "All" })}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              filters.condition === "All" ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Tất cả
          </button>
          {conditions.map((c) => (
            <button
              key={c}
              onClick={() => setFilters({ ...filters, condition: c })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.condition === c ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-slate-900">Tất cả sản phẩm</h1>
          <p className="text-sm text-slate-500 mt-1">Laptop đã qua sử dụng chất lượng cao, kiểm định nghiêm ngặt</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* ── SIDEBAR (desktop) ── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-20">
              <SidebarContent />
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-5">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shrink-0"
              >
                <option value="best-selling">Bán chạy nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="price-low">Giá thấp → cao</option>
                <option value="price-high">Giá cao → thấp</option>
                <option value="top-rated">Đánh giá cao</option>
              </select>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Lọc
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-600" />}
              </button>
            </div>

            {/* Result count + active filters */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-sm text-slate-500">
                {loading ? "Đang tải..." : <><span className="font-semibold text-slate-900">{filtered.length}</span> sản phẩm</>}
              </span>
              {hasActiveFilters && (
                <button onClick={handleClear} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium">
                  <X className="w-3 h-3" /> Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-72 animate-pulse" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((laptop) => (
                  <ProductCard key={laptop.id} laptop={laptop} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">Không tìm thấy sản phẩm</h3>
                <p className="text-sm text-slate-500 mb-5">Thử thay đổi bộ lọc hoặc từ khóa</p>
                <Button onClick={handleClear} className="bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className="font-bold text-slate-900">Bộ lọc</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-4">
              <SidebarContent />
            </div>
            <div className="p-4 border-t border-slate-100">
              <Button onClick={() => setMobileSidebarOpen(false)} className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg">
                Xem {filtered.length} sản phẩm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
