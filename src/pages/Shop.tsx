import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, LayoutGrid, List, X, ExternalLink, Filter, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCatalogApi } from "@/hooks/useCatalogApi";
import { ApiCategory, ApiProduct } from "@/lib/api";

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("name-asc");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [gridCols, setGridCols] = useState<3 | 4>(3);

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<number | null>(null);
  const [allCategoriesSelected, setAllCategoriesSelected] = useState(false);
  const [showArrivalsOnly, setShowArrivalsOnly] = useState(searchParams.get("arrivals") === "true");
  const [showHotOnly, setShowHotOnly] = useState(searchParams.get("hot") === "true");
  const [showBrandsOnly, setShowBrandsOnly] = useState(searchParams.get("brands") === "true");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(searchParams.get("brand"));
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [leftCollapsedManual, setLeftCollapsedManual] = useState<boolean | null>(null);
  const [showArrivalsEnabled, setShowArrivalsEnabled] = useState(true);
  const [showHotEnabled, setShowHotEnabled] = useState(true);
  const [showBrandsEnabled, setShowBrandsEnabled] = useState(true);
  const [brandsExpanded, setBrandsExpanded] = useState(false);

  const SETTINGS_KEYS = {
    arrivals: "shop_show_new_arrivals",
    hotDeals: "shop_show_hot_deals",
    brands: "shop_show_brands",
  };
  
  const { categories, subCategories: allSubCategories, products: activeCategoryProducts, isLoading: catalogLoading } = useCatalogApi({ 
    category_id: (showArrivalsOnly || showHotOnly || showBrandsOnly) ? null : activeCategoryId,
    sub_category_id: (showArrivalsOnly || showHotOnly || showBrandsOnly) ? null : activeSubcategoryId,
    is_new_arrival: showArrivalsOnly || undefined,
    is_hot_deal: showHotOnly || undefined,
    brand: selectedBrand || undefined
  });

  const handleCategoryChange = (categoryId: number | null) => {
    setActiveCategoryId(categoryId);
    setActiveSubcategoryId(null);
    setAllCategoriesSelected(categoryId === null);
    setShowArrivalsOnly(false);
    setShowHotOnly(false);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("arrivals");
      next.delete("hot");
      next.delete("brands");
      next.delete("brand");
      if (categoryId === null) {
        next.delete("cat");
      } else {
        const cat = categories.find(c => c.id === categoryId);
        if (cat) {
          next.set("cat", cat.slug || String(cat.id));
        }
      }
      return next;
    }, { replace: true });
  };

  const handleSubcategoryChange = (subId: number | null) => {
    setActiveSubcategoryId(subId);
    setShowArrivalsOnly(false);
    setShowHotOnly(false);
    setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete("arrivals");
        next.delete("hot");
        next.delete("brands");
        next.delete("brand");
        return next;
    });
  };

  const handleArrivalsToggle = () => {
    if (!showArrivalsEnabled) return;
    setShowArrivalsOnly(true);
    setShowHotOnly(false);
    setActiveCategoryId(null);
    setActiveSubcategoryId(null);
    setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set("arrivals", "true");
        next.delete("hot");
        next.delete("cat");
        return next;
    });
  };

  const handleHotToggle = () => {
    if (!showHotEnabled) return;
    setShowHotOnly(true);
    setShowArrivalsOnly(false);
    setShowBrandsOnly(false);
    setActiveCategoryId(null);
    setActiveSubcategoryId(null);
    setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set("hot", "true");
        next.delete("arrivals");
        next.delete("brands");
        next.delete("brand");
        next.delete("cat");
        return next;
    });
  };

  const handleBrandsToggle = () => {
    if (!showBrandsEnabled) return;
    setShowBrandsOnly(true);
    setShowArrivalsOnly(false);
    setShowHotOnly(false);
    setSelectedBrand(null);
    setActiveCategoryId(null);
    setActiveSubcategoryId(null);
    setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set("brands", "true");
        next.delete("arrivals");
        next.delete("hot");
        next.delete("brand");
        next.delete("cat");
        return next;
    });
  };

  const handleBrandSelect = (brand: string | null) => {
    setSelectedBrand(brand);
    setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (brand) next.set("brand", brand);
        else next.delete("brand");
        return next;
    });
  };

  useEffect(() => {
    if (activeCategoryId === null && !allCategoriesSelected && categories[0]?.id) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId, allCategoriesSelected]);

  useEffect(() => {
    const readToggle = (key: string, fallback = true) => {
      const value = localStorage.getItem(key);
      if (value === null) return fallback;
      return value === "true";
    };
    const load = () => {
      setShowArrivalsEnabled(readToggle(SETTINGS_KEYS.arrivals, true));
      setShowHotEnabled(readToggle(SETTINGS_KEYS.hotDeals, true));
      setShowBrandsEnabled(readToggle(SETTINGS_KEYS.brands, true));
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (Object.values(SETTINGS_KEYS).includes(e.key)) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!showArrivalsEnabled && showArrivalsOnly) {
      setShowArrivalsOnly(false);
    }
    if (!showHotEnabled && showHotOnly) {
      setShowHotOnly(false);
    }
    if (!showBrandsEnabled && showBrandsOnly) {
      setShowBrandsOnly(false);
      setSelectedBrand(null);
    }
  }, [showArrivalsEnabled, showHotEnabled, showBrandsEnabled, showArrivalsOnly, showHotOnly, showBrandsOnly]);

  const activeCategory = useMemo(() => categories.find((c) => c.id === activeCategoryId) ?? categories[0], [activeCategoryId, categories]);

  const subcategories = useMemo(() => {
    if (!activeCategoryId || allCategoriesSelected) return [];
    return allSubCategories.filter(s => s.category_id === activeCategoryId);
  }, [allSubCategories, activeCategoryId, allCategoriesSelected]);

  const subPanelOpen = subcategories.length > 0 && !showArrivalsOnly && !showHotOnly && !showBrandsOnly;
  const leftCollapsed = leftCollapsedManual ?? subPanelOpen;
  const desktopCols = subPanelOpen ? (leftCollapsed ? 4 : 3) : 4;

  useEffect(() => {
    if (!subPanelOpen) {
      setLeftCollapsedManual(null);
    }
  }, [subPanelOpen]);

  const activeSubcategory = useMemo(() => {
    if (activeSubcategoryId === null) return null;
    return subcategories.find(s => s.id === activeSubcategoryId);
  }, [activeSubcategoryId, subcategories]);

  // Extract unique brands from all products (we might need a separate API call for this eventually, but for now we filter from local products if we have them or let the user see them when they browse)
  // For the "Shop By Brand" sidebar, we should ideally have a list of all brands.
  const { products: allProductsForBrands } = useCatalogApi({}); // Fetch all for brand list
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    allProductsForBrands.forEach(prod => {
        if (prod?.brand) brands.add(prod.brand);
    });
    return Array.from(brands).sort();
  }, [allProductsForBrands]);

  const visibleBrands = brandsExpanded ? availableBrands : availableBrands.slice(0, 10);

  // Combine and filter everything
  const unifiedItems = useMemo(() => {
    // If we have an active category but we are in "New Arrivals" mode, we should show all products filtered by new arrival
    // The useCatalogApi handles the fetching based on those params anyway.
    
    // Filter products from Catalog
    return activeCategoryProducts
      .filter((p) => {
        const matchesSearch = !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.description?.toLowerCase() || "").includes(search.toLowerCase());
          
        const price = p.price ?? 0;
        const matchesMinPrice = minPrice === "" || price >= parseFloat(minPrice);
        const matchesMaxPrice = maxPrice === "" || price <= parseFloat(maxPrice);
        
        return matchesSearch && matchesMinPrice && matchesMaxPrice;
      })
      .map(p => ({ 
        type: 'catalog' as const, 
        data: p, 
        id: String(p.id), 
        name: p.name, 
        price: p.price ?? 0 
      }))
      .sort((a, b) => {
        switch (sort) {
          case "name-desc": return b.name.localeCompare(a.name);
          case "price-asc": return a.price - b.price;
          case "price-desc": return b.price - a.price;
          default: return a.name.localeCompare(b.name);
        }
      });
  }, [activeCategory, activeCategoryProducts, search, sort]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    const arrivals = searchParams.get("arrivals") === "true";
    if (arrivals !== showArrivalsOnly) {
        setShowArrivalsOnly(arrivals);
        if (arrivals) {
            setActiveCategoryId(null);
            setActiveSubcategoryId(null);
            setShowHotOnly(false);
        }
    }

    const hot = searchParams.get("hot") === "true";
    if (hot !== showHotOnly) {
        setShowHotOnly(hot);
        if (hot) {
            setActiveCategoryId(null);
            setActiveSubcategoryId(null);
            setShowArrivalsOnly(false);
            setShowBrandsOnly(false);
        }
    }

    const brands = searchParams.get("brands") === "true";
    if (brands !== showBrandsOnly) {
        setShowBrandsOnly(brands);
        if (brands) {
            setActiveCategoryId(null);
            setActiveSubcategoryId(null);
            setShowArrivalsOnly(false);
            setShowHotOnly(false);
        }
    }

    const brand = searchParams.get("brand");
    if (brand !== selectedBrand) {
        setSelectedBrand(brand);
    }

    const cat = searchParams.get("cat");
    if (!cat) return;
    const match = categories.find((c) => c.slug === cat) || categories.find((c) => String(c.id) === cat);
    if (match && match.id !== activeCategoryId) {
      setActiveCategoryId(match.id);
      setActiveSubcategoryId(null);
      setShowArrivalsOnly(false);
      setShowHotOnly(false);
      setShowBrandsOnly(false);
    }
  }, [categories, searchParams, activeCategoryId, showArrivalsOnly, showHotOnly, showBrandsOnly, selectedBrand]);

  const clearFilters = () => {
    setSearch("");
    setSort("name-asc");
    setActiveSubcategoryId(null);
    setMinPrice("");
    setMaxPrice("");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("q");
      return next;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Simplified Hero Section */}
      <section className="bg-primary py-10 lg:py-14 border-b border-white/5">
        <div className="container px-4">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <h1 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground tracking-tight">
              {showHotOnly ? "Hot Deals" : showArrivalsOnly ? "New Arrivals" : showBrandsOnly ? "Shop By Brand" : activeCategoryId === null ? "All Products" : "Our Professional Catalog"}
            </h1>
            <p className="text-primary-foreground/70 text-sm md:text-base max-w-md mx-auto">
              {showHotOnly 
                ? "Don't miss out on our best prices and limited-time discounts."
                : showArrivalsOnly 
                ? "Discover our latest cleaning solutions and professional equipment." 
                : "Browse our complete range of commercial and domestic cleaning supplies."}
            </p>

            <div className="pt-4" />
          </div>
        </div>
      </section>

      <main className="flex-1 py-12 bg-background">
        <div className="container px-4">
          <div className={cn(
            "grid gap-10",
            subPanelOpen
              ? leftCollapsed
                ? "lg:grid-cols-[0px_220px_1fr]"
                : "lg:grid-cols-[250px_220px_1fr]"
              : showBrandsOnly
                ? "lg:grid-cols-[250px_220px_1fr]"
                : "lg:grid-cols-[250px_1fr]"
          )}>
            {/* Cleaner Sidebar Navigation */}
            <aside className={cn(
              "space-y-8 hidden lg:block transition-all duration-300",
              leftCollapsed && "opacity-0 w-0 overflow-hidden pointer-events-none"
            )}>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] pb-2 border-b border-border">
                  Collections
                  {subPanelOpen && (
                    <button
                      type="button"
                      onClick={() => setLeftCollapsedManual((prev) => {
                        const next = !(prev ?? subPanelOpen);
                        return next;
                      })}
                      className="text-[10px] font-black tracking-[0.2em] text-primary hover:underline"
                    >
                      {leftCollapsed ? "SEE ALL PRODUCTS" : "SHOW LESS"}
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">Categories</div>
                  <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto] gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-muted/40 border-b border-border">
                      <span>Category</span>
                      <span>Action</span>
                    </div>
                    <div className="divide-y divide-border">
                      <button
                        onClick={() => handleCategoryChange(null)}
                        className={cn(
                          "w-full text-left px-4 py-3 text-sm transition-all grid grid-cols-[1fr_auto] items-center gap-2",
                          activeCategoryId === null && !showArrivalsOnly && !showHotOnly
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-foreground hover:bg-muted/60"
                        )}
                      >
                        <span>All Categories</span>
                        <ArrowRight className={cn("h-4 w-4", activeCategoryId === null && !showArrivalsOnly && !showHotOnly ? "opacity-100" : "opacity-40")} />
                      </button>
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleCategoryChange(c.id)}
                          className={cn(
                            "w-full text-left px-4 py-3 text-sm transition-all grid grid-cols-[1fr_auto] items-center gap-2",
                            c.id === activeCategoryId
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-foreground hover:bg-muted/60"
                          )}
                        >
                          <span>{c.name}</span>
                          <ArrowRight className={cn("h-4 w-4", c.id === activeCategoryId ? "opacity-100" : "opacity-40")} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-4" />
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">Collections</div>

                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                      activeCategoryId === null && !showArrivalsOnly && !showHotOnly
                        ? "bg-primary text-primary-foreground font-bold shadow-sm"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <span>All Products</span>
                    {activeCategoryId === null && !showArrivalsOnly && !showHotOnly && <ArrowRight className="h-4 w-4" />}
                  </button>

                  {showArrivalsEnabled && (
                    <button
                      onClick={handleArrivalsToggle}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                        showArrivalsOnly
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                          <Badge className="bg-amber-500/20 text-amber-600 border-none text-[9px] h-4">NEW</Badge>
                          <span>New Arrivals</span>
                      </div>
                      {showArrivalsOnly && <ArrowRight className="h-4 w-4" />}
                    </button>
                  )}

                  {showHotEnabled && (
                    <button
                      onClick={handleHotToggle}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                        showHotOnly
                          ? "bg-red-600 text-white font-bold shadow-sm"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                          <Badge className="bg-red-500/20 text-red-600 border-none text-[9px] h-4">HOT</Badge>
                          <span>Hot Deals</span>
                      </div>
                      {showHotOnly && <ArrowRight className="h-4 w-4" />}
                    </button>
                  )}

                  {showBrandsEnabled && (
                    <button
                      onClick={handleBrandsToggle}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                        showBrandsOnly
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-400" />
                          <span>Shop By Brand</span>
                      </div>
                      {showBrandsOnly && <ArrowRight className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>

            </aside>

            {/* Brand Sidebar (Opens when Shop By Brand is active) */}
            {showBrandsOnly && showBrandsEnabled && (
              <aside className="space-y-8 hidden lg:block animate-in fade-in slide-in-from-left-2 duration-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] pb-2 border-b border-border">
                    <span>Available Brands</span>
                    {availableBrands.length > 10 && (
                      <button
                        type="button"
                        onClick={() => setBrandsExpanded((v) => !v)}
                        className="text-[10px] font-black tracking-[0.2em] text-primary hover:underline"
                      >
                        {brandsExpanded ? "SHOW LESS" : "SHOW MORE"}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleBrandSelect(null)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                        selectedBrand === null
                          ? "bg-muted text-primary font-bold"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      All Brands
                    </button>
                    {visibleBrands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => handleBrandSelect(brand)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                          selectedBrand === brand
                            ? "bg-muted text-primary font-bold"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            )}

            {/* Subcategories Sidebar (Opens in Right of Category) */}
            {(subcategories.length > 0 && !showArrivalsOnly && !showHotOnly && !showBrandsOnly) && (
              <aside className="space-y-8 hidden lg:block animate-in fade-in slide-in-from-left-2 duration-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (leftCollapsed) {
                          setLeftCollapsedManual(false);
                          handleSubcategoryChange(null);
                        } else {
                          setLeftCollapsedManual(true);
                        }
                      }}
                      className={cn(
                        "rounded-full border border-blue-900/40 bg-blue-900 text-white text-[10px] font-black tracking-[0.2em] uppercase hover:bg-blue-800 transition-all shadow-sm",
                        leftCollapsed ? "h-7 px-3 text-[9px]" : "h-9 px-5"
                      )}
                    >
                      {leftCollapsed ? "SEE ALL PRODUCTS" : "SHOW LESS"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] pb-2 border-b border-border">
                    <span>{activeCategory?.name} Types</span>
                    {subPanelOpen && (
                      <button
                        type="button"
                        onClick={() => setLeftCollapsedManual((prev) => {
                          const next = !(prev ?? subPanelOpen);
                          return next;
                        })}
                        className="text-[10px] font-black tracking-[0.2em] text-primary hover:underline"
                      >
                        {leftCollapsed ? "SHOW MORE" : "SHOW LESS"}
                      </button>
                    )}
                  </div>
                  <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto] gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-muted/40 border-b border-border">
                      <span>Subcategory</span>
                      <span>Action</span>
                    </div>
                    <div className="divide-y divide-border">
                      <button
                        onClick={() => handleSubcategoryChange(null)}
                        className={cn(
                          "w-full text-left px-4 py-3 text-sm transition-all grid grid-cols-[1fr_auto] items-center gap-2",
                          activeSubcategoryId === null
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-foreground hover:bg-muted/60"
                        )}
                      >
                        <span>All Products in {activeCategory?.name}</span>
                        <ArrowRight className={cn("h-4 w-4", activeSubcategoryId === null ? "opacity-100" : "opacity-40")} />
                      </button>
                      {subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => handleSubcategoryChange(sub.id)}
                          className={cn(
                            "w-full text-left px-4 py-3 text-sm transition-all grid grid-cols-[1fr_auto] items-center gap-2",
                            activeSubcategoryId === sub.id
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-foreground hover:bg-muted/60"
                          )}
                        >
                          <span>{sub.name}</span>
                          <ArrowRight className={cn("h-4 w-4", activeSubcategoryId === sub.id ? "opacity-100" : "opacity-40")} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* Main Content Area */}
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              {/* Mobile Filters */}
              <div className="lg:hidden bg-card p-4 rounded-2xl shadow-sm border border-border space-y-3">
                <div className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Filters
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase">Category</label>
                  <Select
                    value={activeCategoryId === null ? "all" : String(activeCategoryId)}
                    onValueChange={(val) => {
                      if (val === "all") {
                        handleCategoryChange(null);
                        return;
                      }
                      const nextId = Number(val);
                      if (!Number.isNaN(nextId)) {
                        handleCategoryChange(nextId);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full bg-muted/50 border-none rounded-xl h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {subcategories.length > 0 && (
                    <>
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Subcategory</label>
                    <Select 
                      value={activeSubcategoryId === null ? "all" : String(activeSubcategoryId)} 
                      onValueChange={(val) => handleSubcategoryChange(val === "all" ? null : Number(val))}
                    >
                      <SelectTrigger className="w-full bg-muted/50 border-none rounded-xl h-11">
                        <SelectValue placeholder={`All ${activeCategory?.name || "categories"}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All {activeCategory?.name}</SelectItem>
                        {subcategories.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </>
                  )}

                  {/* Price range hidden on mobile per request */}
                </div>
              </div>
              {/* Price + Search Inline */}
              <div className="bg-card p-4 rounded-2xl shadow-sm border border-border">
                <div className="grid gap-4 md:grid-cols-[minmax(0,360px)_1fr]">
                  <div className="flex flex-col gap-2">
                    <div className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      Price Range
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap items-end gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Min ($)</label>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          value={minPrice} 
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="h-10 w-24 bg-white border-border rounded-xl text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase">Max ($)</label>
                        <Input 
                          type="number" 
                          placeholder="Any" 
                          value={maxPrice} 
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="h-10 w-28 bg-white border-border rounded-xl text-xs"
                        />
                      </div>
                      {(minPrice || maxPrice) && (
                        <button 
                          onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                          className="text-[10px] font-bold text-primary hover:underline mb-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="relative min-w-0 md:self-end">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder="Search products..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-12 h-11 bg-white border-border rounded-xl text-sm focus:ring-primary/20 transition-all w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl shadow-sm border border-border mb-8">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-display font-bold text-foreground">
                    {showHotOnly ? "Hot Deals" : showArrivalsOnly ? "New Arrivals" : showBrandsOnly ? (selectedBrand || "All Brands") : activeSubcategory?.name || activeCategory?.name || "All Products"}
                  </h2>
                  <Badge variant="secondary" className="bg-muted text-muted-foreground border-none">
                    {unifiedItems.length} Items
                  </Badge>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-full sm:w-48 bg-muted/50 border-none rounded-xl h-11">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name (A–Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z–A)</SelectItem>
                      <SelectItem value="price-asc">Price (Low–High)</SelectItem>
                      <SelectItem value="price-desc">Price (High–Low)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
                    <Button
                      variant={view === "list" ? "default" : "ghost"}
                      size="icon"
                      className={cn("h-9 w-9 rounded-lg transition-all", view === "list" ? "shadow-sm" : "")}
                      onClick={() => setView("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={view === "grid" ? "default" : "ghost"}
                      size="icon"
                      className={cn("h-9 w-9 rounded-lg transition-all", view === "grid" ? "shadow-sm" : "")}
                      onClick={() => setView("grid")}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Filters Bar */}
              {(search || minPrice || maxPrice) && (
                <div className="flex items-center gap-2 flex-wrap pb-2">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold mr-2">Filters:</span>
                  {search && (
                    <Badge variant="default" className="gap-1.5 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                      Search: "{search}"
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch("")} />
                    </Badge>
                  )}
                  {minPrice && (
                    <Badge variant="default" className="gap-1.5 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                      Min: ${minPrice}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setMinPrice("")} />
                    </Badge>
                  )}
                  {maxPrice && (
                    <Badge variant="default" className="gap-1.5 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                      Max: ${maxPrice}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setMaxPrice("")} />
                    </Badge>
                  )}
                  <button onClick={clearFilters} className="text-xs font-semibold text-destructive hover:underline ml-2 transition-all">
                    Reset all
                  </button>
                </div>
              )}

              {/* Unified Grid/List View */}
              {catalogLoading ? (
                <div className="space-y-12">
                  <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-700">
                    <div className="relative mb-8">
                       <div className="h-24 w-24 rounded-full border-t-2 border-r-2 border-primary animate-spin" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="h-10 w-10 text-primary opacity-50" />
                       </div>
                    </div>
                    <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight animate-pulse mb-2">
                        Loading Premium Catalog
                    </h2>
                    <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">
                        Preparing your cleaning solutions...
                    </p>
                  </div>

                  <div className={cn(
                    "grid gap-6 sm:gap-8 opacity-40", 
                    view === "list" ? "grid-cols-1" : 
                    desktopCols === 4 ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
                  )}>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="rounded-[2rem] border border-slate-100 bg-white p-5 space-y-6 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="aspect-square bg-slate-50 rounded-2xl" />
                        <div className="space-y-3">
                          <div className="h-5 bg-slate-50 rounded-lg w-3/4" />
                          <div className="h-3 bg-slate-50 rounded w-full" />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <div className="h-7 bg-slate-50 rounded-lg w-1/3" />
                          <div className="h-10 w-40 bg-slate-50 rounded-xl" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : unifiedItems.length > 0 ? (
                <div className="relative">
                  <div className={cn(
                    "grid gap-6 sm:gap-8", 
                    view === "list" ? "grid-cols-1" : 
                    desktopCols === 4 ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
                  )}>
                    {unifiedItems.map((item) => (
                      <ProductCard
                        key={item.id}
                        variant={view}
                        catalogItem={item.data}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 rounded-3xl border-2 border-dashed border-border bg-card/50 backdrop-blur-sm">
                  <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                    <Package className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-foreground mb-2">No items found</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mb-8">
                    We couldn't find anything matching your current criteria. Try adjusting your filters.
                  </p>
                  <Button variant="outline" onClick={clearFilters} className="rounded-xl px-8 py-6 h-auto border-border hover:bg-muted">
                    Reset all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Shop;
