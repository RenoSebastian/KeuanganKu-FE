import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HealthGauge } from "@/components/features/dashboard/health-gauge";
import { FINANCIAL_SUMMARY, USER_PROFILE } from "@/lib/dummy-data";
import { Sparkles } from "lucide-react";
import Image from "next/image"; 

const formatMoney = (val: number) => 
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

export default function DashboardPage() {
  return (
    // [CLEAN UP]: Tidak perlu padding bottom berlebih, tidak perlu background image lagi
    // Cukup div transparan
    <div className="px-5 pt-4 pb-4">
      
      {/* HEADER: LOGO & SALAM */}
      <div className="flex flex-col items-center mb-3">
        <div className="relative w-36 h-12 mb-1"> 
           <Image 
             src="/images/pamjaya-logo.png" 
             alt="Logo PAM JAYA"
             fill
             className="object-contain drop-shadow-sm"
             priority
           />
        </div>
        
        <h1 className="text-lg font-bold text-slate-800 drop-shadow-sm tracking-tight">Dashboard</h1>
        
        <div className="w-full mt-2 text-left bg-white/40 backdrop-blur-sm p-2.5 rounded-xl border border-white/50 shadow-sm">
           <p className="text-slate-700 text-xs font-medium">
             Selamat Datang, <span className="font-bold text-blue-900">{USER_PROFILE.name}</span>
           </p>
           <div className="flex items-center gap-1 mt-0.5">
              <p className="text-[10px] text-slate-600">Semoga periode keuangan Anda sehat</p>
              <span className="text-xs animate-pulse">🎉</span>
           </div>
        </div>
      </div>

      {/* MAIN CARD */}
      <Card className="bg-white/80 backdrop-blur-md border border-white/80 shadow-xl shadow-blue-900/5 rounded-3xl p-0 overflow-hidden mb-3 ring-1 ring-white/50">
         <div className="bg-gradient-to-r from-blue-50/80 to-white/50 px-4 py-2.5 border-b border-blue-100/50">
            <h3 className="text-xs font-bold text-slate-700 tracking-tight">Analisa Keuangan Pribadi</h3>
         </div>
         
         <div className="p-4 flex items-center justify-between">
            <div className="flex-1 pr-2">
               <p className="text-[10px] text-slate-500 mb-1 font-medium">Keuangan Anda <span className="font-extrabold text-green-600 uppercase tracking-wide bg-green-50 px-1.5 py-0.5 rounded text-[10px] border border-green-100">{FINANCIAL_SUMMARY.status}</span></p>
               
               <div className="flex gap-2 mb-2 bg-blue-50/50 p-2 rounded-xl border border-blue-100/50">
                  <div className="w-6 h-6 bg-white rounded-lg flex-shrink-0 grid place-items-center shadow-sm text-sm border border-slate-100">
                    📄
                  </div>
                  <p className="text-[9px] text-slate-600 leading-snug py-0.5">
                     <span className="font-bold text-slate-700 block">Rekomendasi:</span>
                     {FINANCIAL_SUMMARY.recommendation}
                  </p>
               </div>

               <Button size="sm" className="h-8 text-[10px] rounded-full bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/30 w-full font-bold tracking-wide transition-all active:scale-95">
                  Lihat Detail Analisa
               </Button>
            </div>

            <div className="flex-shrink-0 pt-1 relative">
               <HealthGauge score={FINANCIAL_SUMMARY.score} />
               <div className="absolute bottom-0 right-0 transform translate-x-1 translate-y-1">
                  <div className="bg-green-500 text-white rounded-full p-1 border-[2px] border-white shadow-md">
                     <Sparkles className="w-2.5 h-2.5" />
                  </div>
               </div>
            </div>
         </div>
         
         <div className="px-4 py-2 text-[9px] text-slate-400 text-right bg-slate-50/50 border-t border-slate-100/50 font-medium">
            Update: {FINANCIAL_SUMMARY.lastAnalysisDate}
         </div>
      </Card>

      {/* STATS CARDS */}
      <div className="grid grid-cols-3 gap-2 mb-4">
         <StatCard title="Penghasilan" value={FINANCIAL_SUMMARY.income} iconPlaceholder="💰" trend="up" />
         <StatCard title="Pengeluaran" value={FINANCIAL_SUMMARY.expense} iconPlaceholder="📉" trend="down" />
         <StatCard title="Saldo" value={FINANCIAL_SUMMARY.balance} iconPlaceholder="💵" trend="neutral" />
      </div>

      {/* MENU CEPAT */}
      <div>
         <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold text-slate-800">Menu Cepat</h3>
            <span className="text-[10px] font-semibold text-blue-600 cursor-pointer">Lihat Semua</span>
         </div>
         
         <div className="grid grid-cols-4 gap-2">
            <MenuCard title="Anggaran" emoji="🧮" />
            <MenuCard title="Pendidikan" emoji="🎓" />
            <MenuCard title="Rumah" emoji="🏠" />
            <MenuCard title="Riwayat" emoji="📋" />
         </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function StatCard({ title, value, iconPlaceholder, trend }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-2.5 shadow-sm flex flex-col justify-between h-24 relative overflow-hidden group hover:bg-white transition-all duration-300 hover:shadow-md hover:-translate-y-1">
       <div>
          <p className="text-[9px] text-slate-500 font-semibold mb-0.5 truncate">{title}</p>
          <p className="text-[10px] font-extrabold text-slate-800 leading-tight">{formatMoney(value).replace("Rp", "Rp ")}</p>
       </div>
       <div className="mt-1 flex items-end justify-between">
          {trend === 'up' && <span className="text-[8px] text-green-600 font-bold bg-green-50 px-1 rounded">▲ +5%</span>}
          {trend === 'down' && <span className="text-[8px] text-red-500 font-bold bg-red-50 px-1 rounded">▼ -2%</span>}
          {trend === 'neutral' && <span className="text-[8px] text-slate-400 font-bold bg-slate-50 px-1 rounded">=</span>}
          <span className="text-xl filter drop-shadow-sm transform group-hover:scale-110 transition duration-300">{iconPlaceholder}</span>
       </div>
    </div>
  )
}

function MenuCard({ title, emoji }: any) {
   return (
      <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-1.5 shadow-sm flex flex-col items-center justify-center text-center h-20 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 active:scale-95 cursor-pointer group">
         <div className="w-8 h-8 mb-1 grid place-items-center text-2xl group-hover:scale-110 transition-transform bg-slate-50 rounded-full border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100">
            {emoji}
         </div>
         <p className="text-[9px] font-bold text-slate-600 leading-tight group-hover:text-blue-700">{title}</p>
      </div>
   )
}