// File: src/services/auth.service.ts

import api from "@/lib/axios";
import { LoginDto, RegisterDto, AuthResponse, User } from "@/lib/types";

export const authService = {
  // 1. LOGIN
  login: async (data: LoginDto) => {
    // POST ke endpoint Backend /auth/login
    const response = await api.post<AuthResponse>("/auth/login", data);
    
    // Simpan session jika sukses
    if (response.data.access_token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.data.access_token);
        // Simpan data user awal (bisa jadi belum lengkap, nanti di-sync via getMe)
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },

  // 2. REGISTER
  register: async (data: RegisterDto) => {
    // POST ke endpoint Backend /auth/register
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  // 3. LOGOUT
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect ke login page
      window.location.href = "/login";
    }
  },

  // 4. GET ME (Sync Profile Terbaru) -> NEW!
  getMe: async () => {
    // Memanggil endpoint profil user yang terproteksi (Token dikirim otomatis via interceptor)
    const response = await api.get<User>("/users/me");
    
    // Update LocalStorage dengan data terbaru (agar sinkron jika user edit profil)
    if (response.data && typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    
    return response.data;
  },

  // 5. GET CURRENT USER (Helper - Data Lokal)
  getCurrentUser: (): User | null => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          console.error("Error parsing user data", e);
          return null;
        }
      }
    }
    return null;
  },
  
  // 6. IS AUTHENTICATED (Helper)
  isAuthenticated: () => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("token");
    }
    return false;
  }
};