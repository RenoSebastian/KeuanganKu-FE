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
    plan?: SubscriptionPlan;
    createdAt: string;
}

export const subscriptionService = {
    // --- CLIENT SIDE METHODS (Existing) ---
    getPlans: async () => {
        const response = await api.get<SubscriptionPlan[]>('/subscription/plans');
        return response.data;
    },

    createOrder: async (planId: string, file: File) => {
        const formData = new FormData();
        formData.append('planId', planId);
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

    // --- ADMIN SIDE METHODS (NEW - Fixes TS Error 2339) ---
    getPendingOrders: async () => {
        const response = await api.get('/admin/subscription/pending');
        return response.data;
    },

    verifyOrder: async (payload: { orderId: string; status: 'VALID' | 'INVALID'; adminNotes: string }) => {
        const response = await api.patch('/admin/subscription/verify', payload);
        return response.data;
    }
};