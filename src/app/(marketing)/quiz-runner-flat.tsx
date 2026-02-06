"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { QuizTimer } from "../../components/features/education/quiz/quiz-timer";
import { ResultConfetti } from "../../components/features/education/quiz/result-confetti";
import { QuizResultModal } from "../../components/features/education/quiz/quiz-result-modal";

import { UserQuizData } from "@/services/employee-education.service";
import { useQuizStorage } from "@/hooks/use-quiz-storage";
import { QuizSubmissionResult } from "@/lib/types/education";

interface QuizRunnerProps {
    quiz: UserQuizData;
    mode?: "LEARN" | "PREVIEW";
}

export function QuizRunner({ quiz, mode = "PREVIEW" }: QuizRunnerProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<QuizSubmissionResult | null>(null);

    // Gunakan ID statis karena tidak ada login
    const effectiveStorageUserId = "public-guest";
    const effectiveStorageKey = `quiz-public-${quiz.id}`;

    const { answers, saveAnswer, clearStorage, isHydrated } = useQuizStorage(
        effectiveStorageKey,
        effectiveStorageUserId,
        quiz.timeLimit
    );

    const questions = quiz.questions;
    const currentQuestion = questions[currentQuestionIndex];
    const progressPercent = (Object.keys(answers).length / questions.length) * 100;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    const handleOptionSelect = (optionId: string) => saveAnswer(currentQuestion.id, optionId);
    const handleNext = () => { if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1); };
    const handlePrev = () => { if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1); };

    const handleSubmit = async () => {
        const unansweredCount = questions.length - Object.keys(answers).length;
        if (unansweredCount > 0) {
            const confirm = window.confirm(`Masih ada ${unansweredCount} soal belum dijawab. Lanjutkan?`);
            if (!confirm) return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Menghitung skor...");

        try {
            // SIMULASI PERHITUNGAN SKOR LOKAL (Tanpa Backend)
            let correctCount = 0;
            questions.forEach((q: any) => {
                if (answers[q.id] === q.correctOptionId) {
                    correctCount++;
                }
            });

            const score = Math.round((correctCount / questions.length) * 100);

            // Mock object hasil kuis agar sesuai dengan QuizResultModal
            const mockResult: QuizSubmissionResult = {
                score: score,
                isPassed: score >= 70,
                attemptsUsed: correctCount,
                maxAttempts: questions.length,
                // @ts-ignore (tambahkan field lain jika dibutuhkan oleh modal Anda)
                passingScore: 70
            };

            // Delay sedikit biar terlihat seperti proses beneran
            await new Promise(resolve => setTimeout(resolve, 1500));

            clearStorage();
            setResult(mockResult);
            toast.success("Kuis selesai!", { id: toastId });
        } catch (error) {
            toast.error("Gagal memproses hasil.", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isHydrated) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 relative">
            <ResultConfetti show={!!result?.isPassed} />

            {/* Modal Hasil */}
            {result && (
                <QuizResultModal
                    isOpen={!!result}
                    result={result}
                    slug="public-quiz"
                />
            )}

            {/* Progress & Timer */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 sticky top-4 z-30 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="w-full md:w-1/3 space-y-1">
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Progress</span>
                        <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                </div>
                <QuizTimer durationMinutes={quiz.timeLimit} onTimeUp={handleSubmit} />
            </div>

            {/* Question Card */}
            <Card className="p-6 md:p-10 shadow-md border-0">
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {currentQuestionIndex + 1}
                        </span>
                        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed">
                            {currentQuestion.questionText}
                        </h2>
                    </div>

                    <RadioGroup value={answers[currentQuestion.id] || ""} onValueChange={handleOptionSelect} className="space-y-3">
                        {currentQuestion.options.map((option) => (
                            <div
                                key={option.id}
                                onClick={() => handleOptionSelect(option.id)}
                                className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-all ${answers[currentQuestion.id] === option.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-gray-200"
                                    }`}
                            >
                                <RadioGroupItem value={option.id} id={option.id} />
                                <Label htmlFor={option.id} className="flex-1 cursor-pointer text-base font-normal">
                                    {option.optionText}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <div className="flex justify-between items-center mt-10 pt-6 border-t">
                    <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
                        <ChevronLeft className="w-4 h-4 mr-2" /> Sebelumnya
                    </Button>

                    {isLastQuestion ? (
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Selesai"}
                        </Button>
                    ) : (
                        <Button onClick={handleNext}>
                            Selanjutnya <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </Card>

            {/* Bullets Pagination */}
            <div className="flex flex-wrap gap-2 justify-center pb-10">
                {questions.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-3 h-3 rounded-full ${idx === currentQuestionIndex ? "bg-primary scale-125" : !!answers[questions[idx].id] ? "bg-green-500" : "bg-gray-200"}`}
                    />
                ))}
            </div>
        </div>
    );
}