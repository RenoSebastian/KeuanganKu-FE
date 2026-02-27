"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Lock, Rocket } from "lucide-react";

// Components
import BottomNav from "@/components/shared/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { useBreakpoints } from "@/hooks/use-media-query";
import { SocketProvider } from "@/providers/socket-provider";
import { SessionTerminatedModal } from "@/components/shared/session-terminated-modal"; // [NEW] Import Modal Kick-out
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Dashboard Layout
 * Wrapper utama untuk semua halaman dashboard (User, Admin, Director).
 *
 * UPDATE LOG:
 * - Integrasi SessionTerminatedModal untuk mendeteksi kick-out secara global.
 * - Optimalisasi z-index agar modal keamanan menutupi seluruh konten termasuk sidebar.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Injeksi Hook Observasi Viewport
  const { isMobile, isTablet, isDesktop } = useBreakpoints();

  // 2. State Management
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);

  // 3. Effect untuk Sinkronisasi State terhadap Ukuran Layar
  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true);
    } else if (isTablet) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(false);
    }
  }, [isDesktop, isTablet, isMobile]);

  // 4. Global Event Listener untuk Axios Interceptor (Quota Check)
  useEffect(() => {
    const handleQuotaExceeded = () => {
      setShowQuotaModal(true);
    };

    window.addEventListener("QUOTA_EXCEEDED", handleQuotaExceeded);
    return () => {
      window.removeEventListener("QUOTA_EXCEEDED", handleQuotaExceeded);
    };
  }, []);

  // 5. Kalkulasi Dinamis Class CSS
  const getSidebarWidthClass = () => {
    if (isDesktop) return isSidebarOpen ? "w-64 translate-x-0" : "w-20 translate-x-0";
    if (isTablet) return isSidebarOpen ? "w-64 translate-x-0 shadow-xl" : "w-20 translate-x-0";
    return isSidebarOpen ? "w-64 translate-x-0 shadow-2xl" : "w-64 -translate-x-full";
  };

  const getMainContentPaddingClass = () => {
    if (isDesktop) return isSidebarOpen ? "pl-64" : "pl-20";
    if (isTablet) return "pl-20";
    return "pl-0";
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <SocketProvider>
      <div className="min-h-screen w-full bg-slate-50 relative overflow-x-hidden pt-[env(safe-area-inset-top)]">

        {/* OVERLAY BACKGROUND (Mobile/Tablet) */}
        {isSidebarOpen && !isDesktop && (
          <div
            className="fixed inset-0 bg-slate-900/50 z-40 transition-opacity backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* SIDEBAR COMPONENT */}
        <div
          className={`fixed top-0 left-0 h-screen z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col ${getSidebarWidthClass()}`}
        >
          <Sidebar
            isCollapsed={!isSidebarOpen}
            onToggleCollapse={toggleSidebar}
          />
        </div>

        {/* MAIN CONTENT WRAPPER */}
        <div className={`flex flex-col min-h-screen transition-all duration-300 ${getMainContentPaddingClass()}`}>

          {/* HEADER (Mobile Only) */}
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

          {/* DYNAMIC CONTENT AREA */}
          <main className="flex-1 w-full pb-20 md:pb-0 relative">
            {children}
          </main>

          {/* BOTTOM NAV (Mobile Only) */}
          <div className="md:hidden">
            <BottomNav />
          </div>

        </div>

        {/* [NEW] SESSION TERMINATED MODAL (KICK-OUT) */}
        {/* Modal ini akan muncul otomatis jika tuas 'isSessionTerminated' ditarik oleh Axios/Socket */}
        <SessionTerminatedModal />

        {/* GLOBAL QUOTA MODAL */}
        <Dialog open={showQuotaModal} onOpenChange={setShowQuotaModal}>
          <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl">
            <DialogHeader className="flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center animate-pulse mb-2">
                <Lock className="w-8 h-8 text-red-600" />
              </div>
              <DialogTitle className="text-xl font-extrabold text-slate-900">
                Akses Dibatasi
              </DialogTitle>
              <DialogDescription className="text-center text-slate-600 text-sm leading-relaxed">
                Mohon maaf, kuota simulasi gratis Anda telah habis atau masa aktif paket Anda telah berakhir.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-[11px] text-slate-500 text-center font-medium leading-relaxed">
                Upgrade ke <strong className="text-indigo-600">PRO-MITRA</strong> untuk akses tanpa batas ke semua fitur simulasi, export PDF, dan analisis portofolio mendalam.
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowQuotaModal(false)} className="w-full sm:w-auto rounded-xl text-slate-400 font-bold">
                Nanti Saja
              </Button>
              <Link href="/pricing" className="w-full sm:flex-1">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold h-12 shadow-lg shadow-indigo-200 active:scale-95 transition-all">
                  <Rocket className="w-4 h-4 mr-2" /> Upgrade Sekarang
                </Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </SocketProvider>
  );
}