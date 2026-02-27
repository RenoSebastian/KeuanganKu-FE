import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/axios';
import { getOrCreateDeviceId } from '@/lib/device-id';
import { EMERGENCY_SAVE_EVENT } from './use-simulation-persistence'; // [NEW] Import event constant

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
    simulationQuota: number; // Sisa Kuota (Token)
    totalUsed: number;
}

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatar?: string | null;
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

    const fetchUserProfile = useCallback(async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }
            const response = await api.get('/users/me');
            const userData: UserProfile = response.data;
            setUser(userData);
            setIsPro(userData.subscription?.status === 'ACTIVE');
            setQuota(userData.usage?.simulationQuota ?? 0);
        } catch (error: any) {
            if (error?.response?.status === 401) {
                forceLogout('expired');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    // [UPDATED] 2. Fungsi Force Logout (Data Protection Edition)
    const forceLogout = useCallback((reason: 'kicked' | 'expired' | 'manual' = 'manual') => {
        if (typeof window !== 'undefined') {

            // [STEP 1] SINYAL PENYELAMATAN DATA
            // Kirim pesan ke semua komponen yang menggunakan useSimulationPersistence
            // agar segera melakukan write ke localStorage.
            console.log("⚠️ System: Preparing data backup before logout...");
            window.dispatchEvent(new Event(EMERGENCY_SAVE_EVENT));

            // [STEP 2] JEDA EKSEKUSI (Graceful Shutdown)
            // Beri waktu 300ms agar operasi I/O localStorage selesai sebelum state dihancurkan
            setTimeout(() => {
                // Pembersihan Token & Sesi
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

    // 3. Initial Load Logic
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
                fetchUserProfile();
            } catch (e) {
                forceLogout('expired');
            }
        } else {
            setIsLoading(false);
        }
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