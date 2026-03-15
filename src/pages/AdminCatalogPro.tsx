import { useState, useEffect, useRef, useMemo } from "react";
import {
    getCategories, createCategory, updateCategory, deleteCategory,
    getSubCategories, createSubCategory, updateSubCategory, deleteSubCategory,
    getProducts, createProduct, updateProduct, deleteProduct,
    ApiCategory, ApiSubCategory, ApiProduct
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Download, Package, X, ShoppingCart, Image as ImageIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { Loader2, AlertTriangle } from "lucide-react";

const CURRENCIES = [
    { code: "AUD", symbol: "$" },
    { code: "LKR", symbol: "Rs" },
    { code: "EUR", symbol: "€" },
    { code: "GBP", symbol: "£" },
];

const AdminCatalogPro = () => {
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [subCategories, setSubCategories] = useState<ApiSubCategory[]>([]);
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [storeCurrency, setStoreCurrency] = useState("AUD");
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [viewingNewArrivals, setViewingNewArrivals] = useState(false);
    const [viewingHotDeals, setViewingHotDeals] = useState(false);

    // Dialog States
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: number, type: 'category' | 'subcategory' | 'product', name: string } | null>(null);

    // Form States
    const [newCategory, setNewCategory] = useState({ name: "", slug: "", description: "", image_url: "" });
    const [newSubCategory, setNewSubCategory] = useState({ name: "", slug: "", description: "" });
    const [newProduct, setNewProduct] = useState({
        name: "",
        slug: "",
        description: "",
        price: 0,
        sub_category_id: null as number | null,
        image_url: "",
        image_url_2: "",
        image_url_3: "",
        is_new_arrival: false,
        is_hot_deal: false,
        discount_price: 0,
        brand: "",
        variants: [] as Array<{ name: string; price: number; discount_price: number | null; }>
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [cats, subs, prods] = await Promise.all([getCategories(), getSubCategories(), getProducts()]);
            setCategories(cats);
            setSubCategories(subs);
            setProducts(prods);
            if (cats.length > 0 && activeCategoryId === null) {
                setActiveCategoryId(cats[0].id);
            }
        } catch {
            toast.error("Failed to load catalog from database");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const activeCategoryProducts = viewingHotDeals
        ? products.filter(p => p.is_hot_deal)
        : viewingNewArrivals 
            ? products.filter(p => p.is_new_arrival)
            : products.filter(p => p.category_id === activeCategoryId);
    const activeCategory = categories.find(c => c.id === activeCategoryId) ?? null;
    
    const availableBrands = useMemo(() => {
        const brands = new Set<string>();
        products.forEach(p => {
            if (p.brand) brands.add(p.brand);
        });
        return Array.from(brands).sort();
    }, [products]);

    const handleImageSelect = (file: File | undefined, callback: (base64: string) => void) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            callback(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    // ---- Category Actions ----
    const handleAddCategory = async () => {
        if (!newCategory.name) return;
        try {
            setIsSubmitting(true);
            const added = await createCategory(newCategory);
            setCategories(prev => [...prev, added]);
            setActiveCategoryId(added.id);
            setNewCategory({ name: "", slug: "", description: "", image_url: "" });
            setIsAddingCategory(false);
            toast.success("Category created");
        } catch {
            toast.error("Failed to create category");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateCategory = async (id: number, patch: Partial<ApiCategory>) => {
        try {
            const updated = await updateCategory(id, patch);
            setCategories(prev => prev.map(c => c.id === id ? updated : c));
        } catch {
            toast.error("Failed to update category");
        }
    };
    const handleDeleteCategory = async (id: number) => {
        try {
            await deleteCategory(id);
            setCategories(prev => prev.filter(c => c.id !== id));
            setSubCategories(prev => prev.filter(s => s.category_id !== id));
            setProducts(prev => prev.filter(p => p.category_id !== id));
            const nextCat = categories.find(c => c.id !== id);
            setActiveCategoryId(nextCat ? nextCat.id : null);
            toast.success("Category deleted");
        } catch {
            toast.error("Failed to delete category");
        }
    };

    // ---- SubCategory Actions ----
    const handleAddSubCategory = async () => {
        if (!activeCategoryId || !newSubCategory.name) return;
        try {
            setIsSubmitting(true);
            const added = await createSubCategory({
                ...newSubCategory,
                category_id: activeCategoryId
            });
            setSubCategories(prev => [...prev, added]);
            setNewSubCategory({ name: "", slug: "", description: "" });
            setIsAddingSubCategory(false);
            toast.success("Sub-category created");
        } catch {
            toast.error("Failed to create sub-category");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateSubCategory = async (id: number, patch: Partial<ApiSubCategory>) => {
        try {
            const updated = await updateSubCategory(id, patch);
            setSubCategories(prev => prev.map(s => s.id === id ? updated : s));
        } catch {
            toast.error("Failed to update sub-category");
        }
    };

    const handleDeleteSubCategory = async (id: number) => {
        try {
            await deleteSubCategory(id);
            setSubCategories(prev => prev.filter(s => s.id !== id));
            setProducts(prev => prev.map(p => p.sub_category_id === id ? { ...p, sub_category_id: null } : p));
            toast.success("Sub-category deleted");
        } catch {
            toast.error("Failed to delete sub-category");
        }
    };

    // ---- Product Actions ----
    const handleAddProduct = async () => {
        if (!activeCategoryId || !newProduct.name) return;
        try {
            setIsSubmitting(true);
            const added = await createProduct({
                ...newProduct,
                category_id: activeCategoryId,
            });
            setProducts(prev => [...prev, added]);
            setNewProduct({
                name: "",
                slug: "",
                description: "",
                price: 0,
                sub_category_id: null,
                image_url: "",
                image_url_2: "",
                image_url_3: "",
                is_new_arrival: false,
                is_hot_deal: false,
                discount_price: 0,
                brand: "",
                variants: []
            });
            setIsAddingProduct(false);
            toast.success("Product created");
        } catch {
            toast.error("Failed to create product");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateProduct = async (id: number, patch: Partial<ApiProduct>) => {
        try {
            const updated = await updateProduct(id, patch);
            setProducts(prev => prev.map(p => p.id === id ? updated : p));
        } catch {
            toast.error("Failed to update product");
        }
    };

    const handleDeleteProduct = async (id: number) => {
        try {
            await deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
            toast.success("Product deleted");
        } catch {
            toast.error("Failed to delete product");
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[60vh] text-slate-500">
                    <Package className="h-8 w-8 animate-bounce mr-3 text-primary/50" />
                    Loading catalog from database...
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                    <div>
                        <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-1">Catalog Manager</h1>
                        <p className="text-slate-500 text-sm">Manage your store collections and product details. All data saved to database.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-900/40 p-1.5 rounded-2xl border border-slate-900">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/50 rounded-xl border border-slate-800">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Store Currency</span>
                            <Select value={storeCurrency} onValueChange={setStoreCurrency}>
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

                <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
                    {/* Categories Sidebar */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Categories</span>
                            <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-950 border-slate-900 text-slate-100">
                                    <DialogHeader>
                                        <DialogTitle>Add New Category</DialogTitle>
                                        <DialogDescription className="text-slate-500">Create a new collection for your store items.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category Name</Label>
                                            <Input
                                                className="bg-slate-900/50 border-slate-800"
                                                placeholder="e.g. Cleaning Supplies"
                                                value={newCategory.name}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setNewCategory(prev => ({
                                                        ...prev,
                                                        name: val,
                                                        slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                                                    }));
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Slug</Label>
                                            <Input
                                                className="bg-slate-900/50 border-slate-800"
                                                placeholder="cleaning-supplies"
                                                value={newCategory.slug}
                                                onChange={(e) => setNewCategory(prev => ({ ...prev, slug: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description</Label>
                                            <Textarea
                                                className="bg-slate-900/50 border-slate-800"
                                                placeholder="Describe this category..."
                                                value={newCategory.description}
                                                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category Image</Label>
                                            <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50">
                                                {newCategory.image_url ? (
                                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                                                        <img src={newCategory.image_url} className="w-full h-full object-cover" alt="Preview" />
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute top-2 right-2 h-8 w-8 rounded-lg shadow-lg"
                                                            onClick={() => setNewCategory(prev => ({ ...prev, image_url: "" }))}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="aspect-video rounded-xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-2">
                                                        <ImageIcon className="h-8 w-8 opacity-20" />
                                                        <span className="text-[10px] font-medium uppercase tracking-wider opacity-40">No image selected</span>
                                                    </div>
                                                )}
                                                <Input type="file" accept="image/*" className="bg-slate-900 border-slate-800 h-11 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                                                    onChange={(e) => handleImageSelect(e.target.files?.[0], (b64) => setNewCategory(prev => ({ ...prev, image_url: b64 })))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="ghost" onClick={() => setIsAddingCategory(false)} className="text-slate-400">Cancel</Button>
                                        <Button
                                            onClick={handleAddCategory}
                                            disabled={isSubmitting || !newCategory.name}
                                            className="bg-primary text-primary-foreground font-bold"
                                        >
                                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                            Create Category
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="flex flex-col gap-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setActiveCategoryId(cat.id);
                                        setViewingNewArrivals(false);
                                        setViewingHotDeals(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all",
                                        activeCategoryId === cat.id ? "bg-slate-900 text-white font-bold" : "text-slate-500 hover:bg-slate-900/50 hover:text-slate-300"
                                    )}
                                >
                                    <span className="truncate">{cat.name}</span>
                                    <Badge variant="secondary" className={cn("ml-2 text-[10px] font-black px-1.5 border-none", activeCategoryId === cat.id ? "bg-primary text-primary-foreground" : "bg-slate-800 text-slate-500")}>
                                        {products.filter(p => p.category_id === cat.id).length}
                                    </Badge>
                                </button>
                            ))}
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-900">
                            <button
                                onClick={() => {
                                    setViewingNewArrivals(!viewingNewArrivals);
                                    setViewingHotDeals(false);
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all",
                                    viewingNewArrivals ? "bg-primary text-white font-bold" : "text-slate-500 hover:bg-slate-900/50 hover:text-slate-300"
                                )}
                            >
                                <div className="flex items-center">
                                    <Badge className="mr-2 bg-amber-500/20 text-amber-500 border-none">NEW</Badge>
                                    <span>New Arrivals</span>
                                </div>
                                <Badge variant="secondary" className={cn("ml-2 text-[10px] font-black px-1.5 border-none", viewingNewArrivals ? "bg-white text-primary" : "bg-slate-800 text-slate-500")}>
                                    {products.filter(p => p.is_new_arrival).length}
                                </Badge>
                            </button>

                            <button
                                onClick={() => {
                                    setViewingHotDeals(!viewingHotDeals);
                                    setViewingNewArrivals(false);
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all mt-2",
                                    viewingHotDeals ? "bg-red-600 text-white font-bold" : "text-slate-500 hover:bg-slate-900/50 hover:text-slate-300"
                                )}
                            >
                                <div className="flex items-center">
                                    <Badge className="mr-2 bg-red-600/20 text-red-500 border-none">HOT</Badge>
                                    <span>Hot Deals</span>
                                </div>
                                <Badge variant="secondary" className={cn("ml-2 text-[10px] font-black px-1.5 border-none", viewingHotDeals ? "bg-white text-red-600" : "bg-slate-800 text-slate-500")}>
                                    {products.filter(p => p.is_hot_deal).length}
                                </Badge>
                            </button>
                        </div>
                    </div>

                    {/* Category Detail & Products */}
                    <div className="space-y-8" key={viewingNewArrivals ? "new-arrivals" : (activeCategory ? activeCategory.id : "no-category")}>
                        {viewingNewArrivals ? (
                            <div className="space-y-8">
                                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 lg:p-8">
                                    <h2 className="text-xl font-bold text-white flex items-center">
                                        <Badge className="mr-3 bg-primary text-white border-none h-6">NEW</Badge>
                                        New Arrivals Selection
                                    </h2>
                                    <p className="text-slate-500 text-xs mt-1">Manage products featured in the New Arrivals section of the shop.</p>
                                </div>
                                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl overflow-hidden p-6 lg:p-8 space-y-6">
                                    {products.filter(p => p.is_new_arrival).length === 0 ? (
                                        <div className="text-center py-20 bg-slate-950/30 rounded-2xl border-2 border-dashed border-slate-900">
                                            <Package className="h-12 w-12 text-slate-900 mx-auto mb-4" />
                                            <p className="text-slate-600 font-medium">No products marked as New Arrivals.</p>
                                        </div>
                                    ) : (
                                        products.filter(p => p.is_new_arrival).map((p) => (
                                            <ProductItem
                                                key={p.id}
                                                product={p}
                                                subCategories={subCategories.filter(s => s.category_id === p.category_id)}
                                                onUpdate={(patch) => handleUpdateProduct(p.id, patch)}
                                                onRemove={() => setItemToDelete({ id: p.id, type: 'product', name: p.name })}
                                                handleImageSelect={handleImageSelect}
                                                storeCurrency={storeCurrency}
                                                availableBrands={availableBrands}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : viewingHotDeals ? (
                            <div className="space-y-8">
                                <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 lg:p-8">
                                    <h2 className="text-xl font-bold text-white flex items-center">
                                        <Badge className="mr-3 bg-red-600 text-white border-none h-6">HOT</Badge>
                                        Hot Deals Selection
                                    </h2>
                                    <p className="text-slate-500 text-xs mt-1">Manage products with discounted prices featured in the Hot Deals section.</p>
                                </div>
                                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl overflow-hidden p-6 lg:p-8 space-y-6">
                                    {products.filter(p => p.is_hot_deal).length === 0 ? (
                                        <div className="text-center py-20 bg-slate-950/30 rounded-2xl border-2 border-dashed border-slate-900">
                                            <Package className="h-12 w-12 text-slate-900 mx-auto mb-4" />
                                            <p className="text-slate-600 font-medium">No products marked as Hot Deals.</p>
                                        </div>
                                    ) : (
                                        products.filter(p => p.is_hot_deal).map((p) => (
                                            <ProductItem
                                                key={p.id}
                                                product={p}
                                                subCategories={subCategories.filter(s => s.category_id === p.category_id)}
                                                onUpdate={(patch) => handleUpdateProduct(p.id, patch)}
                                                onRemove={() => setItemToDelete({ id: p.id, type: 'product', name: p.name })}
                                                handleImageSelect={handleImageSelect}
                                                storeCurrency={storeCurrency}
                                                availableBrands={availableBrands}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : activeCategory ? (
                            <>
                                {/* Category Details Card */}
                                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 lg:p-8 space-y-8">
                                    <div className="flex items-center justify-between border-b border-slate-900/50 pb-6">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <h2 className="text-xl font-bold text-white">Category Details</h2>
                                                <p className="text-slate-500 text-xs mt-1 font-mono">ID: {activeCategory.id}</p>
                                            </div>
                                            <div className="w-[1px] h-8 bg-slate-800" />
                                            <Button
                                                variant={isEditingCategory ? "default" : "secondary"}
                                                size="sm"
                                                onClick={() => setIsEditingCategory(!isEditingCategory)}
                                                className={cn(
                                                    "h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all",
                                                    isEditingCategory
                                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                                                )}
                                            >
                                                {isEditingCategory ? (
                                                    <><X className="h-4 w-4 mr-2" /> Done Editing</>
                                                ) : (
                                                    <><Package className="h-4 w-4 mr-2 text-primary" /> Unlock for Edit</>
                                                )}
                                            </Button>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setItemToDelete({ id: activeCategory.id, type: 'category', name: activeCategory.name })} className="text-red-500 hover:bg-red-500/10 hover:text-red-400 font-bold text-xs uppercase tracking-wider h-10 px-4 rounded-xl">
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </Button>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Display Name</Label>
                                            <Input
                                                disabled={!isEditingCategory}
                                                className={cn(
                                                    "bg-slate-950/50 border-slate-900 h-12 rounded-xl focus:ring-primary/20 transition-all",
                                                    !isEditingCategory && "opacity-60 cursor-not-allowed grayscale border-transparent"
                                                )}
                                                value={activeCategory.name}
                                                onChange={(e) => {
                                                    const newName = e.target.value;
                                                    const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                                    setCategories(prev => prev.map(c => c.id === activeCategory.id ? { ...c, name: newName, slug: newSlug } : c));
                                                }}
                                                onBlur={(e) => {
                                                    const newName = e.target.value;
                                                    const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                                    handleUpdateCategory(activeCategory.id, { name: newName, slug: newSlug });
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Slug</Label>
                                            <Input
                                                disabled={!isEditingCategory}
                                                className={cn(
                                                    "bg-slate-950/50 border-slate-900 h-12 rounded-xl focus:ring-primary/20 transition-all",
                                                    !isEditingCategory && "opacity-60 cursor-not-allowed grayscale border-transparent"
                                                )}
                                                value={activeCategory.slug}
                                                onChange={(e) => {
                                                    const newSlug = e.target.value;
                                                    setCategories(prev => prev.map(c => c.id === activeCategory.id ? { ...c, slug: newSlug } : c));
                                                }}
                                                onBlur={(e) => handleUpdateCategory(activeCategory.id, { slug: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Description</Label>
                                            <Textarea
                                                disabled={!isEditingCategory}
                                                className={cn(
                                                    "bg-slate-950/50 border-slate-900 min-h-[80px] rounded-xl focus:ring-primary/20 transition-all",
                                                    !isEditingCategory && "opacity-60 cursor-not-allowed grayscale border-transparent"
                                                )}
                                                value={activeCategory.description ?? ""}
                                                onChange={(e) => {
                                                    const newDesc = e.target.value;
                                                    setCategories(prev => prev.map(c => c.id === activeCategory.id ? { ...c, description: newDesc } : c));
                                                }}
                                                onBlur={(e) => handleUpdateCategory(activeCategory.id, { description: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category Image</Label>
                                            <div className="flex gap-4 items-center p-4 rounded-2xl bg-slate-950/30 border border-slate-900">
                                                <div className="h-20 w-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0">
                                                    {activeCategory.image_url ? (
                                                        <img src={activeCategory.image_url} alt="Category" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-slate-900"><ImageIcon className="h-8 w-8 text-slate-800" /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        disabled={!isEditingCategory}
                                                        className={cn(
                                                            "bg-slate-950 border-slate-900 h-10 text-xs",
                                                            !isEditingCategory && "hidden"
                                                        )}
                                                        onChange={(e) => handleImageSelect(e.target.files?.[0], (b64) => handleUpdateCategory(activeCategory.id, { image_url: b64 }))}
                                                    />
                                                    {!isEditingCategory && <p className="text-[10px] text-primary/50 font-black uppercase tracking-tighter italic">Editing Locked</p>}
                                                    <p className="text-[10px] text-slate-500 font-medium px-1">Upload a high-quality image for this collection.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sub-categories Card */}
                                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 lg:p-8 space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-900/50 pb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Sub-categories</h2>
                                            <p className="text-slate-500 text-xs mt-1">Refine your category with sub-collections.</p>
                                        </div>
                                        <Dialog open={isAddingSubCategory} onOpenChange={setIsAddingSubCategory}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 h-10 px-4 rounded-xl font-bold text-xs uppercase tracking-wider">
                                                    <Plus className="h-4 w-4 mr-2" /> Add Sub-category
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-slate-950 border-slate-900 text-slate-100">
                                                <DialogHeader>
                                                    <DialogTitle>Add Sub-category</DialogTitle>
                                                    <DialogDescription className="text-slate-500">Creating sub-collection for {activeCategory.name}.</DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Name</Label>
                                                        <Input
                                                            className="bg-slate-900/50 border-slate-800"
                                                            placeholder="e.g. Floor Chemicals"
                                                            value={newSubCategory.name}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setNewSubCategory(prev => ({
                                                                    ...prev,
                                                                    name: val,
                                                                    slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                                                                }));
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Slug</Label>
                                                        <Input
                                                            className="bg-slate-900/50 border-slate-800"
                                                            placeholder="floor-chemicals"
                                                            value={newSubCategory.slug}
                                                            onChange={(e) => setNewSubCategory(prev => ({ ...prev, slug: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="ghost" onClick={() => setIsAddingSubCategory(false)}>Cancel</Button>
                                                    <Button onClick={handleAddSubCategory} disabled={isSubmitting || !newSubCategory.name} className="bg-primary text-primary-foreground">
                                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                                        Create Sub-category
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {subCategories.filter(s => s.category_id === activeCategory.id).length === 0 ? (
                                            <div className="col-span-full py-6 text-center text-slate-600 bg-slate-950/20 rounded-2xl border border-dashed border-slate-900">
                                                No sub-categories defined.
                                            </div>
                                        ) : (
                                            subCategories.filter(s => s.category_id === activeCategory.id).map((sub) => (
                                                <div key={sub.id} className="group relative bg-slate-950/50 border border-slate-900 p-4 rounded-xl flex items-center justify-between hover:border-slate-800 transition-colors">
                                                    <div className="flex-1 min-w-0 pr-8">
                                                        <input 
                                                            className="bg-transparent border-none text-sm font-bold text-slate-300 w-full focus:outline-none focus:text-primary"
                                                            value={sub.name}
                                                            onChange={(e) => setSubCategories(prev => prev.map(s => s.id === sub.id ? { ...s, name: e.target.value } : s))}
                                                            onBlur={(e) => handleUpdateSubCategory(sub.id, { name: e.target.value })}
                                                        />
                                                        <p className="text-[10px] text-slate-600 font-mono mt-0.5 truncate">{sub.slug}</p>
                                                    </div>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                                        onClick={() => setItemToDelete({ id: sub.id, type: 'subcategory', name: sub.name })}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Products Card */}
                                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl overflow-hidden">
                                    <div className="p-6 lg:p-8 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/20">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Product Inventory</h2>
                                            <p className="text-slate-500 text-xs mt-1">Items under this category, saved to database.</p>
                                        </div>
                                        <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="bg-primary text-primary-foreground h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/20">
                                                    <Plus className="h-4 w-4 mr-2" /> Add Product
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-slate-950 border-slate-900 text-slate-100 max-w-lg">
                                                <DialogHeader>
                                                    <DialogTitle>Add New Product</DialogTitle>
                                                    <DialogDescription className="text-slate-500">
                                                        Add a product to the <span className="text-primary font-bold">{activeCategory.name}</span> category.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Product Name</Label>
                                                            <Input
                                                                className="bg-slate-900/50 border-slate-800"
                                                                placeholder="e.g. Premium Floor Cleaner"
                                                                value={newProduct.name}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setNewProduct(prev => ({
                                                                        ...prev,
                                                                        name: val,
                                                                        slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                                                                    }));
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Brand (Optional)</Label>
                                                            <BrandSelect 
                                                                value={newProduct.brand}
                                                                onSelect={(val) => setNewProduct(prev => ({ ...prev, brand: val }))}
                                                                availableBrands={availableBrands}
                                                                placeholder="Select brand or add new"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sub-product</Label>
                                                            <Select 
                                                                value={newProduct.sub_category_id ? String(newProduct.sub_category_id) : "none"} 
                                                                onValueChange={(val) => setNewProduct(prev => ({ ...prev, sub_category_id: val === "none" ? null : Number(val) }))}
                                                            >
                                                                <SelectTrigger className="bg-slate-900/50 border-slate-800 h-10">
                                                                    <SelectValue placeholder="Select Sub-product" />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-slate-950 border-slate-800">
                                                                    <SelectItem value="none">None</SelectItem>
                                                                    {subCategories.filter(s => s.category_id === activeCategory.id).map(s => (
                                                                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Slug</Label>
                                                            <Input
                                                                className="bg-slate-900/50 border-slate-800"
                                                                placeholder="premium-floor-cleaner"
                                                                value={newProduct.slug}
                                                                onChange={(e) => setNewProduct(prev => ({ ...prev, slug: e.target.value }))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Is New Arrival?</Label>
                                                            <Select 
                                                                value={newProduct.is_new_arrival ? "yes" : "no"} 
                                                                onValueChange={(val) => setNewProduct(prev => ({ ...prev, is_new_arrival: val === "yes" }))}
                                                            >
                                                                <SelectTrigger className="bg-slate-900/50 border-slate-800 h-10">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-slate-950 border-slate-800">
                                                                    <SelectItem value="yes">Yes, show in New Arrivals</SelectItem>
                                                                    <SelectItem value="no">No</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Is Hot Deal?</Label>
                                                            <Select 
                                                                value={newProduct.is_hot_deal ? "yes" : "no"} 
                                                                onValueChange={(val) => setNewProduct(prev => ({ ...prev, is_hot_deal: val === "yes" }))}
                                                            >
                                                                <SelectTrigger className={cn("bg-slate-900/50 border-slate-800 h-10", newProduct.is_hot_deal && "text-red-500")}>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-slate-950 border-slate-800">
                                                                    <SelectItem value="yes">Yes, show in Hot Deals</SelectItem>
                                                                    <SelectItem value="no">No</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Price ({storeCurrency})</Label>
                                                            <Input
                                                                type="number"
                                                                step="any"
                                                                className="bg-slate-900/50 border-slate-800"
                                                                placeholder="0"
                                                                value={(newProduct.price !== undefined && newProduct.price !== null) ? Number(newProduct.price).toString() : ""}
                                                                onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Discount Price ({storeCurrency})</Label>
                                                            <Input
                                                                type="number"
                                                                step="any"
                                                                className={cn("bg-slate-900/50 border-slate-800", newProduct.is_hot_deal && "border-red-900/50 focus:border-red-500")}
                                                                placeholder="0"
                                                                value={(newProduct.discount_price !== undefined && newProduct.discount_price !== null) ? Number(newProduct.discount_price).toString() : ""}
                                                                onChange={(e) => setNewProduct(prev => ({ ...prev, discount_price: parseFloat(e.target.value) }))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="border-y border-slate-900 py-6 my-2">
                                                        <VariantsEditor 
                                                            variants={newProduct.variants}
                                                            onChange={(variants) => setNewProduct(prev => ({ ...prev, variants }))}
                                                            storeCurrency={storeCurrency}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description</Label>
                                                        <Textarea
                                                            className="bg-slate-900/50 border-slate-800"
                                                            placeholder="Product description and details..."
                                                            value={newProduct.description}
                                                            onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Main Product Image</Label>
                                                        <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50">
                                                            {newProduct.image_url ? (
                                                                <div className="relative aspect-square w-32 mx-auto rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                                                                    <img src={newProduct.image_url} className="w-full h-full object-cover" alt="Preview" />
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="absolute inset-0 w-full h-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                                                                        onClick={() => setNewProduct(prev => ({ ...prev, image_url: "" }))}
                                                                    >
                                                                        <Trash2 className="h-6 w-6 text-white" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="aspect-square w-32 mx-auto rounded-xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-2">
                                                                    <ImageIcon className="h-6 w-6 opacity-20" />
                                                                </div>
                                                            )}
                                                            <Input type="file" accept="image/*" className="bg-slate-900 border-slate-800 h-10 text-xs"
                                                                onChange={(e) => handleImageSelect(e.target.files?.[0], (b64) => setNewProduct(prev => ({ ...prev, image_url: b64 })))}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gallery Image 2</Label>
                                                            <div className="space-y-3 p-3 rounded-xl bg-slate-900/30 border border-slate-800/50">
                                                                {newProduct.image_url_2 && (
                                                                    <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-800">
                                                                        <img src={newProduct.image_url_2} className="w-full h-full object-cover" />
                                                                        <button onClick={() => setNewProduct(prev => ({ ...prev, image_url_2: "" }))} className="absolute top-1 right-1 p-1 bg-black/60 rounded text-red-400"><Trash2 className="h-3 w-3" /></button>
                                                                    </div>
                                                                )}
                                                                <Input type="file" accept="image/*" className="h-8 text-[10px] bg-slate-900 border-slate-800"
                                                                    onChange={(e) => handleImageSelect(e.target.files?.[0], (b64) => setNewProduct(prev => ({ ...prev, image_url_2: b64 })))}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gallery Image 3</Label>
                                                            <div className="space-y-3 p-3 rounded-xl bg-slate-900/30 border border-slate-800/50">
                                                                {newProduct.image_url_3 && (
                                                                    <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-800">
                                                                        <img src={newProduct.image_url_3} className="w-full h-full object-cover" />
                                                                        <button onClick={() => setNewProduct(prev => ({ ...prev, image_url_3: "" }))} className="absolute top-1 right-1 p-1 bg-black/60 rounded text-red-400"><Trash2 className="h-3 w-3" /></button>
                                                                    </div>
                                                                )}
                                                                <Input type="file" accept="image/*" className="h-8 text-[10px] bg-slate-900 border-slate-800"
                                                                    onChange={(e) => handleImageSelect(e.target.files?.[0], (b64) => setNewProduct(prev => ({ ...prev, image_url_3: b64 })))}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <DialogFooter className="mt-4">
                                                    <Button variant="ghost" onClick={() => setIsAddingProduct(false)} className="text-slate-400">Cancel</Button>
                                                    <Button
                                                        onClick={handleAddProduct}
                                                        disabled={isSubmitting || !newProduct.name}
                                                        className="bg-primary text-primary-foreground font-bold"
                                                    >
                                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                                        Save Product
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="p-6 lg:p-8 space-y-6">
                                        {activeCategoryProducts.length === 0 ? (
                                            <div className="text-center py-20 bg-slate-950/30 rounded-2xl border-2 border-dashed border-slate-900">
                                                <Package className="h-12 w-12 text-slate-900 mx-auto mb-4" />
                                                <p className="text-slate-600 font-medium">No products in this category.</p>
                                            </div>
                                        ) : (
                                            activeCategoryProducts.map((p) => (
                                                <ProductItem
                                                    key={p.id}
                                                    product={p}
                                                    subCategories={subCategories.filter(s => s.category_id === activeCategory.id)}
                                                    onUpdate={(patch) => handleUpdateProduct(p.id, patch)}
                                                    onRemove={() => setItemToDelete({ id: p.id, type: 'product', name: p.name })}
                                                    handleImageSelect={handleImageSelect}
                                                    storeCurrency={storeCurrency}
                                                    availableBrands={availableBrands}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-[500px] flex flex-col items-center justify-center text-slate-700 bg-slate-900/20 rounded-3xl border border-slate-900 border-dashed">
                                <Package className="h-16 w-16 opacity-10 mb-6" />
                                <p className="font-bold text-lg">No Categories Yet</p>
                                <p className="text-sm text-slate-600 mt-1">Click + to add your first category.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <DeleteConfirmDialog
                item={itemToDelete}
                onOpenChange={(open) => !open && setItemToDelete(null)}
                onConfirm={(id, type) => {
                    if (type === 'category') handleDeleteCategory(id);
                    else if (type === 'subcategory') handleDeleteSubCategory(id);
                    else handleDeleteProduct(id);
                    setItemToDelete(null);
                }}
            />
        </AdminLayout>
    );
};

const DeleteConfirmDialog = ({
    item,
    onOpenChange,
    onConfirm
}: {
    item: { id: number, type: 'category' | 'subcategory' | 'product', name: string } | null,
    onOpenChange: (open: boolean) => void,
    onConfirm: (id: number, type: 'category' | 'subcategory' | 'product') => void
}) => {
    return (
        <AlertDialog open={!!item} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-slate-950 border-slate-900 text-slate-100 max-w-md rounded-[2rem]">
                <AlertDialogHeader>
                    <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                    <AlertDialogTitle className="text-xl font-display font-black">Confirm Deletion</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 text-sm leading-relaxed">
                        Are you sure you want to delete <span className="text-white font-bold">"{item?.name}"</span>?
                        {item?.type === 'category' && " This will also permanently remove all products in this category."}
                        {item?.type === 'subcategory' && " This item will be removed from all products."}
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 gap-3">
                    <AlertDialogCancel className="bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white h-11 px-6 rounded-xl font-bold">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => item && onConfirm(item.id, item.type)}
                        className="bg-red-500 hover:bg-red-600 text-white border-none h-11 px-6 rounded-xl font-bold shadow-lg shadow-red-500/20"
                    >
                        Delete Permanently
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};


// ----------- ProductItem sub-component -----------

const ProductItem = ({
    product: p,
    subCategories: subCats,
    onUpdate,
    onRemove,
    handleImageSelect,
    storeCurrency,
    availableBrands,
}: {
    product: ApiProduct;
    subCategories: ApiSubCategory[];
    onUpdate: (patch: Partial<ApiProduct>) => void;
    onRemove: () => void;
    handleImageSelect: (file: File | undefined, callback: (b64: string) => void) => void;
    storeCurrency: string;
    availableBrands: string[];
}) => {
    const [currency, setCurrency] = useState(storeCurrency);
    const [draft, setDraft] = useState(p);
    const [isEditing, setIsEditing] = useState(false);
    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setDraft(p);
    }, [p]);

    return (
        <div id={`product-${p.id}`} className={cn(
            "p-6 rounded-2xl border transition-all scroll-mt-20",
            isEditing
                ? "bg-slate-900 border-primary/50 shadow-2xl shadow-primary/10 ring-1 ring-primary/20"
                : "border-slate-900 bg-slate-950/30 hover:bg-slate-900/40 hover:border-slate-800"
        )}>
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Primary Image */}
                <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0">
                    {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center"><Package className="h-10 w-10 text-slate-800" /></div>
                    )}
                    {isEditing && (
                        <>
                            <Label htmlFor={`img1-${p.id}`} className="absolute inset-0 bg-primary/80 flex items-center justify-center cursor-pointer transition-opacity">
                                <Download className="h-6 w-6 text-white rotate-180" />
                            </Label>
                            <Input id={`img1-${p.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e.target.files?.[0], (b64) => onUpdate({ image_url: b64 }))} />
                        </>
                    )}
                </div>

                <div className="flex-1 space-y-4">
                    {/* Name row, Price & Slug */}
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1 flex flex-col">
                                <input
                                    ref={nameRef}
                                    disabled={!isEditing}
                                    value={draft.name}
                                    onChange={(e) => {
                                        const newName = e.target.value;
                                        const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                        setDraft(prev => ({ ...prev, name: newName, slug: newSlug }));
                                    }}
                                    onBlur={(e) => {
                                        const newName = e.target.value;
                                        if (newName !== p.name) {
                                            const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                            onUpdate({ name: newName, slug: newSlug });
                                        }
                                    }}
                                    placeholder="Product Name"
                                    className={cn(
                                        "font-bold h-10 text-xl border-none bg-transparent p-0 focus:outline-none w-full text-white placeholder:text-slate-800 transition-all",
                                        !isEditing && "opacity-60 cursor-not-allowed"
                                    )}
                                />
                                <BrandSelect 
                                    value={draft.brand ?? ""}
                                    onSelect={(val) => {
                                        setDraft(prev => ({ ...prev, brand: val }));
                                        if (val !== p?.brand) onUpdate({ brand: val });
                                    }}
                                    availableBrands={availableBrands}
                                    isEditing={isEditing}
                                    variant="subtle"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={isEditing ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={cn(
                                        "h-10 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all",
                                        isEditing
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-slate-900 border-slate-800 text-slate-500 hover:text-primary hover:border-primary/50"
                                    )}
                                >
                                    {isEditing ? <><X className="h-3.5 w-3.5 mr-2" /> Done</> : <><Plus className="h-3.5 w-3.5 mr-2" /> Edit Item</>}
                                </Button>
                                <div className={cn(
                                    "relative flex items-center bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden transition-all",
                                    !isEditing && "opacity-40 grayscale"
                                )}>
                                    <Select value={currency} onValueChange={setCurrency} disabled={!isEditing}>
                                        <SelectTrigger className="h-10 w-16 bg-transparent border-none text-[10px] font-bold text-primary focus:ring-0 px-2 shrink-0">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-950 border-slate-800">
                                            {CURRENCIES.map(c => (
                                                <SelectItem key={c.code} value={c.code} className="text-slate-300 focus:bg-primary focus:text-white">{c.symbol}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="w-[1px] h-4 bg-slate-800 shrink-0" />
                                    <input
                                        disabled={!isEditing}
                                        type="number"
                                        step="any"
                                        value={(draft.price !== undefined && draft.price !== null) ? Number(draft.price).toString() : ""}
                                        onChange={(e) => {
                                            const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                            setDraft(prev => ({ ...prev, price: isNaN(val) ? 0 : val }));
                                        }}
                                        onBlur={(e) => { 
                                            const v = e.target.value === "" ? 0 : parseFloat(e.target.value); 
                                            if (!isNaN(v) && v !== p.price) onUpdate({ price: v }); 
                                        }}
                                        placeholder="0"
                                        className={cn(
                                            "h-10 w-20 border-none bg-transparent rounded-none text-primary font-bold text-sm focus:outline-none px-2",
                                            (p.is_hot_deal && p.discount_price) && "text-slate-500 line-through decoration-slate-400"
                                        )}
                                    />
                                    {(p.is_hot_deal || isEditing) && (
                                        <>
                                            <div className="w-[1px] h-4 bg-slate-800 shrink-0" />
                                            <div className="flex items-center bg-red-950/20 px-2 group-hover:bg-red-950/40 transition-colors">
                                                <span className="text-[10px] font-black text-red-500 mr-1">$</span>
                                                <input
                                                    disabled={!isEditing}
                                                    type="number"
                                                    step="any"
                                                    value={(draft.discount_price !== undefined && draft.discount_price !== null) ? Number(draft.discount_price).toString() : ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                                        setDraft(prev => ({ ...prev, discount_price: isNaN(val) ? 0 : val }));
                                                    }}
                                                    onBlur={(e) => { 
                                                        const v = e.target.value === "" ? 0 : parseFloat(e.target.value); 
                                                        if (!isNaN(v) && v !== p.discount_price) onUpdate({ discount_price: v }); 
                                                    }}
                                                    placeholder="0"
                                                    className="h-10 w-20 border-none bg-transparent rounded-none text-red-500 font-bold text-sm focus:outline-none"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl shrink-0" onClick={onRemove}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 px-1">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Sub-Product:</span>
                                <Select 
                                    disabled={!isEditing} 
                                    value={draft.sub_category_id ? String(draft.sub_category_id) : "none"} 
                                    onValueChange={(val) => {
                                        const subId = val === "none" ? null : Number(val);
                                        setDraft(prev => ({ ...prev, sub_category_id: subId }));
                                        onUpdate({ sub_category_id: subId });
                                    }}
                                >
                                    <SelectTrigger className="h-8 bg-slate-900 border-slate-800 text-[10px] font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-950 border-slate-800">
                                        <SelectItem value="none">None</SelectItem>
                                        {subCats.map(s => (
                                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Hot Deal:</span>
                                <Select 
                                    disabled={!isEditing} 
                                    value={draft.is_hot_deal ? "yes" : "no"} 
                                    onValueChange={(val) => {
                                        const isHot = val === "yes";
                                        setDraft(prev => ({ ...prev, is_hot_deal: isHot }));
                                        onUpdate({ is_hot_deal: isHot });
                                    }}
                                >
                                    <SelectTrigger className={cn("h-8 bg-slate-900 border-slate-800 text-[10px] font-bold", draft.is_hot_deal && "text-red-500 border-red-900/50")}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-950 border-slate-800">
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">New Arrival:</span>
                                <Select 
                                    disabled={!isEditing} 
                                    value={draft.is_new_arrival ? "yes" : "no"} 
                                    onValueChange={(val) => {
                                        const isNew = val === "yes";
                                        setDraft(prev => ({ ...prev, is_new_arrival: isNew }));
                                        onUpdate({ is_new_arrival: isNew });
                                    }}
                                >
                                    <SelectTrigger className="h-8 bg-slate-900 border-slate-800 text-[10px] font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-950 border-slate-800">
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Slug:</span>
                                <input
                                    disabled={!isEditing}
                                    value={draft.slug ?? ""}
                                    onChange={(e) => setDraft(prev => ({ ...prev, slug: e.target.value }))}
                                    onBlur={(e) => {
                                        const newSlug = e.target.value;
                                        if (newSlug !== p.slug) onUpdate({ slug: newSlug });
                                    }}
                                    placeholder="product-slug"
                                    className={cn(
                                        "h-8 text-[11px] font-mono text-slate-500 bg-slate-900 border border-slate-800 rounded px-2 focus:outline-none focus:text-primary transition-colors hover:text-slate-400 w-full",
                                        !isEditing && "opacity-40"
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                        <div className="border-t border-slate-900 pt-6 mt-2">
                            <VariantsEditor 
                                variants={draft.variants || []}
                                isEditing={isEditing}
                                onChange={(variants) => {
                                    setDraft(prev => ({ ...prev, variants }));
                                    onUpdate({ variants });
                                }}
                                storeCurrency={currency}
                            />
                        </div>

                        {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Description</Label>
                        <Textarea
                            disabled={!isEditing}
                            value={draft.description ?? ""}
                            onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))}
                            onBlur={(e) => { if (e.target.value !== p.description) onUpdate({ description: e.target.value }); }}
                            placeholder="Product description..."
                            className={cn(
                                "bg-slate-900/50 border-slate-800 rounded-xl text-xs text-slate-400 min-h-[80px] focus:ring-primary/20 transition-all",
                                !isEditing && "opacity-40 grayscale border-transparent cursor-not-allowed"
                            )}
                        />
                    </div>

                    {/* Gallery Images */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Gallery Images</Label>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Image 2 */}
                            <div className="group/it relative h-14 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden flex items-center p-2 gap-3 hover:border-slate-700 transition-colors">
                                <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                                    {p.image_url_2 ? <img src={p.image_url_2} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center opacity-20"><ImageIcon className="h-5 w-5" /></div>}
                                </div>
                                <div className="flex-1 flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        disabled={!isEditing}
                                        className={cn(
                                            "h-8 text-[10px] bg-slate-950 border-slate-800 file:bg-slate-800 file:text-slate-300 file:border-0 file:rounded-md file:mr-2",
                                            !isEditing && "hidden"
                                        )}
                                        onChange={(e) => handleImageSelect(e.target.files?.[0], (b64) => onUpdate({ image_url_2: b64 }))}
                                    />
                                    {!isEditing && <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest italic">Locked</p>}
                                    {isEditing && p.image_url_2 && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg" onClick={() => onUpdate({ image_url_2: null })}>
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {/* Image 3 */}
                            <div className="group/it relative h-14 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden flex items-center p-2 gap-3 hover:border-slate-700 transition-colors">
                                <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                                    {p.image_url_3 ? <img src={p.image_url_3} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center opacity-20"><ImageIcon className="h-5 w-5" /></div>}
                                </div>
                                <div className="flex-1 flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        disabled={!isEditing}
                                        className={cn(
                                            "h-8 text-[10px] bg-slate-950 border-slate-800 file:bg-slate-800 file:text-slate-300 file:border-0 file:rounded-md file:mr-2",
                                            !isEditing && "hidden"
                                        )}
                                        onChange={(e) => handleImageSelect(e.target.files?.[0], (b64) => onUpdate({ image_url_3: b64 }))}
                                    />
                                    {!isEditing && <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest italic">Locked</p>}
                                    {isEditing && p.image_url_3 && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg" onClick={() => onUpdate({ image_url_3: null })}>
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Brand Selection UI ---
const BrandSelect = ({ 
    value, 
    onSelect, 
    availableBrands, 
    isEditing = true, 
    className,
    placeholder = "Select Brand",
    variant = "default"
}: { 
    value: string, 
    onSelect: (val: string) => void, 
    availableBrands: string[], 
    isEditing?: boolean,
    className?: string,
    placeholder?: string,
    variant?: "default" | "subtle"
}) => {
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [tempValue, setTempValue] = useState("");

    // Detect if we should be in "adding new" mode initially
    useEffect(() => {
        if (value && !availableBrands.includes(value)) {
            setIsAddingNew(true);
            setTempValue(value);
        } else if (!value) {
            setIsAddingNew(false);
            setTempValue("");
        }
    }, [value, availableBrands]);

    if (isAddingNew && isEditing) {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <input 
                    placeholder="Enter brand name"
                    value={tempValue}
                    onChange={(e) => {
                        setTempValue(e.target.value);
                        onSelect(e.target.value);
                    }}
                    autoFocus
                    className={cn(
                        "bg-transparent border-none p-0 focus:outline-none",
                        variant === "subtle" ? "text-[10px] font-bold uppercase tracking-widest text-primary h-6" : "bg-slate-900/50 border-slate-800 h-10 text-sm px-3 rounded-md w-full text-white"
                    )}
                />
                <button 
                    type="button"
                    className="text-slate-500 hover:text-white shrink-0"
                    onClick={() => {
                        setIsAddingNew(false);
                        setTempValue("");
                        onSelect("");
                    }}
                >
                    <X className="h-3 w-3" />
                </button>
            </div>
        );
    }

    if (!isEditing && variant === "subtle") {
        return <span className={cn("h-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 opacity-40 p-0 flex items-center", className)}>{value || "No Brand"}</span>;
    }

    return (
        <Select 
            disabled={!isEditing}
            value={isAddingNew ? "other" : (value || "none")} 
            onValueChange={(val) => {
                if (val === "other") {
                    setIsAddingNew(true);
                } else {
                    onSelect(val === "none" ? "" : val);
                }
            }}
        >
            <SelectTrigger className={cn(
                variant === "subtle" 
                    ? "h-6 border-none bg-transparent p-0 flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest focus:ring-0 w-auto" 
                    : "bg-slate-900/50 border-slate-800 h-10 text-sm text-white",
                !isEditing && variant === "subtle" && "opacity-40",
                className
            )}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800">
                <SelectItem value="none" className="text-xs uppercase tracking-widest text-slate-400">No Brand</SelectItem>
                {availableBrands.map(b => (
                    <SelectItem key={b} value={b} className="text-xs uppercase tracking-widest text-slate-200">{b}</SelectItem>
                ))}
                <SelectItem value="other" className="text-xs font-bold uppercase tracking-widest text-primary border-t border-slate-800 mt-1">Other (New Brand)...</SelectItem>
            </SelectContent>
        </Select>
    );
};

// --- Variants Editor ---
const VariantsEditor = ({ 
    variants, 
    onChange, 
    isEditing = true,
    storeCurrency 
}: { 
    variants: any[], 
    onChange: (variants: any[]) => void, 
    isEditing?: boolean,
    storeCurrency: string
}) => {
    const addVariant = () => {
        onChange([...variants, { name: "", price: 0, discount_price: null }]);
    };

    const removeVariant = (index: number) => {
        onChange(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, patch: any) => {
        onChange(variants.map((v, i) => i === index ? { ...v, ...patch } : v));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Options / Sizes / Variants</Label>
                {isEditing && (
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addVariant}
                        className="h-7 text-[10px] border-slate-800 bg-slate-900/50 hover:bg-primary/10 hover:border-primary/50 text-slate-400 hover:text-primary rounded-lg font-bold uppercase tracking-widest"
                    >
                        <Plus className="h-3 w-3 mr-1" /> Add Option
                    </Button>
                )}
            </div>

            {variants.length === 0 ? (
                <div className="text-[10px] text-slate-600 italic border border-dashed border-slate-800 rounded-xl p-4 text-center">
                    No individual options defined. This product will use its base price.
                </div>
            ) : (
                <div className="space-y-3">
                    {variants.map((v, idx) => (
                        <div key={idx} className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-3 relative group">
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => removeVariant(idx)}
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 hover:text-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                            <div className="grid grid-cols-12 gap-3">
                                <div className="col-span-8 space-y-1">
                                    <Label className="text-[9px] uppercase font-bold text-slate-600">Option Name</Label>
                                    <Input
                                        disabled={!isEditing}
                                        placeholder="e.g. 500ml, 1 Litre, Large"
                                        value={v.name}
                                        onChange={(e) => updateVariant(idx, { name: e.target.value })}
                                        className="h-8 text-xs bg-slate-950 border-slate-800"
                                    />
                                </div>
                                <div className="col-span-4 space-y-1">
                                    <Label className="text-[9px] uppercase font-bold text-slate-600">Price ({storeCurrency})</Label>
                                    <Input
                                        disabled={!isEditing}
                                        type="number"
                                        step="any"
                                        placeholder="0"
                                        value={(v.price !== undefined && v.price !== null) ? Number(v.price).toString() : ""}
                                        onChange={(e) => {
                                            const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                            updateVariant(idx, { price: isNaN(val) ? 0 : val });
                                        }}
                                        className="h-8 text-xs bg-slate-950 border-slate-800"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCatalogPro;
