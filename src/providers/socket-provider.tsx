"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { BellRing, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

import { useAuthUser } from '@/hooks/use-auth-user';
import { useNotificationStore, NotificationItem } from '@/hooks/use-notification-store';
import { STORAGE_KEYS } from '@/lib/constants'; // Pastikan constants.ts memiliki definisi ini

// Helper untuk icon toast berdasarkan tipe notifikasi
const getToastIcon = (type: string) => {
    switch (type) {
        case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        case 'ERROR': return <XCircle className="w-5 h-5 text-red-500" />;
        default: return <Info className="w-5 h-5 text-blue-500" />;
    }
};

export function SocketProvider({ children }: { children: React.ReactNode }) {
    // [UPDATE] Ekstrak forceLogout dari hook untuk Fase 4
    const { user, refreshUser, forceLogout } = useAuthUser();
    const { addNotification, setConnectionStatus } = useNotificationStore();
    const socketRef = useRef<Socket | null>(null);

    // =================================================================
    // 1. CORE SOCKET ORCHESTRATION (Koneksi & Event Listener)
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
                auth: { token: `Bearer ${token}` },
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

            // [NEW] EVENT C: SINGLE CONCURRENT SESSION KICK-OUT (FASE 4)
            socketRef.current.on('force_logout', (data: any) => {
                console.warn('🚨 KICK-OUT SIGNAL RECEIVED:', data);

                // 1. Putus koneksi agar tidak re-connect otomatis
                socketRef.current?.disconnect();
                setConnectionStatus(false);

                // 2. Tampilkan UI Blocking (Persisten) via Sonner
                toast("Peringatan Keamanan Sistem", {
                    description: "Akun Anda baru saja digunakan untuk login di perangkat lain. Akses di perangkat ini segera dihentikan.",
                    icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
                    duration: 5000, // Tampilkan selama 5 detik sebelum menendang
                    style: { backgroundColor: '#fef2f2', borderColor: '#fee2e2', color: '#991b1b' },
                });

                // 3. Beri jeda sedikit agar user sempat membaca Toast, lalu tendang secara keras
                setTimeout(() => {
                    forceLogout('kicked');
                }, 2000);
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
    }, [user, addNotification, setConnectionStatus, refreshUser, forceLogout]);

    // =================================================================
    // [NEW] 2. PWA LIFECYCLE RESILIENCE (FASE 5)
    // =================================================================
    useEffect(() => {
        // Fungsi ini akan tertrigger saat user minimize aplikasi lalu membukanya lagi
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('📱 PWA Woke Up from Background. Checking session integrity...');

                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

                // Kondisi A: User buka kembali aplikasi, tapi token tiba-tiba hilang (mungkin dibersihkan tab lain)
                if (!token && window.location.pathname !== '/login') {
                    console.warn('⚠️ Token is missing on wake-up. Forcing manual logout.');
                    forceLogout('expired');
                    return;
                }

                // Kondisi B: WSS terputus karena Doze Mode OS Android/iOS, kita harus hidupkan ulang
                if (token && socketRef.current?.disconnected) {
                    console.log('🔄 Reconnecting socket after wake-up...');
                    socketRef.current.connect();

                    // Kita fetch profil terbaru berjaga-jaga jika ada perubahan data saat HP tertidur
                    refreshUser();
                }
            }
        };

        if (typeof window !== 'undefined') {
            document.addEventListener('visibilitychange', handleVisibilityChange);
            // Fallback untuk WebView lama yang tidak merespon visibilitychange
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