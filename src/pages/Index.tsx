import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { Truck, Shield, Package, Clock, ArrowRight, Leaf, MoveRight } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WhyInvestSection } from "@/components/home/WhyInvestSection";
import { BrandsSection } from "@/components/home/BrandsSection";
import { StatsSection } from "@/components/home/StatsSection";
import { BlogPreviewSection } from "@/components/home/BlogPreviewSection";
import { useCatalogStore } from "@/stores/catalogStore";

import heroSlide2 from "@/assets/hero-slide-2.jpg";

const trustBadges = [
  { icon: Truck, label: "Free Shipping", sub: "Orders over $150" },
  { icon: Shield, label: "Australian Owned", sub: "Local business" },
  { icon: Package, label: "Bulk Pricing", sub: "Volume discounts" },
  { icon: Clock, label: "Fast Delivery", sub: "1-3 business days" },
];

const Index = () => {
  const { data: products, isLoading } = useShopifyProducts(8);
  const catalogCategories = useCatalogStore((s) => s.categories);

  return (
    <main>
      <HeroSlideshow />

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

      {/* Ad Banner */}
      <section className="bg-gradient-to-r from-primary via-primary to-secondary py-6 md:py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-primary-foreground">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div>
                <p className="font-bold text-lg md:text-xl">View Our New Collection !</p>
              </div>
            </div>
            <Button asChild size="lg" className="bg-card text-foreground hover:bg-card/90 rounded-full px-8 font-bold whitespace-nowrap">
              <Link to="/shop">Shop the Sale <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <BrandsSection />

      {/* Categories */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container">
          <AnimatedSection>
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-secondary mb-3">Browse Our Range</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-primary">Shop by Category</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to keep your space spotless, organized by department.</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {catalogCategories.map((cat, i) => (
              <AnimatedSection key={cat.id} delay={i * 0.05}>
                <Link
                  to={`/shop?cat=${encodeURIComponent(cat.slug)}`}
                  className="group block p-6 rounded-2xl border border-border/80 bg-white hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 text-center"
                >
                  <div className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-primary transition-colors">
                    {cat.name}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    View Catalog <ArrowRight className="inline h-3 w-3 ml-1" />
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <AnimatedSection>
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3 text-primary">Our Products</h2>
                <p className="text-muted-foreground">Browse our range of professional cleaning supplies.</p>
              </div>
              <Button asChild variant="outline" className="hidden md:flex">
                <Link to="/shop">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </AnimatedSection>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border bg-card animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-5 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {products.map((product, i) => (
                <AnimatedSection key={product.node.id} delay={i * 0.05}>
                  <ProductCard product={product} />
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-xl border bg-card">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No products yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">Products will appear here once they're added to the store.</p>
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

      <WhyInvestSection />

      <StatsSection />

      {/* About */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Why Choose GRAPC?</h2>
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
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="relative rounded-2xl overflow-hidden">
                <img src={heroSlide2} alt="Professional cleaning" className="w-full h-full object-cover rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent rounded-2xl" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <BlogPreviewSection />

      <NewsletterSection />

      {/* CTA */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">Need Supplies in Bulk?</h2>
            <p className="text-secondary-foreground/80 max-w-xl mx-auto mb-8">
              Get competitive pricing on large orders. Contact us for a custom quote tailored to your business needs.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8">
                <Link to="/contact">Request a Quote</Link>
              </Button>
              <Button asChild size="lg" className="rounded-full px-8 bg-card text-foreground hover:bg-card/90">
                <Link to="/shop">Browse Products</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default Index;
