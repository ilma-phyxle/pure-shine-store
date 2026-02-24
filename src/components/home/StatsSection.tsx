import { AnimatedSection } from "@/components/AnimatedSection";
import { Building2, Users, Award, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const stats = [
  { icon: Building2, value: 2500, suffix: "+", label: "Businesses Served" },
  { icon: Users, value: 15000, suffix: "+", label: "Happy Customers" },
  { icon: Award, value: 12, suffix: "", label: "Years in Business" },
  { icon: TrendingUp, value: 98, suffix: "%", label: "Satisfaction Rate" },
];

const Counter = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="text-3xl md:text-4xl font-extrabold text-primary">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

export const StatsSection = () => {
  return (
    <section className="py-16 md:py-20 bg-card border-y">
      <div className="container">
        <AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center space-y-2">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <Counter target={stat.value} suffix={stat.suffix} />
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
