import { HealthStatus } from "./common"; // Pastikan file common.ts sudah ada

export type UserRole = "USER" | "ADMIN" | "DIRECTOR" | "UNIT_HEAD";

// ============================================================================
// DTOs (DATA TRANSFER OBJECTS)
// ============================================================================

export interface LoginDto {
    email: string;
    password: string;
    deviceId: string; // Wajib untuk Single Concurrent Session
}

// [UPDATE] Telah disesuaikan dengan Backend (B2B2C Agent Profile)
export interface RegisterDto {
    fullName: string;
    email: string;
    password: string;
    // [NEW] Fase 1: Sinkronisasi dengan Backend untuk form registrasi
    phoneNumber?: string;
    // role, nip, dan unitKerja telah dibersihkan sesuai arsitektur SaaS baru
}

// [NEW] Kontrak DTO untuk Rotasi Token
export interface RefreshTokenDto {
    refreshToken: string;
    deviceId: string;
}

// [NEW] Kontrak DTO untuk Verifikasi OTP (Fase 2 Pendaftaran)
export interface VerifyOtpDto {
    email: string;
    otpCode: string;
    deviceId: string;
}

// [NEW] Kontrak DTO untuk Permintaan Ulang OTP
export interface ResendOtpDto {
    email: string;
}

// ============================================================================
// RESPONSES
// ============================================================================

// [NEW] Respons setelah tahap 1 (Submit Register) berhasil
export interface RegisterPhase1Response {
    message: string;
    expiresIn: string;
}

// [NEW] Respons setelah tahap Resend OTP berhasil
export interface ResendOtpResponse {
    message: string;
    resendCount: number;
    maxResend: number;
}

// [UPDATED] Mengakomodasi Hybrid JWT (Access & Refresh) 
// Digunakan oleh Login dan Verify OTP
export interface AuthResponse {
    message?: string;
    access_token: string;
    refresh_token?: string;
    user: User;
}

// ============================================================================
// SUBSCRIPTION, USAGE, & COMPUTED METRICS (FE-BE SYNC)
// ============================================================================

export interface UserSubscription {
    id: string;
    status: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';
    startDate: string;
    endDate: string;
    plan?: {
        id: string;
        name: string;
        price: number | string;
        durationMonths: number;
    };
}

export interface UserUsage {
    simulationQuota: number;
    totalUsed: number;
}

// [NEW ARCHITECTURE] API Contract untuk data hasil kalkulasi murni dari BE
export interface ComputedSubscription {
    remainingDays: number;
    isActive: boolean;
    derivedStatus: string;
}

export interface ComputedUsageAnalytics {
    isUnlimited: boolean;
    healthStatus: string; // 'NORMAL' | 'WARNING' | 'CRITICAL' | 'DEPLETED'
    totalUsage: number;
}

export interface ComputedMetrics {
    subscription: ComputedSubscription;
    usageAnalytics: ComputedUsageAnalytics;
}

// ============================================================================
// MAIN USER ENTITY
// ============================================================================

export interface User {
    id: string;
    email: string;
    fullName: string;
    name?: string;
    role: UserRole;
    dateOfBirth?: string;
    avatar?: string;
    gender?: string;
    address?: string;

    // [REFACTORED] Mengubah noWa menjadi phoneNumber agar selaras 100% dengan Prisma Schema
    phoneNumber?: string | null;

    agencyName?: string;
    agentLevel?: string;
    companyName?: string;
    goals?: string;

    subscription?: UserSubscription;
    usage?: UserUsage;

    // [NEW ARCHITECTURE] Penambahan properti computed untuk menampung metrik dinamis dari BE
    computed?: ComputedMetrics;

    _count?: {
        simulationLogs: number;
    };

    createdAt?: string;
    updatedAt?: string;

    financialChecks?: {
        status: HealthStatus;
        healthScore: number;
        checkDate?: string;
    }[];
}