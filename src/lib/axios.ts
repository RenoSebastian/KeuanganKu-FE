import axios, { AxiosError } from "axios";
import { APP_CONFIG, STORAGE_KEYS, UI_MESSAGES } from "@/lib/constants";
import { useSystemStore } from "@/hooks/use-system-store"; // [NEW] Integrasi Store Keselamatan

// --- ERROR DICTIONARY ---
// Peta pesan error yang user-friendly berdasarkan kode error teknis
const ERROR_DICTIONARY: Record<string, string> = {
  // Prisma / Database Errors
  P2002: "Data tersebut sudah terdaftar. Mohon gunakan data unik lainnya.",
  P2003: "Data tidak dapat dihapus karena sedang digunakan oleh modul atau fitur lain.",
  P2025: "Data yang ingin Anda ubah tidak ditemukan di sistem.",

  // HTTP Status Errors
  403: "Akses ditolak atau kuota penggunaan Anda telah habis.",
  413: "Ukuran file terlalu besar. Mohon unggah file yang lebih kecil.",
  429: "Terlalu banyak permintaan. Mohon tunggu beberapa saat.",
  500: "Terjadi kesalahan pada server. Tim kami sedang memperbaikinya.",
  503: "Layanan sedang dalam pemeliharaan. Silakan coba lagi nanti.",
};

// 1. Buat Instance Axios
const api = axios.create({
  baseURL: APP_CONFIG.API_URL,
  timeout: APP_CONFIG.API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
});

// 2. Request Interceptor (Hybrid Auth: Support Cookie & Bearer)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
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
    // [NEW] LOGIKA PEMULIHAN: Jika request berhasil, bersihkan state error sistem jika ada
    const { state, reset } = useSystemStore.getState();
    if (state !== 'NORMAL' && state !== 'OFFLINE') {
      reset();
    }
    return response;
  },
  (error: AxiosError<{ message: string | string[], statusCode: number }>) => {
    const { setMaintenance, setServerError } = useSystemStore.getState();

    // --- A. NETWORK & TIMEOUT HANDLING ---

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error(UI_MESSAGES.ERRORS.NETWORK_TIMEOUT));
    }

    // Jika tidak ada response, kemungkinan server mati total atau user offline
    if (!error.response) {
      return Promise.reject(new Error(UI_MESSAGES.ERRORS.NETWORK_OFFLINE));
    }

    // --- B. AUTHENTICATION, QUOTA & SYSTEM STATUS HANDLING ---

    const status = error.response.status;

    // 1. Tangkap Sinyal Maintenance (503) -> Memicu UI Imersif
    if (status === 503) {
      setMaintenance(true);
    }

    // 2. Tangkap Sinyal Server Error Berat (500) -> Memicu UI Imersif
    else if (status === 500) {
      setServerError(ERROR_DICTIONARY[500]);
    }

    // 3. Handling 401 (Unauthorized) & Auto-Logout
    if (
      status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      window.location.href = "/login";
      return Promise.reject(new Error("Sesi berakhir. Silakan login kembali."));
    }

    // 4. Handling 403 (Forbidden / Quota Exceeded)
    if (status === 403) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("QUOTA_EXCEEDED"));
      }
    }

    // --- C. INTELLIGENT ERROR MAPPING (UX Hardening) ---

    const backendMessage = error.response.data?.message;
    const rawMessage = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage || "";
    let userFriendlyMessage = rawMessage;

    // Cek Dictionary berdasarkan HTTP Status
    if (ERROR_DICTIONARY[status]) {
      if (status === 500 || status === 503) {
        userFriendlyMessage = ERROR_DICTIONARY[status];
      }
    }

    // Cek Spesifik Prisma Error
    if (typeof rawMessage === 'string') {
      if (rawMessage.includes("P2003") || rawMessage.toLowerCase().includes("foreign key")) {
        userFriendlyMessage = ERROR_DICTIONARY.P2003;
      } else if (rawMessage.includes("P2002") || rawMessage.toLowerCase().includes("unique constraint")) {
        userFriendlyMessage = ERROR_DICTIONARY.P2002;
      } else if (rawMessage.includes("P2025")) {
        userFriendlyMessage = ERROR_DICTIONARY.P2025;
      }
    }

    // Update pesan error object agar component UI (Toast) menampilkan pesan yang manusiawi
    error.message = userFriendlyMessage;

    return Promise.reject(error);
  }
);

export default api;