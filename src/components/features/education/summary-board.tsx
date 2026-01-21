"use client";

import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/financial-math";
import { PortfolioSummary } from "@/lib/types"; // Import type yang sudah ada di types.ts
import { Wallet, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryBoardProps {
  summary: PortfolioSummary | null;
  isLoading?: boolean;
}

export function SummaryBoard({ summary, isLoading }: SummaryBoardProps) {
  // Ambil data dari props, berikan default 0 jika null
  const totalSaving = summary?.grandTotalMonthlySaving || 0;
  const totalFutureCost = summary?.totalFutureCost || 0;

  return (
    <Card className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white border-0 shadow-2xl rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 items-center">
        
        {/* Left: Total Monthly Saving */}
        <div className="flex-1 text-center md:text-left space-y-2">
           <div className="flex items-center justify-center md:justify-start gap-2 text-blue-200 text-sm font-bold uppercase tracking-widest mb-1">
              <Wallet className="w-5 h-5" />
              <span>Total Tabungan Bulanan</span>
           </div>
           
           {isLoading ? (
             <div className="h-12 w-48 bg-white/10 animate-pulse rounded-lg mx-auto md:mx-0" />
           ) : (
             <h2 className="text-4xl md:text-5xl font-black tracking-tight">
               {formatRupiah(totalSaving)}
               <span className="text-lg md:text-2xl font-medium text-blue-300">/bln</span>
             </h2>
           )}
           
           <p className="text-xs md:text-sm text-blue-200 max-w-md leading-relaxed">
             Ini adalah jumlah uang yang harus Anda sisihkan <b>setiap bulan</b> mulai hari ini untuk meng-cover biaya pendidikan semua anak Anda (metode Sinking Fund).
           </p>
        </div>

        {/* Right: Divider & Future Cost */}
        <div className="hidden md:block w-px h-24 bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 min-w-[280px]">
           <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-500/20 rounded-lg text-red-300">
                 <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                 <p className="text-[10px] uppercase font-bold text-blue-200">Total Dana Dibutuhkan</p>
                 <p className="text-[10px] text-blue-300">(Estimasi Masa Depan + Inflasi)</p>
              </div>
           </div>
           
           {isLoading ? (
             <div className="h-8 w-32 bg-white/10 animate-pulse rounded-lg" />
           ) : (
             <p className="text-2xl font-black text-white">
                {formatRupiah(totalFutureCost)}
             </p>
           )}
           
           <div className="mt-3 flex gap-2">
              <Info className="w-3 h-3 text-blue-300 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-200 italic leading-tight">
                 Angka ini adalah akumulasi Uang Pangkal + SPP seluruh anak hingga lulus kuliah nanti.
              </p>
           </div>
        </div>

      </div>
    </Card>
  );
}