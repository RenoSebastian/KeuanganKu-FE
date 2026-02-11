import { useState, useEffect, useCallback } from "react";
import { SimulationClientProfile, FinancialRecord } from "@/lib/types";

// Key to avoid collision with other local storage items
const STORAGE_KEY = "AGENT_SIM_CHECKUP_DRAFT_V1";

interface SimulationDraft {
    clientData: { client: SimulationClientProfile; spouse?: any } | null;
    financialData: Partial<FinancialRecord>;
    step: number;
    lastModified: number;
}

export function useSimulationPersistence(
    currentClientData: { client: SimulationClientProfile; spouse?: any } | null,
    currentFinancialData: Partial<FinancialRecord>,
    currentStep: number
) {
    const [draftAvailable, setDraftAvailable] = useState(false);
    const [draftData, setDraftData] = useState<SimulationDraft | null>(null);

    // 1. Check for existing draft on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed: SimulationDraft = JSON.parse(saved);
                    // Basic validation: must have at least client name or some financial data
                    const hasClient = parsed.clientData?.client?.name;
                    const hasFinance = Object.keys(parsed.financialData).length > 0;

                    if (hasClient || hasFinance) {
                        setDraftData(parsed);
                        setDraftAvailable(true);
                    }
                }
            } catch (e) {
                console.error("Failed to load simulation draft", e);
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    // 2. Auto-Save Logic (Debounced)
    useEffect(() => {
        // Prevent saving empty initial state over a potentially valid draft before restore
        if (currentStep === 0 && !currentClientData && Object.keys(currentFinancialData).length === 0) {
            return;
        }

        const timer = setTimeout(() => {
            const payload: SimulationDraft = {
                clientData: currentClientData,
                financialData: currentFinancialData,
                step: currentStep,
                lastModified: Date.now(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
    }, [currentClientData, currentFinancialData, currentStep]);

    // 3. Actions
    const restoreDraft = useCallback(() => {
        return draftData;
    }, [draftData]);

    const clearDraft = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setDraftAvailable(false);
        setDraftData(null);
    }, []);

    const ignoreDraft = useCallback(() => {
        setDraftAvailable(false);
        // We don't delete from storage yet, in case it was a mistake. 
        // It will be overwritten once the user starts typing new data.
    }, []);

    return {
        draftAvailable,
        draftData,
        restoreDraft,
        clearDraft,
        ignoreDraft
    };
}