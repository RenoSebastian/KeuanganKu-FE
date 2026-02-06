"use client";

import { useState, useCallback } from "react";
import { Download, RefreshCw, AlertCircle, FileCheck } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RiskProfileResponse } from "@/lib/types/risk-profile";

interface AnalysisResultProps {
    data: RiskProfileResponse;
    onDownloadPdf: () => Promise<void>;
    onRetake: () => void;
    isDownloading?: boolean;
}

// --- Fungsi untuk merender bentuk irisan yang aktif (saat di-hover) ---
const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            {/* Irisan Utama yang Membesar */}
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 10} // Membuatnya sedikit lebih besar
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke="#ffffff"
                strokeWidth={2}
            />
            {/* Garis Penunjuk & Teks */}
            {/* Layer ini sekarang akan muncul di atas card karena perbaikan z-index dan overflow */}
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-sm font-bold">{payload.name}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
                {`(Porsi: ${(percent * 100).toFixed(0)}%)`}
            </text>
        </g>
    );
};

export function AnalysisResult({
    data,
    onDownloadPdf,
    onRetake,
    isDownloading = false
}: AnalysisResultProps) {
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

    const onPieEnter = useCallback((_: any, index: number) => {
        setActiveIndex(index);
    }, []);

    // Transform Data untuk Recharts
    const chartData = [
        { name: "Pasar Uang (Low)", value: data.allocation.lowRisk, color: "#22c55e" }, // Green
        { name: "Obligasi (Medium)", value: data.allocation.mediumRisk, color: "#eab308" }, // Yellow/Orange
        { name: "Saham (High)", value: data.allocation.highRisk, color: "#ef4444" }, // Red
    ].filter(item => item.value > 0);

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

            <div className="grid md:grid-cols-2 gap-6 relative z-0"> {/* Ensure grid is base layer */}

                {/* Kolom Kiri: Score & Profil */}
                {/* Diberi z-0 agar pasti di bawah chart */}
                <Card className="border-0 shadow-lg overflow-hidden order-2 md:order-1 relative z-0">
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
                {/* [CRITICAL FIX] relative & z-20 agar layer ini lebih tinggi dari sebelahnya */}
                {/* overflow-visible pada Card dan CardContent agar tidak memotong konten anak */}
                <Card className="border-slate-200 shadow-md flex flex-col justify-center order-1 md:order-2 relative z-20 overflow-visible">
                    <CardContent className="p-6 overflow-visible h-full flex flex-col justify-center">
                        <h3 className="font-bold text-slate-800 mb-4 text-center">Rekomendasi Alokasi Aset</h3>

                        <div className="h-75 w-full relative font-sans overflow-visible">
                            <ResponsiveContainer width="100%" height="100%" className="overflow-visible">
                                {/* [CRITICAL FIX] style={{ overflow: "visible" }} pada PieChart adalah KUNCI 
                    agar elemen SVG yang keluar dari area canvas tidak terpotong */}
                                <PieChart style={{ overflow: "visible" }}>
                                    <Pie
                                        {...({ activeIndex } as any)}
                                        activeShape={renderActiveShape}
                                        onMouseEnter={onPieEnter}
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={0} // FULL PIE
                                        outerRadius="65%"
                                        dataKey="value"
                                        stroke="#ffffff"
                                        strokeWidth={2}
                                        paddingAngle={0}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>

                                    {/* Tooltip standar juga akan diuntungkan oleh fix overflow ini */}
                                    {activeIndex === undefined && (
                                        <Tooltip
                                            formatter={(value: any) => `${value}%`}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', zIndex: 50 }}
                                        />
                                    )}

                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Bar */}
            <Card className="bg-slate-50 border-slate-200 relative z-0">
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