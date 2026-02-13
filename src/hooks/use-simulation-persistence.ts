"use client";

import { useState, useEffect, useCallback } from "react";

// --- CONSTANTS ---
export const SIMULATION_STORAGE_KEYS = {
    CHECKUP: "AGENT_SIM_CHECKUP_DRAFT_V1",
    RISK_PROFILE: "AGENT_SIM_RISK_PROFILE_DRAFT_V1",
    BUDGET: "AGENT_SIM_BUDGET_DRAFT_V1",
    EDUCATION: "AGENT_SIM_EDUCATION_DRAFT_V1",
    GOAL: "AGENT_SIM_GOAL_DRAFT_V1",
    INSURANCE: "AGENT_SIM_INSURANCE_DRAFT_V1",
    PENSION: "AGENT_SIM_PENSION_DRAFT_V1",
};

/**
 * useSimulationPersistence (FULL PERSISTENCE EDITION)
 * ---------------------------------------------------
 * Hook ini sekarang mencakup penyimpanan Hasil Simulasi (Result).
 * - Menangani penyimpanan state: Client, Input, Result, PDF, Token.
 * - Memastikan data survive saat Refresh di halaman Result.
 * - Tetap memiliki Safety Guard untuk mencegah overwrite data kosong.
 */
export function useSimulationPersistence<TClient, TData, TResult = any>(
    key: string,
    currentClientData: TClient | null,
    currentInputData: TData | null,
    currentStep: number,
    // Parameter Baru (Optional agar tidak merusak modul lain/Legacy)
    currentResult: TResult | null = null,
    currentPdfUrl: string | null = null,
    currentMgcToken: string | null = null,
    // Callback Hydration diperluas
    onHydrate?: (
        client: TClient | null,
        input: TData | null,
        step: number,
        result: TResult | null,
        pdfUrl: string | null,
        token: string | null
    ) => void
) {
    // State: Penanda apakah data sudah selesai dimuat dari storage
    const [isHydrated, setIsHydrated] = useState(false);

    // 1. MOUNT LOGIC (AUTO-HYDRATE)
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Jika parent menyediakan callback onHydrate, kita inject semua data
                if (parsed && onHydrate && typeof onHydrate === 'function') {
                    console.log(`[Persistence] Auto-hydrating ${key} with Result...`);
                    onHydrate(
                        parsed.clientData || null,
                        parsed.inputData || null,
                        typeof parsed.step === 'number' ? parsed.step : 0,
                        parsed.result || null,      // Restore Result
                        parsed.pdfUrl || null,      // Restore PDF
                        parsed.mgcToken || null     // Restore Token
                    );
                }
            }
        } catch (e) {
            console.error(`[Persistence] Failed to hydrate ${key}:`, e);
            // Jika data korup, hapus storage agar tidak error selamanya
            localStorage.removeItem(key);
        } finally {
            // [CRITICAL] Buka gerbang save setelah loading selesai
            setIsHydrated(true);
        }
    }, []); // Run once on mount

    // 2. AUTO-SAVE (WITH SAFETY GUARDS)
    useEffect(() => {
        // GUARD 1: Write-Protection saat Loading
        if (!isHydrated) return;

        // GUARD 2: Context Awareness (Fix Data Hilang)
        // Jika kita bukan di halaman pertama, TAPI data client kosong,
        // itu indikasi bug render. JANGAN save ke storage (biar storage aman).
        if (currentStep > 0 && !currentClientData) {
            console.warn(`[Persistence] Prevented CORRUPT SAVE on ${key}. Step: ${currentStep}, Client: Null`);
            return;
        }

        // Debounce Save (500ms)
        const timer = setTimeout(() => {
            // Optional: Jangan save jika benar-benar kosong di awal
            const isClientEmpty = !currentClientData;
            const isInputEmpty = !currentInputData || (Object.keys(currentInputData as object).length === 0);

            if (currentStep === 0 && isClientEmpty && isInputEmpty) return;

            const payload = {
                clientData: currentClientData,
                inputData: currentInputData,
                step: currentStep,
                // Simpan State Hasil juga
                result: currentResult,
                pdfUrl: currentPdfUrl,
                mgcToken: currentMgcToken,
                lastModified: Date.now()
            };

            try {
                localStorage.setItem(key, JSON.stringify(payload));
            } catch (e) {
                console.warn("[Persistence] Storage write failed:", e);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [
        currentClientData,
        currentInputData,
        currentStep,
        currentResult,    // Dependency baru
        currentPdfUrl,    // Dependency baru
        currentMgcToken,  // Dependency baru
        isHydrated,
        key
    ]);

    // 3. ACTIONS
    const clearStorage = useCallback(() => {
        localStorage.removeItem(key);
    }, [key]);

    return {
        isHydrated,
        clearStorage,

        // --- COMPATIBILITY LAYER ---
        // (Properti dummy agar file lain seperti Budget/RiskProfile tidak error build)
        draftAvailable: false,
        restoreDraft: () => null,
        ignoreDraft: () => { },
        draftData: null
    };
}