"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { NAVIGATION_CONFIG } from "@/config/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  isCollapsed?: boolean;
}

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isDirector, setIsDirector] = useState(false);
  const [userInitials, setUserInitials] = useState("U");
  const [userRoleLabel, setUserRoleLabel] = useState("User");

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setIsAdmin(user.role === 'ADMIN');
        setIsDirector(user.role === 'DIRECTOR');
        setUserRoleLabel(user.role || "User");

        if (user.fullName) {
          const names = user.fullName.split(' ');
          const initials = names[0].charAt(0) + (names.length > 1 ? names[names.length - 1].charAt(0) : "");
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
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    router.push("/login");
  };

  // NavLink dengan Arsitektur Animasi Layer Independen
  const NavLink = ({ item, variant = "default" }: { item: any, variant?: "default" | "admin" | "exec" }) => {

    // Strict Active Logic
    let isActive = false;
    if (item.href === "/finance") {
      isActive = pathname === "/finance" || (pathname.startsWith("/finance/") && !pathname.startsWith("/finance/checkup"));
    } else if (item.href === "/dashboard") {
      isActive = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
    } else {
      isActive = pathname.startsWith(item.href);
    }

    const themeGradients: Record<string, string> = {
      default: "from-blue-600 to-indigo-600 shadow-blue-500/30",
      exec: "from-slate-800 to-slate-900 shadow-slate-800/30",
      admin: "from-teal-600 to-teal-700 shadow-teal-500/30"
    };

    const gradientClass = themeGradients[variant];

    const LinkContent = (
      <Link
        href={item.href}
        className={cn(
          "group relative flex items-center transition-all duration-500 ease-out outline-none",
          isCollapsed ? "justify-center w-12 h-12 mx-auto" : "px-3 py-3 mx-4",
          "rounded-xl" // Container utama tidak memiliki background
        )}
      >
        {/* 1. BACKGROUND LAYER (Absolute & Z-0)
            Pisahkan layer ini agar transisi scale tidak merusak flexbox konten di dalamnya.
        */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl transition-all duration-500 ease-out z-0",
            isActive
              ? `bg-linear-to-tr ${gradientClass} opacity-100 scale-100 shadow-lg`
              : "bg-slate-100/50 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
          )}
        />

        {/* 2. INNER INDICATOR LINE (Garis Samping)
            Animasi memanjang dan menebal dari tengah sumbu Y.
        */}
        <div
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full transition-all duration-500 ease-in-out z-10",
            isActive
              ? "w-1 h-8 bg-white/40 opacity-100"
              : "w-0.5 h-0 bg-slate-300 opacity-0 group-hover:h-5 group-hover:opacity-100"
          )}
        />

        {/* 3. CONTENT WRAPPER (Z-10 agar di atas background) */}
        <div className={cn(
          "relative z-10 flex items-center w-full transition-transform duration-500 ease-out",
          !isCollapsed && isActive ? "translate-x-1" : "translate-x-0"
        )}>
          {/* Ikon */}
          <item.icon className={cn(
            "transition-all duration-500 ease-out shrink-0",
            isCollapsed ? "w-6 h-6" : "w-5 h-5 mr-3",
            isActive ? "text-white scale-110 drop-shadow-sm" : "text-slate-400 group-hover:text-slate-700 group-hover:scale-110"
          )} />

          {/* Label Teks */}
          {!isCollapsed && (
            <span className={cn(
              "text-sm transition-all duration-500 whitespace-nowrap",
              isActive ? "font-bold text-white tracking-wide" : "font-medium text-slate-500 group-hover:text-slate-800"
            )}>
              {item.label}
            </span>
          )}
        </div>
      </Link>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              {LinkContent}
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10} className="font-semibold z-50">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return LinkContent;
  };

  return (
    <aside className="flex flex-col w-full h-full bg-white overflow-hidden pb-4">
      {/* HEADER LOGO */}
      <div className={cn(
        "py-4 flex flex-col items-center justify-center border-b border-slate-100 bg-linear-to-brom-white to-slate-50/50 transition-all duration-300",
        isCollapsed ? "min-h-18" : ""
      )}>
        {!isCollapsed ? (
          <>
            <div className="relative w-24 h-24 drop-shadow-md">
              <Image src="/images/logokeuanganku.png" alt="Logo KeuanganKu" fill className="object-contain" priority />
            </div>
            <div className="text-center px-4 -mt-7">
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.2em] leading-tight mt-0.5 whitespace-nowrap">
                financial conversation tools
              </p>
            </div>
          </>
        ) : (
          <div className="relative w-10 h-10 drop-shadow-sm transition-transform duration-500 hover:scale-110">
            <Image src="/images/logokeuanganku.png" alt="Logo" fill className="object-contain" priority />
          </div>
        )}
      </div>

      {/* NAVIGATION MENU */}
      <nav className="flex-1 py-6 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
        {!isAdmin && (
          <div>
            {!isCollapsed ? (
              <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 whitespace-nowrap">Menu Utama</p>
            ) : (
              <div className="w-full flex justify-center mb-3"><div className="w-6 h-0.5 rounded-full bg-slate-200"></div></div>
            )}
            <div className="space-y-1.5 flex flex-col">
              {NAVIGATION_CONFIG.main.map((item: any) => <NavLink key={item.href} item={item} />)}
            </div>
          </div>
        )}

        {isDirector && NAVIGATION_CONFIG.director.length > 0 && (
          <div>
            {!isCollapsed ? (
              <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0"></span> Executive
              </p>
            ) : (
              <div className="w-full flex justify-center mb-3 mt-6"><div className="w-2 h-2 rounded-full bg-slate-800"></div></div>
            )}
            <div className="space-y-1.5 flex flex-col">
              {NAVIGATION_CONFIG.director.map((item: any) => <NavLink key={item.href} item={item} variant="exec" />)}
            </div>
          </div>
        )}

        {isAdmin && NAVIGATION_CONFIG.admin.length > 0 && (
          <div>
            {!isCollapsed ? (
              <p className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span> Administrator
              </p>
            ) : (
              <div className="w-full flex justify-center mb-3 mt-6"><div className="w-2 h-2 rounded-full bg-teal-500"></div></div>
            )}
            <div className="space-y-1.5 flex flex-col">
              {NAVIGATION_CONFIG.admin.map((item: any) => <NavLink key={item.href} item={item} variant="admin" />)}
            </div>
          </div>
        )}
      </nav>

      {/* FOOTER LOGOUT */}
      <div className="px-4 pt-2">
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="group relative overflow-hidden flex items-center justify-center p-0 w-12 h-12 mx-auto text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-2xl hover:border-red-200 hover:shadow-md transition-all duration-500 outline-none"
                >
                  <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                  <LogOut className="relative z-10 w-5 h-5 text-slate-400 group-hover:text-red-500 transition-all duration-500 group-hover:-translate-x-0.5 group-hover:scale-110" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10} className="font-semibold text-red-600 bg-red-50 border-red-100 z-50">
                Keluar
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <button
            onClick={handleLogout}
            className="group relative overflow-hidden flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-red-200 hover:shadow-md transition-all duration-500 outline-none"
          >
            {/* Background Hover Transisi Halus */}
            <div className="absolute inset-0 bg-red-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />

            <div className="relative z-10 flex items-center gap-3 overflow-hidden">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shrink-0",
                isAdmin ? "bg-teal-100 text-teal-700" : isDirector ? "bg-slate-200 text-slate-700" : "bg-blue-100 text-blue-700",
                "group-hover:bg-white group-hover:shadow-sm"
              )}>
                {userInitials}
              </div>
              <div className="flex flex-col items-start truncate text-left transition-transform duration-500 group-hover:translate-x-1">
                <span className="leading-none group-hover:text-red-600 font-bold transition-colors duration-500">Keluar</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase truncate">
                  {userRoleLabel}
                </span>
              </div>
            </div>
            <LogOut className="relative z-10 w-4 h-4 text-slate-400 group-hover:text-red-500 shrink-0 transition-transform duration-500 group-hover:-translate-x-1 group-hover:scale-110" />
          </button>
        )}
      </div>
    </aside>
  );
}