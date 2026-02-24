import { AnimatedSection } from "@/components/AnimatedSection";
import whyInvestBg from "@/assets/why-invest-bg.jpg";

export const WhyInvestSection = () => {
  return (
    <section className="relative py-20 md:py-28">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${whyInvestBg})` }}
      />
      <div className="absolute inset-0 bg-foreground/75" />
      <div className="container relative z-10 max-w-3xl text-center">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Why Invest In Cleaning Supplies?
          </h2>
          <p className="text-primary-foreground/85 leading-relaxed mb-6">
            Soap and water do an excellent job keeping yourself clean, but they can't thoroughly sanitise your surroundings. Investing in the proper cleaning supplies can go a long way for stubborn messes, too challenging to clean by hand, or require better tools to clean properly.
          </p>
          <p className="text-primary-foreground/85 leading-relaxed">
            Our staff at GRAPC understand the need for a clean environment and are committed to providing our clients with the best cleaning products and equipment in Australia. Proper cleaning supplies can make your surroundings more presentable, improving your quality of life.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};
