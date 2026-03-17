import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    Layers,
    Warehouse,
    FileText,
    BookOpen,
    Image as ImageIcon,
    Settings,
    Globe,
    ShieldCheck,
    Puzzle,
    Search,
    Bell,
    User,
    ChevronRight,
    Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminLayoutProps {
    children: React.ReactNode;
}

const sidebarItems = [
    { label: "Catalog Manager", icon: Layers, path: "/admin/catalog-pro", badge: null },
    { label: "New Arrivals", icon: Package, path: "/admin/new-arrivals", badge: "NEW" },
    { label: "Orders", icon: ShoppingBag, path: "/admin/orders", badge: "New" },
    { label: "Settings", icon: Settings, path: "/admin/settings", badge: null },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("admin_authed");
        navigate("/admin-login", { replace: true });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
                <Sidebar className="border-r border-slate-200 bg-white">
                    <SidebarHeader className="p-6">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                                C
                            </div>
                            <span className="font-display font-bold text-xl tracking-tight">Cleaners</span>
                        </Link>
                    </SidebarHeader>
                    <SidebarContent className="px-4">
                        <SidebarMenu className="gap-1">
                            {sidebarItems.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={location.pathname === item.path}
                                        className={cn(
                                            "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                            location.pathname === item.path
                                                ? "bg-primary/10 text-primary border border-primary/20"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                                        )}
                                    >
                                        <Link to={item.path}>
                                            <item.icon className={cn(
                                                "h-4 w-4 shrink-0 transition-colors",
                                                location.pathname === item.path ? "text-primary" : "text-slate-400 group-hover:text-slate-700"
                                            )} />
                                            <span className="font-medium">{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter className="p-6 border-t border-slate-200">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 rounded-lg border border-slate-200">
                                <AvatarFallback className="bg-slate-100 text-slate-500 text-xs">AD</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">Admin</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Manager</p>
                            </div>
                        </div>
                    </SidebarFooter>
                </Sidebar>

                <SidebarInset className="flex flex-col bg-slate-50">
                    {/* Simplified Top Header */}
                    <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 bg-white/80 backdrop-blur-xl z-40">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="md:hidden text-slate-500" />
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">
                                {sidebarItems.find(i => i.path === location.pathname)?.label || "Settings"}
                            </h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl border border-slate-200 hover:bg-slate-100">
                                        <User className="h-4 w-4 text-slate-500" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 text-slate-900 shadow-2xl">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-slate-200" />
                                    <DropdownMenuItem className="hover:bg-slate-100 focus:bg-slate-100">Profile</DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-slate-200" />
                                    <DropdownMenuItem 
                                        className="text-red-400 hover:bg-red-950/30 focus:bg-red-950/30 cursor-pointer"
                                        onClick={handleLogout}
                                    >
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 p-6 md:p-8 animate-in fade-in duration-500">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};
