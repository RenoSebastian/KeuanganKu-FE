"use client";

import { useState } from "react";
import { Download, Share2, RefreshCw, AlertCircle, FileCheck } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RiskProfileResponse } from "@/lib/types/risk-profile";

interface AnalysisResultProps {
    data: RiskProfileResponse;
    onDownloadPdf: () => Promise<void>;
    onRetake: () => void;
    isDownloading?: boolean;
}

export function AnalysisResult({
    data,
    onDownloadPdf,
    onRetake,
    isDownloading = false
}: AnalysisResultProps) {

    // Transform Data untuk Recharts
    const chartData = [
        { name: "Pasar Uang (Low)", value: data.allocation.lowRisk, color: "#22c55e" }, // Green
        { name: "Obligasi (Medium)", value: data.allocation.mediumRisk, color: "#eab308" }, // Yellow/Orange
        { name: "Saham (High)", value: data.allocation.highRisk, color: "#ef4444" }, // Red
    ].filter(item => item.value > 0); // Hanya tampilkan yang > 0%

    // Tentukan warna tema berdasarkan profil
    const getThemeColor = (profile: string) => {
        if (profile === 'Konservatif') return "bg-green-100 text-green-800 border-green-200";
        if (profile === 'Agresif') return "bg-red-100 text-red-800 border-red-200";
        return "bg-yellow-100 text-yellow-800 border-yellow-200"; // Moderat
    };

    const themeClass = getThemeColor(data.riskProfile);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Result */}
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Hasil Analisis Profil Risiko</h2>
                <p className="text-slate-500">Berdasarkan jawaban kuesioner Anda pada {new Date(data.calculatedAt).toLocaleDateString("id-ID")}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

                {/* Kolom Kiri: Score & Profil */}
                <Card className="border-0 shadow-lg overflow-hidden">
                    <div className={`p-6 text-center border-b ${themeClass}`}>
                        <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Tipe Profil Anda</p>
                        <h1 className="text-4xl font-extrabold mb-4">{data.riskProfile}</h1>
                        <div className="inline-flex items-center px-4 py-1 bg-white/50 rounded-full text-sm font-semibold backdrop-blur-sm">
                            Skor Risiko: {data.totalScore} / 30
                        </div>
                    </div>
                    <CardContent className="p-6">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                            <FileCheck className="w-5 h-5 mr-2 text-blue-600" />
                            Karakteristik & Strategi
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed text-justify">
                            {data.riskDescription}
                        </p>
                    </CardContent>
                </Card>

                {/* Kolom Kanan: Chart Alokasi */}
                <Card className="border-slate-200 shadow-md flex flex-col justify-center">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-slate-800 mb-4 text-center">Rekomendasi Alokasi Aset</h3>

                        <div className="h-64 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => `${value}%`}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center Text */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-sm font-medium text-slate-400">Portofolio</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Bar */}
            <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center text-slate-500 text-sm">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span>Hasil ini adalah simulasi dan bukan saran investasi mutlak.</span>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <Button
                            variant="outline"
                            onClick={onRetake}
                            className="flex-1 md:flex-none border-slate-300 text-slate-600 hover:bg-white"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Ulangi Kuis
                        </Button>

                        <Button
                            onClick={onDownloadPdf}
                            disabled={isDownloading}
                            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200"
                        >
                            {isDownloading ? (
                                "Generating PDF..."
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" /> Download Laporan PDF
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}