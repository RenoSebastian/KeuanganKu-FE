"use client";

import React, { useState, useMemo } from "react";
import { EducationSimulationResponse } from "@/lib/types/education";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    RefreshCcw,
    Target,
    TrendingUp,
    Loader2,
    Wallet,
    ChevronDown,
    Sparkles,
    ChevronLeft,
    Share2,
    FileJson
} from "lucide-react";
import { formatCurrency, generateSimulationFilename } from "@/lib/formatters";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// [NEW ARCHITECTURE] Import mesin eksekutor Universal
import { executeUniversalExport } from "@/utils/universal-export-engine";

interface SimulationResultStepProps {
    result: EducationSimulationResponse & { pdfBase64?: string };
    onReset: () => void;
    onBack: () => void;
}

// ============================================================================
// HACK NATIVE BLOB (Untuk mengatasi PWA Share Permission Denied)
// ============================================================================
// [CRITICAL FIX]: Kita TIDAK memanggil URL.revokeObjectURL di sini.
// Penghancuran pointer memory Blob diserahkan sepenuhnya ke executeUniversalExport
// agar OS Share Sheet sempat membaca file fisik sebelum pointer dihancurkan.
const stabilizeBlobForShare = async (blob: Blob): Promise<Blob> => {
    try {
        const url = URL.createObjectURL(blob);
        const res = await fetch(url);
        const nativeBlob = await res.blob();
        // HAPUS URL.revokeObjectURL(url) DARI SINI
        return nativeBlob;
    } catch (e) {
        console.warn("Gagal menstabilkan blob, fallback ke memory blob", e);
        return blob;
    }
};

