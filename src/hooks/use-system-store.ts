import { create } from 'zustand';

type SystemState = 'NORMAL' | 'MAINTENANCE' | 'SERVER_ERROR' | 'OFFLINE';

interface SystemStore {
    state: SystemState;
    errorMessage: string | null;
    isSessionTerminated: boolean;

    // [NEW] Indikator Hydration untuk mencegah mismatch di Next.js SSR
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;

    setMaintenance: (val: boolean) => void;
    setOffline: (val: boolean) => void;
    setServerError: (message: string | null) => void;
    triggerSessionTermination: () => void;
    reset: () => void;
}

export const useSystemStore = create<SystemStore>((set) => ({
    state: 'NORMAL',
    errorMessage: null,
    isSessionTerminated: false,
    _hasHydrated: false,

    setHasHydrated: (state) => set({ _hasHydrated: state }),

    setMaintenance: (val) => set({ state: val ? 'MAINTENANCE' : 'NORMAL' }),
    setOffline: (val) => set({ state: val ? 'OFFLINE' : 'NORMAL' }),
    setServerError: (message) => set({
        state: message ? 'SERVER_ERROR' : 'NORMAL',
        errorMessage: message
    }),

    triggerSessionTermination: () => set({ isSessionTerminated: true }),

    reset: () => set({ state: 'NORMAL', errorMessage: null, isSessionTerminated: false }),
}));