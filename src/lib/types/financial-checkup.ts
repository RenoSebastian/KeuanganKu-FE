/**
 * FINANCIAL CHECKUP TYPE DEFINITIONS
 * --------------------------------
 * Modul ini mendefinisikan kontrak data khusus untuk fitur Financial Checkup.
 */

import { HealthStatus } from "@/lib/types"; // Mengambil Enum global

// ============================================================================
// 1. UI MODEL (Annual Mental Model)
// ============================================================================

export interface FinancialFormState {
    // --- A. NERACA (Stock - Nilai Saldo Tidak Dikonversi) ---
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

// ============================================================================
// 2. API / SYSTEM MODEL (Monthly Logic)
// ============================================================================

export type FinancialApiPayload = FinancialFormState;

// ============================================================================
// 3. ANALYSIS RESULT
// ============================================================================

export interface FinancialRatioDetail {
    savingsRatio: number;
    debtRatio: number;
    liquidityRatio: number;
    investmentRatio?: number;
    [key: string]: number | undefined;
}

export interface CheckupSimulationResult {
    score: number;
    status: HealthStatus | string;
    // [FIX] Properti ini wajib ada agar kompatibel dengan UI Global
    globalStatus: string;
    recommendation?: string;

    // Analisa Angka
    netWorth: number;
    surplusDeficit: number; // Bulanan

    // Detail Rasio
    ratios: FinancialRatioDetail;
}

// ============================================================================
// 4. SERVICE RESPONSE WRAPPER
// ============================================================================

export interface CheckupSimulationResponse {
    pdfBuffer?: { type: string; data: number[] };
    mgcToken: string;
    filename: string;
    data: {
        client: any;
        spouse?: any;
        financial: FinancialApiPayload;
        result: CheckupSimulationResult;
    };
}