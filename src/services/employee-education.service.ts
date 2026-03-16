import apiClient from '@/lib/axios';
import {
    EducationModule,
    EducationCategory,
    EducationProgressStatus,
    QuizSubmissionResult,
    SubmitQuizPayload,
    UserQuizData
} from '@/lib/types/education';

// Response Wrapper untuk List Data dengan Meta Pagination
interface ModuleListResponse {
    data: EducationModule[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
        limit: number
    };
}

/**
 * EMPLOYEE EDUCATION SERVICE
 * ------------------------------------------------------------------
 * Gateway untuk akses materi edukasi dan kuis bagi user/karyawan.
 * Berinteraksi dengan PublicEducationController di Backend.
 * ------------------------------------------------------------------
 */
export const employeeEducationService = {

    // --- MODULE CATALOG & READING ---

    /**
     * Mengambil Katalog Materi yang berstatus PUBLISHED.
     * Menggunakan filter status di sisi client untuk menjamin hanya data publik yang tampil.
     */
    getCatalog: async (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
        const { data } = await apiClient.get<ModuleListResponse>('/education/modules', {
            // Merge params dengan default status 'PUBLISHED'
            params: {
                page: 1,
                limit: 10,
                ...params,
                status: 'PUBLISHED'
            }
        });
        return data;
    },

    /**
     * Mengambil daftar kategori aktif untuk filter di catalog UI.
     */
    getCategories: async () => {
        const { data } = await apiClient.get<EducationCategory[]>('/education/categories');
        return data;
    },

    /**
     * Mengambil detail satu modul berdasarkan SLUG.
     * Digunakan saat user masuk ke halaman baca materi.
     */
    getModuleBySlug: async (slug: string) => {
        const { data } = await apiClient.get<EducationModule>(`/education/modules/${slug}`);
        return data;
    },

    /**
     * Mengupdate progress baca (Checkpoint).
     * Memastikan backend mencatat section terakhir yang dibaca user.
     */
    updateProgress: async (slug: string, payload: { status?: EducationProgressStatus; lastSectionId?: string }) => {
        const { data } = await apiClient.post(`/education/modules/${slug}/progress`, payload);
        return data;
    },

    // --- QUIZ ENGINE (SECURE FLOW) ---

    /**
     * [SECURE] Mengambil soal kuis tanpa kunci jawaban.
     * Struktur data menggunakan UserQuizData (Tanpa isCorrect) untuk mencegah manipulasi client-side.
     */
    getQuizBySlug: async (slug: string) => {
        const { data } = await apiClient.get<UserQuizData>(`/education/modules/${slug}/quiz`);
        return data;
    },

    /**
     * Mengirim jawaban kuis untuk dinilai di server-side.
     * Mengikuti pola Secure Quiz: Client hanya mengirim ID opsi, Server yang menghitung skor & validasi.
     */
    submitQuiz: async (slug: string, payload: SubmitQuizPayload) => {
        const { data } = await apiClient.post<QuizSubmissionResult>(
            `/education/modules/${slug}/quiz/submit`,
            payload
        );
        return data;
    }
};