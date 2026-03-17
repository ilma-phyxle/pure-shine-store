import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { getDashboardStats, ApiDashboardStats } from "@/lib/api";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";

const AdminHome = () => {
  const [stats, setStats] = useState<ApiDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings, isUpdating, updateSettings, isEnabled } = useSiteSettings();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        toast.error("Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const kpis = [
    {
      label: "Total Revenue",
      value: stats ? `Rs. ${stats.kpis.total_revenue.toLocaleString()}` : "Rs. 0.00",
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    {
      label: "Total Orders",
      value: stats ? String(stats.kpis.total_orders) : "0",
      icon: ShoppingBag,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      label: "Active Products",
      value: stats ? String(stats.kpis.active_products) : "0",
      icon: Package,
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      label: "Low Stock Alerts",
      value: stats ? String(stats.kpis.low_stock) : "0",
      icon: AlertTriangle,
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    },
  ];

  const recentOrders = stats?.recent_orders || [];

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-1">Store Overview</h1>
            <p className="text-slate-500 text-sm">Real-time performance metrics and recent activity.</p>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 hover:bg-slate-900/60 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">{kpi.label}</p>
                <h3 className="text-2xl font-display font-bold text-white">{loading ? "..." : kpi.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Main List: Recent Orders */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-900 flex items-center justify-between bg-slate-900/20">
              <h3 className="font-bold text-slate-200">Recent Orders</h3>
              <Button variant="ghost" className="text-primary text-xs font-bold hover:bg-primary/5" asChild>
                <Link to="/admin/orders">View All</Link>
              </Button>
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
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500">Loading orders...</TableCell></TableRow>
                  ) : recentOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-600">No orders found.</TableCell></TableRow>
                  ) : (
                    recentOrders.map((order) => (
                      <TableRow key={order.id} className="border-slate-900/50 hover:bg-slate-900/40 transition-colors">
                        <TableCell className="font-mono text-[11px] font-bold text-slate-400 px-4 py-4">#{order.id}</TableCell>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Homepage Sections Toggle */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl overflow-hidden mt-8">
            <div className="p-6 border-b border-slate-900 bg-slate-900/20 flex items-center justify-between">
              <h3 className="font-bold text-slate-200">Homepage Sections</h3>
              {isUpdating && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between group">
                <div className="space-y-0.5">
                  <Label className="text-slate-200 font-bold uppercase text-[10px] tracking-widest">New Arrivals</Label>
                  <p className="text-[11px] text-slate-500">Show New Arrivals section on homepage</p>
                </div>
                <Switch 
                  checked={isEnabled('show_new_arrivals')}
                  onCheckedChange={(checked) => updateSettings({ show_new_arrivals: checked })}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between group">
                <div className="space-y-0.5">
                  <Label className="text-slate-200 font-bold uppercase text-[10px] tracking-widest">Hot Deals</Label>
                  <p className="text-[11px] text-slate-500">Show Hot Deals section on homepage</p>
                </div>
                <Switch 
                  checked={isEnabled('show_hot_deals')}
                  onCheckedChange={(checked) => updateSettings({ show_hot_deals: checked })}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between group">
                <div className="space-y-0.5">
                  <Label className="text-slate-200 font-bold uppercase text-[10px] tracking-widest">Shop By Brand</Label>
                  <p className="text-[11px] text-slate-500">Show Brand logo section on homepage</p>
                </div>
                <Switch 
                  checked={isEnabled('show_shop_by_brand')}
                  onCheckedChange={(checked) => updateSettings({ show_shop_by_brand: checked })}
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-900 bg-slate-900/20">
              <h3 className="font-bold text-slate-200">Catalog Shortcut</h3>
            </div>
            <div className="p-6 space-y-4 text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Package className="h-10 w-10 text-primary" />
              </div>
              <p className="text-slate-400 text-sm">Manage your products and categories directly in the catalog manager.</p>
              <Button variant="outline" className="w-full border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-xs font-bold rounded-xl h-11" asChild>
                <Link to="/admin/catalog-pro">
                  Go to Catalog Manager
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
