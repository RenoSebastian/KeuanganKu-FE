"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

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

    // State Lokal: Map index pertanyaan ke jawaban user (0: 'A', 1: 'C', dst)
    const [answersMap, setAnswersMap] = useState<Record<number, string>>({});

    const currentQuestion = QUESTIONS[currentIndex];
    const totalQuestions = QUESTIONS.length;
    const progress = ((currentIndex + 1) / totalQuestions) * 100;

    // Handle Pilih Jawaban
    const handleSelectOption = (value: string) => {
        setAnswersMap((prev) => ({
            ...prev,
            [currentIndex]: value,
        }));
    };

    // Navigasi Next
    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            handleFinish();
        }
    };

    // Navigasi Prev
    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    // Transform Data & Emit
    const handleFinish = () => {
        // Convert Map object ke Array String yang terurut sesuai index 0-9
        const sortedAnswers: string[] = [];
        for (let i = 0; i < totalQuestions; i++) {
            sortedAnswers.push(answersMap[i]);
        }

        // Emit ke parent untuk dikirim ke BE
        onFinish(sortedAnswers);
    };

    const isCurrentAnswered = !!answersMap[currentIndex];

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-6 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Pertanyaan {currentIndex + 1} dari {totalQuestions}</span>
                    <span>{Math.round(progress)}% Selesai</span>
                </div>
                <Progress value={progress} className="h-2 bg-slate-100" indicatorClassName="bg-blue-600" />
            </div>

            <Card className="border-0 shadow-lg md:p-6 p-4 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 pointer-events-none" />

                <div className="relative z-10">
                    <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-6 leading-relaxed">
                        {currentQuestion.text}
                    </h3>

                    <RadioGroup
                        value={answersMap[currentIndex] || ""}
                        onValueChange={handleSelectOption}
                        className="space-y-3"
                    >
                        {currentQuestion.options.map((option) => {
                            const isSelected = answersMap[currentIndex] === option.value;

                            return (
                                <div key={option.value}>
                                    <RadioGroupItem
                                        value={option.value}
                                        id={`opt-${option.value}`}
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor={`opt-${option.value}`}
                                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                      ${isSelected
                                                ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                                : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                                            }
                    `}
                                    >
                                        <div className={`
                      w-6 h-6 rounded-full border flex items-center justify-center mr-4 shrink-0 transition-colors
                      ${isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 text-transparent group-hover:border-blue-400"}
                    `}>
                                            <span className="text-xs font-bold">{option.value}</span>
                                        </div>
                                        <span className={`text-sm md:text-base ${isSelected ? "font-semibold text-blue-800" : "text-slate-600"}`}>
                                            {option.label}
                                        </span>
                                        {isSelected && <CheckCircle2 className="ml-auto w-5 h-5 text-blue-600" />}
                                    </Label>
                                </div>
                            );
                        })}
                    </RadioGroup>

                    {/* Navigation Actions */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={handlePrev}
                            disabled={currentIndex === 0 || isLoading}
                            className="text-slate-500 hover:text-slate-800"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Sebelumnya
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={!isCurrentAnswered || isLoading}
                            className={`px-6 font-bold transition-all ${currentIndex === totalQuestions - 1
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                        >
                            {currentIndex === totalQuestions - 1 ? (
                                isLoading ? "Memproses..." : "Lihat Hasil"
                            ) : (
                                <>Selanjutnya <ChevronRight className="w-4 h-4 ml-1" /></>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}