import React from "react";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/financial-math";
import { ArrowRight, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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

    // Hitung selisih kenaikan harga
    const priceIncrease = futureTargetAmount - targetAmount;
    const multiplier = (futureTargetAmount / (targetAmount || 1)).toFixed(1);

    return (
        <Card className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between mb-6 relative z-10">
                <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-rose-500" />
                        Realita Inflasi
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-70 leading-relaxed">
                        Harga barang naik setiap tahun. Dalam <strong>{yearsDuration} tahun</strong>, harga impian Anda tidak lagi sama.
                    </p>
                </div>
                <div className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-full border border-rose-200 shadow-sm whitespace-nowrap">
                    Naik {multiplier}x Lipat
                </div>
            </div>

            {/* Visual Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center relative z-10">

                {/* LEFT: HARGA SEKARANG */}
                <div className="md:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center md:text-left transition-colors hover:border-slate-300">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                        Harga Hari Ini
                    </p>
                    <p className="text-lg md:text-xl font-black text-slate-700 tracking-tight truncate" title={formatRupiah(targetAmount)}>
                        {formatRupiah(targetAmount)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Present Value</p>
                </div>

                {/* MIDDLE: ARROW INDICATOR */}
                <div className="md:col-span-1 flex flex-col items-center justify-center py-2 md:py-0 gap-1">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <ArrowRight className="w-4 h-4 md:rotate-0 rotate-90" />
                    </div>
                    <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                        +{inflationRate}%/thn
                    </span>
                </div>

                {/* RIGHT: HARGA NANTI (Highlighted) */}
                <div className="md:col-span-5 bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center md:text-right relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <p className="text-[10px] uppercase font-bold text-rose-600 tracking-wider mb-1 relative z-10">
                        Harga Masa Depan
                    </p>
                    <p className="text-lg md:text-xl font-black text-rose-700 tracking-tight truncate relative z-10" title={formatRupiah(futureTargetAmount)}>
                        {formatRupiah(futureTargetAmount)}
                    </p>
                    <p className="text-[10px] text-rose-500 mt-1 font-medium relative z-10">
                        Future Value
                    </p>
                </div>

            </div>

            {/* Footer Info */}
            <div className="mt-4 flex gap-2 items-start bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-yellow-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-snug">
                    Anda harus mengumpulkan selisih sebesar <strong>{formatRupiah(priceIncrease)}</strong> tambahan hanya untuk mengejar kenaikan harga, belum termasuk harga asli barang.
                </p>
            </div>
        </Card>
    );
}