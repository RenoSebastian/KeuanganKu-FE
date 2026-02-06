import api from '@/lib/axios';
import {
    DatabaseStats,
    ExportQuery,
    PruneExecutionPayload, // [FIX] Menggunakan nama tipe yang benar sesuai retention.ts
    PruneResponse
} from '@/lib/types/retention';

/**
 * Service untuk menangani komunikasi dengan Retention Module di Backend.
 * Mengikuti pola Repository untuk memisahkan logic API dari UI Components.
 */
export const MaintenanceService = {

    /**
     * Mengambil statistik penggunaan storage database per tabel.
     * Endpoint: GET /admin/retention/stats
     */
    getStats: async (): Promise<DatabaseStats> => {
        const response = await api.get<DatabaseStats>('/admin/retention/stats');
        return response.data;
    },

    /**
     * Membuat URL untuk download file export.
     * PENTING: Kita tidak me-request via Axios (Blob) untuk menghindari Out of Memory di Browser.
     * URL ini akan digunakan oleh UI untuk memicu native browser download stream.
     */
    getExportUrl: (query: ExportQuery): string => {
        // Menggunakan instance axios untuk mendapatkan baseURL yang benar
        const baseURL = api.defaults.baseURL || '';
        const params = new URLSearchParams({
            entityType: query.entityType,
            cutoffDate: query.cutoffDate,
        });

        // Construct Direct Link: {API_URL}/admin/retention/export?...
        // Token otentikasi (Bearer) harus ditangani terpisah jika download via browser URL langsung.
        // *Strategy Note:* Biasanya endpoint download butuh presigned URL atau cookie auth.
        // Jika backend mengharuskan Bearer Auth header, kita tidak bisa pakai window.location biasa
        // tanpa cookie. 
        // ASUMSI ARCHITECT: Karena kita menggunakan Axios Interceptor untuk auth, 
        // jika kita butuh download via browser, kita mungkin perlu pass token via query param (kurang aman)
        // atau menggunakan fetch dengan stream reader (lebih kompleks tapi aman).
        // Untuk tahap ini, kita return path relatif, logic download dengan Auth Header 
        // akan ditangani di 'use-secure-export.ts' nanti menggunakan fetch API + Blob stream.

        return `/admin/retention/export?${params.toString()}`;
    },

    /**
     * Mengeksekusi penghapusan data permanen.
     * Endpoint: DELETE /admin/retention/prune
     */
    executePrune: async (payload: PruneExecutionPayload): Promise<PruneResponse> => {
        // [FIX] Menggunakan tipe PruneExecutionPayload pada parameter
        const response = await api.delete<PruneResponse>('/admin/retention/prune', {
            data: payload, // Body request untuk DELETE method
        });
        return response.data;
    },
};
