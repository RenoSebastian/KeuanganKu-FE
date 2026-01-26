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
  const totalSaving = summary?.grandTotalMonthlySaving || 0;
  const totalFutureCost = summary?.totalFutureCost || 0;

  return (
    // UBAH: Background Gradient lebih Teal/Blue (PAM Style), shadow lebih soft
    <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-700 to-blue-800 text-white border-0 shadow-xl shadow-cyan-900/20 rounded-[2rem] p-6 md:p-8 group">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        
        {/* LEFT: MONTHLY SAVING (Main Focus) */}
        <div>
           <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                 <Wallet className="w-5 h-5 text-cyan-200" />
              </div>
              <span className="text-xs font-bold tracking-widest text-cyan-100 uppercase">
                Tabungan Bulanan Wajib
              </span>
           </div>
           
           {isLoading ? (
             <div className="h-16 w-3/4 bg-white/10 animate-pulse rounded-2xl" />
           ) : (
             // UBAH: Hapus 'truncate', gunakan break-words agar angka turun jika kepanjangan
             <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2 break-words leading-tight">
                {formatRupiah(totalSaving)}
             </h2>
           )}
           
           <p className="text-sm text-cyan-100/80 font-medium">
             Total yang harus disisihkan untuk semua anak.
           </p>
        </div>

        {/* RIGHT: TOTAL FUTURE COST (Secondary) */}
        <div className="relative">
           {/* Divider Vertical (Desktop only) */}
           <div className="hidden md:block absolute -left-6 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
           
           <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3 mb-4">
                 <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-200">
                    <PiggyBank className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-[10px] uppercase font-bold text-cyan-200 mb-0.5 tracking-wider">Total Kebutuhan Dana</p>
                    <p className="text-[10px] text-white/60 leading-tight">Estimasi Biaya Masa Depan + Inflasi</p>
                 </div>
              </div>
              
              {isLoading ? (
                <div className="h-10 w-full bg-white/10 animate-pulse rounded-xl mb-3" />
              ) : (
                <div className="mb-3">
                  <p className="text-2xl md:text-2xl font-bold text-white break-words">
                     {formatRupiah(totalFutureCost)}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 items-start">
                 <Info className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0 mt-0.5" />
                 <p className="text-[10px] text-cyan-100/70 italic leading-snug">
                    Angka ini adalah target akumulasi dana di masa depan (Future Value).
                 </p>
              </div>
           </div>
        </div>

      </div>
    </Card>
  );
}