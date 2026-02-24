"use client";

import { LogOut, ChevronLeft, ChevronRight, Crown, Zap, AlertCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { NAVIGATION_CONFIG } from "@/config/navigation";
import { useAuthUser } from "@/hooks/use-auth-user";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // [HOOK] Smart Data Fetcher
  const { user, isPro, quota, isLoading, refreshUser } = useAuthUser();

  // Derived State
  const isAdmin = user?.role === 'ADMIN';
  const isDirector = user?.role === 'DIRECTOR';

  // Helper Initials
  const getInitials = (name: string) => {
    const names = name.split(' ');
    return (names[0].charAt(0) + (names.length > 1 ? names[names.length - 1].charAt(0) : "")).toUpperCase();
  };

  const userInitials = user?.fullName ? getInitials(user.fullName) : "U";
  const userRoleLabel = user?.role || "Guest";

  // State lokal untuk memantau kolaps
  const [internalCollapse, setInternalCollapse] = useState(isCollapsed);

  // Sinkronisasi state lokal dengan prop dari atas
  useEffect(() => {
    setInternalCollapse(isCollapsed);
  }, [isCollapsed]);

  // [NEW] REALTIME LISTENER
  // Sidebar akan mendengarkan sinyal 'refresh_user_data' dari komponen lain (misal: Calculator)
  useEffect(() => {
    const handleGlobalRefresh = () => {
      console.log("🔄 Sidebar: Mendeteksi perubahan data user, refreshing...");
      refreshUser();
    };

    // Pasang telinga (Listener)
    window.addEventListener('refresh_user_data', handleGlobalRefresh);

    // Bersihkan saat component unmount
    return () => {
      window.removeEventListener('refresh_user_data', handleGlobalRefresh);
    };
  }, [refreshUser]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    router.push("/login");
  };

  const toggleSidebar = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapse(!internalCollapse);
    }
  };

  // --- COMPONENT: NAV LINK ---
  const NavLink = ({ item, variant = "default" }: { item: any, variant?: "default" | "admin" | "exec" }) => {
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
          internalCollapse ? "justify-center w-12 h-12 mx-auto" : "px-3 py-3 mx-4",
          "rounded-xl"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-xl transition-all duration-500 ease-out z-0",
            isActive
              ? `bg-linear-to-tr ${gradientClass} opacity-100 scale-100 shadow-lg`
              : "bg-slate-100/50 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
          )}
        />
        <div
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full transition-all duration-500 ease-in-out z-10",
            isActive
              ? "w-1 h-8 bg-white/40 opacity-100"
              : "w-0.5 h-0 bg-slate-300 opacity-0 group-hover:h-5 group-hover:opacity-100"
          )}
        />
        <div className={cn(
          "relative z-10 flex items-center w-full transition-transform duration-500 ease-out",
          internalCollapse ? "justify-center" : (isActive ? "translate-x-1" : "translate-x-0")
        )}>
          <div className={cn("flex items-center justify-center shrink-0", internalCollapse ? "w-6 h-6" : "w-5 h-5 mr-3")}>
            <item.icon className={cn(
              "transition-all duration-500 ease-out w-full h-full",
              isActive ? "text-white scale-110 drop-shadow-sm" : "text-slate-400 group-hover:text-slate-700 group-hover:scale-110"
            )} />
          </div>
          {!internalCollapse && (
            <span className={cn(
              "text-sm transition-all duration-500 whitespace-nowrap overflow-hidden",
              isActive ? "font-bold text-white tracking-wide" : "font-medium text-slate-500 group-hover:text-slate-800"
            )}>
              {item.label}
            </span>
          )}
        </div>
      </Link>
    );

    if (internalCollapse) {
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

  // --- COMPONENT: QUOTA WIDGET ---
  const QuotaWidget = () => {
    if (isLoading) return <div className="mx-4 h-16 bg-slate-50 animate-pulse rounded-xl mb-4" />;
    if (isAdmin || isDirector) return null;

    // Hitung persentase kuota (asumsi max 3 token untuk FREE)
    const maxQuota = 10;
    const percentage = Math.min((quota / maxQuota) * 100, 100);

    if (internalCollapse) {
      return (
        <div className="mx-auto mb-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 relative group transition-transform duration-300 hover:scale-110">
          {isPro ? (
            <Crown className="w-5 h-5 text-amber-500 drop-shadow-sm" />
          ) : (
            <>
              <Zap className={cn("w-5 h-5 transition-colors duration-300", quota > 0 ? "text-blue-500" : "text-red-400")} />
              {quota <= 0 && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-bounce" />}
            </>
          )}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            {isPro ? "PRO Plan" : `Sisa Kuota: ${quota}`}
          </div>
        </div>
      );
    }

    return (
      <div className="mx-4 mb-4 p-3 rounded-xl border border-slate-100 bg-linear-to-b from-slate-50/50 to-white shadow-xs relative overflow-hidden group transition-all duration-300 hover:shadow-md">
        {/* Decorative Background */}
        <div className={cn(
          "absolute -right-6 -top-6 w-20 h-20 rounded-full blur-2xl opacity-20 transition-colors duration-500",
          isPro ? "bg-amber-400" : quota > 0 ? "bg-blue-400" : "bg-red-400"
        )} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isPro ? "Membership" : "Kuota Simulasi"}
            </span>
            {isPro ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100 shadow-sm">
                <Crown className="w-3 h-3" /> PRO
              </span>
            ) : (
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full border transition-colors duration-300",
                quota > 0 ? "text-blue-600 bg-blue-50 border-blue-100" : "text-red-600 bg-red-50 border-red-100"
              )}>
                FREE
              </span>
            )}
          </div>

          {isPro ? (
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-slate-600">Akses Tanpa Batas</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="transition-all duration-300">{quota} Token</span>
                <span className="text-slate-400 font-normal">/ {maxQuota}</span>
              </div>

              {/* Animated Progress Bar */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out", // Durasi animasi smooth
                    quota > 1 ? "bg-blue-500" : quota === 1 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {quota <= 0 && (
                <p className="text-[10px] text-red-500 font-medium flex items-center gap-1 mt-1 animate-pulse">
                  <AlertCircle className="w-3 h-3" /> Kuota habis. Upgrade yuk!
                </p>
              )}
            </div>
          )}

          {!isPro && (
            <Link
              href="/pricing"
              className="mt-3 block w-full py-1.5 text-center text-[10px] font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95"
            >
              UPGRADE SEKARANG
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <aside className={cn(
      "relative flex flex-col h-full bg-white overflow-visible pb-4 transition-all duration-300 z-50 shadow-sm",
      internalCollapse ? "w-20" : "w-64"
    )}>
      {/* TOGGLE BUTTON */}
      <div className="absolute top-8 -right-3.5 z-50 hidden md:block">
        <button
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-md transition-all hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 hover:scale-110"
        >
          {internalCollapse ? <ChevronRight className="h-4 w-4 ml-0.5" /> : <ChevronLeft className="h-4 w-4 mr-0.5" />}
        </button>
      </div>

      {/* HEADER LOGO */}
      <div className={cn(
        "py-4 flex flex-col items-center justify-center border-b border-slate-100 bg-linear-to-b from-white to-slate-50/50 transition-all duration-300",
        internalCollapse ? "min-h-20" : "min-h-25"
      )}>
        {!internalCollapse ? (
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
          <div className="relative w-10 h-10 drop-shadow-sm transition-transform duration-500 hover:scale-110 mt-2">
            <Image src="/images/logokeuanganku.png" alt="Logo" fill className="object-contain" priority />
          </div>
        )}
      </div>

      {/* NAVIGATION MENU */}
      <nav className="flex-1 py-6 space-y-8 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
        {!isAdmin && (
          <div>
            {!internalCollapse ? (
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
            {!internalCollapse ? (
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
            {!internalCollapse ? (
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

      {/* QUOTA WIDGET (Dynamic) */}
      <QuotaWidget />

      {/* FOOTER LOGOUT */}
      <div className="px-4 pt-2">
        {internalCollapse ? (
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
            <div className="absolute inset-0 bg-red-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
            <div className="relative z-10 flex items-center gap-3 overflow-hidden">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shrink-0",
                isAdmin ? "bg-teal-100 text-teal-700" : isDirector ? "bg-slate-200 text-slate-700" : "bg-blue-100 text-blue-700",
                "group-hover:bg-white group-hover:shadow-sm"
              )}>
                {isLoading ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : userInitials}
              </div>
              <div className="flex flex-col items-start truncate text-left transition-transform duration-500 group-hover:translate-x-1">
                <span className="leading-none group-hover:text-red-600 font-bold transition-colors duration-500">
                  {isLoading ? "Loading..." : "Keluar"}
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase truncate max-w-25">
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