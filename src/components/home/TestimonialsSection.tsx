import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Hotel Operations Manager",
    rating: 5,
    text: "  has been our go-to supplier for over 2 years. Their bulk pricing and fast delivery keep our hotel running smoothly. Highly recommend!",
    avatar: "SM",
    timeAgo: "2 weeks ago",
  },
  {
    name: "James Chen",
    role: "Restaurant Owner",
    rating: 5,
    text: "Excellent quality products at very competitive prices. The kitchen degreasers and sanitisers work brilliantly. Great customer service too.",
    avatar: "JC",
    timeAgo: "1 month ago",
  },
  {
    name: "Lisa Thompson",
    role: "Office Manager",
    rating: 5,
    text: "We switched to   last year and haven't looked back. The paper products and hand hygiene range is fantastic. Delivery is always on time.",
    avatar: "LT",
    timeAgo: "3 weeks ago",
  },
  {
    name: "David Russo",
    role: "Cleaning Business Owner",
    rating: 5,
    text: "As a cleaning business, I need reliable supplies at wholesale prices.   delivers every time. Their floor care products are top-notch.",
    avatar: "DR",
    timeAgo: "1 week ago",
  },
  {
    name: "Emma Walsh",
    role: "School Facilities Manager",
    rating: 5,
    text: "Fantastic range and competitive pricing. We've reduced our cleaning budget by 20% since switching to  . Their eco-friendly range is excellent.",
    avatar: "EW",
    timeAgo: "5 days ago",
  },
  {
    name: "Michael Park",
    role: "Gym Owner",
    rating: 5,
    text: "The disinfectants and sanitisers from   are top quality. Our gym has never been cleaner. Fast delivery and great support team.",
    avatar: "MP",
    timeAgo: "2 months ago",
  },
];

const VISIBLE_COUNT = { desktop: 3, mobile: 1 };

export const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const count = isMobile ? VISIBLE_COUNT.mobile : VISIBLE_COUNT.desktop;
  const maxIndex = testimonials.length - count;

  const next = useCallback(() => setCurrent((c) => (c >= maxIndex ? 0 : c + 1)), [maxIndex]);
  const prev = useCallback(() => setCurrent((c) => (c <= 0 ? maxIndex : c - 1)), [maxIndex]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const visible = testimonials.slice(current, current + count);

  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <svg viewBox="0 0 48 48" className="h-8 w-8" aria-label="Google">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span className="text-lg font-semibold text-muted-foreground">Google Reviews</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-primary">What Our Customers Say</h2>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-semibold text-lg">5.0</span>
            <span className="text-muted-foreground text-sm">({testimonials.length} reviews)</span>
          </div>
        </div>

        <div className="relative">
          {/* Navigation arrows */}
          <button
            onClick={prev}
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-card border shadow-md flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Next review"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="overflow-hidden px-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {visible.map((t) => (
                  <div
                    key={t.name}
                    className="bg-card rounded-xl border p-6 space-y-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.timeAgo}</p>
                      </div>
                      <svg viewBox="0 0 48 48" className="h-5 w-5 ml-auto" aria-hidden>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/30"
                }`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
