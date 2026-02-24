import { motion } from "framer-motion";

import logoJasol from "@/assets/brands/jasol.png";
import logoAdvance from "@/assets/brands/advance.png";
import logoChemtec from "@/assets/brands/chemtec.png";
import logoRegal from "@/assets/brands/regal.png";
import logoEcoClean from "@/assets/brands/ecoclean.png";
import logoProShine from "@/assets/brands/proshine.png";
import logoAustraClean from "@/assets/brands/austraclean.png";
import logoCleanForce from "@/assets/brands/cleanforce.png";

const brands = [
  { name: "Jasol", logo: logoJasol },
  { name: "Advance", logo: logoAdvance },
  { name: "Chemtec", logo: logoChemtec },
  { name: "Regal", logo: logoRegal },
  { name: "EcoClean", logo: logoEcoClean },
  { name: "ProShine", logo: logoProShine },
  { name: "AustraClean", logo: logoAustraClean },
  { name: "CleanForce", logo: logoCleanForce },
];

const doubled = [...brands, ...brands];

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
          className="flex gap-16 items-center whitespace-nowrap"
          animate={{ x: [0, -1200] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((brand, i) => (
            <img
              key={`${brand.name}-${i}`}
              src={brand.logo}
              alt={brand.name}
              className="h-12 md:h-14 w-auto object-contain flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
