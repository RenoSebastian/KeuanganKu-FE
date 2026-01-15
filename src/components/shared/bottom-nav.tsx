"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, PieChart, History, User, Building2 } from "lucide-react"; // Tambah Icon Building2
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
    { label: "Riwayat", icon: History, href: "/history" },
    { label: "Calculator", icon: PieChart, href: "/calculator/budget" }, // Tengah
    
    // LOGIC KEREN: Jika Role DIRECTOR, tampilkan menu Direksi. Jika tidak, tampilkan Profil
    role === "DIRECTOR" 
      ? { label: "Direksi", icon: Building2, href: "/director" }
      : { label: "Profil", icon: User, href: "/profile" }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 pb-safe z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
      <div className="flex justify-around items-center h-20 max-w-md mx-auto px-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300",
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
                "text-[10px] font-medium transition-all duration-300",
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