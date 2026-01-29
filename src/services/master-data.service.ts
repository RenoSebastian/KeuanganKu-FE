import api from '@/lib/axios';

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
    // Ambil semua unit kerja (untuk Dropdown & Table)
    getAllUnits: async () => {
        const response = await api.get<UnitKerja[]>('/master-data/units');
        return response.data;
    },

    // Tambah Unit Kerja Baru
    createUnit: async (data: CreateUnitPayload) => {
        const response = await api.post<UnitKerja>('/master-data/units', data);
        return response.data;
    },

    // Update Unit Kerja
    updateUnit: async (id: string, data: UpdateUnitPayload) => {
        const response = await api.patch<UnitKerja>(`/master-data/units/${id}`, data);
        return response.data;
    },

    // Hapus Unit Kerja
    deleteUnit: async (id: string) => {
        const response = await api.delete<{ message: string; id: string }>(`/master-data/units/${id}`);
        return response.data;
    },
};