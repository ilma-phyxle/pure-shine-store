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
    <section className="py-14 md:py-20 border-b bg-transparent overflow-hidden">
      <h2 className="text-center text-lg md:text-2xl font-bold mb-10 uppercase tracking-wide text-secondary">
        Trusted Brands We Stock
      </h2>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        <motion.div
          className="flex gap-20 md:gap-28 items-center whitespace-nowrap"
          animate={{ x: [0, -1600] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((brand, i) => (
            <img
              key={`${brand.name}-${i}`}
              src={brand.logo}
              alt={brand.name}
              className="h-16 md:h-20 lg:h-24 w-auto object-contain flex-shrink-0 hover:scale-105 transition-transform"
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
