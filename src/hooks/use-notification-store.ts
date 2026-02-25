import { create } from 'zustand';

// Tipe Data Sesuai Prisma Schema Backend
export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
export type NotificationCategory = 'SUBSCRIPTION' | 'QUOTA' | 'SYSTEM' | 'PAYMENT';

export interface NotificationItem {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    category: NotificationCategory;
    isRead: boolean;
    metadata?: Record<string, any>;
    createdAt: string; // ISO Date String
}

interface NotificationState {
    notifications: NotificationItem[];
    unreadCount: number;
    isConnected: boolean; // Status koneksi socket

    // --- ACTIONS ---
    setConnectionStatus: (status: boolean) => void;

    // Digunakan saat initial load (fetch dari API)
    setNotifications: (notifications: NotificationItem[]) => void;

    // Digunakan saat ada notifikasi real-time masuk
    addNotification: (notification: NotificationItem) => void;

    // Digunakan saat user klik "Mark as Read"
    markAsRead: (id: string) => void;

    // Digunakan saat user klik "Mark All Read"
    markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    isConnected: false,

    setConnectionStatus: (status) => set({ isConnected: status }),

    setNotifications: (data) => set({
        notifications: data,
        unreadCount: data.filter((n) => !n.isRead).length
    }),

    addNotification: (newItem) => set((state) => ({
        // Tambahkan item baru di paling atas (unshift logic)
        notifications: [newItem, ...state.notifications],
        unreadCount: state.unreadCount + 1,
    })),

    markAsRead: (id) => set((state) => {
        const updatedList = state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
        );
        return {
            notifications: updatedList,
            unreadCount: updatedList.filter((n) => !n.isRead).length
        };
    }),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0
    })),
}));