'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { QuizRunner } from '@/components/features/education/quiz/quiz-runner';
import { employeeEducationService } from '@/services/employee-education.service';
// [FIX] Import UserQuizData dari Library Types (Single Source of Truth), bukan dari Service
import { UserQuizData } from '@/lib/types/education';

interface QuizPageProps {
    params: Promise<{ slug: string }>;
}

export default function QuizPage({ params }: QuizPageProps) {
    // [FIX] Unwrap params menggunakan React.use()
    const { slug } = use(params);

    const router = useRouter();
    const [quizData, setQuizData] = useState<UserQuizData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!slug || slug === 'undefined') return;

        const fetchQuiz = async () => {
            try {
                setIsLoading(true);
                const data = await employeeEducationService.getQuizBySlug(slug);

                if (!data || !data.questions || data.questions.length === 0) {
                    toast.error("Kuis belum tersedia untuk materi ini.");
                    router.push(`/learning/${slug}/read`);
                    return;
                }

                setQuizData(data);
            } catch (error: any) {
                console.error("Quiz fetch error:", error);

                if (error.response?.status === 404) {
                    toast.error("Data kuis tidak ditemukan di server.");
                } else {
                    toast.error("Gagal memuat kuis. Silakan coba lagi.");
                }

                router.push('/learning');
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuiz();
    }, [slug, router]);

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
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col overflow-y-auto animate-in fade-in duration-300">

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

                <div className="text-right">
                    <p className="text-xs font-medium text-primary uppercase tracking-wider">Mode Ujian</p>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <QuizRunner quiz={quizData} />
                </div>
            </main>

        </div>
    );
}
