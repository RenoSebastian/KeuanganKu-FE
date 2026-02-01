import api from '@/lib/axios';
import {
    CreateModulePayload,
    EducationCategory,
    EducationModule,
    QuizHeader,
    UpdateModulePayload,
    UpdateModuleStatusPayload,
} from '@/lib/types/education';

// [NEW] Define Payload for Upsert Quiz
export interface UpsertQuizPayload {
    moduleId: string;
    timeLimit: number;
    passingScore: number;
    questions: {
        id?: string; // Optional for new questions
        questionText: string;
        type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
        options: {
            id?: string; // Optional for new options
            optionText: string;
            isCorrect: boolean;
        }[];
    }[];
}

// --- ADMIN ENDPOINTS ---

export const adminEducationService = {
    // 1. Module Management
    createModule: async (payload: CreateModulePayload) => {
        const { data } = await api.post<EducationModule>('/admin/education/modules', payload);
        return data;
    },

    // [ADDED] Get Single Module by ID (for Admin Edit)
    getModuleById: async (id: string) => {
        const { data } = await api.get<EducationModule>(`/admin/education/modules/${id}`);
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

    reorderSections: async (id: string, items: { id: string; order: number }[]) => {
        const { data } = await api.put(`/admin/education/modules/${id}/sections/reorder`, {
            items,
        });
        return data;
    },

    // 2. Quiz Management

    // [ADDED] Get Quiz Config (for Admin Quiz Builder Init)
    getQuizConfig: async (moduleId: string) => {
        const { data } = await api.get<UpsertQuizPayload>(`/admin/education/modules/${moduleId}/quiz`);
        return data;
    },

    // [UPDATED] Upsert Quiz (Transactional Save)
    upsertQuiz: async (payload: UpsertQuizPayload) => {
        // Menggunakan moduleId dari payload untuk membentuk URL
        const { data } = await api.put<QuizHeader>(
            `/admin/education/modules/${payload.moduleId}/quiz`,
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
};