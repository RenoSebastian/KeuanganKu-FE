// ============================================================================
// PENSION & RETIREMENT MODULE TYPES
// ============================================================================

// ============================================================================
// 1. CALCULATOR TYPES (User / Self Input)
// ============================================================================

export interface PensionPayload {
    currentAge: number;
    retirementAge: number;
    lifeExpectancy?: number;
    currentExpense: number;
    currentSaving?: number;
    inflationRate?: number;
    returnRate?: number;
}

// [FIX] Alias DTO & Response Data
export interface CreatePensionDto extends PensionPayload { }

// Response dari Database untuk Pensiun User
export interface PensionPlanData {
    id: string;
    currentAge: number;
    retirementAge: number;
    totalFundNeeded: number;
    monthlySaving: number;
    createdAt: string;
}

// Input untuk Form Kalkulator Mandiri
export interface PensionInput {
    currentAge: number;
    retirementAge: number;
    retirementDuration: number;
    currentExpense: number;
    currentFund: number;
    inflationRate: number;
    investmentRate: number;
}

// Hasil Kalkulasi Mandiri
export interface PensionResult {
    workingYears: number;
    retirementYears: number;
    fvMonthlyExpense: number;
    fvExistingFund: number;
    totalFundNeeded: number;
    shortfall: number;
    monthlySaving: number;
}

// ============================================================================
// 2. AGENT SIMULATION TYPES (From Section 10 of Giant Types)
// ============================================================================

// [DTO] Simulasi Pensiun untuk Agen (Lebih Lengkap dengan Identitas Klien)
export interface CreatePensionSimulationDto {
    // Identity
    clientName: string;
    clientDob: string;
    clientCity: string;
    clientJob?: string;
    clientPhone?: string;

    // Financial Params
    currentAge: number;
    retirementAge: number;
    lifeExpectancy?: number; // Default 85 di Backend jika kosong
    currentExpense: number;  // Biaya hidup bulanan saat ini
    currentSaving?: number;  // Aset pensiun yang sudah ada (JHT/DPLK/Tabungan)

    // Assumptions
    inflationRate?: number;  // Default 5%
    returnRate?: number;     // Default 6-10% (Tergantung profil)

    // System
    sessionId?: string;      // UUID v4 untuk tracking kuota/log
}

// [DTO] Hasil Simulasi Pensiun Agen (Detail Breakdown)
export interface PensionSimulationResult {
    yearsToRetire: number;        // Jarak waktu menabung (n1)
    retirementDuration: number;   // Masa pensiun (n2)

    futureMonthlyExpense: number; // Biaya hidup nanti (Future Value - Shock Therapy)
    totalFundNeeded: number;      // Total Dana yang dibutuhkan (Gunung Emas)

    fvExistingFund: number;       // Nilai aset lama di masa depan (Growth @ 5.5%)
    shortfall: number;            // Kekurangan dana (Gap)

    monthlySaving: number;        // Solusi: Investasi bulanan yang harus dilakukan
}