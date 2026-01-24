"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { NAVIGATION_CONFIG } from "@/config/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // State untuk Role Management
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDirector, setIsDirector] = useState(false);
  // Tambahan info user untuk ditampilkan di sidebar bawah
  const [userInitials, setUserInitials] = useState("U");

  useEffect(() => {
    // --- LOGIKA CEK ROLE (Client Side Hydration) ---
    // Mengambil data user dari localStorage setelah mount untuk menghindari hydration mismatch
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setIsAdmin(user.role === 'ADMIN');
        setIsDirector(user.role === 'DIRECTOR');
        
        // Generate inisial nama (Misal: "Budi Santoso" -> "BS")
        if (user.fullName) {
            const names = user.fullName.split(' ');
            const initials = names[0].charAt(0) + (names.length > 1 ? names[names.length-1].charAt(0) : "");
            setUserInitials(initials.toUpperCase());
        }
      } catch (e) {
        console.error("Gagal parsing user data", e);
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        // Hapus cookie juga jika ada (optional, tergantung implementasi auth)
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    router.push("/login");
  };

  // Helper Component untuk render link
  const NavLink = ({ item, variant = "default" }: { item: any, variant?: "default" | "admin" | "exec" }) => {
    // Logic active state: 
    // - Admin/Director: Active jika URL diawali dengan href (Nested route friendly)
    // - Default: Active jika URL sama persis (Exact match)
    const isActive = variant !== "default" 
        ? pathname.startsWith(item.href) 
        : pathname === item.href;
    
    // Warna khusus per role (Visual Hierarchy)
    let activeClass = "bg-brand-700 text-white shadow-lg shadow-brand-700/20"; // Default PAM Blue
    let iconActiveColor = "text-white";

    if (variant === "exec") {
        activeClass = "bg-slate-800 text-white shadow-md shadow-slate-900/20"; // Dark Grey for Exec
    } else if (variant === "admin") {
        activeClass = "bg-teal-700 text-white shadow-md shadow-teal-700/20"; // Teal for Admin
    }

    return (
        <Link
            href={item.href}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 mx-2 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                    ? activeClass 
                    : "text-slate-500 hover:bg-brand-50 hover:text-brand-700"
            )}
        >
            <item.icon className={cn(
                "w-5 h-5 transition-colors duration-300", 
                isActive ? iconActiveColor : "text-slate-400 group-hover:text-brand-600"
            )} />
            <span className="relative z-10">{item.label}</span>
            
            {/* Indikator Active Kecil di Kiri (Design Accent) */}
            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-white/20" />}
        </Link>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-slate-200 bg-white sticky top-0 left-0 z-40 shadow-xl shadow-slate-200/50">
      
      {/* 1. Header Logo (Branding Area) */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50">
        <div className="relative w-10 h-10 drop-shadow-sm">
          <Image 
            src="/images/pamjaya-logo.png" 
            alt="Logo PAM JAYA" 
            fill 
            className="object-contain"
            priority
          />
        </div>
        <div>
          <h1 className="font-extrabold text-lg leading-tight bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">
            KeuanganKu
          </h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">PAM JAYA</p>
        </div>
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 py-6 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
        
        {/* GROUP: MENU UTAMA (All Users) */}
        <div>
            <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Menu Utama</p>
            <div className="space-y-0.5">
                {NAVIGATION_CONFIG.main.map((item) => <NavLink key={item.href} item={item} />)}
            </div>
        </div>

        {/* GROUP: EXECUTIVE MENU (Director Only) */}
        {isDirector && (
            <div>
                <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                    Executive
                </p>
                <div className="space-y-0.5">
                    {NAVIGATION_CONFIG.director.map((item) => <NavLink key={item.href} item={item} variant="exec" />)}
                </div>
            </div>
        )}

        {/* GROUP: ADMINISTRATOR (Admin Only) */}
        {isAdmin && (
            <div>
                 <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    Administrator
                </p>
                <div className="space-y-0.5">
                    {NAVIGATION_CONFIG.admin.map((item) => <NavLink key={item.href} item={item} variant="admin" />)}
                </div>
            </div>
        )}

      </nav>

      {/* 3. Footer / User Profile Snippet */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button 
            onClick={handleLogout}
            className="group flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-300 shadow-sm"
        >
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                {userInitials}
             </div>
             <span className="group-hover:translate-x-1 transition-transform">Keluar</span>
          </div>
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
        </button>
      </div>
    </aside>
  );
}