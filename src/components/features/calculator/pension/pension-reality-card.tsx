import React from "react";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/financial-math";
import { ArrowRight, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PensionRealityProps {
    currentMonthlyExpense: number;
    futureMonthlyExpense: number;
    inflationRate: number;
    yearsDuration: number;
}

export function PensionRealityCard({
    currentMonthlyExpense,
    futureMonthlyExpense,
    inflationRate,
    yearsDuration
}: PensionRealityProps) {

    // Hitung kelipatan kenaikan (Multiplier) untuk efek dramatis
    const multiplier = (futureMonthlyExpense / (currentMonthlyExpense || 1)).toFixed(1);

    return (
        <Card className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden relative">
            {/* Header */}
            <div className="flex items-start justify-between mb-6 relative z-10">
                <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-rose-500" />
                        Efek Inflasi
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-62.5">
                        Estimasi kenaikan biaya hidup dalam {yearsDuration} tahun ke depan dengan asumsi inflasi {inflationRate}%.
                    </p>
                </div>
                <div className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-full border border-rose-200">
                    Naik {multiplier}x Lipat
                </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center relative z-10">

                {/* LEFT: CURRENT */}
                <div className="md:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center md:text-left">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                        Biaya Hidup Sekarang
                    </p>
                    <p className="text-xl md:text-2xl font-black text-slate-700 tracking-tight">
                        {formatRupiah(currentMonthlyExpense)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">/ bulan</p>
                </div>

                {/* MIDDLE: ARROW */}
                <div className="md:col-span-1 flex justify-center py-2 md:py-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <ArrowRight className="w-5 h-5 md:rotate-0 rotate-90" />
                    </div>
                </div>

                {/* RIGHT: FUTURE (Highlighted) */}
                <div className="md:col-span-5 bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center md:text-right relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-rose-200 rounded-full blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2" />

                    <p className="text-[10px] uppercase font-bold text-rose-500 tracking-wider mb-1 relative z-10">
                        Biaya Saat Pensiun
                    </p>
                    <p className="text-xl md:text-2xl font-black text-rose-600 tracking-tight relative z-10">
                        {formatRupiah(futureMonthlyExpense)}
                    </p>
                    <p className="text-[10px] text-rose-400 mt-1 relative z-10">/ bulan (Future Value)</p>
                </div>

            </div>

            {/* Footer Note */}
            <div className="mt-4 flex gap-2 items-start bg-slate-50 p-2 rounded-lg border border-slate-100">
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-snug">
                    Angka di kanan adalah jumlah uang yang Anda butuhkan nanti hanya untuk <strong>mempertahankan gaya hidup</strong> yang sama seperti hari ini.
                </p>
            </div>
        </Card>
    );
}