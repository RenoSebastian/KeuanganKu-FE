"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, ClipboardCheck, User, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
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
      isPrimary: false
    },
    {
      label: "Profil",
      icon: User,
      href: "/profile",
      isPrimary: false
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">

      {/* Container Background dengan efek Glassmorphism & Shadow halus */}
      <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex justify-between items-end h-16 max-w-md mx-auto px-6 relative">

          {menuItems.map((item) => {
            const Icon = item.icon;

            // Logic Active State yang Strict
            // Mencegah '/finance' menyala saat kita berada di '/finance/checkup'
            let isActive = false;
            if (item.href === "/finance") {
              isActive = pathname.startsWith("/finance") && !pathname.startsWith("/finance/checkup");
            } else {
              isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            }

            // RENDER: Primary Button (Tengah / Checkup)
            if (item.isPrimary) {
              return (
                <div key={item.href} className="relative -top-5 group">
                  <button
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300",
                      "bg-linear-to-tr from-blue-600 to-indigo-600 text-white border-4 border-slate-50",
                      isActive ? "shadow-blue-500/40 translate-y-0 scale-110" : "shadow-slate-400/20 hover:scale-105"
                    )}
                  >
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                  </button>
                  <span className={cn(
                    "absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wide transition-colors",
                    isActive ? "text-indigo-600" : "text-slate-400"
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
                className="group flex flex-col items-center justify-center w-12 h-full pb-2 relative outline-none"
              >
                {/* Icon Wrapper */}
                <div className={cn(
                  "p-1.5 rounded-xl transition-all duration-300 mb-1",
                  isActive ? "bg-blue-50 text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                )}>
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-all duration-300",
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
                  <span className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full animate-in zoom-in" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}