"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { BellRing, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

import { useAuthUser } from '@/hooks/use-auth-user';
import { useNotificationStore, NotificationItem } from '@/hooks/use-notification-store';

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
    const { user, refreshUser } = useAuthUser();
    const { addNotification, setConnectionStatus } = useNotificationStore();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // 1. Cek Ketersediaan Token & User
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

        // 2. Inisialisasi Socket (Singleton Pattern via Ref)
        if (!socketRef.current) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            // Hapus '/api' jika ada di env var, karena socket biasanya di root atau path khusus
            // Asumsi default nestjs gateway ada di root namespace
            const socketUrl = apiUrl.replace('/api', '');

            socketRef.current = io(socketUrl, {
                auth: { token: `Bearer ${token}` }, // Kirim token untuk validasi di Gateway
                reconnectionAttempts: 5,
                reconnectionDelay: 2000,
                transports: ['websocket'], // Prioritaskan websocket
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

            // EVENT A: Notifikasi Baru Masuk
            socketRef.current.on('notification_new', (data: NotificationItem) => {
                console.log('🔔 New Notification Received:', data);

                // 1. Masukkan ke Store (Update Badge Lonceng)
                addNotification(data);

                // 2. Munculkan Toast (Pop-up Interaktif)
                toast(data.title, {
                    description: data.message,
                    icon: getToastIcon(data.type),
                    duration: 5000,
                    // Opsional: Bunyi notifikasi bisa ditambahkan di sini
                });

                // 3. Jika kategori SUBSCRIPTION atau QUOTA, refresh data user otomatis
                //    Ini agar status PRO / Sisa Kuota di sidebar langsung update
                if (data.category === 'SUBSCRIPTION' || data.category === 'QUOTA') {
                    console.log('🔄 Triggering User Data Refresh due to notification...');
                    refreshUser();
                }
            });

            // EVENT B: Force Refresh (Opsional, trigger manual dari admin)
            socketRef.current.on('force_refresh_user', () => {
                refreshUser();
            });
        }

        // Cleanup saat unmount / logout
        return () => {
            if (socketRef.current) {
                socketRef.current.off('notification_new');
                socketRef.current.off('force_refresh_user');
                socketRef.current.disconnect();
                socketRef.current = null;
                setConnectionStatus(false);
            }
        };
    }, [user, addNotification, setConnectionStatus, refreshUser]);

    return <>{children}</>;
}