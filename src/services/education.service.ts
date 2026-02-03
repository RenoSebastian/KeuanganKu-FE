import apiClient from '@/lib/axios';
import {
    EducationCategory,
    CreateCategoryPayload,
    UpdateCategoryPayload,
    EducationModule,
    CreateModulePayload,
    UpdateModulePayload,
    UpsertQuizPayload,
    Quiz,
} from '@/lib/types/education';
import {PruneExecutionPayload } from '@/lib/types/retention';

// Tambahkan export pada interface yang ada
export interface DatabaseStats {
    tables: {
        tableName: string;
        rowCount: number;
        totalBytes: number;
        formattedSize: string;
        indexBytes: number;
    }[];
    totalDatabaseSize: number;
    formattedTotalSize: string;
}

// [FIX] Ensure this is exported
export interface PruneExecutionPayload {
    entityType: string;
    cutoffDate: string;
    pruneToken: string;
}

/**
 * EDUCATION SERVICE
 * Mengelola semua komunikasi HTTP ke endpoint /education dan /retention.
 * ------------------------------------------------------------------
 * Service ini mencakup:
 * 1. Manajemen Kategori (Admin)
 * 2. Manajemen Modul & Konten (Admin)
 * 3. Manajemen Kuis (Admin)
 * 4. Fitur Publik (User)
 * 5. Retention & Maintenance (Admin)
 * ------------------------------------------------------------------
 */

export const educationService = {

    // =================================================================
    // 1. CATEGORY MANAGEMENT (ADMIN)
    // =================================================================

    async getCategories() {
        // Digunakan oleh Admin (CRUD) dan User (Filter)
        const response = await apiClient.get<EducationCategory[]>('/education/categories');
        return response.data;
    },

    async getCategoryById(id: string) {
        const response = await apiClient.get<EducationCategory>(`/education/categories/${id}`);
        return response.data;
    },

    async createCategory(payload: CreateCategoryPayload) {
        const response = await apiClient.post<EducationCategory>('/admin/education/categories', payload);
        return response.data;
    },

    async updateCategory(id: string, payload: UpdateCategoryPayload) {
        const response = await apiClient.put<EducationCategory>(`/admin/education/categories/${id}`, payload);
        return response.data;
    },

    async deleteCategory(id: string) {
        const response = await apiClient.delete(`/admin/education/categories/${id}`);
        return response.data;
    },

    // =================================================================
    // 2. MODULE MANAGEMENT (ADMIN)
    // =================================================================

    async getModulesAdmin() {
        // List modul lengkap untuk table admin
        const response = await apiClient.get<EducationModule[]>('/admin/education/modules');
        return response.data;
    },

    async getModuleDetailAdmin(id: string) {
        // Detail modul untuk form edit
        const response = await apiClient.get<EducationModule>(`/admin/education/modules/${id}`);
        return response.data;
    },

    async createModule(payload: CreateModulePayload) {
        const response = await apiClient.post<EducationModule>('/admin/education/modules', payload);
        return response.data;
    },

    async updateModule(id: string, payload: UpdateModulePayload) {
        const response = await apiClient.put<EducationModule>(`/admin/education/modules/${id}`, payload);
        return response.data;
    },

    async deleteModule(id: string) {
        const response = await apiClient.delete(`/admin/education/modules/${id}`);
        return response.data;
    },

    // Endpoint khusus untuk mengubah status (Publish/Draft/Archive)
    async publishModule(id: string) {
        const response = await apiClient.patch<EducationModule>(`/admin/education/modules/${id}/status`, {
            status: 'PUBLISHED'
        });
        return response.data;
    },

    async unpublishModule(id: string) {
        const response = await apiClient.patch<EducationModule>(`/admin/education/modules/${id}/status`, {
            status: 'DRAFT'
        });
        return response.data;
    },

    async reorderSections(id: string, items: { sectionId: string; newOrder: number }[]) {
        const response = await apiClient.put(`/admin/education/modules/${id}/sections/reorder`, {
            items,
        });
        return response.data;
    },

    // =================================================================
    // 3. QUIZ MANAGEMENT (ADMIN)
    // =================================================================

    async getQuizConfiguration(moduleId: string) {
        // Mengambil konfigurasi kuis yang sudah ada (untuk inisialisasi form builder)
        const response = await apiClient.get<Quiz>(`/admin/education/modules/${moduleId}/quiz`);
        return response.data;
    },

    async upsertQuiz(moduleId: string, payload: UpsertQuizPayload) {
        // Membuat atau memperbarui kuis secara transaksional
        const response = await apiClient.put<Quiz>(`/admin/education/modules/${moduleId}/quiz`, payload);
        return response.data;
    },

    // =================================================================
    // 4. RETENTION & MAINTENANCE (ADMIN)
    // =================================================================

    async getDatabaseStats() {
        // Mengambil statistik penggunaan storage database
        const response = await apiClient.get<DatabaseStats>('/admin/retention/stats');
        return response.data;
    },

    async executePrune(payload: PruneExecutionPayload) {
        // Eksekusi pembersihan data (Garbage Collection)
        const response = await apiClient.post('/admin/retention/prune', payload);
        return response.data;
    },

    // =================================================================
    // 5. PUBLIC / LEARNING (USER)
    // =================================================================

    async getModulesPublic(params?: { category?: string; search?: string }) {
        const response = await apiClient.get<EducationModule[]>('/education/modules', { params });
        return response.data;
    },

    async getModuleBySlug(slug: string) {
        const response = await apiClient.get<EducationModule>(`/education/modules/${slug}`);
        return response.data;
    },
};