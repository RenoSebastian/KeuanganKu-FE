import api from '@/lib/axios';
import {
    EducationModule,
    EducationCategory,
    EducationProgressStatus,
    QuizQuestionType,
    QuizSubmissionResult,
    SubmitQuizPayload
} from '@/lib/types/education';

// Response Wrapper untuk List Data
interface ModuleListResponse {
    data: EducationModule[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
        limit: number
    };
}

// [SECURE INTERFACE] 
// Interface ini mencerminkan output dari PublicQuizSerializer Backend.
// Field sensitif seperti 'isCorrect' dan 'explanation' DIBUANG untuk keamanan.
export interface UserQuizData {
    id: string;
    moduleId: string;
    timeLimit: number; // dalam menit
    passingScore: number;
    description?: string;
    questions: {
        id: string;
        questionText: string;
        type: QuizQuestionType;
        orderIndex: number;
        options: {
            id: string;
            optionText: string;
            // [SECURITY NOTE] Field 'isCorrect' tidak ada di sini.
            // Frontend tidak boleh tahu jawaban benar sebelum submit.
        }[];
    }[];
}

export const employeeEducationService = {

    // --- MODULE CATALOG & READING ---

    /**
     * Mengambil Katalog Materi yang berstatus PUBLISHED.
     */
    getCatalog: async (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
        const { data } = await api.get<ModuleListResponse>('/education/modules', {
            params: { ...params, status: 'PUBLISHED' }
        });
        return data;
    },

    /**
     * Mengambil daftar kategori untuk filter.
     */
    getCategories: async () => {
        const { data } = await api.get<EducationCategory[]>('/education/categories');
        return data;
    },

    /**
     * Mengambil detail satu modul berdasarkan SLUG.
     */
    getModuleBySlug: async (slug: string) => {
        const { data } = await api.get<EducationModule>(`/education/modules/${slug}`);
        return data;
    },

    /**
     * Mengupdate progress (Checkpoint).
     * Digunakan untuk set STARTED atau COMPLETED.
     */
    updateProgress: async (moduleId: string, payload: { status?: EducationProgressStatus; lastSectionId?: string }) => {
        const { data } = await api.post('/education/progress', { moduleId, ...payload });
        return data;
    },

    // --- QUIZ ENGINE (SECURE) ---

    /**
     * [SECURE] Mengambil soal kuis tanpa kunci jawaban.
     * Menggunakan interface UserQuizData yang aman.
     */
    getQuizBySlug: async (slug: string) => {
        const { data } = await api.get<UserQuizData>(`/education/modules/${slug}/quiz`);
        return data;
    },

    /**
     * Mengirim jawaban untuk dinilai di server.
     * Frontend hanya mengirim ID opsi yang dipilih, Server yang menghitung skor.
     */
    submitQuiz: async (slug: string, payload: SubmitQuizPayload) => {
        const { data } = await api.post<QuizSubmissionResult>(
            `/education/modules/${slug}/quiz/submit`,
            payload
        );
        return data;
    }
};