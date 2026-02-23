import React from "react";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/financial-math";
import { CheckCircle2, TrendingUp, CalendarClock, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GoalSolutionProps {
    monthlySaving: number;
    totalTarget: number;
    yearsDuration: number;
    returnRate: number;
    isSurplus: boolean;
}

export function GoalSolutionCard({
    monthlySaving,
    totalTarget,
    yearsDuration,
    returnRate,
    isSurplus
}: GoalSolutionProps) {

    return (
        <Card className={cn(
            "relative overflow-hidden rounded-[2.5rem] border-0 shadow-2xl transition-all duration-700",
            isSurplus
                ? "bg-linear-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white"
                : "bg-linear-to-br from-indigo-600 via-violet-700 to-indigo-950 text-white"
        )}>
            {/* Animated Abstract Shapes */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

            {/* Shimmer Line */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-150%] animate-[shimmer_3s_infinite]" />

            <div className="p-6 md:p-10 relative z-10 flex flex-col h-full">

                {/* HEADER SECTION */}
                <div className="flex items-start sm:items-center gap-4 sm:gap-5 mb-8 md:mb-10">
                    <motion.div
                        initial={{ scale: 0.8, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className={cn(
                            "p-3.5 sm:p-4 backdrop-blur-xl rounded-4xl sm:rounded-[1.5rem] shadow-2xl border shrink-0 mt-1 sm:mt-0",
                            isSurplus ? "bg-emerald-500/20 border-emerald-400/30" : "bg-indigo-500/20 border-indigo-400/30"
                        )}
                    >
                        {isSurplus ? <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-100" /> : <Target className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-100" />}
                    </motion.div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm leading-tight">
                            {isSurplus ? "Tujuan Tercapai!" : "Rekomendasi Aksi"}
                        </h3>
                        <p className="text-[11px] sm:text-xs md:text-sm text-white/80 font-medium mt-1 md:mt-1.5 leading-relaxed">
                            {isSurplus
                                ? "Modal awal klien diproyeksikan sudah melebihi target."
                                : "Langkah konkret menabung rutin yang harus dilakukan klien."}
                        </p>
                    </div>
                </div>

                {/* HERO AMOUNT (FIXED: Controlled Typography) */}
                <div className="mb-10 w-full min-w-0">
                    <p className="text-[10px] md:text-[11px] uppercase font-black tracking-[0.2em] text-white/60 mb-3 flex items-center gap-2">
                        {isSurplus ? "Estimasi Kelebihan Dana (Surplus)" : "Sisihkan Rutin Per Bulan"}
                    </p>

                    <div className="w-full flex flex-wrap">
                        {/* Menurunkan scale maksimal ke text-5xl/6xl dan memecah teks dengan natural */}
                        <h2 className="text-4xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-xl leading-none break-all sm:wrap-break-word whitespace-normal w-full">
                            {formatRupiah(monthlySaving)}
                        </h2>
                    </div>

                    {!isSurplus && (
                        <div className="mt-5 sm:mt-6 inline-flex items-start sm:items-center gap-2.5 px-4 py-2.5 bg-black/20 rounded-xl border border-white/10 backdrop-blur-md shadow-inner max-w-full">
                            <TrendingUp className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5 sm:mt-0" />
                            <span className="text-[11px] sm:text-xs font-bold text-white/90 tracking-wide leading-relaxed">
                                Asumsi instrumen dengan return <span className="text-emerald-300 font-black">{returnRate}% p.a</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* SUMMARY BOX */}
                <div className="mt-auto">
                    <div className="bg-black/20 backdrop-blur-xl rounded-4xl sm:rounded-[1.5rem] p-4 sm:p-5 border border-white/10 shadow-inner flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1 min-w-0 w-full">
                            <span className="text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                                <CheckCircle2 className="w-3 h-3" /> Target Akhir (FV)
                            </span>
                            <div className="w-full">
                                <span className="font-black text-white text-lg sm:text-xl tracking-tight break-all leading-none">
                                    {formatRupiah(totalTarget)}
                                </span>
                            </div>
                        </div>

                        <div className="hidden md:block w-px bg-white/10" />
                        <div className="block md:hidden w-full h-px bg-white/10" />

                        <div className="flex-1 md:text-right">
                            <span className="text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center md:justify-end gap-1.5 mb-1.5">
                                <CalendarClock className="w-3 h-3" /> Estimasi Pencapaian
                            </span>
                            <span className="font-black text-white text-lg sm:text-xl leading-none block">
                                {/* Konversi dari Tahun ke Bulan & Pembulatan (Round Up) */}
                                ~ {Math.ceil(yearsDuration * 12)} Bulan
                            </span>
                        </div>
                    </div>

                    {/* FOOTER DISCLAIMER */}
                    {!isSurplus && (
                        <p className="text-[9px] sm:text-[10px] text-white/40 mt-5 sm:mt-6 text-center italic font-medium leading-relaxed px-2">
                            *Disiplin adalah kunci. Menunda investasi akan memaksa klien menyisihkan nominal bulanan yang jauh lebih besar akibat hilangnya efek bunga majemuk (compounding interest).
                        </p>
                    )}
                </div>

            </div>
        </Card>
    );
}