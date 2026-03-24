import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/axios';
import { getOrCreateDeviceId } from '@/lib/device-id';
import { EMERGENCY_SAVE_EVENT } from './use-simulation-persistence';

// [FASE 3] Event identifier untuk sinkronisasi antar komponen
export const AUTH_SYNC_EVENT = 'AUTH_USER_SYNC_EVENT';

// =================================================================
// TYPE DEFINITIONS (Matching Backend Response)
// =================================================================

export interface UserSubscription {
    id: string;
    status: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'REVOKED' | 'CANCELLED';
    startDate: string;
    endDate: string;
    plan?: {
        id: string;
        name: string;
        price: number;
    };
}

export interface UserUsage {
    simulationQuota: number;
    totalUsed: number;
}

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatar?: string | null;
    // [FASE 1 & 3] Penambahan properti baru agar sinkron dengan entitas Backend & DTO
    phoneNumber?: string | null;
    nip?: string | null;
    goals?: string | null;
    companyName?: string | null;
    agencyName?: string | null;
    agentLevel?: string | null;
    dateOfBirth?: string | null;
    unitKerja?: {
        id: string;
        namaUnit: string;
        kodeUnit: string;
    };
    usage?: UserUsage | null;
    subscription?: UserSubscription | null;
}

export interface UserTokenPayload {
    sub: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

// =================================================================
// HOOK IMPLEMENTATION
// =================================================================

export function useAuthUser() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPro, setIsPro] = useState(false);
    const [quota, setQuota] = useState(0);
    const [deviceId, setDeviceId] = useState<string>('');

    // [FASE 3] Refaktor dengan parameter broadcast untuk reaktivitas global
    const fetchUserProfile = useCallback(async (broadcast = true) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            // [FASE 3] Cache Busting: Memastikan browser tidak menyajikan stale cache dari memory
            // Parameter _t (timestamp) memaksa jaringan untuk selalu meminta resource segar dari server
            const response = await api.get(`/users/me?_t=${Date.now()}`);
            const userData: UserProfile = response.data;

            setUser(userData);
            setIsPro(userData.subscription?.status === 'ACTIVE');
            setQuota(userData.usage?.simulationQuota ?? 0);

            // [FASE 3] Cross-Component State Sync (Publisher)
            // Memancarkan payload terbaru agar komponen lain (Header/Sidebar) yang memakai hook ini ikut terupdate
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

    // Fungsi Force Logout (Data Protection Edition)
    const forceLogout = useCallback((reason: 'kicked' | 'expired' | 'manual' = 'manual') => {
        if (typeof window !== 'undefined') {

            // Sinyal Penyelamatan Data
            console.log("⚠️ System: Preparing data backup before logout...");
            window.dispatchEvent(new Event(EMERGENCY_SAVE_EVENT));

            // Jeda Eksekusi (Graceful Shutdown)
            setTimeout(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');

                setUser(null);
                setIsPro(false);
                setQuota(0);

                if (reason === 'expired' || reason === 'manual') {
                    window.location.href = `/login${reason === 'expired' ? '?reason=expired' : ''}`;
                }
            }, 300);
        }
    }, []);

    // Initial Load & Cross-Component Sync Listener
    useEffect(() => {
        const currentDeviceId = getOrCreateDeviceId();
        setDeviceId(currentDeviceId);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (token) {
            try {
                const decoded = jwtDecode<UserTokenPayload>(token);
                setUser((prev) => prev || {
                    id: decoded.sub,
                    email: decoded.email,
                    fullName: 'Loading...',
                    role: decoded.role,
                });

                // Fetch data initial
                fetchUserProfile(true);
            } catch (e) {
                forceLogout('expired');
            }
        } else {
            setIsLoading(false);
        }

        // [FASE 3] Cross-Component State Sync (Subscriber)
        // Mendengarkan jika ada instance hook lain (misal di ProfilePage) yang baru saja berhasil fetch data baru
        const handleSync = (event: Event) => {
            const customEvent = event as CustomEvent<UserProfile>;
            if (customEvent.detail) {
                setUser(customEvent.detail);
                setIsPro(customEvent.detail.subscription?.status === 'ACTIVE');
                setQuota(customEvent.detail.usage?.simulationQuota ?? 0);
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
        user,
        isLoading,
        isPro,
        quota,
        deviceId,
        refreshUser: fetchUserProfile,
        forceLogout,
    };
}