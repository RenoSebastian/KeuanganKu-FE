"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Download,
    RefreshCcw,
    TrendingUp,
    Wallet,
    CheckCircle2,
    ArrowRight,
    ShieldCheck
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { EducationSimulationResult } from "@/lib/types/education";
import { financialService } from "@/services/financial.service";
import { toast } from "sonner";

interface SimulationResultStepProps {
    result: EducationSimulationResult | null;
    onReset: () => void;
}

export const SimulationResultStep: React.FC<SimulationResultStepProps> = ({
    result,
    onReset
}) => {
    if (!result || !result.data) {
        return (
            <div className="text-center py-10">
                <p className="text-muted-foreground">Gagal memuat hasil kalkulasi. Silakan coba lagi.</p>
                <Button onClick={onReset} variant="outline" className="mt-4">
                    Kembali ke Awal
                </Button>
            </div>
        );
    }

    const { totalMonthlyInvestment, totalFutureCost, details } = result.data;

    const handleDownloadPdf = () => {
        if (result.pdfBuffer) {
            financialService.downloadSimulationFiles({
                pdfBuffer: { data: result.pdfBuffer }, // Sesuai format helper service
                mgcToken: result.mgcToken,
                filename: result.filename
            });
            toast.success("Laporan berhasil diunduh");
        } else {
            toast.error("File PDF tidak tersedia");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Success */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">Kalkulasi Selesai!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Berikut adalah ringkasan kebutuhan dana pendidikan yang harus dipersiapkan klien Anda.
                </p>
            </div>

            {/* Main Results Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1: Total Future Cost (The Reality Check) */}
                <Card className="border-primary/20 bg-primary/5 shadow-none">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Total Biaya Masa Depan
                        </CardDescription>
                        <CardTitle className="text-2xl md:text-3xl font-bold text-primary">
                            {formatCurrency(totalFutureCost)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            Estimasi total biaya kuliah & sekolah seluruh anak dengan asumsi inflasi.
                        </p>
                    </CardContent>
                </Card>

                {/* Card 2: Monthly Saving (The Solution) */}
                <Card className="border-emerald-200 bg-emerald-50 shadow-none dark:bg-emerald-950/20 dark:border-emerald-900/30">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                            <Wallet className="w-4 h-4" /> Investasi Rutin / Bulan
                        </CardDescription>
                        <CardTitle className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-500">
                            {formatCurrency(totalMonthlyInvestment)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70">
                            Rekomendasi dana yang disisihkan mulai bulan depan.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Breakdown per Child Preview */}
            <Card>
                <CardHeader className="pb-0">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Rincian per Anak
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="space-y-4">
                        {details.map((child, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                <div>
                                    <p className="font-semibold">{child.childName}</p>
                                    <p className="text-xs text-muted-foreground">{child.detail.stagesBreakdown.length} Jenjang Sekolah</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-medium text-sm">{formatCurrency(child.summary.totalMonthlySaving)}/bln</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Investasi Bulanan</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                    onClick={handleDownloadPdf}
                    className="flex-1 h-12 text-base shadow-lg"
                    size="lg"
                >
                    <Download className="w-5 h-5 mr-2" /> Download Laporan (PDF & MGC)
                </Button>
                <Button
                    variant="outline"
                    onClick={onReset}
                    className="h-12"
                    size="lg"
                >
                    <RefreshCcw className="w-4 h-4 mr-2" /> Simulasi Baru
                </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground italic">
                <FileText className="w-3 h-3" />
                Laporan ini bersifat estimasi berdasarkan asumsi ekonomi yang dipilih.
            </div>
        </div>
    );
};