import api from "@/lib/axios";
// Sesuaikan import DTO dengan kontrak terbaru
import {
  LoginDto,
  RegisterDto,
  AuthResponse,
  User,
  RefreshTokenDto,
  VerifyOtpDto,
  ResendOtpDto,
  RegisterPhase1Response,
  ResendOtpResponse
} from "@/lib/types/auth";
import Cookies from "js-cookie";
import { getOrCreateDeviceId } from "@/lib/device-id";

export const authService = {
  // =================================================================
  // 1. LOGIN (EXISTING)
  // =================================================================
  login: async (data: Omit<LoginDto, 'deviceId'>) => {
    const deviceId = getOrCreateDeviceId();
    const payload: LoginDto = { ...data, deviceId };

    const response = await api.post<AuthResponse>("/auth/login", payload);

    if (response.data.access_token) {
      const { access_token, refresh_token, user } = response.data;

      Cookies.set("token", access_token, { expires: 1, path: '/' });

      if (typeof window !== "undefined") {
        localStorage.setItem("token", access_token);
        if (refresh_token) {
          localStorage.setItem("refresh_token", refresh_token);
        }
        localStorage.setItem("user", JSON.stringify(user));
      }
    }

    return response.data;
  },

  // =================================================================
  // 2. REGISTER: PHASE 1 (REQUEST OTP)
  // =================================================================
  register: async (data: RegisterDto) => {
    // Pada tahap ini, kita hanya menembak API untuk memicu pengiriman OTP ke email
    // Tidak ada Token JWT yang dikembalikan oleh Backend di tahap ini.
    const response = await api.post<RegisterPhase1Response>("/auth/register", data);
    return response.data;
  },

  // =================================================================
  // 3. REGISTER: PHASE 2 (VERIFY OTP & AUTO-LOGIN)
  // =================================================================
  verifyOtp: async (data: Omit<VerifyOtpDto, 'deviceId'>) => {
    // Sisipkan Device ID secara otomatis agar Backend bisa membuat Single Concurrent Session
    const deviceId = getOrCreateDeviceId();
    const payload: VerifyOtpDto = { ...data, deviceId };

    const response = await api.post<AuthResponse>("/auth/verify-otp", payload);

    // Identik dengan logika login, kita simpan token dan user data
    if (response.data.access_token) {
      const { access_token, refresh_token, user } = response.data;

      Cookies.set("token", access_token, { expires: 1, path: '/' });

      if (typeof window !== "undefined") {
        localStorage.setItem("token", access_token);
        if (refresh_token) {
          localStorage.setItem("refresh_token", refresh_token);
        }
        localStorage.setItem("user", JSON.stringify(user));
      }
    }

    return response.data;
  },

  // =================================================================
  // 4. RESEND OTP (COOLDOWN & LIMIT ENFORCED)
  // =================================================================
  resendOtp: async (data: ResendOtpDto) => {
    const response = await api.post<ResendOtpResponse>("/auth/resend-otp", data);
    return response.data;
  },

  // =================================================================
  // 5. REFRESH TOKEN (Silent Rotation)
  // =================================================================
  refreshTokens: async () => {
    if (typeof window === "undefined") return null;

    const refreshToken = localStorage.getItem("refresh_token");
    const deviceId = getOrCreateDeviceId();

    if (!refreshToken) throw new Error("No refresh token available");

    const payload: RefreshTokenDto = { refreshToken, deviceId };

    const response = await api.post<AuthResponse>("/auth/refresh", payload);

    if (response.data.access_token) {
      const { access_token, refresh_token } = response.data;

      Cookies.set("token", access_token, { expires: 1, path: '/' });
      localStorage.setItem("token", access_token);

      if (refresh_token) {
        localStorage.setItem("refresh_token", refresh_token);
      }
    }

    return response.data;
  },

  // =================================================================
  // 6. LOGOUT
  // =================================================================
  logout: () => {
    Cookies.remove("token", { path: '/' });

    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  },

  // =================================================================
  // 7. GET ME (SYNC PROFILE)
  // =================================================================
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

  // =================================================================
  // 8. UPDATE PROFILE
  // =================================================================
  updateProfile: async (data: Partial<User>) => {
    try {
      const response = await api.patch<User>("/users/me", data);

      if (response.data && typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      console.error("Gagal update profil di service:", error);
      throw error;
    }
  },

  // =================================================================
  // HELPER METHODS
  // =================================================================
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

  isAuthenticated: (): boolean => {
    const token = Cookies.get("token");
    return !!token;
  }
};