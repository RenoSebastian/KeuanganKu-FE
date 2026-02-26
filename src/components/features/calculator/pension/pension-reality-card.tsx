"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/financial-math";
import { ArrowRight, TrendingUp, AlertCircle, PiggyBank, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { PensionSimulationResult } from "@/lib/types";

interface PensionRealityProps {
    data: PensionSimulationResult;
    currentMonthlyExpense: number;
    currentSaving: number; // Aset yang sudah ada saat ini
}

export function PensionRealityCard({
    data,
    currentMonthlyExpense,
    currentSaving
}: PensionRealityProps) {

    // Hitung kelipatan kenaikan biaya hidup untuk efek dramatis
    const multiplier = (data.futureMonthlyExpense / (currentMonthlyExpense || 1)).toFixed(1);

    return (
        <div className="flex flex-col gap-6">

            {/* 1. CARD EFEK INFLASI (SHOCK THERAPY) */}
            <Card className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden relative">
                <div className="flex items-start justify-between mb-6 relative z-10">
                    <div>
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-rose-500" />
                            Efek Inflasi Gaya Hidup
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-64">
                            Estimasi kenaikan biaya hidup dalam {data.yearsToRetire} tahun ke depan dengan asumsi inflasi.
                        </p>
                    </div>
                    <div className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-full border border-rose-200">
                        Naik {multiplier}x Lipat
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center relative z-10">
                    {/* LEFT: CURRENT */}
                    <div className="md:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center md:text-left">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                            Biaya Sekarang
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
                            {formatRupiah(data.futureMonthlyExpense)}
                        </p>
                        <p className="text-[10px] text-rose-400 mt-1 relative z-10">setara nilai hari ini</p>
                    </div>
                </div>

                <div className="mt-4 flex gap-2 items-start bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-snug">
                        Tanpa persiapan, daya beli Anda akan menurun tajam karena inflasi di masa depan.
                    </p>
                </div>
            </Card>

            {/* 2. CARD PERTUMBUHAN ASET SAAT INI (FUTURE VALUE 5.5%) */}
            <Card className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden relative group">
                {/* Visual Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />

                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl shadow-inner">
                        <PiggyBank className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            Aset Pensiun Saat Ini (FV)
                            <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                        </h3>
                        <p className="text-xs text-slate-500">
                            Proyeksi nilai aset lama Anda di usia {data.yearsToRetire + (data.retirementDuration === 0 ? 0 : 55 /* fallback age */)} tahun.
                        </p>
                    </div>
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-end bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                        <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Nilai Sekarang</p>
                            <p className="text-lg font-bold text-slate-600">{formatRupiah(currentSaving)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Nilai Masa Depan (FV)</p>
                            <p className="text-2xl font-black text-emerald-700 tracking-tight">
                                {formatRupiah(data.fvExistingFund)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>Estimasi Pertumbuhan</span>
                            <span className="text-emerald-600">5.5% Per Tahun (Konservatif)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-emerald-500 rounded-full"
                            />
                        </div>
                    </div>
                </div>

                <p className="mt-4 text-[9px] text-slate-400 italic text-center">
                    *Asumsi aset lama (JHT/DPLK/Tabungan) tumbuh rata-rata 5.5% per tahun secara konstan.
                </p>
            </Card>

        </div>
    );
}