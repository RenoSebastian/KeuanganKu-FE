// File: src/services/auth.service.ts

import api from "@/lib/axios";
import { LoginDto, RegisterDto, AuthResponse, User } from "@/lib/types";
import Cookies from "js-cookie"; // [PENTING] Import library js-cookie

export const authService = {
  // 1. LOGIN
  login: async (data: LoginDto) => {
    // POST ke endpoint Backend /auth/login
    const response = await api.post<AuthResponse>("/auth/login", data);
    
    // Simpan session jika sukses
    if (response.data.access_token) {
      if (typeof window !== "undefined") {
        // A. Simpan ke LocalStorage (Untuk kebutuhan Client Component / Axios Interceptor)
        localStorage.setItem("token", response.data.access_token);
        
        // Simpan data user awal (bisa jadi belum lengkap, nanti di-sync via getMe)
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // B. [CRITICAL UPDATE] Simpan ke Cookies (Agar Middleware Next.js bisa membacanya)
        // Kita set expired 1 hari (sesuaikan dengan logic expired token backend Anda)
        // Path: '/' agar cookie tersedia di seluruh rute aplikasi
        Cookies.set("token", response.data.access_token, { expires: 1, path: '/' });
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
      // Hapus dari LocalStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // [CRITICAL UPDATE] Hapus dari Cookies juga agar Middleware tahu user sudah logout
      Cookies.remove("token", { path: '/' });
      
      // Redirect ke login page
      window.location.href = "/login";
    }
  },

  // 4. GET ME (Sync Profile Terbaru)
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
      // Cek ketersediaan token di localStorage sebagai indikator cepat di sisi client
      return !!localStorage.getItem("token");
    }
    return false;
  }
};