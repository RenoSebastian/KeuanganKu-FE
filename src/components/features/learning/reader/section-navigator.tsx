'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface SectionNavigatorProps {
    currentStep: number; // 0-based index
    totalSteps: number;
    onPrevious: () => void;
    onNext: () => void;
    onFinish: () => void;
    isFinishing?: boolean;
}

export function SectionNavigator({
    currentStep,
    totalSteps,
    onPrevious,
    onNext,
    onFinish,
    isFinishing = false
}: SectionNavigatorProps) {

    const isFirst = currentStep === 0;
    const isLast = currentStep === totalSteps - 1;
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t p-4 z-40">
            <div className="max-w-3xl mx-auto space-y-3">

                {/* Progress Indicator */}
                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>Bagian {currentStep + 1} dari {totalSteps}</span>
                    <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-1" />

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-1">
                    <Button
                        variant="ghost"
                        onClick={onPrevious}
                        disabled={isFirst}
                        className={isFirst ? "invisible" : ""}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Sebelumnya
                    </Button>

                    {isLast ? (
                        <Button
                            onClick={onFinish}
                            disabled={isFinishing}
                            className="bg-green-600 hover:bg-green-700 text-white min-w-35"
                        >
                            {isFinishing ? (
                                "Menyimpan..."
                            ) : (
                                <>
                                    Selesai Membaca
                                    <CheckCircle2 className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button onClick={onNext} className="min-w-30">
                            Selanjutnya
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}