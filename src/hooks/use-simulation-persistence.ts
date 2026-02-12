import { useState, useEffect, useCallback } from "react";

// --- CONSTANTS ---
// Sentralisasi Key LocalStorage agar tidak ada typo di berbagai file
export const SIMULATION_STORAGE_KEYS = {
    CHECKUP: "AGENT_SIM_CHECKUP_DRAFT_V1",
    RISK_PROFILE: "AGENT_SIM_RISK_PROFILE_DRAFT_V1",
    BUDGET: "AGENT_SIM_BUDGET_DRAFT_V1",
    EDUCATION: "AGENT_SIM_EDUCATION_DRAFT_V1",
    GOAL: "AGENT_SIM_GOAL_DRAFT_V1",
    INSURANCE: "AGENT_SIM_INSURANCE_DRAFT_V1",
    PENSION: "AGENT_SIM_PENSION_DRAFT_V1",
};

// Interface Generic untuk struktur data yang disimpan
interface SimulationDraft<TClient, TData> {
    clientData: TClient | null;
    inputData: TData; // Generic: Bisa FinancialRecord, RiskAnswers[], dll.
    step: number;
    lastModified: number;
}

/**
 * useSimulationPersistence <TClient, TData>
 * ------------------------------------------------------------------
 * Custom Hook Generik untuk menangani state persistence (Anti-Hilang Data).
 *
 * @param storageKey - Key unik localStorage (Gunakan SIMULATION_STORAGE_KEYS)
 * @param currentClientData - State data identitas saat ini (Generic TClient)
 * @param currentInputData - State data input/jawaban saat ini (Generic TData)
 * @param currentStep - Langkah wizard saat ini
 */
export function useSimulationPersistence<TClient, TData>(
    storageKey: string,
    currentClientData: TClient | null,
    currentInputData: TData,
    currentStep: number
) {
    const [draftAvailable, setDraftAvailable] = useState(false);
    const [draftData, setDraftData] = useState<SimulationDraft<TClient, TData> | null>(null);

    // --- 1. INITIAL CHECK (ON MOUNT) ---
    useEffect(() => {
        // Pastikan berjalan di client-side
        if (typeof window !== "undefined") {
            try {
                const savedRaw = localStorage.getItem(storageKey);
                if (savedRaw) {
                    const parsed: SimulationDraft<TClient, TData> = JSON.parse(savedRaw);

                    // Validasi sederhana: Draft dianggap valid jika ada datanya
                    const hasClient = !!parsed.clientData;

                    // Cek apakah inputData (Object/Array) memiliki isi
                    const hasInput = Array.isArray(parsed.inputData)
                        ? parsed.inputData.length > 0
                        : Object.keys(parsed.inputData || {}).length > 0;

                    if (hasClient || hasInput) {
                        setDraftData(parsed);
                        setDraftAvailable(true);
                    }
                }
            } catch (error) {
                console.error(`[Persistence] Gagal membaca draft untuk key: ${storageKey}`, error);
                // Jika corrupt, hapus agar tidak error terus menerus
                localStorage.removeItem(storageKey);
            }
        }
    }, [storageKey]);

    // --- 2. AUTO-SAVE LOGIC (DEBOUNCED) ---
    useEffect(() => {
        // Jangan save jika data kosong atau masih di step awal tanpa input
        // Ini mencegah overwrite draft yang ada dengan state kosong saat inisialisasi komponen
        const isClientEmpty = !currentClientData;

        const isInputEmpty = Array.isArray(currentInputData)
            ? currentInputData.length === 0
            : Object.keys(currentInputData || {}).length === 0;

        if (currentStep === 0 && isClientEmpty && isInputEmpty) {
            return;
        }

        // Debounce timer: Tunggu user berhenti mengetik 1 detik baru simpan
        const timer = setTimeout(() => {
            const payload: SimulationDraft<TClient, TData> = {
                clientData: currentClientData,
                inputData: currentInputData,
                step: currentStep,
                lastModified: Date.now(),
            };

            try {
                localStorage.setItem(storageKey, JSON.stringify(payload));
            } catch (e) {
                console.warn("[Persistence] Quota localStorage penuh atau error write.", e);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [currentClientData, currentInputData, currentStep, storageKey]);

    // --- 3. ACTIONS ---

    /**
     * Mengembalikan data draft ke State utama (Page Controller).
     * Gunakan fungsi ini pada tombol "Lanjutkan Sesi".
     */
    const restoreDraft = useCallback(() => {
        return draftData;
    }, [draftData]);

    /**
     * Menghapus draft dari storage.
     * Dipanggil saat:
     * 1. User menekan "Reset / Mulai Baru".
     * 2. User berhasil Download PDF (Selesai flow).
     */
    const clearDraft = useCallback(() => {
        localStorage.removeItem(storageKey);
        setDraftAvailable(false);
        setDraftData(null);
    }, [storageKey]);

    /**
     * Mengabaikan draft yang ada (Sembunyikan notifikasi).
     * Data tidak dihapus dari storage, hanya state UI yang diubah.
     */
    const ignoreDraft = useCallback(() => {
        setDraftAvailable(false);
    }, []);

    return {
        draftAvailable, // Boolean: Tampilkan banner "Lanjutkan?" jika true
        draftData,      // Data mentah draft (untuk preview info seperti nama klien)
        restoreDraft,   // Function: Panggil untuk me-load data ke state
        clearDraft,     // Function: Hapus data permanen
        ignoreDraft     // Function: Tutup notifikasi
    };
}