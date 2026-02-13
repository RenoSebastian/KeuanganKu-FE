/**
 * FINANCIAL CHECKUP TYPE DEFINITIONS
 * --------------------------------
 * Modul ini mendefinisikan kontrak data khusus untuk fitur Financial Checkup.
 * File ini telah distandarisasi agar sinkron dengan Backend NestJS.
 */

import { HealthStatus } from "@/lib/types"; // Mengambil Enum global

// ============================================================================
// 1. UI MODEL (Annual Mental Model) - State React
// ============================================================================

export interface FinancialAnnualState {
    // --- A. NERACA (Stock - Nilai Saldo) ---
    assetCash: number;
    assetHome: number;
    assetVehicle: number;
    assetJewelry: number;
    assetAntique: number;
    assetPersonalOther: number;

    assetInvHome: number;
    assetInvVehicle: number;
    assetGold: number;
    assetInvAntique: number;
    assetStocks: number;
    assetMutualFund: number;
    assetBonds: number;
    assetDeposit: number;
    assetInvOther: number;

    debtKPR: number;
    debtKPM: number;
    debtCC: number;
    debtCoop: number;
    debtConsumptiveOther: number;
    debtBusiness: number;

    // --- B. ARUS KAS (Flow - Nilai TAHUNAN) ---
    incomeFixed: number;
    incomeVariable: number;

    installmentKPR: number;
    installmentKPM: number;
    installmentCC: number;
    installmentCoop: number;
    installmentConsumptiveOther: number;
    installmentBusiness: number;

    insuranceLife: number;
    insuranceHealth: number;
    insuranceHome: number;
    insuranceVehicle: number;
    insuranceBPJS: number;
    insuranceOther: number;

    savingEducation: number;
    savingRetirement: number;
    savingPilgrimage: number;
    savingHoliday: number;
    savingEmergency: number;
    savingOther: number;

    expenseFood: number;
    expenseSchool: number;
    expenseTransport: number;
    expenseCommunication: number;
    expenseHelpers: number;
    expenseTax: number;
    expenseLifestyle: number;
    expenseOther?: number;
}

// Alias untuk Backward Compatibility
export type FinancialFormState = FinancialAnnualState;

// ============================================================================
// 2. API / SYSTEM MODEL (Monthly Mental Model)
// ============================================================================

export interface FinancialMonthlyPayload {
    // Structure mirror of Backend DTO (Bulanan)
    // Sama dengan AnnualState untuk properti, hanya beda makna value (x12 vs :12)
    [key: string]: number;
}

export type FinancialApiPayload = FinancialMonthlyPayload;

// ============================================================================
// 3. ANALYSIS RESULT (CORE FIX HERE)
// ============================================================================

/**
 * Interface item detail rasio (sesuai output Backend financial-math.util.ts)
 */
export interface RatioDetail {
    id: string;
    label: string;
    value: number;
    benchmark: string;
    statusColor: 'GREEN_DARK' | 'GREEN_LIGHT' | 'YELLOW' | 'RED';
    recommendation: string;
    status?: string;
}

/**
 * Hasil Analisa Finansial
 */
export interface CheckupSimulationResult {
    score: number;
    status: HealthStatus | string;
    globalStatus: string; // SEHAT | WASPADA | BAHAYA
    recommendation?: string;

    // Analisa Angka
    netWorth: number;
    surplusDeficit: number;

    // Detail Rasio (ARRAY, bukan object tunggal)
    ratios: RatioDetail[];

    // Legacy support (optional)
    ratiosDetails?: any;
}

// ============================================================================
// 4. SERVICE RESPONSE WRAPPER
// ============================================================================

/**
 * Struktur Respons dari Endpoint /financial/simulation/checkup
 * Mengandung Wrapper "data" yang sering menyebabkan data rasio tidak terbaca di UI.
 */
export interface CheckupSimulationResponse {
    pdfBuffer?: { type: string; data: number[] };
    mgcToken: string;
    filename: string;

    // Core Data Wrapper
    data: {
        client: any;
        spouse?: any;
        financial: FinancialAnnualState;
        result: CheckupSimulationResult;
    };
}