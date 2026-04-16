import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Loader2, Package, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCatalogProduct } from "@/hooks/useCatalogApi";
import { useCartContext } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import type { ApiProduct } from "@/lib/api";

const ProductQuickViewPage = () => {
    const { handle } = useParams<{ handle: string }>();
    const navigate = useNavigate();
    const { data: product, isLoading: catalogLoading } = useCatalogProduct(handle || null);
    const [showHotEnabled, setShowHotEnabled] = useState(true);
    const { openCart } = useCartContext();

    const hotAllowed = showHotEnabled && !!product?.is_hot_deal && !!product?.discount_price;

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
        : [];

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gallery.length <= 1) return;
            if (e.key === "ArrowLeft") {
                setSelectedImage(prev => (prev === 0 ? gallery.length - 1 : prev - 1));
            } else if (e.key === "ArrowRight") {
                setSelectedImage(prev => (prev === gallery.length - 1 ? 0 : prev + 1));
            }
            if (e.key === "Escape") {
                navigate(-1);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [gallery.length, navigate]);

    const title = product?.name || "Product";
    const description = product?.description;

    const handleAddToCart = async () => {
        if (product) {
            const finalPrice = selectedVariant 
                ? (selectedVariant.discount_price || selectedVariant.price)
                : (hotAllowed ? product.discount_price! : product.price);
            await addItem({
                type: 'catalog',
                productId: String(product.id),
                variantId: selectedVariant ? String(selectedVariant.id) : undefined,
                name: (selectedVariant && selectedVariant.name) ? `${title} - ${selectedVariant.name}` : title,
                image: gallery[0],
                price: { amount: String(finalPrice || 0), currencyCode: "$" },
                quantity,
            });

            toast.success("Added to cart", {
                description: `${quantity}x ${title}`,
                position: "top-center",
                className: "rounded-2xl border-slate-100 shadow-2xl"
            });
        }
    };

    useEffect(() => {
        const readToggle = (key: string, fallback = true) => {
            const value = localStorage.getItem(key);
            if (value === null) return fallback;
            return value === "true";
        };
        const load = () => {
            setShowHotEnabled(readToggle("shop_show_hot_deals", true));
        };
        load();
        const onStorage = (e: StorageEvent) => {
            if (e.key === "shop_show_hot_deals") load();
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    if (catalogLoading) {
        return (
            <main className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in duration-500">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Fetching Details...</p>
                </div>
            </main>
        );
    }

    if (!product) {
        return (
            <main className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="text-center">
                    <Package className="h-20 w-20 mb-4 opacity-20 mx-auto" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Product Not Found</span>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            {/* Back Button */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
                <div className="container max-w-2xl md:max-w-4xl mx-auto px-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 py-4 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                </div>
            </div>

            <div className="container max-w-2xl md:max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Gallery */}
                    <div className="flex flex-col gap-4">
                        <div className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 relative group">
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
                                                onClick={() => setSelectedImage(prev => (prev === 0 ? gallery.length - 1 : prev - 1))}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-100 text-slate-900 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-slate-900 hover:text-white shadow-xl translate-x-[-10px] group-hover:translate-x-0"
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            <button 
                                                onClick={() => setSelectedImage(prev => (prev === gallery.length - 1 ? 0 : prev + 1))}
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
                    <div className="flex flex-col gap-6">
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
                            <h1 className="text-3xl font-display font-black text-slate-900 leading-tight">
                                {title}
                            </h1>
                            <div className="flex flex-col gap-1">
                                {(product?.variants && product.variants.length > 1 && selectedVariant) ? (
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Options</span>
                                        {selectedVariant.discount_price && selectedVariant.discount_price < selectedVariant.price ? (
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-3xl font-display font-black text-red-600">
                                                    <span className="text-base font-bold text-red-400 mr-0.5">$</span>
                                                    {selectedVariant.discount_price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-xl font-bold text-slate-300 line-through">
                                                    ${selectedVariant.price?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-display font-black text-primary">
                                                    <span className="text-base font-bold text-slate-400 mr-0.5">$</span>
                                                    {selectedVariant.price?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : selectedVariant ? (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-display font-black text-primary">
                                            <span className="text-base font-bold text-slate-400 mr-0.5">$</span>
                                            {selectedVariant.price?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ) : (hotAllowed) ? (
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
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-4">
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
                                <p className="text-sm text-slate-500 leading-relaxed italic">
                                    {description || "Premium quality product for professional and home use."}
                                </p>
                            </div>
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
                                    className="h-12 rounded-xl bg-[#288200] hover:bg-[#237200] text-white font-bold text-xs uppercase tracking-widest w-full shadow-lg shadow-[#288200]/20 transition-all"
                                    onClick={async () => {
                                        await handleAddToCart();
                                        openCart();
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
        </main>
    );
};

export default ProductQuickViewPage;
