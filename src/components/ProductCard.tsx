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

interface ProductCardProps {
  product?: ShopifyProduct;
  catalogItem?: ApiProduct;
}

export const ProductCard = ({ product, catalogItem }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);

  // If we have a Shopify product
  const p = product?.node;
  const variant = p?.variants?.edges[0]?.node;
  const image = p?.images?.edges[0]?.node;
  const price = p?.priceRange?.minVariantPrice;

  // If we have a catalog item
  const c = catalogItem;

  const [quantity, setQuantity] = useState(1);
  const [showBuyNowDialog, setShowBuyNowDialog] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCatalog && c) {
      await addItem({
        type: 'catalog',
        productId: String(c.id),
        name: c.name,
        price: { amount: String(c.price ?? 0), currencyCode: "LKR" },
        quantity: quantity,
        image: c.image_url ?? undefined
      });
      toast.success("Added to cart", { description: `${quantity}x ${c.name}`, position: "top-center" });
      return;
    }

    if (!product || !variant) return;
    await addItem({
      type: 'shopify',
      productId: p.id,
      name: p.title,
      price: variant.price,
      quantity: quantity,
      image: image?.url,
      shopifyVariantId: variant.id,
      shopifyData: product,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to cart", { description: `${quantity}x ${p.title}`, position: "top-center" });
  };

  const isCatalog = !product && !!c;
  const title = p?.title || c?.name || "Untitled Item";
  const description = p?.description || c?.description || "";
  const handleForQuickView = p?.handle || c?.slug || String(c?.id) || "";
  const link = isCatalog && c?.slug ? `/product/${c.slug}` : `/product/${handleForQuickView}`;
  const isExternal = false; // Never hide buttons

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBuyNowDialog(true);
  };

  const handleConfirmBuyNow = async (customerInfo: CustomerInfo) => {
    const priceAmount = parseFloat(price?.amount || String(c?.price ?? 0) || "0");
    const currencyCode = price?.currencyCode || 'LKR';

    const { formatWhatsAppOrder, WHATSAPP_NUMBER } = await import("@/lib/whatsapp");

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
    const { createOrder } = await import("@/lib/api");
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

  const cardContent = (
    <div className="h-full flex flex-col rounded-[2rem] border border-slate-100 bg-white overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 group cursor-pointer">
      {/* Clickable Image & Info Area - Triggers Popup */}
      <ProductQuickView handle={handleForQuickView}>
        <div className="flex-1 flex flex-col">
          <div className="relative aspect-square bg-slate-50 overflow-hidden">
            {(image || c?.image_url) ? (
              <img
                src={image?.url || c?.image_url}
                alt={image?.altText || title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50 flex-col gap-2">
                <Package className="h-10 w-10 opacity-20" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">No Image</span>
              </div>
            )}

            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {isCatalog && c?.category?.name && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-sm">
                  {c.category.name}
                </span>
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col flex-1 gap-3">
            <div className="space-y-1.5">
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

      {/* Footer Area - Not inside Link */}
      <div className="p-4 sm:p-6 pt-0 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-slate-50 pt-4">
          <div className="flex flex-col min-w-[100px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-1">Price</span>
            <div className="flex items-baseline flex-wrap">
              <span className="text-xs font-bold text-slate-500 mr-1">{price?.currencyCode || 'LKR'}</span>
              <span className="font-display font-black text-xl sm:text-2xl text-slate-900 break-all">
                {parseFloat(price?.amount || String(c?.price ?? 0) || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
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
            <Button
              variant="outline"
              className="h-10 sm:h-12 rounded-xl sm:rounded-2xl border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-900 hover:text-white transition-all duration-300 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.15em] w-full shadow-sm px-2"
              onClick={(e) => {
                handleAddToCart(e);
              }}
              disabled={isLoading || (product && !variant.availableForSale)}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1.5" />
              ) : (
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
              )}
              Add to Bag
            </Button>

            <Button
              variant="default"
              className="h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/10 transition-all duration-300 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.15em] w-full px-2"
              onClick={handleBuyNow}
              disabled={isLoading || (product && !variant.availableForSale)}
            >
              Buy Now
            </Button>
          </div>

          <ProductQuickView 
            handle={handleForQuickView} 
            initialProduct={product} 
            initialCatalogProduct={catalogItem}
          >
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
        description={`You're ordering: ${title}. Please fill in your delivery details.`}
      />
    </div>
  );

  return cardContent;
};

