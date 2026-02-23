import React from "react";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/financial-math";
import { ArrowRight, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GoalRealityProps {
    targetAmount: number;       // Harga Hari Ini (PV)
    futureTargetAmount: number; // Harga Nanti (FV)
    inflationRate: number;
    yearsDuration: number;
}

export function GoalRealityCard({
    targetAmount,
    futureTargetAmount,
    inflationRate,
    yearsDuration
}: GoalRealityProps) {

    const priceIncrease = futureTargetAmount - targetAmount;
    const multiplier = (futureTargetAmount / (targetAmount || 1)).toFixed(1);

    return (
        <Card className="p-6 md:p-8 bg-white/95 backdrop-blur-xl border border-rose-100 rounded-[2rem] shadow-xl shadow-rose-500/5 overflow-hidden relative group">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-400/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-rose-400/20 transition-all duration-700" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shadow-inner border border-rose-100">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Realita Inflasi</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            Dalam {yearsDuration} Tahun ke Depan
                        </p>
                    </div>
                </div>
                <div className="bg-rose-600 text-white text-xs font-black px-4 py-1.5 rounded-xl shadow-md shadow-rose-500/30 whitespace-nowrap flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Naik {multiplier}x Lipat
                </div>
            </div>

            {/* Visual Comparison Bento */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch relative z-10">

                {/* LEFT: HARGA SEKARANG */}
                <div className="flex-1 bg-slate-50 p-5 md:p-6 rounded-[1.5rem] border border-slate-100 flex flex-col justify-center transition-colors hover:border-slate-300">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2 flex items-center gap-1.5">
                        <Info className="w-3 h-3" /> Harga Saat Ini
                    </p>
                    <div className="w-full">
                        <p className="text-2xl md:text-3xl font-black text-slate-700 tracking-tighter break-all leading-none">
                            {formatRupiah(targetAmount)}
                        </p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 font-medium">Present Value (PV)</p>
                </div>

                {/* MIDDLE: ARROW INDICATOR (Animated) */}
                <div className="flex flex-col items-center justify-center py-2 md:py-0 px-2 gap-2">
                    <motion.div
                        animate={{ x: [0, 5, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm md:flex"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </motion.div>
                    <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200">
                        +{inflationRate}% / thn
                    </span>
                </div>

                {/* RIGHT: HARGA NANTI (Highlighted) */}
                <div className="flex-1 bg-linear-to-br from-rose-50 to-red-50 p-5 md:p-6 rounded-[1.5rem] border border-rose-200 flex flex-col justify-center relative overflow-hidden group/card hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-500">
                    <div className="absolute inset-0 bg-white/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

                    <p className="text-[10px] uppercase font-black text-rose-600 tracking-widest mb-2 relative z-10 flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3" /> Harga Masa Depan
                    </p>
                    <div className="w-full relative z-10">
                        <p className="text-3xl md:text-4xl font-black text-rose-700 tracking-tighter break-all leading-none drop-shadow-sm">
                            {formatRupiah(futureTargetAmount)}
                        </p>
                    </div>
                    <p className="text-[10px] text-rose-500 mt-3 font-medium relative z-10">Future Value (FV)</p>
                </div>

            </div>

            {/* Footer Info */}
            <div className="mt-6 flex gap-3 items-start bg-amber-50/80 p-4 rounded-2xl border border-amber-100/60 text-amber-900">
                <div className="p-1 bg-amber-100 rounded-md shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-[11px] md:text-xs leading-relaxed font-medium">
                    Klien harus mengumpulkan selisih sebesar <strong className="font-black text-amber-700 bg-amber-100/50 px-1 rounded">{formatRupiah(priceIncrease)}</strong> tambahan <span className="underline decoration-amber-300 underline-offset-2">hanya untuk mengejar laju inflasi</span>, di luar dari harga asli barang.
                </p>
            </div>
        </Card>
    );
}