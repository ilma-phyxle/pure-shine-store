import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Truck, Award, Users, ArrowRight } from "lucide-react";

const values = [
  { icon: Shield, title: "Quality First", desc: "We source only the best cleaning products from trusted manufacturers." },
  { icon: Truck, title: "Reliable Delivery", desc: "Fast, dependable shipping across Australia — your supplies arrive on time." },
  { icon: Award, title: "Expert Knowledge", desc: "Our team provides professional advice to help you choose the right products." },
  { icon: Users, title: "Customer Focus", desc: "Building lasting partnerships with businesses of all sizes is our priority." },
];

const About = () => {
  return (
    <main>
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About  </h1>
          <p className="text-lg text-primary-foreground/80 leading-relaxed">
              Cleaning Supplies is your trusted partner for commercial and residential cleaning products.
            We're an Australian-owned business dedicated to providing premium quality supplies at competitive prices.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <h2 className="text-3xl font-bold">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed">
              Founded with a mission to make professional-grade cleaning supplies accessible to everyone,
                has grown to serve thousands of satisfied customers across Australia. From small businesses
              to large facilities, we provide the cleaning solutions that keep spaces hygienic and welcoming.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We believe that clean environments contribute to health, productivity, and well-being.
              That's why we carefully curate our product range and offer expert guidance to help you find
              exactly what you need.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v) => (
              <div key={v.title} className="text-center space-y-4 p-6 rounded-xl bg-card border">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <v.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary text-secondary-foreground text-center">
        <div className="container">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-secondary-foreground/80 mb-8 max-w-lg mx-auto">
            Browse our extensive catalog or reach out for a custom bulk order quote.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8">
              <Link to="/shop">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
