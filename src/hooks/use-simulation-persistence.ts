"use client";

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

export const EMERGENCY_SAVE_EVENT = "KEUANGANKU_SAVE_DRAFT_BEFORE_DIE";

export function useSimulationPersistence<TClient, TData, TResult = any>(
    key: string,
    currentClientData: TClient | null,
    currentInputData: TData | null,
    currentStep: number,
    currentResult: TResult | null = null,
    currentPdfUrl: string | null = null,
    currentMgcToken: string | null = null,
    onHydrate?: (
        client: TClient | null,
        input: TData | null,
        step: number,
        result: TResult | null,
        pdfUrl: string | null,
        token: string | null
    ) => void
) {
    const [isHydrated, setIsHydrated] = useState(false);
    const [draftData, setDraftData] = useState<any>(null);
    const [draftAvailable, setDraftAvailable] = useState(false);

    const stateRef = useRef({
        currentClientData,
        currentInputData,
        currentStep,
        currentResult,
        currentPdfUrl,
        currentMgcToken
    });

    useEffect(() => {
        stateRef.current = {
            currentClientData,
            currentInputData,
            currentStep,
            currentResult,
            currentPdfUrl,
            currentMgcToken
        };
    }, [currentClientData, currentInputData, currentStep, currentResult, currentPdfUrl, currentMgcToken]);

    // 1. Initial Check for Draft
    useEffect(() => {
        if (typeof window === "undefined") return;

        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setDraftData(parsed);
                setDraftAvailable(true);
            } catch (e) {
                localStorage.removeItem(key);
            }
        }
        setIsHydrated(true);
    }, [key]);

    const saveToStorage = useCallback(() => {
        const { currentClientData, currentInputData, currentStep, currentResult, currentPdfUrl, currentMgcToken } = stateRef.current;

        if (currentStep === 0 && !currentClientData && !currentInputData) return;

        const payload = {
            clientData: currentClientData,
            inputData: currentInputData,
            step: currentStep,
            result: currentResult,
            pdfUrl: currentPdfUrl,
            mgcToken: currentMgcToken,
            lastModified: Date.now(),
            isEmergencyBackup: true
        };

        try {
            localStorage.setItem(key, JSON.stringify(payload));
        } catch (e) {
            console.warn("[Persistence] Save failed:", e);
        }
    }, [key]);

    // 2. AUTO-SAVE & EMERGENCY LISTENER
    useEffect(() => {
        if (!isHydrated) return;

        const handleEmergency = () => saveToStorage();
        window.addEventListener(EMERGENCY_SAVE_EVENT, handleEmergency);

        const timer = setTimeout(() => {
            if (currentStep > 0 && !currentClientData) return;
            saveToStorage();
        }, 1000);

        return () => {
            clearTimeout(timer);
            window.removeEventListener(EMERGENCY_SAVE_EVENT, handleEmergency);
        };
    }, [currentClientData, currentInputData, currentStep, isHydrated, saveToStorage]);

    // --- ACTIONS UNTUK WIZARD ---

    const restoreDraft = useCallback(() => {
        if (!draftData) return null;
        if (onHydrate) {
            onHydrate(
                draftData.clientData || null,
                draftData.inputData || null,
                draftData.step || 0,
                draftData.result || null,
                draftData.pdfUrl || null,
                draftData.mgcToken || null
            );
        }
        setDraftAvailable(false); // Sembunyikan banner setelah dipulihkan
        return draftData;
    }, [draftData, onHydrate]);

    const ignoreDraft = useCallback(() => {
        localStorage.removeItem(key);
        setDraftAvailable(false);
        setDraftData(null);
    }, [key]);

    const clearStorage = useCallback(() => {
        localStorage.removeItem(key);
        setDraftAvailable(false);
        setDraftData(null);
    }, [key]);

    return {
        isHydrated,
        clearStorage,
        draftAvailable,
        restoreDraft,
        ignoreDraft,
        draftData
    };
}