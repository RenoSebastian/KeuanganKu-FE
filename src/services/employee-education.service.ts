import api from '@/lib/axios';
import {
    EducationModule, EducationCategory, EducationProgressStatus, QuizQuestionType, QuizSubmissionResult, // [NEW]
    SubmitQuizPayload
} from '@/lib/types/education';

// ... (Interface ModuleListResponse dari Fase 1 tetap ada) ...
interface ModuleListResponse {
    data: EducationModule[];
    meta: { total: number; page: number; lastPage: number; limit: number };
}

// [NEW] Interface khusus User Quiz (Zero Leakage)
// Backend harus men-strip field 'isCorrect' dan 'explanation'
export interface UserQuizData {
    id: string; // Quiz ID
    moduleId: string;
    timeLimit: number; // Menit
    passingScore: number;
    description?: string;
    questions: {
        id: string;
        questionText: string;
        type: QuizQuestionType;
        options: {
            id: string;
            optionText: string;
            // isCorrect is STRICTLY FORBIDDEN here
        }[];
    }[];
}

export const employeeEducationService = {
    // ... methods lama (getCatalog, getCategories, updateProgress) ...
    getCatalog: async (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
        const { data } = await api.get<ModuleListResponse>('/education/modules', {
            params: { ...params, status: 'PUBLISHED' }
        });
        return data;
    },

    getCategories: async () => {
        const { data } = await api.get<EducationCategory[]>('/education/categories');
        return data;
    },

    getModuleBySlug: async (slug: string) => {
        const { data } = await api.get<EducationModule>(`/education/modules/${slug}`);
        return data;
    },

    updateProgress: async (moduleId: string, payload: { status?: EducationProgressStatus; lastSectionId?: string }) => {
        const { data } = await api.post('/education/progress', { moduleId, ...payload });
        return data;
    },

    /**
     * [NEW] Fetch Quiz Questions (Secure Mode).
     * Endpoint ini mengembalikan soal tanpa kunci jawaban.
     */
    getQuizBySlug: async (slug: string) => {
        const { data } = await api.get<UserQuizData>(`/education/modules/${slug}/quiz`);
        return data;
    },

    submitQuiz: async (slug: string, payload: SubmitQuizPayload) => {
        const { data } = await api.post<QuizSubmissionResult>(
            `/education/modules/${slug}/quiz/submit`,
            payload
        );
        return data;
    }
};