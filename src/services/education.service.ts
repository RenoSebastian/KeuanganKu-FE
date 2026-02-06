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
    DatabaseStats,
} from '@/lib/types/education';
import { PruneExecutionPayload } from '@/lib/types/retention';

/**
 * EDUCATION SERVICE (UPDATED)
 * Sinkron dengan DTO education.ts dan kebutuhan Page Admin
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

    async getModuleById(id: string) {
        // [NOTE] Digunakan oleh Admin Edit Page
        // Endpoint ini harusnya admin-specific jika ada data sensitif, 
        // tapi public endpoint juga bisa dipakai jika datanya sama.
        // Kita gunakan endpoint Admin untuk keamanan.
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

    // Endpoint khusus untuk mengubah status (Publish/Draft)
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

    // [CRITICAL FIX] Method ini yang dicari oleh page.tsx
    async getQuizConfiguration(moduleId: string) {
        const response = await apiClient.get<Quiz>(`/admin/education/modules/${moduleId}/quiz`);
        return response.data;
    },

    async upsertQuiz(moduleId: string, payload: UpsertQuizPayload) {
        const response = await apiClient.put<Quiz>(`/admin/education/modules/${moduleId}/quiz`, payload);
        return response.data;
    },

    // =================================================================
    // 4. RETENTION & MAINTENANCE (ADMIN)
    // =================================================================

    async getDatabaseStats() {
        const response = await apiClient.get<DatabaseStats>('/admin/retention/stats');
        return response.data;
    },

    // [CRITICAL FIX] Menggunakan nama method executePrune sesuai interface
    async executePrune(payload: PruneExecutionPayload) {
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

// Export alias jika ada komponen lama yang import 'adminEducationService'
export const adminEducationService = educationService;
