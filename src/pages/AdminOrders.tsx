import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
    ShoppingBag, Search, MoreHorizontal, Eye, Package,
    Truck, CheckCircle2, XCircle, Download, User, MessageSquare, CreditCard,
    Phone, Calendar, Hash, MapPin, X, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getOrders, updateOrder, deleteOrder, ApiOrder } from "@/lib/api";

const AdminOrders = () => {
    const [orders, setOrders] = useState<ApiOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
    const [orderToDelete, setOrderToDelete] = useState<ApiOrder | null>(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getOrders();
            setOrders(data);
        } catch {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        try {
            const updated = await updateOrder(orderId, { status: newStatus as ApiOrder['status'] });
            setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
            toast.success(`Order #${orderId} status → ${newStatus}`);
        } catch {
            toast.error("Failed to update order status");
        }
    };

    const handlePaymentUpdate = async (orderId: number, newPayment: string) => {
        try {
            const updated = await updateOrder(orderId, { payment: newPayment as ApiOrder['payment'] });
            setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
            toast.success(`Order #${orderId} payment → ${newPayment}`);
        } catch {
            toast.error("Failed to update payment status");
        }
    };

    const handleDelete = async (orderId: number) => {
        try {
            await deleteOrder(orderId);
            setOrders(prev => prev.filter(o => o.id !== orderId));
            toast.success("Order deleted");
        } catch {
            toast.error("Failed to delete order");
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = String(order.id).includes(searchQuery.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.mobile || "").includes(searchQuery);
        const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Processing": return "text-blue-400";
            case "Shipped": return "text-purple-400";
            case "Delivered": return "text-emerald-400";
            case "Cancelled": return "text-red-400";
            default: return "text-slate-500";
        }
    };

    const getPaymentColor = (payment: string) => {
        switch (payment) {
            case "Paid": return "text-emerald-400";
            case "Pending": return "text-amber-400";
            case "Refunded": return "text-red-400";
            default: return "text-slate-500";
        }
    };

    // Stats computed from live orders
    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.created_at.startsWith(todayStr)).length;
    const pendingOrders = orders.filter(o => o.status === 'Processing').length;
    const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

    return (
        <AdminLayout>
            <div className="space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-display font-bold tracking-tight text-blue-900 mb-1">Order Management</h1>
                        <p className="text-slate-500 text-sm">Monitor sales, track shipments, and manage customer interactions.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="h-11 border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-xl px-5 font-bold text-xs uppercase tracking-widest transition-all">
                            <Download className="h-4 w-4 mr-2" />Export CSV
                        </Button>
                    </div>
                </div>

                {/* KPI Stats */}
                <div className="grid gap-6 md:grid-cols-4">
                    {[
                        { label: "Today's Orders", value: String(todayOrders), color: "text-blue-400", bg: "bg-blue-500/5", icon: ShoppingBag },
                        { label: "Pending", value: String(pendingOrders), color: "text-amber-400", bg: "bg-amber-500/5", icon: Package },
                        { label: "Total Orders", value: String(orders.length), color: "text-emerald-400", bg: "bg-emerald-500/5", icon: CheckCircle2 },
                        { label: "Cancelled", value: String(cancelledOrders), color: "text-red-400", bg: "bg-red-500/5", icon: XCircle },
                    ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-3xl border border-slate-200 bg-white hover:bg-slate-50 transition-all group shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-2 rounded-xl", stat.bg)}>
                                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-display font-bold text-blue-900">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden">
                    <div className="p-8 border-b border-slate-200 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                placeholder="Search orders by ID, name, or mobile..."
                                    className="pl-12 h-12 bg-white border-slate-200 rounded-2xl focus:ring-primary/20 text-slate-900 placeholder:text-slate-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px] h-12 bg-white border-slate-200 rounded-2xl text-slate-900 font-medium">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200 shadow-xl">
                                    <SelectItem value="all" className="text-slate-700">All Status</SelectItem>
                                    <SelectItem value="processing" className="text-blue-400">Processing</SelectItem>
                                    <SelectItem value="shipped" className="text-purple-400">Shipped</SelectItem>
                                    <SelectItem value="delivered" className="text-emerald-400">Delivered</SelectItem>
                                    <SelectItem value="cancelled" className="text-red-400">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="px-2 pb-2">
                        {loading ? (
                            <div className="text-center py-16 text-slate-500">Loading orders...</div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="text-center py-16 text-slate-500">
                                <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                <p className="font-semibold text-slate-700">No orders yet</p>
                                <p className="text-sm mt-1 text-slate-500">Orders placed by customers will appear here.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="border-none">
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableHead className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em] h-14 px-6">Order ID</TableHead>
                                        <TableHead className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em] h-14 px-6">Order Details</TableHead>
                                        <TableHead className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em] h-14 px-6">Contact Info</TableHead>
                                        <TableHead className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em] h-14 px-6">Amount</TableHead>
                                        <TableHead className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em] h-14 px-6">Payment</TableHead>
                                        <TableHead className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em] h-14 px-6">Status</TableHead>
                                        <TableHead className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em] h-14 px-6 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => (
                                        <TableRow key={order.id} className="border-slate-200 hover:bg-slate-50 transition-all group">
                                            <TableCell className="px-6 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-xs font-bold text-primary">#{order.id}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">
                                                        {order.created_at.split('T')[0]}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-6 font-medium text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-slate-700" />
                                                    <span className="line-clamp-1">{order.info || "—"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-6">
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                                                        <User className="h-3 w-3 text-slate-500" />
                                                        {order.customer}
                                                    </p>
                                                    <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                                        <MessageSquare className="h-3 w-3 text-slate-500" />
                                                        {order.mobile || "—"}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-6">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-blue-900 text-sm">{order.total || "—"}</p>
                                                </div>
                                            </TableCell>
                                            {/* Payment Status - Editable */}
                                            <TableCell className="px-6 py-6">
                                                <Select
                                                    value={order.payment}
                                                    onValueChange={(val) => handlePaymentUpdate(order.id, val)}
                                                >
                                                    <SelectTrigger className={cn(
                                                        "h-9 w-[120px] rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest focus:ring-primary/20",
                                                        getPaymentColor(order.payment)
                                                    )}>
                                                        <CreditCard className="h-3 w-3 mr-1 opacity-60" />
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-slate-200">
                                                        <SelectItem value="Paid" className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Paid</SelectItem>
                                                        <SelectItem value="Pending" className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">Pending</SelectItem>
                                                        <SelectItem value="Refunded" className="text-[11px] font-bold text-red-400 uppercase tracking-widest">Refunded</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            {/* Order Status - Editable */}
                                            <TableCell className="px-6 py-6">
                                                <Select
                                                    value={order.status}
                                                    onValueChange={(val) => handleStatusUpdate(order.id, val)}
                                                >
                                                    <SelectTrigger className={cn(
                                                        "h-9 w-[130px] rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest focus:ring-primary/20",
                                                        getStatusColor(order.status)
                                                    )}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-slate-200">
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
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded-xl">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 text-slate-700 p-2 rounded-2xl shadow-xl">
                                                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 py-3">Order Controls</DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-slate-200" />
                                                        <DropdownMenuItem 
                                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 focus:bg-slate-100 cursor-pointer text-slate-700"
                                                            onClick={() => setSelectedOrder(order)}
                                                        >
                                                            <Eye className="h-4 w-4 text-primary" />
                                                            <span className="font-semibold text-sm">View Full Details</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 focus:bg-slate-100 cursor-pointer text-slate-700">
                                                            <Truck className="h-4 w-4 text-purple-400" />
                                                            <span className="font-semibold text-sm">Print Labels</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-200" />
                                                        <DropdownMenuItem
                                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 focus:bg-red-500/10 text-red-500 cursor-pointer"
                                                            onClick={() => setOrderToDelete(order)}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            <span className="font-semibold text-sm">Delete Order</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    <div className="p-8 border-t border-slate-200 flex items-center justify-between bg-slate-50/60">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Showing {filteredOrders.length} orders</p>
                    </div>
                </div>
            </div>

            {/* Full Order Detail Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={(v) => { if (!v) setSelectedOrder(null); }}>
                <DialogContent className="max-w-xl rounded-[2rem] border-slate-200 bg-white p-0 overflow-hidden shadow-2xl">
                    {selectedOrder && (
                        <>
                            {/* Header */}
                            <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-white to-slate-50 border-b border-slate-200">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Order Details</p>
                                        <h2 className="text-2xl font-display font-black text-blue-900">#{selectedOrder.id}</h2>
                                        <p className="text-slate-500 text-xs font-medium mt-1 flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(selectedOrder.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border-none", {
                                            "bg-blue-500/10 text-blue-400": selectedOrder.status === "Processing",
                                            "bg-purple-500/10 text-purple-400": selectedOrder.status === "Shipped",
                                            "bg-emerald-500/10 text-emerald-400": selectedOrder.status === "Delivered",
                                            "bg-red-500/10 text-red-400": selectedOrder.status === "Cancelled",
                                        })}>{selectedOrder.status}</Badge>
                                        <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border-none", {
                                            "bg-emerald-500/10 text-emerald-400": selectedOrder.payment === "Paid",
                                            "bg-amber-500/10 text-amber-400": selectedOrder.payment === "Pending",
                                            "bg-red-500/10 text-red-400": selectedOrder.payment === "Refunded",
                                        })}>{selectedOrder.payment}</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="px-8 py-5 border-b border-slate-200 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Customer</p>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-sm text-blue-900 font-bold">
                                        <User className="h-4 w-4 text-slate-500" />
                                        {selectedOrder.customer}
                                    </div>
                                    {selectedOrder.mobile && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                            <Phone className="h-4 w-4 text-slate-500" />
                                            {selectedOrder.mobile}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="px-8 py-5 border-b border-slate-200 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Items Ordered</p>
                                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedOrder.items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                        <Package className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-blue-900 truncate">{item.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-bold text-primary text-sm flex-shrink-0">
                                                    {item.currency} {(item.price * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm italic">{selectedOrder.info || "No item details available."}</p>
                                )}
                            </div>

                            {/* Total */}
                            <div className="px-8 py-5 flex items-center justify-between">
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Order Total</p>
                                <p className="text-2xl font-display font-black text-blue-900">{selectedOrder.total || "—"}</p>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
                <AlertDialogContent className="bg-white border-slate-200 text-slate-900 max-w-md rounded-[2rem]">
                    <AlertDialogHeader>
                        <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                        </div>
                        <AlertDialogTitle className="text-xl font-display font-black">Delete Order?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 text-sm leading-relaxed">
                            Are you sure you want to delete order <span className="text-blue-900 font-bold">#{orderToDelete?.id}</span>? 
                            This will permanently remove the order record from the database. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 gap-3">
                        <AlertDialogCancel className="bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-900 h-11 px-6 rounded-xl font-bold">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => orderToDelete && handleDelete(orderToDelete.id)}
                            className="bg-red-500 hover:bg-red-600 text-blue-900 border-none h-11 px-6 rounded-xl font-bold shadow-lg shadow-red-500/20"
                        >
                            Delete Order
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
};

export default AdminOrders;

