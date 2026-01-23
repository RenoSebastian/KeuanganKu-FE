import axios from "axios";

// 1. Buat Instance Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  timeout: 10000, // Safety: Timeout 10 detik agar UI tidak freezing jika BE down
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// 2. Request Interceptor (Sisipkan Token)
api.interceptors.request.use(
  (config) => {
    // Cek apakah kode jalan di browser (client-side)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
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

// 3. Response Interceptor (Handle Error Global)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Jika error 401 (Unauthorized) & bukan di halaman login
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      // Hapus token kotor/expired
      localStorage.removeItem("token");
      
      // Redirect paksa ke login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;