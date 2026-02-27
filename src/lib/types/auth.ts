import { HealthStatus } from "./common"; // Pastikan file common.ts sudah ada

export type UserRole = "USER" | "ADMIN" | "DIRECTOR" | "UNIT_HEAD";

export interface UnitKerja {
    id: string;
    kodeUnit: string;
    namaUnit: string;
    name?: string; // Fallback untuk compatibility
    code?: string; // Fallback
    userCount?: number;
}

// ============================================================================
// DTOs (DATA TRANSFER OBJECTS)
// ============================================================================

export interface LoginDto {
    email: string;
    password: string;
    deviceId: string; // [NEW] Wajib untuk Single Concurrent Session
}

export interface RegisterDto {
    fullName: string;
    email: string;
    password: string;
    role?: string;
    nip?: string;
    unitKerja?: string;
    deviceId: string; // [NEW] Wajib untuk Single Concurrent Session
}

// [NEW] Kontrak DTO untuk Rotasi Token
export interface RefreshTokenDto {
    refreshToken: string;
    deviceId: string;
}

// ============================================================================
// SUBSCRIPTION & USAGE
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

// ============================================================================
// MAIN USER ENTITY
// ============================================================================

export interface User {
    id: string;
    email: string;
    fullName: string;
    name?: string;
    role: UserRole;
    nip?: string;
    dateOfBirth?: string;

    avatar?: string;
    gender?: string;
    address?: string;
    noWa?: string;
    agencyName?: string;
    agentLevel?: string;
    companyName?: string;
    goals?: string;

    subscription?: UserSubscription;
    usage?: UserUsage;

    _count?: {
        simulationLogs: number;
    };

    unitKerja?: UnitKerja;
    createdAt?: string;
    updatedAt?: string;

    financialChecks?: {
        status: HealthStatus;
        healthScore: number;
        checkDate?: string;
    }[];
}

// [UPDATED] Mengakomodasi Hybrid JWT (Access & Refresh)
export interface AuthResponse {
    access_token: string;
    refresh_token?: string; // Tambahan Refresh Token dari Backend
    user: User;
}