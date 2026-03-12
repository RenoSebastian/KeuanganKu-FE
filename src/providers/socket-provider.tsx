"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { BellRing, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

import { useAuthUser } from '@/hooks/use-auth-user';
import { useNotificationStore, NotificationItem } from '@/hooks/use-notification-store';
import { STORAGE_KEYS } from '@/lib/constants';
import { useSystemStore } from '@/hooks/use-system-store'; // [NEW] Import System Store

const getToastIcon = (type: string) => {
    switch (type) {
        case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        case 'ERROR': return <XCircle className="w-5 h-5 text-red-500" />;
        default: return <Info className="w-5 h-5 text-blue-500" />;
    }
};

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { user, refreshUser, forceLogout } = useAuthUser();
    const { addNotification, setConnectionStatus } = useNotificationStore();

    // [NEW] Tarik tuas circuit breaker langsung dari WSS
    const { triggerSessionTermination } = useSystemStore();

    const socketRef = useRef<Socket | null>(null);

    // =================================================================
    // 1. CORE SOCKET ORCHESTRATION 
    // =================================================================
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!user || !token) {
            if (socketRef.current) {
                console.log("🔌 Socket Disconnecting (No Auth)...");
                socketRef.current.disconnect();
                socketRef.current = null;
                setConnectionStatus(false);
            }
            return;
        }

        if (!socketRef.current) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const socketUrl = apiUrl.replace('/api', '');

            socketRef.current = io(socketUrl, {
                auth: { token: token }, // ✅ FIX: Kirim raw token saja tanpa 'Bearer '
                reconnectionAttempts: 5,
                reconnectionDelay: 2000,
                transports: ['websocket'],
            });

            // --- CONNECTION EVENTS ---
            socketRef.current.on('connect', () => {
                console.log('✅ Socket Connected. ID:', socketRef.current?.id);
                setConnectionStatus(true);
            });

            socketRef.current.on('disconnect', (reason) => {
                console.warn('❌ Socket Disconnected:', reason);
                setConnectionStatus(false);
            });

            socketRef.current.on('connect_error', (err) => {
                console.error('⚠️ Socket Connection Error:', err.message);
                setConnectionStatus(false);
            });

            // --- BUSINESS LOGIC EVENTS ---

            // [MODIFIED] EVENT C: SINGLE CONCURRENT SESSION KICK-OUT
            socketRef.current.on('force_logout', (data: any) => {
                console.warn('🚨 WSS KICK-OUT SIGNAL RECEIVED:', data);

                // 1. Matikan WSS agar tidak mencoba auto-reconnect menggunakan token lama
                socketRef.current?.disconnect();
                setConnectionStatus(false);

                // 2. [CRITICAL] Aktifkan Circuit Breaker FE agar semua sisa request API (seperti pooling) terputus.
                triggerSessionTermination();

                // 3. Bersihkan memori residu dengan memanggil fungsi hook tanpa trigger redirect
                forceLogout('kicked');

                // Catatan: UX Modal "Account in Use" (Fase 3) sekarang otomatis terpicu
                // karena ia memantau state isSessionTerminated dari triggerSessionTermination().
            });

            // EVENT A: Notifikasi Baru Masuk
            socketRef.current.on('notification_new', (data: NotificationItem) => {
                addNotification(data);
                toast(data.title, {
                    description: data.message,
                    icon: getToastIcon(data.type),
                    duration: 5000,
                });

                if (data.category === 'SUBSCRIPTION' || data.category === 'QUOTA') {
                    refreshUser();
                }
            });

            // EVENT B: Force Refresh
            socketRef.current.on('force_refresh_user', () => {
                refreshUser();
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off('notification_new');
                socketRef.current.off('force_refresh_user');
                socketRef.current.off('force_logout');
                socketRef.current.disconnect();
                socketRef.current = null;
                setConnectionStatus(false);
            }
        };
    }, [user, addNotification, setConnectionStatus, refreshUser, forceLogout, triggerSessionTermination]);

    // =================================================================
    // 2. PWA LIFECYCLE RESILIENCE 
    // =================================================================
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                const { isSessionTerminated } = useSystemStore.getState();

                // [FIX] Jika status aplikasi sudah ditendang, jangan coba apa-apa saat layar menyala
                if (isSessionTerminated) return;

                if (!token && window.location.pathname !== '/login') {
                    console.warn('⚠️ Token is missing on wake-up. Forcing manual logout.');
                    forceLogout('expired');
                    return;
                }

                if (token && socketRef.current?.disconnected) {
                    console.log('🔄 Reconnecting socket after wake-up...');
                    socketRef.current.connect();
                    refreshUser();
                }
            }
        };

        if (typeof window !== 'undefined') {
            document.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('focus', handleVisibilityChange);
        }

        return () => {
            if (typeof window !== 'undefined') {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                window.removeEventListener('focus', handleVisibilityChange);
            }
        };
    }, [forceLogout, refreshUser]);

    return <>{children}</>;
}