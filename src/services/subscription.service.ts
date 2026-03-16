import api from '@/lib/axios';

// Interface pendukung
export interface SubscriptionPlan {
    id: string;
    code: string;
    name: string;
    description?: string;
    price: number;
    bonusQuota: number;
    durationMonths: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface SubscriptionOrder {
    id: string;
    userId: string;
    planId: string;
    proofImageUrl: string;
    verificationStatus: 'PENDING' | 'VALID' | 'INVALID';
    snapshotPrice: number;
    uniqueCode: number;
    plan?: SubscriptionPlan;
    createdAt: string;
}

export const subscriptionService = {
    // --- CLIENT SIDE METHODS (Existing) ---
    getPlans: async () => {
        const response = await api.get<SubscriptionPlan[]>('/subscription/plans');
        return response.data;
    },

    createOrder: async (planId: string, uniqueCode: number, file: File) => {
        const formData = new FormData();
        formData.append('planId', planId);
        formData.append('uniqueCode', uniqueCode.toString());
        formData.append('proofFile', file);

        const response = await api.post('/subscription/buy', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getMyOrders: async () => {
        const response = await api.get<SubscriptionOrder[]>('/subscription/my-orders');
        return response.data;
    },

    // --- ADMIN SIDE METHODS (PHASE 1 ENHANCED) ---

    getPendingOrders: async () => {
        const response = await api.get('/admin/subscription/pending');
        return response.data;
    },

    verifyOrder: async (payload: { orderId: string; status: 'VALID' | 'INVALID'; adminNotes?: string }) => {
        const response = await api.patch('/admin/subscription/verify', payload);
        return response.data;
    },

    // [NEW] Bulk Verification
    bulkVerifyOrders: async (payload: { orderIds: string[]; status: 'VALID' | 'INVALID'; adminNotes?: string }) => {
        const response = await api.post('/admin/subscription/bulk-verify', payload);
        return response.data;
    },

    // [NEW] Compensating Transaction / Revoke
    revokeOrder: async (payload: { orderId: string; reason: string }) => {
        const response = await api.post('/admin/subscription/revoke', payload);
        return response.data;
    }
};