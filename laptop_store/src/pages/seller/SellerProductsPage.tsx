import React from 'react';
import { Laptop } from 'lucide-react';

export const SellerProductsPage: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
        <Laptop className="w-12 h-12" />
        <p className="text-lg font-medium">Quản lý sản phẩm</p>
        <p className="text-sm">Tính năng đang được phát triển</p>
    </div>
);
