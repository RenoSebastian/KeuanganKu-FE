"use client";

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { BellRing, CheckCircle2, AlertTriangle, XCircle, Info, RefreshCw } from 'lucide-react';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) return { socket: null, isConnected: false };
    return context;
};

import { useAuthUser } from '@/hooks/use-auth-user';
import { useNotificationStore, NotificationItem } from '@/hooks/use-notification-store';
import { STORAGE_KEYS } from '@/lib/constants';
import { useSystemStore } from '@/hooks/use-system-store';
import { authService } from '@/services/auth.service';

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

    // Tarik tuas circuit breaker langsung dari WSS
    const { triggerSessionTermination } = useSystemStore();

    const socketRef = useRef<Socket | null>(null);
    const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

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
                auth: { token: token }, // Kirim raw token saja tanpa 'Bearer '
                reconnectionAttempts: 5,
                reconnectionDelay: 2000,
                transports: ['websocket'],
            });

            setSocketInstance(socketRef.current);

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

            // EVENT C: SINGLE CONCURRENT SESSION KICK-OUT
            socketRef.current.on('force_logout', (data: any) => {
                console.warn('🚨 WSS KICK-OUT SIGNAL RECEIVED:', data);

                // 1. Matikan WSS agar tidak mencoba auto-reconnect menggunakan token lama
                socketRef.current?.disconnect();
                setConnectionStatus(false);

                // 2. Aktifkan Circuit Breaker FE agar semua sisa request API terputus.
                triggerSessionTermination();

                // 3. Bersihkan memori residu dengan memanggil fungsi hook
                forceLogout('kicked');
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

            // [FASE 2 NEW] EVENT D: State Synchronization from Admin Mutation
            socketRef.current.on('USER_PROFILE_MUTATED', (data: any) => {
                console.log('🔄 Sinyal Sinkronisasi Profil Diterima:', data);

                // Memicu silent re-fetch di background
                refreshUser();

                // Jika event dipicu oleh admin, berikan feedback ke user
                if (data?.triggerBy === 'ADMIN') {
                    toast.success("Profil Diperbarui Admin", {
                        description: "Data profil Anda baru saja disinkronkan oleh Administrator sistem.",
                        icon: <RefreshCw className="w-4 h-4 text-blue-500 animate-spin-slow" />,
                        duration: 4000,
                    });
                }
            });

            // EVENT: Admin Dashboard Real-time Metrics (Pembayaran Baru)
            socketRef.current.on('NEW_PAYMENT_ORDER', (data: any) => {
                toast("Pesanan Baru Masuk!", {
                    description: `${data.planName} - Rp ${data.snapshotPrice.toLocaleString('id-ID')}`,
                    icon: <BellRing className="w-5 h-5 text-indigo-500" />,
                    duration: 5000,
                });
                window.dispatchEvent(new CustomEvent('REFRESH_ADMIN_DASHBOARD'));
            });

            // EVENT: Admin Dashboard Real-time Metrics (Pembayaran Diproses admin lain)
            socketRef.current.on('PAYMENT_ORDER_PROCESSED', (data: any) => {
                window.dispatchEvent(new CustomEvent('REFRESH_ADMIN_DASHBOARD'));
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off('notification_new');
                socketRef.current.off('force_refresh_user');
                socketRef.current.off('force_logout');
                socketRef.current.off('USER_PROFILE_MUTATED'); // Cleanup listener baru
                socketRef.current.off('NEW_PAYMENT_ORDER');
                socketRef.current.off('PAYMENT_ORDER_PROCESSED');
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocketInstance(null);
                setConnectionStatus(false);
            }
        };
    }, [user, addNotification, setConnectionStatus, refreshUser, forceLogout, triggerSessionTermination]);

    // =================================================================
    // 2. PWA LIFECYCLE & HEARTBEAT RESILIENCE (REDIS)
    // =================================================================
    useEffect(() => {
        let heartbeatInterval: NodeJS.Timeout | null = null;

        const startHeartbeat = () => {
            if (heartbeatInterval) return;

            authService.sendHeartbeat();

            heartbeatInterval = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    authService.sendHeartbeat();
                }
            }, 45000);
        };

        const stopHeartbeat = () => {
            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
                heartbeatInterval = null;
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                const { isSessionTerminated } = useSystemStore.getState();

                if (isSessionTerminated) {
                    stopHeartbeat();
                    return;
                }

                if (!token && window.location.pathname !== '/login') {
                    console.warn('⚠️ Token is missing on wake-up. Forcing manual logout.');
                    stopHeartbeat();
                    forceLogout('expired');
                    return;
                }

                if (token && socketRef.current?.disconnected) {
                    console.log('🔄 Reconnecting socket after wake-up...');
                    socketRef.current.connect();
                    refreshUser();
                }

                if (token) {
                    startHeartbeat();
                }
            } else {
                stopHeartbeat();
            }
        };

        if (typeof window !== 'undefined') {
            document.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('focus', handleVisibilityChange);

            const token = localStorage.getItem('token');
            if (token && document.visibilityState === 'visible' && !useSystemStore.getState().isSessionTerminated) {
                startHeartbeat();
            }
        }

        return () => {
            if (typeof window !== 'undefined') {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                window.removeEventListener('focus', handleVisibilityChange);
            }
            stopHeartbeat();
        };
    }, [forceLogout, refreshUser]);

    const connectionStatus = useNotificationStore(state => state.isConnected);

    return (
        <SocketContext.Provider value={{ socket: socketInstance, isConnected: connectionStatus }}>
            {children}
        </SocketContext.Provider>
    );
}