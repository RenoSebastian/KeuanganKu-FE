import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { APP_CONFIG, STORAGE_KEYS, UI_MESSAGES } from "@/lib/constants";
import { useSystemStore } from "@/hooks/use-system-store";
import { getOrCreateDeviceId } from "@/lib/device-id";

// --- TYPE DEFINITIONS ---
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface CustomErrorResponse {
  message: string | string[];
  statusCode: number;
  errorCode?: string;
}

// --- QUEUE SYSTEM UNTUK REFRESH TOKEN ---
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: string | null) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- ERROR DICTIONARY ---
const ERROR_DICTIONARY: Record<string, string> = {
  P2002: "Data tersebut sudah terdaftar. Mohon gunakan data unik lainnya.",
  P2003: "Data tidak dapat dihapus karena sedang digunakan oleh modul atau fitur lain.",
  P2025: "Data yang ingin Anda ubah tidak ditemukan di sistem.",
  403: "Akses ditolak atau kuota penggunaan Anda telah habis.",
  413: "Ukuran file terlalu besar. Mohon unggah file yang lebih kecil.",
  429: "Terlalu banyak permintaan. Mohon tunggu beberapa saat.",
  500: "Terjadi kesalahan pada server. Tim kami sedang memperbaikinya.",
  503: "Layanan sedang dalam pemeliharaan. Silakan coba lagi nanti.",
};

// 1. Buat Instance Axios Utama
const api = axios.create({
  baseURL: APP_CONFIG.API_URL,
  timeout: APP_CONFIG.API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
});

// 2. Request Interceptor (Circuit Breaker & Auth Injection)
api.interceptors.request.use(
  (config) => {
    // [NEW] CIRCUIT BREAKER
    const { isSessionTerminated } = useSystemStore.getState();
    if (isSessionTerminated) {
      return Promise.reject(new axios.Cancel("Halted: Session Terminated"));
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const deviceId = getOrCreateDeviceId();
      if (deviceId) {
        config.headers['X-Device-ID'] = deviceId;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor (Error Handling & Rescue)
api.interceptors.response.use(
  (response) => {
    const { state, reset } = useSystemStore.getState();
    if (state !== 'NORMAL' && state !== 'OFFLINE') {
      reset();
    }
    return response;
  },
  async (error: any) => {
    // [FIX] Parameter 'error' dikembalikan ke tipe 'any' untuk menghindari TS 'never'

    const { setMaintenance, setServerError, triggerSessionTermination } = useSystemStore.getState();

    // 1. Cek apakah ini error buatan Circuit Breaker (axios.Cancel)
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // [FIX] Type Casting secara aman di dalam fungsi
    const axError = error as AxiosError<CustomErrorResponse>;
    const originalRequest = axError.config as ExtendedAxiosRequestConfig;

    if (axError.code === 'ECONNABORTED') {
      return Promise.reject(new Error(UI_MESSAGES.ERRORS.NETWORK_TIMEOUT));
    }
    if (!axError.response) {
      return Promise.reject(new Error(UI_MESSAGES.ERRORS.NETWORK_OFFLINE));
    }

    const status = axError.response.status;
    const responseData = axError.response.data;
    const errorCode = responseData?.errorCode;

    if (status === 503) {
      setMaintenance(true);
    } else if (status === 500) {
      setServerError(ERROR_DICTIONARY[500]);
    }

    // --- B. ZERO-TRUST SESSION MANAGEMENT ---
    if (status === 401 && typeof window !== "undefined") {

      // KONDISI 1: Sesi Ditendang
      if (errorCode === 'ERR_SESSION_SUPERSEDED' || errorCode === 'ERR_DEVICE_MISMATCH') {
        triggerSessionTermination();

        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem('refresh_token');

        return Promise.reject(new axios.Cancel("Sesi diambil alih oleh perangkat lain."));
      }

      // KONDISI 2: Token Expired Murni
      if (!originalRequest._retry && !window.location.pathname.includes("/login")) {

        if (isRefreshing) {
          try {
            const token = await new Promise<string | null>((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refresh_token');
        const deviceId = getOrCreateDeviceId();

        if (!refreshToken) {
          isRefreshing = false;
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          window.location.href = "/login?reason=expired";
          return Promise.reject(axError);
        }

        try {
          const { data } = await axios.post(`${APP_CONFIG.API_URL}/auth/refresh`, {
            refreshToken,
            deviceId
          }, {
            headers: { 'X-Device-ID': deviceId }
          });

          const newAccessToken = data.access_token;
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newAccessToken);

          if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
          }

          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return api(originalRequest);

        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem('refresh_token');
          window.location.href = "/login?reason=expired";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    if (status === 403 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("QUOTA_EXCEEDED"));
    }

    const backendMessage = responseData?.message;
    const rawMessage = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage || "";
    let userFriendlyMessage = rawMessage;

    if (ERROR_DICTIONARY[status] && (status === 500 || status === 503)) {
      userFriendlyMessage = ERROR_DICTIONARY[status];
    }

    if (typeof rawMessage === 'string') {
      if (rawMessage.includes("P2003") || rawMessage.toLowerCase().includes("foreign key")) {
        userFriendlyMessage = ERROR_DICTIONARY.P2003;
      } else if (rawMessage.includes("P2002") || rawMessage.toLowerCase().includes("unique constraint")) {
        userFriendlyMessage = ERROR_DICTIONARY.P2002;
      } else if (rawMessage.includes("P2025")) {
        userFriendlyMessage = ERROR_DICTIONARY.P2025;
      }
    }

    axError.message = userFriendlyMessage;
    return Promise.reject(axError);
  }
);

export default api;