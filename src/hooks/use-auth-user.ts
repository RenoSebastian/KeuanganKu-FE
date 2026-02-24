import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/axios';

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
    // Data Penting untuk Logic Frontend
    usage?: UserUsage | null;
    subscription?: UserSubscription | null;
}

// Interface Payload Token (Minimal Data)
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

    // 1. Fungsi Fetch Data Terbaru dari Server
    const fetchUserProfile = useCallback(async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            // [CRITICAL] Panggil endpoint /me yang sudah kita update di Backend
            // Response harus mengandung object `usage` dan `subscription`
            const response = await api.get('/users/me');
            const userData: UserProfile = response.data;

            setUser(userData);

            // Update Derived State
            const activeSub = userData.subscription?.status === 'ACTIVE';
            const userQuota = userData.usage?.simulationQuota ?? 0;

            setIsPro(activeSub);
            setQuota(userQuota);

        } catch (error) {
            console.error("Gagal mengambil profil user:", error);
            // Opsional: Jika 401, bisa trigger logout atau clear local storage
            if (typeof window !== 'undefined') {
                // localStorage.removeItem('token');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 2. Initial Load Logic
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (token) {
            try {
                // [OPTIMIZATION] Decode token dulu untuk render UI dasar (Nama/Role) secepat kilat
                const decoded = jwtDecode<UserTokenPayload>(token);

                // Set initial state dari token (tanpa quota/sub dulu)
                setUser((prev) => prev || {
                    id: decoded.sub,
                    email: decoded.email,
                    fullName: 'Loading...', // Placeholder
                    role: decoded.role,
                });

                // Lalu fetch data lengkap (background sync)
                fetchUserProfile();
            } catch (e) {
                console.error("Token invalid:", e);
                setUser(null);
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, [fetchUserProfile]);

    return {
        user,           // Object User Lengkap
        isLoading,      // Status loading fetch API
        isPro,          // Boolean helper: Apakah user PRO?
        quota,          // Number helper: Sisa kuota user
        refreshUser: fetchUserProfile, // Fungsi untuk memaksa update data (misal setelah bayar/simulasi)
    };
}