"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, ClipboardCheck, User, Wallet, LayoutDashboard, Users, FileCheck, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith("/admin");

  const userMenuItems = [
    { label: "Dashboard", icon: LayoutGrid, href: "/dashboard" },
    { label: "Keuangan", icon: Wallet, href: "/finance" },
    { label: "Checkup", icon: ClipboardCheck, href: "/calculator/checkup" },
    { label: "Profil", icon: User, href: "/profile" }
  ];

  const adminMenuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: "Verifikasi", icon: FileCheck, href: "/admin/verification" },
    { label: "Users", icon: Users, href: "/admin/users" },
    { label: "Data Master", icon: Database, href: "/admin/master-data" }
  ];

  const menuItems = isAdminRoute ? adminMenuItems : userMenuItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-100 select-none">
      {/* Container Background */}
      <div className="bg-white/90 backdrop-blur-2xl border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2">
        <div className="flex justify-around items-end h-14 max-w-md mx-auto px-4 relative">

          {menuItems.map((item) => {
            const Icon = item.icon;

            // Logic Active State yang Akurat & Dinamis
            let isActive = false;
            if (item.href === "/calculator") {
              isActive = pathname === "/calculator" || (pathname.startsWith("/calculator/") && !pathname.startsWith("/calculator/checkup"));
            } else if (item.href === "/dashboard") {
              isActive = pathname.startsWith("/dashboard");
            } else {
              isActive = pathname.startsWith(item.href);
            }

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="group relative flex flex-col items-center justify-center w-16 h-14 outline-none"
              >
                {/* Wadah Ikon:
                  Di sinilah keajaiban animasi terjadi. Ketika isActive bernilai true, 
                  wadah ini akan melayang ke atas (-top-6), membesar, berubah menjadi lingkaran,
                  dan memunculkan gradien warna serta border tebal.
                */}
                <div
                  className={cn(
                    "absolute flex items-center justify-center transition-all duration-500 ease-in-out",
                    isActive
                      ? "-top-6 w-14 h-14 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40 border-4 border-slate-50 scale-100"
                      : "top-1.5 w-10 h-10 rounded-2xl bg-transparent text-slate-400 group-hover:text-slate-600 scale-100 active:scale-90"
                  )}
                >
                  <Icon
                    className={cn(
                      "transition-all duration-500 ease-in-out",
                      isActive ? "w-6 h-6" : "w-5.5"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>

                {/* Label Teks:
                  Teks akan bergeser turun sedikit dan menebal ketika ikon melayang ke atas.
                */}
                <span
                  className={cn(
                    "absolute text-[10px] transition-all duration-500 ease-in-out whitespace-nowrap",
                    isActive
                      ? "-bottom-0.5 font-bold text-indigo-700"
                      : "bottom-1 font-medium text-slate-400"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

        </div>
      </div>
    </nav>
  );
}