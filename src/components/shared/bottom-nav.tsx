"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, PieChart, History, User, Building2, Wallet } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  // Cek Role saat component mount (Client Side)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setRole(user.role);
    }
  }, []);

  const menuItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Keuangan", icon: Wallet, href: "/finance" }, // ✅ Menu Finance
    { label: "Hitung", icon: PieChart, href: "/calculator/budget" }, // Tengah
    { label: "Riwayat", icon: History, href: "/history" },
    
    // Logic Role Director (Kondisional)
    role === "DIRECTOR" 
      ? { label: "Direksi", icon: Building2, href: "/director" }
      : { label: "Profil", icon: User, href: "/profile" }
  ];

  return (
    // 🔥 UPDATE: Menggunakan class 'backdrop-blur-xl' dan border halus sesuai tema Fase 1
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      
      <div className="flex justify-around items-center h-20 max-w-md mx-auto px-2">
        {menuItems.map((item) => {
          // Logic Active: Support sub-path (misal /finance/detail tetap aktif di menu Finance)
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "group flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 relative",
                // Menggunakan warna Brand PAM (brand-600) bukan default blue
                isActive 
                  ? "text-brand-600 -translate-y-1" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              {/* Background Glow saat Active (Subtle) */}
              {isActive && (
                <div className="absolute inset-0 bg-brand-50 rounded-2xl -z-10 animate-in zoom-in duration-300" />
              )}

              <div className={cn(
                "relative p-1.5 transition-all duration-300",
                isActive && "scale-105"
              )}>
                {/* Icon dengan sentuhan fill brand-100 saat aktif */}
                <Icon 
                    className={cn(
                        "w-6 h-6 transition-colors duration-300", 
                        isActive ? "fill-brand-100/50 stroke-brand-600" : "stroke-slate-400"
                    )} 
                    strokeWidth={isActive ? 2.5 : 2} 
                />
              </div>
              
              {/* Label Text Animasi */}
              <span className={cn(
                "text-[9px] font-bold transition-all duration-300 absolute bottom-1.5",
                isActive ? "opacity-100 translate-y-0 text-brand-700" : "opacity-0 translate-y-2"
              )}>
                {item.label}
              </span>

              {/* Dot Indikator Kecil jika tidak aktif (Estetika) */}
              {!isActive && (
                  <span className="absolute bottom-2 w-0.5 h-0.5 bg-slate-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}