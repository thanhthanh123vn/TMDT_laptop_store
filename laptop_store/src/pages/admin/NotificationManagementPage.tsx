"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, AlertCircle, Eye, Trash2, RefreshCw } from 'lucide-react';
import { notificationAdminService, type AdminNotification } from '../services/adminService';

export default function FarmAdminNotifications() {
    const [page, setPage] = useState(1);
    const [size] = useState(20);
    const [, setTotalPages] = useState(1);
    const [, setTotalItems] = useState(0);
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [keyword, setKeyword] = useState('');
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const pollRef = useRef<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'system',
        userId: '',
        actionUrl: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const mapSender = (item: AdminNotification) => {
        // For order-type notifications backend can include meta.customerName or meta.orderId
        if (item.type === 'order' && item.meta) {
            return String(item.meta.customerName ?? item.meta.customer ?? `Order ${item.meta.orderId ?? ''}`);
        }
        return item.channel ?? 'All';
    };

    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await notificationAdminService.list({ page, size, type: filterType, status: filterStatus, keyword });
            setNotifications(data.items as AdminNotification[]);
            setTotalItems(data.totalItems);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('Không thể tải danh sách thông báo.');
        } finally {
            setLoading(false);
        }
    }, [page, size, filterType, filterStatus, keyword]);

    useEffect(() => {
        void loadNotifications();

        // Poll for new notifications every 10s to sync across admins
        if (pollRef.current) window.clearInterval(pollRef.current);
        pollRef.current = window.setInterval(() => {
            void loadNotifications();
        }, 10000);

        return () => {
            if (pollRef.current) window.clearInterval(pollRef.current);
        };
    }, [loadNotifications]);

    const handleDelete = async (id: string | number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;
        try {
            await notificationAdminService.remove(id);
            void loadNotifications();
        } catch {
            setError('Xóa thông báo thất bại.');
        }
    };

    const handleSend = async (id: string | number) => {
        try {
            await notificationAdminService.send(id);
            void loadNotifications();
        } catch {
            setError('Gửi thông báo thất bại.');
        }
    };

    const handleMarkRead = async (id: string | number) => {
        try {
            await notificationAdminService.markRead(id);
            void loadNotifications();
        } catch {
            setError('Cập nhật trạng thái đọc thất bại.');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationAdminService.markAllRead();
            void loadNotifications();
        } catch {
            setError('Cập nhật tất cả đọc thất bại.');
        }
    };

    const handleCreateNotification = async () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            setError('Vui lòng nhập tiêu đề và nội dung.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            const payload = {
                title: formData.title,
                content: formData.content,
                type: formData.type,
                userId: formData.userId ? Number(formData.userId) : null,
                actionUrl: formData.actionUrl || undefined,
            };
            await notificationAdminService.create(payload);
            setFormData({ title: '', content: '', type: 'system', userId: '', actionUrl: '' });
            setShowModal(false);
            await loadNotifications();
            window.alert('Đã tạo thông báo thành công.');
        } catch {
            setError('Tạo thông báo thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">F</span>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-900">Farm Admin</div>
                            <div className="text-xs text-gray-500">Trang quản trị</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Tìm kiếm thông báo..."
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <AlertCircle className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                    <div className="w-56 bg-white border-r border-gray-200 p-4">
                    <nav className="space-y-2">
                        {[
                            { icon: '📊', label: 'Dashboard' },
                            { icon: '📦', label: 'Inventory' },
                            { icon: '📋', label: 'Orders' },
                            { icon: '🔔', label: 'Notifications', active: true },
                            { icon: '⚙️', label: 'Settings' },
                        ].map((item) => (
                            <button
                                key={item.label}
                                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium ${
                                    item.active
                                        ? 'bg-green-50 text-green-600 border-l-4 border-green-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <button onClick={() => setShowModal(true)} className="w-full mt-8 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                        <Plus className="w-4 h-4" />
                        Tạo thông báo mới
                    </button>

                    <div className="mt-8 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                                A
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-gray-900">Admin User</div>
                                <div className="text-xs text-gray-500">Super Administrator</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                    {/* Breadcrumb */}
                    <div className="text-sm text-gray-600 mb-6">
                        <span>Trạng quán từ</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-900 font-semibold">Thông báo</span>
                    </div>

                    {/* Title Section */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Quản lý Thông báo</h1>
                            <p className="text-gray-600 mt-1">
                                Quản thúc các gửi thông báo trực tiếp hàng ưu tiên, khuyến mại và gì về y AI.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => void handleMarkAllRead()} className="px-3 py-2 bg-gray-100 rounded-lg text-sm">Đánh dấu đã đọc tất cả</button>
                            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Tạo thông báo mới
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Tổng bản ghi', value: '1,284', change: '+15 ngày qua' },
                            { label: 'Tỷ lệ mở', value: '64.2%', change: '+5% ngày qua' },
                            { label: 'Số lượt từ chối', value: '42', change: '+2% ngày qua' },
                            { label: 'Hàng chờ xử lý', value: '8', change: '+1 hàng hôm nay' },
                        ].map((card, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="text-sm text-gray-600">{card.label}</div>
                                <div className="text-2xl font-bold text-gray-900 mt-2">{card.value}</div>
                                <div className="text-xs text-gray-500 mt-2">{card.change}</div>
                                {idx === 1 && (
                                    <div className="w-full bg-gray-200 h-1 rounded-full mt-3">
                                        <div className="bg-green-600 h-1 rounded-full" style={{ width: '64.2%' }}></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-3">
                            <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600">
                                <option value="">Tất cả loại</option>
                                <option value="order">Đơn hàng</option>
                                <option value="offer">Khuyến mại</option>
                                <option value="ai">AI</option>
                                <option value="system">Hệ thống</option>
                            </select>
                            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600">
                                <option value="">Tất cả trạng thái</option>
                                <option value="DRAFT">Nháp</option>
                                <option value="SCHEDULED">Đã lên lịch</option>
                                <option value="SENT">Đã gửi</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => void loadNotifications()} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Tiêu đề</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Loại</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Bộ từ/Ứng dụng</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Thời gian</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Đang tải...</td></tr>
                            ) : notifications.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Chưa có thông báo.</td></tr>
                            ) : (
                                notifications.map((notif) => (
                                    <tr key={notif.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{notif.title}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded font-medium">
                                                {notif.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{mapSender(notif)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{notif.sentAt ?? notif.createdAt ?? ''}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${notif.status === 'SENT' ? 'bg-green-50 text-green-700' : notif.status === 'DRAFT' ? 'bg-gray-50 text-gray-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                                {notif.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button onClick={() => void handleMarkRead(notif.id)} title="Đánh dấu đã đọc" className="p-1 text-gray-600 hover:bg-gray-200 rounded">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => void handleSend(notif.id)} title="Gửi" className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => void handleDelete(notif.id)} title="Xóa" className="p-1 text-red-600 hover:bg-red-50 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* AI Assistant Card */}
                    <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-200 flex items-start justify-between">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                F
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">FreshHub AI Assistant</div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Ạo công chủng lợi phát hiện là chuyên đối có từ các thông báo về "Năm phẩm địa phương" vào sáng 7. Bạn có muốn tạo mộ chuyên dịch mới?
                                </div>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 whitespace-nowrap">
                            Thực nghiệm ghi ý
                        </button>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button className="w-8 h-8 bg-green-600 text-white rounded-lg font-medium">1</button>
                        <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">2</button>
                        <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">3</button>
                        <span className="text-gray-600">...</span>
                        <button className="w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">128</button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal create notification */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">Tạo thông báo mới</h2>

                        <label className="block">
                            <span className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</span>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="VD: Flash Sale 20%"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm font-medium text-gray-700 mb-1">Nội dung</span>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                                placeholder="Nhập nội dung thông báo"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                rows={3}
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm font-medium text-gray-700 mb-1">Loại</span>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="system">Hệ thống</option>
                                <option value="order">Đơn hàng</option>
                                <option value="offer">Khuyến mại</option>
                                <option value="ai">AI</option>
                            </select>
                        </label>

                        <label className="block">
                            <span className="block text-sm font-medium text-gray-700 mb-1">User ID (tùy chọn)</span>
                            <input
                                type="text"
                                value={formData.userId}
                                onChange={(e) => setFormData((prev) => ({ ...prev, userId: e.target.value }))}
                                placeholder="Để trống = tất cả người dùng"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm font-medium text-gray-700 mb-1">Action URL (tùy chọn)</span>
                            <input
                                type="text"
                                value={formData.actionUrl}
                                onChange={(e) => setFormData((prev) => ({ ...prev, actionUrl: e.target.value }))}
                                placeholder="VD: /promotions"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </label>

                        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleCreateNotification()}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                            >
                                {submitting ? 'Đang tạo...' : 'Tạo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}