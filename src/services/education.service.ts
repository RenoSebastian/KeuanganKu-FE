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
import { PruneExecutionPayload, DatabaseStats } from '@/lib/types/retention';

/**
 * EDUCATION SERVICE
 * ------------------------------------------------------------------
 * Pusat kendali komunikasi data untuk Modul Edukasi.
 * Mencakup Manajemen Kategori, Modul, Kuis, serta Maintenance Database.
 * ------------------------------------------------------------------
 */
export const educationService = {

    // =================================================================
    // 1. CATEGORY MANAGEMENT (ADMIN)
    // =================================================================

    // =================================================================
    // 1. CATEGORY MANAGEMENT (ADMIN)
    // =================================================================

    /**
     * Mengambil daftar kategori. Digunakan di Admin Table dan Dropdown Filter.
     */
    async getCategories() {
        const response = await apiClient.get<EducationCategory[]>('/admin/education/categories'); // ✅ BENAR
        return response.data;
    },

    async getCategoryById(id: string) {
        const response = await apiClient.get<EducationCategory>(`/admin/education/categories/${id}`);
        return response.data;
    },

    async createCategory(payload: CreateCategoryPayload) {
        const response = await apiClient.post<EducationCategory>('/admin/education/categories', payload);
        return response.data;
    },

    async updateCategory(id: string, payload: UpdateCategoryPayload) {
        // REVISI: Penyesuaian ke PATCH untuk memenuhi kontrak routing @Patch(':id') pada EducationCategoryController
        const response = await apiClient.patch<EducationCategory>(`/admin/education/categories/${id}`, payload);
        return response.data;
    },

    async deleteCategory(id: string) {
        const response = await apiClient.delete(`/admin/education/categories/${id}`);
        return response.data;
    },

    // =================================================================
    // 2. MODULE MANAGEMENT (ADMIN)
    // =================================================================

    /**
     * List modul lengkap dengan status (Draft/Published) untuk Admin Dashboard.
     */
    async getModulesAdmin() {
        const response = await apiClient.get<EducationModule[]>('/admin/education/modules');
        return response.data;
    },

    async getModuleById(id: string) {
        const response = await apiClient.get<EducationModule>(`/admin/education/modules/${id}`);
        return response.data;
    },

    /**
     * [VERIFIED]: createModule & updateModule mendukung payload.sections 
     * dengan imageUrls: string[] untuk kompatibilitas multi-image per section.
     */
    async createModule(payload: CreateModulePayload) {
        const response = await apiClient.post<EducationModule>('/admin/education/modules', payload);
        return response.data;
    },

    async updateModule(id: string, payload: UpdateModulePayload) {
        // REVISI: Penyesuaian ke PATCH untuk memenuhi kontrak routing @Patch('modules/:id') pada AdminEducationController
        const response = await apiClient.patch<EducationModule>(`/admin/education/modules/${id}`, payload);
        return response.data;
    },

    async deleteModule(id: string) {
        const response = await apiClient.delete(`/admin/education/modules/${id}`);
        return response.data;
    },

    // --- Module Lifecycle Control ---

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

    // =================================================================
    // 3. QUIZ MANAGEMENT (ADMIN)
    // =================================================================

    /**
     * Mengambil konfigurasi kuis lengkap (termasuk kunci jawaban) untuk Admin.
     */
    async getQuizConfiguration(moduleId: string) {
        const response = await apiClient.get<Quiz>(`/admin/education/modules/${moduleId}/quiz`);
        return response.data;
    },

    /**
     * Simpan atau Update kuis. Mendukung validasi TEPAT SATU kunci jawaban di level Backend.
     */
    async upsertQuiz(moduleId: string, payload: UpsertQuizPayload) {
        const response = await apiClient.put<Quiz>(`/admin/education/modules/${moduleId}/quiz`, payload);
        return response.data;
    },

    // =================================================================
    // 4. RETENTION & MAINTENANCE (ADMIN)
    // =================================================================

    /**
     * Mendapatkan statistik kesehatan database (Storage, Row Count, Index size).
     */
    async getDatabaseStats() {
        const response = await apiClient.get<DatabaseStats>('/admin/retention/stats');
        return response.data;
    },

    /**
     * Menjalankan pembersihan data (Pruning) berdasarkan periode waktu tertentu.
     */
    async executePrune(payload: PruneExecutionPayload) {
        const response = await apiClient.post('/admin/retention/prune', payload);
        return response.data;
    },

    // =================================================================
    // 5. PUBLIC / LEARNING (USER)
    // =================================================================

    /**
     * Mengambil modul yang sudah dipublish untuk katalog user.
     */
    async getModulesPublic(params?: { category?: string; search?: string }) {
        const response = await apiClient.get<EducationModule[]>('/education/modules', { params });
        return response.data;
    },

    /**
     * Mengambil konten modul berdasarkan slug (User View).
     */
    async getModuleBySlug(slug: string) {
        const response = await apiClient.get<EducationModule>(`/education/modules/${slug}`);
        return response.data;
    },
};

// Export alias untuk menjamin backward compatibility pada komponen lama
export const adminEducationService = educationService;