import api from "@/lib/axios";
import { LoginDto, RegisterDto, AuthResponse, User } from "@/lib/types";
import Cookies from "js-cookie"; // Menggunakan library js-cookie sesuai package.json

export const authService = {
  // 1. LOGIN
  // Mengirim kredensial, mendapatkan token, dan menyimpannya di Storage browser
  login: async (data: LoginDto) => {
    // A. Request ke Backend
    const response = await api.post<AuthResponse>("/auth/login", data);

    // B. Jika Login Sukses & Ada Token
    if (response.data.access_token) {
      const token = response.data.access_token;
      const user = response.data.user;

      // 1. Simpan ke Cookies (PENTING: Ini yang dibaca oleh Middleware Next.js)
      // 'path: /' agar cookie tersedia di seluruh halaman
      // 'expires: 1' diset 1 hari sesuai konfigurasi backend
      Cookies.set("token", token, { expires: 1, path: '/' });

      // 2. Simpan ke LocalStorage (Opsional: Untuk state management client-side seperti Zustand/Context)
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }
    }

    return response.data;
  },

  // 2. REGISTER
  // Mendaftarkan user baru
  register: async (data: RegisterDto) => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    
    // Auto-login setelah register (opsional, tergantung flow bisnis)
    if (response.data.access_token) {
      const token = response.data.access_token;
      Cookies.set("token", token, { expires: 1, path: '/' });
      
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  },

  // 3. LOGOUT
  // Membersihkan semua jejak autentikasi
  logout: () => {
    // Hapus dari Cookies (Agar Middleware memblokir akses dashboard)
    Cookies.remove("token", { path: '/' });
    
    // Hapus dari LocalStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Redirect paksa ke halaman login
      // Menggunakan window.location.href agar state aplikasi ter-reset total
      window.location.href = "/login";
    }
  },

  // 4. GET ME (SYNC PROFILE)
  // Mengambil data user terbaru dari server (berguna jika user mengedit profil)
  getMe: async () => {
    try {
      const response = await api.get<User>("/users/me");
      
      // Update data di LocalStorage agar sinkron
      if (response.data && typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      // Jika token expired atau invalid saat getMe, lakukan logout
      // authService.logout(); // Opsional: Uncomment jika ingin auto-logout
      throw error;
    }
  },

  // 5. HELPER: GET CURRENT USER
  // Mengambil data user dari LocalStorage tanpa request server (cepat tapi mungkin stale)
  getCurrentUser: (): User | null => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          console.error("Gagal parsing user data:", e);
          return null;
        }
      }
    }
    return null;
  },

  // 6. HELPER: IS AUTHENTICATED
  // Cek cepat apakah user sedang login (cek keberadaan cookie)
  isAuthenticated: (): boolean => {
    const token = Cookies.get("token");
    return !!token;
  }
};