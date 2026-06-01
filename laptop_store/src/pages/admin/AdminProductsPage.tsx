'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productAdminService, type AdminProduct } from '../../api/adminService';

export default function AdminProductsPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const getFreshnessRate = (freshness?: string) => {
        const value = (freshness ?? '').toUpperCase();
        if (value === 'HIGH') return 90;
        if (value === 'MEDIUM') return 55;
        if (value === 'LOW') return 25;
        return 10;
    };

    const getFreshnessBg = (percent: number) => {
        if (percent > 50) return 'bg-blue-500';
        if (percent > 20) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await productAdminService.list({
                page,
                size: pageSize,
                category: selectedCategory === 'all' ? '' : selectedCategory,
                keyword,
                sort: 'createdAt,desc',
            });
            setProducts(data.items);
            setTotalItems(data.totalItems);
            setTotalPages(data.totalPages);
        } catch {
            setError('Không thể tải danh sách sản phẩm.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadProducts();
    }, [selectedCategory, keyword, page, pageSize]);

    useEffect(() => {
        setPage(1);
    }, [selectedCategory, keyword]);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) {
            return;
        }

        try {
            await productAdminService.remove(id);
            await loadProducts();
        } catch {
            setError('Xóa sản phẩm thất bại.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm, mã SKU..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
                    <p className="text-gray-600 text-sm">Quản lý kho hàng laptop và tình trạng tồn kho của bạn.</p>
                </div>
                <Link to="/admin/products/new" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={20} />
                    Thêm sản phẩm mới
                </Link>
            </div>

            {/* Filter and Info */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-600">Lọc theo danh mục:</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tất cả danh mục</option>
                        <option value="gaming">Laptop Gaming</option>
                        <option value="office">Laptop Văn phòng</option>
                        <option value="macbook">MacBook</option>
                    </select>
                </div>
                <p className="text-sm text-gray-600">Hiển thị {products.length} / {totalItems} sản phẩm</p>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">HÌNH ẢNH</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">TÊN SẢN PHẨM</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">DANH MỤC</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">GIÁ</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">TÌNH TRẠNG KHO</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">THAO TÁC</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((product) => {
                        const freshness = getFreshnessRate(product.freshness);
                        const freshnessBg = getFreshnessBg(freshness);

                        return (
                            <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                                        📷
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-medium text-gray-900">{product.name}</p>
                                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{product.price.toLocaleString('vi-VN')}đ</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${freshness > 50 ? 'text-blue-600' : freshness > 20 ? 'text-orange-600' : 'text-red-600'}`}>
                          {freshness > 50 ? 'Còn hàng' : freshness > 20 ? 'Sắp hết hàng' : 'Hết hàng'}
                        </span>
                                        <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${freshnessBg}`}
                                                style={{ width: `${freshness}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-600">{product.stock}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <Link to={`/admin/products/${product.id}`} className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded">
                                        <Edit size={18} />
                                    </Link>
                                    <button className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded" onClick={() => void handleDelete(product.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {!loading && products.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">Không có sản phẩm nào.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1 disabled:opacity-40"
                >
                    <ChevronLeft size={16} />
                    Trước
                </button>
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 bg-blue-600 text-white rounded font-medium text-sm">{page}</button>
                    <span className="text-gray-500 text-sm">/ {totalPages}</span>
                </div>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1 disabled:opacity-40"
                >
                    Tiếp theo
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
