import axios, { AxiosError } from "axios";
import { APP_CONFIG, STORAGE_KEYS, UI_MESSAGES } from "@/lib/constants";

// 1. Buat Instance Axios
const api = axios.create({
  baseURL: APP_CONFIG.API_URL,
  // [UPDATED] Timeout menggunakan konstanta global (default 30s)
  // Penting untuk endpoint berat seperti Submit Quiz atau Export Data.
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
  (error: AxiosError) => {
    // [NEW] Handling Timeout (Network Edge Case)
    // Mencegah aplikasi crash/blank saat koneksi putus di tengah request
    if (error.code === 'ECONNABORTED') {
      // Menggunakan pesan standar dari UI Constants
      return Promise.reject(new Error(UI_MESSAGES.ERRORS.NETWORK_TIMEOUT));
    }

    // [NEW] Handling Network Error (Offline/Server Down)
    if (!error.response) {
      return Promise.reject(new Error(UI_MESSAGES.ERRORS.NETWORK_OFFLINE));
    }

    // [EXISTING] Handling 401 (Unauthorized) & Auto-Logout
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      // Bersihkan sesi lokal menggunakan Key Constant
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

      // Redirect paksa ke login
      window.location.href = "/login";
    }

    // Return error asli untuk di-handle spesifik oleh component jika perlu
    return Promise.reject(error);
  }
);

export default api;