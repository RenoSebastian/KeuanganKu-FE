import api from "@/lib/axios";

// Sesuaikan dengan Model Prisma Backend
export interface SubscriptionPlan {
    id: string;
    code: string;
    name: string;
    description: string;
    durationMonths: number;
    price: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SubscriptionOrder {
    id: string;
    plan: SubscriptionPlan;
    proofImageUrl?: string; // Optional karena bisa nullable di DB
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

    // Kirim bukti pembayaran (Create Order & Upload)
    // Menggunakan FormData karena Backend mengharapkan Multipart File
    createOrder: async (planId: string, file: File) => {
        const formData = new FormData();
        formData.append('planId', planId);
        formData.append('proofFile', file); // Key harus sesuai dengan @UseInterceptors(FileInterceptor('proofFile')) di Backend

        const response = await api.post("/subscription/buy", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Ambil riwayat transaksi user
    getMyOrders: async () => {
        const response = await api.get<SubscriptionOrder[]>("/subscription/orders");
        return response.data;
    }
};