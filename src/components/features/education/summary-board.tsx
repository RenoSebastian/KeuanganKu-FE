"use client";

import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/financial-math";
import { PortfolioSummary } from "@/lib/types";
import { Wallet, Info, Sparkles, PiggyBank } from "lucide-react";

interface SummaryBoardProps {
  summary: PortfolioSummary | null;
  isLoading?: boolean;
}

export function SummaryBoard({ summary, isLoading }: SummaryBoardProps) {
  // Ambil data dari props, berikan default 0 jika null
  const totalSaving = summary?.grandTotalMonthlySaving || 0;
  const totalFutureCost = summary?.totalFutureCost || 0;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white border-0 shadow-2xl shadow-blue-900/30 rounded-[2.5rem] p-6 md:p-10 group">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Glowing Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />
          
          {/* Subtle Grid Texture */}
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-[0.05]" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* --- LEFT: TOTAL MONTHLY SAVING (MAIN HERO) --- */}
        <div className="lg:col-span-7 text-center lg:text-left space-y-4">
           
           {/* Badge */}
           <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-100">Rekomendasi AI</span>
           </div>
           
           <div className="space-y-1">
             <div className="flex items-center justify-center lg:justify-start gap-2 text-blue-200/80 text-sm font-bold uppercase tracking-wide">
                <Wallet className="w-5 h-5" />
                <span>Total Tabungan Bulanan</span>
             </div>
             
             {isLoading ? (
               <div className="h-16 w-3/4 bg-white/10 animate-pulse rounded-2xl mx-auto lg:mx-0" />
             ) : (
               <h2 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-lg">
                 {formatRupiah(totalSaving)}
                 <span className="text-xl md:text-2xl font-medium text-blue-300/60 ml-2">/bln</span>
               </h2>
             )}
           </div>
           
           <p className="text-sm md:text-base text-blue-100/80 max-w-lg leading-relaxed mx-auto lg:mx-0 font-medium">
             Nominal ini adalah akumulasi <i>Sinking Fund</i> untuk <b>seluruh anak</b> agar dana pendidikan tersedia tepat waktu tanpa hutang.
           </p>
        </div>

        {/* --- DIVIDER (DESKTOP ONLY) --- */}
        <div className="hidden lg:block lg:col-span-1 h-32 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent mx-auto" />

        {/* --- RIGHT: FUTURE COST (SECONDARY STATS) --- */}
        <div className="lg:col-span-4">
           <div className="bg-white/5 backdrop-blur-md rounded-[1.5rem] p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300 relative overflow-hidden">
              {/* Card Accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              
              <div className="flex items-start gap-4 mb-4">
                 <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg shadow-indigo-500/30">
                    <PiggyBank className="w-6 h-6 text-white" />
                 </div>
                 <div>
                    <p className="text-[10px] uppercase font-bold text-blue-200 mb-1">Total Kebutuhan Dana</p>
                    <p className="text-[9px] text-blue-300/80 leading-tight">Estimasi Biaya Masa Depan + Inflasi</p>
                 </div>
              </div>
              
              {isLoading ? (
                <div className="h-10 w-full bg-white/10 animate-pulse rounded-xl mb-3" />
              ) : (
                <div className="mb-4">
                  <p className="text-2xl md:text-3xl font-black text-white tracking-tight">
                     {formatRupiah(totalFutureCost)}
                  </p>
                </div>
              )}
              
              <div className="pt-4 border-t border-white/10 flex gap-3">
                 <Info className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
                 <p className="text-[10px] text-blue-200/70 italic leading-relaxed">
                    Mencakup total biaya masuk (Uang Pangkal) dan biaya rutin (SPP/UKT) hingga lulus kuliah.
                 </p>
              </div>
           </div>
        </div>

      </div>
    </Card>
  );
}