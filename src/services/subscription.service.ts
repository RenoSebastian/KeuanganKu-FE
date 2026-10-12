import api from '@/lib/axios';
import {
    PaginatedPendingOrders,
    VerificationStatus,
    SubscriptionPlan,
    SubscriptionOrder
} from '@/lib/types/subscription'; // [FIX] Mengimpor entitas penuh dari sumber utama

export const subscriptionService = {
    // --- CLIENT SIDE METHODS (Existing & Enhanced) ---
    getPlans: async () => {
        const response = await api.get<SubscriptionPlan[]>('/subscription/plans');
        return response.data;
    },

    getUniqueCode: async () => {
        const response = await api.get<{ uniqueCode: number }>('/subscription/unique-code');
        return response.data;
    },

    validateVoucher: async (code: string, planId: string) => {
        const response = await api.post<{
            isValid: boolean;
            voucher: {
                id: string;
                code: string;
                name: string;
                discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
                discountValue: number;
            };
            originalPrice: number;
            discountAmount: number;
            finalPrice: number;
        }>('/subscription/vouchers/validate', { code, planId });
        return response.data;
    },

    createOrder: async (planId: string, uniqueCode: number, file: File, voucherCode?: string) => {
        const formData = new FormData();
        formData.append('planId', planId);
        formData.append('uniqueCode', uniqueCode.toString());
        formData.append('proofFile', file);
        if (voucherCode) {
            formData.append('voucherCode', voucherCode.trim().toUpperCase());
        }

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

    // Mendukung paginasi untuk kebutuhan UI Widget (Task 3)
    getPendingOrders: async (page: number = 1, limit: number = 10) => {
        const response = await api.get<PaginatedPendingOrders>('/admin/subscription/pending', {
            params: { page, limit }
        });
        return response.data;
    },

    verifyOrder: async (payload: { orderId: string; status: VerificationStatus; adminNotes?: string }) => {
        const response = await api.patch('/admin/subscription/verify', payload);
        return response.data;
    },

    // Bulk Verification
    bulkVerifyOrders: async (payload: { orderIds: string[]; status: VerificationStatus; adminNotes?: string }) => {
        const response = await api.post('/admin/subscription/bulk-verify', payload);
        return response.data;
    },

    // Compensating Transaction / Revoke
    revokeOrder: async (payload: { orderId: string; reason: string }) => {
        const response = await api.post('/admin/subscription/revoke', payload);
        return response.data;
    },

    // Voucher Management
    getAdminVouchers: async () => {
        const response = await api.get('/admin/subscription/vouchers');
        return response.data;
    },

    createAdminVoucher: async (payload: {
        code: string;
        name: string;
        discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
        discountValue: number;
        maxDiscountAmount?: number;
        minPurchaseAmount?: number;
        isActive?: boolean;
    }) => {
        const response = await api.post('/admin/subscription/vouchers', payload);
        return response.data;
    },

    updateAdminVoucher: async (id: string, payload: any) => {
        const response = await api.patch(`/admin/subscription/vouchers/${id}`, payload);
        return response.data;
    },

    toggleAdminVoucher: async (id: string) => {
        const response = await api.patch(`/admin/subscription/vouchers/${id}/toggle`);
        return response.data;
    },

    deleteAdminVoucher: async (id: string) => {
        const response = await api.delete(`/admin/subscription/vouchers/${id}`);
        return response.data;
    }
};

// [FIX] Kita tetap mengekspor tipe data agar file komponen (seperti payment-modal) 
// yang terlanjur mengimpor dari file ini tidak error (Re-exporting).
export type { SubscriptionPlan, SubscriptionOrder };