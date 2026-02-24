import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Hotel Operations Manager",
    rating: 5,
    text: "GRAPC has been our go-to supplier for over 2 years. Their bulk pricing and fast delivery keep our hotel running smoothly. Highly recommend!",
  },
  {
    name: "James Chen",
    role: "Restaurant Owner",
    rating: 5,
    text: "Excellent quality products at very competitive prices. The kitchen degreasers and sanitisers work brilliantly. Great customer service too.",
  },
  {
    name: "Lisa Thompson",
    role: "Office Manager",
    rating: 5,
    text: "We switched to GRAPC last year and haven't looked back. The paper products and hand hygiene range is fantastic. Delivery is always on time.",
  },
  {
    name: "David Russo",
    role: "Cleaning Business Owner",
    rating: 5,
    text: "As a cleaning business, I need reliable supplies at wholesale prices. GRAPC delivers every time. Their floor care products are top-notch.",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">What Our Customers Say</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Trusted by businesses and households across Australia.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-card rounded-xl border p-6 space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
