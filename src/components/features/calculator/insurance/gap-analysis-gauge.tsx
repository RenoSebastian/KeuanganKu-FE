import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/financial-math";
import { ShieldCheck, AlertTriangle, CheckCircle2, Wallet, MinusCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GapAnalysisProps {
    totalNeeded: number;
    existingCoverage: number;
    coverageGap: number;
}

export function GapAnalysisGauge({ totalNeeded, existingCoverage, coverageGap }: GapAnalysisProps) {
    // Hitung Persentase Proteksi (Max 100% untuk visual bar)
    const coveragePercent = totalNeeded > 0
        ? Math.min(100, Math.round((existingCoverage / totalNeeded) * 100))
        : 0;

    const isSafe = coverageGap <= 0;

    return (
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-brand-600" />
                        Analisa Kecukupan UP
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Indikator kesehatan proteksi asuransi klien.
                    </p>
                </div>

                <Badge variant={isSafe ? "default" : "danger"} className={cn("px-3 py-1 rounded-full text-xs font-bold", isSafe ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-rose-100 text-rose-700 hover:bg-rose-200")}>
                    {isSafe ? "PROTEKSI AMAN" : "RISIKO TINGGI"}
                </Badge>
            </div>

            {/* --- VISUAL BAR (Gauge) --- */}
            <div className="space-y-2 mb-8">
                <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className={cn(isSafe ? "text-emerald-600" : "text-rose-600")}>
                        Terpenuhi: {coveragePercent}%
                    </span>
                    <span className="text-slate-400">Target: 100%</span>
                </div>

                <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                    <div
                        className={cn("absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out", isSafe ? "bg-emerald-500" : "bg-rose-500")}
                        style={{ width: `${coveragePercent}%` }}
                    />
                    {/* Pattern Overlay */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/images/pattern-stripes.png')]" />
                </div>
            </div>

            {/* --- NUMERIC BREAKDOWN (VERTICAL LIST) --- */}
            <div className="space-y-3">

                {/* ROW 1: TOTAL KEBUTUHAN */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 rounded-xl border border-slate-100 gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 shadow-sm">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Kebutuhan</p>
                            <p className="text-xs text-slate-500">Total dana perlindungan</p>
                        </div>
                    </div>
                    <div className="text-right w-full sm:w-auto mt-2 sm:mt-0 pl-11 sm:pl-0">
                        <span className="text-lg font-black text-slate-800 tracking-tight">
                            {formatRupiah(totalNeeded)}
                        </span>
                    </div>
                </div>

                {/* ROW 2: EXISTING (DEDUCTION) */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-blue-50/50 rounded-xl border border-blue-100 gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-blue-100 text-blue-500 shadow-sm">
                            <MinusCircle className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Dikurangi</p>
                            <p className="text-xs text-blue-600">Asuransi yang sudah dimiliki</p>
                        </div>
                    </div>
                    <div className="text-right w-full sm:w-auto mt-2 sm:mt-0 pl-11 sm:pl-0">
                        <span className="text-lg font-bold text-blue-700 tracking-tight">
                            {formatRupiah(existingCoverage)}
                        </span>
                    </div>
                </div>

                {/* ROW 3: GAP RESULT (HIGHLIGHT) */}
                <div className={cn(
                    "relative overflow-hidden p-5 rounded-xl border-2 transition-all mt-2",
                    isSafe ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
                )}>
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-full border shadow-sm bg-white", isSafe ? "text-emerald-600 border-emerald-200" : "text-rose-600 border-rose-200")}>
                                {isSafe ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                            </div>
                            <div>
                                <p className={cn("text-xs font-bold uppercase tracking-widest mb-0.5", isSafe ? "text-emerald-600" : "text-rose-600")}>
                                    {isSafe ? "SURPLUS (AMAN)" : "KEKURANGAN (GAP)"}
                                </p>
                                <p className={cn("text-sm opacity-80 font-medium", isSafe ? "text-emerald-800" : "text-rose-800")}>
                                    {isSafe ? "Klien memiliki kelebihan proteksi sebesar:" : "Wajib menambah UP minimal:"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className={cn("text-2xl md:text-3xl font-black tracking-tighter", isSafe ? "text-emerald-700" : "text-rose-700")}>
                        {formatRupiah(Math.abs(coverageGap))}
                    </div>

                    {/* Background Decor */}
                    <div className={cn("absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-50 pointer-events-none", isSafe ? "bg-emerald-300" : "bg-rose-300")} />
                </div>

            </div>
        </Card>
    );
}