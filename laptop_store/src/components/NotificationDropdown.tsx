import React, { useState, useEffect, useRef } from 'react';
import {
    Bell, Package, Settings, Gift, Heart,
    CheckCircle, Truck, XCircle, Shield, Tag
} from 'lucide-react';
import axiosClient from "@/api/axiosClient.ts";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { userApi } from "@/api/userApi.ts";
import {useNavigate} from "react-router";

export type NotificationType = 'ORDER' | 'SYSTEM' | 'PROMO' | 'WISHLIST';

export interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

export const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'ALL' | NotificationType>('ALL');
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [user, setUser] = useState<any>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    // const navigate = useNavigate();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // 1. LẤY THÔNG TIN USER
    useEffect(() => {
        userApi.getMyProfile().then((res) => {
            setUser(res.data);
        }).catch(console.error);
    }, []);

    // 2. LẤY LỊCH SỬ THÔNG BÁO TỪ API
    useEffect(() => {
        if (user && user.id) {
            axiosClient.get(`/api/notifications/${user.id}`)
                .then(res => setNotifications(res.data))
                .catch(err => console.error("Lỗi lấy thông báo:", err));
        }
    }, [user]);


    useEffect(() => {
        if (!user || !user.id) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            onConnect: () => {
                client.subscribe(`/topic/notifications/${user.id}`, (msg) => {
                    const newNotification = JSON.parse(msg.body);
                    setNotifications(prev => [newNotification, ...prev]);
                });
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [user]);

    // 4. XỬ LÝ CLICK RA NGOÀI ĐỂ ĐÓNG DROPDOWN
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 5. KHÓA CUỘN TRANG TRÊN MOBILE KHI MỞ THÔNG BÁO
    useEffect(() => {
        if (isOpen && window.innerWidth < 640) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // LỌC THÔNG BÁO THEO TAB
    const filteredNotifications = activeTab === 'ALL'
        ? notifications
        : notifications.filter(n => n.type === activeTab);

    // HÀM CHỌN ICON VÀ MÀU SẮC DỰA VÀO LOẠI THÔNG BÁO
    const getNotificationStyle = (type: NotificationType, title: string) => {
        switch (type) {
            case 'ORDER':
                if (title.includes('thành công')) return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
                if (title.includes('giao')) return { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100' };
                if (title.includes('hủy')) return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' };
                return { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' };
            case 'SYSTEM':
                if (title.includes('Đăng nhập') || title.includes('Mật khẩu')) return { icon: Shield, color: 'text-orange-600', bg: 'bg-orange-100' };
                return { icon: Settings, color: 'text-gray-600', bg: 'bg-gray-100' };
            case 'PROMO':
                if (title.includes('Flash') || title.includes('Mã')) return { icon: Tag, color: 'text-purple-600', bg: 'bg-purple-100' };
                return { icon: Gift, color: 'text-purple-600', bg: 'bg-purple-100' };
            case 'WISHLIST':
                return { icon: Heart, color: 'text-pink-600', bg: 'bg-pink-100' };
            default:
                return { icon: Bell, color: 'text-blue-600', bg: 'bg-blue-100' };
        }
    };

    // HÀM ĐÁNH DẤU ĐÃ ĐỌC
    const markAsRead = (id: string) => {

        axiosClient.put(`/api/notifications/${id}/read`);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        // navigate("/account/orders");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Nút Chuông Thông Báo */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-lg transition-all ${isOpen ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
                aria-label="Thông báo"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold border border-white rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Mobile Backdrop (Lớp phủ mờ phía sau khi mở trên điện thoại) */}
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/20 z-40 sm:hidden" onClick={() => setIsOpen(false)} />
            )}

            {/* Dropdown Menu (Cấu trúc Responsive) */}
            {isOpen && (
                <div className="
                    fixed left-4 right-4 top-20 z-50
                    sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[380px]
                    bg-white rounded-2xl sm:rounded-xl shadow-2xl sm:shadow-xl border border-slate-100
                    py-2 overflow-hidden flex flex-col max-h-[calc(100vh-120px)] sm:max-h-[500px]
                ">
                    {/* Header thông báo */}
                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center shrink-0">
                        <h3 className="font-bold text-slate-800">Thông báo</h3>
                        <button
                            onClick={() => setNotifications(prev => prev.map(n => ({...n, isRead: true})))}
                            className="text-xs text-blue-600 hover:underline font-medium"
                        >
                            Đánh dấu đã đọc tất cả
                        </button>
                    </div>

                    {/* Tabs Lọc (Có thể cuộn ngang trên điện thoại) */}
                    <div className="flex px-3 py-2 gap-2 overflow-x-auto no-scrollbar border-b border-slate-50 shrink-0">
                        {[
                            { id: 'ALL', label: 'Tất cả' },
                            { id: 'ORDER', label: 'Đơn hàng' },
                            { id: 'PROMO', label: 'Khuyến mãi' },
                            { id: 'SYSTEM', label: 'Hệ thống' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Danh sách thông báo */}
                    <div className="overflow-y-auto flex-1 overscroll-contain">
                        {filteredNotifications.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                                <Bell className="w-12 h-12 mb-3 text-slate-200" />
                                <p className="text-sm font-medium text-slate-500">Không có thông báo nào</p>
                            </div>
                        ) : (
                            filteredNotifications.map(notification => {
                                const Style = getNotificationStyle(notification.type, notification.title);
                                const Icon = Style.icon;

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => markAsRead(notification.id)}
                                        className={`px-4 py-3.5 hover:bg-slate-50 cursor-pointer flex gap-3 transition-colors ${
                                            !notification.isRead ? 'bg-blue-50/40' : ''
                                        }`}
                                    >
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${Style.bg} ${Style.color}`}>
                                            <Icon size={20} />
                                        </div>

                                        {/* Nội dung */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h4 className={`text-sm truncate pr-2 ${!notification.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5 shadow-sm" />
                                                )}
                                            </div>
                                            <p className={`text-xs mb-1.5 leading-relaxed ${!notification.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                                                {notification.content}
                                            </p>
                                            <span className="text-[10px] font-medium text-slate-400">
                                                {notification.createdAt}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-100 p-2 shrink-0">
                        <button className="w-full py-2.5 text-sm text-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-medium">
                            Xem tất cả thông báo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};