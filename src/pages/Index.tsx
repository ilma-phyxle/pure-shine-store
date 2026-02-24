import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { Truck, Shield, Package, Clock, ArrowRight, Sparkles, Leaf } from "lucide-react";
import heroImage from "@/assets/hero-cleaning.jpg";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { BrandsSection } from "@/components/home/BrandsSection";

import catFloorCare from "@/assets/categories/floor-care.jpg";
import catBathroom from "@/assets/categories/bathroom.jpg";
import catKitchen from "@/assets/categories/kitchen.jpg";
import catDisinfectants from "@/assets/categories/disinfectants.jpg";
import catPaperProducts from "@/assets/categories/paper-products.jpg";
import catJanitorial from "@/assets/categories/janitorial.jpg";
import catHandHygiene from "@/assets/categories/hand-hygiene.jpg";
import catLaundry from "@/assets/categories/laundry.jpg";
import catGlassSurface from "@/assets/categories/glass-surface.jpg";
import catWaste from "@/assets/categories/waste-management.jpg";
import catOutdoor from "@/assets/categories/outdoor.jpg";
import catSpecialty from "@/assets/categories/specialty-chemicals.jpg";

const categories = [
  { name: "Floor Care", image: catFloorCare },
  { name: "Bathroom", image: catBathroom },
  { name: "Kitchen", image: catKitchen },
  { name: "Disinfectants", image: catDisinfectants },
  { name: "Paper Products", image: catPaperProducts },
  { name: "Janitorial Equipment", image: catJanitorial },
  { name: "Hand Hygiene", image: catHandHygiene },
  { name: "Laundry", image: catLaundry },
  { name: "Glass & Surface", image: catGlassSurface },
  { name: "Waste Management", image: catWaste },
  { name: "Outdoor", image: catOutdoor },
  { name: "Specialty Chemicals", image: catSpecialty },
];

const trustBadges = [
  { icon: Truck, label: "Free Shipping", sub: "Orders over $150" },
  { icon: Shield, label: "Australian Owned", sub: "Local business" },
  { icon: Package, label: "Bulk Pricing", sub: "Volume discounts" },
  { icon: Clock, label: "Fast Delivery", sub: "1-3 business days" },
];

const Index = () => {
  const { data: products, isLoading } = useShopifyProducts(8);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Commercial cleaning supplies" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/70" />
        </div>
        <div className="container relative py-20 md:py-32">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-foreground rounded-full px-4 py-1.5 text-sm font-medium border border-secondary/30">
              <Sparkles className="h-4 w-4" /> Professional Grade Supplies
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-primary-foreground leading-tight tracking-tight">
              Commercial & Residential<br />
              <span className="text-secondary">Cleaning Supplies</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-lg leading-relaxed">
              Premium cleaning products for businesses and homes. Trusted by thousands of Australian professionals for spotless results.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-8">
                <Link to="/shop">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/contact">Get a Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b bg-card">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <badge.icon className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{badge.label}</p>
                  <p className="text-xs text-muted-foreground">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BrandsSection />

      {/* Categories */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Shop by Category</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to keep your space spotless, organized by department.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to="/shop"
                className="group flex flex-col items-center gap-3 p-4 rounded-xl border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="text-sm font-medium text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Our Products</h2>
              <p className="text-muted-foreground">Browse our range of professional cleaning supplies.</p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex">
              <Link to="/shop">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
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
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.node.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-xl border bg-card">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No products yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">Products will appear here once they're added to the store. Tell us in the chat what products you'd like to add!</p>
            </div>
          )}
          <div className="md:hidden mt-8 text-center">
            <Button asChild variant="outline">
              <Link to="/shop">View All Products <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <ServicesSection />

      {/* About */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Why Choose GRAPC?</h2>
              <p className="text-muted-foreground leading-relaxed">
                With years of experience in the cleaning supply industry, we understand what professionals need. From hospitals to hotels, offices to homes — we supply the products that deliver results.
              </p>
              <ul className="space-y-4">
                {[
                  "Premium quality cleaning chemicals & equipment",
                  "Competitive bulk pricing for businesses",
                  "Expert advice and product recommendations",
                  "Fast, reliable delivery across Australia",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Leaf className="h-3.5 w-3.5 text-secondary" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="bg-primary">
                <Link to="/about">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <Sparkles className="h-24 w-24 text-primary/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <NewsletterSection />

      {/* CTA */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">Need Supplies in Bulk?</h2>
          <p className="text-secondary-foreground/80 max-w-xl mx-auto mb-8">
            Get competitive pricing on large orders. Contact us for a custom quote tailored to your business needs.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8">
              <Link to="/contact">Request a Quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
              <Link to="/shop">Browse Products</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
