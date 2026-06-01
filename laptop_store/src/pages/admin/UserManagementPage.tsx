'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Eye, Trash2, MoreVertical, Shield, AlertCircle, Key, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { userAdminService, type AdminUser } from '../../api/adminService';

const getApiErrorMessage = (error: unknown) => {
    if (typeof error !== 'object' || error === null) {
        return 'Khong the tai danh sach nguoi dung.';
    }

    const err = error as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
    };
    const status = err.response?.status;
    const apiMessage = err.response?.data?.message?.trim();

    if (status === 401) {
        return 'Ban chua dang nhap hoac token het han. Vui long dang nhap lai.';
    }
    if (status === 403) {
        return 'Tai khoan hien tai khong co quyen ADMIN de xem danh sach nguoi dung.';
    }
    if (apiMessage) {
        return apiMessage;
    }

    return err.message?.trim() || 'Khong the tai danh sach nguoi dung.';
};

export default function AdminUsersPage() {
    const [sortBy] = useState('Ngày đăng ký');
    const [keyword, setKeyword] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const size = 20;
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [error, setError] = useState('');

    const loadUsers = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Khong tim thay token dang nhap. Vui long dang nhap lai.');
                setUsers([]);
                setTotalItems(0);
                setTotalPages(1);
                return;
            }

            setError('');
            const data = await userAdminService.list({ page, size, role: roleFilter, status: statusFilter, keyword });
            setUsers(data.items);
            setTotalItems(data.totalItems);
            setTotalPages(data.totalPages);
        } catch (error) {
            setError(getApiErrorMessage(error));
        }
    }, [keyword, page, roleFilter, size, statusFilter]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadUsers();
        }, 0);

        return () => window.clearTimeout(timer);
    }, [loadUsers]);

    const handleUpdateRole = async (id: number, role: string) => {
        try {
            await userAdminService.updateRole(id, role);
            setUsers((current) => current.map((item) => (item.id === id ? { ...item, role } : item)));
        } catch {
            setError('Cập nhật vai trò thất bại.');
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: string) => {
        const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        try {
            await userAdminService.updateStatus(id, nextStatus);
            setUsers((current) => current.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)));
        } catch {
            setError('Cập nhật trạng thái thất bại.');
        }
    };

    const handleInvite = async () => {
        const email = window.prompt('Email mời admin mới:');
        if (!email) return;
        const fullName = window.prompt('Họ tên:') || 'Admin Invited';

        try {
            await userAdminService.invite({ email, fullName, role: 'ADMIN' });
            await loadUsers();
        } catch {
            setError('Mời người dùng thất bại.');
        }
    };

    const getRoleBadgeStyle = (role: string) => {
        switch (role.toUpperCase()) {
            case 'ADMIN':
                return 'bg-blue-100 text-blue-700 font-medium';
            case 'SELLER':
                return 'bg-purple-100 text-purple-700 font-medium';
            case 'USER':
                return 'bg-gray-100 text-gray-700 font-medium';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'ACTIVE' ? 'text-blue-600' : 'text-red-600';
    };

    const getStatusText = (status: string) => {
        return status === 'ACTIVE' ? 'Hoạt động' : 'Đã chặn';
    };

    const adminActiveCount = useMemo(
        () => users.filter((item) => item.role === 'ADMIN' && item.status === 'ACTIVE').length,
        [users]
    );
    const blockedCount = useMemo(
        () => users.filter((item) => item.status === 'BLOCKED').length,
        [users]
    );

    return (
        <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="relative max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm kiếm người dùng, vai trò hoặc trạng thái..."
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            setPage(1);
                        }}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-600 focus:outline-none"
                    />
                    <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Title Section */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Người dùng</h1>
                    <p className="text-gray-600">Kiểm soát các mức độ truy cập và theo dõi các tài khoản đã đăng ký trên nền tảng.</p>

                </div>
                <button onClick={() => void handleInvite()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM9 19c-4.3-1.4-7-4.3-7-8m0 0c0-3.7 2.7-6.6 7-8" />
                    </svg>
                    Mời người dùng mới
                </button>
            </div>

            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 uppercase">Tổng người dùng</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{totalItems.toLocaleString('vi-VN')}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 uppercase">Admin hoạt động</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{adminActiveCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 uppercase">Tài khoản bị chặn</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{blockedCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table Section */}
            <div className="bg-white rounded-lg border border-gray-200">
                {/* Table Controls */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Bộ lọc
                        </button>
                        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            <option value="">Tất cả vai trò</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SELLER">Người bán</option>
                            <option value="USER">Khách hàng</option>
                        </select>
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            <option value="">Tất cả trạng thái</option>
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="BLOCKED">Đã chặn</option>
                        </select>
                        <span className="text-sm text-gray-600">Hiển thị {users.length} / {totalItems}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Sắp xếp theo:</span>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                            {sortBy}
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Thông tin người dùng</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vai trò</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Đăng ký</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                                            {(user.fullName || 'U').charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.fullName}</p>
                                            <p className="text-xs text-gray-600">ID: {user.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                <td className="px-6 py-4">
                                    <select
                                        value={user.role}
                                        onChange={(e) => void handleUpdateRole(user.id, e.target.value)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeStyle(user.role)}`}
                                    >
                                        {['ADMIN', 'SELLER', 'USER'].map((role) => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{user.createdAt}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-blue-600' : 'bg-red-600'}`} />
                                        <button onClick={() => void handleToggleStatus(user.id, user.status)} className={`text-sm font-medium ${getStatusColor(user.status)}`}>
                                            {getStatusText(user.status)}
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-gray-400 hover:text-gray-600 transition">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-gray-600 transition">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-gray-600 transition">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">Không có người dùng nào.</td>
                            </tr>
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


        </div>
    );
}