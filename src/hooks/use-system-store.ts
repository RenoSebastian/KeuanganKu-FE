import { create } from 'zustand';

type SystemState = 'NORMAL' | 'MAINTENANCE' | 'SERVER_ERROR' | 'OFFLINE';

interface SystemStore {
    state: SystemState;
    errorMessage: string | null;
    setMaintenance: (val: boolean) => void;
    setOffline: (val: boolean) => void;
    setServerError: (message: string | null) => void;
    reset: () => void;
}

export const useSystemStore = create<SystemStore>((set) => ({
    state: 'NORMAL',
    errorMessage: null,
    setMaintenance: (val) => set({ state: val ? 'MAINTENANCE' : 'NORMAL' }),
    setOffline: (val) => set({ state: val ? 'OFFLINE' : 'NORMAL' }),
    setServerError: (message) => set({
        state: message ? 'SERVER_ERROR' : 'NORMAL',
        errorMessage: message
    }),
    reset: () => set({ state: 'NORMAL', errorMessage: null }),
}));