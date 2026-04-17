"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { Share2, RefreshCw, AlertCircle, ShieldCheck, RotateCcw, FileText, CheckCircle2, Target, Zap, FileJson } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { RiskProfileSimulationResult, RiskProfileCategory, RiskProfileAnswerItem } from "@/lib/types/risk-profile";
import { RISK_PROFILE_QUESTIONS } from "@/lib/data/risk-profile-questions";
import { PdfLoadingModal } from "@/components/features/calculator/finance/pdf-loading-modal";
import { cn } from "@/lib/utils";

interface AnalysisResultProps {
    data: RiskProfileSimulationResult | null;
    userAnswers?: RiskProfileAnswerItem[];
    onDownloadPdf: () => Promise<void> | void;
    onDownloadMgc: () => Promise<void> | void; // Diterima dari parent (Wizard)
    hasMgcToken?: boolean;
    onRetake: () => void;
    onReset: () => void;
    isDownloading?: boolean;
    showPreviewModal?: boolean;
    onModalClose?: () => void;
    pdfUrl?: string | null;
    mgcToken?: string | null;
    onPdfDownload?: (filename: string) => Promise<void>;
    onMgcShare?: (filename: string, token: string) => Promise<void>;
}

// --- RECHARTS CUSTOM SHAPE (Modern Donut Shape) ---
const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);

    const sx = cx + (outerRadius + 8) * cos;
    const sy = cy + (outerRadius + 8) * sin;
    const mx = cx + (outerRadius + 24) * cos;
    const my = cy + (outerRadius + 24) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 16;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius - 4}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke="#ffffff"
                strokeWidth={3}
                className="drop-shadow-md transition-all duration-300"
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} className="opacity-50" />
            <circle cx={ex} cy={ey} r={3} fill={fill} stroke="none" />
            <text
                x={ex + (cos >= 0 ? 1 : -1) * 8}
                y={ey}
                textAnchor={textAnchor}
                fill="#1e293b"
                style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', fontFamily: 'inherit' }}
            >
                {payload.name}
            </text>
            <text
                x={ex + (cos >= 0 ? 1 : -1) * 8}
                y={ey}
                dy={16}
                textAnchor={textAnchor}
                fill={fill}
                style={{ fontSize: '14px', fontWeight: '900', fontFamily: 'inherit' }}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        </g>
    );
};

