"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, AlertCircle, Eye, Trash2, RefreshCw } from 'lucide-react';
import { notificationAdminService, type AdminNotification } from '../../api/adminService';

export default function NotificationManagementPage() {
    const [page, setPage] = useState(1);
    const [size] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
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
        if (item.type === 'order' && item.meta) {
            return String(item.meta.customerName ?? item.meta.customer ?? `Đơn hàng ${item.meta.orderId ?? ''}`);
        }
        return item.channel ?? 'Tất cả';
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
        <div className="space-y-8">
            {/* Search and Filters Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="relative max-w-md">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Tìm kiếm thông báo..."
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-600 focus:outline-none"
                    />
                    <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Title Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Thông báo</h1>
                    <p className="text-gray-600">
                        Quản trị các thông báo hệ thống, khuyến mại, đơn hàng và trợ lý AI gửi tới người dùng.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => void handleMarkAllRead()} 
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                    >
                        Đánh dấu đã đọc tất cả
                    </button>
                    <button 
                        onClick={() => setShowModal(true)} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Tạo thông báo mới
                    </button>
                </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="text-sm font-semibold text-gray-600 uppercase">Tổng thông báo</div>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{totalItems.toLocaleString('vi-VN')}</div>
                    <div className="text-xs text-gray-500 mt-2">Trên toàn hệ thống</div>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="text-sm font-semibold text-gray-600 uppercase">Đang hiển thị</div>
                    <div className="text-3xl font-bold text-blue-600 mt-2">
                        {notifications.length}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Số lượng thông báo trên trang hiện tại</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-3">
                    <select 
                        value={filterType} 
                        onChange={(e) => { setFilterType(e.target.value); setPage(1); }} 
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả loại</option>
                        <option value="order">Đơn hàng</option>
                        <option value="offer">Khuyến mại</option>
                        <option value="ai">AI</option>
                        <option value="system">Hệ thống</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => void loadNotifications()} 
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title="Làm mới"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tiêu đề / Nội dung</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Loại</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Người nhận</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Thời gian</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                                </tr>
                            ) : notifications.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Chưa có thông báo nào phù hợp.</td>
                                </tr>
                            ) : (
                                notifications.map((notif) => (
                                    <tr key={notif.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="max-w-md">
                                                <p className="font-semibold text-gray-900 text-sm truncate">{notif.title}</p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">{notif.content || notif.body || 'Không có nội dung'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                notif.type === 'order' ? 'bg-orange-100 text-orange-700' :
                                                notif.type === 'offer' ? 'bg-purple-100 text-purple-700' :
                                                notif.type === 'ai' ? 'bg-pink-100 text-pink-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {notif.type === 'order' ? 'Đơn hàng' :
                                                 notif.type === 'offer' ? 'Khuyến mại' :
                                                 notif.type === 'ai' ? 'AI' : 'Hệ thống'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {notif.userId ? `User ID: ${notif.userId}` : 'Tất cả người dùng'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {notif.sentAt ? new Date(notif.sentAt).toLocaleString('vi-VN') : 
                                             notif.createdAt ? new Date(notif.createdAt).toLocaleString('vi-VN') : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 items-center">
                                                <button 
                                                    onClick={() => void handleMarkRead(notif.id)} 
                                                    title="Đánh dấu đã đọc" 
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => void handleDelete(notif.id)} 
                                                    title="Xóa" 
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        className="text-sm text-gray-600 hover:text-gray-900 font-medium disabled:opacity-40"
                    >
                        ← Trước
                    </button>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 bg-blue-600 text-white rounded font-semibold">{page}</button>
                        <span className="text-gray-600 text-sm">/ {totalPages}</span>
                    </div>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                        className="text-sm text-gray-600 hover:text-gray-900 font-medium disabled:opacity-40"
                    >
                        Tiếp theo →
                    </button>
                </div>
            </div>

            {/* AI Assistant Card */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                        AI
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">Laptop Store AI Assistant</div>
                        <div className="text-sm text-gray-600 mt-1">
                            Hệ thống AI phát hiện lưu lượng tìm kiếm phân khúc "Laptop Designer & Gaming" tăng 25% vào cuối tuần qua. Bạn có muốn tạo ngay một chiến dịch thông báo ưu đãi dành riêng cho nhóm khách hàng này không?
                        </div>
                    </div>
                </div>
                <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 whitespace-nowrap transition shadow-sm">
                    Tạo chiến dịch ngay
                </button>
            </div>

            {/* Modal create notification */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4 shadow-xl">
                        <h2 className="text-lg font-semibold text-gray-900">Tạo thông báo mới</h2>

                        <label className="block">
                            <span className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</span>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="VD: Khuyến mãi hè 20%"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm font-medium text-gray-700 mb-1">Nội dung</span>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                                placeholder="Nhập nội dung thông báo"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={3}
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm font-medium text-gray-700 mb-1">Loại</span>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                                placeholder="Để trống = gửi cho tất cả người dùng"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </label>

                        <label className="block">
                            <span className="block text-sm font-medium text-gray-700 mb-1">Action URL (tùy chọn)</span>
                            <input
                                type="text"
                                value={formData.actionUrl}
                                onChange={(e) => setFormData((prev) => ({ ...prev, actionUrl: e.target.value }))}
                                placeholder="VD: /promotions"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </label>

                        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleCreateNotification()}
                                disabled={submitting}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
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