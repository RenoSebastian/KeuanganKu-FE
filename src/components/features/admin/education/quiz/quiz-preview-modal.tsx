"use client";

import { useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Beaker, RotateCcw } from "lucide-react";

// Types & Schemas
import { QuizFormValues } from "@/lib/schemas/education-schema";
import { UserQuizData, QuizType } from "@/lib/types/education";

// Components
import { QuizRunner } from "@/components/features/education/quiz/quiz-runner";

interface QuizPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: QuizFormValues;
}

export function QuizPreviewModal({ open, onOpenChange, formData }: QuizPreviewModalProps) {
    const [simulationResult, setSimulationResult] = useState<{
        score: number;
        passed: boolean;
        correctCount: number;
        totalQuestions: number;
    } | null>(null);

    // 1. TRANSFORM DATA (Admin Schema -> User Schema)
    // Mengubah format data dari React Hook Form menjadi format yang siap dikonsumsi QuizRunner
    const previewData: UserQuizData = useMemo(() => {
        return {
            id: "preview-session", // ID Dummy untuk storage key
            moduleId: "preview-module",
            description: formData.description || "Mode simulasi.",
            timeLimit: Number(formData.timeLimit),
            passingScore: Number(formData.passingScore),
            questions: formData.questions.map((q, idx) => ({
                id: `q-${idx}`,
                questionText: q.questionText,
                // [FIX] Casting tipe Enum dengan aman
                type: q.type as QuizType,
                imageUrl: q.imageUrl || null,
                // [FIX] Menambahkan default points jika undefined (fallback ke 10)
                points: Number(q.points) || 10,

                // [FIXED] Menambahkan property orderIndex yang required
                orderIndex: idx + 1,

                options: q.options.map((o, oIdx) => ({
                    id: `o-${idx}-${oIdx}`,
                    optionText: o.optionText,
                    imageUrl: o.imageUrl || null,
                })),
            })),
        };
    }, [formData]);

    // 2. MOCK SUBMIT HANDLER (Client-Side Grading)
    // Menghitung skor secara lokal tanpa request ke server
    const handleMockSubmit = async (answers: Record<string, string>) => {
        return new Promise<void>((resolve) => {
            // Simulasi delay jaringan agar UX terasa nyata
            setTimeout(() => {
                let correctCount = 0;
                const totalQuestions = formData.questions.length;

                formData.questions.forEach((question, qIdx) => {
                    const questionId = `q-${qIdx}`;
                    const selectedOptionId = answers[questionId];

                    if (selectedOptionId) {
                        // Parse Option Index dari ID dummy
                        const optionIndex = parseInt(selectedOptionId.split('-')[2]);
                        const selectedOptionOriginal = question.options[optionIndex];

                        // Cek kunci jawaban dari Data Form asli
                        if (selectedOptionOriginal && selectedOptionOriginal.isCorrect) {
                            correctCount++;
                        }
                    }
                });

                // Kalkulasi Skor Akhir
                const score = Math.round((correctCount / totalQuestions) * 100);
                const passed = score >= Number(formData.passingScore);

                setSimulationResult({
                    score,
                    passed,
                    correctCount,
                    totalQuestions,
                });

                resolve();
            }, 800);
        });
    };

    const handleReset = () => setSimulationResult(null);

    // Guardrail: Jangan render jika tidak ada pertanyaan
    if (!formData.questions?.length) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-gray-50/50">

                {/* --- HEADER --- */}
                <div className="px-6 py-4 bg-white border-b flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                            <Beaker className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                                Simulation Mode
                                <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50 text-[10px]">
                                    PREVIEW
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Data tidak akan disimpan ke database.
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                {/* --- MAIN CONTENT --- */}
                <div className="flex-1 overflow-y-auto p-6">
                    {simulationResult ? (
                        // [FIX] Inline Result View (Menghindari konflik prop dengan SimulationResult)
                        <div className="max-w-md mx-auto text-center space-y-6 mt-10 animate-in zoom-in-95 duration-300">
                            <div className={`text-6xl font-black ${simulationResult.passed ? 'text-green-600' : 'text-red-500'}`}>
                                {simulationResult.score}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {simulationResult.passed ? 'LULUS' : 'BELUM LULUS'}
                                </h3>
                                <p className="text-muted-foreground">
                                    Anda menjawab benar <strong>{simulationResult.correctCount}</strong> dari {simulationResult.totalQuestions} soal.
                                </p>
                            </div>

                            <div className="flex justify-center gap-4 pt-6">
                                <Button onClick={handleReset} variant="outline" className="gap-2">
                                    <RotateCcw className="h-4 w-4" /> Coba Lagi
                                </Button>
                                <Button onClick={() => onOpenChange(false)}>
                                    Tutup Preview
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto">
                            <Alert className="mb-6 bg-blue-50 border-blue-100 text-blue-800">
                                <AlertTitle className="text-sm font-semibold">Sandbox Environment</AlertTitle>
                                <AlertDescription className="text-xs opacity-90">
                                    Jawaban Anda diproses secara lokal. Timer berjalan real-time.
                                </AlertDescription>
                            </Alert>

                            <QuizRunner
                                // [FIX] Menggunakan prop 'quiz' sesuai definisi QuizRunner
                                quiz={previewData}
                                onSubmit={handleMockSubmit}
                                // Storage Key unik agar tidak menimpa sesi user lain
                                storageKey={`preview-mode-${Date.now()}`}
                                mode="PREVIEW"
                            />
                        </div>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    );
}