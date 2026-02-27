// ============================================================================
// INSURANCE MODULE TYPES (PROTECTION)
// ============================================================================

// [GLOBAL] Tipe Proteksi yang didukung
export type InsuranceType = "LIFE" | "HEALTH" | "CRITICAL_ILLNESS";

// ============================================================================
// 1. CALCULATOR TYPES (User / Self Input)
// ============================================================================

export interface InsurancePayload {
    type: InsuranceType;
    dependentCount: number;
    monthlyExpense: number;
    existingDebt?: number;
    existingCoverage?: number;
    protectionDuration?: number;
    finalExpense?: number;         // [NEW] Tambahkan agar sinkron dengan DTO Backend
    inflationRate?: number;
    returnRate?: number;           // [UPDATED] Gunakan returnRate agar konsisten dengan Backend
    investmentReturnRate?: number; // Keep for legacy if needed
}

// [FIX] Alias DTO & Response Data
export interface CreateInsuranceDto extends InsurancePayload {
    // Field wajib di Backend, optional di UI Payload interface sebelumnya
    existingDebt: number;
    existingCoverage: number;
    protectionDuration: number;
}

export interface InsurancePlanData {
    id: string;
    type: string;
    coverageNeeded: number;
    recommendation: string;
    createdAt: string;
}

// Input untuk Form Kalkulator Mandiri
export interface InsuranceInput {
    investmentRate: number;
    debtKPR: number;
    debtKPM: number;
    debtProductive: number;
    debtConsumptive: number;
    debtOther: number;
    annualIncome: number;
    protectionDuration: number;
    inflationRate: number;
    returnRate: number;
    finalExpense: number;
    existingInsurance: number;
}

// Hasil Kalkulasi Mandiri
export interface InsuranceResult {
    totalDebt: number;
    incomeReplacementValue: number;
    totalFundNeeded: number;
    shortfall: number;
    otherneeds?: number;
}

// ============================================================================
// 2. AGENT SIMULATION TYPES (From Section 10 of Giant Types)
// ============================================================================

// [DTO] Simulasi Asuransi untuk Agen
export interface CreateInsuranceSimulationDto {
    // Identity
    clientName: string;
    clientDob: string;
    clientCity: string;
    clientJob: string;
    clientPhone?: string;

    // Calculation Params
    type: InsuranceType;
    dependents: number;
    monthlyExpense: number;
    existingDebt: number;
    existingCoverage: number;
    protectionDuration: number;
    finalExpense?: number; // Optional
    inflationRate?: number;
    returnRate?: number;
}

// [DTO] Hasil Simulasi Asuransi Agen (Lebih Detail)
export interface InsuranceSimulationResult {
    // Granular
    annualExpense: number;
    nettRatePercentage: string;
    incomeReplacementValue: number;
    debtClearanceValue: number;
    otherNeeds: number;

    // Aggregated
    totalNeeded: number;
    coverageGap: number;
    recommendation: string;
}