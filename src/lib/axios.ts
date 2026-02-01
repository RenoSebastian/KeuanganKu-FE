import axios, { AxiosError } from "axios";

// 1. Buat Instance Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  // [UPDATED] Timeout ditingkatkan ke 30 detik.
  // Penting untuk endpoint berat seperti Submit Quiz atau Export Data.
  timeout: 30000,
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
      const token = localStorage.getItem("token");
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
      const timeoutMessage = 'Koneksi terputus (Timeout). Silakan periksa internet Anda dan coba lagi.';
      // Kita reject dengan Error object baru agar pesan ini bisa ditangkap UI (misal: Toast)
      return Promise.reject(new Error(timeoutMessage));
    }

    // [NEW] Handling Network Error (Offline/Server Down)
    if (!error.response) {
      return Promise.reject(new Error('Gagal terhubung ke server. Periksa koneksi internet Anda.'));
    }

    // [EXISTING] Handling 401 (Unauthorized) & Auto-Logout
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      // Bersihkan sesi lokal
      localStorage.removeItem("token");

      // Redirect paksa ke login
      window.location.href = "/login";
    }

    // Return error asli untuk di-handle spesifik oleh component jika perlu
    return Promise.reject(error);
  }
);

export default api;