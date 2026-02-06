import api from "@/lib/axios";
import { LoginDto, RegisterDto, AuthResponse, User } from "@/lib/types";
import Cookies from "js-cookie";

export const authService = {
  // 1. LOGIN
  login: async (data: LoginDto) => {
    const response = await api.post<AuthResponse>("/auth/login", data);

    if (response.data.access_token) {
      const token = response.data.access_token;
      const user = response.data.user;

      Cookies.set("token", token, { expires: 1, path: '/' });

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }
    }

    return response.data;
  },

  // 2. REGISTER
  register: async (data: RegisterDto) => {
    const response = await api.post<AuthResponse>("/auth/register", data);

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
  logout: () => {
    Cookies.remove("token", { path: '/' });

    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  },

  // 4. GET ME (SYNC PROFILE)
  getMe: async () => {
    try {
      const response = await api.get<User>("/users/me");

      if (response.data && typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ============================================================================
  // [NEW] 5. UPDATE PROFILE
  // Mengirim data profil terbaru ke backend dan menyinkronkan data lokal
  // ============================================================================
  updateProfile: async (data: Partial<User>) => {
    try {
      // Menggunakan endpoint PATCH sesuai kontrak backend
      const response = await api.patch<User>("/users/me", data);

      // Sinkronisasi LocalStorage agar perubahan (Nama/Avatar) langsung muncul di UI
      if (response.data && typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      console.error("Gagal update profil di service:", error);
      throw error;
    }
  },

  // 6. HELPER: GET CURRENT USER
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

  // 7. HELPER: IS AUTHENTICATED
  isAuthenticated: (): boolean => {
    const token = Cookies.get("token");
    return !!token;
  }
};