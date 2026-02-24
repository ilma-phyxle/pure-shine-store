import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useShopifyProduct } from "@/hooks/useShopifyProducts";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Minus, Plus, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const { data: product, isLoading } = useShopifyProduct(handle || "");
  const addItem = useCartStore(state => state.addItem);
  const cartLoading = useCartStore(state => state.isLoading);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (isLoading) {
    return (
      <main className="py-12">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-muted rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="py-12">
        <div className="container text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button asChild><Link to="/shop"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop</Link></Button>
        </div>
      </main>
    );
  }

  const images = product.images.edges;
  const variants = product.variants.edges;
  const selectedVariant = variants[selectedVariantIdx]?.node;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success("Added to cart", { description: `${quantity}x ${product.title}`, position: "top-center" });
  };

  return (
    <main className="py-8 md:py-12">
      <div className="container">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/shop"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop</Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted border">
              {images[selectedImage]?.node ? (
                <img src={images[selectedImage].node.url} alt={images[selectedImage].node.altText || product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img: { node: { url: string; altText: string | null } }, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${i === selectedImage ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img src={img.node.url} alt={img.node.altText || ""} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.title}</h1>
              {selectedVariant && (
                <p className="text-3xl font-bold text-primary">
                  {selectedVariant.price.currencyCode} {parseFloat(selectedVariant.price.amount).toFixed(2)}
                </p>
              )}
            </div>

            {/* Variant selection */}
            {product.options?.filter((o: { name: string; values: string[] }) => o.name !== "Title").map((option: { name: string; values: string[] }) => (
              <div key={option.name}>
                <label className="text-sm font-medium mb-2 block">{option.name}</label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v: { node: { id: string; title: string; selectedOptions: Array<{ name: string; value: string }> } }, idx: number) => {
                    const val = v.node.selectedOptions.find(so => so.name === option.name)?.value;
                    return (
                      <Button
                        key={v.node.id}
                        variant={idx === selectedVariantIdx ? "default" : "outline"}
                        size="sm"
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
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            <Button onClick={handleAddToCart} size="lg" className="w-full bg-secondary hover:bg-secondary/90" disabled={cartLoading || !selectedVariant?.availableForSale}>
              {cartLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
              Add to Cart
            </Button>

            <Tabs defaultValue="description" className="mt-8">
              <TabsList className="w-full">
                <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <p className="text-muted-foreground leading-relaxed">{product.description || "No description available."}</p>
              </TabsContent>
              <TabsContent value="reviews" className="mt-4">
                <p className="text-muted-foreground text-center py-8">No reviews yet.</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
