"use client";

import React, { useState, useEffect } from "react";
import BottomNav from "@/components/shared/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { useBreakpoints } from "@/hooks/use-media-query";
import { Menu } from "lucide-react"; // Pastikan Anda menginstal lucide-react atau gunakan ikon lain

/**
 * Dashboard Layout
 * Wrapper utama untuk semua halaman dashboard (User, Admin, Director).
 * * ARCHITECTURE NOTE (GRASP: Controller & Information Expert):
 * Layout ini bertindak sebagai Controller untuk state visual (Viewport & Sidebar).
 * Layout ini bersifat AGNOSTIC terhadap Role (tidak peduli role user).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Injeksi Hook Observasi Viewport
  const { isMobile, isTablet, isDesktop } = useBreakpoints();

  // 2. State Management untuk Navigasi (Single Source of Truth)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 3. Effect untuk Sinkronisasi State terhadap Ukuran Layar
  // Mencegah anomali state ketika pengguna memutar orientasi tablet atau me-resize browser
  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true); // Desktop selalu terbuka penuh
    } else if (isTablet) {
      setIsSidebarOpen(false); // Tablet default ke mode "Navigation Rail" (collapse)
    } else {
      setIsSidebarOpen(false); // Mobile default tersembunyi
    }
  }, [isDesktop, isTablet, isMobile]);

  // 4. Kalkulasi Dinamis Class CSS untuk Layouting yang Presisi
  const getSidebarWidthClass = () => {
    if (isDesktop) return "w-64 translate-x-0";
    if (isTablet) return isSidebarOpen ? "w-64 translate-x-0 shadow-xl" : "w-20 translate-x-0";
    // Mobile:
    return isSidebarOpen ? "w-64 translate-x-0 shadow-2xl" : "w-64 -translate-x-full";
  };

  const getMainContentPaddingClass = () => {
    if (isDesktop) return "pl-64";
    if (isTablet) return "pl-20"; // Saat tablet, konten tetap di pl-20, jika sidebar open, ia akan menjadi overlay (floating)
    return "pl-0"; // Mobile tidak ada padding kiri
  };

  // Fungsi toggle handler
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="min-h-screen w-full bg-slate-50/50 relative overflow-x-hidden">

      {/* OVERLAY BACKGROUND (Untuk Mobile & Tablet saat Sidebar Expands) 
          Mendeteksi klik di luar area untuk menutup sidebar
      */}
      {isSidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 transition-opacity backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 1. SIDEBAR COMPONENT
          - Posisi fixed dan z-index tinggi
          - Transisi width dan transform untuk animasi yang smooth
      */}
      <div
        className={`fixed top-0 left-0 h-screen z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col ${getSidebarWidthClass()}`}
      >
        {/* Catatan untuk Fase 2: Sidebar ini harus diupdate agar menerima prop isOpen={isSidebarOpen} */}
        <Sidebar isCollapsed={!isSidebarOpen && isTablet} />
      </div>

      {/* 2. MAIN CONTENT WRAPPER 
          Margin mengikuti kalkulasi dimensi layar secara reaktif
      */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${getMainContentPaddingClass()}`}>

        {/* HEADER / TOP BAR AREA (BARU)
            - Tempat untuk meletakkan Hamburger Menu Trigger
            - Disembunyikan di layar Desktop karena tidak diperlukan
        */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:hidden">
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-2 rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="font-semibold text-slate-800">
            {/* Opsi: Tambahkan logo atau judul halaman dinamis di sini */}
            KeuanganKu
          </div>
        </header>

        {/* 3. DYNAMIC CONTENT AREA */}
        <main className="flex-1 w-full p-4 md:p-8 pb-32 md:pb-10">
          <div className="w-full max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>

        {/* 4. BOTTOM NAVIGATION (MOBILE VIEW) 
            Pastikan di file bottom-nav.tsx Anda sudah ada class md:hidden
        */}
        <div className="md:hidden">
          <BottomNav />
        </div>

      </div>
    </div>
  );
}