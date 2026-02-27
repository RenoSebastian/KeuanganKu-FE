import { create } from 'zustand';

type SystemState = 'NORMAL' | 'MAINTENANCE' | 'SERVER_ERROR' | 'OFFLINE';

interface SystemStore {
    state: SystemState;
    errorMessage: string | null;
    // [NEW] Saklar Circuit Breaker untuk menghentikan request API
    isSessionTerminated: boolean;

    setMaintenance: (val: boolean) => void;
    setOffline: (val: boolean) => void;
    setServerError: (message: string | null) => void;
    // [NEW] Aksi untuk memicu pemutusan arus
    triggerSessionTermination: () => void;
    reset: () => void;
}

export const useSystemStore = create<SystemStore>((set) => ({
    state: 'NORMAL',
    errorMessage: null,
    isSessionTerminated: false,

    setMaintenance: (val) => set({ state: val ? 'MAINTENANCE' : 'NORMAL' }),
    setOffline: (val) => set({ state: val ? 'OFFLINE' : 'NORMAL' }),
    setServerError: (message) => set({
        state: message ? 'SERVER_ERROR' : 'NORMAL',
        errorMessage: message
    }),

    // Aktifkan saklar tanpa menyentuh status error lain
    triggerSessionTermination: () => set({ isSessionTerminated: true }),

    // Pastikan saklar ini juga ikut di-reset saat sesi normal kembali
    reset: () => set({ state: 'NORMAL', errorMessage: null, isSessionTerminated: false }),
}));