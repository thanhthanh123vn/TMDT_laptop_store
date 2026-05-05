import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { laptops as initialLaptops } from '../../data/laptops';
import type { Laptop } from '../../types';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

export const AdminProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Laptop[]>(initialLaptops);
    const [searchQuery, setSearchQuery] = useState('');

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            setProducts(products.filter((p) => p.id !== id));
        }
    };

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Sản phẩm</h2>
                    <p className="text-sm text-slate-500 mt-1">Quản lý danh mục laptop của bạn.</p>
                </div>
                <Button
                    onClick={() => navigate('/admin/products/add')}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all h-11 sm:h-10 rounded-xl sm:rounded-md"
                >
                    <Plus className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                    Thêm sản phẩm
                </Button>
            </div>


            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-slate-50/50">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Tìm tên máy, hãng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-11 sm:h-10 bg-white border-slate-200 rounded-xl sm:rounded-lg focus-visible:ring-blue-500"
                        />
                    </div>
                </div>


                <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] inline-block w-full align-middle">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="border-slate-100">
                                    <TableHead className="w-[80px] text-slate-500 font-medium">Ảnh</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Sản phẩm</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Hãng</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Giá bán</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Trạng thái</TableHead>
                                    <TableHead className="text-right text-slate-500 font-medium pr-6">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <TableRow key={product.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors group">
                                            <TableCell className="py-3">
                                                <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-1.5 overflow-hidden">
                                                    <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-semibold text-slate-900 line-clamp-1">{product.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5 font-medium">{product.cpu} • {product.ram}</p>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                    {product.brand}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-bold text-blue-600">${product.price.toLocaleString()}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none font-medium">
                                                    {product.condition}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-4">
                                                <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                                        className="h-9 w-9 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        onClick={() => handleDelete(product.id)}
                                                        className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-500">
                                                <Search className="w-10 h-10 text-slate-300 mb-3" />
                                                <p>Không tìm thấy sản phẩm nào.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};