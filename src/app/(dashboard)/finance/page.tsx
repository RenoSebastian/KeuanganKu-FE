import Link from "next/link";
import { cn } from "@/lib/utils"; 
import { Sparkles, ArrowRight } from "lucide-react"; // Pastikan install lucide-react jika belum

// --- DATA MENU (Sama seperti sebelumnya) ---
const FINANCE_MENUS = [
  {
    title: "Perencanaan & Kalkulator",
    items: [
      { 
        label: "Atur Anggaran", 
        emoji: "🧮", 
        href: "/calculator/budget", 
        desc: "Kelola cashflow", 
        style: "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
      },
      { 
        label: "Dana Pendidikan", 
        emoji: "🎓", 
        href: "/calculator/education", 
        desc: "Biaya sekolah", 
        style: "bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600"
      },
      { 
        label: "Rencana Rumah", 
        emoji: "🏠", 
        href: "/calculator/house", 
        desc: "Simulasi KPR", 
        style: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600"
      },
      { 
        label: "Dana Pensiun", 
        emoji: "☂️", 
        href: "/calculator/pension", 
        desc: "Siapkan hari tua", 
        style: "bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600"
      },
      { 
        label: "Proteksi Diri", 
        emoji: "🛡️", 
        href: "/calculator/insurance", 
        desc: "Asuransi jiwa", 
        style: "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600"
      },
      { 
        label: "Cek Kesehatan", 
        emoji: "🩺", 
        href: "/calculator/checkup", 
        desc: "Medical checkup", 
        style: "bg-cyan-50 text-cyan-600 border-cyan-100 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-600"
      },
    ]
  },
];

export default function FinancePage() {
  return (
    // [RESPONSIVE CONTAINER]
    // Mobile: px-5 padding standard.
    // Desktop: px-20, min-h-screen untuk centering vertical yang sempurna.
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-slate-50/50">
      
      {/* [DESKTOP ONLY]: Background Decoration Blobs */}
      <div className="hidden md:block absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="hidden md:block absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />

      {/* MAIN WRAPPER */}
      {/* Mobile: Flex Column (Atas Bawah). Desktop: Flex Row (Kiri Kanan) */}
      <div className="w-full max-w-6xl px-5 py-10 md:px-10 md:py-0 flex flex-col md:flex-row md:items-center md:gap-16 lg:gap-24 relative z-10">
        
        {/* === LEFT SIDE (HEADER) === */}
        {/* Mobile: Center text, mb-8. Desktop: Left text, no margin bottom, width 40% */}
        <div className="text-center md:text-left md:w-[40%] animate-in slide-in-from-left-6 duration-700">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-100 shadow-sm mb-4 md:mb-6">
            <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-wider">
              Smart Tools
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-3 md:mb-6">
            Kelola Uang <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Jadi Lebih Mudah
            </span>
          </h1>

          <p className="text-sm md:text-lg text-slate-600 font-medium leading-relaxed max-w-xs mx-auto md:mx-0 md:max-w-md">
            Pilih alat bantu yang Anda butuhkan hari ini. Mulai dari hitung anggaran hingga persiapan masa depan.
          </p>

          {/* Desktop Only: Call to Action Button Visual */}
          <div className="hidden md:flex mt-8 items-center gap-4">
             <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
             <p className="text-sm font-semibold text-slate-400">Pilih menu di samping</p>
          </div>
        </div>

        {/* === RIGHT SIDE (GRID MENU) === */}
        {/* Mobile: Full width. Desktop: Width 60%, Glass Panel Lebih Besar */}
        <div className="w-full md:w-[60%] animate-in slide-in-from-right-6 duration-700 delay-100">
          
          <div className="bg-white/40 md:bg-white/60 backdrop-blur-xl border border-white/60 md:border-white/80 rounded-[2rem] p-4 md:p-8 shadow-xl shadow-blue-900/5">
            
            {FINANCE_MENUS.map((group, index) => (
              <div key={index}>
                {/* Grid Responsif: 2 Kolom di HP, 3 Kolom di Desktop */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                  {group.items.map((item, idx) => (
                    <FeatureCard key={idx} item={item} />
                  ))}
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
}

// --- REUSABLE COMPONENT (Optimized for both) ---
function FeatureCard({ item }: { item: any }) {
  return (
    <Link href={item.href} className="group relative block h-full">
      <div 
        className={cn(
            "relative overflow-hidden bg-white/90 backdrop-blur-sm border border-slate-100",
            // Mobile: h-28 (agak tinggi dikit). Desktop: Aspect Square (kotak sempurna) atau h-40
            "rounded-2xl p-4 flex flex-col justify-between h-28 md:h-40 md:justify-center md:items-center md:text-center",
            "shadow-sm transition-all duration-300 ease-out",
            // Hover Effects (Desktop mainly)
            "hover:shadow-xl hover:shadow-blue-200/50 hover:-translate-y-1 hover:border-blue-100",
            "active:scale-95"
        )}
      >
          {/* Icon Box */}
          <div className={cn(
              // Mobile: Kiri atas. Desktop: Tengah, lebih besar
              "w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-3xl shadow-sm transition-all duration-300 border mb-2 md:mb-4",
              item.style 
          )}>
             {item.emoji}
          </div>

          {/* Text Content */}
          <div className="z-10">
             <h4 className="text-xs md:text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">
               {item.label}
             </h4>
             <p className="text-[10px] md:text-xs text-slate-500 font-medium mt-0.5 md:mt-2 opacity-80 group-hover:opacity-100">
               {item.desc}
             </p>
          </div>
          
          {/* Desktop Only: Arrow Icon on Hover */}
          <div className="hidden md:flex absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0 text-slate-300">
            <ArrowRight className="w-4 h-4" />
          </div>
      </div>
    </Link>
  )
}