import Link from "next/link";
import { cn } from "@/lib/utils"; // Pastikan Anda punya utility ini (seperti di file input.tsx yang Anda upload)

// --- DATA MENU (Diperkaya dengan styling logic) ---
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
    // [LOGIC FIT TO SCREEN]: 
    // - min-h-[85vh]: Memaksa container memiliki tinggi minimal 85% dari viewport, 
    //   membuat konten terasa di tengah secara vertikal jika layar tinggi.
    // - flex flex-col justify-center: Menengahkan konten secara vertikal.
    <div className="px-5 pb-24 pt-6 min-h-[85vh] flex flex-col justify-center w-full max-w-md mx-auto">
      
       {/* HEADER SECTION */}
       <div className="mb-8 text-center animate-in slide-in-from-top-4 duration-700">
         <div className="inline-block p-3 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 shadow-sm mb-3">
            <span className="text-3xl">💎</span>
         </div>
         <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight drop-shadow-sm">
           Financial Tools
         </h1>
         <p className="text-sm text-slate-600 mt-1 font-medium max-w-[250px] mx-auto leading-relaxed">
           Kumpulan alat bantu pintar untuk kesehatan finansial Anda.
         </p>
       </div>

       {/* CONTENT SECTION (GLASS PANEL) */}
       {/* Dibungkus dalam satu panel besar transparan agar terlihat rapi (Organized) */}
       <div className="bg-white/30 backdrop-blur-sm border border-white/40 rounded-3xl p-4 shadow-lg shadow-blue-900/5">
         
         {FINANCE_MENUS.map((group, index) => (
           <div key={index} className="animate-in zoom-in-95 duration-700 fade-in delay-100">
             
             {/* GRID SYSTEM */}
             <div className="grid grid-cols-2 gap-3">
               {group.items.map((item, idx) => (
                 <FeatureCard key={idx} item={item} index={idx} />
               ))}
             </div>
           </div>
         ))}

       </div>

       {/* FOOTER QUOTE (Optional Aesthetic Touch) */}
       <div className="mt-8 text-center opacity-60">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Make Your Money Grow
          </p>
       </div>
    </div>
  );
}

// --- REUSABLE COMPONENT (Optimized) ---
function FeatureCard({ item, index }: { item: any, index: number }) {
  return (
    <Link href={item.href} className="block group relative">
      {/* Kartu Utama */}
      <div 
        className={cn(
            "relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/60",
            "rounded-2xl p-4 h-24 flex flex-col justify-between",
            "shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out",
            "active:scale-95 active:shadow-none"
        )}
      >
         {/* Background Gradient Halus saat Hover */}
         <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-blue-50/0 group-hover:to-blue-50/50 transition-all duration-500" />

         {/* Header Kartu: Icon & Arrow */}
         <div className="flex justify-between items-start relative z-10">
            {/* Dynamic Colored Icon Box */}
            <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm transition-colors duration-300 border",
                item.style // Memanggil class warna spesifik dari data
            )}>
               {item.emoji}
            </div>
         </div>

         {/* Footer Kartu: Teks */}
         <div className="relative z-10 mt-2">
            <h4 className="text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">
              {item.label}
            </h4>
            <p className="text-[9px] text-slate-500 font-medium mt-0.5 truncate opacity-80 group-hover:opacity-100">
              {item.desc}
            </p>
         </div>
         
      </div>
    </Link>
  )
}