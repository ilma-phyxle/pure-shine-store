import { useState, useEffect } from "react";
import { getProducts, updateProduct, ApiProduct } from "@/lib/api";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Search, Package, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminNewArrivals = () => {
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await getProducts();
                setProducts(data);
            } catch (err) {
                toast.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleToggleNewArrival = async (id: number, currentStatus: boolean) => {
        try {
            setUpdatingIds(prev => new Set(prev).add(id));
            const updatedProduct = await updateProduct(id, { is_new_arrival: !currentStatus });
            setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
            toast.success(updatedProduct.is_new_arrival ? "Added to New Arrivals" : "Removed from New Arrivals");
        } catch (err) {
            toast.error("Failed to update product status");
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const newArrivals = products.filter(p => p.is_new_arrival);

    return (
        <AdminLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                    <div>
                        <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-1">New Arrivals</h1>
                        <p className="text-slate-500 text-sm">Manage which products are featured in the "New Arrivals" section of your store.</p>
                    </div>
                    <div className="bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-900 flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Arrivals</span>
                            <span className="text-xl font-display font-black text-primary">{newArrivals.length}</span>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-800" />
                        <Star className="h-5 w-5 text-primary animate-pulse" />
                    </div>
                </div>

                <Card className="bg-slate-900/40 border border-slate-900 overflow-hidden rounded-3xl">
                    <div className="p-6 border-b border-slate-900 bg-slate-900/20">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input 
                                placeholder="Search products to feature..." 
                                className="pl-11 bg-slate-950/50 border-slate-800 h-12 rounded-xl text-slate-200 placeholder:text-slate-600 focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-20 text-slate-500">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p className="font-bold uppercase tracking-widest text-[10px]">Loading Inventory...</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-slate-500 text-center">
                                <Package className="h-12 w-12 opacity-10 mb-4" />
                                <p className="font-medium">No products found for "{searchTerm}"</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-slate-950/30">
                                            <th className="px-8 py-5">Product Info</th>
                                            <th className="px-8 py-5 text-center">Current Status</th>
                                            <th className="px-8 py-5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-900/50">
                                        {filteredProducts.map((p) => (
                                            <tr key={p.id} className="group hover:bg-slate-900/20 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                                                            {p.image_url ? (
                                                                <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center">
                                                                    <Package className="h-6 w-6 text-slate-800" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-200">{p.name}</div>
                                                            <div className="text-[10px] text-slate-600 font-mono mt-0.5">${p.price} • {p.category?.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    {p.is_new_arrival ? (
                                                        <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                            Featured
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-slate-700 border-slate-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        {updatingIds.has(p.id) ? (
                                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                        ) : (
                                                            <Switch 
                                                                checked={p.is_new_arrival}
                                                                onCheckedChange={() => handleToggleNewArrival(p.id, p.is_new_arrival)}
                                                                className="data-[state=checked]:bg-primary"
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminNewArrivals;