export function AnalysisResult({
    data,
    userAnswers,
    onDownloadPdf,
    onDownloadMgc,
    hasMgcToken,
    onRetake,
    onReset,
    isDownloading = false,
    showPreviewModal = false,
    onModalClose,
    pdfUrl,
    mgcToken,
    onPdfDownload,
    onMgcShare
}: AnalysisResultProps) {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [showPdfModal, setShowPdfModal] = useState(false);

    const { result, meta, financial } = data;

    if (!result) {
        return (
            <div className="w-full py-12 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-white rounded-[2rem] border border-slate-100 shadow-xl animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-rose-50 p-6 rounded-[2rem]">
                    <AlertCircle className="w-10 h-10 text-rose-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900">Data Analisis Tidak Valid</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                        Terjadi kesalahan saat memproses data simulasi. Silakan ulangi pengisian kuesioner.
                    </p>
                </div>
                <Button onClick={onReset} variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold h-12 px-6">
                    <RotateCcw className="w-4 h-4 mr-2" /> Mulai Sesi Baru
                </Button>
            </div>
        );
    }

    const { allocation, profile, description, totalScore } = result;

    const reviewData = useMemo(() => {
        const answersSource = userAnswers || financial?.answers || [];
        return (answersSource as RiskProfileAnswerItem[]).map((ans: RiskProfileAnswerItem) => {
            const questionRef = RISK_PROFILE_QUESTIONS.find((q) => q.id === ans.questionId);
            const optionRef = questionRef?.options.find((opt) => opt.value === ans.value);
            return {
                id: ans.questionId,
                question: questionRef?.text || "Pertanyaan tidak ditemukan.",
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
        { name: "Cash Fund", fullName: "Pasar Uang", value: allocation.lowRisk, color: "#10b981" },
        { name: "Fix Income", fullName: "Obligasi", value: allocation.mediumRisk, color: "#f59e0b" },
        { name: "Equity Fund", fullName: "Saham", value: allocation.highRisk, color: "#f43f5e" },
    ].filter(item => item.value > 0);

    // --- THEME ENGINE ---
    const getThemeConfig = (profileType: RiskProfileCategory) => {
        switch (profileType) {
            case RiskProfileCategory.KONSERVATIF:
                return {
                    bg: "bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700",
                    glow: "bg-emerald-400/30",
                    badge: "bg-emerald-900/40 text-emerald-100 border-emerald-400/30",
                    icon: ShieldCheck,
                    textColor: "text-emerald-50"
                };
            case RiskProfileCategory.AGRESIF:
                return {
                    bg: "bg-gradient-to-br from-rose-500 via-red-500 to-rose-800",
                    glow: "bg-rose-400/30",
                    badge: "bg-rose-900/40 text-rose-100 border-rose-400/30",
                    icon: Zap,
                    textColor: "text-rose-50"
                };
            default: // MODERAT
                return {
                    bg: "bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700",
                    glow: "bg-amber-400/30",
                    badge: "bg-amber-900/40 text-amber-100 border-amber-400/30",
                    icon: Target,
                    textColor: "text-amber-50"
                };
        }
    };

    const theme = getThemeConfig(profile);
    const ProfileIcon = theme.icon;

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-5xl mx-auto space-y-6 md:space-y-8 pb-10"
        >
            <PdfLoadingModal isOpen={showPdfModal || isDownloading} />

            {/* =========================================
                1. EXECUTIVE SUMMARY HERO
                ========================================= */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-12 gap-6 items-stretch">

                {/* Hero Card (Kiri/Atas) */}
                <Card className={cn(
                    "md:col-span-7 border-0 shadow-2xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden relative flex flex-col",
                    theme.bg
                )}>
                    <div className="absolute inset-0 mix-blend-overlay opacity-20 pointer-events-none" style={{ backgroundImage: 'url("/images/noise.png")' }} />
                    <div className={cn("absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3", theme.glow)} />

                    <CardContent className="p-8 md:p-10 relative z-10 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-8">
                            <div className={cn("px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border backdrop-blur-md shadow-sm", theme.badge)}>
                                Profil Investor
                            </div>
                            <div className="bg-black/20 p-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
                                <ProfileIcon className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        <div className="mb-8">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-2 drop-shadow-sm">
                                {profile}
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className={cn("font-medium", theme.textColor)}>Skor Toleransi Risiko:</span>
                                <span className="bg-white text-slate-900 font-black text-lg px-3 py-1 rounded-lg shadow-sm">
                                    {totalScore} <span className="text-xs text-slate-500 font-bold uppercase">Poin</span>
                                </span>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <div className="bg-black/20 backdrop-blur-md border border-white/10 p-5 md:p-6 rounded-2xl">
                                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-white/70" /> Karakteristik
                                </h3>
                                <p className={cn("text-sm md:text-base leading-relaxed font-medium", theme.textColor)}>
                                    {description}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Donut Chart (Kanan/Bawah) */}
                <Card className="md:col-span-5 border border-slate-100 shadow-xl rounded-[2rem] md:rounded-[2.5rem] bg-white relative overflow-hidden flex flex-col">
                    <CardContent className="p-8 h-full flex flex-col relative z-10">
                        {/* PENTING: Beri z-10 (rendah) agar bisa tertimpa oleh grafik */}
                        <div className="mb-2 text-center mt-2 md:mt-0 relative z-10">
                            <h3 className="font-black text-slate-800 text-lg">Alokasi Aset Ideal</h3>
                            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-widest mt-1">Berdasarkan Profil Anda</p>
                        </div>

                        {/* PENTING: Beri z-20 (tinggi) agar naik ke atas. 'relative' diperlukan agar z-index berfungsi */}
                        <div className="w-full min-h-70 md:min-h-80 relative z-20 font-sans mt-4 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart style={{ overflow: "visible" }}>
                                    <Pie
                                        {...({
                                            activeIndex: activeIndex,
                                            activeShape: renderActiveShape,
                                            data: chartData,
                                            cx: "50%",
                                            cy: "50%",
                                            innerRadius: "37%",
                                            outerRadius: "57%",
                                            dataKey: "value",
                                            stroke: "#ffffff",
                                            strokeWidth: 4,
                                            paddingAngle: 5,
                                            onMouseEnter: onPieEnter
                                        } as any)}
                                    >
                                        {chartData.map((entry, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Custom Mini Legend untuk Desktop/Mobile */}
                        <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-slate-100/60 relative z-10">
                            {chartData.map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50">
                                    <div className="w-3 h-3 rounded-full mb-1 shadow-sm" style={{ backgroundColor: item.color }} />
                                    <span className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase text-center leading-tight">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* =========================================
                2. REVIEW JAWABAN (Accordion PWA-Ready)
                ========================================= */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="review-answers" className="border-none">
                        <AccordionTrigger className="px-6 md:px-10 py-6 hover:no-underline hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-4 text-left w-full">
                                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-100 transition-colors shadow-inner border border-indigo-100/50">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-slate-900 font-black text-lg tracking-tight">Review Rekam Jawaban</h4>
                                    <p className="text-slate-500 text-xs font-medium mt-0.5">Lihat kembali rincian tanggapan klien pada kuesioner.</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-0 pb-0">
                            <div className="border-t border-slate-100 divide-y divide-slate-50">
                                {reviewData.map((item, index) => (
                                    <div key={item.id} className="p-6 md:px-10 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row gap-4 md:items-start group">
                                        <div className="flex-1 space-y-2">
                                            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-widest group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                Pertanyaan {index + 1}
                                            </span>
                                            <p className="text-sm font-bold text-slate-800 leading-relaxed pr-4">
                                                {item.question}
                                            </p>
                                        </div>
                                        <div className="flex-1 md:max-w-sm bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3 mt-2 md:mt-0">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 leading-snug">{item.answer}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="secondary" className="h-5 px-2 text-[10px] font-black bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                                                        Skor: {item.score}
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
            </motion.div>

            {/* =========================================
                3. ACTION FOOTER BAR (Solid & Grounded)
                ========================================= */}
            <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 relative z-50">

                {/* Info Advisory */}
                <div className="flex items-start md:items-center gap-3 text-slate-500 max-w-md">
                    <div className="p-2 bg-indigo-50 rounded-xl shrink-0 border border-indigo-100">
                        <AlertCircle className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-xs leading-relaxed font-medium">
                        Cetak laporan PDF atau cadangkan file .MGC klien ini sebagai referensi. Jika ada perubahan profil, gunakan fitur Edit Jawaban.
                    </p>
                </div>

                {/* Buttons Action Group */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                    <Button
                        variant="outline"
                        onClick={onReset}
                        disabled={isDownloading || showPdfModal}
                        className="w-full sm:w-auto h-12 rounded-xl border-slate-300 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all px-6"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" /> Mulai Baru
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={onRetake}
                        disabled={isDownloading || showPdfModal}
                        className="w-full sm:w-auto h-12 rounded-xl bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 font-bold active:scale-95 transition-all px-6"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Edit Jawaban
                    </Button>

                    {/* [ADDED] Tombol Ekspor MGC */}
                    <Button
                        variant="outline"
                        onClick={onDownloadMgc}
                        disabled={isDownloading || showPdfModal || !hasMgcToken}
                        className="w-full sm:w-auto h-12 rounded-xl font-bold border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:scale-95 transition-all px-6"
                    >
                        <FileJson className="w-5 h-5 mr-2" /> Cadangkan .MGC
                    </Button>

                    <Button
                        onClick={handleDownloadClick}
                        disabled={showPdfModal || isDownloading}
                        className="w-full sm:w-auto h-12 rounded-xl font-black shadow-lg shadow-indigo-600/30 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white px-8"
                    >
                        {(showPdfModal || isDownloading) ? (
                            <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Memproses...</>
                        ) : (
                            <><Share2 className="w-5 h-5 mr-2" /> Simpan / Bagikan PDF</>
                        )}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}