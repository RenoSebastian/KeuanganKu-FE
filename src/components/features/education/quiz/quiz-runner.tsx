'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation'; // [UPDATED] Import useParams
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react'; // [UPDATED] Loader icon

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { QuizTimer } from './quiz-timer';
import { ResultConfetti } from './result-confetti'; // [NEW]
import { QuizResultModal } from './quiz-result-modal'; // [NEW]

import { UserQuizData, employeeEducationService } from '@/services/employee-education.service';
import { useQuizStorage } from '@/hooks/use-quiz-storage';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { QuizSubmissionResult } from '@/lib/types/education'; // [NEW]

// TODO: Ganti dengan Context User ID yang riil di production
const MOCK_USER_ID = "user-123";

interface QuizRunnerProps {
    quiz: UserQuizData;
}

export function QuizRunner({ quiz }: QuizRunnerProps) {
    // [UPDATED] Ambil slug dari URL params untuk API call
    const params = useParams();
    const slug = params.slug as string;

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<QuizSubmissionResult | null>(null); // [NEW] State Result

    // 1. Hook State & Persistence
    const { answers, saveAnswer, clearStorage, isHydrated } = useQuizStorage(
        quiz.id,
        MOCK_USER_ID,
        quiz.timeLimit
    );

    // 2. Guard: Cegah refresh/close tab
    // Disable guard jika sedang submitting atau result sudah keluar
    const hasAnswers = Object.keys(answers).length > 0;
    useUnsavedChanges(hasAnswers && !isSubmitting && !result);

    const questions = quiz.questions;
    const currentQuestion = questions[currentQuestionIndex];
    const progressPercent = ((Object.keys(answers).length) / questions.length) * 100;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    // Handlers (Sama seperti Fase 3)
    const handleOptionSelect = (optionId: string) => saveAnswer(currentQuestion.id, optionId);
    const handleNext = () => { if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1); };
    const handlePrev = () => { if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1); };

    // --- [NEW] SUBMISSION LOGIC ---
    const handleSubmit = async () => {
        // 1. Completion Check
        const unansweredCount = questions.length - Object.keys(answers).length;

        // Warning jika ada yang kosong (kecuali dipaksa timer habis)
        if (unansweredCount > 0 && !isSubmitting) {
            const confirm = window.confirm(`Peringatan: Masih ada ${unansweredCount} soal yang belum dijawab. Nilai soal kosong akan dianggap 0. Lanjutkan?`);
            if (!confirm) return;
        }

        setIsSubmitting(true);
        try {
            // 2. Mapping Payload
            const payload = {
                answers: Object.entries(answers).map(([qId, oId]) => ({
                    questionId: qId,
                    selectedOptionId: oId
                }))
            };

            // 3. API Call
            const submissionResult = await employeeEducationService.submitQuiz(slug, payload);

            // 4. Success Handling
            clearStorage(); // Hapus draft
            setResult(submissionResult); // Trigger Modal
            // Tidak ada redirect manual, Modal yang akan menangani navigasi selanjutnya

        } catch (error: any) {
            console.error("Submission error:", error);
            toast.error(error.response?.data?.message || "Gagal mengirim jawaban. Periksa koneksi internet Anda.");
            setIsSubmitting(false); // Reset loading agar user bisa coba lagi
        }
    };

    const handleTimeUp = () => {
        // Auto-submit tanpa konfirmasi user
        if (!result && !isSubmitting) {
            toast.warning("Waktu habis! Jawaban Anda sedang dikirim...");
            handleSubmit();
        }
    };

    if (!isHydrated) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">

            {/* Visual Effects & Modals */}
            <ResultConfetti show={!!result?.isPassed} />
            <QuizResultModal
                isOpen={!!result}
                result={result}
                slug={slug}
            />

            {/* --- HEADER: TIMER & PROGRESS --- */}
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

            {/* --- MAIN QUESTION CARD --- */}
            {/* Disable interaksi jika sedang submitting */}
            <div className={isSubmitting ? "opacity-50 pointer-events-none" : ""}>
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
                                className="w-40 bg-green-600 hover:bg-green-700 text-white transition-all"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menilai...
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

            {/* --- QUESTION NAVIGATOR --- */}
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