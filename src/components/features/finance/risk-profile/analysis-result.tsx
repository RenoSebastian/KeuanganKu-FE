"use client";

import { useState, useCallback, useMemo } from "react";
import { Download, RefreshCw, AlertCircle, ShieldCheck, Presentation, RotateCcw, FileText, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Legend } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { RiskProfileSimulationResult, RiskProfileCategory, RiskProfileAnswerItem } from "@/lib/types/risk-profile";
import { RISK_PROFILE_QUESTIONS } from "@/lib/data/risk-profile-questions";
import { PdfLoadingModal } from "@/components/features/finance/pdf-loading-modal";

interface AnalysisResultProps {
    // Data hasil decode token dari Wizard
    data: RiskProfileSimulationResult;
    // [NEW] Prop untuk menerima jawaban mentah user (untuk display review)
    userAnswers?: RiskProfileAnswerItem[];
    onDownloadPdf: () => Promise<void> | void;
    onRetake: () => void; // Kembali ke Quiz (Edit jawaban)
    onReset: () => void;  // Hapus data (Mulai baru)
    isDownloading?: boolean;
}

// --- RECHARTS CUSTOM SHAPE ---
const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);

    const sx = cx + (outerRadius + 6) * cos;
    const sy = cy + (outerRadius + 6) * sin;
    const mx = cx + (outerRadius + 18) * cos;
    const my = cy + (outerRadius + 18) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 12;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke="#ffffff"
                strokeWidth={2}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1} />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text
                x={ex + (cos >= 0 ? 1 : -1) * 6}
                y={ey}
                textAnchor={textAnchor}
                fill="#1e293b"
                style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}
            >
                {payload.name}
            </text>
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
    userAnswers,
    onDownloadPdf,
    onRetake,
    onReset,
    isDownloading = false
}: AnalysisResultProps) {
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
    const [showPdfModal, setShowPdfModal] = useState(false);

    // Destructure data dari Token Result
    const { result, meta, financial } = data;

    // [SAFETY CHECK] Guard Clause untuk mencegah crash jika result null/undefined
    if (!result) {
        return (
            <div className="w-full py-12 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-white rounded-[2rem] border border-slate-100 shadow-xl animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-red-50 p-6 rounded-3xl">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900">Data Analisis Tidak Ditemukan</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                        Terjadi kesalahan saat membaca hasil simulasi. Format data mungkin tidak valid atau rusak.
                    </p>
                </div>
                <Button onClick={onReset} variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold h-12 px-6">
                    <RotateCcw className="w-4 h-4 mr-2" /> Mulai Sesi Baru
                </Button>
            </div>
        );
    }

    const { allocation, profile, description, totalScore } = result;

    // [LOGIC MAPPING JAWABAN]
    // Menggabungkan ID jawaban dengan teks pertanyaan asli dari source code
    const reviewData = useMemo(() => {
        // Prioritaskan prop 'userAnswers' (Live State), fallback ke 'data.financial.answers' (Saved Token)
        const answersSource = userAnswers || financial?.answers || [];

        // [FIX] Type Casting Explicit untuk mengatasi error implicit 'any'
        return (answersSource as RiskProfileAnswerItem[]).map((ans: RiskProfileAnswerItem) => {
            const questionRef = RISK_PROFILE_QUESTIONS.find((q) => q.id === ans.questionId);
            const optionRef = questionRef?.options.find((opt) => opt.value === ans.value);

            return {
                id: ans.questionId,
                question: questionRef?.text || "Pertanyaan tidak ditemukan dalam database.",
                answer: optionRef?.label || "Jawaban tidak valid.",
                score: ans.value
            };
        });
    }, [userAnswers, financial]);

    const onPieEnter = useCallback((_: any, index: number) => {
        setActiveIndex(index);
    }, []);

    const handleDownloadClick = async () => {
        setShowPdfModal(true);
        try {
            await onDownloadPdf();
        } finally {
            setTimeout(() => setShowPdfModal(false), 500);
        }
    };

    const chartData = [
        { name: "Cash Fund (Pasar Uang)", value: allocation.lowRisk, color: "#10b981" },
        { name: "Fix Income (Obligasi)", value: allocation.mediumRisk, color: "#facc15" },
        { name: "Equity Fund (Saham)", value: allocation.highRisk, color: "#ef4444" },
    ].filter(item => item.value > 0);

    const getThemeColor = (profileType: RiskProfileCategory) => {
        switch (profileType) {
            case RiskProfileCategory.KONSERVATIF:
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case RiskProfileCategory.AGRESIF:
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-yellow-50 text-yellow-700 border-yellow-200";
        }
    };

    const themeClass = getThemeColor(profile);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <PdfLoadingModal isOpen={showPdfModal || isDownloading} />

            {/* Header Section */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    <Presentation className="w-3 h-3" /> Professional Result
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Kesimpulan Profil Risiko Klien</h2>
                <p className="text-slate-500 text-sm italic">
                    Diproses secara logis berdasarkan data kuesioner pada {new Date(meta.generatedAt).toLocaleDateString("id-ID", {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 relative z-0 items-stretch">

                {/* Kolom Kiri: Profil & Strategi */}
                <Card className="border-0 shadow-2xl rounded-[2rem] overflow-hidden order-2 md:order-1 relative z-0 flex flex-col bg-white">
                    <div className={`p-10 text-center border-b ${themeClass}`}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70">Rekomendasi Strategi</p>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">{profile}</h1>
                        <div className="inline-flex items-center px-4 py-1.5 bg-white/80 rounded-xl text-sm font-bold backdrop-blur-sm shadow-sm border border-white/50">
                            Skor Agresivitas: {totalScore}
                        </div>
                    </div>
                    <CardContent className="p-8 flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            Karakteristik & Profil Risiko
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed text-justify mb-8">
                            {description}
                        </p>

                        <div className="mt-auto p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Agent Advisory Point:</p>
                            <p className="text-xs text-slate-500 italic leading-relaxed font-medium">
                                "Tingkat risiko <strong>{profile}</strong> ini menunjukkan bahwa klien memerlukan bauran aset yang seimbang untuk menjaga daya beli masa depan tanpa mengabaikan faktor keamanan."
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Kolom Kanan: Chart Alokasi */}
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
                                        {...{
                                            activeIndex: activeIndex,
                                            activeShape: renderActiveShape,
                                            data: chartData,
                                            cx: "50%",
                                            cy: "50%",
                                            innerRadius: "60%",
                                            outerRadius: "80%",
                                            dataKey: "value",
                                            stroke: "#ffffff",
                                            strokeWidth: 4,
                                            paddingAngle: 4,
                                            onMouseEnter: onPieEnter
                                        } as any}
                                    >
                                        {/* [FIX] Tambahkan type index number agar tidak implicit any */}
                                        {chartData.map((entry, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                        wrapperStyle={{
                                            paddingTop: '24px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* [NEW SECTION] Review Jawaban Kuesioner (Accordion) */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="review-answers" className="border-none">
                        <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-4 text-left w-full">
                                <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-slate-900 font-bold text-lg">Review Jawaban Kuesioner</h4>
                                    <p className="text-slate-500 text-xs font-medium">Lihat detail respon klien terhadap 10 pertanyaan risiko.</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-0">
                            <div className="border-t border-slate-100 divide-y divide-slate-100">
                                {reviewData.map((item, index) => (
                                    <div key={item.id} className="p-6 md:px-8 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row gap-4 md:items-start">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                    Soal {index + 1}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-900 leading-relaxed">
                                                {item.question}
                                            </p>
                                        </div>
                                        <div className="flex-1 md:max-w-md bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-start gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{item.answer}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="text-[10px] text-slate-400 font-medium">Bobot Nilai:</span>
                                                    <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-black bg-white border-slate-200 text-slate-600">
                                                        {item.score} Poin
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* Action Bar */}
            <Card className="bg-slate-900 border-none rounded-[2rem] relative z-0 overflow-hidden text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
                <CardContent className="p-8 flex flex-col md:flex-row gap-6 items-center justify-between relative z-10">
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

                    <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
                        <Button
                            variant="ghost"
                            onClick={onReset}
                            className="text-slate-400 hover:text-white hover:bg-white/10 font-bold h-12 rounded-xl"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" /> Mulai Baru
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={onRetake}
                            className="bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 font-bold h-12 rounded-xl"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Edit Jawaban
                        </Button>

                        <Button
                            onClick={handleDownloadClick}
                            disabled={showPdfModal || isDownloading}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-900/50 px-8 h-12 rounded-xl transition-all active:scale-95"
                        >
                            {(showPdfModal || isDownloading) ? (
                                <span className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" /> Memproses...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Download className="w-4 h-4" /> Download File
                                </span>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}