import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Star,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  BadgeCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { ProductCard } from "../components/ProductCard";
import { laptops as mockLaptops } from "../data/laptops";
import { productApi } from "../api/productApi";
import { categoryApi, type Category } from "../api/categoryApi";

const trustItems = [
  { icon: BadgeCheck, color: "text-blue-600 bg-blue-50", title: "100% chính hãng", desc: "Kiểm định 30 bước nghiêm ngặt" },
  { icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50", title: "Bảo hành 12 tháng", desc: "Lỗi 1 đổi 1 trong 30 ngày" },
  { icon: RotateCcw, color: "text-orange-600 bg-orange-50", title: "Đổi trả 7 ngày", desc: "Miễn phí, không cần lý do" },
  { icon: Truck, color: "text-purple-600 bg-purple-50", title: "Giao hàng toàn quốc", desc: "Miễn phí đơn trên 5 triệu" },
];

function mapProduct(p: any) {
  return {
    ...p,
    id: p.id?.toString(),
    image: p.imageUrl || "/placeholder.svg",
    price: Number(p.price),
    originalPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
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

const VISIBLE = 4; // số danh mục hiển thị cùng lúc

export const HomePage: React.FC = () => {
  const [laptops, setLaptops] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catOffset, setCatOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      productApi.getAllProducts().then((res) => {
        if (res.data?.length > 0) setLaptops(res.data.map(mapProduct));
        else setLaptops(mockLaptops);
      }).catch(() => setLaptops(mockLaptops)),
      categoryApi.getAllCategories().then((res) => {
        setCategories(res.data || []);
      }).catch(() => setCategories([])),
    ]).finally(() => setLoading(false));
  }, []);

  const bestSellers = useMemo(
    () => laptops.filter((l) => l.isBestSeller).slice(0, 4),
    [laptops]
  );

  // Carousel helpers — infinite loop
  const total = categories.length;
  const visibleCats = useMemo(() => {
    if (total === 0) return [];
    return Array.from({ length: VISIBLE }, (_, i) => categories[(catOffset + i) % total]);
  }, [categories, catOffset, total]);

  const prev = useCallback(() => setCatOffset((o) => (o - 1 + total) % total), [total]);
  const next = useCallback(() => setCatOffset((o) => (o + 1) % total), [total]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <BadgeCheck className="w-3.5 h-3.5" />
                Chuyên gia laptop cũ chính hãng
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-[2.6rem] font-extrabold leading-tight mb-3">
                Mua bán laptop cũ{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  an tâm tuyệt đối
                </span>
              </h1>
              <p className="text-slate-400 text-base mb-6 max-w-md mx-auto lg:mx-0">
                Mỗi sản phẩm trải qua kiểm định 30 bước nghiêm ngặt trước khi đến tay bạn.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link to="/products" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-blue-900/30">
                  Mua ngay <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/products" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors border border-white/15">
                  Bán laptop của bạn
                </Link>
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-3 shrink-0">
              {[
                { value: "200+", label: "Sản phẩm" },
                { value: "12T", label: "Bảo hành" },
                { value: "4.9★", label: "Đánh giá" },
                { value: "24/7", label: "Hỗ trợ" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white/8 border border-white/10 rounded-xl px-5 py-4 text-center backdrop-blur-sm">
                  <p className="text-2xl font-extrabold text-white">{value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ── DANH MỤC ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900">Danh mục sản phẩm</h2>
          {total > VISIBLE && (
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 flex items-center justify-center transition-colors"
                aria-label="Trước"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={next}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 flex items-center justify-center transition-colors"
                aria-label="Tiếp"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl aspect-[5/3] bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : visibleCats.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {visibleCats.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                className="relative rounded-xl overflow-hidden aspect-[5/3] group focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-bold text-sm">{cat.name}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          // fallback static
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: "Laptop Văn Phòng", img: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80" },
              { label: "Laptop Gaming", img: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80" },
              { label: "Laptop Đồ Họa", img: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80" },
              { label: "Macbook", img: "https://images.unsplash.com/photo-1611186871525-9c4a3b5e3e3e?w=600&q=80" },
            ].map((cat) => (
              <button key={cat.label} onClick={() => navigate('/products')} className="relative rounded-xl overflow-hidden aspect-[5/3] group focus:outline-none">
                <img src={cat.img} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-bold text-sm">{cat.label}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── SẢN PHẨM NỔI BẬT ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-6 bg-blue-600 rounded-full" />
            <h2 className="text-xl font-bold text-slate-900">Sản phẩm nổi bật</h2>
          </div>
          <Link to="/products" className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group">
            Xem tất cả <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : bestSellers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {bestSellers.map((laptop) => (
                <ProductCard key={laptop.id} laptop={laptop} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/products" className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-7 py-2.5 rounded-lg font-semibold text-sm transition-all">
                Xem tất cả sản phẩm <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          <p className="text-center py-12 text-slate-400">Chưa có sản phẩm nổi bật</p>
        )}
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trustItems.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-0.5">{title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
