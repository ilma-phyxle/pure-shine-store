import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/ProductCard";
import { Truck, Shield, Package, Clock, ArrowRight, Leaf, MoveRight, ImageIcon, LayoutGrid, Check, Star } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WhyInvestSection } from "@/components/home/WhyInvestSection";
import { StatsSection } from "@/components/home/StatsSection";
import { BlogPreviewSection } from "@/components/home/BlogPreviewSection";
import { useCatalogApi } from "@/hooks/useCatalogApi";
import { cn } from "@/lib/utils";
import type { ApiProduct } from "@/lib/api";
import type { EmblaCarouselType } from "embla-carousel";

import heroSlide2 from "@/assets/hero-slide-2.jpg";

const trustBadges = [
  { icon: Truck, label: "Free Shipping", sub: "Orders over $100 (Delivery only available for Victoria metro and Geelong)" },
  { icon: Shield, label: "Australian Owned", sub: "Local business" },
  { icon: Package, label: "Bulk Pricing", sub: "Volume discounts" },
  { icon: Clock, label: "Fast Delivery", sub: "1-3 business days" },
];

const Index = () => {
  // Filtering and Sorting state for products section
  const [activeProductsCategoryId, setActiveProductsCategoryId] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState("name-asc");
  const [showOnlyNewArrivals, setShowOnlyNewArrivals] = useState(false);

  const { categories: catalogCategories, products: catalogProducts, isLoading: isCatalogLoading, error: catalogError } = useCatalogApi({ 
    limit: 8,
    category_id: activeProductsCategoryId === 'all' ? null : activeProductsCategoryId,
    is_new_arrival: showOnlyNewArrivals ? true : undefined
  });

  const [hoveredId, setHoveredId] = useState<string | number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps"
  });

  const onSelect = useCallback((api: EmblaCarouselType) => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    const updateSnaps = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
    };

    onSelect(emblaApi);
    updateSnaps();
    
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", () => {
      onSelect(emblaApi);
      updateSnaps();
    });
  }, [emblaApi, onSelect]);

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!emblaApi || isPaused) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [emblaApi, isPaused]);

  return (
    <main>
      <HeroSlideshow />
      <section className="bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground border-b border-primary-foreground/10">
        <div className="container py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              "Melbourne Based",
              "Fast Shipping",
              "Quality Products",
              "All chemicals and products purchased through authorized distributor",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/15 px-4 py-3 backdrop-blur-sm shadow-sm"
              >
                <span className="h-8 w-8 rounded-full bg-secondary text-primary flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold leading-snug">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl bg-card text-foreground border border-border shadow-lg px-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
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

      {/* Categories Accordion Section (New Aesthetic) */}
      <section className="py-16 md:py-24 overflow-hidden relative">
        <div className="container relative z-10 mb-12">
          <AnimatedSection>
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px w-12 bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Our Expertise</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-black mb-6 text-slate-900 tracking-tight leading-tight">
                QUALITY SERVICE AT <br />
                <span className="text-primary italic">AFFORDABLE</span> PRICES
              </h2>
              <p className="text-muted-foreground text-lg">Browse our professional cleaning categories.</p>
            </div>
          </AnimatedSection>
        </div>

        <div 
          className="embla relative z-10" 
          ref={emblaRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="embla__container flex gap-6 px-4 md:px-0 md:ml-[10%] xl:ml-[15%] py-10">
            {isCatalogLoading ? (
              // Loading Skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="embla__slide flex-[0_0_auto] min-w-0">
                  <div className="w-[300px] md:w-[350px] h-[550px] rounded-[2.5rem] bg-slate-100 animate-pulse border border-slate-200" />
                </div>
              ))
            ) : catalogCategories.length > 0 ? (
              catalogCategories.map((cat, idx) => (
                <div 
                  key={cat.id} 
                  className="embla__slide flex-[0_0_100%] sm:flex-[0_0_auto] min-w-0"
                  onMouseEnter={() => setHoveredId(cat.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div 
                    className={cn(
                      "relative overflow-hidden rounded-[2.5rem] border border-slate-100 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer group bg-white shadow-xl hover:shadow-2xl hover:border-primary/20 mx-auto",
                      hoveredId === cat.id ? "w-[280px] sm:w-[300px] md:w-[600px]" : "w-[280px] sm:w-[300px] md:w-[350px]"
                    )}
                    style={{ height: "500px" }}
                  >
                    <Link to={`/shop?cat=${encodeURIComponent(cat.slug)}`} className="absolute inset-0 z-30" />
                    
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0 scale-105 group-hover:scale-100 transition-transform duration-1000">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                          <ImageIcon className="h-20 w-20 text-slate-200 opacity-20" />
                        </div>
                      )}
                      {/* Overlay */}
                      <div className={cn(
                        "absolute inset-0 bg-slate-950/40 transition-colors duration-500",
                        hoveredId === cat.id ? "bg-slate-950/20" : "bg-slate-950/50"
                      )} />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 z-10 p-8 md:p-12 bg-white/95 backdrop-blur-md border-t border-slate-50 flex flex-col justify-end h-[45%] group-hover:h-[55%] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
                      <div className="space-y-4">
                        {/* Index Number */}
                        <div className="flex items-end gap-4 overflow-hidden">
                          <span className="text-4xl md:text-6xl font-display font-black text-primary leading-none opacity-60 group-hover:opacity-100 transition-all duration-500">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div className="h-[2px] w-12 md:w-20 bg-primary/30 mb-2 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-100" />
                        </div>

                        <h3 className="text-xl md:text-3xl font-display font-black text-slate-900 group-hover:text-primary transition-colors duration-300 uppercase tracking-tighter">
                          {cat.name}
                        </h3>

                        <div className={cn(
                          "overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
                          hoveredId === cat.id ? "max-h-[350px] opacity-100 mt-4" : "max-h-0 opacity-0"
                        )}>
                          <p className="text-muted-foreground text-sm md:text-base mb-6 line-clamp-3 leading-relaxed max-w-md font-medium">
                            {cat.description || "Discover our professional-grade range tailored for your specific environment."}
                          </p>
                          
                          <div className="inline-flex items-center gap-3 text-primary font-black uppercase tracking-[0.2em] text-[10px] border-b border-primary pb-2 hover:gap-5 transition-all duration-300">
                            VIEW CATEGORY <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div key="no-cats" className="embla__slide flex-[0_0_auto] min-w-0">
                <div className="w-[300px] md:w-[350px] h-[550px] flex items-center justify-center text-slate-400">
                  No categories found
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center gap-3 mt-12 pb-10">
          {scrollSnaps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => emblaApi?.scrollTo(idx)}
              className={cn(
                "h-1.5 transition-all duration-500 rounded-full",
                selectedIndex === idx 
                  ? "w-10 bg-primary shadow-lg shadow-primary/20" 
                  : "w-2 bg-slate-200 hover:bg-slate-300"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="py-16 md:py-24 bg-slate-50/50">
        <div className="container">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
              <div className="max-w-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px w-12 bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Our Inventory</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-black mb-6 text-slate-900 tracking-tight leading-tight">
                  OUR <span className="text-primary italic">PRODUCTS</span>
                </h2>
                <p className="text-muted-foreground text-lg">Browse our range of professional cleaning supplies.</p>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-col gap-6 w-full md:w-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  {/* All Category Card & Text */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setActiveProductsCategoryId('all')}
                      className={cn(
                        "group relative w-16 h-16 md:w-24 md:h-24 rounded-2xl overflow-hidden transition-all duration-500 border-2 flex-shrink-0",
                        activeProductsCategoryId === 'all' 
                          ? "border-primary shadow-xl scale-105" 
                          : "border-transparent opacity-70 hover:opacity-100 hover:border-slate-200"
                      )}
                    >
                      <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                        <LayoutGrid className={cn("h-5 w-5 md:h-6 md:w-6 transition-colors", activeProductsCategoryId === 'all' ? "text-primary" : "text-slate-400")} />
                      </div>
                      <div className={cn(
                        "absolute inset-x-0 bottom-0 py-1 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-center transition-colors",
                        activeProductsCategoryId === 'all' ? "bg-primary text-white" : "bg-white/80 text-slate-500"
                      )}>
                        All
                      </div>
                    </button>

                    <div className="flex flex-col gap-1.5 flex-1 sm:hidden">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categories</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categories</span>
                      <Select 
                        value={activeProductsCategoryId === 'all' ? 'all' : String(activeProductsCategoryId)} 
                        onValueChange={(val) => setActiveProductsCategoryId(val === 'all' ? 'all' : Number(val))}
                      >
                        <SelectTrigger className="w-full h-11 bg-slate-100 border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest px-4 focus:ring-primary/20">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                          <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">All Categories</SelectItem>
                          {catalogCategories.map(cat => (
                            <SelectItem key={cat.id} value={String(cat.id)} className="text-[10px] font-black uppercase tracking-widest">
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Categories:</span>
                    <Select 
                      value={activeProductsCategoryId === 'all' ? 'all' : String(activeProductsCategoryId)} 
                      onValueChange={(val) => setActiveProductsCategoryId(val === 'all' ? 'all' : Number(val))}
                    >
                      <SelectTrigger className="w-48 h-11 bg-slate-100 border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest px-4 focus:ring-primary/20">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                        <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">All Categories</SelectItem>
                        {catalogCategories.map(cat => (
                          <SelectItem key={cat.id} value={String(cat.id)} className="text-[10px] font-black uppercase tracking-widest">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-4 sm:gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Specials:</span>
                    <button 
                      onClick={() => setShowOnlyNewArrivals(!showOnlyNewArrivals)}
                      className={cn(
                        "h-11 px-6 rounded-2xl flex items-center gap-2 border transition-all font-display font-black text-[10px] uppercase tracking-widest whitespace-nowrap",
                        showOnlyNewArrivals 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-slate-100 border-slate-200 text-slate-500 hover:border-primary/30"
                      )}
                    >
                      <Star className={cn("h-3.5 w-3.5", showOnlyNewArrivals ? "fill-white" : "fill-transparent")} />
                      New Arrivals
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort by:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full lg:w-40 h-11 bg-slate-100 border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest px-4 focus:ring-primary/20">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                        <SelectItem value="name-asc" className="text-[10px] font-black uppercase tracking-widest">Name (A-Z)</SelectItem>
                        <SelectItem value="name-desc" className="text-[10px] font-black uppercase tracking-widest">Name (Z-A)</SelectItem>
                        <SelectItem value="price-asc" className="text-[10px] font-black uppercase tracking-widest">Price (Low-High)</SelectItem>
                        <SelectItem value="price-desc" className="text-[10px] font-black uppercase tracking-widest">Price (High-Low)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {isCatalogLoading ? (
            <div className="space-y-12">
              <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in duration-1000">
                <div className="relative mb-10">
                   <div className="h-32 w-32 rounded-full border-t-2 border-r-2 border-primary animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="h-12 w-12 text-primary opacity-40" />
                   </div>
                </div>
                <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight animate-pulse mb-3">
                    Loading Premium Catalog
                </h2>
                <div className="h-1 w-48 bg-slate-100 rounded-full overflow-hidden mx-auto">
                   <div className="h-full bg-primary w-1/3 animate-[loading_2s_ease-in-out_infinite]" />
                </div>
                <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase mt-6">
                    Curating your selection
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 opacity-30">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-[2rem] border border-slate-100 bg-white p-6 space-y-6 animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
                    <div className="aspect-square bg-slate-50 rounded-2xl" />
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-50 rounded-lg w-3/4" />
                      <div className="h-3 bg-slate-50 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Filter and display products from catalogProducts */}
              {(catalogProducts || [])
              .filter(item => {
                // Category Filter
                const matchesCategory = activeProductsCategoryId === 'all' || item.category_id === activeProductsCategoryId;
                return matchesCategory;
              })
              .sort((a, b) => {
                const nameA = a.name;
                const nameB = b.name;
                
                switch (sortBy) {
                  case "name-desc": return nameB.localeCompare(nameA);
                  case "price-asc": return (a.price ?? 0) - (b.price ?? 0);
                  case "price-desc": return (b.price ?? 0) - (a.price ?? 0);
                  default: return nameA.localeCompare(nameB);
                }
              })
              .slice(0, 8).map((item, i) => (
                <AnimatedSection key={item.id} delay={i * 0.05}>
                  <ProductCard catalogItem={item} />
                </AnimatedSection>
              ))}
              
              {(catalogProducts.length === 0) && (
                <div className="col-span-full text-center py-16 rounded-3xl border-2 border-dashed border-slate-200 bg-white/50">
                  <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-display font-black text-xl mb-2 text-slate-900">NO PRODUCTS MATCH</h3>
                  <p className="text-slate-500 max-w-md mx-auto">Try adjusting your filters or browse our full shop.</p>
                  <Button 
                    variant="outline" 
                    className="mt-6 rounded-full border-slate-200"
                    onClick={() => {
                      setActiveProductsCategoryId('all');                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-16 text-center">
            <Button asChild variant="outline" className="h-14 rounded-full px-10 border-slate-200 hover:border-primary hover:text-primary transition-all font-display font-black text-xs uppercase tracking-widest">
              <Link to="/shop">Explore Full Catalog <ArrowRight className="ml-3 h-4 w-4" /></Link>
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
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Why Choose  ?</h2>
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

   {/*     <TestimonialsSection /> */}

      <BlogPreviewSection />

     {/*   <NewsletterSection />*/}

      
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
