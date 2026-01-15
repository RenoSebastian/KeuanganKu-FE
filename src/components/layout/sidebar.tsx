"use client";

import { Home, Calculator, Wallet, History, User, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", icon: Home, href: "/" },
    { label: "Kalkulator", icon: Calculator, href: "/calculator/budget" },
    { label: "Keuangan", icon: Wallet, href: "/finance" },
    { label: "Riwayat", icon: History, href: "/history" },
    { label: "Profil", icon: User, href: "/profile" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-slate-200 bg-white/50 backdrop-blur-xl sticky top-0 left-0 z-40">
      {/* 1. Header Logo */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="relative w-8 h-8">
          <Image 
            src="/images/pamjaya-logo.png" 
            alt="Logo" 
            fill 
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 text-sm">KeuanganKu</h1>
          <p className="text-xs text-slate-500">PAM JAYA</p>
        </div>
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 3. Footer / Logout */}
      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5" />
          Keluar Aplikasi
        </button>
      </div>
    </aside>
  );
}