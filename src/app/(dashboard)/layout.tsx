import React from "react";
import { BottomNav } from "@/components/shared/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";

/**
 * Dashboard Layout
 * Wrapper utama untuk semua halaman dashboard (User, Admin, Director).
 * * ARCHITECTURE NOTE:
 * Layout ini bersifat AGNOSTIC (tidak peduli role user).
 * Jangan tambahkan RoleGuard di sini. Guard harus spesifik per Page atau via Middleware.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-50/50">

      {/* 1. SIDEBAR (DESKTOP VIEW) 
          - Fixed position untuk navigasi stabil
          - Hidden di mobile, muncul di md
      */}
      <div className="hidden md:block fixed top-0 left-0 h-screen w-64 z-50 border-r border-slate-200 bg-white shadow-sm">
        <Sidebar />
      </div>

      {/* 2. MAIN CONTENT WRAPPER
          - md:pl-64: Memberi ruang untuk sidebar di desktop
          - flex-col: Memungkinkan footer/bottom nav diatur flow-nya
      */}
      <div className="flex flex-col min-h-screen transition-all duration-300 md:pl-64">

        {/* 3. DYNAMIC CONTENT AREA
            - padding disesuaikan agar tidak menempel ke pinggir layar
            - pb-32: Padding bottom extra untuk mobile agar tidak tertutup BottomNav
        */}
        <main className="flex-1 w-full p-4 md:p-8 pb-32 md:pb-10">

          {/* Container Pembatas (Max Width)
            - max-w-7xl: Mencegah layout pecah di monitor ultrawide.
            - mx-auto: Center alignment.
            - space-y-8: Memberi jarak vertikal antar komponen children.
          */}
          <div className="w-full max-w-7xl mx-auto space-y-8">
            {children}
          </div>

        </main>

        {/* 4. BOTTOM NAVIGATION (MOBILE VIEW) 
            - Navigasi alternatif untuk layar kecil
        */}
        <BottomNav />

      </div>
    </div>
  );
}