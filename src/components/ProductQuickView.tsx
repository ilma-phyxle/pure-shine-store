import { useState, useMemo, useEffect } from "react";
import { useShopifyProduct } from "@/hooks/useShopifyProducts";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Minus, Plus, Loader2, Package, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCatalogApi } from "@/hooks/useCatalogApi";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import type { ShopifyProduct } from "@/stores/cartStore";
import type { ApiProduct } from "@/lib/api";

interface ProductQuickViewProps {
    handle: string;
    children: React.ReactNode;
    initialProduct?: ShopifyProduct;
    initialCatalogProduct?: ApiProduct;
}

export const ProductQuickView = ({ handle, children, initialProduct, initialCatalogProduct }: ProductQuickViewProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: fetchedShopifyProduct, isLoading: shopifyLoading } = useShopifyProduct(handle && !initialProduct && !initialCatalogProduct ? handle : "");
    const { products } = useCatalogApi();

    const shopifyProduct = initialProduct || fetchedShopifyProduct;

    const catalogProduct = useMemo(() => {
        if (initialCatalogProduct) return initialCatalogProduct;
        if (shopifyProduct) return null;
        return products.find(p => p.slug === handle || String(p.id) === handle) ?? null;
    }, [products, handle, shopifyProduct, initialCatalogProduct]);

    const addItem = useCartStore(state => state.addItem);
    const cartLoading = useCartStore(state => state.isLoading);
    const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    const product = shopifyProduct || catalogProduct;
    const isShopify = !!shopifyProduct;

    // Normalize images and gallery first so we can use them in the effect
    const getShopifyNode = (p: ShopifyProduct | (ShopifyProduct['node'] & { node?: never })) => 
        'node' in p ? p.node : p;
    
    const node = isShopify ? getShopifyNode(product as ShopifyProduct | (ShopifyProduct['node'] & { node?: never })) : null;
    const images = isShopify ? node?.images?.edges || [] : [];
    const gallery = isShopify 
        ? (images as Array<{ node: { url: string } }>).map((img) => img.node.url) 
        : [(product as ApiProduct)?.image_url, ...((product as ApiProduct)?.image_url_2 ? [(product as ApiProduct)?.image_url_2] : []), ...((product as ApiProduct)?.image_url_3 ? [(product as ApiProduct)?.image_url_3] : [])].filter(Boolean) as string[];

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

    const title = isShopify ? node?.title : (product as ApiProduct)?.name || "Product";
    const description = isShopify ? node?.description : (product as ApiProduct)?.description;
    const variants = isShopify ? node?.variants?.edges || [] : [];
    const selectedVariant = isShopify ? variants[selectedVariantIdx]?.node : null;
    const price = isShopify ? selectedVariant?.price : { amount: String((product as ApiProduct)?.price || 0), currencyCode: "LKR" };

    const handleAddToCart = async () => {
        if (!product) return;
        if (isShopify) {
            if (!selectedVariant || !node) return;
            await addItem({
                type: 'shopify',
                productId: node.id,
                name: title,
                image: gallery[0],
                price: selectedVariant.price,
                quantity,
                shopifyVariantId: selectedVariant.id,
                shopifyData: { node } as unknown as ShopifyProduct, // Wrap node back for cart store expectation
                selectedOptions: selectedVariant.selectedOptions || [],
            });
        } else {
            const apiProd = product as ApiProduct;
            await addItem({
                type: 'catalog',
                productId: String(apiProd.id),
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
        setIsOpen(false);
    };

    // If we have no data and we are loading, then we hide or show a skeleton
    if (shopifyLoading && !product) {
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
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit">
                                {isShopify ? 'In Stock' : (product as ApiProduct)?.category?.name || 'Catalog Item'}
                            </Badge>
                            <DialogTitle className="text-3xl font-display font-black text-slate-900 leading-tight">
                                {title}
                            </DialogTitle>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-display font-black text-primary">
                                    <span className="text-base font-bold text-slate-400 mr-0.5">{price.currencyCode}</span>
                                    {parseFloat(price.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <p className="text-sm text-slate-500 leading-relaxed line-clamp-4">
                                {description || "Premium quality product for professional and home use."}
                            </p>

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
