import { Link } from "react-router-dom";
import { ArrowRight, FlaskConical, SprayCan, WashingMachine, Scroll, ShieldCheck, Sparkles } from "lucide-react";

const services = [
  {
    icon: FlaskConical,
    title: "Cleaning Chemicals",
    description: "Disinfectants, degreasers, sanitisers, and all-purpose cleaners formulated for commercial and residential use.",
  },
  {
    icon: SprayCan,
    title: "Surface & Glass Care",
    description: "Professional-grade solutions for streak-free windows, mirrors, and all surface types including stainless steel.",
  },
  {
    icon: WashingMachine,
    title: "Laundry Products",
    description: "Detergents, fabric softeners, and stain removers for hotels, hospitals, restaurants, and households.",
  },
  {
    icon: Scroll,
    title: "Paper & Hygiene",
    description: "Paper towels, toilet rolls, tissue, and disposable wipes essential for restrooms and public areas.",
  },
  {
    icon: ShieldCheck,
    title: "Safety & PPE",
    description: "Gloves, masks, goggles, and protective equipment to keep your cleaning staff safe on the job.",
  },
  {
    icon: Sparkles,
    title: "Eco-Friendly Range",
    description: "Child and pet-safe cleaning products that deliver powerful results without harming the environment.",
  },
];

export const ServicesSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Our Product Range</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From industrial-strength cleaners to eco-friendly solutions — we supply everything you need for a spotless space.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="group p-6 rounded-xl border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.description}</p>
              <Link
                to="/shop"
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Shop Now <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
