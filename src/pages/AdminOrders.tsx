import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
    ShoppingBag,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Download,
    Calendar,
    User,
    MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { useOrderStore } from "@/stores/orderStore";

const AdminOrders = () => {
    const { orders, updateOrderStatus } = useOrderStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const handleStatusUpdate = (orderId: string, newStatus: string) => {
        updateOrderStatus(orderId, newStatus as any);
        toast.success(`Order #${orderId.split('-')[1]} status updated to ${newStatus}`);
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.mobile.includes(searchQuery);
        const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Processing": return "text-blue-400";
            case "Shipped": return "text-purple-400";
            case "Delivered": return "text-emerald-400";
            case "Cancelled": return "text-red-400";
            default: return "text-slate-400";
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-1">Order Management</h1>
                        <p className="text-slate-500 text-sm">Monitor sales, track shipments, and manage customer interactions.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="h-11 border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 rounded-xl px-5 font-bold text-xs uppercase tracking-widest transition-all">
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* KPI/Stats bar */}
                <div className="grid gap-6 md:grid-cols-4">
                    {[
                        { label: "Today's Orders", value: "24", trend: "+12%", color: "text-blue-400", bg: "bg-blue-500/5", icon: ShoppingBag },
                        { label: "Pending", value: "12", trend: "Normal", color: "text-amber-400", bg: "bg-amber-500/5", icon: Package },
                        { label: "Revenue", value: "AUD 2.4k", trend: "+8%", color: "text-emerald-400", bg: "bg-emerald-500/5", icon: CheckCircle2 },
                        { label: "Cancelled", value: "2", trend: "-5%", color: "text-red-400", bg: "bg-red-500/5", icon: XCircle },
                    ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-3xl border border-slate-900 bg-slate-900/20 hover:bg-slate-900/40 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-2 rounded-xl", stat.bg)}>
                                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                                </div>
                                <span className="text-[10px] font-black tracking-widest text-slate-600 uppercase">{stat.trend}</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-display font-bold text-white group-hover:text-primary transition-colors">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Filters and Table */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                    <div className="p-8 border-b border-slate-900/50 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Search Orders..."
                                    className="pl-12 h-12 bg-slate-950/50 border-slate-900 rounded-2xl focus:ring-primary/20 text-slate-300 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 mr-2">Quick Filter</span>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[160px] h-12 bg-slate-950/50 border-slate-900 rounded-2xl text-slate-300 font-medium">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-950 border-slate-900 shadow-2xl">
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="px-2 pb-2">
                        <Table>
                            <TableHeader className="border-none">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.2em] h-14 px-6">Order ID</TableHead>
                                    <TableHead className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.2em] h-14 px-6">Order Details</TableHead>
                                    <TableHead className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.2em] h-14 px-6">Contact Info</TableHead>
                                    <TableHead className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.2em] h-14 px-6">Amount</TableHead>
                                    <TableHead className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.2em] h-14 px-6">Status</TableHead>
                                    <TableHead className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.2em] h-14 px-6 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.map((order) => (
                                    <TableRow key={order.id} className="border-slate-900/30 hover:bg-slate-900/40 transition-all group">
                                        <TableCell className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-xs font-bold text-primary">#{order.id.split('-')[1]}</span>
                                                <span className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">{order.date}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-6 font-medium text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-slate-700" />
                                                <span className="line-clamp-1">{order.info}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-6">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                                                    <User className="h-3 h-3 text-slate-600" />
                                                    {order.customer}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                                                    <MessageSquare className="h-3 h-3 text-slate-600" />
                                                    {order.mobile}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-6">
                                            <div className="space-y-1">
                                                <p className="font-bold text-white text-sm">{order.total}</p>
                                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-wider py-0 px-1.5 border-none bg-emerald-500/10 text-emerald-400">
                                                    {order.payment}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-6">
                                            <Select
                                                value={order.status}
                                                onValueChange={(val) => handleStatusUpdate(order.id, val)}
                                            >
                                                <SelectTrigger className={cn(
                                                    "h-9 w-[130px] rounded-xl border border-slate-900 bg-slate-950/50 text-[10px] font-black uppercase tracking-widest focus:ring-primary/20",
                                                    getStatusColor(order.status)
                                                )}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-950 border-slate-900">
                                                    <SelectItem value="Processing" className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Processing</SelectItem>
                                                    <SelectItem value="Shipped" className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Shipped</SelectItem>
                                                    <SelectItem value="Delivered" className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Delivered</SelectItem>
                                                    <SelectItem value="Cancelled" className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="px-6 py-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-600 hover:text-white hover:bg-slate-800 rounded-xl">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 bg-slate-950 border-slate-900 text-slate-200 p-2 rounded-2xl shadow-2xl">
                                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 py-3">Order Controls</DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-slate-900" />
                                                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900 focus:bg-slate-900 cursor-pointer text-slate-300">
                                                        <Eye className="h-4 w-4 text-primary" />
                                                        <span className="font-semibold text-sm">View Full Details</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900 focus:bg-slate-900 cursor-pointer text-slate-300">
                                                        <Truck className="h-4 w-4 text-purple-400" />
                                                        <span className="font-semibold text-sm">Print Labels</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-900" />
                                                    <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 focus:bg-red-500/10 text-red-500 cursor-pointer">
                                                        <XCircle className="h-4 w-4" />
                                                        <span className="font-semibold text-sm">Cancel Order</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="p-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/10">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Showing {filteredOrders.length} orders</p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-slate-900 bg-slate-950 rounded-lg text-slate-500 hover:text-white" disabled>1</Button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminOrders;
