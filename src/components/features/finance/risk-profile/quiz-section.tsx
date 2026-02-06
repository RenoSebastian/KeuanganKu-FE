"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, Info, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { RiskAnswerValue, RiskQuestion } from "@/lib/types/risk-profile";

// --- DATA PERTANYAAN (STATIS SESUAI BRD) ---
const QUESTIONS: RiskQuestion[] = [
    {
        id: 1,
        text: "Tujuan utama Anda berinvestasi adalah:",
        options: [
            { value: RiskAnswerValue.A, label: "Menjaga nilai uang agar tidak berkurang" },
            { value: RiskAnswerValue.B, label: "Menjaga nilai + sedikit pertumbuhan" },
            { value: RiskAnswerValue.C, label: "Mengembangkan aset secara maksimal" },
        ],
    },
    {
        id: 2,
        text: "Jangka waktu investasi utama Anda:",
        options: [
            { value: RiskAnswerValue.A, label: "< 3 tahun" },
            { value: RiskAnswerValue.B, label: "3 – 7 tahun" },
            { value: RiskAnswerValue.C, label: "> 7 tahun" },
        ],
    },
    {
        id: 3,
        text: "Jika nilai investasi Anda turun 10–15% dalam 6 bulan, Anda akan:",
        options: [
            { value: RiskAnswerValue.A, label: "Menarik dana agar tidak rugi lebih besar" },
            { value: RiskAnswerValue.B, label: "Menunggu dan mengevaluasi ulang" },
            { value: RiskAnswerValue.C, label: "Menambah investasi karena harga lebih murah" },
        ],
    },
    {
        id: 4,
        text: "Dana darurat Anda saat ini:",
        options: [
            { value: RiskAnswerValue.A, label: "Belum ada / < 3 bulan pengeluaran" },
            { value: RiskAnswerValue.B, label: "3 – 6 bulan pengeluaran" },
            { value: RiskAnswerValue.C, label: "> 6 bulan pengeluaran" },
        ],
    },
    {
        id: 5,
        text: "Fluktuasi nilai investasi membuat saya:",
        options: [
            { value: RiskAnswerValue.A, label: "Sangat tidak nyaman dan stres" },
            { value: RiskAnswerValue.B, label: "Cukup khawatir tapi masih bisa menerima" },
            { value: RiskAnswerValue.C, label: "Tenang dan menganggapnya hal wajar" },
        ],
    },
    {
        id: 6,
        text: "Pernyataan yang paling sesuai dengan Anda:",
        options: [
            { value: RiskAnswerValue.A, label: "Saya lebih takut rugi daripada ingin untung" },
            { value: RiskAnswerValue.B, label: "Takut rugi dan ingin untung itu seimbang" },
            { value: RiskAnswerValue.C, label: "Saya siap rugi jangka pendek demi hasil besar" },
        ],
    },
    {
        id: 7,
        text: "Pengalaman investasi Anda:",
        options: [
            { value: RiskAnswerValue.A, label: "Belum pernah / sangat terbatas" },
            { value: RiskAnswerValue.B, label: "Sudah pernah dan cukup memahami" },
            { value: RiskAnswerValue.C, label: "Aktif dan memahami risiko investasi" },
        ],
    },
    {
        id: 8,
        text: "Jenis investasi yang paling nyaman untuk Anda:",
        options: [
            { value: RiskAnswerValue.A, label: "Deposito / pasar uang" },
            { value: RiskAnswerValue.B, label: "Obligasi / campuran" },
            { value: RiskAnswerValue.C, label: "Saham / reksa dana saham" },
        ],
    },
    {
        id: 9,
        text: "Sumber penghasilan Anda:",
        options: [
            { value: RiskAnswerValue.A, label: "Tidak tetap / sangat fluktuatif" },
            { value: RiskAnswerValue.B, label: "Cukup stabil" },
            { value: RiskAnswerValue.C, label: "Sangat stabil & beragam" },
        ],
    },
    {
        id: 10,
        text: "Persentase dana yang akan diinvestasikan dari total aset:",
        options: [
            { value: RiskAnswerValue.A, label: "< 20%" },
            { value: RiskAnswerValue.B, label: "20% – 50%" },
            { value: RiskAnswerValue.C, label: "> 50%" },
        ],
    },
];

interface QuizSectionProps {
    onFinish: (answers: string[]) => void;
    isLoading?: boolean;
}

