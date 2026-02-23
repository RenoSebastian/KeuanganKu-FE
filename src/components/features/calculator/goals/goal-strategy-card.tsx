import React from "react";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/financial-math";
import { PieChart, Zap, Target, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

    const safeTarget = futureTargetAmount > 0 ? futureTargetAmount : 1;
    const existingPercent = Math.min(100, Math.max(0, Math.round((futureExistingFund / safeTarget) * 100)));
    const gapPercent = Math.max(0, 100 - existingPercent);
    const isSurplus = futureExistingFund >= futureTargetAmount;

    return (
        <Card className="p-6 md:p-8 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50 flex flex-col gap-8 relative overflow-hidden group">

            {/* Background Accent */}
            <Activity className="absolute -bottom-10 -right-10 w-48 h-48 text-slate-50 opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-700" />

            <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-indigo-50 rounded-3xl text-indigo-600 shadow-inner border border-indigo-100">
                    <PieChart className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Strategi Pendanaan</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Komposisi Pencapaian Target</p>
                </div>
            </div>

            {/* VISUAL PROGRESS BAR (Thick Modern Style) */}
            <div className="space-y-3 relative z-10">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                    <span className="text-emerald-600 flex items-center gap-1.5"><Zap className="w-3 h-3" /> Aset Bertumbuh ({existingPercent}%)</span>
                    <span className={cn(isSurplus ? "text-emerald-600" : "text-amber-500", "flex items-center gap-1.5")}>
                        {isSurplus ? "Surplus (+)" : `Usaha Baru (${gapPercent}%)`} <Target className="w-3 h-3" />
                    </span>
                </div>

                <div className="h-8 md:h-10 w-full bg-slate-100 rounded-2xl overflow-hidden flex relative shadow-inner p-1 gap-1">
                    {/* Segment 1: Modal Awal (Passive Growth) */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${isSurplus ? 100 : existingPercent}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-linear-to-r from-emerald-400 to-emerald-500 rounded-xl relative overflow-hidden flex items-center justify-end px-2"
                    >
                        <div className="absolute inset-0 bg-[url('/images/pattern-stripes.png')] opacity-10" />
                    </motion.div>

                    {/* Segment 2: Gap (Active Saving Needed) */}
                    {!isSurplus && (
                        <motion.div
                            initial={{ width: 100 }}
                            animate={{ width: `${gapPercent}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-linear-to-r from-amber-400 to-orange-400 rounded-xl relative overflow-hidden flex items-center px-2"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-size-[4px_4px] opacity-30" />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* LEGEND / DETAILS (Bento Style) - FIXED: h-full flex-col justify-between */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 items-stretch">

                {/* Box A: Passive Growth */}
                <div className="bg-emerald-50/80 p-5 rounded-[1.5rem] border border-emerald-100 hover:shadow-md transition-all h-full flex flex-col justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                            <Zap className="w-4 h-4" />
                        </div>
                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Pertumbuhan Pasif</p>
                        <div className="w-full">
                            <p className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter break-all leading-none">{formatRupiah(futureExistingFund)}</p>
                        </div>
                    </div>
                    {/* Teks ditempatkan di bawah agar rata */}
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-4 font-medium">
                        Hasil akhir dari modal awal klien yang didiamkan dan bertumbuh <strong className="text-slate-700">{returnRate}%</strong> per tahun.
                    </p>
                </div>

                {/* Box B: Active Target */}
                <div className={cn("p-5 rounded-[1.5rem] border hover:shadow-md transition-all h-full flex flex-col justify-between", isSurplus ? "bg-emerald-50/80 border-emerald-100" : "bg-amber-50/80 border-amber-100")}>
                    <div className="flex flex-col gap-2">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mb-1", isSurplus ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")}>
                            <Target className="w-4 h-4" />
                        </div>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", isSurplus ? "text-emerald-700" : "text-amber-700")}>
                            {isSurplus ? "Kelebihan Dana (Surplus)" : "Usaha Aktif (Gap)"}
                        </p>
                        <div className="w-full">
                            <p className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter break-all leading-none">
                                {isSurplus ? formatRupiah(futureExistingFund - futureTargetAmount) : formatRupiah(netTarget)}
                            </p>
                        </div>
                    </div>
                    {/* Teks ditempatkan di bawah agar rata */}
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-4 font-medium">
                        {isSurplus
                            ? "Modal awal klien sudah sangat kuat, tidak perlu tambahan investasi rutin untuk tujuan ini."
                            : "Jumlah nominal yang masih kurang dan wajib dikejar klien melalui rutinitas menabung."
                        }
                    </p>
                </div>

            </div>
        </Card>
    );
}