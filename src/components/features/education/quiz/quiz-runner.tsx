'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { QuizTimer } from './quiz-timer';
import { ResultConfetti } from './result-confetti';
import { QuizResultModal } from './quiz-result-modal';

import { UserQuizData, employeeEducationService } from '@/services/employee-education.service';
import { useQuizStorage } from '@/hooks/use-quiz-storage';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { QuizSubmissionResult } from '@/lib/types/education';
// [NEW] Import Auth Hook
import { useAuthUser } from '@/hooks/use-auth-user';

interface QuizRunnerProps {
    quiz: UserQuizData;
}

export function QuizRunner({ quiz }: QuizRunnerProps) {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;

    // 1. Resolve User Identity
    const { user, isLoaded: isAuthLoaded } = useAuthUser();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<QuizSubmissionResult | null>(null);

    // 2. Conditional Hook Initialization
    const userId = user?.id || "guest-fallback";

    const { answers, saveAnswer, clearStorage, isHydrated } = useQuizStorage(
        quiz.id,
        userId,
        quiz.timeLimit
    );

    // Guard: Cegah refresh/close tab jika belum submit sukses
    const hasAnswers = Object.keys(answers).length > 0;
    useUnsavedChanges(hasAnswers && !isSubmitting && !result);

    const questions = quiz.questions;
    const currentQuestion = questions[currentQuestionIndex];
    const progressPercent = ((Object.keys(answers).length) / questions.length) * 100;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    // --- HANDLERS ---
    const handleOptionSelect = (optionId: string) => saveAnswer(currentQuestion.id, optionId);
    const handleNext = () => { if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1); };
    const handlePrev = () => { if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1); };

    // --- [CRITICAL] ROBUST SUBMIT LOGIC ---
    const handleSubmit = async () => {
        const unansweredCount = questions.length - Object.keys(answers).length;

        if (unansweredCount > 0 && !isSubmitting) {
            const confirm = window.confirm(`Peringatan: Masih ada ${unansweredCount} soal yang belum dijawab. Lanjutkan?`);
            if (!confirm) return;
        }

        setIsSubmitting(true);

        // Toast Loading (Persisting until success/error)
        const toastId = toast.loading('Mengirim jawaban ke server...');

        try {
            const payload = {
                answers: Object.entries(answers).map(([qId, oId]) => ({
                    questionId: qId,
                    selectedOptionId: oId
                }))
            };

            // API Call dengan Timeout yang sudah di-tuning di axios.ts
            const submissionResult = await employeeEducationService.submitQuiz(slug, payload);

            // [SUCCESS PATH]
            // Hanya bersihkan storage jika server me-return 200 OK
            clearStorage();
            setResult(submissionResult);
            toast.success('Jawaban berhasil diterima!', { id: toastId });

        } catch (error: any) {
            // [FAILURE PATH - RESILIENCE LAYER]
            console.error("Submission error:", error);

            // Jangan hapus storage! User masih bisa coba lagi.
            setIsSubmitting(false);

            // Analisis Error untuk pesan yang lebih informatif
            let errorMessage = "Gagal mengirim jawaban.";
            let description = "Terjadi kesalahan sistem.";

            if (error.message.includes('Timeout') || error.message.includes('Network Error')) {
                errorMessage = "Koneksi Bermasalah";
                description = "Jawaban Anda AMAN tersimpan di browser. Periksa internet dan tekan tombol 'Selesai' lagi.";
            } else if (error.response?.data?.message) {
                // Error validasi dari Backend (misal: Time Limit Exceeded)
                errorMessage = "Gagal Validasi";
                description = error.response.data.message;
            }

            toast.error(errorMessage, {
                id: toastId,
                description: description,
                duration: 5000, // Tampil agak lama agar terbaca
                action: {
                    label: "Coba Lagi",
                    onClick: () => handleSubmit() // Retry Action
                }
            });
        }
    };

    const handleTimeUp = () => {
        if (!result && !isSubmitting) {
            toast.warning("Waktu habis! Mencoba mengirim jawaban otomatis...");
            handleSubmit();
        }
    };

    // --- RENDER GUARDS ---
    if (!isHydrated || !isAuthLoaded) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-red-100 p-3 text-red-600">
                    <LogIn className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Sesi Berakhir</h3>
                    <p className="text-muted-foreground">Silakan login kembali untuk melanjutkan kuis.</p>
                </div>
                <Button onClick={() => router.push('/login')}>Ke Halaman Login</Button>
            </div>
        );
    }

    // --- UI ---
    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">

            <ResultConfetti show={!!result?.isPassed} />
            <QuizResultModal
                isOpen={!!result}
                result={result}
                slug={slug}
            />

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 sticky top-4 z-30 bg-gray-50/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="w-full md:w-1/3 space-y-1">
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                        <span>Progress</span>
                        <span>{Math.round(progressPercent)}% Selesai</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                </div>

                <QuizTimer
                    durationMinutes={quiz.timeLimit}
                    onTimeUp={handleTimeUp}
                />
            </div>

            {/* Disable interaksi jika sedang submitting, tapi jangan hide (agar user tidak bingung) */}
            <div className={isSubmitting ? "opacity-70 pointer-events-none grayscale transition-all" : ""}>
                <Card className="p-6 md:p-10 min-h-100 flex flex-col shadow-md border-0">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-start gap-4">
                            <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                {currentQuestionIndex + 1}
                            </span>
                            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed">
                                {currentQuestion.questionText}
                            </h2>
                        </div>

                        <RadioGroup
                            value={answers[currentQuestion.id] || ""}
                            onValueChange={handleOptionSelect}
                            className="space-y-3 pt-4"
                        >
                            {currentQuestion.options.map((option) => (
                                <div
                                    key={option.id}
                                    className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-50 ${answers[currentQuestion.id] === option.id
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "border-gray-200"
                                        }`}
                                    onClick={() => handleOptionSelect(option.id)}
                                >
                                    <RadioGroupItem value={option.id} id={option.id} />
                                    <Label htmlFor={option.id} className="flex-1 cursor-pointer font-normal text-base">
                                        {option.optionText}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <div className="flex justify-between items-center mt-10 pt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={handlePrev}
                            disabled={currentQuestionIndex === 0}
                            className="w-32"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Sebelumnya
                        </Button>

                        {isLastQuestion ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`w-40 transition-all ${isSubmitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"} text-white`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengirim...
                                    </>
                                ) : (
                                    <>Selesai <CheckCircle2 className="w-4 h-4 ml-2" /></>
                                )}
                            </Button>
                        ) : (
                            <Button onClick={handleNext} className="w-32">
                                Selanjutnya <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </Card>
            </div>

            <div className="flex flex-wrap gap-2 justify-center pb-10">
                {questions.map((_, idx) => {
                    const isCurrent = idx === currentQuestionIndex;
                    const isAnswered = !!answers[questions[idx].id];
                    return (
                        <button
                            key={idx}
                            onClick={() => !isSubmitting && setCurrentQuestionIndex(idx)}
                            disabled={isSubmitting}
                            className={`w-3 h-3 rounded-full transition-all ${isCurrent ? "bg-primary scale-125 ring-2 ring-offset-2 ring-primary"
                                : isAnswered ? "bg-green-500"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }`}
                            title={`Soal ${idx + 1}`}
                        />
                    );
                })}
            </div>
        </div>
    );
}