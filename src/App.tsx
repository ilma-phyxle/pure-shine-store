import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCartSync } from "@/hooks/useCartSync";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import AdminHome from "./pages/AdminHome";
import AdminCatalog from "./pages/AdminCatalog";
import AdminCatalogPro from "@/pages/AdminCatalogPro";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminCustomers from "./pages/AdminCustomers";
import AdminInventory from "./pages/AdminInventory";
import AdminLogin from "./pages/AdminLogin";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { ScrollToTop } from "@/components/ScrollToTop";
import { RouteLoading } from "@/components/RouteLoading";

const queryClient = new QueryClient();

const AppContent = () => {
  useCartSync();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const isAuthed = localStorage.getItem("admin_authed") === "true";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <RouteLoading pathname={location.pathname} />
      {!isAdminPath && <TopBar />}
      {!isAdminPath && <Header />}
      <div className="flex-1">
        <Routes>
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:handle" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={isAuthed ? <AdminCatalogPro /> : <Navigate to="/admin-login" state={{ from: "/admin" }} replace />} />
          <Route path="/admin/catalog" element={isAuthed ? <AdminCatalog /> : <Navigate to="/admin-login" state={{ from: "/admin/catalog" }} replace />} />
          <Route path="/admin/catalog-pro" element={isAuthed ? <AdminCatalogPro /> : <Navigate to="/admin-login" state={{ from: "/admin/catalog-pro" }} replace />} />
          <Route path="/admin/products" element={isAuthed ? <AdminProducts /> : <Navigate to="/admin-login" state={{ from: "/admin/products" }} replace />} />
          <Route path="/admin/orders" element={isAuthed ? <AdminOrders /> : <Navigate to="/admin-login" state={{ from: "/admin/orders" }} replace />} />
          <Route path="/admin/customers" element={isAuthed ? <AdminCustomers /> : <Navigate to="/admin-login" state={{ from: "/admin/customers" }} replace />} />
          <Route path="/admin/inventory" element={isAuthed ? <AdminInventory /> : <Navigate to="/admin-login" state={{ from: "/admin/inventory" }} replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isAdminPath && <Footer />}
      <ChatbotWidget />
      <ScrollToTop />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
