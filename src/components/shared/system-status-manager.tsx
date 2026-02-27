"use client";

import { useEffect } from "react";
import { useSystemStore } from "@/hooks/use-system-store";
import { SystemStateDisplay } from "./system-state-display";

/**
 * Komponen ini berfungsi sebagai 'Otak' pemantau status aplikasi.
 * Mendeteksi perubahan koneksi internet dan mendengarkan status maintenance/error.
 */
export function SystemStatusManager() {
    const { state, setOffline } = useSystemStore();

    useEffect(() => {
        // 1. Logika Deteksi Koneksi Internet (Offline/Online)
        const handleOnline = () => setOffline(false);
        const handleOffline = () => setOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        if (!navigator.onLine) setOffline(true);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [setOffline]);

    // Jika status bukan NORMAL, tampilkan Overlay Imersif (Safety Net)
    if (state === 'NORMAL') return null;

    return <SystemStateDisplay type={state as any} />;
}