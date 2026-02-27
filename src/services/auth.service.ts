import api from "@/lib/axios";
import { LoginDto, RegisterDto, AuthResponse, User, RefreshTokenDto } from "@/lib/types/auth"; // Sesuaikan path jika menggunakan export barrel (index.ts)
import Cookies from "js-cookie";
import { getOrCreateDeviceId } from "@/lib/device-id";

export const authService = {
  // 1. LOGIN
  // Menggunakan Omit agar UI Component tidak perlu repot mengirim deviceId.
  // Service ini yang akan mengurusnya secara otomatis (Interceptor Pattern).
  login: async (data: Omit<LoginDto, 'deviceId'>) => {
    const deviceId = getOrCreateDeviceId();
    const payload: LoginDto = { ...data, deviceId };

    const response = await api.post<AuthResponse>("/auth/login", payload);

    if (response.data.access_token) {
      const { access_token, refresh_token, user } = response.data;

      // Set cookie untuk access_token (opsional, jika SSR butuh)
      Cookies.set("token", access_token, { expires: 1, path: '/' });

      if (typeof window !== "undefined") {
        localStorage.setItem("token", access_token);

        // Simpan refresh_token jika Backend mengirimkannya
        if (refresh_token) {
          localStorage.setItem("refresh_token", refresh_token);
        }

        localStorage.setItem("user", JSON.stringify(user));
      }
    }

    return response.data;
  },

  // 2. REGISTER
  register: async (data: Omit<RegisterDto, 'deviceId'>) => {
    const deviceId = getOrCreateDeviceId();
    const payload: RegisterDto = { ...data, deviceId };

    const response = await api.post<AuthResponse>("/auth/register", payload);

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

  // [NEW] 3. REFRESH TOKEN (Silent Rotation)
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

  // 4. LOGOUT
  logout: () => {
    Cookies.remove("token", { path: '/' });

    if (typeof window !== "undefined") {
      // Pembersihan total memori autentikasi, KECUALI device_signature
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  },

  // 5. GET ME (SYNC PROFILE)
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

  // 6. UPDATE PROFILE
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

  // 7. HELPER: GET CURRENT USER
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

  // 8. HELPER: IS AUTHENTICATED
  isAuthenticated: (): boolean => {
    const token = Cookies.get("token");
    return !!token;
  }
};