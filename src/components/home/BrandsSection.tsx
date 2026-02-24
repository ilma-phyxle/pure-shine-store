import { motion } from "framer-motion";

const brands = [
  "Jasol", "Advance", "Chemtec", "Regal", "EcoClean", "ProShine", "AustraClean", "CleanForce",
  "Jasol", "Advance", "Chemtec", "Regal", "EcoClean", "ProShine", "AustraClean", "CleanForce",
];

export const BrandsSection = () => {
  return (
    <section className="py-10 border-b bg-card overflow-hidden">
      <p className="text-center text-xs text-muted-foreground font-medium mb-6 uppercase tracking-widest">
        Trusted Brands We Stock
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-card to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-card to-transparent z-10" />
        <motion.div
          className="flex gap-12 items-center whitespace-nowrap"
          animate={{ x: [0, -1200] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {brands.map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="text-xl md:text-2xl font-bold text-muted-foreground/30 select-none flex-shrink-0"
            >
              {brand}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
