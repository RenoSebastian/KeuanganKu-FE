// ============================================================================
// DASHBOARD TYPES (ADMIN & DIRECTOR/EXECUTIVE)
// ============================================================================

import { HealthStatus } from "./common";
import { UserRole } from "./auth";
import { FinancialRecord, HealthAnalysisResult } from "./financial-checkup";

// ============================================================================
// [NEW] SAAS & ANALYTICS METRICS TYPES (Phase 1)
// ============================================================================

export interface RevenueMetrics {
    grossVolume: number;
    mrr: number;
    pendingValue: number;
}

export interface UserMetrics {
    totalUsers: number;
    dau: number;
    mau: number;
    conversionRate: number;
}

export interface FeatureUsage {
    featureName: string;
    usageCount: number;
    percentage: number;
}

export interface SystemUsageMetrics {
    featureDistribution: FeatureUsage[];
    averageFreeQuotaConsumption: number;
}

export interface DashboardMetricsResponse {
    revenue: RevenueMetrics;
    users: UserMetrics;
    systemUsage: SystemUsageMetrics;
    lastUpdatedAt: string; // ISO Date String
}

export type CashflowStatus = 'VERIFIED' | 'PENDING' | 'REJECTED';

export interface CashflowLedgerItem {
    transactionId: string;
    transactionDate: string; // ISO Date String
    planName: string;
    amount: number;
    status: CashflowStatus;
    verifiedBy?: string;
    userName: string;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CashflowLedgerResponse {
    data: CashflowLedgerItem[];
    meta: PaginationMeta;
}

// ============================================================================
// 6. ADMIN & SYSTEM DASHBOARD TYPES (Section 6 of Giant Types)
// ============================================================================

export interface AdminDashboardStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalUnits: number;
    systemHealth: "Normal" | "Maintenance" | "Degraded";
}

export interface AdminUser {
    id: string;
    fullName: string;
    email: string;
    nip: string;
    unitId?: string; // Untuk backward compatibility
    unitKerjaId?: string;
    role: UserRole;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
}

export interface Jabatan {
    id: string;
    name: string;
    level: number;
    userCount?: number;
}

export interface SystemSettings {
    defaultInflationRate: number;
    defaultInvestmentRate: number;
    companyName: string;
    maintenanceMode: boolean;
}

// ============================================================================
// 7. EXECUTIVE / DIRECTOR DASHBOARD TYPES (Section 7 of Giant Types)
// ============================================================================

export interface StatusCountDto {
    SEHAT: number;
    WASPADA: number;
    BAHAYA: number;
}

export interface DirectorDashboardStats {
    totalEmployees: number;
    avgHealthScore: number;
    riskyEmployeesCount: number;
    totalAssetsManaged: number;
    statusCounts?: StatusCountDto; // Optional agar tidak error jika BE lama
    monthlyHealthTrend?: number[];
}

export interface UnitHealthRanking {
    id: string;
    unitName: string;
    avgScore: number;
    employeeCount: number;
    status: "SEHAT" | "WASPADA" | "BAHAYA";
}

export interface RiskyEmployeeDetail {
    id: string;
    fullName: string;
    unitName: string;
    healthScore: number;
    debtToIncomeRatio?: number; // Optional (sesuai DTO Backend)
    lastCheckDate: string;      // Rename dari 'lastCheckupDate' agar sesuai DTO Backend
    status: "BAHAYA" | "WASPADA";
}

// [NEW] Interface untuk Detail Audit Karyawan (Wrapper Utama)
export interface AuditProfile {
    id: string;
    fullName: string;
    unitName: string;
    email: string;
    status: HealthStatus;
    healthScore: number;
    lastCheckDate: string;
}

export interface EmployeeAuditDetail {
    profile: AuditProfile;
    record: FinancialRecord;        // Menggunakan tipe FinancialRecord yang sudah ada (40+ vars)
    analysis: HealthAnalysisResult; // Menggunakan tipe HealthAnalysisResult yang sudah ada
}

// [NEW] Interface untuk Dashboard Orchestrator (Composite Response)
export interface DashboardSummaryDto {
    stats: DirectorDashboardStats;
    topRiskyEmployees: RiskyEmployeeDetail[];
    unitRankings: UnitHealthRanking[];
    meta: {
        generatedAt: string; // ISO String
    };
}