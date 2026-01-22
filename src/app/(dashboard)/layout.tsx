import { BottomNav } from "@/components/shared/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Hapus bg-slate-50 disini agar background ambient dari globals.css terlihat
    <div className="flex min-h-screen w-full">
      
      {/* 1. SIDEBAR (Desktop Only - Logic hidden md:flex ada di dalam component) */}
      <Sidebar />

      {/* 2. MAIN WRAPPER */}
      <div className="flex-1 flex flex-col relative w-full">
        
        {/* NOTE: Background decoration dihapus karena sudah ditangani 
           secara global di globals.css (Ambient Water Effect).
           Ini menjaga konsistensi "Clean UI" dan performa lebih ringan.
        */}

        {/* 3. CONTENT AREA */}
        <main className="flex-1 relative z-10 w-full overflow-x-hidden">
          {/* Padding Strategy:
              - Mobile: pb-28 (agar konten paling bawah tidak tertutup Floating Bottom Nav)
              - Desktop: pb-10 (padding standard)
              - Container: max-w-7xl (diperlebar agar Chart/Tabel lega)
          */}
          <div className="min-h-full w-full max-w-7xl mx-auto px-4 pt-4 pb-28 md:px-8 md:pt-8 md:pb-10">
            {children}
          </div>
        </main>

        {/* 4. BOTTOM NAV (Mobile Only) */}
        <BottomNav />
        
      </div>
    </div>
  );
}