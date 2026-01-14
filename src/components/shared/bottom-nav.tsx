"use client";

import { Home, Calculator, Wallet, History, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Calculator", icon: Calculator, href: "/calculator" },
    { label: "Keuangan", icon: Wallet, href: "/finance" },
    { label: "Riwayat", icon: History, href: "/history" },
    { label: "Profil", icon: User, href: "/profile" },
  ];

  return (
    <>
      {/* 1. THE FLOATING NAVBAR (FIXED) 
          Posisi fixed agar melayang di atas konten (overlay/glass effect).
          Menggunakan pointer-events-none di container agar sisi kiri/kanan navbar bisa ditembus klik.
      */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none bg-transparent rounded-3xl">
        <nav className="
          pointer-events-auto 
          w-full max-w-md 
          bg-gradient-to-b from-white/40 to-white/10 
          backdrop-blur-xl 
          border border-white/40 
          shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] 
          rounded-3xl 
          flex justify-between items-center px-5 py-3.5
          ring-1 ring-white/20
        ">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300 w-1/5",
                  isActive 
                    ? "text-blue-600 scale-110 drop-shadow-sm" 
                    : "text-slate-600/90 hover:text-slate-900 hover:scale-105"
                )}
              >
                <item.icon 
                  className={cn("w-6 h-6", isActive && "fill-blue-600/20")} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 2. THE PHANTOM SPACER (RELATIVE)
          Div ini invisible tapi mengambil ruang di document flow.
          Fungsinya: Menambah panjang halaman agar konten paling bawah 
          bisa di-scroll melewati area navbar yang melayang.
          h-24 (96px) = estimasi tinggi navbar + bottom spacing.
      */}
      <div className="h-28 w-full bg-transparent relative -z-10" aria-hidden="true" />
    </>
  );
}