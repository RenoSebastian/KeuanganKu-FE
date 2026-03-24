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

  // [FASE 3] Smart Data Fetcher: Mengonsumsi Derived State
  const {
    user,
    isPro,
    isUnlimited,
    remainingDays,
    healthStatus,
    quota,
    isLoading,
    refreshUser
  } = useAuthUser();

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

  // REALTIME LISTENER
  // Sidebar akan mendengarkan sinyal 'refresh_user_data' dari komponen lain (misal: Payment Modal)
  useEffect(() => {
    const handleGlobalRefresh = () => {
      refreshUser();
    };

    window.addEventListener('refresh_user_data', handleGlobalRefresh);

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
            <TooltipContent side="right" sideOffset={10} className="font-semibold z-50 bg-slate-900 text-white border-slate-800">
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

    // Hitung persentase kuota untuk progress bar (Base visual max 10 Token)
    const maxQuota = 10;
    const percentage = Math.min((quota / maxQuota) * 100, 100);

    if (internalCollapse) {
      return (
        <div className="mx-auto mb-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 relative group transition-transform duration-300 hover:scale-110">
          {isUnlimited ? (
            <Crown className="w-5 h-5 text-amber-500 drop-shadow-sm fill-amber-500/20" />
          ) : (
            <>
              <Zap className={cn("w-5 h-5 transition-colors duration-300", quota > 0 ? "text-blue-500" : "text-red-400")} />
              {quota <= 0 && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-bounce" />}
            </>
          )}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-lg">
            {isUnlimited ? "PRO Active" : `Sisa Kuota: ${quota}`}
          </div>
        </div>
      );
    }

    return (
      <div className={cn(
        "mx-4 mb-4 p-3 rounded-xl border shadow-sm relative overflow-hidden group transition-all duration-300 hover:shadow-md",
        isPro
          ? "bg-linear-to-br from-amber-50 to-white border-amber-100/50"
          : "bg-linear-to-b from-slate-50/50 to-white border-slate-100"
      )}>
        {/* Decorative Background */}
        <div className={cn(
          "absolute -right-6 -top-6 w-20 h-20 rounded-full blur-2xl opacity-20 transition-colors duration-500",
          isPro ? "bg-amber-400" : quota > 0 ? "bg-blue-400" : "bg-red-400"
        )} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className={cn("text-[10px] font-bold uppercase tracking-wider", isPro ? "text-amber-600/80" : "text-slate-400")}>
              {isPro ? "Membership" : "Kuota Simulasi"}
            </span>
            {isPro ? (
              <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-white/80 px-2 py-0.5 rounded-full border border-amber-100 shadow-sm backdrop-blur-sm">
                <Crown className="w-3 h-3 fill-amber-500" /> PRO
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

          {/* Conditional Rendering: Unlimited vs Free Quota */}
          {isUnlimited ? (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                Unlimited Access
                {/* Visual Feedback FUP / Analytics Alert */}
                {(healthStatus === 'WARNING' || healthStatus === 'CRITICAL') && (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-[10px] font-semibold bg-slate-900 text-white">
                        Penggunaan Anda cukup tinggi bulan ini.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">Bebas akses fitur tanpa batas kuota.</p>

              {/* Subscription Countdown */}
              {remainingDays > 0 && (
                <div className="mt-1.5 pt-2 border-t border-amber-100/50">
                  <p className="text-[9px] text-amber-600 font-bold tracking-widest uppercase">
                    Masa Aktif: <span className="font-black text-amber-700">{remainingDays} HARI</span>
                  </p>
                </div>
              )}
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
                    "h-full rounded-full transition-all duration-700 ease-out",
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

          {/* Sembunyikan Tombol Upgrade jika pengguna sudah Unlimited */}
          {!isUnlimited && (
            <Link
              href="/subscription"
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
      "relative flex flex-col h-full bg-white overflow-visible pb-4 transition-all duration-300 z-50 shadow-sm border-r border-slate-100",
      internalCollapse ? "w-20" : "w-64"
    )}>
      {/* TOGGLE BUTTON */}
      <div className="absolute top-8 -right-3.5 z-50 hidden md:block">
        <button
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-md transition-all hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          {internalCollapse ? <ChevronRight className="h-4 w-4 ml-0.5" /> : <ChevronLeft className="h-4 w-4 mr-0.5" />}
        </button>
      </div>

      {/* HEADER LOGO */}
      <div className={cn(
        "py-4 flex flex-col items-center justify-center border-b border-slate-50 bg-linear-to-b from-white to-slate-50/30 transition-all duration-300",
        internalCollapse ? "min-h-20" : "min-h-24"
      )}>
        {!internalCollapse ? (
          <>
            <div className="relative w-24 h-24 drop-shadow-sm hover:scale-105 transition-transform duration-500">
              <Image
                src="/images/logokeuanganku.png"
                alt="Logo KeuanganKu"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain"
              />
            </div>
            <div className="text-center px-4 -mt-7">
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.2em] leading-tight mt-0.5 whitespace-nowrap opacity-80">
                financial tools
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
              <div className="w-full flex justify-center mb-3"><div className="w-6 h-0.5 rounded-full bg-slate-100"></div></div>
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
                Keluar Aplikasi
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
              <div className="relative">
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shrink-0 border-2 border-white shadow-sm",
                  isAdmin ? "bg-teal-100 text-teal-700" : isDirector ? "bg-slate-200 text-slate-700" : isPro ? "bg-linear-to-tr from-amber-100 to-amber-50 text-amber-700" : "bg-blue-100 text-blue-700",
                  "group-hover:bg-white group-hover:shadow-sm"
                )}>
                  {isLoading ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : userInitials}
                </div>
                {/* PRO Badge Indicator */}
                {isPro && (
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-[8px] font-black text-white px-1 rounded-sm shadow-sm border border-white">
                    PRO
                  </div>
                )}
              </div>

              <div className="flex flex-col items-start truncate text-left transition-transform duration-500 group-hover:translate-x-1">
                <span className="leading-none group-hover:text-red-600 font-bold transition-colors duration-500 truncate w-full text-sm">
                  {isLoading ? "Loading..." : user?.fullName || "User"}
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase truncate max-w-28 flex items-center gap-1">
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