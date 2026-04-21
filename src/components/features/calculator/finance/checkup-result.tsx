"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2, AlertTriangle, XCircle,
    RefreshCcw, FileText, ChevronDown, ChevronUp, ArrowLeft,
    TrendingUp, Activity, Share2, FileJson,
    Lock, Sparkles, Scale, Wallet, Target, Info, FileArchive,
    User, Heart, Calendar, Phone, Briefcase, MapPin
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { FinancialRecord, HealthAnalysisResult, CheckupSimulationResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { financialService } from "@/services/financial.service";
import { PdfLoadingModal } from "./pdf-loading-modal";
import { generateSimulationFilename } from "@/lib/formatters";

// [NEW ARCHITECTURE] Import mesin eksekutor Universal
import { executeUniversalExport } from "@/utils/universal-export-engine";

type ViewMode = "USER_VIEW" | "DIRECTOR_VIEW" | "AGENT_SIMULATION";

interface CheckupResultProps {
    data: any;
    rawData?: FinancialRecord;
    generatedFiles?: {
        pdfBlob: Blob | null;
        mgcToken: string | null;
        filenameMgc: string | null;
        filenamePdf: string | null;
    } | null;
    setGeneratedFiles?: (data: any) => void;
    onReset?: () => void;
    onEditData?: () => void;
    mode?: ViewMode;
    isDownloading?: boolean;
}

// ============================================================================
// ANIMATED NUMBER COMPONENT
// ============================================================================
function AnimatedNumber({ value, className, isSurplus = false, isCurrency = true }: { value: number, className?: string, isSurplus?: boolean, isCurrency?: boolean }) {
    const formatValue = (val: number) => {
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
    generatedFiles,
    setGeneratedFiles,
    onReset,
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
    const mgcToken = data?.mgcToken || data?.data?.mgcToken || generatedFiles?.mgcToken;

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

    const getMaritalStatusLabel = (status?: string) => {
        if (!status) return "-";
        const map: Record<string, string> = { SINGLE: "Belum Menikah", MARRIED: "Menikah", DIVORCED: "Cerai", WIDOWED: "Cerai Mati" };
        return map[status] || status || "-";
    };

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

    const rawRatios = payload?.ratios || (payload as any)?.ratiosDetails || [];
    const ratios = Array.isArray(rawRatios) ? rawRatios : Object.values(rawRatios || {});
    const safeRatios: any[] = Array.isArray(ratios) ? ratios : [];

    const score = Number(payload?.score ?? (payload as any)?.healthScore ?? 0) || 0;
    const netWorth = Number(payload?.netWorth ?? (payload as any)?.totalNetWorth ?? 0) || 0;
    const monthlySurplus = Number(payload?.surplusDeficit ?? 0) || 0;
    const displaySurplus = viewMode === "ANNUAL" ? monthlySurplus * 12 : monthlySurplus;

    // --- REFACTORED UNIVERSAL EXPORT HANDLERS ---

    const handleAgentDownloadMgc = async () => {
        if (isDownloadingMgc) return;

        if (!mgcToken) {
            toast.error("Token MGC tidak tersedia.");
            return;
        }

        try {
            setIsDownloadingMgc(true);
            const clientName = clientInfo?.name || "Klien";
            const filename = generatedFiles?.filenameMgc || generateSimulationFilename("Checkup Plan", clientName, "mgc");

            // Transformasi string ke Blob Biner untuk Universal Engine
            const mgcBlob = new Blob([mgcToken], { type: 'application/octet-stream' });
            const exportStatus = await executeUniversalExport(mgcBlob, filename);

            if (exportStatus === 'SHARED') toast.success("File Backup (.mgc) siap dibagikan.");
            else if (exportStatus === 'DOWNLOADED') toast.success("File Backup (.mgc) berhasil disimpan.");

        } catch (error) {
            console.error("Simulation Download Error:", error);
            toast.error("Gagal memproses file backup.");
        } finally {
            setIsDownloadingMgc(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (localPdfLoading || isDownloading) return;

        try {
            setLocalPdfLoading(true);
            const clientName = clientInfo?.name || "Klien";
            const filenamePdf = generatedFiles?.filenamePdf || generateSimulationFilename("Checkup Plan", clientName, "pdf");

            let blob: Blob;

            // Jika PDF sudah di-generate dan tersimpan di state
            if (generatedFiles?.pdfBlob) {
                blob = generatedFiles.pdfBlob;
            } else {
                // Jika belum di-generate, minta dari server
                if (isAgentMode) {
                    const simId = data?.meta?.simulationId || (payload as any)?.id;
                    if (!simId) { toast.error("ID Simulasi tidak tersedia untuk cetak PDF."); return; }
                    const response = await financialService.downloadAgentCheckupPdf(simId, clientName);
                    // Ambil raw data (buffer) lalu jadikan Blob
                    blob = new Blob([(response as any).data || response], { type: 'application/pdf' });
                } else {
                    const recordId = (payload as any)?.id || (rawData as any)?.id || data?.meta?.simulationId;
                    if (!recordId) { toast.error("ID Laporan tidak ditemukan."); return; }
                    const response = await financialService.downloadCheckupPdf(recordId, clientName);
                    blob = new Blob([(response as any).data || response], { type: 'application/pdf' });
                }

                // Simpan ke state untuk menghemat request berikutnya
                if (setGeneratedFiles) {
                    setGeneratedFiles({
                        ...generatedFiles,
                        pdfBlob: blob,
                        filenamePdf: filenamePdf
                    });
                }
            }

            // Eksekusi Blob PDF via Engine
            const exportStatus = await executeUniversalExport(blob, filenamePdf);
            if (exportStatus === 'SHARED') toast.success("Dokumen PDF siap dibagikan.");
            else if (exportStatus === 'DOWNLOADED') toast.success("Dokumen PDF berhasil diunduh.");

        } catch (error) {
            console.error("PDF Download Error:", error);
            toast.error("Sistem gagal memproses dokumen PDF.");
        } finally {
            setLocalPdfLoading(false);
        }
    };

    // --- THEME ENGINE ---
    const getThemeConfig = (val: number) => {
        const safeVal = Number.isNaN(val) ? 0 : val;
        if (safeVal >= 80) return { gradient: "from-emerald-900 via-emerald-800 to-teal-900", accent: "text-emerald-400", bgSoft: "bg-emerald-500/10 border-emerald-500/20", label: "SANGAT SEHAT", stroke: "#10b981", icon: CheckCircle2 };
        if (safeVal >= 50) return { gradient: "from-slate-900 via-slate-800 to-amber-950", accent: "text-amber-400", bgSoft: "bg-amber-500/10 border-amber-500/20", label: "PERLU PERHATIAN", stroke: "#f59e0b", icon: AlertTriangle };
        return { gradient: "from-slate-900 via-rose-950 to-red-950", accent: "text-rose-400", bgSoft: "bg-rose-500/10 border-rose-500/20", label: "TIDAK SEHAT", stroke: "#f43f5e", icon: XCircle };
    };

    const theme = getThemeConfig(score);
    const StatusIcon = theme.icon;
    const healthyCount = safeRatios?.filter((r) => r?.statusColor === "GREEN_DARK" || r?.statusColor === "GREEN_LIGHT").length || 0;
    const priorityFix = safeRatios?.find((r) => r?.statusColor === "RED" || r?.statusColor === "YELLOW")?.label || "Pertumbuhan Aset";

    return (
        <>
            <div className="flex flex-col gap-6 md:gap-8 pb-8 animate-in fade-in zoom-in-95 duration-700">
                <PdfLoadingModal isOpen={localPdfLoading || isDownloading} />

                {/* EXECUTIVE HERO CARD */}
                <div className={cn("relative w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden p-6 md:p-10 shadow-2xl bg-linear-to-br", theme.gradient)}>
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
                            <button onClick={() => setViewMode("MONTHLY")} className={cn("flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap", viewMode === "MONTHLY" ? "bg-white/15 text-white shadow-md border border-white/10" : "text-white/50 hover:bg-white/5")}>Bulanan</button>
                            <button onClick={() => setViewMode("ANNUAL")} className={cn("flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap", viewMode === "ANNUAL" ? "bg-white/15 text-white shadow-md border border-white/10" : "text-white/50 hover:bg-white/5")}>Tahunan</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 relative z-10">
                        <div className="md:col-span-5 flex flex-col justify-end">
                            <div className="mb-2">
                                <p className="text-[10px] md:text-xs font-bold text-white/60 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <Scale className="w-3.5 h-3.5" /> Skor Kesehatan
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <h1 className="text-6xl md:text-7xl lg:text-[80px] font-black text-white tracking-tighter leading-none">
                                        <AnimatedNumber value={score} isCurrency={false} />
                                    </h1>
                                    <span className="text-xl md:text-2xl font-bold text-white/50">/100</span>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-black/20 p-5 md:p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-inner flex flex-col justify-between">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-white/10 rounded-lg"><Wallet className="w-4 h-4 text-white" /></div>
                                    <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">Net Worth</h3>
                                </div>
                                <div>
                                    <p className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight break-all">
                                        <AnimatedNumber value={netWorth} />
                                    </p>
                                    <p className="text-[10px] text-white/50 font-medium mt-1">Total Harta Bersih</p>
                                </div>
                            </div>

                            <div className="bg-black/20 p-5 md:p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-inner flex flex-col justify-between">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-white/10 rounded-lg"><Target className="w-4 h-4 text-white" /></div>
                                    <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">Surplus</h3>
                                </div>
                                <div>
                                    <p className={cn("text-xl md:text-2xl lg:text-3xl font-black tracking-tight break-all", displaySurplus >= 0 ? "text-white" : "text-rose-400")}>
                                        <AnimatedNumber value={displaySurplus} isSurplus />
                                    </p>
                                    <p className="text-[10px] text-white/50 font-medium mt-1">Sisa Dana ({viewMode === "MONTHLY" ? "Per Bulan" : "Per Tahun"})</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* INFO CLIENT (Opsional/Bisa Dikecilkan) */}
                {clientInfo && (
                    <div className="bg-white px-6 py-5 rounded-[2rem] border border-slate-100 shadow-xs flex flex-wrap items-center gap-x-8 gap-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100"><User className="w-4 h-4 text-slate-400" /></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Klien</p>
                                <p className="text-sm font-bold text-slate-700">{clientInfo.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100"><Calendar className="w-4 h-4 text-slate-400" /></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Usia</p>
                                <p className="text-sm font-bold text-slate-700">{clientInfo.age || "-"} Tahun</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100"><Heart className="w-4 h-4 text-slate-400" /></div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</p>
                                <p className="text-sm font-bold text-slate-700">{getMaritalStatusLabel(clientInfo.maritalStatus)}</p>
                            </div>
                        </div>
                        {clientInfo.job && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100"><Briefcase className="w-4 h-4 text-slate-400" /></div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pekerjaan</p>
                                    <p className="text-sm font-bold text-slate-700">{clientInfo.job}</p>
                                </div>
                            </div>
                        )}
                        {clientInfo.city && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100"><MapPin className="w-4 h-4 text-slate-400" /></div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kota</p>
                                    <p className="text-sm font-bold text-slate-700">{clientInfo.city}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* THE RATIOS GRID */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                            <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                            Detail 8 Indikator Rasio
                        </div>
                        <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Sehat: {healthyCount}</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500" /> Merah: {8 - healthyCount}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {safeRatios.map((ratio: any, index: number) => {
                            const isExpanded = expandedCard === ratio.id;

                            let statusBadgeColor = "bg-slate-100 text-slate-600";
                            let statusIcon = <Info className="w-3 h-3" />;
                            let glowEffect = "";

                            if (ratio.statusColor === "GREEN_DARK" || ratio.statusColor === "GREEN_LIGHT") {
                                statusBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                                statusIcon = <CheckCircle2 className="w-3 h-3" />;
                                glowEffect = "hover:shadow-emerald-500/10 hover:border-emerald-200";
                            } else if (ratio.statusColor === "YELLOW") {
                                statusBadgeColor = "bg-amber-50 text-amber-700 border-amber-200";
                                statusIcon = <AlertTriangle className="w-3 h-3" />;
                                glowEffect = "hover:shadow-amber-500/10 hover:border-amber-200";
                            } else if (ratio.statusColor === "RED") {
                                statusBadgeColor = "bg-rose-50 text-rose-700 border-rose-200";
                                statusIcon = <XCircle className="w-3 h-3" />;
                                glowEffect = "hover:shadow-rose-500/10 hover:border-rose-200";
                            }

                            return (
                                <Card
                                    key={index}
                                    onClick={() => setExpandedCard(isExpanded ? null : ratio.id)}
                                    className={cn(
                                        "cursor-pointer border-slate-200 shadow-xs transition-all duration-300 group overflow-hidden bg-white",
                                        glowEffect,
                                        isExpanded ? "ring-2 ring-indigo-500 border-transparent shadow-md" : ""
                                    )}
                                >
                                    <div className="p-5 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                                                <Activity className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <Badge variant="outline" className={cn("text-[10px] uppercase font-black tracking-wider px-2 py-0.5 gap-1", statusBadgeColor)}>
                                                {statusIcon} {ratio.statusLabel}
                                            </Badge>
                                        </div>

                                        <div className="grow">
                                            <h4 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">{ratio.label}</h4>
                                            <div className="mt-3 flex items-baseline gap-1">
                                                <span className="text-2xl font-black tracking-tight text-slate-900">
                                                    {ratio.ratioValue.toFixed(2)}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400">
                                                    {ratio.type === "PERCENTAGE" ? "%" : "x"}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                                                <Target className="w-3 h-3" /> Ideal: {ratio.idealCondition}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-indigo-600 group-hover:text-indigo-700">
                                            <span>Analisa Detail</span>
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="bg-slate-50 p-5 border-t border-slate-100 animate-in slide-in-from-top-2">
                                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                                {ratio.analysis}
                                            </p>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* --- FOOTER ACTION BAR (Solid Grounded) --- */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">

                    {/* Quick Insight */}
                    <div className="flex items-start md:items-center gap-3 text-slate-500 max-w-md">
                        <div className="p-2 bg-indigo-50 rounded-xl shrink-0 border border-indigo-100">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                        </div>
                        <p className="text-xs leading-relaxed font-medium">
                            Klien memiliki <strong className="text-emerald-600">{healthyCount}</strong> rasio sehat.
                            Fokus perbaikan utama adalah pada <strong className="text-rose-500">{priorityFix}</strong>.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                        {onReset && !isReadOnly && (
                            <Button
                                variant="outline"
                                onClick={onReset}
                                disabled={localPdfLoading || isDownloadingMgc}
                                className="w-full sm:w-auto h-12 rounded-xl border-slate-300 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all px-6"
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" /> Mulai Baru
                            </Button>
                        )}

                        {onEditData && !isReadOnly && (
                            <Button
                                variant="secondary"
                                onClick={onEditData}
                                disabled={localPdfLoading || isDownloadingMgc}
                                className="w-full sm:w-auto h-12 rounded-xl bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 font-bold active:scale-95 transition-all px-6"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Revisi Angka
                            </Button>
                        )}

                        {isAgentMode && (
                            <Button
                                variant="outline"
                                onClick={handleAgentDownloadMgc}
                                disabled={localPdfLoading || isDownloadingMgc || !mgcToken}
                                className="w-full sm:w-auto h-12 rounded-xl border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:scale-95 transition-all px-6 font-bold"
                            >
                                {isDownloadingMgc ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <FileJson className="w-4 h-4 mr-2" />}
                                Cadangkan .MGC
                            </Button>
                        )}

                        <Button
                            onClick={handleDownloadPdf}
                            disabled={localPdfLoading || isDownloading}
                            className="w-full sm:w-auto h-12 rounded-xl font-black shadow-lg shadow-indigo-600/30 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white px-8"
                        >
                            {(localPdfLoading || isDownloading) ? (
                                <><RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> Memproses...</>
                            ) : (
                                <><Share2 className="w-5 h-5 mr-2" /> Simpan / Bagikan PDF</>
                            )}
                        </Button>
                    </div>
                </div>

            </div>
            {/* [CLEANUP] Komponen PostDownloadAction dihapus dari DOM (Karena Universal Export Engine). */}
        </>
    );
}