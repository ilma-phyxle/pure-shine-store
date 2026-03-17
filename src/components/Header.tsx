import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/CartDrawer";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { useCatalogApi } from "@/hooks/useCatalogApi";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "New Arrivals", to: "/shop?arrivals=true" },
  { label: "Hot Deals", to: "/shop?hot=true" },
  { label: "Shop By Brand", to: "/shop?brands=true" },
  { label: "Blog", to: "/blog" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const location = useLocation();
  const { categories } = useCatalogApi();
  const [showArrivalsEnabled, setShowArrivalsEnabled] = useState(true);
  const [showHotEnabled, setShowHotEnabled] = useState(true);
  const [showBrandsEnabled, setShowBrandsEnabled] = useState(true);
  const mobileOpenAtRef = useRef(0);
  const mobileOpenScrollRef = useRef(0);

  const SETTINGS_KEYS = {
    arrivals: "shop_show_new_arrivals",
    hotDeals: "shop_show_hot_deals",
    brands: "shop_show_brands",
  };

  useEffect(() => {
    const readToggle = (key: string, fallback = true) => {
      const value = localStorage.getItem(key);
      if (value === null) return fallback;
      return value === "true";
    };
    const load = () => {
      setShowArrivalsEnabled(readToggle(SETTINGS_KEYS.arrivals, true));
      setShowHotEnabled(readToggle(SETTINGS_KEYS.hotDeals, true));
      setShowBrandsEnabled(readToggle(SETTINGS_KEYS.brands, true));
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (Object.values(SETTINGS_KEYS).includes(e.key)) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const filteredNavLinks = navLinks.filter((link) => {
    if (link.label === "New Arrivals") return showArrivalsEnabled;
    if (link.label === "Hot Deals") return showHotEnabled;
    if (link.label === "Shop By Brand") return showBrandsEnabled;
    return true;
  });

  useEffect(() => {
    const onScroll = () => {
      setProductsOpen(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    mobileOpenAtRef.current = Date.now();
    mobileOpenScrollRef.current = window.scrollY;
    const onScroll = () => setMobileOpen(false);
    const onScrollGuarded = () => {
      if (Date.now() - mobileOpenAtRef.current < 120) return;
      if (window.scrollY === mobileOpenScrollRef.current) return;
      onScroll();
    };
    window.addEventListener("scroll", onScrollGuarded, { passive: true });
    return () => window.removeEventListener("scroll", onScrollGuarded);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt=" " className="h-28 w-28 rounded-lg object-contain" />
          <span className="font-display font-bold text-3xl tracking-tight"> </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <div
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <button
              type="button"
              aria-label="Toggle categories"
              aria-expanded={productsOpen}
              onClick={() => setProductsOpen((open) => !open)}
              className={cn(
                "px-5 py-3 rounded-md text-base font-medium transition-colors inline-flex items-center gap-2",
                location.pathname === "/shop" || productsOpen
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span>Products</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", productsOpen ? "rotate-180" : "rotate-0")} />
            </button>
            {productsOpen && (
              <div className="absolute left-0 top-full h-3 w-full pointer-events-auto" />
            )}
            {productsOpen && (
              <div className="absolute left-0 top-full translate-y-3 w-[720px] rounded-2xl border border-primary bg-primary shadow-xl p-6 z-50">
                <div className="grid grid-cols-3 gap-3">
                  <Link
                    to="/shop"
                    onClick={() => setProductsOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    All Products
                  </Link>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/shop?cat=${category.slug || category.id}`}
                        onClick={() => setProductsOpen(false)}
                        className="px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))
                  ) : (
                    <p className="col-span-3 text-sm text-white/70">No categories available.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <Link
            to="/"
            className={cn(
              "px-5 py-3 rounded-md text-base font-medium transition-colors",
              location.pathname === "/"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Home
          </Link>
          {filteredNavLinks.slice(1).map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "px-5 py-3 rounded-md text-base font-medium transition-colors",
                location.pathname === link.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CartDrawer />
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-card">
          <div className="container py-4 flex flex-col gap-1">
            <Link
              to="/shop"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "px-4 py-3 rounded-md text-base font-medium transition-colors",
                location.pathname === "/shop"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Products
            </Link>
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "px-4 py-3 rounded-md text-base font-medium transition-colors",
                location.pathname === "/"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Home
            </Link>
            {filteredNavLinks.filter((link) => link.label !== "Home").map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-md text-base font-medium transition-colors",
                  location.pathname === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
