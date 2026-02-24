import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, SlidersHorizontal } from "lucide-react";
import type { ShopifyProduct } from "@/lib/shopify";

const Shop = () => {
  const { data: products, isLoading } = useShopifyProducts(50);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = (products || [])
    .filter((p: ShopifyProduct) =>
      p.node.title.toLowerCase().includes(search.toLowerCase()) ||
      p.node.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: ShopifyProduct, b: ShopifyProduct) => {
      switch (sort) {
        case "price-asc": return parseFloat(a.node.priceRange.minVariantPrice.amount) - parseFloat(b.node.priceRange.minVariantPrice.amount);
        case "price-desc": return parseFloat(b.node.priceRange.minVariantPrice.amount) - parseFloat(a.node.priceRange.minVariantPrice.amount);
        case "name-desc": return b.node.title.localeCompare(a.node.title);
        default: return a.node.title.localeCompare(b.node.title);
      }
    });

  return (
    <main className="py-8 md:py-12">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop All Products</h1>
          <p className="text-muted-foreground">Browse our complete range of professional cleaning supplies.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="price-asc">Price (Low-High)</SelectItem>
              <SelectItem value="price-desc">Price (High-Low)</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="sm:hidden" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product: ShopifyProduct) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-xl border bg-card">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {search ? "Try a different search term." : "Products will appear here once they're added to the store."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Shop;
