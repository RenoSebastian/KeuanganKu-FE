import { useState, useEffect, useCallback, useRef } from "react";

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

// Interface Generic
interface SimulationDraft<TClient, TData> {
    clientData: TClient | null;
    inputData: TData;
    step: number;
    lastModified: number;
}

/**
 * useSimulationPersistence (SMART SAVER EDITION)
 * ----------------------------------------------
 * Hook ini sekarang memiliki "Defensive Saving Mechanism" untuk mencegah
 * overwrite data storage dengan state kosong saat terjadi race condition atau unmounting.
 */
export function useSimulationPersistence<TClient, TData>(
    storageKey: string,
    currentClientData: TClient | null,
    currentInputData: TData,
    currentStep: number
) {
    const [draftAvailable, setDraftAvailable] = useState(false);
    const [draftData, setDraftData] = useState<SimulationDraft<TClient, TData> | null>(null);

    // [FIX 1] Mounting Ref untuk mencegah save saat inisialisasi pertama
    const isMounted = useRef(false);

    // --- 1. INITIAL CHECK (LOAD ONLY ONCE) ---
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const savedRaw = localStorage.getItem(storageKey);
                if (savedRaw) {
                    const parsed: SimulationDraft<TClient, TData> = JSON.parse(savedRaw);

                    // Validasi: Draft valid jika ada Client Data ATAU Input Data
                    const hasClient = !!parsed.clientData;

                    // Helper check untuk object atau array
                    const hasInput = Array.isArray(parsed.inputData)
                        ? parsed.inputData.length > 0
                        : parsed.inputData && Object.keys(parsed.inputData).length > 0;

                    if (hasClient || hasInput) {
                        setDraftData(parsed);
                        setDraftAvailable(true);
                    }
                }
            } catch (error) {
                console.error(`[Persistence] Corrupt data for key: ${storageKey}`, error);
                // Jangan hapus otomatis dulu, biarkan user memutuskan via "Reset" nanti
            }
        }
        // Set mounted true setelah check awal selesai
        isMounted.current = true;
    }, [storageKey]);

    // --- 2. SMART AUTO-SAVE LOGIC ---
    useEffect(() => {
        // [FIX 2] Jangan jalankan efek jika komponen belum mounted sempurna
        if (!isMounted.current) return;

        // Cek kekosongan data
        const isClientEmpty = !currentClientData;
        const isInputEmpty = Array.isArray(currentInputData)
            ? currentInputData.length === 0
            : !currentInputData || Object.keys(currentInputData).length === 0;

        // [FIX 3] GLOBAL SAFETY GUARD
        // Jika semua data kosong, jangan pernah save (kecuali eksplisit clear).
        // Ini mencegah overwrite draft yang sudah ada dengan state initial component.
        if (isClientEmpty && isInputEmpty) {
            return;
        }

        // [FIX 4] CONTEXT AWARENESS GUARD (THE CRITICAL FIX)
        // Jika user berada di Step > 0 (Financial/Result), TAPI clientData tiba-tiba hilang (null),
        // ini adalah indikasi "State Loss" atau "Unmount Bug" di Parent Component.
        // DILARANG SAVE ke Storage dalam kondisi ini agar Draft tidak rusak.
        if (currentStep > 0 && isClientEmpty) {
            console.warn("[Persistence] Prevented corrupted save: Step > 0 but Client Data is missing.");
            return;
        }

        // Debounce timer
        const timer = setTimeout(() => {
            const payload: SimulationDraft<TClient, TData> = {
                clientData: currentClientData,
                inputData: currentInputData,
                step: currentStep,
                lastModified: Date.now(),
            };

            try {
                localStorage.setItem(storageKey, JSON.stringify(payload));
                // Update local status agar UI tahu ada draft baru
                setDraftAvailable(true);
                setDraftData(payload);
            } catch (e) {
                console.warn("[Persistence] Storage quota exceeded.", e);
            }
        }, 800); // 800ms delay

        return () => clearTimeout(timer);
    }, [currentClientData, currentInputData, currentStep, storageKey]);

    // --- 3. ACTIONS ---

    const restoreDraft = useCallback(() => {
        return draftData;
    }, [draftData]);

    const clearDraft = useCallback(() => {
        localStorage.removeItem(storageKey);
        setDraftAvailable(false);
        setDraftData(null);
    }, [storageKey]);

    const ignoreDraft = useCallback(() => {
        setDraftAvailable(false);
    }, []);

    return {
        draftAvailable,
        draftData,
        restoreDraft,
        clearDraft,
        ignoreDraft
    };
}