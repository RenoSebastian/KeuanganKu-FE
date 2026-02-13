/**
 * FINANCIAL CHECKUP TYPE DEFINITIONS
 * --------------------------------
 * Modul ini mendefinisikan kontrak data khusus untuk fitur Financial Checkup.
 * * UPDATE BLUEPRINT:
 * - FinancialAnnualState: Untuk UI (Flow Tahunan)
 * - FinancialMonthlyPayload: Untuk API/Backend (Flow Bulanan)
 */

import { HealthStatus } from "@/lib/types"; // Mengambil Enum global

// ============================================================================
// 1. UI MODEL (Annual Mental Model) - State React
// ============================================================================

export interface FinancialAnnualState {
    // --- A. NERACA (Stock - Nilai Saldo) ---
    // Aset dan Utang adalah nilai 'Stock' (akumulasi), 
    // jadi nilainya SAMA di Tahunan maupun Bulanan.
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

    // --- B. ARUS KAS (Flow - Nilai TAHUNAN / x12) ---
    // Bagian ini adalah 'Flow'. Di UI wajib TAHUNAN.
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

// Alias untuk Backward Compatibility (agar UI tidak error massal)
export type FinancialFormState = FinancialAnnualState;

// ============================================================================
// 2. API / SYSTEM MODEL (Monthly Mental Model) - Backend Payload
// ============================================================================

export interface FinancialMonthlyPayload {
    // --- A. NERACA (Stock - Tetap Sama) ---
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

    // --- B. ARUS KAS (Flow - Nilai BULANAN / :12) ---
    // Bagian ini adalah 'Flow'. Di API wajib BULANAN.
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

export type FinancialApiPayload = FinancialMonthlyPayload;

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
    // Properti ini wajib ada agar kompatibel dengan UI Global
    globalStatus: string;
    recommendation?: string;

    // Analisa Angka
    netWorth: number;
    surplusDeficit: number; // Bulanan (Biasanya backend return bulanan)

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

        // [ADAPTER RESULT]
        // Service di Front-end akan mengonversi ini menjadi ANNUAL 
        // sebelum dikembalikan ke UI Component.
        financial: FinancialAnnualState;

        result: CheckupSimulationResult;
    };
}