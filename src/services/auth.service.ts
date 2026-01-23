// File: src/services/auth.service.ts

import api from "@/lib/axios";
import { LoginDto, RegisterDto, AuthResponse } from "@/lib/types";

export const authService = {
  // 1. LOGIN
  login: async (data: LoginDto) => {
    // POST ke endpoint Backend /auth/login
    const response = await api.post<AuthResponse>("/auth/login", data);
    
    // Simpan session jika sukses
    if (response.data.access_token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.data.access_token);
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

  // 4. GET CURRENT USER (Helper)
  getCurrentUser: () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) return JSON.parse(userStr);
    }
    return null;
  },
  
  // 5. IS AUTHENTICATED (Helper)
  isAuthenticated: () => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("token");
    }
    return false;
  }
};