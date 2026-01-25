import { BottomNav } from "@/components/shared/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-50/50">
      
      {/* 1. SIDEBAR (DESKTOP ONLY) 
          - Fixed: Agar menempel di kiri layar.
          - Z-index 50: Agar di atas layer konten lain jika terjadi overlap.
      */}
      <div className="hidden md:block fixed top-0 left-0 h-screen w-64 z-50 border-r border-slate-200 bg-white shadow-sm">
        <Sidebar />
      </div>

      {/* 2. WRAPPER KONTEN
          - md:pl-64: PENTING! Memberi margin kiri sebesar lebar sidebar (256px) 
            agar konten TIDAK TERTUTUP sidebar.
          - flex-col: Agar footer/bottom nav bisa diatur posisinya.
      */}
      <div className="flex flex-col min-h-screen transition-all duration-300 md:pl-64">
        
        {/* 3. AREA UTAMA (MAIN)
            - w-full: Lebar penuh.
            - HAPUS 'overflow-x-hidden': INI PENYEBAB CARD TERPOTONG!
            - p-4 md:p-8: Padding luar agar Card tidak menempel ke tepi layar (yang bikin kepotong).
            - pb-32: Padding bawah ekstra untuk mobile agar tidak ketutup BottomNav.
        */}
        <main className="flex-1 w-full p-4 md:p-8 pb-32 md:pb-10">
          
          {/* Container Pembatas agar konten tidak terlalu lebar di layar super besar */}
          <div className="w-full max-w-7xl mx-auto space-y-8">
            {children}
          </div>
          
        </main>

        {/* 4. BOTTOM NAV (MOBILE ONLY) */}
        <BottomNav />
        
      </div>
    </div>
  );
}