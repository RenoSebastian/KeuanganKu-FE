import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

// --- INTERCEPTOR REQUEST (Sisipkan Token Otomatis) ---
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage (kita simpan manual saat login)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- INTERCEPTOR RESPONSE (Handle Error Global) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika 401 (Unauthorized), berarti token expired/salah -> Logout paksa
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;