import React from "react";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/financial-math";
import { Target, TrendingUp, CheckCircle2, AlertTriangle, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface PensionSolutionProps {
    monthlySaving: number;
    totalFundNeeded: number;
    shortfall: number;
    returnRate: number;
    isSafe: boolean; // True jika aset existing sudah cukup (shortfall <= 0)
}

export function PensionSolutionCard({
    monthlySaving,
    totalFundNeeded,
    shortfall,
    returnRate,
    isSafe
}: PensionSolutionProps) {

    // Jika aman, tampilkan pesan selamat. Jika tidak, tampilkan investasi bulanan.

    return (
        <Card className={cn(
            "relative overflow-hidden rounded-3xl border-0 shadow-xl transition-all duration-300 group",
            isSafe
                ? "bg-linear-to-br from-emerald-600 to-teal-800 text-white" // Green Theme for Safe
                : "bg-linear-to-br from-indigo-600 to-violet-800 text-white" // Indigo Theme for Action
        )}>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="p-6 relative z-10">

                {/* HEADER */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl shadow-inner border border-white/10">
                        {isSafe ? <CheckCircle2 className="w-6 h-6 text-emerald-100" /> : <Target className="w-6 h-6 text-indigo-100" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-wide">
                            {isSafe ? "Dana Pensiun Aman" : "Rekomendasi Investasi"}
                        </h3>
                        <p className="text-xs text-white/80">
                            {isSafe ? "Aset Anda diproyeksikan mencukupi." : "Langkah yang harus dilakukan sekarang."}
                        </p>
                    </div>
                </div>

                {/* HERO NUMBER */}
                <div className="mb-8 text-center md:text-left">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/60 mb-2">
                        {isSafe ? "Potensi Surplus Dana" : "Tabungan Rutin per Bulan"}
                    </p>
                    <div className="text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-md">
                        {isSafe ? `+ ${formatRupiah(Math.abs(shortfall))}` : formatRupiah(monthlySaving)}
                    </div>

                    {!isSafe && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
                            <TrendingUp className="w-3 h-3 text-emerald-300" />
                            <span className="text-[10px] font-medium text-white/90">
                                Asumsi return investasi {returnRate}% / tahun
                            </span>
                        </div>
                    )}
                </div>

                {/* BREAKDOWN / TARGET */}
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
                    <div className="flex justify-between items-center text-sm mb-3">
                        <span className="text-white/70 flex items-center gap-2">
                            <PiggyBank className="w-4 h-4" />
                            Total Dana Dibutuhkan
                        </span>
                        <span className="font-bold text-white">{formatRupiah(totalFundNeeded)}</span>
                    </div>

                    <Separator className="bg-white/10 mb-3" />

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/70 flex items-center gap-2">
                            {isSafe ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                            {isSafe ? "Status Pendanaan" : "Kekurangan Dana (Gap)"}
                        </span>
                        <span className={cn("font-bold", isSafe ? "text-emerald-300" : "text-rose-300")}>
                            {isSafe ? "Terpenuhi" : formatRupiah(shortfall)}
                        </span>
                    </div>
                </div>

                {/* FOOTER NOTE */}
                {!isSafe && (
                    <p className="text-[10px] text-white/50 mt-4 text-center italic">
                        *Angka ini harus disisihkan secara disiplin mulai bulan ini hingga usia pensiun tiba.
                    </p>
                )}

            </div>
        </Card>
    );
}