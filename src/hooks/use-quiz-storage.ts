import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@/lib/constants'; // [NEW]

interface QuizState {
    answers: Record<string, string>;
    startedAt: number;
}

export function useQuizStorage(quizId: string, userId: string, timeLimitMinutes: number) {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isHydrated, setIsHydrated] = useState(false);

    // [CLEANUP] Konstruksi Key Konsisten
    const storageKey = `${STORAGE_KEYS.QUIZ_DRAFT_PREFIX}${userId}_${quizId}`;
    const startTimeKey = `${storageKey}${STORAGE_KEYS.QUIZ_START_TIME_SUFFIX}`;

    // 1. Load from Storage
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed: QuizState = JSON.parse(stored);

                if (timeLimitMinutes > 0) {
                    const now = Date.now();
                    const limitMs = timeLimitMinutes * 60 * 1000;
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
            // Silent catch for parsing errors
        } finally {
            setIsHydrated(true);
        }
    }, [storageKey, startTimeKey, timeLimitMinutes]);

    // 2. Persist Answers
    const saveAnswer = useCallback((questionId: string, optionId: string) => {
        setAnswers((prev) => {
            const newAnswers = { ...prev, [questionId]: optionId };

            const startTimestamp = parseInt(localStorage.getItem(startTimeKey) || Date.now().toString());

            const currentState: QuizState = {
                answers: newAnswers,
                startedAt: startTimestamp
            };

            localStorage.setItem(storageKey, JSON.stringify(currentState));

            if (!localStorage.getItem(startTimeKey)) {
                localStorage.setItem(startTimeKey, Date.now().toString());
            }

            return newAnswers;
        });
    }, [storageKey, startTimeKey]);

    // 3. Clear Storage
    const clearStorage = useCallback(() => {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(startTimeKey);
        setAnswers({});
    }, [storageKey, startTimeKey]);

    return {
        answers,
        saveAnswer,
        clearStorage,
        isHydrated
    };
}