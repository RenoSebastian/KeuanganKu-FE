// File: src/services/subscription.service.ts
import api from "@/lib/axios";

export interface SubscriptionPlan {
    id: string;
    code: string;
    name: string;
    description: string;
    durationMonths: number;
    price: number;
}

export interface SubscriptionOrder {
    id: string;
    plan: SubscriptionPlan;
    proofImageUrl: string;
    verificationStatus: 'PENDING' | 'VALID' | 'INVALID';
    snapshotPrice: number;
    adminNotes?: string;
    createdAt: string;
}

export const subscriptionService = {
    // Ambil daftar paket yang tersedia
    getPlans: async () => {
        const response = await api.get<SubscriptionPlan[]>("/subscription/plans");
        return response.data;
    },

    // Kirim bukti pembayaran (Create Order)
    createOrder: async (planId: string, proofImage: string) => {
        const response = await api.post("/subscription/orders", {
            planId,
            proofImageUrl: proofImage
        });
        return response.data;
    },

    // Ambil riwayat transaksi user
    getMyOrders: async () => {
        const response = await api.get<SubscriptionOrder[]>("/subscription/orders");
        return response.data;
    }
};