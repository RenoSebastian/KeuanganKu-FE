import api from "@/lib/axios";
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
  // HELPER: STANDARDIZASI PENYIMPANAN SESI (DRY Principle)
  // =================================================================
  _saveSession: (data: AuthResponse) => {
    if (data.access_token) {
      Cookies.set("token", data.access_token, { expires: 1, path: '/' });

      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      }
    }
  },

  // =================================================================
  // 1. LOGIN: PHASE 1 (INISIASI & REQUEST OTP)
  // =================================================================
  login: async (data: Omit<LoginDto, 'deviceId'>) => {
    const deviceId = getOrCreateDeviceId();
    const payload: LoginDto = { ...data, deviceId };

    // [MODIFIKASI] Endpoint ini sekarang hanya mengembalikan sinyal OTP terkirim,
    // BUKAN JWT Token. Kita tangkap message dan emailnya.
    const response = await api.post<{ message: string; email: string; expiresIn: string }>("/auth/login", payload);

    // Tidak ada penyimpanan token di sini (Deferred Session)
    return response.data;
  },

  // =================================================================
  // 2. LOGIN: PHASE 2 (VERIFY OTP & CETAK SESI)
  // =================================================================
  verifyLoginOtp: async (data: Omit<VerifyOtpDto, 'deviceId'>) => {
    const deviceId = getOrCreateDeviceId();
    const payload: VerifyOtpDto = { ...data, deviceId };

    // Menembak endpoint baru khusus verifikasi login
    const response = await api.post<AuthResponse>("/auth/login/verify", payload);

    // Setelah OTP valid, BE memberikan JWT. Kita simpan menggunakan helper.
    authService._saveSession(response.data);

    return response.data;
  },

  // =================================================================
  // 3. LOGIN: RESEND OTP
  // =================================================================
  resendLoginOtp: async (data: ResendOtpDto) => {
    const response = await api.post<ResendOtpResponse>("/auth/login/resend", data);
    return response.data;
  },

  // =================================================================
  // 4. REGISTER: PHASE 1 (REQUEST OTP)
  // =================================================================
  register: async (data: RegisterDto) => {
    const response = await api.post<RegisterPhase1Response>("/auth/register", data);
    return response.data;
  },

  // =================================================================
  // 5. REGISTER: PHASE 2 (VERIFY OTP & AUTO-LOGIN)
  // =================================================================
  verifyOtp: async (data: Omit<VerifyOtpDto, 'deviceId'>) => {
    const deviceId = getOrCreateDeviceId();
    const payload: VerifyOtpDto = { ...data, deviceId };

    const response = await api.post<AuthResponse>("/auth/verify-otp", payload);

    // Menggunakan helper untuk menyimpan token hasil registrasi
    authService._saveSession(response.data);

    return response.data;
  },

  // =================================================================
  // 6. REGISTER: RESEND OTP
  // =================================================================
  resendOtp: async (data: ResendOtpDto) => {
    const response = await api.post<ResendOtpResponse>("/auth/resend-otp", data);
    return response.data;
  },

  // =================================================================
  // 7. REFRESH TOKEN (Silent Rotation)
  // =================================================================
  refreshTokens: async () => {
    if (typeof window === "undefined") return null;

    const refreshToken = localStorage.getItem("refresh_token");
    const deviceId = getOrCreateDeviceId();

    if (!refreshToken) throw new Error("No refresh token available");

    const payload: RefreshTokenDto = { refreshToken, deviceId };

    const response = await api.post<AuthResponse>("/auth/refresh", payload);

    if (response.data.access_token) {
      Cookies.set("token", response.data.access_token, { expires: 1, path: '/' });
      localStorage.setItem("token", response.data.access_token);

      if (response.data.refresh_token) {
        localStorage.setItem("refresh_token", response.data.refresh_token);
      }
    }

    return response.data;
  },

  // =================================================================
  // 8. LOGOUT
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
  // 9. GET ME (SYNC PROFILE)
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
  // 10. UPDATE PROFILE
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
  // 11. SUBMIT HEARTBEAT (REDIS TRACKING)
  // =================================================================
  sendHeartbeat: async () => {
    try {
      const deviceId = getOrCreateDeviceId();
      await api.post("/users/heartbeat", { deviceId });
    } catch (error) {
      // Silently fail to avoid console spam
    }
  },

  // =================================================================
  // UTILITIES
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