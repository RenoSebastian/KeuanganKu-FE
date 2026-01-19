import Link from "next/link";
import { cn } from "@/lib/utils"; 
import { Sparkles, ArrowRight } from "lucide-react"; // Pastikan install lucide-react jika belum

// --- DATA MENU (Sama seperti sebelumnya) ---
const FINANCE_MENUS = [
  {
    title: "Perencanaan & Kalkulator",
    items: [
      { 
        label: "Rancang Anggaran", 
        emoji: "🧮", 
        href: "/calculator/budget", 
        desc: "Kelola cashflow", 
        style: "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
      },
      { 
        label: "Rencana Dana Pendidikan", 
        emoji: "🎓", 
        href: "/calculator/education", 
        desc: "Biaya sekolah", 
        style: "bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600"
      },
      { 
        label: "Rancang Tujuan Khusus", 
        emoji: "🎯", 
        href: "/calculator/goals", 
        desc: "Cicilan kendaraan, biaya ibadah, dll", 
        style: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600"
      },
      { 
        label: "Rencana Dana Hari Tua", 
        emoji: "☂️", 
        href: "/calculator/pension", 
        desc: "Siapkan hari tua", 
        style: "bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600"
      },
      { 
        label: "Rancang Proteksi", 
        emoji: "🛡️", 
        href: "/calculator/insurance", 
        desc: "Asuransi jiwa", 
        style: "bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600"
      },
      { 
        label: "Catatan Keuangan Pribadi", 
        emoji: "📝", 
        href: "/finance/checkup", 
        desc: "Financial checkup", 
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

function FeatureCard({ item }: { item: any }) {
  return (
    <Link href={item.href} className="group block h-full focus:outline-none">
      <div
        className={cn(
          "relative h-28 md:h-44 rounded-2xl border bg-white/80 backdrop-blur",
          "flex flex-col justify-between md:justify-center md:items-center md:text-center p-4",
          "transition-all duration-300 ease-out",
          "border-slate-100 shadow-sm",
          "hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-100",
          "focus-visible:ring-2 focus-visible:ring-blue-500/40"
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "w-11 h-11 md:w-16 md:h-16 rounded-xl md:rounded-2xl",
            "flex items-center justify-center text-xl md:text-3xl border shadow-sm",
            "transition-transform duration-300",
            "group-hover:scale-105",
            item.style
          )}
        >
          {item.emoji}
        </div>

        {/* Text */}
        <div className="mt-2 md:mt-4 z-10">
          <h4 className="text-xs md:text-sm font-bold text-slate-800 transition-colors group-hover:text-blue-700">
            {item.label}
          </h4>
          <p className="mt-0.5 md:mt-2 text-[10px] md:text-xs text-slate-500 font-medium leading-snug">
            {item.desc}
          </p>
        </div>

        {/* Arrow (desktop hint) */}
        <ArrowRight
          className="hidden md:block absolute top-4 right-4 w-4 h-4
                     text-slate-300 opacity-0
                     transition-all duration-300
                     group-hover:opacity-100 group-hover:translate-x-1"
        />
      </div>
    </Link>
  )
}
