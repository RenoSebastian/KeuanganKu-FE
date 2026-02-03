import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';

interface QuizState {
    answers: Record<string, string>;
    startedAt: number;
}

/**
 * Hook untuk mengelola penyimpanan jawaban kuis di localStorage.
 * Mendukung isolasi data berdasarkan User ID dan Quiz ID.
 */
export function useQuizStorage(quizId: string, userId: string, timeLimitMinutes: number) {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isHydrated, setIsHydrated] = useState(false);

    // [CLEANUP] Konstruksi Key Konsisten
    // Jika userId adalah "admin-preview", key akan terisolasi dari data user asli.
    const effectiveUserId = userId || "guest";
    const storageKey = `${STORAGE_KEYS.QUIZ_DRAFT_PREFIX}${effectiveUserId}_${quizId}`;
    const startTimeKey = `${storageKey}${STORAGE_KEYS.QUIZ_START_TIME_SUFFIX}`;

    // 1. Load from Storage
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem(storageKey);

            if (stored) {
                const parsed: QuizState = JSON.parse(stored);

                // Validasi Expiry Time (Hanya jika ada limit waktu)
                if (timeLimitMinutes > 0) {
                    const now = Date.now();
                    const limitMs = timeLimitMinutes * 60 * 1000;
                    // Buffer 60 detik untuk toleransi latensi
                    if (now - parsed.startedAt > limitMs + 60000) {
                        console.warn("Draft expired. Clearing local storage.");
                        localStorage.removeItem(storageKey);
                        localStorage.removeItem(startTimeKey);
                        setIsHydrated(true);
                        return;
                    }
                }

                setAnswers(parsed.answers);
            }
        } catch (error) {
            // Silent catch for parsing errors (e.g., corrupted storage)
            console.error("Failed to load quiz state:", error);
            localStorage.removeItem(storageKey);
        } finally {
            setIsHydrated(true);
        }
    }, [storageKey, startTimeKey, timeLimitMinutes]);

    // 2. Persist Answers
    const saveAnswer = useCallback((questionId: string, optionId: string) => {
        setAnswers((prev) => {
            const newAnswers = { ...prev, [questionId]: optionId };

            // Pastikan startTime ada. Jika belum ada, set sekarang.
            // Jika sudah ada, jangan ditimpa (gunakan yang lama).
            let startTimestamp = parseInt(localStorage.getItem(startTimeKey) || '0');

            if (!startTimestamp || startTimestamp === 0) {
                startTimestamp = Date.now();
                localStorage.setItem(startTimeKey, startTimestamp.toString());
            }

            const currentState: QuizState = {
                answers: newAnswers,
                startedAt: startTimestamp
            };

            try {
                localStorage.setItem(storageKey, JSON.stringify(currentState));
            } catch (e) {
                console.error("Storage quota exceeded", e);
            }

            return newAnswers;
        });
    }, [storageKey, startTimeKey]);

    // 3. Clear Storage (After Submit / Reset)
    const clearStorage = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
            localStorage.removeItem(startTimeKey);
            setAnswers({});
        } catch (e) {
            console.error("Failed to clear storage", e);
        }
    }, [storageKey, startTimeKey]);

    return {
        answers,
        saveAnswer,
        clearStorage,
        isHydrated
    };
}