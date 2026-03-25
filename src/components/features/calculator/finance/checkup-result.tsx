"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2, AlertTriangle, XCircle,
    RefreshCcw, FileText, ChevronDown, ChevronUp, ArrowLeft,
    TrendingUp, Activity, Download,
    Lock, Sparkles, Scale, Wallet, Target, Info, FileArchive,
    User, Heart, Calendar, Phone, Briefcase, MapPin
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { FinancialRecord, HealthAnalysisResult, CheckupSimulationResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { financialService } from "@/services/financial.service";
import { PdfLoadingModal } from "./pdf-loading-modal";
import { generateSimulationFilename } from "@/lib/formatters";

type ViewMode = "USER_VIEW" | "DIRECTOR_VIEW" | "AGENT_SIMULATION";

interface CheckupResultProps {
    data: any;
    rawData?: FinancialRecord;
    onReset?: () => void;
    onEditData?: () => void;
    onDownloadPdf?: () => void;
    mode?: ViewMode;
    isDownloading?: boolean;
}

// ============================================================================
// ANIMATED NUMBER COMPONENT
// ============================================================================
function AnimatedNumber({ value, className, isSurplus = false, isCurrency = true }: { value: number, className?: string, isSurplus?: boolean, isCurrency?: boolean }) {
    const formatValue = (val: number) => {
        // Pelindung jika NaN masuk
        const safeVal = Number.isNaN(val) ? 0 : val;
        const absVal = Math.abs(safeVal);

        if (isCurrency) {
            const formatted = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0
            }).format(absVal);
            return isSurplus && safeVal >= 0 ? `+${formatted}` : (safeVal < 0 ? `-${formatted}` : formatted);
        }

        return Math.round(safeVal).toString();
    };

    const [displayVal, setDisplayVal] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1500;
        const safeValue = Number.isNaN(value) ? 0 : value;

        if (safeValue === 0) {
            setDisplayVal(0);
            return;
        }

        const increment = safeValue / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if ((increment > 0 && start >= safeValue) || (increment < 0 && start <= safeValue)) {
                setDisplayVal(safeValue);
                clearInterval(timer);
            } else {
                setDisplayVal(start);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <span className={cn("font-mono tracking-tighter", className)}>
            {formatValue(displayVal)}
        </span>
    );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function CheckupResult({
    data,
    rawData,
    onReset,
    onDownloadPdf,
    onEditData,
    mode = "USER_VIEW",
    isDownloading = false
}: CheckupResultProps) {

    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
    const [localPdfLoading, setLocalPdfLoading] = useState(false);
    const [isDownloadingMgc, setIsDownloadingMgc] = useState(false);

    const isReadOnly = mode === "DIRECTOR_VIEW";
    const isAgentMode = mode === "AGENT_SIMULATION";

    // --- DATA NORMALIZATION (Safe Parsing) ---
    let payload: CheckupSimulationResult | HealthAnalysisResult | null = null;
    let clientInfo: any = null;

    // Optional chaining untuk menghindari error `Cannot read properties of undefined`
    if (data?.data?.result) {
        payload = data.data.result;
        clientInfo = data.data.client;
    } else if (data?.result) {
        payload = data.result;
        clientInfo = data.client || data?.userProfile;
    } else {
        payload = data;
        clientInfo = data?.client || data?.userProfile;
    }

    // Helper untuk Status Pernikahan
    const getMaritalStatusLabel = (status?: string) => {
        if (!status) return "-";
        const map: Record<string, string> = {
            SINGLE: "Belum Menikah",
            MARRIED: "Menikah",
            DIVORCED: "Cerai",
            WIDOWED: "Cerai Mati"
        };
        return map[status] || status || "-";
    };

    // Pengecekan aman eksistensi payload
    if (!payload || (!payload?.ratios && !(payload as any)?.ratiosDetails)) {
        return (
            <div className="flex flex-col justify-center items-center p-12 bg-white/50 backdrop-blur-md rounded-3xl border border-slate-100 min-h-[40vh] shadow-inner">
                <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <Activity className="absolute inset-0 m-auto w-6 h-6 text-indigo-500 animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-slate-700 tracking-tight">Menyusun Laporan Finansial...</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Sistem sedang mengkalkulasi 8 rasio kesehatan.</p>
            </div>
        );
    }

    // Array type safety (Empty Array Guard)
    const rawRatios = payload?.ratios || (payload as any)?.ratiosDetails || [];
    const ratios = Array.isArray(rawRatios) ? rawRatios : Object.values(rawRatios || {});
    // Tambahkan anotasi tipe eksplisit : any[] atau : RatioDetail[]
    const safeRatios: any[] = Array.isArray(ratios) ? ratios : [];

    // Mathematical Fallbacks
    const score = Number(payload?.score ?? (payload as any)?.healthScore ?? 0) || 0;
    const netWorth = Number(payload?.netWorth ?? (payload as any)?.totalNetWorth ?? 0) || 0;
    const monthlySurplus = Number(payload?.surplusDeficit ?? 0) || 0;
    const displaySurplus = viewMode === "ANNUAL" ? monthlySurplus * 12 : monthlySurplus;

    // --- HANDLERS ---

    const handleAgentDownloadMgc = async () => {
        if (isDownloadingMgc) return;
        // [FIXED] Pengecekan disederhanakan: pastikan mgcToken eksis
        if (!data || !data.mgcToken) {
            alert("Data simulasi tidak valid atau token MGC belum digenerate oleh server.");
            return;
        }
        try {
            setIsDownloadingMgc(true);
            const clientName = clientInfo?.name || "Klien";
            await financialService.downloadSimulationFiles(data, clientName);
        } catch (error) {
            console.error("Simulation Download Error:", error);
            alert("Gagal memproses file simulasi.");
        } finally {
            setIsDownloadingMgc(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (localPdfLoading) return;

        try {
            setLocalPdfLoading(true);
            const clientName = clientInfo?.name || "Klien";

            if (isAgentMode) {
                if (onDownloadPdf) {
                    onDownloadPdf();
                } else if (data?.meta?.simulationId) {
                    // [FIXED] Gunakan On-Demand Fetcher karena kita di arsitektur Decoupled Checkup
                    await financialService.downloadAgentCheckupPdf(data.meta.simulationId, clientName);
                } else if (data?.pdfBuffer) {
                    // Fallback untuk modul Kalkulator lain (Legacy Stateless Streaming) yang mungkin meminjam komponen ini
                    const blob = new Blob([new Uint8Array(data.pdfBuffer.data)], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;

                    const filenamePdf = generateSimulationFilename("Financial Checkup", clientName, "pdf");
                    link.setAttribute('download', filenamePdf);

                    document.body.appendChild(link);
                    link.click();
                    link.parentNode?.removeChild(link);
                } else {
                    alert("ID Simulasi tidak ditemukan di respons server. PDF tidak dapat dicetak.");
                }
            } else {
                // Di User Mode / Personal Mode
                const recordId = (payload as any)?.id || (rawData as any)?.id || data?.meta?.simulationId;
                if (!recordId) {
                    alert("ID Laporan tidak ditemukan. Mohon simpan data terlebih dahulu.");
                    return;
                }
                await financialService.downloadCheckupPdf(recordId, clientName);
            }
        } catch (error) {
            console.error("PDF Download Error:", error);
            alert("Sistem gagal mengunduh dokumen PDF.");
        } finally {
            setLocalPdfLoading(false);
        }
    };

    // --- THEME ENGINE ---
    const getThemeConfig = (val: number) => {
        // Pengaman jika score adalah NaN
        const safeVal = Number.isNaN(val) ? 0 : val;

        if (safeVal >= 80) return {
            gradient: "from-emerald-900 via-emerald-800 to-teal-900",
            accent: "text-emerald-400",
            bgSoft: "bg-emerald-500/10 border-emerald-500/20",
            label: "SANGAT SEHAT",
            stroke: "#10b981",
            icon: CheckCircle2
        };
        if (safeVal >= 50) return {
            gradient: "from-slate-900 via-slate-800 to-amber-950",
            accent: "text-amber-400",
            bgSoft: "bg-amber-500/10 border-amber-500/20",
            label: "PERLU PERHATIAN",
            stroke: "#f59e0b",
            icon: AlertTriangle
        };
        return {
            gradient: "from-slate-900 via-rose-950 to-red-950",
            accent: "text-rose-400",
            bgSoft: "bg-rose-500/10 border-rose-500/20",
            label: "TIDAK SEHAT",
            stroke: "#f43f5e",
            icon: XCircle
        };
    };

    const theme = getThemeConfig(score);
    const StatusIcon = theme.icon;

    const healthyCount = safeRatios?.filter((r) => r?.statusColor === "GREEN_DARK" || r?.statusColor === "GREEN_LIGHT").length || 0;
    const priorityFix = safeRatios?.find((r) => r?.statusColor === "RED" || r?.statusColor === "YELLOW")?.label || "Pertumbuhan Aset";

    return (
        <div className="flex flex-col gap-6 md:gap-8 pb-8 animate-in fade-in zoom-in-95 duration-700">
            <PdfLoadingModal isOpen={localPdfLoading || isDownloading} />

            {/* =========================================
                1. THE EXECUTIVE HERO CARD 
                ========================================= */}
            <div className={cn(
                "relative w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden p-6 md:p-10 shadow-2xl bg-linear-to-br",
                theme.gradient
            )}>
                <div className="absolute inset-0 mix-blend-overlay opacity-20 pointer-events-none" style={{ backgroundImage: 'url("/images/noise.png")' }} />
                <div className="absolute top-0 right-0 w-160 h-160 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-120 h-120 bg-black/40 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:justify-between items-start gap-4 mb-8 md:mb-12">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl border backdrop-blur-md shadow-inner", theme.bgSoft)}>
                            {isReadOnly ? <Lock className={cn("w-6 h-6", theme.accent)} /> : <StatusIcon className={cn("w-6 h-6", theme.accent)} />}
                        </div>
                        <div>
                            <p className="text-[10px] md:text-xs font-bold text-white/60 uppercase tracking-widest mb-0.5">Status Finansial</p>
                            <h2 className={cn("text-lg md:text-xl font-black tracking-wide", theme.accent)}>{theme.label}</h2>
                        </div>
                    </div>

                    <div className="flex bg-black/30 p-1.5 rounded-xl backdrop-blur-md border border-white/10 shadow-inner w-full md:w-auto">
                        <button
                            onClick={() => setViewMode("MONTHLY")}
                            className={cn(
                                "flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                                viewMode === "MONTHLY" ? "bg-white/15 text-white shadow-md border border-white/10" : "text-white/50 hover:text-white/80"
                            )}
                        >
                            1 Bulan
                        </button>
                        <button
                            onClick={() => setViewMode("ANNUAL")}
                            className={cn(
                                "flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                                viewMode === "ANNUAL" ? "bg-white/15 text-white shadow-md border border-white/10" : "text-white/50 hover:text-white/80"
                            )}
                        >
                            1 Tahun
                        </button>
                    </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    {/* Left: Financial Value */}
                    <div className="lg:col-span-7 flex flex-col gap-8 md:gap-10">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-white/60 mb-2">
                                <Wallet className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Kekayaan Bersih</span>
                            </div>
                            <div className="flex flex-wrap items-baseline">
                                <AnimatedNumber
                                    value={netWorth}
                                    isCurrency={true}
                                    className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] leading-none font-black text-white"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-white/60 mb-2">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    Cashflow (Surplus/Defisit)
                                </span>
                            </div>
                            <div className="flex flex-wrap items-baseline">
                                <AnimatedNumber
                                    value={displaySurplus}
                                    isSurplus={true}
                                    isCurrency={true}
                                    className={cn(
                                        "text-2xl sm:text-3xl md:text-4xl lg:text-[42px] leading-none font-black",
                                        displaySurplus >= 0 ? "text-emerald-400" : "text-rose-400"
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: GAUGE DIPERBESAR */}
                    <div className="lg:col-span-5 flex justify-center lg:justify-end">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 1.5, bounce: 0.4 }}
                            className="relative w-56 h-56 md:w-64 md:h-64 lg:w-70 lg:h-70"
                        >
                            <div className={cn("absolute inset-0 m-auto w-[60%] h-[60%] rounded-full blur-2xl opacity-20", theme.bgSoft.split(" ")[0])} />

                            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                                <motion.circle
                                    cx="50" cy="50" r="42" fill="none"
                                    stroke={theme.stroke} strokeWidth="12"
                                    strokeDasharray={`${(score >= 0 ? score : 0) * 2.638} 263.8`}
                                    strokeLinecap="round"
                                    initial={{ strokeDasharray: `0 263.8` }}
                                    animate={{ strokeDasharray: `${(score >= 0 ? score : 0) * 2.638} 263.8` }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    className="drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                                />
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none flex items-center">
                                    <AnimatedNumber value={score >= 0 ? score : 0} isCurrency={false} className="font-sans tracking-tighter" />
                                    <span className="text-2xl lg:text-3xl text-white/50 ml-1 mb-2">%</span>
                                </span>
                                <span className="text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest mt-2">Health Score</span>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>

            {/* =========================================
                2. AI DIAGNOSA & CLIENT INFO
                ========================================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AI Summary */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-200 flex flex-col gap-4 relative overflow-hidden"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl shrink-0">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">Analisa Cerdas Sistem</h4>
                    </div>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                        Anda memiliki <strong className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{healthyCount} indikator SEHAT</strong>.
                        Sistem merekomendasikan Anda untuk segera memperbaiki sektor <strong className="text-indigo-600 border-b border-indigo-200">{priorityFix}</strong> guna meningkatkan skor kesehatan total.
                    </p>
                </motion.div>

                {/* Client Info (With Marital Status) */}
                {clientInfo && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-200 flex flex-col gap-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-xl shrink-0">
                                <User className="w-5 h-5 text-slate-600" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800">Profil Klien</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600">
                            <div className="flex flex-col">
                                <span className="text-slate-400">Nama</span>
                                <span className="font-semibold">{clientInfo?.name || "-"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-400">Status</span>
                                <span className="font-semibold">{getMaritalStatusLabel(clientInfo?.maritalStatus)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-400">Pekerjaan</span>
                                <span className="font-semibold">{clientInfo?.occupation || clientInfo?.job || "-"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate-400">Domisili</span>
                                <span className="font-semibold">{clientInfo?.city || "-"}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* =========================================
                3. THE 8 RATIOS 
                ========================================= */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
            >
                <div className="flex items-center gap-3 px-2">
                    <div className="p-2 bg-slate-100 rounded-lg"><Scale className="w-4 h-4 text-slate-600" /></div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Detail 8 Indikator Rasio</h3>
                </div>

                <div className="flex flex-col gap-3">
                    {/* Pengecekan Aman jika Ratios Kosong (Empty State Guardian) */}
                    {safeRatios.length > 0 ? (
                        safeRatios.map((ratio: any, index: number) => {
                            const isExpanded = expandedCard === ratio?.id;

                            let statusColor = "bg-slate-100 text-slate-500 border-slate-200";
                            let progressColor = "bg-slate-300";
                            if (ratio?.statusColor === "GREEN_DARK" || ratio?.statusColor === "GREEN_LIGHT") {
                                statusColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                                progressColor = "bg-emerald-500";
                            } else if (ratio?.statusColor === "YELLOW") {
                                statusColor = "bg-amber-50 text-amber-700 border-amber-100";
                                progressColor = "bg-amber-500";
                            } else if (ratio?.statusColor === "RED") {
                                statusColor = "bg-rose-50 text-rose-700 border-rose-100";
                                progressColor = "bg-rose-500";
                            }

                            const isPercentage = ["liq_networth", "saving_ratio", "debt_asset_ratio", "debt_service_ratio", "consumptive_ratio", "invest_asset_ratio", "solvency_ratio"].includes(ratio?.id);

                            // Pelindung jika ratio.value is undefined
                            const valNum = Number(ratio?.value) || 0;
                            const displayVal = isPercentage ? `${valNum}%` : `${valNum}x`;
                            const targetVal = `${ratio?.benchmark || "-"}`;

                            return (
                                <motion.div
                                    key={ratio?.id || index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all overflow-hidden"
                                >
                                    <div
                                        className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                                        onClick={() => setExpandedCard(isExpanded ? null : ratio?.id)}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shrink-0", statusColor)}>
                                                {ratio?.statusColor === "GREEN_DARK" ? "Sangat Sehat" : ratio?.statusColor === "GREEN_LIGHT" ? "Sehat" : ratio?.statusColor === "YELLOW" ? "Waspada" : "Bahaya"}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm md:text-base text-slate-800 group-hover:text-indigo-600 transition-colors">{ratio?.label || "Rasio Keuangan"}</h4>
                                                <p className="text-xs text-slate-500 font-medium">Target rasio ideal: {targetVal}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6 md:w-auto w-full border-t border-slate-100 md:border-0 pt-3 md:pt-0">
                                            <div className="text-xl md:text-2xl font-black text-slate-800">
                                                {displayVal}
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "grid transition-all duration-300 ease-in-out bg-slate-50 border-t border-slate-100",
                                        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                    )}>
                                        <div className="overflow-hidden">
                                            <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6">
                                                <div className="flex-1">
                                                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <FileText className="w-3 h-3" /> Rekomendasi Ahli
                                                    </h5>
                                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                                        {ratio?.recommendation || "Tidak ada rekomendasi khusus saat ini."}
                                                    </p>
                                                </div>
                                                <div className="w-full md:w-48 shrink-0 flex flex-col justify-center">
                                                    <div className="flex justify-between text-xs font-bold mb-2">
                                                        <span className="text-slate-500">Nilai Anda</span>
                                                        <span className={cn(statusColor.split(" ")[1])}>{displayVal}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: isExpanded ? (isPercentage ? `${Math.min(valNum, 100)}%` : '50%') : 0 }}
                                                            transition={{ duration: 1, delay: 0.2 }}
                                                            className={cn("h-full rounded-full", progressColor)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="p-8 flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl">
                            <Activity className="w-8 h-8 text-slate-300 mb-3" />
                            <p className="text-slate-500 font-medium text-sm">Data detail rasio tidak tersedia.</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* =========================================
                4. IN-FLOW ACTION BAR
                ========================================= */}
            {!isReadOnly && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                    <div className="flex items-center gap-3 text-slate-500 max-w-sm">
                        <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                            <Info className="w-4 h-4 text-slate-600" />
                        </div>
                        <p className="text-xs leading-relaxed font-medium">
                            {isAgentMode
                                ? "Cetak PDF untuk klien Anda, atau simpan Backup (.mgc) untuk mengubah simulasi ini di lain waktu."
                                : "Laporan ini disimpan otomatis di riwayat Anda."}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-wrap justify-end">

                        {onEditData && (
                            <Button
                                variant="outline"
                                onClick={onEditData}
                                disabled={isDownloading || localPdfLoading}
                                className="w-full sm:w-auto h-12 rounded-xl border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-50 active:scale-95 transition-all px-6"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Revisi Input
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            onClick={onReset}
                            disabled={isDownloading}
                            className="w-full sm:w-auto h-12 rounded-xl border-slate-300 text-slate-600 font-bold hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 active:scale-95 transition-all px-6"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Mulai Sesi Baru
                        </Button>

                        {isAgentMode && (
                            <Button
                                onClick={handleAgentDownloadMgc}
                                disabled={isDownloadingMgc || localPdfLoading}
                                className="w-full sm:w-auto h-12 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 active:scale-95 transition-all px-6"
                            >
                                {isDownloadingMgc ? (
                                    <><RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> ...</>
                                ) : (
                                    <><FileArchive className="w-4 h-4 mr-2" /> Backup Data (.mgc)</>
                                )}
                            </Button>
                        )}

                        <Button
                            onClick={handleDownloadPdf}
                            disabled={localPdfLoading || isDownloading}
                            className="w-full sm:w-auto h-12 rounded-xl font-black shadow-lg shadow-emerald-500/30 bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-white px-8"
                        >
                            {localPdfLoading || isDownloading ? (
                                <><RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> Merender PDF...</>
                            ) : (
                                <><Download className="w-5 h-5 mr-2" /> Cetak Laporan PDF</>
                            )}
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}