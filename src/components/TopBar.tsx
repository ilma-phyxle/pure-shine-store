import { Phone, Mail } from "lucide-react";

export const TopBar = () => {
  return (
    <div className="bg-primary text-primary-foreground text-xs py-2 border-b border-primary-foreground/10">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="tel:1300472722" className="flex items-center gap-1.5 hover:text-secondary transition-colors">
            <Phone className="h-3 w-3" /> 1300 GRAPC
          </a>
          <a href="mailto:info@grapc.com.au" className="hidden sm:flex items-center gap-1.5 hover:text-secondary transition-colors">
            <Mail className="h-3 w-3" /> info@grapc.com.au
          </a>
        </div>
        <p className="hidden md:block font-medium tracking-wide uppercase">
          High-Quality Cleaning Supplies
        </p>
        <p className="text-primary-foreground/70">
          Free shipping on orders over $150
        </p>
      </div>
    </div>
  );
};
