import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useShopifyProduct } from "@/hooks/useShopifyProducts";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Minus, Plus, Loader2, ArrowLeft, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCatalogApi } from "@/hooks/useCatalogApi";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const { data: shopifyProduct, isLoading: shopifyLoading } = useShopifyProduct(handle || "");
  const { products } = useCatalogApi();

  const catalogProduct = useMemo(() => {
    if (shopifyProduct) return null;
    return products.find(p => p.slug === handle || String(p.id) === handle) ?? null;
  }, [products, handle, shopifyProduct]);

  const addItem = useCartStore(state => state.addItem);
  const cartLoading = useCartStore(state => state.isLoading);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const isLoading = shopifyLoading;
  const product = shopifyProduct || catalogProduct;

  if (isLoading) {
    return (
      <main className="py-12 bg-white min-h-screen">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-slate-50 rounded-3xl" />
            <div className="space-y-6">
              <div className="h-10 bg-slate-50 rounded-xl w-3/4" />
              <div className="h-8 bg-slate-50 rounded-xl w-1/4" />
              <div className="space-y-3 pt-8">
                <div className="h-4 bg-slate-50 rounded w-full" />
                <div className="h-4 bg-slate-50 rounded w-full" />
                <div className="h-4 bg-slate-50 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="py-12 bg-white min-h-screen">
        <div className="container text-center py-20">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-slate-200" />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Product not found</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">We couldn't find the product you're looking for. It might have been moved or removed.</p>
          <Button asChild className="rounded-xl h-12 px-8"><Link to="/shop"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop</Link></Button>
        </div>
      </main>
    );
  }

  const isShopify = 'node' in (product as any) || !('category_id' in (product as any));

  // Normalize data
  const title = isShopify ? (product as any).title : (product as any).name;
  const description = isShopify ? (product as any).description : (product as any).description;
  const images = isShopify ? (product as any).images.edges : [];
  const gallery = isShopify ? images.map((img: any) => img.node.url) : [(product as any).image_url, ...((product as any).gallery || [])].filter(Boolean);
  const variants = isShopify ? (product as any).variants.edges : [];
  const selectedVariant = isShopify ? variants[selectedVariantIdx]?.node : null;
  const price = isShopify ? selectedVariant?.price : { amount: (product as any).price, currencyCode: (product as any).currency || "AUD" };

  const handleAddToCart = async () => {
    if (isShopify) {
      if (!selectedVariant) return;
      await addItem({
        type: 'shopify',
        productId: (product as any).id,
        name: title,
        image: gallery[0],
        price: selectedVariant.price,
        quantity,
        shopifyVariantId: selectedVariant.id,
        shopifyData: { node: product } as any,
        selectedOptions: selectedVariant.selectedOptions || [],
      });
    } else {
      await addItem({
        type: 'catalog',
        productId: (product as any).id,
        name: title,
        image: gallery[0],
        price: price,
        quantity,
      });
    }
    toast.success("Added to cart", {
      description: `${quantity}x ${title}`,
      position: "top-center",
      className: "rounded-2xl border-slate-100 shadow-2xl"
    });
  };

  return (
    <main className="py-8 md:py-16 bg-white min-h-screen">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <Button asChild variant="ghost" className="mb-8 hover:bg-slate-50 rounded-xl group transition-all">
          <Link to="/shop" className="flex items-center text-slate-500 group-hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Collection
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Gallery */}
          <div className="space-y-6">
            <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-sm relative group">
              {gallery[selectedImage] ? (
                <img
                  src={gallery[selectedImage]}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                  <Package className="h-20 w-20 mb-4 opacity-20" />
                  <span className="text-sm font-bold uppercase tracking-widest opacity-40">No Image Available</span>
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {gallery.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${i === selectedImage ? 'border-primary ring-4 ring-primary/10' : 'border-transparent hover:border-slate-200'
                      }`}
                  >
                    <img src={url} alt={`${title} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col h-full py-2">
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {isShopify ? 'In Stock' : (product as any).subcategory || 'Catalog Item'}
                  </Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tight leading-[1.1]">
                  {title}
                </h1>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-display font-black text-primary">
                    <span className="text-lg font-bold text-slate-400 mr-1">{price.currencyCode}</span>
                    {parseFloat(price.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-6 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100/50">
                {/* Options (Shopify Only) */}
                {isShopify && (product as any).options?.filter((o: any) => o.name !== "Title").map((option: any) => (
                  <div key={option.name} className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{option.name}</label>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v: any, idx: number) => {
                        const val = v.node.selectedOptions.find((so: any) => so.name === option.name)?.value;
                        return (
                          <Button
                            key={v.node.id}
                            variant={idx === selectedVariantIdx ? "default" : "outline"}
                            size="sm"
                            className={`rounded-xl px-5 h-10 font-bold transition-all ${idx === selectedVariantIdx
                              ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                              : "border-slate-200 hover:border-slate-900 bg-white"
                              }`}
                            onClick={() => setSelectedVariantIdx(idx)}
                          >
                            {val || v.node.title}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Quantity */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Order Quantity</label>
                  <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 w-fit">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl hover:bg-slate-50"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-display font-black text-lg text-slate-900">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl hover:bg-slate-50"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <Button
                    onClick={handleAddToCart}
                    size="lg"
                    variant="outline"
                    className="h-16 rounded-2xl border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all group"
                    disabled={cartLoading || (isShopify && !selectedVariant?.availableForSale)}
                  >
                    {cartLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-3" />
                    ) : (
                      <ShoppingCart className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                    )}
                    <span className="font-bold tracking-tight text-lg">Add to Bag</span>
                  </Button>
                  <Button
                    onClick={async () => {
                      await handleAddToCart();
                      // In a real app we might redirect to checkout, 
                      // here we just ensure the cart drawer is open if possible (cartStore doesn't have open state, but we can assume the user sees the toast)
                    }}
                    size="lg"
                    className="h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 transition-all hover:-translate-y-1 active:translate-y-0"
                    disabled={cartLoading || (isShopify && !selectedVariant?.availableForSale)}
                  >
                    <span className="font-bold tracking-tight text-lg">Buy it Now</span>
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="description" className="w-full">
                <TabsList className="w-full bg-slate-50 p-1.5 h-14 rounded-2xl mb-6">
                  <TabsTrigger value="description" className="flex-1 rounded-xl font-bold py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">Description</TabsTrigger>
                  <TabsTrigger value="details" className="flex-1 rounded-xl font-bold py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">Specifications</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-0 focus-visible:outline-none px-2">
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 leading-relaxed text-lg">
                      {description || "This premium product is carefully formulated for outstanding performance and results."}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="details" className="mt-0 focus-visible:outline-none px-2">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="border-b border-slate-50 pb-4">
                      <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Brand</dt>
                      <dd className="font-bold text-slate-900">{(product as any).brand || "CleanyGlow"}</dd>
                    </div>
                    <div className="border-b border-slate-50 pb-4">
                      <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SKU</dt>
                      <dd className="font-bold text-slate-900 font-mono">{(product as any).sku || (`PS-${(product as any).id.slice(0, 8)}`).toUpperCase()}</dd>
                    </div>
                    {/* Add more specs for catalog items */}
                    {!isShopify && (product as any).specifications && Object.entries((product as any).specifications).map(([key, val]) => (
                      <div key={key} className="border-b border-slate-50 pb-4">
                        <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{key}</dt>
                        <dd className="font-bold text-slate-900">{String(val)}</dd>
                      </div>
                    ))}
                  </dl>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
