// ============================================================================
// AUTHENTICATION & USER DOMAIN
// ============================================================================

import { HealthStatus } from "./common"; // Pastikan file common.ts dibuat setelah ini

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
}

export interface RegisterDto {
    fullName: string;
    email: string;
    password: string;
    role?: string;
    nip?: string;
    unitKerja?: string;
}

// ============================================================================
// SUBSCRIPTION & USAGE
// ============================================================================

// Interface ini memetakan data dari table UserSubscription & UserUsage di BE
export interface UserSubscription {
    id: string;
    status: 'ACTIVE' | 'EXPIRED' | 'PENDING' | 'CANCELLED';
    startDate: string;
    endDate: string;
    // [UPDATED] Sesuai dengan include: { plan: true } dari Backend
    plan?: {
        id: string;
        name: string;
        price: number | string; // Handle Decimal/BigInt serialization
        durationMonths: number;
    };
}

export interface UserUsage {
    simulationQuota: number; // Sisa Token (Credit)
    totalUsed: number;       // Total simulasi yang pernah dibuat
}

// ============================================================================
// MAIN USER ENTITY
// ============================================================================

// [UPDATED] USER INTERFACE SINKRON DENGAN BACKEND PRISMA SCHEMA
export interface User {
    id: string;
    email: string;
    fullName: string;
    name?: string;    // Fallback
    role: UserRole;
    nip?: string;
    dateOfBirth?: string;

    // --- [NEW] ADDITIONAL PROFILE FIELDS ---
    avatar?: string;      // [ADDITION] Foto diri (Base64 String)
    gender?: string;      // [ADDITION] Jenis Kelamin
    address?: string;     // [ADDITION] Alamat Domisili
    noWa?: string;        // [ADDITION] Nomor WhatsApp
    agencyName?: string;  // [ADDITION] Nama Perusahaan Asuransi
    agentLevel?: string;  // [ADDITION] Jabatan/Level Agen
    companyName?: string;
    goals?: string;
    // ----------------------------------------

    // [INTEGRATION] SUBSCRIPTION & QUOTA
    subscription?: UserSubscription;
    usage?: UserUsage;

    // [NEW] AGGREGATION DATA (Untuk Dashboard Total Report)
    // Diisi oleh prisma include: { _count: { select: { simulationLogs: true } } }
    _count?: {
        simulationLogs: number;
    };

    unitKerja?: UnitKerja;
    createdAt?: string;
    updatedAt?: string;

    // Properti untuk hasil pencarian & dashboard
    financialChecks?: {
        status: HealthStatus;
        healthScore: number;
        checkDate?: string;
    }[];
}

export interface AuthResponse {
    access_token: string;
    user: User;
}