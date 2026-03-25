// ============================================================================
// SUBSCRIPTION & QUOTA DOMAIN TYPES
// ============================================================================

import { PaginationMeta } from "./dashboard";

export type VerificationStatus = 'PENDING' | 'VALID' | 'INVALID';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'GRACE_PERIOD';

export interface SubscriptionPlan {
    id: string;
    code: string;
    name: string;
    description?: string;
    durationMonths: number;
    price: number;
    // [NEW] Penyelarasan dengan DTO Backend untuk mendukung fitur Harga Coret & Label Hemat
    originalPrice?: number;
    discountNote?: string;
    bonusQuota: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SubscriptionOrder {
    id: string;
    userId: string;
    planId: string;
    proofImageUrl: string;
    verificationStatus: VerificationStatus;
    adminNotes?: string;
    uniqueCode: number;
    // Nilai aktual transaksi setelah (price * duration) dari Master Data
    snapshotPrice: number;
    createdAt: string;
    updatedAt: string;
}

// Representasi dari relasi JOIN (include) di Prisma
export interface PendingOrder extends SubscriptionOrder {
    user: {
        id: string;
        fullName: string;
        email: string;
        agency?: { name: string };
    };
    plan: SubscriptionPlan;
}

// Wrapper paginasi untuk kebutuhan tabel / widget
export interface PaginatedPendingOrders {
    data: PendingOrder[];
    meta: PaginationMeta;
}

export interface UserSubscription {
    id: string;
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    startDate: string;
    endDate: string;
    gracePeriodEndDate?: string;
    lastOrderId: string;
    createdAt: string;
    updatedAt: string;
    plan?: SubscriptionPlan;
}

// ============================================================================
// DTOs (Data Transfer Objects) UNTUK MUTASI KE BACKEND
// ============================================================================

export interface VerifyOrderPayload {
    orderId: string;
    status: VerificationStatus;
    adminNotes?: string;
}

export interface BulkVerifyPayload {
    orderIds: string[];
    status: VerificationStatus;
    adminNotes?: string;
}

export interface RevokeOrderPayload {
    orderId: string;
    reason: string;
}

export interface ManualOverridePayload {
    userId: string;
    planId: string;
    durationMonths?: number;
    reason?: string;
}

export interface InjectQuotaPayload {
    amount: number;
    reason: string;
}