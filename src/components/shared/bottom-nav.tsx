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
    { label: "Keuangan", icon: Wallet, href: "/finance" }, // ✅ Menu Finance Ditambahkan
    { label: "Hitung", icon: PieChart, href: "/calculator/budget" }, // Tengah
    { label: "Riwayat", icon: History, href: "/history" },
    
    // Logic Role Director
    role === "DIRECTOR" 
      ? { label: "Direksi", icon: Building2, href: "/director" }
      : { label: "Profil", icon: User, href: "/profile" }
  ];

  return (
    // 🔥 PERBAIKAN UTAMA: Tambahkan 'md:hidden' disini agar HILANG di Desktop
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 pb-safe z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
      
      <div className="flex justify-around items-center h-20 max-w-md mx-auto px-1">
        {menuItems.map((item) => {
          // Logic Active: Support sub-path (misal /finance/detail tetap aktif di menu Finance)
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                // Ubah w-16 jadi w-14 atau w-12 biar muat 5 icon di HP kecil
                "flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300",
                isActive 
                  ? "text-blue-600 -translate-y-2 bg-blue-50/50" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              <div className={cn(
                "relative p-1.5 transition-all duration-300",
                isActive && "scale-110"
              )}>
                <Icon className={cn("w-6 h-6", isActive && "fill-blue-600/10")} strokeWidth={isActive ? 2.5 : 2} />
                
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full animate-in zoom-in" />
                )}
              </div>
              <span className={cn(
                "text-[9px] font-medium transition-all duration-300", // Font dikecilin dikit biar rapi
                isActive ? "opacity-100 font-bold translate-y-0.5" : "opacity-0 -translate-y-2 h-0"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}