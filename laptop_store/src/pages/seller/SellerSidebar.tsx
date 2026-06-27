import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Laptop, ShoppingCart, MessageSquare, LogOut, Store, Zap, MessageCircle} from 'lucide-react';
import {
    Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
    SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter
} from '../../components/ui/sidebar';
import { authApi } from '../../api/authApi';

const menuItems = [
    { title: 'Tổng quan', url: '/seller', icon: LayoutDashboard },
    { title: 'Sản phẩm', url: '/seller/products', icon: Laptop },
    { title: 'Đơn hàng', url: '/seller/orders', icon: ShoppingCart },
    { title: 'Bình luận', url: '/seller/reviews', icon: MessageSquare },
    { title: 'Tin nhắn', url: '/seller/chat', icon: MessageCircle },
    { title: 'Gói đẩy tin', url: '/seller/boost', icon: Zap },
];

export const SellerSidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) await authApi.logout({ refreshToken });
        } catch (_) {}
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <Sidebar variant="sidebar" collapsible="icon" className="border-r border-slate-200/60 shadow-sm bg-white">
            <SidebarHeader className="bg-white border-b border-slate-200/60 h-14 md:h-16 flex items-center justify-center px-4 z-50">
                <Link to="/seller" className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
                        <Store className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-lg text-slate-800 truncate group-data-[collapsible=icon]:hidden tracking-tight">
                        Seller Panel
                    </span>
                </Link>
            </SidebarHeader>

            <SidebarContent className="bg-white pt-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                        Quản lý
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1.5">
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            className={`h-11 rounded-xl transition-all duration-200 ${isActive
                                                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                        >
                                            <Link to={item.url}>
                                                <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200/60 p-4 bg-white">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            className="h-11 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            tooltip="Đăng xuất"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Đăng xuất</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};
