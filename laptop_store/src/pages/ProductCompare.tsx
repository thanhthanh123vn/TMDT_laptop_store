import React, { useState, useEffect } from "react";
import { X, Heart, ShoppingCart, ChevronRight, AlertCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Laptop } from "../types";
import { compareApi } from "../api/compareApi";
import { useStore } from "../context/StoreContext";
import { getLaptopsByIds, laptops } from "../data/laptops";

interface CompareProduct extends Laptop {
    batteryHealth?: number;
}

export default function ProductCompare() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { addToCart, toggleWishlist, wishlist, compare } = useStore();
    
    const [products, setProducts] = useState<CompareProduct[]>([]);
    const [recentProducts, setRecentProducts] = useState<Laptop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const extractList = <T,>(payload: unknown): T[] => {
        if (Array.isArray(payload)) return payload as T[];
        if (payload && typeof payload === "object" && "data" in payload) {
            const nested = (payload as { data?: unknown }).data;
            if (Array.isArray(nested)) return nested as T[];
        }
        return [];
    };

    useEffect(() => {
        const fetchCompareProducts = async () => {
            try {
                setLoading(true);
                setError("");
                // Lấy IDs từ URL query params (vd: ?ids=1,2,3)
                const ids = searchParams.get("ids");
                const queryIds = ids
                    ? ids.split(",").map((id) => id.trim()).filter(Boolean)
                    : [];
                const selectedIds = queryIds.length > 0 ? queryIds : compare;

                if (selectedIds.length === 0) {
                    setError("Vui lòng chọn sản phẩm để so sánh");
                    setLoading(false);
                    return;
                }

                const productIds = selectedIds
                    .map((id) => parseInt(id, 10))
                    .filter((id) => !Number.isNaN(id));

                let compareItems: CompareProduct[] = [];

                if (productIds.length > 0) {
                    const { data } = await compareApi.getProductsForCompare(productIds);
                    const rawItems = extractList<CompareProduct>(data);
                    compareItems = rawItems.map((p) => ({
                        ...p,
                        id: String(p.id),
                        batteryHealth: p.batteryCondition ? parseInt(String(p.batteryCondition), 10) : 100,
                    }));
                }

                // Fallback local data nếu API compare chưa có hoặc trả về rỗng
                if (compareItems.length === 0) {
                    compareItems = getLaptopsByIds(selectedIds).map((p) => ({
                        ...p,
                        batteryHealth: p.batteryCondition ? parseInt(String(p.batteryCondition), 10) : 100,
                    }));
                }

                setProducts(compareItems);
                
                // Fetch recently viewed
                const { data: recent } = await compareApi.getRecentlyViewed(4);
                const recentItems = extractList<Laptop>(recent);
                setRecentProducts(recentItems.length > 0 ? recentItems : laptops.slice(0, 4));
            } catch (err) {
                console.error("Error fetching compare products:", err);

                // Fallback cuối cùng: dùng dữ liệu local theo compare store
                const fallbackProducts = getLaptopsByIds(compare).map((p) => ({
                    ...p,
                    batteryHealth: p.batteryCondition ? parseInt(String(p.batteryCondition), 10) : 100,
                }));

                if (fallbackProducts.length > 0) {
                    setProducts(fallbackProducts);
                    setRecentProducts(laptops.slice(0, 4));
                } else {
                    setError("Không thể tải dữ liệu so sánh");
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchCompareProducts();
    }, [searchParams, compare]);

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat("vi-VN").format(value) + " đ";
    };

    const compareGridStyle: React.CSSProperties = {
        gridTemplateColumns: `220px repeat(${Math.max(products.length, 1)}, minmax(220px, 1fr))`,
    };

    const handleRemoveProduct = (id: string) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const handleAddToCart = (product: CompareProduct) => {
        addToCart(product, 1);
    };

    const handleToggleWishlist = (productId: string) => {
        toggleWishlist(productId);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button 
                        onClick={() => navigate("/")}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                    >
                        Quay lại trang chính
                    </button>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                    <p className="text-gray-600 mb-4">Bạn chưa có sản phẩm nào để so sánh.</p>
                    <button
                        onClick={() => navigate("/products")}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                    >
                        Chọn sản phẩm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 text-slate-900 font-sans">
            <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">

                {/* TITLES */}
                <div>
                    <h1 className="text-2xl font-bold text-indigo-600">So sánh sản phẩm</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Đánh giá chi tiết các thông số kỹ thuật để đưa ra quyết định mua hàng chính xác nhất.
                    </p>
                </div>

                {/* 2. BẢNG SO SÁNH CHÍNH */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

                    {/* Hàng Header Sản Phẩm */}
                    <div className="grid border-b border-gray-100 items-center p-4" style={compareGridStyle}>
                        <div className="text-base font-bold text-indigo-600 pl-2">Thông số kỹ thuật</div>
                        {products.map((product) => (
                            <div key={product.id} className="flex items-center gap-3 p-2 relative group px-4">
                                <div className="w-14 h-14 bg-gray-50 rounded-xl border border-gray-100 p-1 flex items-center justify-center shrink-0">
                                    <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain rounded" />
                                </div>
                                <div className="truncate">
                                    <span className="text-[10px] font-bold text-indigo-600 block tracking-wider">{product.brand}</span>
                                    <span className="text-sm font-bold text-gray-800 truncate block">{product.name}</span>
                                </div>
                                <button
                                    onClick={() => handleRemoveProduct(product.id)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Các Hàng Thông Số */}
                    <div className="overflow-x-auto">
                        <div className="min-w-[760px] divide-y divide-gray-50">

                            {/* GIÁ BÁN */}
                            <div className="grid items-center py-4 px-4 bg-white" style={compareGridStyle}>
                                <div className="text-xs font-bold text-gray-600">Giá bán dự kiến</div>
                                {products.map(p => (
                                    <div key={p.id} className="px-4">
                                        <span className="text-lg font-extrabold text-indigo-600 block">{formatPrice(p.price)}</span>
                                        <span className="inline-block mt-1 text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Còn hàng
                    </span>
                                    </div>
                                ))}
                            </div>

                            {/* SECTION TIÊU ĐỀ: HIỆU NĂNG */}
                            <div className="grid bg-gray-50/70 py-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider" style={compareGridStyle}>
                                <div>Hiệu năng & Xử lý</div>
                                {products.map((p) => <div key={`performance-${p.id}`} />)}
                            </div>

                            {/* CPU */}
                            <div className="grid items-start py-4 px-4 text-sm" style={compareGridStyle}>
                                <div className="text-xs font-semibold text-gray-500 self-center">Vi xử lý (CPU)</div>
                                {products.map(p => (
                                    <div key={p.id} className="px-4 text-gray-800 font-medium text-xs whitespace-pre-line leading-relaxed">
                                        {p.cpu || "N/A"}
                                    </div>
                                ))}
                            </div>

                            {/* GPU */}
                            <div className="grid items-center py-4 px-4 text-sm" style={compareGridStyle}>
                                <div className="text-xs font-semibold text-gray-500">Đồ họa (GPU)</div>
                                {products.map(p => (
                                    <div key={p.id} className="px-4 text-gray-800 font-medium text-xs">
                                        {p.gpu || "N/A"}
                                    </div>
                                ))}
                            </div>

                            {/* RAM */}
                            <div className="grid items-center py-4 px-4 text-sm" style={compareGridStyle}>
                                <div className="text-xs font-semibold text-gray-500">Bộ nhớ (RAM)</div>
                                {products.map(p => (
                                    <div key={p.id} className="px-4 text-gray-800 font-medium text-xs">
                                        {p.ram || "N/A"}
                                    </div>
                                ))}
                            </div>

                            {/* SECTION TIÊU ĐỀ: MÀN HÌNH */}
                            <div className="grid bg-gray-50/70 py-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider" style={compareGridStyle}>
                                <div>Màn hình & Lưu trữ</div>
                                {products.map((p) => <div key={`display-${p.id}`} />)}
                            </div>

                            {/* SCREEN */}
                            <div className="grid items-start py-4 px-4 text-sm" style={compareGridStyle}>
                                <div className="text-xs font-semibold text-gray-500 self-center">Màn hình</div>
                                {products.map(p => (
                                    <div key={p.id} className="px-4 text-gray-800 font-medium text-xs whitespace-pre-line leading-relaxed">
                                        {p.screenSize || "N/A"}
                                    </div>
                                ))}
                            </div>

                            {/* SSD */}
                            <div className="grid items-center py-4 px-4 text-sm" style={compareGridStyle}>
                                <div className="text-xs font-semibold text-gray-500">Ổ cứng (SSD)</div>
                                {products.map(p => (
                                    <div key={p.id} className="px-4 text-gray-800 font-medium text-xs">
                                        {p.storage || "N/A"} {p.storageType ? `(${p.storageType})` : ""}
                                    </div>
                                ))}
                            </div>

                            {/* SECTION TIÊU ĐỀ: TÌNH TRẠNG & PIN */}
                            <div className="grid bg-gray-50/70 py-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider" style={compareGridStyle}>
                                <div>Tình trạng & Pin</div>
                                {products.map((p) => <div key={`battery-${p.id}`} />)}
                            </div>

                            {/* BATTERY */}
                            <div className="grid items-center py-4 px-4 text-sm" style={compareGridStyle}>
                                <div className="text-xs font-semibold text-gray-500">Sức khỏe Pin</div>
                                {products.map(p => (
                                    <div key={p.id} className="px-4 flex items-center gap-3">
                                        <div className="w-full bg-gray-100 rounded-full h-2 max-w-[150px]">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${p.batteryHealth}%` }}></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">{p.batteryHealth}%</span>
                                    </div>
                                ))}
                            </div>

                            {/* CONDITION */}
                            <div className="grid items-center py-4 px-4 text-sm" style={compareGridStyle}>
                                <div className="text-xs font-semibold text-gray-500">Tình trạng máy</div>
                                {products.map(p => {
                                    const conditionClass = p.condition === 'Like New' 
                                        ? 'bg-green-50 text-green-600 border border-green-100'
                                        : 'bg-blue-50 text-blue-600 border border-blue-100';
                                    return (
                                        <div key={p.id} className="px-4">
                                            <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-md tracking-wider ${conditionClass}`}>
                                                {p.condition || "N/A"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* CTA ACTIONS BUTTONS */}
                            <div className="grid items-center py-5 px-4 bg-white" style={compareGridStyle}>
                                <div></div>
                                {products.map(p => (
                                    <div key={p.id} className="px-4 space-y-2">
                                        <button 
                                            onClick={() => handleAddToCart(p)}
                                            className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart className="w-3.5 h-3.5" />
                                            Mua Ngay
                                        </button>
                                        <button 
                                            onClick={() => handleToggleWishlist(p.id)}
                                            className={`w-full h-10 border transition-colors flex items-center justify-center gap-2 rounded-xl text-xs font-bold ${
                                                wishlist.includes(p.id)
                                                    ? 'bg-red-50 border-red-200 text-red-600'
                                                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Heart className={`w-3.5 h-3.5 ${wishlist.includes(p.id) ? 'fill-current' : ''}`} />
                                            Yêu thích
                                        </button>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>

                {/* 3. SECTION: ĐÃ XEM GẦN ĐÂY */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-indigo-600">Đã xem gần đây</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Tiếp tục xem các sản phẩm bạn đã quan tâm.</p>
                        </div>
                        <a href="#" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-0.5">
                            Xem tất cả
                            <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                    </div>

                    {/* Grid Thẻ Sản Phẩm Biệt Lập */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                        {recentProducts.map((prod) => (
                            <div key={prod.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-gray-200 transition-all flex flex-col justify-between group">
                                <div>
                                    <div className="aspect-[4/3] w-full bg-slate-50 rounded-xl overflow-hidden mb-4 p-4 flex items-center justify-center border border-gray-50">
                                        <img
                                            src={prod.image}
                                            alt={prod.name}
                                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <span className="text-[10px] font-extrabold text-indigo-600 tracking-wider block uppercase">{prod.brand}</span>
                                    <h3 className="font-bold text-gray-900 text-sm mt-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                        {prod.name}
                                    </h3>
                                    <p className="text-sm font-extrabold text-gray-900 mt-1">{formatPrice(prod.price)}</p>
                                </div>

                                <button 
                                    onClick={() => navigate(`/product/${prod.id}`)}
                                    className="w-full h-9 border border-gray-200 hover:border-indigo-600 hover:bg-indigo-50/30 text-gray-700 hover:text-indigo-600 text-xs font-bold rounded-xl mt-4 transition-all">
                                    Xem chi tiết
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}