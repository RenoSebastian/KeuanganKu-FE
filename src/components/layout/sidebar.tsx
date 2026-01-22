"use client";

import { 
  Home, Calculator, Wallet, History, User, LogOut, 
  LayoutDashboard, Users, Database, Settings, ShieldCheck,
  ShieldAlert, BarChart3
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // State untuk Role Management
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDirector, setIsDirector] = useState(false);

  useEffect(() => {
    // --- LOGIKA CEK ROLE (Tahap 2) ---
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setIsAdmin(user.role === 'ADMIN');
      setIsDirector(user.role === 'DIRECTOR');
    } else {
      // Fallback untuk Demo/Development: Hardcode salah satu true jika diperlukan
      // setIsDirector(true); 
    }
  }, []);

  const navItems = [
    { label: "Dashboard", icon: Home, href: "/" },
    { label: "Kalkulator", icon: Calculator, href: "/calculator/budget" },
    { label: "Keuangan", icon: Wallet, href: "/finance" },
    { label: "Riwayat", icon: History, href: "/history" },
    { label: "Profil", icon: User, href: "/profile" },
  ];

  const adminNavItems = [
    { label: "Dashboard Admin", icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: "Manajemen User", icon: Users, href: "/admin/users" },
    { label: "Data Master", icon: Database, href: "/admin/master-data" },
    { label: "Konfigurasi", icon: Settings, href: "/admin/settings" },
  ];

  const executiveNavItems = [
    { label: "Director Panel", icon: ShieldAlert, href: "/director" },
  ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }
    router.push("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-slate-200 bg-white/50 backdrop-blur-xl sticky top-0 left-0 z-40 font-sans">
      
      {/* 1. Header Logo */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="relative w-8 h-8">
          <Image 
            src="/images/pamjaya-logo.png" 
            alt="Logo" 
            fill 
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 text-sm">KeuanganKu</h1>
          <p className="text-xs text-slate-500">PAM JAYA</p>
        </div>
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        
        {/* GROUP: MENU UTAMA (Semua User) */}
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Menu Utama</p>
        <div className="space-y-1 mb-6">
            {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
                <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                    isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
                >
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
                {item.label}
                </Link>
            );
            })}
        </div>

        {/* GROUP: EXECUTIVE MENU (Khusus Direksi) */}
        {isDirector && (
            <>
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <BarChart3 className="w-3 h-3 text-blue-500" /> Executive Menu
                </p>
                <div className="space-y-1 mb-6">
                    {executiveNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                            isActive
                            ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                        >
                        <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-900")} />
                        {item.label}
                        </Link>
                    );
                    })}
                </div>
            </>
        )}

        {/* GROUP: ADMINISTRATOR (Khusus Admin) */}
        {isAdmin && (
            <>
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> Administrator
                </p>
                <div className="space-y-1">
                    {adminNavItems.map((item) => {
                    const isActive = pathname.startsWith(item.href); 
                    return (
                        <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                            isActive
                            ? "bg-slate-800 text-white shadow-md shadow-slate-800/20"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                        >
                        <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-800")} />
                        {item.label}
                        </Link>
                    );
                    })}
                </div>
            </>
        )}

      </nav>

      {/* 3. Footer / Logout */}
      <div className="p-4 border-t border-slate-100">
        <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Keluar Aplikasi
        </button>
      </div>
    </aside>
  );
}