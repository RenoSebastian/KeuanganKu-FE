"use client";

import { useState, useCallback } from "react";
import { Download, RefreshCw, AlertCircle, FileCheck, ShieldCheck, Presentation } from "lucide-react";
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

const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);

    // Titik awal garis (dekat lingkaran)
    const sx = cx + (outerRadius + 6) * cos;
    const sy = cy + (outerRadius + 6) * sin;

    // Titik tekuk garis (dikurangi jaraknya agar tidak terlalu keluar)
    const mx = cx + (outerRadius + 18) * cos;
    const my = cy + (outerRadius + 18) * sin;

    // Titik ujung garis (posisi horizontal teks)
    const ex = mx + (cos >= 0 ? 1 : -1) * 12;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6} // Pembesaran saat hover dikurangi agar hemat tempat
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke="#ffffff"
                strokeWidth={2}
            />
            {/* Garis penunjuk lebih tipis */}
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1} />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />

            {/* Teks Nama: Ukuran font dikurangi ke 11px atau 12px */}
            <text
                x={ex + (cos >= 0 ? 1 : -1) * 6}
                y={ey}
                textAnchor={textAnchor}
                fill="#1e293b"
                style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}
            >
                {payload.name}
            </text>

            {/* Teks Persentase: Ukuran font dikurangi ke 10px */}
            <text
                x={ex + (cos >= 0 ? 1 : -1) * 6}
                y={ey}
                dy={14}
                textAnchor={textAnchor}
                fill="#64748b"
                style={{ fontSize: '10px', fontWeight: '600' }}
            >
                {`${(percent * 100).toFixed(0)}% Porsi`}
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

    // Pembaruan Warna: Menggunakan warna yang lebih Solid & Vibrant
    const chartData = [
        { name: "Konservatif", value: data.allocation.lowRisk, color: "#10b981" }, // Emerald Green
        { name: "Moderat", value: data.allocation.mediumRisk, color: "#facc15" },    // Bright Yellow (Vibrant)
        { name: "Agresif", value: data.allocation.highRisk, color: "#ef4444" },    // Red
    ].filter(item => item.value > 0);

    const getThemeColor = (profile: string) => {
        if (profile === 'Konservatif') return "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (profile === 'Agresif') return "bg-red-50 text-red-700 border-red-200";
        return "bg-yellow-50 text-yellow-700 border-yellow-200"; // Moderat Theme
    };

    const themeClass = getThemeColor(data.riskProfile);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Result */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    <Presentation className="w-3 h-3" /> Professional Result
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Kesimpulan Profil Risiko Klien</h2>
                <p className="text-slate-500 text-sm italic">
                    Diproses secara logis berdasarkan data kuesioner pada {new Date(data.calculatedAt).toLocaleDateString("id-ID")}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 relative z-0 items-stretch">

                {/* Kolom Kiri: Profil & Strategi */}
                <Card className="border-0 shadow-2xl rounded-[2rem] overflow-hidden order-2 md:order-1 relative z-0 flex flex-col bg-white">
                    <div className={`p-10 text-center border-b ${themeClass}`}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70">Rekomendasi Strategi</p>
                        <h1 className="text-5xl font-black mb-4 tracking-tighter">{data.riskProfile}</h1>
                        <div className="inline-flex items-center px-4 py-1.5 bg-white/80 rounded-xl text-sm font-bold backdrop-blur-sm shadow-sm border border-white">
                            Skor Agresivitas: {data.totalScore} / 30
                        </div>
                    </div>
                    <CardContent className="p-8 flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            Karakteristik & Profil Risiko
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed text-justify mb-8">
                            {data.riskDescription}
                        </p>

                        <div className="mt-auto p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Agent Advisory Point:</p>
                            <p className="text-xs text-slate-500 italic leading-relaxed font-medium">
                                "Tingkat risiko <strong>{data.riskProfile}</strong> ini menunjukkan bahwa klien memerlukan bauran aset yang seimbang untuk menjaga daya beli masa depan tanpa mengabaikan faktor keamanan."
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Kolom Kanan: Chart Alokasi (Ukuran Diperbesar) */}
                <Card className="border-slate-100 shadow-xl rounded-[2rem] flex flex-col order-1 md:order-2 relative z-20 overflow-visible bg-white">
                    <CardContent className="p-8 overflow-visible h-full flex flex-col">
                        <div className="mb-6">
                            <h3 className="font-bold text-slate-900 text-center">Visualisasi Alokasi Aset</h3>
                            <p className="text-[11px] text-slate-400 text-center mt-1 font-medium">
                                Rasio ideal untuk memitigasi risiko sesuai profil klien.
                            </p>
                        </div>

                        <div className="h-80 w-full relative font-sans overflow-visible">
                            <ResponsiveContainer width="100%" height="100%" className="overflow-visible">
                                <PieChart style={{ overflow: "visible" }}>
                                    <Pie
                                        {...({ activeIndex } as any)}
                                        activeShape={renderActiveShape}
                                        onMouseEnter={onPieEnter}
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="0%" // Diubah menjadi Donat agar lebih modern
                                        outerRadius="55%" // Diperbesar secara visual
                                        dataKey="value"
                                        stroke="#ffffff"
                                        strokeWidth={4}
                                        paddingAngle={4}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                        wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Bar */}
            <Card className="bg-slate-900 border-none rounded-[2rem] relative z-0 overflow-hidden text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px]" />
                <CardContent className="p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-600/20 p-3 rounded-2xl">
                            <AlertCircle className="w-6 h-6 text-blue-400 shrink-0" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-base font-bold">Langkah Selanjutnya (Next Step)</p>
                            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                                Gunakan data ini untuk menyusun proposal asuransi yang relevan dengan toleransi risiko klien Anda.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <Button
                            variant="ghost"
                            onClick={onRetake}
                            className="flex-1 md:flex-none text-slate-400 hover:text-white hover:bg-white/10 font-bold px-6 h-12 rounded-xl"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Kalibrasi Ulang
                        </Button>

                        <Button
                            onClick={onDownloadPdf}
                            disabled={isDownloading}
                            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-900/40 px-10 h-12 rounded-xl"
                        >
                            {isDownloading ? "Mencetak..." : "Download Laporan"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}