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
 * useSimulationPersistence (HYBRID EDITION)
 * -----------------------------------------
 * Hook ini mendukung dua mode operasi untuk menjaga kompatibilitas:
 * * 1. SILENT MODE (New Architecture):
 * - Dipicu jika parameter 'onHydrate' disediakan.
 * - Otomatis mengisi data saat mount (Auto-Hydrate).
 * - Mencegah overwrite data sampai loading selesai.
 * * 2. LEGACY MODE (Old Architecture):
 * - Dipicu jika 'onHydrate' kosong/undefined.
 * - Menggunakan mekanisme 'draftAvailable' dan manual restore.
 * - Mencegah fitur lain (Budget, Risk Profile) crash saat refactoring Checkup.
 */
export function useSimulationPersistence<TClient, TData>(
    key: string,
    currentClientData: TClient | null,
    currentInputData: TData | null,
    currentStep: number,
    // Optional: Hanya diisi oleh komponen yang sudah direfactor (CheckupWizard)
    onHydrate?: (client: TClient | null, input: TData | null, step: number) => void
) {
    // State untuk New Arch
    const [isHydrated, setIsHydrated] = useState(false);

    // State untuk Legacy Arch (Backward Compatibility)
    const [draftAvailable, setDraftAvailable] = useState(false);
    const [draftData, setDraftData] = useState<any>(null);

    // 1. MOUNT LOGIC (HYBRID)
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed) {
                    // MODE 1: SILENT / AUTO (Untuk CheckupWizard)
                    if (onHydrate && typeof onHydrate === 'function') {
                        console.log(`[Persistence] Auto-hydrating ${key}...`);
                        onHydrate(
                            parsed.clientData || null,
                            parsed.inputData || null,
                            typeof parsed.step === 'number' ? parsed.step : 0
                        );
                    }
                    // MODE 2: LEGACY (Untuk Budget, RiskProfile, dll)
                    else {
                        // Cek validitas data minimal untuk legacy
                        const hasClient = !!parsed.clientData;
                        const hasInput = parsed.inputData && Object.keys(parsed.inputData).length > 0;

                        if (hasClient || hasInput) {
                            setDraftData(parsed);
                            setDraftAvailable(true);
                        }
                    }
                }
            }
        } catch (e) {
            console.error(`[Persistence] Failed to hydrate ${key}:`, e);
            // Jangan hapus otomatis di legacy mode agar user punya kesempatan backup manual jika perlu
            if (onHydrate) localStorage.removeItem(key);
        } finally {
            setIsHydrated(true); // Izinkan saving dimulai
        }
    }, []); // Run once on mount

    // 2. AUTO-SAVE (GUARDED)
    useEffect(() => {
        // [GUARD] Write-Protection
        // Jangan save jika belum hydration selesai.
        // Jika Legacy Mode: Jangan save jika ada draft lama yang belum di-restore/ignore oleh user.
        if (!isHydrated) return;
        if (!onHydrate && draftAvailable) return;

        const timer = setTimeout(() => {
            // Safety check untuk data kosong
            const isClientEmpty = !currentClientData;
            const isInputEmpty = !currentInputData || (Object.keys(currentInputData as object).length === 0);

            if (isClientEmpty && isInputEmpty) return;

            const payload = {
                clientData: currentClientData,
                inputData: currentInputData,
                step: currentStep,
                lastModified: Date.now()
            };

            try {
                localStorage.setItem(key, JSON.stringify(payload));
            } catch (e) {
                console.warn("[Persistence] Storage write failed:", e);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [currentClientData, currentInputData, currentStep, isHydrated, key, draftAvailable, onHydrate]);

    // 3. ACTIONS

    const clearStorage = useCallback(() => {
        localStorage.removeItem(key);
        setDraftAvailable(false);
        setDraftData(null);
    }, [key]);

    // Legacy Action: Restore Manual
    const restoreDraft = useCallback(() => {
        setDraftAvailable(false);
        return draftData;
    }, [draftData]);

    // Legacy Action: Ignore Draft
    const ignoreDraft = useCallback(() => {
        setDraftAvailable(false);
        // Kita anggap sudah hydrated/ready untuk overwrite baru
    }, []);

    return {
        // New Props
        isHydrated,
        clearStorage,

        // Legacy Props (Required for compatibility with other modules)
        draftAvailable,
        draftData,
        restoreDraft,
        ignoreDraft
    };
}