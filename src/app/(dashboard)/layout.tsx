"use client";

import React, { useState, useEffect } from "react";
import BottomNav from "@/components/shared/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { useBreakpoints } from "@/hooks/use-media-query";
import { Menu } from "lucide-react";

/**
 * Dashboard Layout
 * Wrapper utama untuk semua halaman dashboard (User, Admin, Director).
 * ARCHITECTURE NOTE (GRASP: Controller):
 * Layout ini bertindak sebagai Controller untuk state visual (Viewport & Sidebar).
 * Telah dimodifikasi agar konten {children} bersifat Edge-to-Edge (Tanpa Double Wrapper).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Injeksi Hook Observasi Viewport
  const { isMobile, isTablet, isDesktop } = useBreakpoints();

  // 2. State Management untuk Navigasi
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 3. Effect untuk Sinkronisasi State terhadap Ukuran Layar
  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true); // Desktop selalu terbuka penuh saat load awal
    } else if (isTablet) {
      setIsSidebarOpen(false); // Tablet default collapse (Navigation Rail)
    } else {
      setIsSidebarOpen(false); // Mobile default tersembunyi
    }
  }, [isDesktop, isTablet, isMobile]);

  // 4. Kalkulasi Dinamis Class CSS (DIUPDATE UNTUK DESKTOP)
  const getSidebarWidthClass = () => {
    if (isDesktop) return isSidebarOpen ? "w-64 translate-x-0" : "w-20 translate-x-0"; // Desktop kini bisa menyusut
    if (isTablet) return isSidebarOpen ? "w-64 translate-x-0 shadow-xl" : "w-20 translate-x-0";
    // Mobile:
    return isSidebarOpen ? "w-64 translate-x-0 shadow-2xl" : "w-64 -translate-x-full";
  };

  const getMainContentPaddingClass = () => {
    if (isDesktop) return isSidebarOpen ? "pl-64" : "pl-20"; // Padding konten utama ikut menyusut di Desktop
    if (isTablet) return "pl-20"; // Tablet selalu pl-20 karena sidebar open berupa overlay
    return "pl-0"; // Mobile tidak ada padding kiri dari layout
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="min-h-screen w-full bg-slate-50 relative overflow-x-hidden">

      {/* OVERLAY BACKGROUND (Tablet & Mobile saat Sidebar Expands) */}
      {isSidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 transition-opacity backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 1. SIDEBAR COMPONENT */}
      <div
        className={`fixed top-0 left-0 h-screen z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col ${getSidebarWidthClass()}`}
      >
        {/* Hubungkan state isSidebarOpen dan fungsi toggle ke komponen Sidebar */}
        <Sidebar
          isCollapsed={!isSidebarOpen}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${getMainContentPaddingClass()}`}>

        {/* HEADER / TOP BAR AREA (Hanya muncul di Layar Kecil) */}
        <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between border-b border-slate-200/50 bg-white/80 px-4 backdrop-blur-xl lg:hidden shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="font-black text-slate-800 tracking-tight text-sm md:text-base">
              KeuanganKu
            </div>
          </div>
        </header>

        {/* 3. DYNAMIC CONTENT AREA (Edge-to-Edge Mode) */}
        <main className="flex-1 w-full pb-20 md:pb-0 relative">
          {children}
        </main>

        {/* 4. BOTTOM NAVIGATION (MOBILE VIEW) */}
        <div className="md:hidden">
          <BottomNav />
        </div>

      </div>
    </div>
  );
}