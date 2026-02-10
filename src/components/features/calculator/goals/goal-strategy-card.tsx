import React from "react";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/financial-math";
import { PieChart, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalStrategyProps {
    futureTargetAmount: number; // Total Target (FV)
    futureExistingFund: number; // Aset Lama Tumbuh (FV Existing)
    returnRate: number;         // Asumsi Investasi
    netTarget: number;          // Kekurangan (Gap)
}

export function GoalStrategyCard({
    futureTargetAmount,
    futureExistingFund,
    returnRate,
    netTarget
}: GoalStrategyProps) {

    // Validasi pembagian dengan nol
    const safeTarget = futureTargetAmount > 0 ? futureTargetAmount : 1;

    // Hitung persentase kontribusi
    const existingPercent = Math.min(100, Math.round((futureExistingFund / safeTarget) * 100));
    const gapPercent = 100 - existingPercent;
    const isSurplus = futureExistingFund >= futureTargetAmount;

    return (
        <Card className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <PieChart className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800">Strategi Pendanaan</h3>
                    <p className="text-xs text-slate-500">Analisa Modal Awal vs Target Akhir</p>
                </div>
            </div>

            {/* VISUAL PROGRESS BAR */}
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-emerald-600">Modal Tumbuh ({existingPercent}%)</span>
                    <span className={cn(isSurplus ? "text-emerald-600" : "text-orange-500")}>
                        {isSurplus ? "Surplus (+)" : `Kekurangan (${gapPercent}%)`}
                    </span>
                </div>

                <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden flex relative">
                    {/* Segment 1: Modal Awal (Passive Growth) */}
                    <div
                        className="h-full bg-emerald-500 transition-all duration-700 ease-out relative group"
                        style={{ width: `${isSurplus ? 100 : existingPercent}%` }}
                    >
                        <div className="absolute inset-0 bg-[url('/images/pattern-stripes.png')] opacity-20" />
                    </div>

                    {/* Segment 2: Gap (Active Saving Needed) */}
                    {!isSurplus && (
                        <div
                            className="h-full bg-orange-400 transition-all duration-700 ease-out relative"
                            style={{ width: `${gapPercent}%` }}
                        >
                            {/* Pattern dots */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-size-[4px_4px]" />
                        </div>
                    )}
                </div>
            </div>

            {/* LEGEND / DETAILS */}
            <div className="grid grid-cols-2 gap-4">

                {/* Box A: Passive Growth */}
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <div className="flex items-start gap-2">
                        <div className="mt-0.5"><Zap className="w-3.5 h-3.5 text-emerald-600" /></div>
                        <div>
                            <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Pasif (Modal Awal)</p>
                            <p className="text-sm font-black text-slate-800">{formatRupiah(futureExistingFund)}</p>
                            <p className="text-[9px] text-slate-500 leading-tight mt-1">
                                Hasil dari modal awal yang didiamkan tumbuh {returnRate}% per tahun.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Box B: Active Target */}
                <div className={cn("p-3 rounded-xl border", isSurplus ? "bg-emerald-50/50 border-emerald-100" : "bg-orange-50/50 border-orange-100")}>
                    <div className="flex items-start gap-2">
                        <div className="mt-0.5"><Target className={cn("w-3.5 h-3.5", isSurplus ? "text-emerald-600" : "text-orange-600")} /></div>
                        <div>
                            <p className={cn("text-[10px] font-bold uppercase mb-1", isSurplus ? "text-emerald-700" : "text-orange-700")}>
                                {isSurplus ? "Surplus Dana" : "Target Aktif (Gap)"}
                            </p>
                            <p className="text-sm font-black text-slate-800">
                                {isSurplus ? formatRupiah(futureExistingFund - futureTargetAmount) : formatRupiah(netTarget)}
                            </p>
                            <p className="text-[9px] text-slate-500 leading-tight mt-1">
                                {isSurplus
                                    ? "Modal awal Anda sudah lebih dari cukup untuk mencapai target."
                                    : "Jumlah ini yang harus dikejar melalui tabungan rutin bulanan."
                                }
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </Card>
    );
}