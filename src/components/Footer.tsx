import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt=" " className="h-14 w-14 rounded-lg object-contain bg-primary-foreground/10 p-1" />
              <span className="font-display font-bold text-xl"> </span>
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
              <li><Link to="/blog" className="hover:text-primary-foreground transition-colors">Blog</Link></li>
              <li><Link to="/about" className="hover:text-primary-foreground transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary-foreground transition-colors">Contact</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-primary-foreground transition-colors">Shipping Policy</Link></li>
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
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" />  +61 416 163 126  </li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@cleanyglow.co.au</li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5" /> Tarneit, Australia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()}   Cleaning Supplies. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
