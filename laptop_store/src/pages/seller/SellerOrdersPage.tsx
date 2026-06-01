import React from 'react';
import { ShoppingCart } from 'lucide-react';

export const SellerOrdersPage: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
        <ShoppingCart className="w-12 h-12" />
        <p className="text-lg font-medium">Quản lý đơn hàng</p>
        <p className="text-sm">Tính năng đang được phát triển</p>
    </div>
);
