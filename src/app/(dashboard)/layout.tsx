import { BottomNav } from "@/components/shared/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 1. CONTAINER UTAMA: Flex Row (Kiri-Kanan)
    <div className="flex min-h-screen w-full bg-slate-50/50">
      
      {/* 2. SIDEBAR WRAPPER (Desktop)
          - hidden md:flex: Hanya muncul di desktop
          - flex-shrink-0: Mencegah sidebar "gepeng" kalau konten melebar
          - h-screen sticky: Agar sidebar diam saat konten di-scroll
      */}
      <div className="hidden md:flex flex-col w-64 flex-shrink-0 fixed inset-y-0 z-50">
        <Sidebar />
      </div>

      {/* 3. MAIN CONTENT WRAPPER 
          - md:pl-64: Memberi jarak kiri sebesar lebar sidebar (agar tidak tertumpuk)
          - flex-1: Mengisi sisa ruang kosong
          - min-w-0: Mencegah konten "meledak" melebihi lebar layar (Flexbox bug fix)
      */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-300">
        
        {/* CONTENT AREA */}
        <main className="flex-1 w-full">
          {/* CONTAINER: 
             - max-w-7xl: Membatasi lebar agar chart tidak terlalu panjang
             - mx-auto: Posisi tengah
             - px-4/8: Padding kanan kiri aman
             - pb-32: Padding bawah ekstra untuk Mobile (biar ga ketutup BottomNav)
          */}
          <div className="w-full max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8 pb-32 md:pb-10">
            {children}
          </div>
        </main>

        {/* 4. BOTTOM NAV (Mobile Only) */}
        {/* Tidak perlu logic aneh-aneh, BottomNav punya 'md:hidden' di dalamnya */}
        <BottomNav />
        
      </div>
    </div>
  );
}