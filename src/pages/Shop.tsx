import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, SlidersHorizontal, LayoutGrid, List, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/shopify";

const PRICE_RANGES = [
  { label: "All Prices", value: "all" },
  { label: "Under $25", value: "0-25" },
  { label: "$25 – $50", value: "25-50" },
  { label: "$50 – $100", value: "50-100" },
  { label: "Over $100", value: "100+" },
];

const Shop = () => {
  const { data: products, isLoading } = useShopifyProducts(50);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("name-asc");
  const [priceRange, setPriceRange] = useState("all");
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [showFilters, setShowFilters] = useState(false);

  // Sync search from URL params
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  const filtered = (products || [])
    .filter((p: ShopifyProduct) => {
      const matchesSearch =
        p.node.title.toLowerCase().includes(search.toLowerCase()) ||
        p.node.description.toLowerCase().includes(search.toLowerCase());
      const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
      let matchesPrice = true;
      if (priceRange === "0-25") matchesPrice = price < 25;
      else if (priceRange === "25-50") matchesPrice = price >= 25 && price <= 50;
      else if (priceRange === "50-100") matchesPrice = price >= 50 && price <= 100;
      else if (priceRange === "100+") matchesPrice = price > 100;
      return matchesSearch && matchesPrice;
    })
    .sort((a: ShopifyProduct, b: ShopifyProduct) => {
      switch (sort) {
        case "price-asc": return parseFloat(a.node.priceRange.minVariantPrice.amount) - parseFloat(b.node.priceRange.minVariantPrice.amount);
        case "price-desc": return parseFloat(b.node.priceRange.minVariantPrice.amount) - parseFloat(a.node.priceRange.minVariantPrice.amount);
        case "name-desc": return b.node.title.localeCompare(a.node.title);
        default: return a.node.title.localeCompare(b.node.title);
      }
    });

  const activeFilterCount = (priceRange !== "all" ? 1 : 0) + (search ? 1 : 0);

  const clearFilters = () => {
    setSearch("");
    setPriceRange("all");
    setSort("name-asc");
    setSearchParams({});
  };

  return (
    <main className="py-8 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop All Products</h1>
          <p className="text-muted-foreground">
            Browse our complete range of professional cleaning supplies.
            {!isLoading && products && (
              <span className="ml-1 font-medium text-foreground">({filtered.length} product{filtered.length !== 1 ? "s" : ""})</span>
            )}
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A–Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z–A)</SelectItem>
                <SelectItem value="price-asc">Price (Low–High)</SelectItem>
                <SelectItem value="price-desc">Price (High–Low)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Price range" />
              </SelectTrigger>
              <SelectContent>
                {PRICE_RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Grid toggle - desktop only */}
            <div className="hidden md:flex items-center gap-1 border rounded-lg p-1">
              <Button variant={gridCols === 3 ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setGridCols(3)}>
                <List className="h-4 w-4" />
              </Button>
              <Button variant={gridCols === 4 ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setGridCols(4)}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active filters */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-3 py-1">
                  Search: "{search}"
                  <button onClick={() => { setSearch(""); setSearchParams({}); }}><X className="h-3 w-3" /></button>
                </span>
              )}
              {priceRange !== "all" && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-3 py-1">
                  {PRICE_RANGES.find((r) => r.value === priceRange)?.label}
                  <button onClick={() => setPriceRange("all")}><X className="h-3 w-3" /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-destructive hover:underline ml-2">Clear all</button>
            </div>
          )}
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className={cn("grid gap-6", gridCols === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4")}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-5 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className={cn("grid gap-6", gridCols === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4")}>
            {filtered.map((product: ShopifyProduct) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-xl border bg-card">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {search || priceRange !== "all" ? "Try adjusting your filters." : "Products will appear here once they're added to the store."}
            </p>
            {(search || priceRange !== "all") && (
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Shop;
