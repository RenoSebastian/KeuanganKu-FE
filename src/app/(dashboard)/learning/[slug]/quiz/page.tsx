'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { QuizRunner } from '@/components/features/education/quiz/quiz-runner';
import { employeeEducationService, UserQuizData } from '@/services/employee-education.service';

interface QuizPageProps {
    params: { slug: string };
}

export default function QuizPage({ params }: QuizPageProps) {
    const router = useRouter();
    const [quizData, setQuizData] = useState<UserQuizData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setIsLoading(true);
                const data = await employeeEducationService.getQuizBySlug(params.slug);

                if (!data || !data.questions || data.questions.length === 0) {
                    toast.error("Kuis belum tersedia untuk materi ini.");
                    router.push(`/learning/${params.slug}/read`);
                    return;
                }

                setQuizData(data);
            } catch (error) {
                console.error("Quiz fetch error:", error);
                toast.error("Gagal memuat kuis. Silakan coba lagi.");
                router.push('/learning');
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuiz();
    }, [params.slug, router]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Memuat soal kuis...</p>
                </div>
            </div>
        );
    }

    if (!quizData) return null;

    return (
        // [CRITICAL] Fixed overlay untuk Distraction Free Mode (Sama seperti Reader)
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col overflow-y-auto">

            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b px-4 h-16 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (confirm("Keluar dari kuis? Progress jawaban tersimpan di draft, tapi waktu akan terus berjalan.")) {
                                router.push('/learning');
                            }
                        }}
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </Button>
                    <div className="hidden md:block">
                        <h1 className="font-semibold text-gray-900">Evaluasi Pemahaman</h1>
                        <p className="text-xs text-muted-foreground">Jawab dengan jujur dan teliti</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8">
                <QuizRunner quiz={quizData} />
            </main>

        </div>
    );
}