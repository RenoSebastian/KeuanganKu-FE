import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/axios';
import { getOrCreateDeviceId } from '@/lib/device-id';
import { EMERGENCY_SAVE_EVENT } from './use-simulation-persistence';

// [REFACTOR ARCHITECTURE] Import entitas User dari Single Point of Truth
import { User } from '@/lib/types/auth';

export const AUTH_SYNC_EVENT = 'AUTH_USER_SYNC_EVENT';

export interface UserTokenPayload {
    sub: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

// =================================================================
// HOOK IMPLEMENTATION (Data-Driven UI)
// =================================================================

export function useAuthUser() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [deviceId, setDeviceId] = useState<string>('');

    // [ARCHITECTURAL FIX] Dihitung secara dinamis (Derived State) saat render.
    // Menghilangkan penggunaan useState terpisah yang sering menyebabkan Ghost Error & Desync.
    const isPro = user?.computed?.subscription?.isActive ?? false;
    const remainingDays = user?.computed?.subscription?.remainingDays ?? 0;
    const quota = user?.usage?.simulationQuota ?? 0;
    const isUnlimited = user?.computed?.usageAnalytics?.isUnlimited ?? false;
    const healthStatus = user?.computed?.usageAnalytics?.healthStatus ?? 'NORMAL';
    const derivedStatus = user?.computed?.subscription?.derivedStatus ?? 'INACTIVE';

    const fetchUserProfile = useCallback(async (broadcast = true) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            // Cache Busting: Memaksa jaringan mengambil data mutasi terbaru (termasuk .computed)
            const response = await api.get(`/users/me?_t=${Date.now()}`);
            const userData: User = response.data;

            setUser(userData);

            // Cross-Component State Sync (Publisher)
            if (broadcast && typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent(AUTH_SYNC_EVENT, { detail: userData }));
            }

        } catch (error: any) {
            if (error?.response?.status === 401) {
                forceLogout('expired');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const forceLogout = useCallback((reason: 'kicked' | 'expired' | 'manual' = 'manual') => {
        if (typeof window !== 'undefined') {
            console.log("⚠️ System: Preparing data backup before logout...");
            window.dispatchEvent(new Event(EMERGENCY_SAVE_EVENT));

            setTimeout(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');

                setUser(null);

                if (reason === 'expired' || reason === 'manual') {
                    window.location.href = `/login${reason === 'expired' ? '?reason=expired' : ''}`;
                }
            }, 300);
        }
    }, []);

    useEffect(() => {
        const currentDeviceId = getOrCreateDeviceId();
        setDeviceId(currentDeviceId);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (token) {
            try {
                const decoded = jwtDecode<UserTokenPayload>(token);
                // Fallback awal agar UI tidak blank, sembari menunggu fetchUserProfile menarik objek .computed
                setUser((prev) => prev || {
                    id: decoded.sub,
                    email: decoded.email,
                    fullName: 'Memuat data...',
                    role: decoded.role as User['role'],
                } as User);

                fetchUserProfile(true);
            } catch (e) {
                forceLogout('expired');
            }
        } else {
            setIsLoading(false);
        }

        // Cross-Component State Sync (Subscriber)
        const handleSync = (event: Event) => {
            const customEvent = event as CustomEvent<User>;
            if (customEvent.detail) {
                setUser(customEvent.detail);
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener(AUTH_SYNC_EVENT, handleSync);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener(AUTH_SYNC_EVENT, handleSync);
            }
        };
    }, [fetchUserProfile, forceLogout]);

    return {
        // Objek User Murni
        user,
        isLoading,
        deviceId,

        // Objek Diekstrak (Aman dari Ghost Error, otomatis reaktif)
        isPro,
        remainingDays,
        quota,
        isUnlimited,
        healthStatus,
        derivedStatus,

        // Aksi
        refreshUser: fetchUserProfile,
        forceLogout,
    };
}