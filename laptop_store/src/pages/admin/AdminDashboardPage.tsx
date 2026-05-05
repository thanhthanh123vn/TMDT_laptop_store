import React from 'react';
import { DollarSign, ShoppingBag, Users, Laptop } from 'lucide-react';
import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '../../components/ui/chart';


const revenueData = [
    { month: "Jan", revenue: 15000, profit: 4500 },
    { month: "Feb", revenue: 22000, profit: 6000 },
    { month: "Mar", revenue: 18000, profit: 5200 },
    { month: "Apr", revenue: 28000, profit: 8000 },
    { month: "May", revenue: 25000, profit: 7500 },
    { month: "Jun", revenue: 32000, profit: 9800 },
];

const categoryData = [
    { category: "Gaming", sales: 120 },
    { category: "Office", sales: 250 },
    { category: "Design", sales: 85 },
    { category: "Student", sales: 180 },
];


const chartConfigLine = {
    revenue: {
        label: "Doanh thu ($)",
        color: "hsl(var(--chart-1))",
    },
    profit: {
        label: "Lợi nhuận ($)",
        color: "hsl(var(--chart-2))",
    },
};

const chartConfigBar = {
    sales: {
        label: "Đã bán (Máy)",
        color: "hsl(var(--chart-3))",
    },
};

export const AdminDashboardPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h2>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">$140,000.00</div>
                        <p className="text-xs text-muted-foreground text-green-600 mt-1">
                            +20.1% so với tháng trước
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Đơn Hàng Mới</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">+573</div>
                        <p className="text-xs text-muted-foreground text-green-600 mt-1">
                            +201 trong tuần này
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Khách Hàng</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">2,350</div>
                        <p className="text-xs text-muted-foreground text-gray-500 mt-1">
                            +180 khách hàng mới
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sản Phẩm Đang Bán</CardTitle>
                        <Laptop className="h-4 w-4 text-muted-foreground text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">1,234</div>
                        <p className="text-xs text-muted-foreground text-red-500 mt-1">
                            -19 sản phẩm sắp hết hàng
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* 2. BIỂU ĐỒ (CHARTS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Biểu đồ Line (Doanh thu) */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Biểu đồ Doanh thu</CardTitle>
                        <CardDescription>Thống kê 6 tháng gần nhất</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfigLine} className="w-full h-[300px]">
                            <LineChart data={revenueData} margin={{ top: 20, left: 12, right: 12 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent payload={undefined} />} />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="var(--color-revenue)"
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="profit"
                                    stroke="var(--color-profit)"
                                    strokeWidth={3}
                                    dot={false}
                                />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>


                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Phân bổ Danh mục</CardTitle>
                        <CardDescription>Số lượng laptop bán ra theo từng nhóm</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfigBar} className="w-full h-[300px]">
                            <BarChart data={categoryData} margin={{ top: 20, left: 12, right: 12 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="category"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                <Bar
                                    dataKey="sales"
                                    fill="var(--color-sales)"
                                    radius={[4, 4, 0, 0]}
                                    barSize={50}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};