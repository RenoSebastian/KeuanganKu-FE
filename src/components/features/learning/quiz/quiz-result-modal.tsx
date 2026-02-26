'use client';

import { useRouter } from 'next/navigation';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, RefreshCw, BookOpen } from 'lucide-react';
import { QuizSubmissionResult } from '@/lib/types/education';
import { cn } from '@/lib/utils';

interface QuizResultModalProps {
    isOpen: boolean;
    result: QuizSubmissionResult | null;
    slug: string;
}

export function QuizResultModal({ isOpen, result, slug }: QuizResultModalProps) {
    const router = useRouter();

    if (!result) return null;

    const isPassed = result.isPassed;
    const canRetry = result.attemptsUsed < result.maxAttempts;

    // Actions
    const handleBackToCatalog = () => {
        router.push('/learning');
    };

    const handleRetry = () => {
        // Reload halaman untuk mereset state quiz runner secara bersih
        window.location.reload();
    };

    return (
        <AlertDialog open={isOpen}>
            {/* sengaja TANPA onOpenChange agar tidak bisa ditutup via backdrop */}
            <AlertDialogContent className="sm:max-w-md text-center">

                <AlertDialogHeader className="flex flex-col items-center gap-4">
                    {/* Icon Status */}
                    <div
                        className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center animate-in zoom-in duration-300",
                            isPassed
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                        )}
                    >
                        {isPassed ? (
                            <CheckCircle2 className="w-10 h-10" />
                        ) : (
                            <XCircle className="w-10 h-10" />
                        )}
                    </div>

                    <AlertDialogTitle className="text-2xl font-bold">
                        {isPassed ? "Lulus Kompetensi!" : "Belum Lulus"}
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-center max-w-75">
                        {result.message}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Score Display */}
                <div className="py-6 space-y-4">
                    <div className="flex flex-col items-center">
                        <span className="text-5xl font-black tracking-tighter text-slate-900">
                            {result.score}
                        </span>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-1">
                            Nilai Akhir
                        </span>
                    </div>

                    {/* Attempt Info */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Kesempatan Digunakan</span>
                            <span className="font-medium">
                                {result.attemptsUsed} / {result.maxAttempts}
                            </span>
                        </div>
                        <Progress
                            value={(result.attemptsUsed / result.maxAttempts) * 100}
                            className="h-2"
                        />
                    </div>
                </div>

                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    {/* Logic Tombol Aksi */}
                    {(!isPassed && canRetry) ? (
                        <>
                            <AlertDialogCancel
                                asChild
                            >
                                <Button
                                    variant="outline"
                                    onClick={handleBackToCatalog}
                                    className="w-full"
                                >
                                    Kembali Belajar
                                </Button>
                            </AlertDialogCancel>

                            <AlertDialogAction
                                asChild
                            >
                                <Button
                                    onClick={handleRetry}
                                    className="w-full gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Coba Lagi
                                </Button>
                            </AlertDialogAction>
                        </>
                    ) : (
                        <AlertDialogAction asChild>
                            <Button
                                onClick={handleBackToCatalog}
                                className="w-full gap-2 bg-slate-900 text-white hover:bg-slate-800"
                            >
                                <BookOpen className="w-4 h-4" />
                                Kembali ke Katalog
                            </Button>
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    );
}
