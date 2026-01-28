"use client";

import { useState } from "react";
import {
    CheckCircle2, AlertTriangle, XCircle,
    Save, RefreshCcw, FileText, ChevronDown, ChevronUp,
    TrendingUp, Activity, Download, CalendarDays, Banknote,
    LayoutDashboard, Lock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FinancialRecord, HealthAnalysisResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { financialService } from "@/services/financial.service";
import { generateCheckupPDF } from "@/lib/pdf-generator"; // Fallback client-side generator (optional)
import { PdfLoadingModal } from "./pdf-loading-modal"; // <--- 1. IMPORT MODAL

// [STEP 1] Prop Expansion & Mode Definition
type ViewMode = "USER_VIEW" | "DIRECTOR_VIEW";

interface CheckupResultProps {
    data: HealthAnalysisResult;
    rawData: FinancialRecord;
    onReset?: () => void; // Optional karena di mode Director tidak ada reset
    mode?: ViewMode;      // Optional, default "USER_VIEW"
}

export function CheckupResult({
    data,
    rawData,
    onReset,
    mode = "USER_VIEW"
}: CheckupResultProps) {

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"MONTHLY" | "ANNUAL">("ANNUAL");

    // State untuk Modal PDF
    const [showPdfModal, setShowPdfModal] = useState(false);

    // Logic: Read Only Flag
    const isReadOnly = mode === "DIRECTOR_VIEW";

    // --- 1. NORMALISASI DATA ---
    // Prioritaskan data.ratios (hasil mapping BE baru), fallback ke ratiosDetails
    const ratios = data.ratios || (data as any).ratiosDetails || [];
    const score = data.score ?? (data as any).healthScore ?? 0;
    const globalStatus = data.globalStatus || (data as any).status || "BAHAYA";
    const netWorth = data.netWorth ?? (data as any).totalNetWorth ?? 0;
    const monthlySurplus = data.surplusDeficit ?? 0;

    // --- 2. LOGIKA TAMPILAN DINAMIS ---
    const displaySurplus = viewMode === "ANNUAL" ? monthlySurplus * 12 : monthlySurplus;
    const periodLabel = viewMode === "ANNUAL" ? "(Per Tahun)" : "(Per Bulan)";

    const handleSave = async () => {
        if (isReadOnly) return; // Guard clause

        setSaving(true);
        try {
            const payload = { ...rawData };
            // Bersihkan data spouse jika single (untuk konsistensi)
            if (payload.userProfile.maritalStatus !== "MARRIED") {
                delete payload.spouseProfile;
            }
            await financialService.createCheckup(payload);
            setSaved(true);
        } catch (error: any) {
            console.error("Gagal menyimpan:", error);
            alert("Gagal menyimpan data.");
        } finally {
            setSaving(false);
        }
    };

    // --- 4. HANDLE DOWNLOAD PDF (UPDATED WITH MODAL) ---
    const handleDownloadPDF = async () => {
        // 1. Guard Clause: Cegah eksekusi jika modal sedang tampil
        if (showPdfModal) return;

        try {
            let idToDownload = (data as any).id || (rawData as any).id;

            // 2. Auto-Save Logic
            // Jika data belum disimpan dan bukan mode read-only (Director), simpan dulu otomatis.
            // Kita lakukan manual call createCheckup disini agar bisa menangkap ID yang baru dibuat.
            if (!saved && !isReadOnly && !idToDownload) {
                setSaving(true);
                try {
                    const payload = { ...rawData };
                    if (payload.userProfile.maritalStatus !== "MARRIED") {
                        delete payload.spouseProfile;
                    }
                    const savedRecord = await financialService.createCheckup(payload);
                    setSaved(true);
                    idToDownload = (savedRecord as any).id; // Tangkap ID baru
                } catch (e) {
                    console.error("Auto-save failed", e);
                    alert("Gagal menyimpan data otomatis sebelum download.");
                    return;
                } finally {
                    setSaving(false);
                }
            }

            // 3. Final ID Check
            if (!idToDownload) {
                alert("Gagal menemukan ID Laporan. Mohon simpan data terlebih dahulu.");
                return;
            }

            // 4. ACTIVATE MODAL
            // Ini akan memunculkan popup "Sedang Menyiapkan Laporan..."
            setShowPdfModal(true);

            // 5. TRIGGER DOWNLOAD (Long Running Process)
            // Axios di service sudah diset timeout 60 detik.
            // Selama proses ini, Modal akan menampilkan animasi progress bar 0-90%
            await financialService.downloadCheckupPdf(idToDownload);

            // 6. FINALIZE
            // Beri jeda sedikit (500ms) agar user sempat melihat status "Selesai 100%"
            // sebelum modal tertutup otomatis.
            setTimeout(() => {
                setShowPdfModal(false);
            }, 500);

        } catch (error) {
            // 7. ERROR HANDLING
            // Jika terjadi timeout atau error server, tutup modal dan beri info.
            setShowPdfModal(false);
            console.error("PDF Download Error:", error);
            alert("Gagal mengunduh PDF. Server mungkin sedang sibuk atau koneksi terputus. Silakan coba lagi.");
        }
    };

    // --- HELPER UI ---
    const getStatusColor = (color: string) => {
        switch (color) {
            case "GREEN_DARK": return "border-emerald-600 bg-emerald-50/60 hover:bg-emerald-100";
            case "GREEN_LIGHT": return "border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50";
            case "YELLOW": return "border-amber-400 bg-amber-50/50 hover:bg-amber-50";
            case "RED": return "border-red-500 bg-red-50/50 hover:bg-red-50";
            default: return "border-slate-200 bg-white";
        }
    };

    const getStatusIcon = (color: string) => {
        switch (color) {
            case "GREEN_DARK": return <CheckCircle2 className="w-5 h-5 text-emerald-700" />;
            case "GREEN_LIGHT": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case "YELLOW": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case "RED": return <XCircle className="w-5 h-5 text-red-600" />;
            default: return <Activity className="w-5 h-5 text-slate-400" />;
        }
    };

    const getStatusBadge = (color: string) => {
        switch (color) {
            case "GREEN_DARK": return <Badge className="bg-emerald-700 hover:bg-emerald-800 text-white border-0">Sangat Sehat</Badge>;
            case "GREEN_LIGHT": return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">Sehat</Badge>;
            case "YELLOW": return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200">Waspada</Badge>;
            case "RED": return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">Bahaya</Badge>;
            default: return null;
        }
    };

    const getGlobalStatusColor = (val: number) => {
        if (val >= 80) return "text-emerald-600";
        if (val >= 50) return "text-amber-500";
        return "text-red-600";
    }

    const getStatusLabel = (val: number) => {
        if (val >= 80) return "SEHAT";
        if (val >= 50) return "WASPADA";
        return "TIDAK SEHAT";
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24 md:pb-0">

            {/* --- MOUNT MODAL DISINI --- */}
            <PdfLoadingModal isOpen={showPdfModal} />

            {/* --- HEADER & TOGGLE --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        {isReadOnly ? <Lock className="w-6 h-6 text-slate-400" /> : <LayoutDashboard className="w-6 h-6 text-brand-600" />}
                        {isReadOnly ? "Laporan Kesehatan Finansial" : "Hasil Diagnosa"}
                    </h2>
                    <p className="text-slate-500 text-sm">
                        {isReadOnly
                            ? "Laporan ini bersifat rahasia dan hanya untuk keperluan audit internal."
                            : "Berikut adalah analisa kesehatan keuangan Anda."}
                    </p>
                </div>

                {/* VIEW MODE TOGGLE */}
                <div className="bg-white border border-slate-200 p-1.5 rounded-xl flex shadow-sm w-fit">
                    <button
                        onClick={() => setViewMode("MONTHLY")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                            viewMode === "MONTHLY" ? "bg-brand-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                        )}
                    >
                        <CalendarDays className="w-4 h-4" /> Bulanan
                    </button>
                    <button
                        onClick={() => setViewMode("ANNUAL")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                            viewMode === "ANNUAL" ? "bg-brand-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                        )}
                    >
                        <Banknote className="w-4 h-4" /> Tahunan
                    </button>
                </div>
            </div>

            {/* --- HERO SECTION: SPLIT CARD --- */}
            <div className={cn(
                "grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-0 rounded-3xl overflow-hidden shadow-2xl border bg-white",
                isReadOnly ? "border-slate-300 shadow-slate-200/50" : "border-slate-200"
            )}>

                {/* LEFT: GAUGE & SCORE (NO NUMBER, JUST STATUS) */}
                <div className="lg:col-span-1 p-8 flex flex-col items-center justify-center bg-white relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-100">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-red-500 via-amber-400 to-emerald-500" />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl z-0" />

                    <div className="relative z-10 w-48 h-48 flex items-center justify-center mb-6">
                        <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
                            <circle
                                cx="50" cy="50" r="42" fill="none"
                                stroke={score >= 80 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626"}
                                strokeWidth="8"
                                strokeDasharray={`${score * 2.64} 264`}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            {/* GANTI SCORE ANGKA DENGAN TEKS STATUS */}
                            <span className={cn("text-2xl font-black tracking-tight uppercase text-center leading-none px-4", getGlobalStatusColor(score))}>
                                {getStatusLabel(score)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Status Kesehatan</span>
                        </div>
                    </div>

                    <div className="text-center relative z-10">
                        <p className="text-sm text-slate-500 leading-relaxed px-4">
                            {score >= 80 ? "Kondisi keuangan prima. Pertahankan performa ini." :
                                score >= 50 ? "Ada beberapa indikator yang perlu perhatian khusus." :
                                    "Kondisi kritis. Perlu restrukturisasi segera."}
                        </p>
                    </div>
                </div>

                {/* RIGHT: NET WORTH & DIAGNOSIS */}
                <div className={cn(
                    "lg:col-span-2 p-8 text-white relative overflow-hidden flex flex-col justify-center",
                    isReadOnly ? "bg-slate-800" : "bg-brand-900" // Warna beda untuk mode Director
                )}>
                    <div className="absolute top-0 right-0 p-40 bg-white/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 p-32 bg-white/5 rounded-full blur-[60px] -ml-16 -mb-16 pointer-events-none" />
                    <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-[0.05]" />

                    {/* STATS GRID */}
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-white/10 pb-6 mt-2">
                        <div>
                            <div className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-wider mb-2">
                                <TrendingUp className="w-4 h-4" />
                                Kekayaan Bersih (Net Worth)
                            </div>
                            <div className="text-3xl font-mono font-bold tracking-tight text-white truncate">
                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(netWorth)}
                            </div>
                            <div className="h-1 w-24 bg-linear-to-r from-emerald-400 to-transparent mt-3 rounded-full opacity-50"></div>
                            <p className="text-[10px] text-white/50 mt-1">Total Aset - Total Utang</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-wider mb-2">
                                <Activity className="w-4 h-4" />
                                Surplus / Defisit {periodLabel}
                            </div>
                            <div className={cn("text-3xl font-mono font-bold tracking-tight truncate",
                                displaySurplus >= 0 ? "text-emerald-400" : "text-red-400"
                            )}>
                                {displaySurplus >= 0 ? "+" : ""}
                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(displaySurplus)}
                            </div>
                            <div className={cn("h-1 w-24 bg-linear-to-r mt-3 rounded-full opacity-50", displaySurplus >= 0 ? "from-emerald-400 to-transparent" : "from-red-400 to-transparent")}></div>
                            <p className="text-[10px] text-white/50 mt-1">Pemasukan - Pengeluaran</p>
                        </div>
                    </div>

                    {/* DIAGNOSA TEXT */}
                    <div className="relative z-10 bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-md">
                        <div className="flex gap-4">
                            <div className="p-3 bg-white/10 rounded-xl h-fit shrink-0 hidden md:block">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                                    <FileText className="w-5 h-5 md:hidden" />
                                    Diagnosa Sistem
                                </h4>
                                <p className="text-white/80 text-sm leading-relaxed">
                                    "Berdasarkan analisa 8 rasio, terdapat <strong className="text-emerald-400">{ratios.filter((r: any) => r.statusColor === "GREEN_DARK" || r.statusColor === "GREEN_LIGHT").length} indikator SEHAT</strong>,
                                    <strong className="text-amber-400"> {ratios.filter((r: any) => r.statusColor === "YELLOW").length} WASPADA</strong>, dan
                                    <strong className="text-red-400"> {ratios.filter((r: any) => r.statusColor === "RED").length} BAHAYA</strong>.
                                    Prioritas perbaikan ada pada sektor <span className="text-white border-b border-dashed border-slate-500 pb-0.5 ml-1">
                                        {ratios.find((r: any) => r.statusColor === "RED" || r.statusColor === "YELLOW")?.label || "Pertumbuhan Aset"}
                                    </span>."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DETAIL RATIOS GRID --- */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-slate-800 rounded-full" />
                        Rincian 8 Indikator Vital
                    </h3>
                    <span className="text-xs text-slate-500 hidden md:inline-block">*Klik kartu untuk melihat detail</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {ratios.map((ratio: any) => (
                        <div
                            key={ratio.id}
                            className={cn(
                                "group relative rounded-2xl p-5 border-l-4 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 bg-white",
                                getStatusColor(ratio.statusColor),
                                expandedCard === ratio.id ? "col-span-1 md:col-span-2 lg:col-span-2 row-span-2 ring-2 ring-brand-500/20 z-10" : ""
                            )}
                            onClick={() => setExpandedCard(expandedCard === ratio.id ? null : ratio.id)}
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    {getStatusBadge(ratio.statusColor)}
                                    {getStatusIcon(ratio.statusColor)}
                                </div>

                                <h4 className="font-bold text-xs uppercase tracking-wide text-slate-500 mb-1">{ratio.label}</h4>
                                <div className="text-2xl font-bold text-slate-800 mb-2 truncate">
                                    {ratio.id === "emergency_fund" ? `${ratio.value}x` :
                                        ratio.id === "liq_networth" || ratio.id === "saving_ratio" || ratio.id === "debt_asset_ratio" || ratio.id === "debt_service_ratio" || ratio.id === "consumptive_ratio" || ratio.id === "invest_asset_ratio" || ratio.id === "solvency_ratio"
                                            ? `${ratio.value}%` : ratio.value}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                                    <span>Target:</span>
                                    <span className="font-mono font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{ratio.benchmark}</span>
                                </div>

                                {/* Expandable Section */}
                                <div className={cn(
                                    "mt-auto pt-4 border-t border-slate-200/60 transition-all duration-500 ease-in-out overflow-hidden",
                                    expandedCard === ratio.id ? "opacity-100 max-h-40" : "opacity-0 max-h-0 lg:opacity-100 lg:max-h-20"
                                )}>
                                    <p className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> Rekomendasi:
                                    </p>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {ratio.recommendation}
                                    </p>
                                </div>

                                {/* Mobile Hint */}
                                <div className="lg:hidden mt-2 flex justify-center text-slate-300 group-hover:text-brand-400 transition-colors">
                                    {expandedCard === ratio.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- ACTION BAR (HIDDEN IN DIRECTOR VIEW) --- */}
            {!isReadOnly && (
                <Card className="p-4 bg-white border-t border-slate-200 fixed bottom-0 left-0 w-full z-50 md:static md:border md:rounded-2xl md:shadow-sm md:z-0">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-3 justify-between">
                        <div className="hidden md:block text-sm text-slate-500">
                            <span className="font-bold text-slate-700">Tips:</span> Simpan hasil diagnosa ini untuk memantau history.
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <Button
                                variant="outline"
                                onClick={onReset}
                                disabled={showPdfModal || saving} // Disable saat loading
                                className="flex-1 md:flex-none border-slate-300 text-slate-600 hover:bg-slate-50"
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" /> Hitung Ulang
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={handleDownloadPDF} // <--- ACTION DENGAN MODAL
                                disabled={showPdfModal || saving} // Disable saat loading
                                className="flex-1 md:flex-none text-slate-500 hover:text-brand-600 hidden md:flex"
                            >
                                <Download className="w-4 h-4 mr-2" /> PDF
                            </Button>

                            <Button
                                onClick={handleSave}
                                disabled={saving || saved || showPdfModal}
                                className={cn(
                                    "flex-2 md:flex-none min-w-45 font-bold shadow-lg transition-all text-white",
                                    saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-brand-600 hover:bg-brand-700"
                                )}
                            >
                                {saving ? " Menyimpan..." : saved ? (
                                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Tersimpan</>
                                ) : (
                                    <><Save className="w-4 h-4 mr-2" /> Simpan Hasil</>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}