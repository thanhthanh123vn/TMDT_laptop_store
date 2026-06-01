import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { SellerSidebar } from './SellerSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../../components/ui/sidebar';

export const SellerLayout: React.FC = () => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');

    let user: any = {};
    try {
        const raw = localStorage.getItem('user');
        if (raw && raw !== 'undefined') user = JSON.parse(raw);
    } catch (_) {}

    if (!token) return <Navigate to="/login" replace />;
    if (storedRole && storedRole !== 'SELLER') return <Navigate to="/" replace />;

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-slate-50/50 w-full font-sans text-slate-900">
                <SellerSidebar />
                <SidebarInset className="flex-1 w-full bg-slate-50/50 flex flex-col min-w-0">
                    <header className="flex h-14 md:h-16 shrink-0 items-center gap-4 border-b border-slate-200/60 bg-white/95 backdrop-blur-sm px-4 md:px-6 shadow-sm sticky top-0 z-20">
                        <SidebarTrigger className="-ml-2 text-slate-500 hover:text-slate-900" />
                        <div className="flex items-center gap-2 flex-1">
                            <h1 className="font-semibold text-slate-800 text-lg sm:text-xl truncate">Kênh người bán</h1>
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold shadow-inner border border-emerald-200/50 cursor-pointer hover:bg-emerald-200 transition-colors text-sm">
                                {user?.fullName?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
                        <div className="max-w-7xl mx-auto w-full">
                            <Outlet />
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};
