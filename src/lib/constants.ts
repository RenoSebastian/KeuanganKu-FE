// src/lib/constants.ts

export const APP_CONFIG = {
    API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
    // Timeout global untuk request axios (30 detik)
    API_TIMEOUT_MS: 30000,
    // Versi aplikasi untuk cache busting jika diperlukan
    APP_VERSION: 'v1.0.0',
};

export const STORAGE_KEYS = {
    // Key Auth
    AUTH_TOKEN: 'token',

    // Format Key: quiz_state_v1_{userId}_{quizId}
    QUIZ_DRAFT_PREFIX: 'quiz_state_v1_',

    // Untuk menyimpan timestamp start (fallback client-side)
    QUIZ_START_TIME_SUFFIX: '_start',
};

export const UI_MESSAGES = {
    ERRORS: {
        NETWORK_TIMEOUT: 'Koneksi waktu habis (Timeout). Server sedang sibuk atau internet Anda lambat. Silakan coba kirim ulang.',
        NETWORK_OFFLINE: 'Gagal terhubung ke server. Periksa koneksi internet Anda.',
        SESSION_EXPIRED: 'Sesi berakhir. Silakan login kembali.',
        GENERIC_SUBMIT: 'Gagal mengirim jawaban.',
    },
    SUCCESS: {
        SUBMIT_RECEIVED: 'Jawaban berhasil diterima!',
    },
    LOADING: {
        SUBMITTING: 'Mengirim jawaban ke server...',
    }
};
