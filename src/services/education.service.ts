// src/services/education.service.ts
import api from '@/lib/axios'; // Menggunakan instance global Anda
import {
    CreateModulePayload,
    EducationCategory,
    EducationModule,
    QuizHeader,
    UpdateModulePayload,
    UpdateModuleStatusPayload,
    UpsertQuizPayload,
} from '@/lib/types/education';

// --- ADMIN ENDPOINTS ---

export const adminEducationService = {
    // 1. Module Management
    createModule: async (payload: CreateModulePayload) => {
        const { data } = await api.post<EducationModule>('/admin/education/modules', payload);
        return data;
    },

    updateModule: async (id: string, payload: UpdateModulePayload) => {
        const { data } = await api.patch<EducationModule>(`/admin/education/modules/${id}`, payload);
        return data;
    },

    updateStatus: async (id: string, payload: UpdateModuleStatusPayload) => {
        const { data } = await api.patch<EducationModule>(
            `/admin/education/modules/${id}/status`,
            payload
        );
        return data;
    },

    deleteModule: async (id: string) => {
        const { data } = await api.delete(`/admin/education/modules/${id}`);
        return data;
    },

    reorderSections: async (id: string, items: { sectionId: string; newOrder: number }[]) => {
        const { data } = await api.post(`/admin/education/modules/${id}/reorder-sections`, {
            items,
        });
        return data;
    },

    // 2. Quiz Management (Transactional)
    upsertQuiz: async (moduleId: string, payload: UpsertQuizPayload) => {
        const { data } = await api.put<QuizHeader>(
            `/admin/education/modules/${moduleId}/quiz`,
            payload
        );
        return data;
    },
};

// --- PUBLIC/COMMON ENDPOINTS ---

export const publicEducationService = {
    getCategories: async () => {
        const { data } = await api.get<EducationCategory[]>('/education/categories');
        return data;
    },

    getModules: async (params?: { page?: number; limit?: number; category?: string }) => {
        const { data } = await api.get<{
            data: EducationModule[];
            meta: { total: number; page: number; lastPage: number };
        }>('/education/modules', { params });
        return data;
    },

    getModuleBySlug: async (slug: string) => {
        const { data } = await api.get<EducationModule>(`/education/modules/${slug}`);
        return data;
    },

    // Fetch Quiz untuk Mode Edit Admin (Bukan untuk User mengerjakan)
    // Backend endpoint ini belum ada di PublicController, 
    // Admin menggunakan data dari `getModuleBySlug` yang sudah include `quiz` (jika logic BE mengizinkan)
    // ATAU kita perlu endpoint khusus GET /admin/education/modules/:id/quiz 
    // (Asumsi: di admin-education.controller.ts belum ada GET quiz spesifik, 
    // kita bisa pakai data dari findOne module jika include quiz sudah ada).

    // NOTE: Untuk keamanan, Admin sebaiknya fetch lewat module detail
    // Jika butuh endpoint khusus, tambahkan di BE. Untuk sekarang kita pakai data Module.
};