export const SimulationResultStep: React.FC<SimulationResultStepProps> = ({ result, onReset, onBack }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

    // [VALIDATION & AGGREGATION]
    const simulationData = result?.data;
    const children = simulationData?.childrenPlans || [];

    const { grandTotalMonthlySaving, grandTotalFutureCost } = useMemo(() => {
        let saving = 0;
        let cost = 0;

        children.forEach(child => {
            if (Array.isArray(child.stages)) {
                child.stages.forEach(stage => {
                    saving += (stage.calculatedMonthlySaving || 0);
                    cost += (stage.calculatedFutureValue || 0);
                });
            }
        });

        return { grandTotalMonthlySaving: saving, grandTotalFutureCost: cost };
    }, [children]);

    const toggleAccordion = (index: number) => {
        setOpenItems(prev => ({ ...prev, [index]: !prev[index] }));
    };

    // --- REFACTORED UNIVERSAL EXPORT HANDLERS ---

    const handleDownloadMgc = async () => {
        if (!result.mgcToken) {
            toast.error("Token sesi tidak ditemukan. Backup dibatalkan.");
            return;
        }

        try {
            const clientName = simulationData?.clientName || "Klien";
            const filename = generateSimulationFilename("Education Plan", clientName, "mgc");

            // [CRITICAL FIX]: PWA Share Sheet tidak mengizinkan Memory-Backed Blob.
            // Harus distabilkan menjadi Native Blob via Fetch API lokal dengan tipe octet-stream
            const memoryMgcBlob = new Blob([result.mgcToken], { type: 'application/octet-stream' });
            const nativeMgcBlob = await stabilizeBlobForShare(memoryMgcBlob);

            // Langsung lempar ke Universal Engine
            const exportStatus = await executeUniversalExport(nativeMgcBlob, filename);

            if (exportStatus === 'SHARED') toast.success("File Backup (.mgc) siap dibagikan.");
            else if (exportStatus === 'DOWNLOADED') toast.success("File Backup (.mgc) berhasil disimpan.");

        } catch (error) {
            console.error("Gagal menyusun MGC:", error);
            toast.error("Terjadi galat komputasi saat mengekstraksi berkas.");
        }
    };

    const handleDownloadPdf = async () => {
        // Guard mutlak: Karena alur dijamin melewati Step 2 (Hitung), pdfBase64 PASTI ada.
        if (!result.pdfBase64) {
            toast.error("Dokumen PDF belum tersedia", {
                description: "Silakan klik 'Revisi Data' lalu hitung ulang."
            });
            return;
        }

        setIsDownloading(true);
        const toastId = toast.loading("Menyiapkan dokumen laporan PDF...");

        try {
            const clientName = simulationData?.clientName || "Klien";
            const filename = generateSimulationFilename("Education Plan", clientName, "pdf");

            // 1. [DECODE BASE64] Konversi string Base64 dari JSON Backend ke Uint8Array
            const byteCharacters = atob(result.pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            // 2. Buat Raw Blob murni di Client-Side
            const rawPdfBlob = new Blob([byteArray], { type: 'application/pdf' });

            if (rawPdfBlob.size === 0) {
                throw new Error("Proses rendering PDF gagal, ukuran file 0 bytes.");
            }

            // 3. Stabilkan Blob PDF agar OS Share Sheet tidak error
            const nativePdfBlob = await stabilizeBlobForShare(rawPdfBlob);

            // 4. Eksekusi Native Blob PDF via Engine Universal
            const exportStatus = await executeUniversalExport(nativePdfBlob, filename);

            toast.dismiss(toastId);
            if (exportStatus === 'SHARED') toast.success("Dokumen PDF siap dibagikan.");
            else if (exportStatus === 'DOWNLOADED') toast.success("Dokumen PDF berhasil diunduh.");

        } catch (error: any) {
            console.error("Download error:", error);
            toast.dismiss(toastId);
            toast.error("Gagal memproses dokumen PDF.", {
                description: error.message || "Silakan coba lagi atau pastikan perangkat Anda mendukung ekstraksi memori."
            });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            {/* --- HEADER SECTION --- */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest border border-blue-100">
                    <Sparkles className="w-3.5 h-3.5" /> Hasil Analisa Cerdas
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                    Rencana Dana Pendidikan
                </h2>
                <p className="text-slate-500 max-w-lg mx-auto leading-relaxed text-sm">
                    Berikut adalah strategi keuangan yang disesuaikan untuk <span className="font-bold text-slate-900">{children.length} anak</span> Anda dengan metode investasi.
                </p>
            </div>

            {/* --- SUMMARY CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-linear-to-br from-blue-600 to-blue-700 text-white border-none shadow-xl shadow-blue-900/20 relative overflow-hidden group">
                    <div className="absolute right-[-10%] top-[-20%] opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                        <Wallet className="w-40 h-40" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <p className="text-blue-100 text-sm font-medium flex items-center gap-2">
                            <Wallet className="w-4 h-4" /> Investasi Bulanan Rutin
                        </p>
                        <CardTitle className="text-4xl font-extrabold tracking-tight mt-1">
                            {formatCurrency(grandTotalMonthlySaving)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <p className="text-xs text-blue-100/80 bg-blue-800/30 inline-block px-2 py-1 rounded">
                            *Total yang harus disisihkan untuk semua anak
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-blue-100 shadow-lg shadow-slate-200/50">
                    <CardHeader className="pb-2">
                        <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-500" /> Total Dana Masa Depan (FV)
                        </p>
                        <CardTitle className="text-3xl font-bold text-slate-800">
                            {formatCurrency(grandTotalFutureCost)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-green-600 text-xs font-semibold bg-green-50 px-3 py-1.5 rounded-lg w-fit">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Sudah termasuk asumsi inflasi
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- CHILDREN DETAILS ACCORDION --- */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-lg px-1">
                    <div className="w-1 h-6 bg-blue-500 rounded-full" />
                    Rincian Per Anak
                </div>

                {children.length > 0 ? (
                    children.map((child, idx) => {
                        const totalSavingPerChild = child.stages.reduce(
                            (sum, stage) => sum + (stage.calculatedMonthlySaving || 0), 0
                        );
                        const totalCostPerChild = child.stages.reduce(
                            (sum, stage) => sum + (stage.calculatedFutureValue || 0), 0
                        );
                        const isOpen = openItems[idx];

                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "rounded-xl border transition-all duration-300 overflow-hidden bg-white",
                                    isOpen ? "border-blue-200 shadow-md ring-1 ring-blue-50" : "border-slate-200 hover:border-blue-200"
                                )}
                            >
                                <div
                                    onClick={() => toggleAccordion(idx)}
                                    className="p-5 flex items-center justify-between cursor-pointer bg-linear-to-r from-transparent via-transparent to-blue-50/30 hover:bg-slate-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shadow-inner">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-slate-800">{child.childName}</p>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                                <span>Lahir: {child.childDob}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span className="text-blue-600 font-semibold">{child.stages.length} Jenjang</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div className="hidden sm:block">
                                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Nabung Bulanan</p>
                                            <p className="text-blue-700 font-bold text-base">{formatCurrency(totalSavingPerChild)}</p>
                                        </div>
                                        <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} />
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="border-t border-slate-100 animate-in slide-in-from-top-2">
                                        <div className="bg-slate-50/50 p-4">
                                            <div className="overflow-hidden rounded-lg border border-slate-200">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                                                        <tr>
                                                            <th className="px-4 py-3">Jenjang</th>
                                                            <th className="px-4 py-3 text-right">Dana Dibutuhkan</th>
                                                            <th className="px-4 py-3 text-right">Nabung/Bulan</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 bg-white">
                                                        {child.stages.map((stage, sIdx) => (
                                                            <tr key={sIdx} className="hover:bg-blue-50/30 transition-colors">
                                                                <td className="px-4 py-3">
                                                                    <div className="font-semibold text-slate-700">{stage.level}</div>
                                                                    <div className="text-[10px] text-slate-400">
                                                                        Start: Thn {stage.startYear} ({stage.duration} Thn)
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-medium text-slate-600">
                                                                    {formatCurrency(stage.calculatedFutureValue || 0)}
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-bold text-blue-600">
                                                                    {formatCurrency(stage.calculatedMonthlySaving || 0)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr className="bg-blue-50/30 font-bold text-slate-800">
                                                            <td className="px-4 py-3 text-right text-xs uppercase text-blue-600">Total</td>
                                                            <td className="px-4 py-3 text-right">{formatCurrency(totalCostPerChild)}</td>
                                                            <td className="px-4 py-3 text-right text-blue-700">{formatCurrency(totalSavingPerChild)}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-slate-400 italic">Tidak ada data rincian anak.</p>
                    </div>
                )}
            </div>

            {/* --- ACTION BUTTONS --- */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-6 border-t border-slate-200">
                <Button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="flex-2 h-12 gap-2 text-base font-bold shadow-xl shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Menyusun Laporan...
                        </>
                    ) : (
                        <>
                            <Share2 className="w-5 h-5" /> Simpan / Bagikan PDF
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    onClick={handleDownloadMgc}
                    disabled={isDownloading || !result.mgcToken}
                    className="flex-1 h-12 gap-2 text-base font-bold border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all"
                    title="Ekstrak arsip kalkulasi sebagai cadangan (MGC)"
                >
                    <FileJson className="w-5 h-5" /> Cadangkan .MGC
                </Button>

                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={isDownloading}
                    className="flex-1 h-12 gap-2 text-base font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                >
                    <ChevronLeft className="w-4 h-4" /> Revisi Data
                </Button>

                <Button
                    variant="outline"
                    onClick={onReset}
                    disabled={isDownloading}
                    className="flex-1 h-12 gap-2 text-base font-semibold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-900 transition-all"
                >
                    <RefreshCcw className="w-5 h-5" /> Hitung Ulang
                </Button>
            </div>

            <div className="text-center">
                <p className="text-[10px] text-slate-400 leading-relaxed max-w-lg mx-auto">
                    *File <strong>.mgc</strong> yang dicadangkan dapat diunggah kembali (Load Session) untuk melanjutkan revisi tanpa harus memasukkan semua angka dari awal.
                </p>
            </div>
        </div>
    );
};