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
import { Beaker, AlertTriangle } from "lucide-react";

// Types & Schemas
import { QuizFormValues } from "@/lib/schemas/education-schema";
import { UserQuizData, QuizQuestion } from "@/lib/types/education";

// Components
import { QuizRunner } from "@/components/features/education/quiz/quiz-runner";
import { SimulationResult } from "@/components/features/education/simulation-result"; // Komponen hasil khusus preview

interface QuizPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: QuizFormValues; // Data dari Form State (React Hook Form)
}

export function QuizPreviewModal({ open, onOpenChange, formData }: QuizPreviewModalProps) {
    const [simulationResult, setSimulationResult] = useState<{
        score: number;
        passed: boolean;
        correctCount: number;
        totalQuestions: number;
    } | null>(null);

    // 1. TRANSFORM DATA (Admin Schema -> User Schema)
    // Kita perlu memformat data agar bisa dimakan oleh QuizRunner.
    // PENTING: ID mungkin belum ada (karena belum save DB), jadi kita generate ID dummy based on Index.
    const previewData: UserQuizData = useMemo(() => {
        return {
            id: "preview-session", // ID Dummy
            moduleId: "preview-module",
            title: "Preview Mode",
            description: formData.description || "Mode simulasi untuk Admin.",
            timeLimit: formData.timeLimit,
            passingScore: formData.passingScore,
            questions: formData.questions.map((q, idx) => ({
                id: `q-${idx}`, // Mock ID
                questionText: q.questionText,
                type: q.type as QuizQuestion,
                imageUrl: q.imageUrl || null,
                options: q.options.map((o, oIdx) => ({
                    id: `o-${idx}-${oIdx}`, // Mock ID
                    optionText: o.optionText,
                    imageUrl: o.imageUrl || null,
                    // Note: Kita TIDAK mengirim 'isCorrect' ke QuizRunner untuk simulasi yang akurat
                })),
            })),
        };
    }, [formData]);

    // 2. MOCK SUBMIT HANDLER (Client-Side Grading)
    // Fungsi ini menggantikan API Call ke Backend.
    const handleMockSubmit = async (answers: Record<string, string>) => {
        return new Promise<void>((resolve) => {
            // Simulasi delay jaringan sedikit agar UX terasa nyata
            setTimeout(() => {
                let correctCount = 0;
                const totalQuestions = formData.questions.length;

                // Logic Penilaian Lokal
                formData.questions.forEach((question, qIdx) => {
                    const questionId = `q-${qIdx}`;
                    const selectedOptionId = answers[questionId]; // format: "o-{qIdx}-{oIdx}"

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

                // Hitung Skor
                const score = Math.round((correctCount / totalQuestions) * 100);
                const passed = score >= formData.passingScore;

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

    const handleResetSimulation = () => {
        setSimulationResult(null);
        // Kita tidak perlu mereset localStorage di sini karena QuizRunner
        // akan menangani init ulang jika key berubah atau komponen di-unmount.
    };

    // Guardrail: Jangan render jika tidak ada soal
    if (!formData.questions || formData.questions.length === 0) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <AlertTriangle className="h-12 w-12 text-yellow-500" />
                        <DialogTitle>Kuis Belum Siap</DialogTitle>
                        <DialogDescription>
                            Anda belum menambahkan pertanyaan apapun. Silakan tambahkan minimal satu pertanyaan untuk melakukan simulasi.
                        </DialogDescription>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-gray-50/50">

                {/* --- HEADER KHUSUS SIMULASI --- */}
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
                                Mencoba kuis dari sudut pandang User. Data tidak akan disimpan ke database.
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex-1 overflow-y-auto p-6">
                    {simulationResult ? (
                        // Tampilan Hasil Simulasi
                        <SimulationResult
                            result={simulationResult}
                            onRetry={handleResetSimulation}
                            onClose={() => onOpenChange(false)}
                        />
                    ) : (
                        // Quiz Runner dengan Mock Config
                        <div className="max-w-3xl mx-auto">
                            {/* Alert Info */}
                            <Alert className="mb-6 bg-blue-50 border-blue-100 text-blue-800">
                                <AlertTitle className="text-sm font-semibold">Sandbox Environment</AlertTitle>
                                <AlertDescription className="text-xs opacity-90">
                                    Jawaban Anda diproses secara lokal. Timer berjalan real-time sesuai konfigurasi {formData.timeLimit} menit.
                                </AlertDescription>
                            </Alert>

                            <QuizRunner
                                quizData={previewData}
                                onSubmit={handleMockSubmit}
                                // 3. STORAGE ISOLATION
                                // Menggunakan key khusus agar tidak menimpa progress user asli
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