import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, ArrowUp } from 'lucide-react';
import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../components/ui/chart';
import axiosClient from '../../api/axiosClient';

type RevenuePoint = { label: string; revenue: number; orders: number };
type Period = 'daily' | 'monthly' | 'yearly';

const fmt = (n: number) => n?.toLocaleString('vi-VN') + 'đ';

const chartConfig = {
    revenue: { label: 'Doanh thu', color: 'hsl(var(--chart-1))' },
    orders: { label: 'Đơn hàng', color: 'hsl(var(--chart-3))' },
};

export default function AdminRevenuePage() {
    const [data, setData] = useState<RevenuePoint[]>([]);
    const [period, setPeriod] = useState<Period>('monthly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axiosClient.get(`/api/admin/revenue?period=${period}`)
            .then((res) => setData(Array.isArray(res.data) ? res.data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [period]);

    const totalRevenue = data.reduce((s, r) => s + Number(r.revenue), 0);
    const totalOrders = data.reduce((s, r) => s + Number(r.orders), 0);
    const avgRevenue = data.length ? totalRevenue / data.length : 0;
    const periodLabel = period === 'daily' ? 'ngày' : period === 'monthly' ? 'tháng' : 'năm';

    const PERIODS: { value: Period; label: string }[] = [
        { value: 'daily', label: 'Theo ngày' },
        { value: 'monthly', label: 'Theo tháng' },
        { value: 'yearly', label: 'Theo năm' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Thống kê doanh thu</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Phân tích doanh thu và đơn hàng theo kỳ</p>
                </div>
                <div className="flex gap-2">
                    {PERIODS.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                period === p.value
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                        <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{fmt(totalRevenue)}</div>
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                            <ArrowUp size={12} /> Tổng kỳ được chọn
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()}</div>
                        <p className="text-xs text-blue-600 mt-1">Tổng kỳ được chọn</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">TB / {periodLabel}</CardTitle>
                        <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{fmt(Math.round(avgRevenue))}</div>
                        <p className="text-xs text-purple-600 mt-1">Trung bình mỗi {periodLabel}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Doanh thu</CardTitle>
                        <CardDescription>Biểu đồ doanh thu theo {periodLabel}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-16"><div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" /></div>
                        ) : (
                            <ChartContainer config={chartConfig} className="w-full h-[260px]">
                                <LineChart data={data} margin={{ top: 10, left: 12, right: 12 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
                                    <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                                </LineChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Số đơn hàng</CardTitle>
                        <CardDescription>Biểu đồ đơn hàng theo {periodLabel}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-16"><div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" /></div>
                        ) : (
                            <ChartContainer config={chartConfig} className="w-full h-[260px]">
                                <BarChart data={data} margin={{ top: 10, left: 12, right: 12 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
                                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                    <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} barSize={28} />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detail Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Chi tiết theo {periodLabel}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Kỳ</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Doanh thu</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Đơn hàng</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">TB/đơn</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data.map((item) => (
                                    <tr key={item.label} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-slate-900">{item.label}</td>
                                        <td className="px-6 py-3 text-right font-bold text-green-600">{fmt(Number(item.revenue))}</td>
                                        <td className="px-6 py-3 text-right text-slate-700">{item.orders}</td>
                                        <td className="px-6 py-3 text-right text-slate-500">
                                            {Number(item.orders) > 0 ? fmt(Math.round(Number(item.revenue) / Number(item.orders))) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                                <tr>
                                    <td className="px-6 py-3 font-bold text-slate-900">Tổng cộng</td>
                                    <td className="px-6 py-3 text-right font-bold text-green-600">{fmt(totalRevenue)}</td>
                                    <td className="px-6 py-3 text-right font-bold text-slate-900">{totalOrders}</td>
                                    <td className="px-6 py-3 text-right font-bold text-slate-500">
                                        {totalOrders > 0 ? fmt(Math.round(totalRevenue / totalOrders)) : '—'}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
