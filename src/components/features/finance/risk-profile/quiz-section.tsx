"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, Info, Sparkles, Loader2 } from "lucide-react";
// FIX 1: Import Variants dari framer-motion
import { motion, AnimatePresence, Variants } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { RiskProfileAnswerItem } from "@/lib/types/risk-profile";
import { RISK_PROFILE_QUESTIONS } from "@/lib/data/risk-profile-questions";
import { cn } from "@/lib/utils";

interface QuizSectionProps {
    initialAnswers?: RiskProfileAnswerItem[];
    onFinish: (answers: RiskProfileAnswerItem[]) => void;
    isLoading?: boolean;
}

export function QuizSection({ initialAnswers, onFinish, isLoading = false }: QuizSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    // State untuk arah geser animasi (1 = maju, -1 = mundur)
    const [direction, setDirection] = useState(1);
    const [answersMap, setAnswersMap] = useState<Record<number, number>>({});

    useEffect(() => {
        if (initialAnswers && initialAnswers.length > 0) {
            const map: Record<number, number> = {};
            initialAnswers.forEach((ans) => {
                const qIndex = RISK_PROFILE_QUESTIONS.findIndex(q => q.id === ans.questionId);
                if (qIndex !== -1) {
                    map[qIndex] = ans.value;
                }
            });
            setAnswersMap(map);
        }
    }, [initialAnswers]);

    const currentQuestion = RISK_PROFILE_QUESTIONS[currentIndex];
    const totalQuestions = RISK_PROFILE_QUESTIONS.length;
    const progress = ((currentIndex + 1) / totalQuestions) * 100;

    const handleSelectOption = (valString: string) => {
        const val = parseInt(valString);
        setAnswersMap((prev) => ({
            ...prev,
            [currentIndex]: val,
        }));
    };

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setDirection(1);
            setCurrentIndex((prev) => prev + 1);
            // Auto scroll ke atas dengan mulus saat ganti soal di HP
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            handleFinish();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex((prev) => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleFinish = () => {
        const finalAnswers: RiskProfileAnswerItem[] = RISK_PROFILE_QUESTIONS.map((q, index) => ({
            questionId: q.id,
            value: answersMap[index] || 0
        }));
        onFinish(finalAnswers);
    };

    const isCurrentAnswered = answersMap[currentIndex] !== undefined;

    // FIX 2: Menerapkan tipe Variants dan menghilangkan deklarasi type: "spring" berbentuk string
    const cardVariants: Variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            transition: { stiffness: 300, damping: 25 } // Menghapus type: "spring"
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.2 }
        })
    };

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col min-h-screen md:min-h-auto animate-in fade-in duration-700">

            <div className="flex-1 pb-32 md:pb-8 space-y-6 md:space-y-8 px-4 md:px-0">

                {/* =========================================
                    1. PROGRESS HEADER (Sticky PWA Vibe)
                    ========================================= */}
                <div className="sticky top-14 md:top-0 z-30 pt-4 pb-2 bg-surface-ground/90 backdrop-blur-xl -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                Profiling Discovery
                            </p>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Kuesioner Risiko</h2>
                        </div>
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 self-start md:self-auto">
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pertanyaan</p>
                                <p className="text-sm font-black text-slate-700 leading-none mt-0.5">{currentIndex + 1} <span className="text-slate-400 text-xs">/ {totalQuestions}</span></p>
                            </div>
                            <div className="w-px h-6 bg-slate-200" />
                            <span className="text-base font-black text-indigo-600 w-10 text-right">{Math.round(progress)}%</span>
                        </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 md:h-2.5 overflow-hidden shadow-inner">
                        <motion.div
                            className="h-full bg-linear-to-r from-indigo-500 to-cyan-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "circOut", duration: 0.5 }}
                        />
                    </div>
                </div>

                {/* =========================================
                    2. QUESTION CARD (Kinetic Swiping)
                    ========================================= */}
                <div className="relative min-h-[50vh]">
                    <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={cardVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="w-full bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative"
                        >
                            {/* Decorative Background Icon */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex items-start gap-4 mb-8 md:mb-10">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-3xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-indigo-600/30">
                                        {currentIndex + 1}
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-snug md:leading-normal pt-1">
                                        {currentQuestion.text}
                                    </h3>
                                </div>

                                <RadioGroup
                                    value={answersMap[currentIndex]?.toString() || ""}
                                    onValueChange={handleSelectOption}
                                    className="grid grid-cols-1 gap-3 md:gap-4"
                                >
                                    {currentQuestion.options.map((option, idx) => {
                                        const isSelected = answersMap[currentIndex] === option.value;
                                        const letter = String.fromCharCode(65 + idx);

                                        return (
                                            <div key={option.value} className="relative group">
                                                <RadioGroupItem
                                                    value={option.value.toString()}
                                                    id={`opt-${currentIndex}-${option.value}`}
                                                    className="peer sr-only"
                                                />
                                                <Label
                                                    htmlFor={`opt-${currentIndex}-${option.value}`}
                                                    className={cn(
                                                        "flex items-center p-4 md:p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-300 relative overflow-hidden active:scale-[0.98]",
                                                        isSelected
                                                            ? "border-indigo-500 bg-indigo-50/50 shadow-md"
                                                            : "border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50"
                                                    )}
                                                >
                                                    {/* Pendaran saat dipilih */}
                                                    {isSelected && (
                                                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent w-full h-full -skew-x-12 animate-[shimmer_2s_infinite]" />
                                                    )}

                                                    <div className={cn(
                                                        "w-8 h-8 md:w-10 md:h-10 rounded-xl border-2 flex items-center justify-center mr-4 md:mr-5 shrink-0 transition-all duration-500 relative z-10",
                                                        isSelected
                                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30 rotate-12 scale-110"
                                                            : "bg-slate-50 border-slate-200 text-slate-400 group-hover:border-indigo-300"
                                                    )}>
                                                        <span className="text-xs md:text-sm font-black">{letter}</span>
                                                    </div>

                                                    <span className={cn(
                                                        "text-sm md:text-base leading-relaxed relative z-10 transition-colors duration-300",
                                                        isSelected ? "font-bold text-indigo-900" : "font-medium text-slate-600"
                                                    )}>
                                                        {option.label}
                                                    </span>

                                                    {isSelected && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ stiffness: 400, damping: 20 }}
                                                            className="ml-auto bg-indigo-100 rounded-full p-1 relative z-10"
                                                        >
                                                            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                                                        </motion.div>
                                                    )}
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </RadioGroup>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Info Advisory Box */}
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-white/60 py-3 rounded-2xl border border-slate-200/60 shadow-sm mt-4 md:flex">
                    <Info className="w-3 h-3 text-indigo-500" />
                    Algoritma Analisis Keuangan Profesional
                </div>

            </div>

            {/* =========================================
                3. ACTION NAVIGATION (PWA FLOATING FOOTER)
                ========================================= */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 p-4 md:p-6 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 md:gap-4">

                    <Button
                        variant="outline"
                        onClick={handlePrev}
                        disabled={currentIndex === 0 || isLoading}
                        className="h-12 md:h-14 px-4 md:px-6 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 active:scale-95 transition-all bg-white w-auto"
                    >
                        <ChevronLeft className="w-5 h-5 md:mr-1" />
                        <span className="hidden md:inline">Sebelumnya</span>
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={!isCurrentAnswered || isLoading}
                        className={cn(
                            "flex-1 md:flex-none md:min-w-50 h-12 md:h-14 rounded-2xl font-black text-sm md:text-base transition-all active:scale-95 shadow-xl text-white",
                            currentIndex === totalQuestions - 1
                                ? "bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/30"
                                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                        )}
                    >
                        {currentIndex === totalQuestions - 1 ? (
                            isLoading ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menganalisa...</>
                            ) : (
                                <><Sparkles className="w-5 h-5 mr-2" /> Kalkulasi Hasil</>
                            )
                        ) : (
                            <>Selanjutnya <ChevronRight className="w-5 h-5 ml-1" /></>
                        )}
                    </Button>

                </div>
            </div>

        </div>
    );
}