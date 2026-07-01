import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { Store, MapPin, Loader2, Star, CheckCircle2, MessageSquare } from 'lucide-react';
import { productApi } from '../api/productApi';
import { userApi } from '../api/userApi';
import { ProductCard } from '../components/ProductCard';
import type { Laptop } from '../types';
import {sellerApi} from "@/api/sellerApi.ts";

interface SellerInfo {
    id: number;
    storeName: string;
    rating: number;
    status: string;
    warehouseProvince: string;
    warehouseDistrict: string;
    warehouseWard: string;
    warehouseStreet: string;
    cccd: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    approved: boolean;
}
interface Stats {
    totalProducts: number;
    totalOrders: number;
    totalReviews: number;
    avgRating: number;
    totalRevenue: number;
}
const ShopDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [seller, setSeller] = useState<SellerInfo | null>(null);
    const [products, setProducts] = useState<Laptop[]>([]);
    const [loading, setLoading] = useState(true);
    const [isNavigatingChat, setIsNavigatingChat] = useState(false);

    useEffect(() => {
        const fetchShopData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const [shopRes, productsRes] = await Promise.all([
                    productApi.getShopInfo(Number(id)),
                    productApi.getProductsByShop(Number(id)),

                ]);
                setSeller(shopRes.data);
                setProducts(productsRes.data);

            } catch (error) {
                console.error("Lỗi lấy thông tin shop:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchShopData();
    }, [id]);


    const handleChatClick = async () => {
        try {
            setIsNavigatingChat(true);

            const userRes = await userApi.getMyProfile();
            const userId = userRes.data.id;


            const roomId = `room_buyer_${userId}_seller_${id}`;


            navigate(`/chat?id=${roomId}`);
        } catch (error) {
            console.error("Lỗi xác thực người dùng:", error);
            alert("Vui lòng đăng nhập để chat với cửa hàng!");
           navigate('/login');
        } finally {
            setIsNavigatingChat(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!seller) {
        return (
            <div className="text-center py-12 text-gray-500">
                Không tìm thấy thông tin cửa hàng.
            </div>
        );
    }

    const fullAddress = `${seller.warehouseStreet}, ${seller.warehouseWard}, ${seller.warehouseDistrict}, ${seller.warehouseProvince}`;

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header Hồ sơ Shop */}
            <div className="bg-white border-b border-gray-200 py-6 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                        {/* Cột trái: Thông tin Shop */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
                                <Store className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    {seller.storeName}
                                    {seller.approved && (
                                        <CheckCircle2 className="w-5 h-5 text-green-500" title="Đã xác thực" />
                                    )}
                                </h1>
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <span className="flex items-center text-yellow-500 font-medium">
                                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                                        {seller.rating.toFixed(1)}
                                    </span>
                                    <span className="mx-1">•</span>
                                    Trạng thái: <span className={seller.status === 'active' ? "text-green-600" : "text-red-600"}>{seller.status}</span>
                                </p>
                            </div>
                        </div>

                        {/* Cột phải: Địa chỉ & Nút Chat */}
                        <div className="flex flex-col gap-3 w-full md:w-auto">
                            <div
                                className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs cursor-pointer hover:bg-gray-100 transition"
                                onClick={() => {
                                    window.open(
                                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
                                        "_blank"
                                    );
                                }}
                            >
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 text-gray-400 shrink-0"/>

                                    <span
                                        className="max-w-[250px] truncate"
                                        title={fullAddress}
                                    >
                                        {fullAddress}
                                    </span>
                                </div>
                            </div>

                            {/* NÚT CHAT MỚI THÊM */}
                            <button
                                onClick={handleChatClick}
                                disabled={isNavigatingChat}
                                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:bg-blue-400"
                            >
                                {isNavigatingChat ? (
                                    <Loader2 className="w-4 h-4 animate-spin"/>
                                ) : (
                                    <MessageSquare className="w-4 h-4"/>
                                )}
                                Chat với Cửa hàng
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Danh sách sản phẩm của Shop */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <h2 className="text-base font-semibold text-gray-800 mb-4">
                    Tất cả sản phẩm ({products.length})
                </h2>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} laptop={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-200 text-gray-400 text-sm">
                        Cửa hàng hiện chưa đăng bán sản phẩm nào.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopDetailPage;