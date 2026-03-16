import api from '@/lib/axios';

// Interface pendukung
export interface SubscriptionPlan {
    id: string;
    code: string;
    name: string;
    price: number;
    bonusQuota: number;
    durationMonths: number;
}

export interface SubscriptionOrder {
    id: string;
    userId: string;
    planId: string;
    proofImageUrl: string;
    verificationStatus: 'PENDING' | 'VALID' | 'INVALID';
    snapshotPrice: number;
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
        formData.append('file', file);

        const response = await api.post('/subscription/order', formData, {
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
        const response = await api.post('/admin/subscription/verify', payload);
        return response.data;
    }
};