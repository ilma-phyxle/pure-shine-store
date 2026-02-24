import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";

const slides = [
  {
    image: heroSlide1,
    badge: "Professional Grade Supplies",
    title: <>Commercial & Residential<br /><span className="text-secondary">Cleaning Supplies</span></>,
    subtitle: "Premium cleaning products for businesses and homes. Trusted by thousands of Australian professionals for spotless results.",
  },
  {
    image: heroSlide2,
    badge: "Trusted by Professionals",
    title: <>Expert Cleaning<br /><span className="text-secondary">For Every Space</span></>,
    subtitle: "From offices to warehouses, our commercial-grade products deliver spotless results every time.",
  },
  {
    image: heroSlide3,
    badge: "Eco-Friendly Options",
    title: <>Sustainable &<br /><span className="text-secondary">Green Cleaning</span></>,
    subtitle: "Environmentally responsible cleaning solutions that are safe for your family, pets, and the planet.",
  },
];

export const HeroSlideshow = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden bg-primary min-h-[500px] md:min-h-[600px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt="Cleaning supplies"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/60" />
        </motion.div>
      </AnimatePresence>

      <div className="container relative py-20 md:py-32 flex items-center min-h-[500px] md:min-h-[600px]">
        <div className="max-w-2xl space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${current}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-foreground rounded-full px-4 py-1.5 text-sm font-medium border border-secondary/30">
                <Sparkles className="h-4 w-4" /> {slide.badge}
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-primary-foreground leading-tight tracking-tight">
                {slide.title}
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-lg leading-relaxed">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full px-8">
                  <Link to="/shop">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/contact">Get a Quote</Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center text-primary-foreground transition-colors backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center text-primary-foreground transition-colors backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-secondary" : "w-2 bg-primary-foreground/30 hover:bg-primary-foreground/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
