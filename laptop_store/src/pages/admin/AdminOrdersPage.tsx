import React, { useState } from 'react';
import { Search, Eye, Trash2, Edit } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import type { Order, OrderStatus } from "../api/type.ts";

const initialOrders: Order[] = [
    { id: 'ORD-001', customerName: 'Nguyễn Văn A', email: 'nva@example.com', date: '2023-10-25', total: 1250, status: 'Delivered', paymentMethod: 'Credit Card' },
    { id: 'ORD-002', customerName: 'Trần Thị B', email: 'ttb@example.com', date: '2023-10-26', total: 850, status: 'Processing', paymentMethod: 'PayPal' },
    { id: 'ORD-003', customerName: 'Lê Văn C', email: 'lvc@example.com', date: '2023-10-27', total: 2100, status: 'Pending', paymentMethod: 'COD' },
    { id: 'ORD-004', customerName: 'Phạm Thị D', email: 'ptd@example.com', date: '2023-10-27', total: 450, status: 'Cancelled', paymentMethod: 'Credit Card' },
];

export const AdminOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    const getStatusBadge = (status: OrderStatus) => {
        switch (status) {
            case 'Delivered': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shadow-none font-medium">Đã giao</Badge>;
            case 'Processing': return <Badge className="bg-blue-100 text-blue-700 border-blue-200 shadow-none font-medium">Đang xử lý</Badge>;
            case 'Shipped': return <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 shadow-none font-medium">Đang giao</Badge>;
            case 'Pending': return <Badge className="bg-amber-100 text-amber-700 border-amber-200 shadow-none font-medium">Chờ duyệt</Badge>;
            case 'Cancelled': return <Badge className="bg-rose-100 text-rose-700 border-rose-200 shadow-none font-medium">Đã hủy</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Đơn hàng</h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">

                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50/50">
                    <div className="relative w-full sm:max-w-xs flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input placeholder="Mã ĐH, Tên..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-11 sm:h-10 rounded-xl sm:rounded-lg bg-white" />
                    </div>
                    <div className="w-full sm:w-[180px]">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-11 sm:h-10 rounded-xl sm:rounded-lg bg-white">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent className="z-[100]">
                                <SelectItem value="All">Tất cả</SelectItem>
                                <SelectItem value="Pending">Chờ duyệt</SelectItem>
                                <SelectItem value="Processing">Đang xử lý</SelectItem>
                                <SelectItem value="Shipped">Đang giao</SelectItem>
                                <SelectItem value="Delivered">Đã giao</SelectItem>
                                <SelectItem value="Cancelled">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] inline-block w-full align-middle">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="border-slate-100">
                                    <TableHead className="w-[120px] text-slate-500 font-medium pl-4">Mã ĐH</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Khách hàng</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Ngày đặt</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Trạng thái</TableHead>
                                    <TableHead className="text-right text-slate-500 font-medium">Tổng tiền</TableHead>
                                    <TableHead className="text-right text-slate-500 font-medium pr-6">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.map((order) => (
                                    <TableRow key={order.id} className="border-slate-100 hover:bg-slate-50/80 group">
                                        <TableCell className="font-semibold text-slate-900 pl-4">{order.id}</TableCell>
                                        <TableCell>
                                            <p className="font-medium text-slate-900">{order.customerName}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{order.email}</p>
                                        </TableCell>
                                        <TableCell className="text-slate-600 text-sm">{order.date}</TableCell>
                                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                                        <TableCell className="text-right font-bold text-blue-600">
                                            ${order.total.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};