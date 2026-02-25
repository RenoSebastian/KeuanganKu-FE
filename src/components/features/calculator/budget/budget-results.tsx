import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Wallet, BadgePercent, TrendingUp, CreditCard, HeartPulse,
    Landmark, Banknote, PiggyBank, ShieldCheck, CheckCircle2,
    FileJson, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BudgetResult, BudgetAllocation } from "@/lib/types";

// --- ANIMATED NUMBER ---
function AnimatedNumber({ value, className, isCurrency = true }: { value: number, className?: string, isCurrency?: boolean }) {
    const formatValue = (val: number) => {
        if (isCurrency) {
            return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0
            }).format(Math.abs(val));
        }
        return Math.round(val).toString();
    };

    const [displayVal, setDisplayVal] = useState(0);

    useEffect(() => {
        setDisplayVal(value); // Simplified for clean extraction
    }, [value]);

    return <span className={cn("font-mono tracking-tighter break-all w-full", className)}>{value < 0 ? "-" : ""}{formatValue(displayVal)}</span>;
}

// --- HELPER STYLE ---
const getAllocationStyle = (type: BudgetAllocation["type"]) => {
    switch (type) {
        case "NEEDS": return { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-700", icon: Wallet, iconColor: "text-blue-600" };
        case "DEBT_PROD": return { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-700", icon: TrendingUp, iconColor: "text-amber-600" };
        case "DEBT_CONS": return { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-700", icon: CreditCard, iconColor: "text-rose-600" };
        case "INSURANCE": return { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-700", icon: HeartPulse, iconColor: "text-indigo-600" };
        case "SAVING": return { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-700", icon: Landmark, iconColor: "text-emerald-600" };
        default: return { bg: "bg-slate-50", border: "border-slate-100", text: "text-slate-700", icon: Banknote, iconColor: "text-slate-500" };
    }
};

interface BudgetResultsProps {
    displayedResult: BudgetResult | null;
    viewMode: "MONTHLY" | "ANNUAL";
    setViewMode: (mode: "MONTHLY" | "ANNUAL") => void;
    generatedFiles: any;
    recommendation: string;
    onDownload: (type: 'PDF' | 'MGC') => void;
}

export function BudgetResults({
    displayedResult, viewMode, setViewMode, generatedFiles, recommendation, onDownload
}: BudgetResultsProps) {

    if (!displayedResult) {
        return (
            <div className="h-full min-h-100 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-300/60 rounded-[2.5rem] bg-white/40 backdrop-blur-sm animate-in fade-in duration-1000">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                    <BadgePercent className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-700 tracking-tight">Kalkulator Standby</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-sm font-medium leading-relaxed">
                    Silakan isi profil dan angka keuangan klien di panel kiri, lalu tekan <strong>Jalankan Kalkulasi</strong>.
                </p>
            </div>
        );
    }

    // Animation Variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { stiffness: 300, damping: 24 } }
    };

    return (
        <div className="space-y-6">
            {/* 1. SUCCESS BANNER */}
            {generatedFiles && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-linear-to-r from-emerald-500 to-teal-500 p-0.75 rounded-[1.5rem] shadow-xl shadow-emerald-500/20">
                    <div className="bg-white p-4 md:p-5 rounded-[1.35rem] flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full">
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-slate-800 text-sm md:text-base tracking-tight">Analisa Berhasil!</h4>
                                <p className="text-[11px] md:text-xs text-slate-500 font-medium mt-0.5">Laporan siap diunduh.</p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto justify-end">
                            <Button size="sm" variant="outline" onClick={() => onDownload('MGC')} className="h-11 px-4 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-xl font-bold shadow-sm">
                                <FileJson className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Backup .MGC</span>
                            </Button>
                            <Button size="sm" onClick={() => onDownload('PDF')} className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md">
                                <Download className="w-4 h-4 mr-2" /> Unduh PDF
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 2. TOGGLE HEADER */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Rekomendasi Anggaran</h2>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sistem Ideal 45-20-15-10-10</p>
                </div>
                <div className="bg-white p-1.5 rounded-xl border border-slate-200 flex shadow-sm">
                    <button onClick={() => setViewMode("MONTHLY")} className={cn("px-4 py-2 rounded-lg text-xs font-black transition-all", viewMode === "MONTHLY" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50")}>Bulanan</button>
                    <button onClick={() => setViewMode("ANNUAL")} className={cn("px-4 py-2 rounded-lg text-xs font-black transition-all", viewMode === "ANNUAL" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50")}>Tahunan</button>
                </div>
            </motion.div>

            {/* 3. BENTO GRID */}
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

                {/* HERO: SAFE TO SPEND */}
                <motion.div variants={itemVariants} className="md:col-span-2">
                    <Card className="bg-linear-to-br from-indigo-900 via-slate-900 to-indigo-950 p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden border-0">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none" />

                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="space-y-3 w-full">
                                <div className="flex items-center gap-2 text-indigo-200">
                                    <Wallet className="w-5 h-5 shrink-0" />
                                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.15em]">Safe to Spend ({viewMode === "MONTHLY" ? "Bulan Ini" : "Setahun"})</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[48px] font-black text-white tracking-tighter drop-shadow-lg leading-none break-all">
                                    <AnimatedNumber value={displayedResult.safeToSpend} />
                                </h2>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-5 rounded-2xl w-full">
                                <p className="text-xs md:text-sm text-indigo-100 font-medium leading-relaxed">
                                    Uang murni (<strong className="text-white font-black bg-indigo-500/50 px-1.5 py-0.5 rounded">45%</strong> dari total) yang boleh Anda habiskan untuk membiayai hidup.
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* SIDE: SURPLUS */}
                <motion.div variants={itemVariants} className="md:col-span-2">
                    <Card className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-full space-y-2">
                            <div className="flex items-center gap-2 text-emerald-600 mb-1.5">
                                <PiggyBank className="w-4 h-4 shrink-0" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Potensi Tabungan Ekstra (Surplus)</span>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-emerald-600 tracking-tighter break-all leading-none">
                                <AnimatedNumber value={displayedResult.surplus} />
                            </h3>
                            <p className="text-[10px] md:text-xs text-slate-400 font-medium">Berasal dari alokasi murni Penghasilan Tidak Tetap (Bonus/THR).</p>
                        </div>
                        {recommendation && (
                            <div className="bg-slate-50 p-4 md:p-5 rounded-[1.5rem] text-[11px] md:text-xs text-slate-600 font-medium w-full border border-slate-100">
                                <span className="font-black text-slate-800 uppercase tracking-widest text-[9px] flex items-center gap-1.5 mb-1.5">
                                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> Catatan Analis:
                                </span>
                                <span className="leading-relaxed">{recommendation}</span>
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* DETAILS LIST */}
                {displayedResult.allocations.filter(a => a.type !== "NEEDS").map((item, idx) => {
                    const style = getAllocationStyle(item.type);
                    const Icon = style.icon;
                    return (
                        <motion.div key={idx} variants={itemVariants}>
                            <Card className={cn("p-6 rounded-[2rem] border flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden group", style.bg, style.border)}>
                                <Icon className={cn("absolute -bottom-4 -right-4 w-28 h-28 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none", style.text)} />
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn("p-3 rounded-2xl bg-white shadow-sm border border-white/50", style.iconColor)}><Icon className="w-6 h-6" /></div>
                                        <span className={cn("text-xs font-black px-3 py-1.5 rounded-lg bg-white shadow-sm border border-white/50", style.text)}>{item.percentage}%</span>
                                    </div>
                                    <div className="mt-auto">
                                        <h4 className={cn("font-bold text-xs md:text-sm mb-1 uppercase tracking-widest", style.text)}>{item.label}</h4>
                                        <p className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter break-all leading-none flex items-center">
                                            <AnimatedNumber value={item.amount} />
                                        </p>
                                        <p className="text-[10px] md:text-[11px] text-slate-500 font-medium mt-3 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}