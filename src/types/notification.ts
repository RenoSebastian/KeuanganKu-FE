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

export interface NotificationResponse {
    data: NotificationItem[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
        unreadCount: number;
    };
}