export function QuizSection({ onFinish, isLoading = false }: QuizSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answersMap, setAnswersMap] = useState<Record<number, string>>({});

    const currentQuestion = QUESTIONS[currentIndex];
    const totalQuestions = QUESTIONS.length;
    const progress = ((currentIndex + 1) / totalQuestions) * 100;

    const handleSelectOption = (value: string) => {
        setAnswersMap((prev) => ({
            ...prev,
            [currentIndex]: value,
        }));
    };

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            handleFinish();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleFinish = () => {
        const sortedAnswers: string[] = [];
        for (let i = 0; i < totalQuestions; i++) {
            sortedAnswers.push(answersMap[i]);
        }
        onFinish(sortedAnswers);
    };

    const isCurrentAnswered = !!answersMap[currentIndex];

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header: Pro-Agent Context in Blue */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Professional Discovery Tool
                    </p>
                    <h2 className="text-xl font-bold text-slate-900">Profiling Risiko Klien</h2>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Progres</p>
                        <p className="text-xs font-black text-slate-700">{currentIndex + 1} / {totalQuestions}</p>
                    </div>
                    <div className="w-px h-6 bg-slate-200" />
                    <span className="text-sm font-black text-blue-600">{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Progress Bar Blue */}
            <div className="px-2">
                <Progress value={progress} className="h-2 bg-slate-100 rounded-full" indicatorClassName="bg-blue-600 transition-all duration-500" />
            </div>

            <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden bg-white">
                {/* Subtle Decorative Blue Gradient */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shrink-0 shadow-lg">
                            {currentIndex + 1}
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
                            {currentQuestion.text}
                        </h3>
                    </div>

                    <RadioGroup
                        value={answersMap[currentIndex] || ""}
                        onValueChange={handleSelectOption}
                        className="grid grid-cols-1 gap-4"
                    >
                        {currentQuestion.options.map((option) => {
                            const isSelected = answersMap[currentIndex] === option.value;

                            return (
                                <div key={option.value} className="relative">
                                    <RadioGroupItem
                                        value={option.value}
                                        id={`opt-${option.value}`}
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor={`opt-${option.value}`}
                                        className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group
                                            ${isSelected
                                                ? "border-blue-600 bg-blue-50/50 shadow-[0_10px_20px_rgba(37,99,235,0.1)]"
                                                : "border-slate-50 hover:border-blue-200 hover:bg-slate-50"
                                            }
                                        `}
                                    >
                                        <div className={`
                                            w-8 h-8 rounded-lg border-2 flex items-center justify-center mr-5 shrink-0 transition-all duration-300
                                            ${isSelected
                                                ? "bg-blue-600 border-blue-600 text-white rotate-360"
                                                : "bg-white border-slate-200 text-slate-400 group-hover:border-blue-400"
                                            }
                                        `}>
                                            <span className="text-xs font-black">{option.value}</span>
                                        </div>
                                        <span className={`text-sm md:text-lg transition-colors ${isSelected ? "font-bold text-blue-900" : "font-medium text-slate-600"}`}>
                                            {option.label}
                                        </span>
                                        {isSelected && (
                                            <div className="ml-auto bg-blue-600 rounded-full p-1 animate-in zoom-in">
                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </Label>
                                </div>
                            );
                        })}
                    </RadioGroup>

                    {/* Navigation Actions */}
                    <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={handlePrev}
                            disabled={currentIndex === 0 || isLoading}
                            className="text-slate-400 hover:text-blue-600 font-bold px-6"
                        >
                            <ChevronLeft className="w-5 h-5 mr-2" /> Kembali
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={!isCurrentAnswered || isLoading}
                            className={`px-10 h-14 rounded-2xl font-black text-base transition-all active:scale-95 shadow-xl ${currentIndex === totalQuestions - 1
                                ? "bg-slate-900 hover:bg-black text-white shadow-slate-900/20"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                                }`}
                        >
                            {currentIndex === totalQuestions - 1 ? (
                                isLoading ? "Memproses Data..." : "Lihat Analisis"
                            ) : (
                                <>Lanjutkan <ChevronRight className="w-5 h-5 ml-2" /></>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Support Info */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-widest bg-white/50 py-3 rounded-2xl border border-slate-100">
                <Info className="w-3 h-3 text-blue-500" />
                Instrumen Analisis Keuangan Profesional
            </div>
        </div>
    );
}