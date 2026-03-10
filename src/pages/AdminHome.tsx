import React from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowRight,
  MoreVertical,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const kpiData = [
  {
    label: "Today's Revenue",
    value: "$1,284.50",
    trend: "+12.5%",
    isPositive: true,
    icon: DollarSign,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10"
  },
  {
    label: "Total Orders",
    value: "42",
    trend: "+8.2%",
    isPositive: true,
    icon: ShoppingBag,
    color: "text-blue-400",
    bg: "bg-blue-500/10"
  },
  {
    label: "Active Products",
    value: "312",
    trend: "-2.4%",
    isPositive: false,
    icon: Package,
    color: "text-purple-400",
    bg: "bg-purple-500/10"
  },
  {
    label: "Low Stock Alerts",
    value: "14",
    trend: "+2",
    isPositive: false,
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10"
  },
];

const recentOrders = [
  { id: "#ORD-7421", customer: "Amjad H.", items: 3, total: "$124.00", status: "Processing", date: "2 mins ago" },
  { id: "#ORD-7420", customer: "Sarah M.", items: 1, total: "$45.50", status: "Shipped", date: "15 mins ago" },
  { id: "#ORD-7419", customer: "John D.", items: 5, total: "$289.00", status: "Delivered", date: "1 hour ago" },
  { id: "#ORD-7418", customer: "Emily R.", items: 2, total: "$82.00", status: "Processing", date: "3 hours ago" },
  { id: "#ORD-7417", customer: "Michael T.", items: 1, total: "$15.00", status: "Cancelled", date: "5 hours ago" },
];

const topProducts = [
  { name: "Heavy Duty Degreaser", category: "Chemicals", sales: 124, revenue: "$2,480", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=100&q=80" },
  { name: "Glass Shine Spray", category: "Surface Care", sales: 98, revenue: "$882", image: "https://images.unsplash.com/photo-1550963295-d29ab11586d0?w=100&q=80" },
  { name: "Microfiber Cloth Pack", category: "Tools", sales: 85, revenue: "$425", image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=100&q=80" },
];

const AdminHome = () => {
  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-1">Store Overview</h1>
            <p className="text-slate-500 text-sm">Real-time performance metrics and recent activity.</p>
          </div>
        </div>

        {/* Simplified KPI Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi) => (
            <div key={kpi.label} className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 hover:bg-slate-900/60 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${kpi.isPositive ? 'text-emerald-500' : 'text-slate-500'}`}>
                  {kpi.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {kpi.trend}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">{kpi.label}</p>
                <h3 className="text-2xl font-display font-bold text-white">{kpi.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Main List: Recent Orders */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-900 flex items-center justify-between bg-slate-900/20">
              <h3 className="font-bold text-slate-200">Recent Activity</h3>
              <Button variant="ghost" className="text-primary text-xs font-bold hover:bg-primary/5">View All</Button>
            </div>
            <div className="p-2">
              <Table>
                <TableHeader className="border-none">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.2em] h-10 px-4">Order ID</TableHead>
                    <TableHead className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.2em] h-10 px-4">Customer</TableHead>
                    <TableHead className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.2em] h-10 px-4">Total</TableHead>
                    <TableHead className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.2em] h-10 px-4">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} className="border-slate-900/50 hover:bg-slate-900/40 transition-colors">
                      <TableCell className="font-mono text-[11px] font-bold text-slate-400 px-4 py-4">{order.id}</TableCell>
                      <TableCell className="font-medium text-slate-300 text-sm px-4 py-4">{order.customer}</TableCell>
                      <TableCell className="font-bold text-slate-200 text-sm px-4 py-4">{order.total}</TableCell>
                      <TableCell className="px-4 py-4">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "bg-opacity-10 border-none px-2 py-0.5 font-black uppercase text-[8px] tracking-wider",
                            order.status === "Processing" ? "bg-blue-500 text-blue-400" :
                              order.status === "Shipped" ? "bg-purple-500 text-purple-400" :
                                order.status === "Delivered" ? "bg-emerald-500 text-emerald-400" :
                                  "bg-red-500 text-red-400"
                          )}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Side List: Top Selling */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-900 bg-slate-900/20">
              <h3 className="font-bold text-slate-200">Top Selling Products</h3>
            </div>
            <div className="p-6 space-y-6">
              {topProducts.map((product) => (
                <div key={product.name} className="flex items-center gap-4 group">
                  <div className="h-11 w-11 rounded-xl overflow-hidden bg-slate-950 border border-slate-900 shrink-0">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{product.name}</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{product.revenue}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">{product.sales} sold</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-xs font-bold rounded-xl h-11" asChild>
                <Link to="/admin/catalog-pro">
                  Manage Full Catalog
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminHome;
