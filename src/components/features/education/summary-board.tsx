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
    <Card className="relative overflow-hidden bg-brand-900 text-white border-0 shadow-2xl shadow-brand-900/30 rounded-[2.5rem] p-6 md:p-10 group">
      
      {/* --- BACKGROUND DECORATION (PAM IDENTITY) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Glowing Orbs - Brand Colors */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
          
          {/* Subtle Wave Texture */}
          <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-[0.05] mix-blend-overlay" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* --- LEFT: TOTAL MONTHLY SAVING (MAIN HERO) --- */}
        <div className="lg:col-span-7 text-center lg:text-left space-y-5">
           
           {/* Badge */}
           <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-100">Rekomendasi AI</span>
           </div>
           
           <div className="space-y-2">
             <div className="flex items-center justify-center lg:justify-start gap-2 text-brand-200/80 text-sm font-bold uppercase tracking-wide">
                <Wallet className="w-5 h-5" />
                <span>Total Tabungan Bulanan</span>
             </div>
             
             {isLoading ? (
               <div className="h-20 w-3/4 bg-white/10 animate-pulse rounded-2xl mx-auto lg:mx-0" />
             ) : (
               <h2 className="text-5xl md:text-7xl font-black tracking-tighter drop-shadow-lg text-white">
                 {formatRupiah(totalSaving)}
                 <span className="text-2xl md:text-3xl font-medium text-brand-200/60 ml-2">/bln</span>
               </h2>
             )}
           </div>
           
           <p className="text-sm md:text-base text-brand-100/90 max-w-lg leading-relaxed mx-auto lg:mx-0 font-medium">
             Nominal ini adalah akumulasi <i>Sinking Fund</i> untuk <b>seluruh anak</b> agar dana pendidikan tersedia tepat waktu tanpa hutang.
           </p>
        </div>

        {/* --- DIVIDER (DESKTOP ONLY) --- */}
        <div className="hidden lg:block lg:col-span-1 h-32 w-px bg-gradient-to-b from-transparent via-brand-400/30 to-transparent mx-auto" />

        {/* --- RIGHT: FUTURE COST (SECONDARY STATS) --- */}
        <div className="lg:col-span-4">
           <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 hover:bg-white/10 transition-colors duration-300 relative overflow-hidden group/card">
              
              {/* Card Accent Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-brand-400" />
              
              <div className="flex items-start gap-4 mb-5">
                 <div className="p-3.5 bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl shadow-lg shadow-brand-900/50 text-white">
                    <PiggyBank className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[10px] uppercase font-bold text-brand-200 mb-1 tracking-wider">Total Kebutuhan Dana</p>
                    <p className="text-[10px] text-brand-300/80 leading-tight font-medium">Estimasi Biaya Masa Depan + Inflasi</p>
                 </div>
              </div>
              
              {isLoading ? (
                <div className="h-12 w-full bg-white/10 animate-pulse rounded-xl mb-4" />
              ) : (
                <div className="mb-5">
                  <p className="text-3xl md:text-4xl font-black text-white tracking-tight truncate">
                     {formatRupiah(totalFutureCost)}
                  </p>
                </div>
              )}
              
              <div className="pt-4 border-t border-white/10 flex gap-3">
                 <Info className="w-4 h-4 text-cyan-300 flex-shrink-0 mt-0.5" />
                 <p className="text-[10px] text-brand-100/70 italic leading-relaxed">
                   Mencakup total biaya masuk (Uang Pangkal) dan biaya rutin (SPP/UKT) hingga lulus kuliah.
                 </p>
              </div>
           </div>
        </div>

      </div>
    </Card>
  );
}