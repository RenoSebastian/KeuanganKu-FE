'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizTimerProps {
    durationMinutes: number; // 0 = unlimited
    onTimeUp: () => void;
}

export function QuizTimer({ durationMinutes, onTimeUp }: QuizTimerProps) {
    // Hitung sisa waktu dalam detik
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

    // Format MM:SS
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (durationMinutes <= 0) return; // Unlimited time

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onTimeUp(); // Trigger action di Parent
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [durationMinutes, onTimeUp]);

    if (durationMinutes <= 0) {
        return (
            <div className="flex items-center gap-2 text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-full text-sm">
                <Clock className="w-4 h-4" />
                <span>Tanpa Batas Waktu</span>
            </div>
        );
    }

    // Visual Warning Logic: Merah jika < 10% waktu tersisa
    const isUrgent = timeLeft < (durationMinutes * 60 * 0.1);

    return (
        <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold shadow-sm border transition-colors duration-500",
            isUrgent
                ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                : "bg-white text-primary border-gray-200"
        )}>
            <Clock className={cn("w-4 h-4", isUrgent && "animate-bounce")} />
            <span>{formatTime(timeLeft)}</span>
        </div>
    );
}