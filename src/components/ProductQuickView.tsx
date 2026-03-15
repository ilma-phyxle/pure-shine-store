import { useState, useMemo, useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Minus, Plus, Loader2, Package, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCatalogProduct } from "@/hooks/useCatalogApi";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import type { ApiProduct } from "@/lib/api";
import type { ShopifyProduct } from "@/stores/cartStore";

interface ProductQuickViewProps {
    handle: string;
    children: React.ReactNode;
    initialProduct?: ShopifyProduct;
    initialCatalogProduct?: ApiProduct;
}

export const ProductQuickView = ({ handle, children, initialProduct, initialCatalogProduct }: ProductQuickViewProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: fetchedCatalogProduct, isLoading: catalogLoading } = useCatalogProduct(isOpen && !initialCatalogProduct ? handle : null);

    const product = initialCatalogProduct || fetchedCatalogProduct;

    // Shopify Fallback logic
    const s_p = initialProduct?.node;
    const s_variant = s_p?.variants?.edges[0]?.node;
    const s_image = s_p?.images?.edges[0]?.node?.url;
    const s_price = s_p?.priceRange?.minVariantPrice;

    const addItem = useCartStore(state => state.addItem);
    const cartLoading = useCartStore(state => state.isLoading);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

    const selectedVariant = useMemo(() => {
        if (!product?.variants || product.variants.length === 0) return null;
        return product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
    }, [product, selectedVariantId]);

    useEffect(() => {
        if (product?.variants && product.variants.length > 0 && selectedVariantId === null) {
            setSelectedVariantId(product.variants[0].id);
        }
    }, [product, selectedVariantId]);

    const gallery = product 
        ? [product.image_url, product.image_url_2, product.image_url_3].filter(Boolean) as string[]
        : initialProduct 
            ? (s_p?.images?.edges.map(e => e.node.url).filter(Boolean) as string[])
            : [];

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gallery.length <= 1) return;
            if (e.key === "ArrowLeft") {
                setSelectedImage(prev => (prev === 0 ? gallery.length - 1 : prev - 1));
            } else if (e.key === "ArrowRight") {
                setSelectedImage(prev => (prev === gallery.length - 1 ? 0 : prev + 1));
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, gallery.length]);

    const title = product?.name || s_p?.title || "Product";
    const description = product?.description || s_p?.description;
    const price = { amount: String(product?.price || 0), currencyCode: "$" };

    const handleAddToCart = async () => {
        if (product) {
            const finalPrice = selectedVariant 
                ? (selectedVariant.discount_price || selectedVariant.price)
                : (product.is_hot_deal && product.discount_price ? product.discount_price : product.price);
            await addItem({
                type: 'catalog',
                productId: String(product.id),
                variantId: selectedVariant ? String(selectedVariant.id) : undefined,
                name: (selectedVariant && selectedVariant.name) ? `${title} - ${selectedVariant.name}` : title,
                image: gallery[0],
                price: { amount: String(finalPrice || 0), currencyCode: "$" },
                quantity,
            });
        } else if (initialProduct && s_variant) {
            await addItem({
                type: 'shopify',
                productId: s_p?.id || "",
                name: s_p?.title || "Untitled",
                price: s_variant.price,
                quantity: quantity,
                image: s_image,
                shopifyVariantId: s_variant.id,
                shopifyData: initialProduct,
                selectedOptions: s_variant.selectedOptions || [],
            });
        }

        toast.success("Added to cart", {
            description: `${quantity}x ${title}`,
            position: "top-center",
            className: "rounded-2xl border-slate-100 shadow-2xl"
        });
        setIsOpen(false);
    };

    // If we have no data and we are loading, then we hide or show a skeleton
    if (catalogLoading && !product) {
        return <div className="hidden">{children}</div>;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl !fixed">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-100 text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-xl active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
                <DialogHeader className="sr-only">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Details and ordering options for {title}.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="md:max-h-[90vh] overflow-y-auto overflow-x-hidden bg-white min-h-[400px] flex flex-col justify-center">
                    {!product ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in duration-500">
                             <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Fetching Details...</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-0">
                            {/* Left: Gallery */}
                            <div className="bg-slate-50 p-6 flex flex-col gap-4">
                        <div className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-white relative group">
                            {gallery[selectedImage] ? (
                                <>
                                    <img
                                        src={gallery[selectedImage]}
                                        alt={title}
                                        className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
                                    />
                                    {gallery.length > 1 && (
                                        <>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => (prev === 0 ? gallery.length - 1 : prev - 1)); }}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-100 text-slate-900 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-slate-900 hover:text-white shadow-xl translate-x-[-10px] group-hover:translate-x-0"
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => (prev === gallery.length - 1 ? 0 : prev + 1)); }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-100 text-slate-900 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-slate-900 hover:text-white shadow-xl translate-x-[10px] group-hover:translate-x-0"
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 rounded-full bg-black/10 backdrop-blur-md">
                                                {gallery.map((_, i) => (
                                                    <div 
                                                        key={i} 
                                                        className={cn(
                                                            "h-1.5 rounded-full transition-all duration-300",
                                                            i === selectedImage ? "w-4 bg-white" : "w-1.5 bg-white/40"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                                    <Package className="h-20 w-20 mb-4 opacity-20" />
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">No Image</span>
                                </div>
                            )}
                        </div>
                        {gallery.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                {gallery.map((url, i) => (
                                    <button
                                        key={url}
                                        onClick={() => setSelectedImage(i)}
                                        className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${i === selectedImage ? 'border-primary ring-2 ring-primary/10' : 'border-transparent'
                                            }`}
                                    >
                                        <img src={url} alt={title} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="p-8 flex flex-col gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit">
                                    {product?.category?.name || 'Catalog Item'}
                                </Badge>
                                {product?.brand && (
                                    <Badge variant="outline" className="border-slate-200 text-slate-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit">
                                        {product.brand}
                                    </Badge>
                                )}
                            </div>
                            <DialogTitle className="text-3xl font-display font-black text-slate-900 leading-tight">
                                {title}
                            </DialogTitle>
                            <div className="flex flex-col gap-1">
                                {selectedVariant ? (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-display font-black text-primary">
                                            <span className="text-base font-bold text-slate-400 mr-0.5">$</span>
                                            {selectedVariant.price?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ) : (product?.is_hot_deal && product?.discount_price) ? (
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-display font-black text-red-600">
                                            <span className="text-base font-bold text-red-400 mr-0.5">$</span>
                                            {product.discount_price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-xl font-bold text-slate-300 line-through">
                                            ${product.price?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ) : product ? (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-display font-black text-primary">
                                            <span className="text-base font-bold text-slate-400 mr-0.5">$</span>
                                            {product?.price?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ) : s_price ? (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-display font-black text-primary">
                                            <span className="text-base font-bold text-slate-400 mr-0.5">{s_price.currencyCode}</span>
                                            {parseFloat(s_price.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                {product.variants && product.variants.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Options</span>
                                        <div className="flex flex-wrap gap-2">
                                            {product.variants.map((v) => (
                                                <button
                                                    key={v.id}
                                                    onClick={() => setSelectedVariantId(v.id)}
                                                    className={cn(
                                                        "px-3 py-2 rounded-xl text-[11px] font-bold transition-all border-2",
                                                        selectedVariantId === v.id
                                                            ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                                                            : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                                                    )}
                                                >
                                                    {v.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <p className="text-sm text-slate-500 leading-relaxed line-clamp-4 italic">
                                    {description || "Premium quality product for professional and home use."}
                                </p>
                            </div>

                            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity</span>
                                    <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl border border-slate-100">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-6 text-center font-bold text-sm">{quantity}</span>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setQuantity(quantity + 1)}>
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        className="h-12 rounded-xl border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-bold text-xs uppercase tracking-widest w-full transition-all"
                                        onClick={handleAddToCart}
                                        disabled={cartLoading}
                                    >
                                        {cartLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
                                        Add to Bag
                                    </Button>
                                    <Button
                                        variant="default"
                                        className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest w-full shadow-lg shadow-primary/20 transition-all"
                                        onClick={async () => {
                                            await handleAddToCart();
                                        }}
                                        disabled={cartLoading}
                                    >
                                        Buy Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
            </DialogContent>
        </Dialog>
    );
};
