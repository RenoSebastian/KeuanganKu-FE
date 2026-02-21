"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, ClipboardCheck, User, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  // Konfigurasi Menu
  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutGrid,
      href: "/dashboard",
      isPrimary: false
    },
    {
      label: "Keuangan",
      icon: Wallet,
      href: "/finance",
      isPrimary: false
    },
    // [HIGHLIGHT] Menu Checkup dibuat menonjol (Floating)
    {
      label: "Checkup",
      icon: ClipboardCheck,
      href: "/finance/checkup",
      isPrimary: true // Diubah ke true agar ter-render sebagai tombol tengah yang menonjol
    },
    {
      label: "Profil",
      icon: User,
      href: "/profile",
      isPrimary: false
    }
  ];

  return (
    // 1. md:hidden agar hilang di PC/Tablet
    // 2. Select-none agar teks tidak terblok biru saat ditekan lama
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-100 select-none">

      {/* Container Background dengan efek Glassmorphism & Shadow halus.
        [FIX] pb-[calc(env(safe-area-inset-bottom)+8px)] digunakan sebagai penyelamat Poni / Home Indicator iOS 
      */}
      <div className="bg-white/90 backdrop-blur-2xl border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2">
        <div className="flex justify-around items-end h-14 max-w-md mx-auto px-4 relative">

          {menuItems.map((item) => {
            const Icon = item.icon;

            // Logic Active State yang Strict
            let isActive = false;
            if (item.href === "/finance") {
              isActive = pathname.startsWith("/finance") && !pathname.startsWith("/finance/checkup");
            } else {
              isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            }

            // RENDER: Primary Button (Tengah / Checkup Floating)
            if (item.isPrimary) {
              return (
                <div key={item.href} className="relative -top-6 group">
                  <button
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300",
                      // [KOREKSI 1]: Menggunakan syntax gradient standar Tailwind
                      "bg-linear-to-tr from-blue-600 to-indigo-600 text-white border-4 border-slate-50",
                      isActive ? "shadow-blue-500/40 translate-y-0 scale-110" : "shadow-slate-400/20 hover:scale-105 active:scale-95"
                    )}
                  >
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                  </button>
                  <span className={cn(
                    "absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wide transition-colors whitespace-nowrap",
                    isActive ? "text-indigo-700" : "text-slate-500"
                  )}>
                    {item.label}
                  </span>
                </div>
              );
            }

            // RENDER: Standard Menu Item
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                // Tambahkan active:scale-90 agar terasa "membal" saat di-tap seperti App Native
                className="group flex flex-col items-center justify-center w-16 h-full pb-1 relative outline-none transition-transform active:scale-90"
              >
                {/* Icon Wrapper */}
                <div className={cn(
                  "p-1.5 rounded-2xl transition-all duration-300 mb-1",
                  isActive ? "bg-blue-50 text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                )}>
                  <Icon
                    className={cn(
                      // [KOREKSI 2]: Memperbaiki penulisan arbitrary width yang error
                      "w-5.5 transition-all duration-300",
                      isActive && "fill-blue-200/50"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>

                {/* Label */}
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-300",
                  isActive ? "text-blue-700 font-bold" : "text-slate-400"
                )}>
                  {item.label}
                </span>

                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute bottom-0 w-1 h-1 bg-blue-600 rounded-full animate-in zoom-in" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}