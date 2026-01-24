import type { Metadata } from 'next';
// [STEP 2] Import Component Omni-Search
import DirectorOmniSearch from '@/components/features/director/director-omni-search';

export const metadata: Metadata = {
  title: 'Director Workspace | KeuanganKu',
  description: 'Area khusus Direksi untuk monitoring kinerja dan audit.',
};

export default function DirectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full min-h-full">
      {/* ========================================================================
        [VISUAL CUE] Director Mode Banner 
        ========================================================================
        Banner ini memberikan indikasi visual kuat bahwa user berada di area sensitif.
        Diletakkan 'sticky' di atas agar selalu terlihat saat scroll.
      */}
      <header className="sticky top-0 z-40 w-full bg-slate-900 text-white px-4 md:px-6 py-3 shadow-md border-b border-slate-700 flex items-center justify-between gap-4">
        
        {/* LEFT: Branding & Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Pulsing Dot Indicator */}
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          
          <span className="font-bold tracking-widest text-xs uppercase text-emerald-50 hidden md:block">
            Director Workspace
          </span>
          <span className="font-bold tracking-widest text-xs uppercase text-emerald-50 md:hidden">
            DIR
          </span>
        </div>

        {/* CENTER: Global Omni-Search (Phase 3 Integration) */}
        {/* Flex-1 agar mengisi ruang kosong di tengah, max-w agar tidak terlalu lebar */}
        <div className="flex-1 max-w-xl mx-auto">
           <DirectorOmniSearch />
        </div>
        
        {/* RIGHT: Security Badge */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded border border-slate-700 shrink-0">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-3 h-3 text-emerald-500"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span className="hidden lg:inline">AUDIT LOGGING ACTIVE</span>
          <span className="lg:hidden">LOG</span>
        </div>
      </header>

      {/* ========================================================================
        Content Wrapper
        ========================================================================
        Memberikan padding konsisten untuk semua halaman di bawah /director
      */}
      <div className="flex-1 w-full p-4 md:p-8 bg-slate-50/50">
        {children}
      </div>
    </div>
  );
}