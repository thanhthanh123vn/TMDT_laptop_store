import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Laptop, ShoppingCart, Users, Settings, LogOut, PackagePlus, Bell, User } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter } from '../../components/ui/sidebar';

const adminMenuItems = [
    { title: 'Tổng quan', url: '/admin', icon: LayoutDashboard },
    { title: 'Sản phẩm', url: '/admin/products', icon: Laptop },
    { title: 'Thêm sản phẩm', url: '/admin/products/add', icon: PackagePlus },
    { title: 'Đơn hàng', url: '/admin/orders', icon: ShoppingCart },
    { title: 'Khách hàng', url: '/admin/users', icon: Users },
    { title: 'Thông báo', url: '/admin/notifications', icon: Bell },
    { title: 'Hồ sơ admin', url: '/admin/profile', icon: User },
    { title: 'Cài đặt', url: '/admin/settings', icon: Settings },
];

export const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <Sidebar variant="sidebar" collapsible="icon" className="border-r border-slate-200/60 shadow-sm bg-white">
            <SidebarHeader className="bg-white border-b border-slate-200/60 h-14 md:h-16 flex items-center justify-center px-4 z-50">
                <Link to="/admin" className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
                        A
                    </div>
                    <span className="font-bold text-lg text-slate-800 truncate group-data-[collapsible=icon]:hidden tracking-tight">
                        Admin Panel
                    </span>
                </Link>
            </SidebarHeader>

            <SidebarContent className="bg-white pt-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Hệ thống</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1.5">
                            {adminMenuItems.map((item) => {
                                const isActive = location.pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild tooltip={item.title} className={`h-11 rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                                            <Link to={item.url}>
                                                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
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
                        <SidebarMenuButton onClick={handleLogout} className="h-11 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors" tooltip="Đăng xuất">
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Đăng xuất</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};