import React from "react";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/financial-math";
import { CheckCircle2, TrendingUp, PiggyBank, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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
            "relative overflow-hidden rounded-3xl border-0 shadow-xl transition-all duration-500 group",
            isSurplus
                ? "bg-linear-to-br from-teal-600 to-emerald-800 text-white" // Green Theme
                : "bg-linear-to-br from-violet-600 to-indigo-900 text-white" // Violet Theme
        )}>

            {/* Background Abstract Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="p-6 md:p-8 relative z-10">

                {/* HEADER SECTION */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/10">
                        {isSurplus ? (
                            <CheckCircle2 className="w-8 h-8 text-emerald-100" />
                        ) : (
                            <PiggyBank className="w-8 h-8 text-violet-100" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-wide">
                            {isSurplus ? "Tujuan Tercapai!" : "Rekomendasi Investasi"}
                        </h3>
                        <p className="text-sm text-white/80 font-medium">
                            {isSurplus
                                ? "Modal awal Anda diproyeksikan cukup."
                                : "Langkah konkret yang harus dilakukan."}
                        </p>
                    </div>
                </div>

                {/* HERO AMOUNT */}
                <div className="text-center md:text-left mb-8">
                    <p className="text-[11px] uppercase font-bold tracking-widest text-white/60 mb-2">
                        {isSurplus ? "Estimasi Kelebihan Dana" : "Sisihkan Rutin Per Bulan"}
                    </p>

                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                        <span className="text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-lg">
                            {formatRupiah(monthlySaving)}
                        </span>
                        {isSurplus && <span className="text-lg font-medium text-emerald-200">(Surplus)</span>}
                    </div>

                    {!isSurplus && (
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm shadow-sm">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                            <span className="text-xs font-semibold text-white/90">
                                Instrumen investasi return {returnRate}% p.a
                            </span>
                        </div>
                    )}
                </div>

                {/* SUMMARY BOX */}
                <div className="bg-black/20 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-inner">
                    <div className="flex justify-between items-center text-sm mb-3">
                        <span className="text-white/70 flex items-center gap-2 font-medium">
                            <CheckCircle2 className="w-4 h-4 opacity-70" />
                            Target Akhir (FV)
                        </span>
                        <span className="font-bold text-white text-base tracking-tight">
                            {formatRupiah(totalTarget)}
                        </span>
                    </div>

                    <Separator className="bg-white/10 mb-3" />

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/70 flex items-center gap-2 font-medium">
                            <CalendarClock className="w-4 h-4 opacity-70" />
                            Durasi Menabung
                        </span>
                        <span className="font-bold text-white text-base">
                            {yearsDuration} Tahun
                        </span>
                    </div>
                </div>

                {/* FOOTER DISCLAIMER */}
                {!isSurplus && (
                    <p className="text-[10px] text-white/40 mt-6 text-center italic max-w-md mx-auto">
                        *Pastikan disiplin menabung setiap bulan. Keterlambatan memulai akan meningkatkan nominal bulanan secara signifikan karena berkurangnya efek bunga majemuk.
                    </p>
                )}

            </div>
        </Card>
    );
}