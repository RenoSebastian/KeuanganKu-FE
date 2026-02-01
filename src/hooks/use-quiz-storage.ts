import { useState, useEffect, useCallback } from 'react';

interface QuizState {
    answers: Record<string, string>; // questionId -> optionId
    startedAt: number; // Timestamp ms
}

export function useQuizStorage(quizId: string, userId: string, timeLimitMinutes: number) {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isHydrated, setIsHydrated] = useState(false);

    // Key unik per user dan per kuis
    const storageKey = `quiz_state_v1_${userId}_${quizId}`;

    // 1. Load from Storage on Mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed: QuizState = JSON.parse(stored);

                // --- VALIDATION: EXPIRY CHECK ---
                // Jika kuis memiliki batas waktu, cek apakah sesi tersimpan masih valid
                if (timeLimitMinutes > 0) {
                    const now = Date.now();
                    const limitMs = timeLimitMinutes * 60 * 1000;
                    // Tambahkan buffer 1 menit untuk toleransi latency
                    if (now - parsed.startedAt > limitMs + 60000) {
                        console.warn("Quiz draft expired. Clearing storage.");
                        localStorage.removeItem(storageKey);
                        setIsHydrated(true);
                        return;
                    }
                }

                setAnswers(parsed.answers);
            }
        } catch (error) {
            console.error("Failed to load quiz state:", error);
        } finally {
            setIsHydrated(true);
        }
    }, [storageKey, timeLimitMinutes]);

    // 2. Persist Answers
    const saveAnswer = useCallback((questionId: string, optionId: string) => {
        setAnswers((prev) => {
            const newAnswers = { ...prev, [questionId]: optionId };

            // Simpan ke storage (Debouncing tidak diperlukan karena interaksi klik user jarang)
            const currentState: QuizState = {
                answers: newAnswers,
                startedAt: parseInt(localStorage.getItem(`${storageKey}_start`) || Date.now().toString())
            };

            localStorage.setItem(storageKey, JSON.stringify(currentState));
            // Simpan start time terpisah jika belum ada
            if (!localStorage.getItem(`${storageKey}_start`)) {
                localStorage.setItem(`${storageKey}_start`, Date.now().toString());
            }

            return newAnswers;
        });
    }, [storageKey]);

    // 3. Clear Storage (After Submit)
    const clearStorage = useCallback(() => {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`${storageKey}_start`);
        setAnswers({});
    }, [storageKey]);

    return {
        answers,
        saveAnswer,
        clearStorage,
        isHydrated
    };
}