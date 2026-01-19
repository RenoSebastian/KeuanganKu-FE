"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HealthGauge } from "@/components/features/dashboard/health-gauge";
import { Sparkles, TrendingUp, Calendar, ArrowRight, Bell, Info, AlertCircle } from "lucide-react";
import Image from "next/image"; 
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

// Helper format uang
const formatMoney = (val: number) => 
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil User dari LocalStorage
        const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (storedUser) setUserData(JSON.parse(storedUser));

        // 2. Ambil Data Checkup Terakhir dari Backend (Simulasi)
        // const response = await api.get("/financial/checkup/latest");
        // setFinancialData(response.data);
        
        // Mock Data sementara jika API belum ready
        setFinancialData({
            score: 75,
            status: "SEHAT",
            recommendation: "Kondisi keuangan cukup baik. Pertimbangkan menambah dana darurat.",
            incomeSnapshot: 15000000,
            expenseSnapshot: 8500000,
            checkDate: new Date().toISOString()
        });

      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- LOGIKA TAMPILAN DATA ---
  const hasData = !!financialData;
  const score = hasData ? financialData.score : 0;
  const status = hasData ? financialData.status : "BELUM DATA";
  const recommendation = hasData ? financialData.recommendation : "Halo! Silakan input anggaran pertama Anda untuk melihat analisa kesehatan finansial.";
  
  const income = hasData ? Number(financialData.incomeSnapshot) : 0;
  const expense = hasData ? Number(financialData.expenseSnapshot) : 0;
  const balance = income - expense;

  return (
    <div className="relative min-h-full w-full bg-slate-50/50 pb-24 md:pb-12">
      
      {/* --- DESKTOP BACKGROUND DECORATION (BLOBS) --- */}
      <div className="hidden md:block absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="hidden md:block absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 pt-4 md:px-8 md:pt-10">
        
        {/* =========================================
            HEADER SECTION (Mobile vs Desktop) 
            ========================================= */}
        
        {/* [MOBILE HEADER]: Compact */}
        <div className="flex flex-col items-center mb-5 md:hidden"> 
          <div className="relative w-40 h-16 mb-2"> 
             <Image 
               src="/images/pamjaya-logo.png" 
               alt="Logo PAM JAYA"
               fill
               className="object-contain drop-shadow-sm"
               priority
             />
          </div>
          
          <div className="w-full mt-2 bg-white/60 backdrop-blur-md border border-white/60 p-3 rounded-2xl shadow-sm flex items-center justify-between">
             <div>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Selamat Datang</p>
                <p className="text-sm font-bold text-blue-900">{userData?.fullName || "Karyawan"}</p>
             </div>
             <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-sm">👋</span>
             </div>
          </div>
        </div>

        {/* [DESKTOP HEADER]: Wide, Date Widget */}
        <div className="hidden md:flex justify-between items-end mb-10">
          <div>
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{currentDate}</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Dashboard Keuangan
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Halo, <span className="font-bold text-blue-600">{userData?.fullName || "User"}</span>. Mari cek kesehatan finansialmu hari ini.
            </p>
          </div>
        </div>


        {/* =========================================
            MAIN CONTENT GRID
            ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          
          {/* --- LEFT COLUMN (Mobile: Stack, Desktop: Span 8) --- */}
          <div className="md:col-span-8 space-y-6">
            
            {/* 1. HEALTH ANALYSIS CARD (Hero) */}
            <Card className="bg-white/90 backdrop-blur-xl border border-white/80 shadow-xl shadow-blue-900/5 rounded-[2rem] p-0 overflow-hidden ring-1 ring-slate-100/50 group hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500">
               
               {/* Header Strip */}
               <div className="bg-gradient-to-r from-blue-50 via-white to-white px-5 py-3 md:px-8 md:py-4 border-b border-blue-100/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs md:text-sm font-bold text-slate-700 tracking-tight uppercase">Analisa Kesehatan</h3>
                  </div>
                  {hasData && (
                    <span className="text-[10px] md:text-xs font-medium text-slate-400">
                      Update: {new Date(financialData.checkDate).toLocaleDateString()}
                    </span>
                  )}
               </div>
               
               <div className="p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left Content */}
                  <div className="flex-1 space-y-4">
                     <div>
                        <p className="text-xs md:text-sm text-slate-500 font-medium mb-1">Status Keuangan</p>
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight uppercase">
                            {status}
                          </h2>
                          {hasData && (
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] md:text-xs font-bold border",
                              status === "SEHAT" ? "bg-green-100 text-green-700 border-green-200" : 
                              status === "WASPADA" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                              "bg-red-100 text-red-700 border-red-200"
                            )}>
                              {status === "SEHAT" ? "Stabil" : "Perlu Perbaikan"}
                            </span>
                          )}
                        </div>
                     </div>
                     
                     <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 md:p-5 relative overflow-hidden">
                        <div className={cn(
                          "absolute top-0 left-0 w-1 h-full",
                          status === "SEHAT" ? "bg-green-500" : status === "WASPADA" ? "bg-yellow-500" : "bg-red-500"
                        )}></div>
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                           <span className="font-bold text-slate-800 block mb-1">Rekomendasi AI:</span>
                           "{recommendation}"
                        </p>
                     </div>

                     <div className="flex gap-3 pt-2">
                        <Button 
                          onClick={() => router.push("/calculator/budget")}
                          className="flex-1 md:flex-none h-10 md:h-11 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 text-xs md:text-sm font-bold"
                        >
                           {hasData ? "Update Anggaran" : "Buat Anggaran Baru"}
                           <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                     </div>
                  </div>

                  {/* Right Content (The Premium Dynamic Gauge) */}
                  <div className="flex-shrink-0 relative flex justify-center items-center py-6 md:py-0 md:pr-8 group">
                      
                      {/* 1. DYNAMIC AMBIENT GLOW */}
                      <div className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-[60px] opacity-30 transition-all duration-1000 ease-in-out",
                        score >= 80 ? "bg-green-400" : score >= 60 ? "bg-yellow-400" : "bg-red-500"
                      )}></div>

                      {/* 2. GLASS MEDALLION CONTAINER */}
                      <div className={cn(
                        "relative z-10 backdrop-blur-xl p-2 rounded-full border transition-all duration-500 shadow-2xl",
                        score >= 80 ? "bg-green-500/10 border-green-200/50 shadow-green-900/10" : 
                        score >= 60 ? "bg-yellow-500/10 border-yellow-200/50 shadow-yellow-900/10" : 
                        "bg-red-500/10 border-red-200/50 shadow-red-900/10"
                      )}>
                        
                        {/* Inner White Plate */}
                        <div className="bg-gradient-to-b from-white to-slate-50 rounded-full p-4 border border-white shadow-inner relative">
                           <div className="transform transition-transform duration-500 group-hover:scale-110"> 
                              <HealthGauge score={score} />
                           </div>
                        </div>

                        {/* 3. DYNAMIC STATUS BADGE */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 animate-in zoom-in duration-500">
                           <div className={cn(
                             "flex items-center gap-1.5 px-4 py-1.5 rounded-full shadow-xl border text-[10px] md:text-xs font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-500",
                             score >= 80 ? "bg-green-500 text-white border-green-400" : 
                             score >= 60 ? "bg-yellow-500 text-white border-yellow-400" : 
                             "bg-red-600 text-white border-red-500"
                           )}>
                             {score >= 80 ? (
                               <Sparkles className="w-3 h-3 text-yellow-200 animate-pulse" />
                             ) : score >= 60 ? (
                               <Info className="w-3 h-3 text-white" />
                             ) : (
                               <AlertCircle className="w-3 h-3 text-white animate-bounce" />
                             )}
                             {status}
                           </div>
                        </div>
                      </div>

                      {/* 4. SCORE INDICATOR GLOW (Desktop Only) */}
                      <div className="hidden md:block absolute -top-2 -right-2">
                        <div className={cn(
                           "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-4 border-white shadow-lg rotate-12 transition-transform duration-500 group-hover:rotate-0",
                           score >= 80 ? "bg-green-500 text-white" : 
                           score >= 60 ? "bg-yellow-500 text-white" : 
                           "bg-red-500 text-white"
                        )}>
                           {score}
                        </div>
                      </div>
                  </div>
               </div>
            </Card>

            {/* 2. MENU CEPAT (UPDATED ROUTING) */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm md:text-lg font-bold text-slate-800 flex items-center gap-2">
                    🚀 Menu Cepat
                  </h3>
                  <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:bg-blue-50 h-8 rounded-full">
                    Lihat Semua
                  </Button>
               </div>
               
               <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
                  <MenuCard 
                    title="Rancang Anggaran" 
                    emoji="🧮" 
                    onClick={() => router.push('/calculator/budget')} 
                  />
                  <MenuCard 
                    title="Rencana Dana Pendidikan" 
                    emoji="🎓" 
                    onClick={() => router.push('/calculator/education')} 
                  />
                  <MenuCard 
                    title="Rancang Proteksi" 
                    emoji="🛡️" 
                    onClick={() => router.push('/calculator/insurance')} 
                  />
                  <MenuCard 
                    title="Rencana Dana Hari Tua" 
                    emoji="👴" 
                    onClick={() => router.push('/calculator/pension')} 
                  />
                  <MenuCard 
                    title="Rancang Tujuan Khusus Lainnya" 
                    emoji="🎯" 
                    onClick={() => router.push('/calculator/goals')} 
                  />
                  <MenuCard 
                    title="Riwayat" 
                    emoji="📋" 
                    onClick={() => router.push('/history')} 
                  />
               </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="md:col-span-4 space-y-6">
            
            {/* 1. STATISTIK KEUANGAN */}
            <div>
               <h3 className="text-sm md:text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
                 📊 Statistik Bulan Ini
               </h3>
               
               <div className="grid grid-cols-3 md:grid-cols-1 gap-2 md:gap-4">
                  <StatCard 
                    title="Penghasilan" 
                    value={income} 
                    iconPlaceholder="💰" 
                    trend="up" 
                    subtitle="Terakhir Input"
                  />
                  <StatCard 
                    title="Pengeluaran" 
                    value={expense} 
                    iconPlaceholder="📉" 
                    trend="down" 
                    subtitle="Terakhir Input"
                  />
                  <StatCard 
                    title="Sisa Saldo" 
                    value={balance} 
                    iconPlaceholder="💵" 
                    trend="neutral" 
                    isHighlight
                  />
               </div>
            </div>

            {/* 2. DESKTOP WIDGET */}
            <div className="hidden md:block bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-purple-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                   <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
                      <span className="text-xl">💡</span>
                   </div>
                   <h4 className="font-bold text-lg mb-2">Tips Hari Ini</h4>
                   <p className="text-sm text-indigo-100 leading-relaxed">
                     "Pastikan dana darurat Anda mencukupi minimal 6 kali pengeluaran bulanan sebelum memulai investasi agresif."
                   </p>
                </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function StatCard({ title, value, iconPlaceholder, trend, subtitle, isHighlight }: any) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-3 md:p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default",
      "h-24 md:h-auto",
      isHighlight 
        ? "bg-blue-600 text-white shadow-blue-300" 
        : "bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm hover:bg-white"
    )}>
       <div className="flex justify-between items-start">
          <div>
             <p className={cn("text-[9px] md:text-xs font-bold mb-0.5 md:mb-1", isHighlight ? "text-blue-100" : "text-slate-500")}>
               {title}
             </p>
             <p className={cn("text-[11px] md:text-xl font-black leading-tight", isHighlight ? "text-white" : "text-slate-800")}>
               {formatMoney(value).replace("Rp", "Rp ")}
             </p>
          </div>
          <span className="text-xl md:text-2xl filter drop-shadow-sm opacity-90">{iconPlaceholder}</span>
       </div>
       
       <div className="mt-2 flex items-center justify-between">
          <div className={cn(
            "flex items-center gap-1 rounded-full px-1.5 py-0.5 md:px-2 md:py-1",
            trend === 'up' ? (isHighlight ? "bg-white/20 text-white" : "bg-green-50 text-green-600") :
            trend === 'down' ? (isHighlight ? "bg-white/20 text-white" : "bg-red-50 text-red-600") :
            (isHighlight ? "bg-white/20 text-white" : "bg-slate-50 text-slate-500")
          )}>
            <TrendingUp className={cn("w-3 h-3 md:w-3.5 md:h-3.5", trend === 'down' && "rotate-180")} />
            <span className="text-[8px] md:text-[10px] font-bold">
              {trend === 'up' ? "Positif" : trend === 'down' ? "Negatif" : "Stabil"}
            </span>
          </div>
          {subtitle && <span className={cn("text-[8px] md:text-[10px] hidden md:block", isHighlight ? "text-blue-100" : "text-slate-400")}>{subtitle}</span>}
       </div>
    </div>
  )
}

// FIXED: Added onClick to props and div
function MenuCard({ title, emoji, onClick }: any) {
   return (
      <div 
        onClick={onClick}
        className="group bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-2 md:p-4 shadow-sm flex flex-col items-center justify-center text-center h-24 md:h-32 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 active:scale-95 cursor-pointer"
      >
         <div className="w-10 h-10 md:w-14 md:h-14 mb-1.5 md:mb-3 grid place-items-center text-2xl md:text-4xl group-hover:scale-110 transition-transform bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100">
            {emoji}
         </div>
         <p className="text-[9px] md:text-xs font-bold text-slate-600 leading-tight group-hover:text-blue-700">{title}</p>
      </div>
   )
}