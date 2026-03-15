import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Loader2, Package, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, type ShopifyProduct } from "@/stores/cartStore";
import { ProductQuickView } from "./ProductQuickView";
import { ApiProduct } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CustomerInfoDialog, CustomerInfo } from "@/components/CustomerInfoDialog";
import { formatWhatsAppOrder, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { createOrder } from "@/lib/api";

interface ProductCardProps {
  product?: ShopifyProduct;
  catalogItem?: ApiProduct;
  variant?: "grid" | "list";
}

export const ProductCard = ({ product, catalogItem, variant = "grid" }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);

  // If we have a Shopify product
  const p = product?.node;
  const variant_shopify = p?.variants?.edges[0]?.node;
  const image = p?.images?.edges[0]?.node;
  const price = p?.priceRange?.minVariantPrice;

  // If we have a catalog item
  const c = catalogItem;

  const [quantity, setQuantity] = useState(1);
  const [showBuyNowDialog, setShowBuyNowDialog] = useState(false);

  // Derived properties
  const isCatalog = !product && !!c;
  const title = p?.title || c?.name || "Untitled Item";
  const description = p?.description || c?.description || "";
  const handleForQuickView = p?.handle || String(c?.slug || c?.id || "");

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCatalog && c) {
      if (c.variants && c.variants.length > 0) {
        // If it has variants, we should probably open quick view instead of direct add
        toast.info("Please select an option", { position: "top-center" });
        return;
      }
      const finalPrice = (c.is_hot_deal && c.discount_price) ? c.discount_price : (c.price ?? 0);
      await addItem({
                type: 'catalog',
                productId: String(c.id),
                variantId: undefined, // No specific variant selected for direct add of non-variant catalog item
                name: title, // Use the derived title
                price: { amount: String(finalPrice), currencyCode: "$" },
        quantity: quantity,
        image: c.image_url ?? undefined
      });
      toast.success("Added to cart", { description: `${quantity}x ${title}`, position: "top-center" });
      return;
    }

    if (!product || !variant_shopify) return;
    await addItem({
      type: 'shopify',
      productId: p?.id || "",
      name: title,
      price: variant_shopify.price,
      quantity: quantity,
      image: image?.url,
      shopifyVariantId: variant_shopify.id,
      shopifyData: product,
      selectedOptions: variant_shopify.selectedOptions || [],
    });
    toast.success("Added to cart", { description: `${quantity}x ${title}`, position: "top-center" });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCatalog && c && c.variants && c.variants.length > 0) {
      toast.info("Please select an option first", { position: "top-center" });
      return;
    }
    setShowBuyNowDialog(true);
  };

  const handleConfirmBuyNow = async (customerInfo: CustomerInfo) => {
    const isHot = isCatalog && c?.is_hot_deal && c?.discount_price;
    const priceAmount = isHot ? c.discount_price! : parseFloat(price?.amount || String(c?.price ?? 0) || "0");
    const currencyCode = price?.currencyCode || '$';

    const orderData = {
      customer: customerInfo.name,
      mobile: customerInfo.mobile,
      total: (priceAmount * quantity).toFixed(2),
      status: 'Processing' as const,
      payment: 'Pending' as const,
      info: `Buy Now: ${quantity}x ${title}`,
      items: [{
        id: isCatalog ? String(c?.id) : p?.id || "",
        name: title,
        quantity: quantity,
        price: priceAmount,
        currency: currencyCode,
        image: image?.url || c?.image_url || undefined
      }]
    };

    // 1. Save order to DB in background (fire-and-forget)
    createOrder(orderData)
      .then(result => console.log("Buy Now order saved to DB:", result?.id))
      .catch(err => console.error("DB order save failed (WhatsApp still sent):", err));

    // 2. Build WhatsApp message immediately
    const tempOrderId = `ORD-${Date.now()}`;
    const message = formatWhatsAppOrder({
      orderId: tempOrderId,
      items: orderData.items,
      total: `${currencyCode} ${orderData.total}`,
      customer: customerInfo.name,
      mobile: customerInfo.mobile,
      address: customerInfo.address,
      email: customerInfo.email,
    });

    // 3. Redirect to WhatsApp immediately
    toast.success("Order Placed! Redirecting to WhatsApp...", { id: "buynow" });
    setTimeout(() => {
      window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${message}`, '_blank');
    }, 800);
  };

  if (variant === "list") {
    return (
      <div className="group relative bg-white rounded-3xl border border-slate-100 hover:border-primary/20 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden flex flex-col md:flex-row gap-8 p-6 sm:p-8">
        <ProductQuickView handle={handleForQuickView} initialProduct={product} initialCatalogProduct={catalogItem}>
          <div className="w-full md:w-64 aspect-square rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 relative">
            {(image || c?.image_url) ? (
              <img
                src={image?.url || c?.image_url}
                alt={image?.altText || title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-200">
                <Package className="h-12 w-12 opacity-20" />
              </div>
            )}
            {isCatalog && c?.is_hot_deal && (
              <div className="absolute top-4 right-4 animate-bounce">
                <span className="px-3 py-1 bg-red-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-red-500/20">
                  HOT DEAL
                </span>
              </div>
            )}
            {isCatalog && c?.category?.name && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-sm">
                  {c?.category?.name}
                </span>
              </div>
            )}
          </div>
        </ProductQuickView>

        <div className="flex-1 flex flex-col justify-between py-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <ProductQuickView handle={handleForQuickView} initialProduct={product} initialCatalogProduct={catalogItem}>
                <div className="space-y-1">
                  {c?.brand && (
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-0.5">
                      {c?.brand}
                    </span>
                  )}
                  <h3 className="font-display font-black text-2xl text-slate-900 group-hover:text-primary transition-colors cursor-pointer leading-tight">
                    {title}
                  </h3>
                </div>
              </ProductQuickView>
              <div className="flex items-center gap-3">
                <div className="flex items-baseline gap-2">
                  {(isCatalog && c?.is_hot_deal && c?.discount_price) ? (
                    <>
                      <div className="flex items-baseline">
                        <span className="text-xs font-bold text-red-400 mr-1">$</span>
                        <span className="font-display font-black text-2xl text-red-600">
                          {c.discount_price.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-300 line-through">
                        ${(c.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </span>
                    </>
                  ) : (isCatalog && c && c.variants && c.variants.length > 0) ? (
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none mb-0.5">From</span>
                      <div className="flex items-baseline">
                        <span className="text-xs font-bold text-slate-400 mr-1">$</span>
                        <span className="font-display font-black text-2xl text-primary">
                          {Math.min(...c.variants.map(v => v.price)).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-xs font-bold text-slate-400 mr-1">$</span>
                      <span className="font-display font-black text-2xl text-primary">
                        {parseFloat(price?.amount || String(c?.price ?? 0) || "0").toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-px h-4 bg-slate-100" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">In Stock</span>
              </div>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-3 md:line-clamp-none max-w-2xl">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-slate-50">
            <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white transition-all text-slate-400 hover:text-slate-900 shadow-sm shadow-transparent hover:shadow-slate-200"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-display font-black text-sm text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white transition-all text-slate-400 hover:text-slate-900 shadow-sm shadow-transparent hover:shadow-slate-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-1 items-center gap-3">
              {isCatalog && c && c.variants && c.variants.length > 0 ? (
                <ProductQuickView handle={handleForQuickView} initialProduct={product} initialCatalogProduct={catalogItem}>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-2xl border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-900 hover:text-white transition-all duration-300 font-black text-[10px] uppercase tracking-[0.15em]"
                  >
                    Select Option
                  </Button>
                </ProductQuickView>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-2xl border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-900 hover:text-white transition-all duration-300 font-black text-[10px] uppercase tracking-[0.15em]"
                  onClick={handleAddToCart}
                  disabled={isLoading || (!!product && !variant_shopify?.availableForSale)}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
                  Add to Bag
                </Button>
              )}

              {isCatalog && c && c.variants && c.variants.length > 0 ? (
                <ProductQuickView handle={handleForQuickView} initialProduct={product} initialCatalogProduct={catalogItem}>
                  <Button
                    variant="default"
                    className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/10 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.15em]"
                  >
                    Buy Now
                  </Button>
                </ProductQuickView>
              ) : (
                <Button
                  variant="default"
                  className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/10 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.15em]"
                  onClick={handleBuyNow}
                  disabled={isLoading || (!!product && !variant_shopify?.availableForSale)}
                >
                  Buy Now
                </Button>
              )}
            </div>
          </div>
        </div>

        <CustomerInfoDialog
          open={showBuyNowDialog}
          onOpenChange={setShowBuyNowDialog}
          onConfirm={handleConfirmBuyNow}
          title="Quick Order Details"
          description={`You're ordering: ${title}.`}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col rounded-[2rem] border border-slate-100 bg-white overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 group cursor-pointer relative">
      <ProductQuickView handle={handleForQuickView} initialProduct={product} initialCatalogProduct={catalogItem}>
        <div className="flex-1 flex flex-col">
          <div className="relative aspect-square bg-slate-50 overflow-hidden">
            {(image || c?.image_url) ? (
              <img
                src={image?.url || c?.image_url}
                alt={image?.altText || title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300">
                <div className="p-4 rounded-full bg-white/50 backdrop-blur-sm mb-3">
                  <Package className="h-8 w-8 opacity-40" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Catalog Image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {isCatalog && c?.is_hot_deal && (
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                <span className="px-2.5 py-1 rounded-full bg-red-600 text-[9px] font-black text-white uppercase tracking-wider shadow-lg shadow-red-600/20">
                  HOT
                </span>
              </div>
            )}
            {isCatalog && c && c.variants && c.variants.length > 0 && (
              <div className="absolute bottom-4 right-4">
                <span className="px-2.5 py-1 rounded-full bg-white text-[9px] font-black text-slate-900 uppercase tracking-wider shadow-xl border border-slate-100">
                  {c.variants.length} Options
                </span>
              </div>
            )}
            {isCatalog && c?.category?.name && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-sm">
                  {c?.category?.name}
                </span>
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col flex-1 gap-3">
            <div className="space-y-1.5">
              {c?.brand && (
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">
                  {c?.brand}
                </span>
              )}
              <h3 className="font-display font-black text-lg line-clamp-2 leading-tight text-slate-900 group-hover:text-primary transition-colors duration-300">
                {title}
              </h3>
              <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>
      </ProductQuickView>

      <div className="p-4 sm:p-6 pt-0 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-slate-50 pt-4">
          <div className="flex flex-col min-w-[100px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-1">Price</span>
            <div className="flex items-baseline flex-wrap gap-2">
              {(isCatalog && c?.is_hot_deal && c?.discount_price) ? (
                <>
                  <div className="flex items-baseline">
                    <span className="text-xs font-bold text-red-400 mr-1">$</span>
                    <span className="font-display font-black text-xl sm:text-2xl text-red-600 break-all">
                      {c?.discount_price?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-300 line-through mb-1">
                    ${(c.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </span>
                </>
                ) : (isCatalog && c && c.variants && c.variants.length > 0) ? (
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none mb-0.5">From</span>
                    <div className="flex items-baseline">
                      <span className="text-xs font-bold text-slate-400 mr-1">$</span>
                      <span className="font-display font-black text-xl sm:text-2xl text-primary break-all">
                        {Math.min(...c.variants.map(v => v.price)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline">
                    <span className="text-xs font-bold text-slate-500 mr-1">$</span>
                    <span className="font-display font-black text-xl sm:text-2xl text-slate-900 break-all">
                      {parseFloat(price?.amount || String(c?.price ?? 0) || "0").toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
            </div>
          </div>

          <div className="flex flex-col items-end min-w-fit ml-auto">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-1">Quantity</span>
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(Math.max(1, quantity - 1)); }}
                className="h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center rounded-lg hover:bg-white transition-all text-slate-400 hover:text-slate-900 active:scale-90"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-5 text-center font-display font-black text-xs text-slate-900">{quantity}</span>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(quantity + 1); }}
                className="h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center rounded-lg hover:bg-white transition-all text-slate-400 hover:text-slate-900 active:scale-90"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
            {isCatalog && c && c.variants && c.variants.length > 0 ? (
              <ProductQuickView handle={handleForQuickView} initialProduct={product} initialCatalogProduct={catalogItem}>
                <Button
                  variant="outline"
                  className="h-10 sm:h-12 rounded-xl sm:rounded-2xl border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-900 hover:text-white transition-all duration-300 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.15em] w-full shadow-sm px-2"
                >
                  Select Option
                </Button>
              </ProductQuickView>
            ) : (
              <Button
                variant="outline"
                className="h-10 sm:h-12 rounded-xl sm:rounded-2xl border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-900 hover:text-white transition-all duration-300 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.15em] w-full shadow-sm px-2"
                onClick={handleAddToCart}
                disabled={isLoading || (!!product && !variant_shopify?.availableForSale)}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1.5" />
                ) : (
                  <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                )}
                Add to Bag
              </Button>
            )}

            {isCatalog && c && c.variants && c.variants.length > 0 ? (
              <ProductQuickView handle={handleForQuickView} initialProduct={product} initialCatalogProduct={catalogItem}>
                <Button
                  variant="default"
                  className="h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/10 transition-all duration-300 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.15em] w-full px-2"
                >
                  Buy Now
                </Button>
              </ProductQuickView>
            ) : (
              <Button
                variant="default"
                className="h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/10 transition-all duration-300 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.15em] w-full px-2"
                onClick={handleBuyNow}
                disabled={isLoading || (!!product && !variant_shopify?.availableForSale)}
              >
                Buy Now
              </Button>
            )}
          </div>

          <ProductQuickView handle={handleForQuickView} initialProduct={product} initialCatalogProduct={catalogItem}>
            <Button
              variant="secondary"
              className="h-9 sm:h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 transition-all duration-300 border-none font-black text-[8px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.15em] w-full"
            >
              Quick View
            </Button>
          </ProductQuickView>
        </div>
      </div>
      <CustomerInfoDialog
        open={showBuyNowDialog}
        onOpenChange={setShowBuyNowDialog}
        onConfirm={handleConfirmBuyNow}
        title="Quick Order Details"
        description={`You're ordering: ${title}.`}
      />
    </div>
  );
};
