import { useState, useEffect } from "react";
import { useCatalogStore, type FullCategory, type ProductDetail, type NavItem } from "@/stores/catalogStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Save, Download, Globe, MessageSquare, ListTree, Package, ExternalLink, ArrowLeft, DollarSign, X, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/admin/AdminLayout";

const CURRENCIES = [
    { code: "AUD", symbol: "$" },
    { code: "USD", symbol: "$" },
    { code: "LKR", symbol: "Rs" },
    { code: "EUR", symbol: "€" },
    { code: "GBP", symbol: "£" },
];

const AdminCatalogPro = () => {
    const catalog = useCatalogStore();
    const [activeCategoryTab, setActiveCategoryTab] = useState<string>(catalog.categories[0]?.id || "");
    const [newProductId, setNewProductId] = useState<string | null>(null);
    const [newCategoryId, setNewCategoryId] = useState<string | null>(null);

    useEffect(() => {
        if (newCategoryId) {
            setTimeout(() => {
                const element = document.getElementById(`category-${newCategoryId}`);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                    element.classList.add("ring-1", "ring-primary", "bg-primary/5");
                    setTimeout(() => {
                        element.classList.remove("ring-1", "ring-primary", "bg-primary/5");
                    }, 2000);
                }
                setNewCategoryId(null);
            }, 100);
        }
    }, [newCategoryId]);

    useEffect(() => {
        if (newProductId) {
            setTimeout(() => {
                const element = document.getElementById(`product-${newProductId}`);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                    // Flash effect to highlight the new product
                    element.classList.add("ring-2", "ring-primary", "ring-offset-4", "ring-offset-slate-950");
                    setTimeout(() => {
                        element.classList.remove("ring-2", "ring-primary", "ring-offset-4", "ring-offset-slate-950");
                    }, 2000);
                }
                setNewProductId(null);
            }, 100);
        }
    }, [newProductId]);

    const handleImageUpload = (file: File | undefined, callback: (base64: string) => void) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            callback(base64String);
            toast.success("Image uploaded successfully");
        };
        reader.readAsDataURL(file);
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                    <div>
                        <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-1">Catalog Manager</h1>
                        <p className="text-slate-500 text-sm">Organize your store collections and manage individual product details.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-900/40 p-1.5 rounded-2xl border border-slate-900">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/50 rounded-xl border border-slate-800">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Store Currency</span>
                            <Select
                                value={catalog.store.currency}
                                onValueChange={(val) => catalog.updateStore({ currency: val })}
                            >
                                <SelectTrigger className="h-8 w-24 bg-transparent border-none text-primary font-bold text-xs focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-950 border-slate-800">
                                    {CURRENCIES.map(c => (
                                        <SelectItem key={c.code} value={c.code} className="text-slate-300 focus:bg-primary focus:text-white">
                                            {c.code} ({c.symbol})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
                        {/* Categories Sidebar */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Categories</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => {
                                    const id = catalog.addCategory({ name: "New Category", slug: "", description: "", icon: "🧪", color_hex: "#000", background_hex: "#fff", image_url: "", banner_url: "", product_count: 0, source_url: "" });
                                    setNewCategoryId(id);
                                    setActiveCategoryTab(id);
                                }}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-col gap-1">
                                {
                                    catalog.categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            id={`category-${cat.id}`}
                                            onClick={() => setActiveCategoryTab(cat.id)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all scroll-mt-10",
                                                activeCategoryTab === cat.id ? "bg-slate-900 text-white font-bold" : "text-slate-500 hover:bg-slate-900/50 hover:text-slate-300"
                                            )}
                                        >
                                            <span className="truncate">{cat.name}</span>
                                            <Badge variant="secondary" className={cn("ml-2 text-[10px] font-black px-1.5 h-4.5 border-none", activeCategoryTab === cat.id ? "bg-primary text-primary-foreground" : "bg-slate-800 text-slate-500")}>
                                                {cat.products.length}
                                            </Badge>
                                        </button>
                                    ))
                                }
                            </div>
                        </div>

                        {/* Category Detail & Products */}
                        <div className="space-y-8">
                            {
                                catalog.categories.find(c => c.id === activeCategoryTab) ? (
                                    <>
                                        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 lg:p-8 space-y-8">
                                            <div className="flex items-center justify-between border-b border-slate-900/50 pb-6">
                                                <div>
                                                    <h2 className="text-xl font-bold text-white">Category Details</h2>
                                                    <p className="text-slate-500 text-xs mt-1 font-mono uppercase tracking-widest">{activeCategoryTab}</p>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete category?")) { catalog.removeCategory(activeCategoryTab); setActiveCategoryTab(catalog.categories[0]?.id || ""); } }} className="text-red-500 hover:bg-red-500/10 hover:text-red-400 font-bold text-xs uppercase tracking-wider h-10 px-4 rounded-xl">
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </Button>
                                            </div>

                                            {
                                                (() => {
                                                    const cat = catalog.categories.find(c => c.id === activeCategoryTab)!;
                                                    return (
                                                        <div className="grid gap-6 md:grid-cols-2">
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Display Name</Label>
                                                                <Input className="bg-slate-950/50 border-slate-900 h-12 rounded-xl focus:ring-primary/20" value={cat.name} onChange={(e) => catalog.updateCategory(cat.id, { name: e.target.value })} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Slug</Label>
                                                                <Input className="bg-slate-950/50 border-slate-900 h-12 rounded-xl focus:ring-primary/20" value={cat.slug} onChange={(e) => catalog.updateCategory(cat.id, { slug: e.target.value })} />
                                                            </div>
                                                            <div className="space-y-2 md:col-span-2">
                                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Description</Label>
                                                                <Textarea className="bg-slate-950/50 border-slate-900 min-h-[100px] rounded-xl focus:ring-primary/20" value={cat.description} onChange={(e) => catalog.updateCategory(cat.id, { description: e.target.value })} />
                                                            </div>
                                                        </div>
                                                    );
                                                })()
                                            }
                                        </div>

                                        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl overflow-hidden">
                                            <div className="p-6 lg:p-8 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/20">
                                                <div>
                                                    <h2 className="text-xl font-bold text-white">Product Inventory</h2>
                                                    <p className="text-slate-500 text-xs mt-1">Manage static items tagged under this category.</p>
                                                </div>
                                                <Button size="sm" onClick={() => {
                                                    const id = catalog.addProduct(activeCategoryTab, { name: "New Product", slug: "", brand: "", short_description: "", description: "", category_id: activeCategoryTab, category_name: "", subcategory: "", image_url: "", gallery: [], tags: [], in_stock: true, product_url: "", sku: "", price: "0.00", currency: catalog.store.currency });
                                                    setNewProductId(id);
                                                }} className="bg-primary text-primary-foreground h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/20">
                                                    <Plus className="h-4 w-4 mr-2" /> Add Product
                                                </Button>
                                            </div>
                                            <div className="p-6 lg:p-8 space-y-6">
                                                {catalog.categories.find(c => c.id === activeCategoryTab)!.products.map((p) => (
                                                    <ProductItem
                                                        key={p.id}
                                                        product={p}
                                                        categoryId={activeCategoryTab}
                                                        onUpdate={(id, patch) => catalog.updateProduct(activeCategoryTab, id, patch)}
                                                        onRemove={(id) => catalog.removeProduct(activeCategoryTab, id)}
                                                        handleImageUpload={handleImageUpload}
                                                        allSubcategories={Array.from(new Set(catalog.categories.find(c => c.id === activeCategoryTab)?.products.map(prod => prod.subcategory).filter(Boolean) || []))}
                                                        storeCurrency={catalog.store.currency}
                                                    />
                                                ))}
                                                {
                                                    catalog.categories.find(c => c.id === activeCategoryTab)!.products.length === 0 && (
                                                        <div className="text-center py-20 bg-slate-950/30 rounded-2xl border-2 border-dashed border-slate-900">
                                                            <Package className="h-12 w-12 text-slate-900 mx-auto mb-4" />
                                                            <p className="text-slate-600 font-medium">No products in this category.</p>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-[500px] flex flex-col items-center justify-center text-slate-700 bg-slate-900/20 rounded-3xl border border-slate-900 border-dashed">
                                        <Package className="h-16 w-16 opacity-10 mb-6" />
                                        <p className="font-bold text-lg">Empty Selection</p>
                                        <p className="text-sm text-slate-600 mt-1">Select a category to view and edit items.</p>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCatalogPro;

const ProductItem = ({
    product: p,
    categoryId,
    onUpdate,
    onRemove,
    handleImageUpload,
    allSubcategories,
    storeCurrency
}: {
    product: ProductDetail;
    categoryId: string;
    onUpdate: (id: string, patch: Partial<ProductDetail>) => void;
    onRemove: (id: string) => void;
    handleImageUpload: (file: File | undefined, callback: (base64: string) => void) => void;
    allSubcategories: string[];
    storeCurrency: string;
}) => {
    const [isCustomSub, setIsCustomSub] = useState(false);

    return (
        <div id={`product-${p.id}`} className="p-6 rounded-2xl border border-slate-900 bg-slate-950/30 group hover:bg-slate-900/40 transition-all hover:border-slate-800 scroll-mt-20">
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0 group-hover:scale-105 transition-transform">
                    {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center"><Package className="h-10 w-10 text-slate-800" /></div>
                    )
                    }
                    <Label htmlFor={`upload-${p.id}`} className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                        <Download className="h-6 w-6 text-white rotate-180" />
                    </Label>
                    <Input id={`upload-${p.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0], (base64) => onUpdate(p.id, { image_url: base64 }))} />
                </div>
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <Input
                            value={p.name}
                            onChange={(e) => onUpdate(p.id, { name: e.target.value })}
                            placeholder="Product Name"
                            className="font-bold h-10 text-xl border-none bg-transparent p-0 focus-visible:ring-0 w-full text-white placeholder:text-slate-800"
                        />
                        <div className="flex items-center gap-2">
                            <div className="relative group/price flex items-center bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20">
                                <Select
                                    value={p.currency || storeCurrency}
                                    onValueChange={(val) => onUpdate(p.id, { currency: val })}
                                >
                                    <SelectTrigger className="h-10 w-16 bg-transparent border-none text-[10px] font-bold text-primary focus:ring-0 px-2 shrink-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-950 border-slate-800">
                                        {CURRENCIES.map(c => (
                                            <SelectItem key={c.code} value={c.code} className="text-slate-300 focus:bg-primary focus:text-white">
                                                {c.symbol}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="w-[1px] h-4 bg-slate-800 shrink-0" />
                                <Input
                                    value={p.price}
                                    onChange={(e) => onUpdate(p.id, { price: e.target.value })}
                                    placeholder="0.00"
                                    className="h-10 w-24 border-none bg-transparent rounded-none text-primary font-bold text-sm focus-visible:ring-0"
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-slate-700 hover:text-primary hover:bg-primary/10 transition-all group/cart"
                                onClick={() => useCartStore.getState().addItem({
                                    type: 'catalog',
                                    productId: p.id,
                                    name: p.name,
                                    price: { amount: p.price, currencyCode: p.currency || storeCurrency },
                                    quantity: 1,
                                    image: p.image_url
                                }).then(() => toast.success("Added to cart (Test)", { description: p.name }))}
                            >
                                <ShoppingCart className="h-5 w-5 transition-transform group-hover/cart:scale-110" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl shrink-0 transition-colors" onClick={() => onRemove(p.id)}>
                                <Trash2 className="h-4.5 w-4.5" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Product Details</Label>
                        <Textarea
                            value={p.description}
                            onChange={(e) => onUpdate(p.id, { description: e.target.value })}
                            placeholder="Write product description here..."
                            className="bg-slate-900/50 border-slate-800 rounded-xl text-xs text-slate-400 min-h-[80px] focus:ring-primary/20"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Subcategory</Label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    {isCustomSub ? (
                                        <Input
                                            value={p.subcategory}
                                            onChange={(e) => onUpdate(p.id, { subcategory: e.target.value })}
                                            placeholder="Type new subcategory..."
                                            className="h-11 bg-slate-900/50 border-slate-800 rounded-xl text-slate-300 text-xs focus:ring-primary/20"
                                            autoFocus
                                        />
                                    ) : (
                                        <Select
                                            value={p.subcategory}
                                            onValueChange={(val) => {
                                                if (val === "Other") {
                                                    setIsCustomSub(true);
                                                    onUpdate(p.id, { subcategory: "" });
                                                } else {
                                                    onUpdate(p.id, { subcategory: val });
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="h-11 bg-slate-900/50 border-slate-800 rounded-xl text-slate-300 text-xs">
                                                <SelectValue placeholder="Select subcategory" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-950 border-slate-800">
                                                {allSubcategories.map(sub => (
                                                    <SelectItem key={sub} value={sub} className="text-slate-300 focus:bg-primary focus:text-white">{sub}</SelectItem>
                                                ))}
                                                <SelectItem value="Other" className="text-slate-500 italic">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11 border border-slate-800 rounded-xl hover:bg-slate-900 transition-colors"
                                    onClick={() => setIsCustomSub(!isCustomSub)}
                                >
                                    {isCustomSub ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">SKU / ID</Label>
                            <Input
                                value={p.sku}
                                onChange={(e) => onUpdate(p.id, { sku: e.target.value })}
                                placeholder="PRD-XXXX"
                                className="h-11 bg-slate-900/50 border-slate-800 rounded-xl text-slate-300 text-xs focus:ring-primary/20"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
