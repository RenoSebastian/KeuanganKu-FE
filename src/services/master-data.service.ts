import api from '@/lib/axios';

// ============================================================================
// DATA CONTRACTS
// ============================================================================

export interface GlobalMarketSettings {
    id: string;
    inflationRate: number;
    interestRate: number;
    riskFreeRate: number;
    goldPrice: number;
    updatedAt: string;
}

// [REFACTORED] Kita pertahankan nama interface agar UI tidak error
export interface UnitKerja {
    id: string;
    kodeUnit: string;
    namaUnit: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateUnitPayload {
    kodeUnit: string;
    namaUnit: string;
}

export interface UpdateUnitPayload {
    kodeUnit?: string;
    namaUnit?: string;
}

export const masterDataService = {
    // ========================================================================
    // GLOBAL MARKET SETTINGS
    // ========================================================================
    getMarketSettings: async () => {
        // [FIXED] Menyesuaikan URL dengan Controller Backend
        const response = await api.get<{ data: GlobalMarketSettings }>('/admin/master-data/settings');
        return response.data.data || response.data;
    },

    updateMarketSettings: async (data: Partial<GlobalMarketSettings>) => {
        // [FIXED] Menyesuaikan URL dengan Controller Backend
        const response = await api.patch<{ message: string; data: GlobalMarketSettings }>('/admin/master-data/settings', data);
        return response.data.data || response.data;
    },

    // ========================================================================
    // AGENCIES (UNIT KERJA) - ADAPTER PATTERN
    // ========================================================================

    getAllUnits: async (): Promise<UnitKerja[]> => {
        try {
            // [FIXED] Menggunakan path lengkap sesuai controller: /admin/master-data/agencies
            const response = await api.get('/admin/master-data/agencies');
            const agencies = response.data?.data || response.data || [];

            return agencies.map((agency: any) => ({
                id: agency.id,
                kodeUnit: agency.code,
                namaUnit: agency.name,
                createdAt: agency.createdAt,
                updatedAt: agency.updatedAt
            }));
        } catch (error) {
            console.error("Gagal mengambil data agency:", error);
            return [];
        }
    },

    createUnit: async (data: CreateUnitPayload): Promise<UnitKerja> => {
        const backendPayload = {
            code: data.kodeUnit,
            name: data.namaUnit
        };

        // [FIXED] Path disesuaikan
        const response = await api.post('/admin/master-data/agencies', backendPayload);
        const agency = response.data?.data || response.data;

        return {
            id: agency.id,
            kodeUnit: agency.code,
            namaUnit: agency.name,
            createdAt: agency.createdAt,
            updatedAt: agency.updatedAt
        };
    },

    updateUnit: async (id: string, data: UpdateUnitPayload): Promise<UnitKerja> => {
        const backendPayload: Record<string, string> = {};
        if (data.kodeUnit) backendPayload.code = data.kodeUnit;
        if (data.namaUnit) backendPayload.name = data.namaUnit;

        // [FIXED] Path disesuaikan
        const response = await api.patch(`/admin/master-data/agencies/${id}`, backendPayload);
        const agency = response.data?.data || response.data;

        return {
            id: agency.id,
            kodeUnit: agency.code,
            namaUnit: agency.name,
            createdAt: agency.createdAt,
            updatedAt: agency.updatedAt
        };
    },

    deleteUnit: async (id: string) => {
        // [FIXED] Path disesuaikan
        const response = await api.delete<{ message: string; id: string }>(`/admin/master-data/agencies/${id}`);
        return response.data;
    },
};