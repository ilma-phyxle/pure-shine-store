const brands = [
  "Jasol", "Advance", "Chemtec", "Regal", "EcoClean", "ProShine", "AustraClean", "CleanForce",
];

export const BrandsSection = () => {
  return (
    <section className="py-12 border-b bg-card">
      <div className="container">
        <p className="text-center text-sm text-muted-foreground font-medium mb-8 uppercase tracking-wider">
          Trusted Brands We Stock
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {brands.map((brand) => (
            <span
              key={brand}
              className="text-lg md:text-xl font-bold text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors cursor-default"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
