/**
 * TYPE: Uploaded File
 * FILE: src/components/features/education/wizard/simulation-result-step.tsx
 */

"use client";

import React, { useState } from "react";
// [FIX] Gunakan EducationSimulationResponse (API format), bukan Result (View Model)
import { EducationSimulationResponse } from "@/lib/types/education";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Download,
    RefreshCcw,
    CheckCircle2,
    Wallet,
    Target,
    TrendingUp,
    Loader2
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import { financialService } from "@/services/financial.service";

interface SimulationResultStepProps {
    // [FIX] Update tipe data props agar support field 'data' & 'simulationId'
    result: EducationSimulationResponse;
    onReset: () => void;
}

export const SimulationResultStep: React.FC<SimulationResultStepProps> = ({ result, onReset }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    // [FIX] Type Inference sekarang akan berjalan otomatis karena 'result' sudah bertipe EducationSimulationResponse
    const simulationData = result?.data;
    const children = simulationData?.childrenPlans || [];

    const handleDownloadPdf = async () => {
        if (!result.simulationId) {
            toast.error("ID Simulasi tidak ditemukan. Mohon hitung ulang.");
            return;
        }

        setIsDownloading(true);
        try {
            await financialService.downloadEducationSimulationPdf(result.simulationId);
            toast.success("PDF berhasil diunduh");
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Gagal mengunduh PDF. Silakan coba lagi.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Success */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Simulasi Berhasil Dihitung</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Berikut adalah estimasi kebutuhan dana pendidikan berdasarkan target yang Anda tentukan.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-primary text-primary-foreground border-none shadow-lg overflow-hidden relative">
                    <div className="absolute right-[-10%] top-[-20%] opacity-10">
                        <Wallet className="w-32 h-32" />
                    </div>
                    <CardHeader className="pb-2">
                        <p className="text-primary-foreground/80 text-sm font-medium">Total Investasi Bulanan</p>
                        <CardTitle className="text-3xl font-bold">
                            {formatCurrency(simulationData?.totalMonthlySaving || 0)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-primary-foreground/70">
                            *Setoran tetap (Flat) akumulasi untuk semua anak.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-2 border-primary/20 shadow-md">
                    <CardHeader className="pb-2">
                        <p className="text-muted-foreground text-sm font-medium">Total Target Dana (Masa Depan)</p>
                        <CardTitle className="text-2xl font-bold text-primary">
                            {formatCurrency(simulationData?.totalFutureCost || 0)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-semibold">Sudah memperhitungkan inflasi pendidikan</span>
                    </CardContent>
                </Card>
            </div>

            {/* Children Details Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Rincian per Anak
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-4">
                        {children.length > 0 ? (
                            // [FIX] Error implicit any akan hilang karena 'children' sudah ter-inferensi dengan benar
                            children.map((child, idx) => {
                                // Hitung total per anak secara manual (Client-Side Aggregation)
                                const totalSavingPerChild = child.stages.reduce(
                                    (sum, stage) => sum + (stage.calculatedMonthlySaving || 0), 0
                                );
                                const totalCostPerChild = child.stages.reduce(
                                    (sum, stage) => sum + (stage.calculatedFutureValue || 0), 0
                                );

                                return (
                                    <div key={idx} className="group p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-all">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{child.childName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Lahir: {child.childDob}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                                                    Tabungan Bulanan
                                                </p>
                                                <p className="text-primary font-bold">
                                                    {formatCurrency(totalSavingPerChild)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-3 border-t border-dashed">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Total Dana Dibutuhkan</p>
                                                <p className="font-semibold text-sm">
                                                    {formatCurrency(totalCostPerChild)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Jumlah Jenjang</p>
                                                <p className="font-semibold text-sm">
                                                    {child.stages.length} Sekolah
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-6 text-muted-foreground italic">
                                Tidak ada rincian data anak.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="flex-1 h-12 gap-2 text-base font-bold shadow-lg shadow-primary/20"
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Mengunduh...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" /> Unduh Laporan PDF
                        </>
                    )}
                </Button>
                <Button
                    variant="outline"
                    onClick={onReset}
                    disabled={isDownloading}
                    className="flex-1 h-12 gap-2 text-base font-semibold"
                >
                    <RefreshCcw className="w-5 h-5" /> Hitung Ulang
                </Button>
            </div>

            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                Hasil perhitungan ini bersifat simulasi dan estimasi. <br />
                Realitas di masa depan dapat berubah sesuai dengan kebijakan institusi pendidikan dan kondisi pasar investasi.
            </p>
        </div>
    );
};