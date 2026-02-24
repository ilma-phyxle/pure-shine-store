import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <span className="font-bold text-sm">G</span>
              </div>
              <span className="font-display font-bold text-lg">GRAPC</span>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Your trusted partner for commercial and residential cleaning supplies. Quality products, competitive prices.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/" className="hover:text-primary-foreground transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-primary-foreground transition-colors">Shop</Link></li>
              <li><Link to="/about" className="hover:text-primary-foreground transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/shop" className="hover:text-primary-foreground transition-colors">Floor Care</Link></li>
              <li><Link to="/shop" className="hover:text-primary-foreground transition-colors">Disinfectants</Link></li>
              <li><Link to="/shop" className="hover:text-primary-foreground transition-colors">Hand Hygiene</Link></li>
              <li><Link to="/shop" className="hover:text-primary-foreground transition-colors">Paper Products</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 1300 GRAPC</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@grapc.com.au</li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5" /> Sydney, Australia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} GRAPC Cleaning Supplies. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
