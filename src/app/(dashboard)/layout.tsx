import { BottomNav } from "@/components/shared/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar"; // Import Sidebar baru
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 1. CONTAINER UTAMA (Flex Row di Desktop)
    <div className="flex min-h-screen bg-slate-50">
      
      {/* 2. SIDEBAR (Hanya muncul di Desktop via logic di dalam komponennya) */}
      <Sidebar />

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative min-h-screen w-full">
        
        {/* Background Decoration (Optional - Shared) */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50 md:opacity-30">
          <Image 
            src="/images/bg1.png" 
            alt="Background"
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-slate-50/95 to-slate-50"></div>
        </div>

        {/* Content Wrapper */}
        {/* pb-28 di mobile (untuk nav), pb-0 di desktop */}
        <main className="flex-1 relative z-10 p-4 md:p-8 pb-28 md:pb-8 overflow-y-auto">
          {/* Container pembatas agar konten tidak terlalu lebar di layar super wide */}
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* 4. BOTTOM NAV (Hanya muncul di Mobile via logic di dalam komponennya) */}
        <BottomNav />
        
      </div>
    </div>
  );
}