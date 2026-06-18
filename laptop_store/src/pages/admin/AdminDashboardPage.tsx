import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, Laptop, Clock, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../components/ui/chart';
import axiosClient from '../../api/axiosClient';

type Stats = {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    totalCategories: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
};

type RevenuePoint = { label: string; revenue: number; orders: number };

const fmt = (n: number) => n?.toLocaleString('vi-VN') + 'đ';

const chartConfigLine = {
    revenue: { label: 'Doanh thu', color: 'hsl(var(--chart-1))' },
};
const chartConfigBar = {
    orders: { label: 'Đơn hàng', color: 'hsl(var(--chart-3))' },
};

export const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axiosClient.get('/api/admin/stats'),
            axiosClient.get('/api/admin/revenue?period=monthly'),
        ])
            .then(([statsRes, revenueRes]) => {
                setStats(statsRes.data);
                setRevenue(Array.isArray(revenueRes.data) ? revenueRes.data : []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const statCards = [
        { label: 'Tổng doanh thu', value: fmt(stats?.totalRevenue ?? 0), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Tổng đơn hàng', value: (stats?.totalOrders ?? 0).toLocaleString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Sản phẩm', value: (stats?.totalProducts ?? 0).toLocaleString(), icon: Laptop, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Người dùng', value: (stats?.totalUsers ?? 0).toLocaleString(), icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    const orderStats = [
        { label: 'Chờ xử lý', value: stats?.pendingOrders ?? 0, icon: Clock, color: 'text-amber-600 bg-amber-50' },
        { label: 'Đang xử lý', value: stats?.processingOrders ?? 0, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
        { label: 'Hoàn thành', value: stats?.completedOrders ?? 0, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
        { label: 'Đã hủy', value: stats?.cancelledOrders ?? 0, icon: XCircle, color: 'text-red-600 bg-red-50' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h2>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                    <Card key={label}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{label}</CardTitle>
                            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                                <Icon className={`h-5 w-5 ${color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Order Status */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {orderStats.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={`rounded-xl p-4 flex items-center gap-3 ${color}`}>
                        <Icon size={20} />
                        <div>
                            <p className="text-xs font-medium opacity-80">{label}</p>
                            <p className="text-xl font-bold">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Doanh thu theo tháng</CardTitle>
                        <CardDescription>12 tháng gần nhất</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfigLine} className="w-full h-[280px]">
                            <LineChart data={revenue} margin={{ top: 10, left: 12, right: 12 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
                                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Số đơn hàng theo tháng</CardTitle>
                        <CardDescription>12 tháng gần nhất</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfigBar} className="w-full h-[280px]">
                            <BarChart data={revenue} margin={{ top: 10, left: 12, right: 12 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} barSize={28} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
