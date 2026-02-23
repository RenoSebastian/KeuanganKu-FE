import React from "react";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/financial-math";
import { CheckCircle2, TrendingUp, PiggyBank, CalendarClock, Target } from "lucide-react";
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

            <div className="p-8 md:p-10 relative z-10 flex flex-col h-full">

                {/* HEADER SECTION */}
                <div className="flex items-center gap-5 mb-10">
                    <motion.div
                        initial={{ scale: 0.8, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className={cn(
                            "p-4 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border",
                            isSurplus ? "bg-emerald-500/20 border-emerald-400/30" : "bg-indigo-500/20 border-indigo-400/30"
                        )}
                    >
                        {isSurplus ? <CheckCircle2 className="w-8 h-8 text-emerald-100" /> : <Target className="w-8 h-8 text-indigo-100" />}
                    </motion.div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">
                            {isSurplus ? "Tujuan Tercapai!" : "Rekomendasi Aksi"}
                        </h3>
                        <p className="text-xs md:text-sm text-white/80 font-medium mt-1">
                            {isSurplus
                                ? "Modal awal klien diproyeksikan sudah melebihi target."
                                : "Langkah konkret menabung rutin yang harus dilakukan klien."}
                        </p>
                    </div>
                </div>

                {/* HERO AMOUNT */}
                <div className="mb-10 w-full">
                    <p className="text-[11px] uppercase font-black tracking-[0.2em] text-white/60 mb-3 flex items-center gap-2">
                        {isSurplus ? "Estimasi Kelebihan Dana (Surplus)" : "Sisihkan Rutin Per Bulan"}
                    </p>

                    <div className="w-full overflow-hidden">
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white drop-shadow-xl leading-none wrap-break-word w-full">
                            {formatRupiah(monthlySaving)}
                        </h2>
                    </div>

                    {!isSurplus && (
                        <div className="mt-6 inline-flex items-center gap-2.5 px-4 py-2 bg-black/20 rounded-xl border border-white/10 backdrop-blur-md shadow-inner">
                            <TrendingUp className="w-4 h-4 text-emerald-300" />
                            <span className="text-xs font-bold text-white/90 tracking-wide">
                                Asumsi instrumen dengan return <span className="text-emerald-300 font-black">{returnRate}% p.a</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* SUMMARY BOX */}
                <div className="mt-auto">
                    <div className="bg-black/20 backdrop-blur-xl rounded-[1.5rem] p-5 border border-white/10 shadow-inner flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                            <span className="text-white/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                <CheckCircle2 className="w-3 h-3" /> Target Akhir (FV)
                            </span>
                            <span className="font-black text-white text-xl tracking-tight break-all">
                                {formatRupiah(totalTarget)}
                            </span>
                        </div>

                        <div className="hidden md:block w-px bg-white/10" />
                        <div className="block md:hidden w-full h-px bg-white/10" />

                        <div className="flex-1 md:text-right">
                            <span className="text-white/60 text-[10px] font-black uppercase tracking-widest flex items-center md:justify-end gap-1.5 mb-1">
                                <CalendarClock className="w-3 h-3" /> Durasi Waktu
                            </span>
                            <span className="font-black text-white text-xl">
                                {yearsDuration} Tahun
                            </span>
                        </div>
                    </div>

                    {/* FOOTER DISCLAIMER */}
                    {!isSurplus && (
                        <p className="text-[10px] text-white/40 mt-6 text-center italic font-medium">
                            *Disiplin adalah kunci. Menunda investasi akan memaksa klien menyisihkan nominal bulanan yang jauh lebih besar akibat hilangnya efek bunga majemuk (compounding interest).
                        </p>
                    )}
                </div>

            </div>
        </Card>
    );
}