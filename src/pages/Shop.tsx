import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Package, LayoutGrid, List, X, ExternalLink, Filter, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/shopify";
import { useCatalogStore, type FullCategory, type ProductDetail } from "@/stores/catalogStore";

const PRICE_RANGES = [
  { label: "All Prices", value: "all" },
  { label: "Under $25", value: "0-25" },
  { label: "$25 – $50", value: "25-50" },
  { label: "$50 – $100", value: "50-100" },
  { label: "Over $100", value: "100+" },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("name-asc");
  const [priceRange, setPriceRange] = useState("all");
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  const categories = useCatalogStore((s) => s.categories);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id ?? "");
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string>("");

  useEffect(() => {
    if (!activeCategoryId && categories[0]?.id) setActiveCategoryId(categories[0].id);
  }, [categories, activeCategoryId]);

  const activeCategory = useMemo(() => categories.find((c) => c.id === activeCategoryId) ?? categories[0], [activeCategoryId, categories]);

  // Derive subcategories from products in the active category
  const subcategories = useMemo(() => {
    if (!activeCategory) return [];
    const uniqueSubs = Array.from(new Set(activeCategory.products.map((p) => p.subcategory))).filter(Boolean);
    return uniqueSubs.map((sub) => ({
      id: `${activeCategory.id}-${sub.toLowerCase().replace(/\s+/g, "-")}`,
      name: sub,
    }));
  }, [activeCategory]);

  const { data: shopifyProducts, isLoading } = useShopifyProducts(50);

  const activeSubcategory = useMemo(() => {
    if (!activeSubcategoryId) return null;
    return subcategories.find(s => s.id === activeSubcategoryId);
  }, [activeSubcategoryId, subcategories]);

  // Combine and filter everything
  const unifiedItems = useMemo(() => {
    if (!activeCategory) return [];

    // 1. Static Products from Catalog
    const catalogFiltered = activeCategory.products
      .filter((p) => {
        // Subcategory filter
        if (activeSubcategory && p.subcategory !== activeSubcategory.name) return false;

        // Search filter
        const matchesSearch = !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.short_description?.toLowerCase() || "").includes(search.toLowerCase()) ||
          p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));

        return matchesSearch;
      })
      .map(p => ({ type: 'catalog' as const, data: p, id: p.id, name: p.name, price: 0 }));

    // 2. Shopify Products
    const keywords = (activeSubcategory?.name || activeCategory.name).toLowerCase();
    const shopifyFiltered = (shopifyProducts || [])
      .filter((p) => {
        const title = p.node.title.toLowerCase();
        const desc = p.node.description.toLowerCase();
        const tags = p.node.tags.map(t => t.toLowerCase());

        const matchesKeywords = title.includes(keywords) || desc.includes(keywords) || tags.some(t => t.includes(keywords));
        const matchesSearch = !search ||
          title.includes(search.toLowerCase()) ||
          desc.includes(search.toLowerCase()) ||
          tags.some(t => t.includes(search.toLowerCase()));

        const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
        let matchesPrice = true;
        if (priceRange === "0-25") matchesPrice = price < 25;
        else if (priceRange === "25-50") matchesPrice = price >= 25 && price <= 50;
        else if (priceRange === "50-100") matchesPrice = price >= 50 && price <= 100;
        else if (priceRange === "100+") matchesPrice = price > 100;

        return matchesKeywords && matchesSearch && matchesPrice;
      })
      .map(p => ({
        type: 'shopify' as const,
        data: p,
        id: p.node.id,
        name: p.node.title,
        price: parseFloat(p.node.priceRange.minVariantPrice.amount)
      }));

    // 3. Merge and Sort
    return [...catalogFiltered, ...shopifyFiltered].sort((a, b) => {
      switch (sort) {
        case "name-desc": return b.name.localeCompare(a.name);
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        default: return a.name.localeCompare(b.name);
      }
    });
  }, [activeCategory, activeSubcategory, shopifyProducts, search, priceRange, sort]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (!cat) return;
    const match = categories.find((c) => c.slug === cat) || categories.find((c) => c.id === cat);
    if (match && match.id !== activeCategoryId) {
      setActiveCategoryId(match.id);
      setActiveSubcategoryId("");
    }
  }, [categories, searchParams, activeCategoryId]);

  const clearFilters = () => {
    setSearch("");
    setPriceRange("all");
    setSort("name-asc");
    setActiveSubcategoryId("");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("q");
      return next;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Simplified Hero Section */}
      <section className="bg-slate-950 py-16 lg:py-24 border-b border-white/5">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
              Our Professional Catalog
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
              Browse our complete range of commercial and domestic cleaning supplies. Select a category below to filter.
            </p>

            <div className="pt-4 max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 py-12 bg-white">
        <div className="container px-4">
          <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
            {/* Cleaner Sidebar Navigation */}
            <aside className="space-y-8">
              <div className="space-y-4">
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pb-2 border-b border-slate-100">
                  Categories
                </div>
                <div className="flex flex-col gap-1">
                  {categories.map((c) => (
                    <div key={c.id}>
                      <button
                        onClick={() => {
                          setActiveCategoryId(c.id);
                          setActiveSubcategoryId("");
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                          c.id === activeCategoryId
                            ? "bg-slate-900 text-white font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <span>{c.name}</span>
                        {c.id === activeCategoryId && <ArrowRight className="h-4 w-4" />}
                      </button>

                      {/* Nested Subcategories */}
                      {c.id === activeCategoryId && subcategories.length > 0 && (
                        <div className="pl-4 mt-1 mb-2 flex flex-col gap-1 border-l border-slate-100 ml-2">
                          <button
                            onClick={() => setActiveSubcategoryId("")}
                            className={cn(
                              "text-left px-3 py-1.5 rounded-md text-xs",
                              activeSubcategoryId === ""
                                ? "text-primary font-bold"
                                : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            All {c.name}
                          </button>

                          {subcategories.map(sub => (
                            <button
                              key={sub.id}
                              onClick={() => setActiveSubcategoryId(sub.id)}
                              className={cn(
                                "text-left px-3 py-1.5 rounded-md text-xs",
                                activeSubcategoryId === sub.id
                                  ? "text-primary font-bold"
                                  : "text-slate-400 hover:text-slate-600"
                              )}
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Filter in Sidebar */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="text-sm font-semibold text-slate-900">Price Range</div>
                <div className="space-y-2">
                  {PRICE_RANGES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setPriceRange(r.value)}
                      className={cn(
                        "w-full text-left px-4 py-2 rounded-lg text-sm transition-colors",
                        priceRange === r.value ? "text-primary font-semibold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-display font-bold text-slate-900">
                    {activeSubcategory?.name || activeCategory?.name || "All Products"}
                  </h2>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none">
                    {unifiedItems.length} Items
                  </Badge>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-full sm:w-48 bg-slate-50 border-none rounded-xl h-11">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name (A–Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z–A)</SelectItem>
                      <SelectItem value="price-asc">Price (Low–High)</SelectItem>
                      <SelectItem value="price-desc">Price (High–Low)</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
                    <Button
                      variant={gridCols === 3 ? "default" : "ghost"}
                      size="icon"
                      className={cn("h-9 w-9 rounded-lg transition-all", gridCols === 3 ? "shadow-sm" : "")}
                      onClick={() => setGridCols(3)}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={gridCols === 4 ? "default" : "ghost"}
                      size="icon"
                      className={cn("h-9 w-9 rounded-lg transition-all", gridCols === 4 ? "shadow-sm" : "")}
                      onClick={() => setGridCols(4)}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Filters Bar */}
              {(search || priceRange !== "all") && (
                <div className="flex items-center gap-2 flex-wrap pb-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold mr-2">Filters:</span>
                  {search && (
                    <Badge variant="default" className="gap-1.5 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                      "{search}"
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch("")} />
                    </Badge>
                  )}
                  {priceRange !== "all" && (
                    <Badge variant="default" className="gap-1.5 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                      {PRICE_RANGES.find((r) => r.value === priceRange)?.label}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setPriceRange("all")} />
                    </Badge>
                  )}
                  <button onClick={clearFilters} className="text-xs font-semibold text-destructive hover:underline ml-2 transition-all">
                    Reset all
                  </button>
                </div>
              )}

              {/* Unified Grid */}
              {isLoading ? (
                <div className={cn("grid gap-6", gridCols === 3 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4")}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 space-y-4 animate-pulse">
                      <div className="aspect-[4/5] bg-slate-100 rounded-xl" />
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-6 bg-slate-100 rounded w-1/4" />
                        <div className="h-9 w-9 bg-slate-100 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : unifiedItems.length > 0 ? (
                <div className={cn("grid gap-6 sm:gap-8", gridCols === 3 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4")}>
                  {unifiedItems.map((item) => (
                    <ProductCard
                      key={item.id}
                      product={item.type === 'shopify' ? item.data : undefined}
                      catalogItem={item.type === 'catalog' ? item.data : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 backdrop-blur-sm">
                  <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                    <Package className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-slate-900 mb-2">No items found</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mb-8">
                    We couldn't find anything matching your current criteria. Try adjusting your filters.
                  </p>
                  <Button variant="outline" onClick={clearFilters} className="rounded-xl px-8 py-6 h-auto border-slate-200 hover:bg-slate-50">
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
