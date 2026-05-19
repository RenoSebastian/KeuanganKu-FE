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
    value: number; // [VERIFIED] Tipe data number ini adalah Information Expert untuk kalkulasi FE
    benchmark: string;
    // [MERGE] Digabung dengan Raksasa yang menggunakan 'string' biasa
    statusColor: 'GREEN_DARK' | 'GREEN_LIGHT' | 'YELLOW' | 'RED' | string;
    recommendation: string;
    status?: string;

    // [SUNTIKAN] Properti tambahan dari types.ts Raksasa
    threshold?: string;
    description?: string;
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

    // [SUNTIKAN] Properti tambahan dari types.ts Raksasa
    generatedAt?: string;
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

    // [FIXED] Dibuat opsional karena BE decoupled checkup mereturn string kosong
    mgcToken?: string;
    filename?: string;

    // Core Data Wrapper
    data: {
        client: any;
        spouse?: any;
        financial: FinancialAnnualState;
        result: CheckupSimulationResult;
    };

    // [FIXED] Sinkronisasi struktur objek baru dari Controller Backend
    meta?: {
        simulationId: string;
        [key: string]: any;
    };
}


// ============================================================================
// 5. SUNTIKAN DARI TYPES.TS RAKSASA (Tipe Personal & History Database)
// ============================================================================

export interface PersonalInfo {
    name: string;
    dob: string;
    gender: "L" | "P";
    ethnicity: string;
    religion: string;
    maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED";
    childrenCount: number;
    dependentParents: number;
    occupation: string;
    city: string;
    phone?: string;
    address?: string;
    nik?: string;
    email?: string;
}

/**
 * [FINANCIAL RECORD]
 * Telah disederhanakan dengan meng-extend FinancialAnnualState milik Anda, 
 * sehingga tidak perlu menulis ulang 40+ field aset dan utang.
 */
export interface FinancialRecord extends FinancialAnnualState {
    id?: string;
    checkDate?: string;
    userProfile: PersonalInfo;
    spouseProfile?: PersonalInfo;
}

export interface CreateFinancialRecordDto extends FinancialRecord { }

export interface HealthAnalysisResult {
    score: number;
    globalStatus: string;
    ratios: RatioDetail[];
    netWorth: number;
    surplusDeficit: number;
    generatedAt?: string;
}

export interface FinancialCheckupData extends FinancialRecord, HealthAnalysisResult { }

export interface FinancialRecordHistory {
    id: string;
    checkDate: string;
    healthScore: number;
    status: string;
    totalNetWorth: number;
}

export interface CheckupDetailResponse {
    score: number;
    globalStatus: string;
    netWorth: number;
    surplusDeficit: number;
    ratios: RatioDetail[];
    generatedAt: string;
    record: FinancialRecord & {
        id: string;
        checkDate?: string;
        createdAt?: string;
    };
}


// ============================================================================
// 6. SUNTIKAN DARI TYPES.TS RAKSASA (Agent Mode / Simulation)
// ============================================================================

export interface SimulationSpouseProfile {
    name: string;
    dob?: string;
    occupation?: string;
}

export interface SimulationClientProfile {
    name: string;
    nik?: string;
    dob: string;
    gender: "L" | "P";
    city: string;
    address: string;
    phone: string;
    email?: string;
    occupation: string;
    maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED";
    religion?: string;
    childrenCount?: number;
    dependentParents?: number;
}

export interface CreateCheckupSimulationDto extends FinancialAnnualState {
    client: SimulationClientProfile;
    spouse?: SimulationSpouseProfile;
}

export interface SimulationApiResponse {
    pdfBuffer: { type: "Buffer"; data: number[] };
    mgcToken?: string; // [FIXED] Disesuaikan dengan CheckupSimulationResponse
    filename?: string; // [FIXED] Disesuaikan dengan CheckupSimulationResponse
    data: CheckupSimulationResponse['data'];
    meta?: CheckupSimulationResponse['meta']; // [FIXED] Propagasi metadata
}