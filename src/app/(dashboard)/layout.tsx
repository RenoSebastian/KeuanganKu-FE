import BottomNav from "@/components/shared/bottom-nav";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // CONTAINER UTAMA: Full Height (100dvh)
    <div className="flex justify-center w-full h-[100dvh] bg-slate-900 overflow-hidden">
      
      {/* MOBILE WRAPPER: Max 480px */}
      <div className="w-full max-w-md h-full relative flex flex-col bg-slate-100 shadow-2xl">
        
        {/* --- [LOGIC FITUR 1]: BACKGROUND GLOBAL --- */}
        {/* Dipasang di sini agar mengisi layar XR/S20 meskipun kontennya pendek */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/bg1.png" 
            alt="Background"
            fill
            className="object-cover object-top"
            priority
          />
          {/* Overlay Putih Gradasi */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-white/60 to-slate-50/95 top-[25%]"></div>
        </div>

        {/* --- [LOGIC FITUR 2]: SCROLLABLE AREA --- */}
        {/* flex-1: Memaksa area ini mengambil SISA RUANG yang tersedia */}
        {/* z-10: Agar di atas background image */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 scroll-smooth hide-scrollbar">
          {children}
        </main>

        {/* --- [LOGIC FITUR 3]: NAVBAR DI BAWAH --- */}
        {/* Tidak fixed, tapi karena flex-col, dia pasti di bawah main */}
        <div className="flex-shrink-0 relative z-20">
          <BottomNav />
        </div>
        
      </div>
    </div>
  );
}