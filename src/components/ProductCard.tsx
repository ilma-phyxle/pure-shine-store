import { Link } from "react-router-dom";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, type ShopifyProduct } from "@/stores/cartStore";
import { toast } from "sonner";

export const ProductCard = ({ product }: { product: ShopifyProduct }) => {
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);
  const p = product.node;
  const variant = p.variants.edges[0]?.node;
  const image = p.images.edges[0]?.node;
  const price = p.priceRange.minVariantPrice;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to cart", { description: p.title, position: "top-center" });
  };

  return (
    <Link to={`/product/${p.handle}`} className="group block">
      <div className="rounded-xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="aspect-square bg-muted overflow-hidden">
          {image ? (
            <img src={image.url} alt={image.altText || p.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{p.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="font-bold text-lg">{price.currencyCode} {parseFloat(price.amount).toFixed(2)}</span>
            <Button size="sm" variant="secondary" onClick={handleAddToCart} disabled={isLoading || !variant?.availableForSale}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};
