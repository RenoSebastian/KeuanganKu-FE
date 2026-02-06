import api from '@/lib/axios';
import {
    EducationModule,
    EducationCategory,
    EducationProgressStatus,
    QuizSubmissionResult,
    SubmitQuizPayload,
    // [FIX] Import UserQuizData dari source of truth
    UserQuizData
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

// [FIX] Hapus definisi interface lokal UserQuizData yang menyebabkan konflik
// Gunakan UserQuizData dari '@/lib/types/education' yang sudah di-import di atas.

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
     * [UPDATED] Mengupdate progress (Checkpoint).
     * Menggunakan SLUG agar sinkron dengan route PublicEducationController Backend:
     * POST /education/modules/:slug/progress
     */
    updateProgress: async (slug: string, payload: { status?: EducationProgressStatus; lastSectionId?: string }) => {
        const { data } = await api.post(`/education/modules/${slug}/progress`, payload);
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
