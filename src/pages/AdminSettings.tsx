import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const SETTINGS_KEYS = {
  arrivals: "shop_show_new_arrivals",
  hotDeals: "shop_show_hot_deals",
  brands: "shop_show_brands",
};

const readToggle = (key: string, fallback = true) => {
  const value = localStorage.getItem(key);
  if (value === null) return fallback;
  return value === "true";
};

const writeToggle = (key: string, value: boolean) => {
  localStorage.setItem(key, value ? "true" : "false");
};

const AdminSettings = () => {
  const [showArrivals, setShowArrivals] = useState(true);
  const [showHotDeals, setShowHotDeals] = useState(true);
  const [showBrands, setShowBrands] = useState(true);

  useEffect(() => {
    setShowArrivals(readToggle(SETTINGS_KEYS.arrivals, true));
    setShowHotDeals(readToggle(SETTINGS_KEYS.hotDeals, true));
    setShowBrands(readToggle(SETTINGS_KEYS.brands, true));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-blue-900 mb-1">Shop Settings</h1>
            <p className="text-slate-500 text-sm">Enable or disable sections on the Shop page.</p>
          </div>
        </div>

        <Card className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">New Arrivals</p>
                <p className="text-xs text-slate-500">Show the New Arrivals option on the Shop page.</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={showArrivals ? "bg-primary/10 text-primary border-primary/20" : "bg-slate-100 text-slate-500 border-slate-200"}>
                  {showArrivals ? "Enabled" : "Disabled"}
                </Badge>
                <Switch
                  checked={showArrivals}
                  onCheckedChange={(val) => {
                    setShowArrivals(val);
                    writeToggle(SETTINGS_KEYS.arrivals, val);
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Hot Deals</p>
                <p className="text-xs text-slate-500">Show the Hot Deals option on the Shop page.</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={showHotDeals ? "bg-primary/10 text-primary border-primary/20" : "bg-slate-100 text-slate-500 border-slate-200"}>
                  {showHotDeals ? "Enabled" : "Disabled"}
                </Badge>
                <Switch
                  checked={showHotDeals}
                  onCheckedChange={(val) => {
                    setShowHotDeals(val);
                    writeToggle(SETTINGS_KEYS.hotDeals, val);
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Shop By Brand</p>
                <p className="text-xs text-slate-500">Show the Shop By Brand option on the Shop page.</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={showBrands ? "bg-primary/10 text-primary border-primary/20" : "bg-slate-100 text-slate-500 border-slate-200"}>
                  {showBrands ? "Enabled" : "Disabled"}
                </Badge>
                <Switch
                  checked={showBrands}
                  onCheckedChange={(val) => {
                    setShowBrands(val);
                    writeToggle(SETTINGS_KEYS.brands, val);
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
