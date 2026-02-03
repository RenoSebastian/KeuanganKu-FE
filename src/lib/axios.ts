import axios, { AxiosError } from "axios";
import { APP_CONFIG, STORAGE_KEYS, UI_MESSAGES } from "@/lib/constants";

// --- ERROR DICTIONARY ---
// Peta pesan error yang user-friendly berdasarkan kode error teknis
const ERROR_DICTIONARY: Record<string, string> = {
  // Prisma / Database Errors
  P2002: "Data tersebut sudah terdaftar. Mohon gunakan data unik lainnya.",
  P2003: "Data tidak dapat dihapus karena sedang digunakan oleh modul atau fitur lain.",
  P2025: "Data yang ingin Anda ubah tidak ditemukan di sistem.",

  // HTTP Status Errors
  413: "Ukuran file terlalu besar. Mohon unggah file yang lebih kecil.",
  429: "Terlalu banyak permintaan. Mohon tunggu beberapa saat.",
  500: "Terjadi kesalahan pada server. Tim kami sedang memperbaikinya.",
  503: "Layanan sedang dalam pemeliharaan. Silakan coba lagi nanti.",
};

// 1. Buat Instance Axios
const api = axios.create({
  baseURL: APP_CONFIG.API_URL,
  // [UPDATED] Timeout menggunakan konstanta global (default 30s)
  timeout: APP_CONFIG.API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  // [UPDATED] Mengizinkan pengiriman Cookies (Penting jika BE menggunakan HttpOnly Cookies)
  withCredentials: true,
});

// 2. Request Interceptor (Hybrid Auth: Support Cookie & Bearer)
api.interceptors.request.use(
  (config) => {
    // Cek apakah kode jalan di browser (client-side)
    if (typeof window !== "undefined") {
      // [CLEANUP] Menggunakan Key Constant untuk mengambil token
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      // Jika ada token di localStorage, inject sebagai Bearer
      // (Ini fallback jika cookie tidak terdeteksi otomatis)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor (Handle Error Global & Resilience)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message: string | string[], statusCode: number }>) => {
    // --- A. NETWORK & TIMEOUT HANDLING ---

    // [NEW] Handling Timeout (Network Edge Case)
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error(UI_MESSAGES.ERRORS.NETWORK_TIMEOUT));
    }

    // [NEW] Handling Network Error (Offline/Server Down)
    if (!error.response) {
      return Promise.reject(new Error(UI_MESSAGES.ERRORS.NETWORK_OFFLINE));
    }

    // --- B. AUTHENTICATION HANDLING ---

    // [EXISTING] Handling 401 (Unauthorized) & Auto-Logout
    if (
      error.response.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      window.location.href = "/login";
      return Promise.reject(new Error("Sesi Anda telah berakhir. Silakan login kembali."));
    }

    // --- C. INTELLIGENT ERROR MAPPING (UX Hardening) ---

    const status = error.response.status;
    const backendMessage = error.response.data?.message;

    // Flatten message jika berupa array (validasi NestJS class-validator sering return array)
    const rawMessage = Array.isArray(backendMessage)
      ? backendMessage[0]
      : backendMessage || "";

    let userFriendlyMessage = rawMessage;

    // 1. Cek Dictionary berdasarkan HTTP Status
    if (ERROR_DICTIONARY[status]) {
      userFriendlyMessage = ERROR_DICTIONARY[status];
    }

    // 2. Cek Spesifik Prisma Error (biasanya terselip di dalam pesan error 409 Conflict atau 400)
    // Backend NestJS sering mengembalikan pesan asli Prisma di mode dev, atau custom exception di prod.
    // Kita scan string message untuk kode "PXXXX".
    if (rawMessage.includes("P2003") || rawMessage.toLowerCase().includes("foreign key")) {
      userFriendlyMessage = ERROR_DICTIONARY.P2003;
    } else if (rawMessage.includes("P2002") || rawMessage.toLowerCase().includes("unique constraint")) {
      userFriendlyMessage = ERROR_DICTIONARY.P2002;
    } else if (rawMessage.includes("P2025")) {
      userFriendlyMessage = ERROR_DICTIONARY.P2025;
    }

    // Update pesan error object agar component UI (Toast) menampilkan pesan yang sudah diterjemahkan
    error.message = userFriendlyMessage;

    // Return error asli (dengan message yang sudah dipercantik) untuk di-handle component
    return Promise.reject(error);
  }
);

export default api;