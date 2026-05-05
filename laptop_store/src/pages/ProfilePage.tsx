import React, { useState } from 'react';
import { User, Package, MapPin, LogOut, Search } from 'lucide-react';

// Dữ liệu giả (Mock Data) cho Lịch sử đơn hàng
const MOCK_ORDERS = [
    {
        id: 'DH-883921',
        date: '04/04/2026',
        total: '18.500.000đ',
        status: 'Đã giao hàng',
        statusColor: 'text-green-600 bg-green-100',
        items: 'Laptop ASUS ROG Strix G15...'
    },
    {
        id: 'DH-110293',
        date: '28/03/2026',
        total: '350.000đ',
        status: 'Đang vận chuyển',
        statusColor: 'text-blue-600 bg-blue-100',
        items: 'Chuột không dây Logitech G304...'
    },
    {
        id: 'DH-002938',
        date: '15/02/2026',
        total: '2.100.000đ',
        status: 'Đã hủy',
        statusColor: 'text-red-600 bg-red-100',
        items: 'Bàn phím cơ AKKO 3098B...'
    }
];

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('orders'); // 'profile' | 'orders'

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Tài khoản của tôi</h1>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Cột trái: Menu (Sidebar) */}
                <div className="w-full md:w-1/4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center space-x-3 mb-6 pb-4 border-b">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                S
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Nguyễn Thanh Sơn</p>
                                <p className="text-sm text-gray-500">Khách hàng thành viên</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-md transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <User className="h-5 w-5" />
                                <span>Thông tin cá nhân</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-md transition-colors ${activeTab === 'orders' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Package className="h-5 w-5" />
                                <span>Lịch sử đơn hàng</span>
                            </button>
                            <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-md text-red-600 hover:bg-red-50 transition-colors mt-4">
                                <LogOut className="h-5 w-5" />
                                <span>Đăng xuất</span>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Cột phải: Nội dung chính */}
                <div className="w-full md:w-3/4">
                    {activeTab === 'orders' ? (
                        // LỊCH SỬ ĐƠN HÀNG
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Lịch sử đơn hàng (Demo)</h2>

                            <div className="space-y-4">
                                {MOCK_ORDERS.map((order) => (
                                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex flex-wrap justify-between items-center border-b pb-3 mb-3">
                                            <div>
                                                <span className="font-semibold text-gray-800">{order.id}</span>
                                                <span className="text-gray-500 text-sm ml-3">{order.date}</span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                        {order.status}
                      </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="text-gray-600 text-sm">
                                                <p>{order.items}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Tổng tiền</p>
                                                <p className="font-bold text-blue-600 text-lg">{order.total}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <button className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // THÔNG TIN CÁ NHÂN (UI cơ bản)
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin cá nhân</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                    <input type="text" defaultValue="Nguyễn Thanh Sơn" className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <input type="text" defaultValue="0987654321" className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                </div>
                            </div>
                            <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Lưu thay đổi</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}