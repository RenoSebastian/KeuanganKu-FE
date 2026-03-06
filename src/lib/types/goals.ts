// ============================================================================
// DOMAIN: FINANCIAL GOALS MODULE TYPES
// ============================================================================

/**
 * [DTO Response] Representasi data entitas Goal dari database (Read/Fetch).
 */
export interface GoalPlanData {
    id: string;
    goalName: string;
    targetAmount: number;
    futureValue: number;
    monthlySaving: number;
    createdAt: string; // ISO 8601 Date String
}

/**
 * Base Payload untuk persistensi data Impian Finansial.
 */
export interface GoalPayload {
    goalName: string;
    /** Nilai Future Value yang sudah dikalkulasi dengan inflasi */
    targetAmount: number;
    /** Target waktu tercapai (Format: YYYY-MM-DD atau ISO String) */
    targetDate: string;
    inflationRate: number;
    returnRate: number;
    /** Opsional: Hasil simulasi tabungan bulanan yang disetujui klien */
    monthlySaving?: number;
}

/**
 * [DTO Request] Contract untuk endpoint POST /goals (Create).
 * Memisahkan semantic alias antara Payload dasar dan Request DTO.
 */
export interface CreateGoalDto extends GoalPayload { }


// ============================================================================
// DOMAIN: CALCULATOR SIMULATION TYPES (User / Self Service)
// ============================================================================

/**
 * [DTO Request] Input dasar untuk kalkulator simulasi standar.
 */
export interface SimulateGoalDto {
    targetAmount: number; // Nilai saat ini (Present Value)
    years: number;
    inflationRate: number;
    returnRate: number;
}

/**
 * [DTO Request] Input kalkulator dengan dukungan backwards-compatibility.
 */
export interface GoalSimulationInput extends SimulateGoalDto {
    /** @deprecated Gunakan targetAmount. Dipertahankan untuk legacy UI. */
    currentCost?: number;
}

/**
 * [DTO Response] Hasil agregasi dari mesin kalkulasi finansial (Backend/Engine).
 */
export interface GoalSimulationResult {
    futureTargetAmount: number;    // Hasil Future Value
    monthlySaving: number;         // PMT (Payment per Month)

    // Temporal Properties
    years?: number;
    yearsDuration?: number;
    monthsDuration?: number;

    // Investment Metrics
    /** Nilai masa depan dari modal/tabungan awal yang sudah diinvestasikan */
    futureExistingFund?: number;
    /** Gap: Nilai yang benar-benar harus dikumpulkan (Future Target - Future Existing) */
    netTarget?: number;
}


// ============================================================================
// DOMAIN: LEGACY SUPPORT TYPES (Tightly Coupled to Old UI)
// ============================================================================

export type GoalType = "IBADAH" | "LIBURAN" | "PERNIKAHAN" | "LAINNYA";

/**
 * @deprecated Rencana transisi: Migrasi ke CreateGoalSimulationDto
 */
export interface SpecialGoalInput {
    goalType: GoalType;
    currentCost: number;
    inflationRate: number;
    investmentRate: number; // Inconsistent naming: equivalent to returnRate
    duration: number;       // Inconsistent naming: equivalent to years
}

/**
 * @deprecated Rencana transisi: Migrasi ke GoalSimulationResult
 */
export interface SpecialGoalResult {
    futureValue: number;    // Inconsistent naming: equivalent to futureTargetAmount
    monthlySaving: number;
}


// ============================================================================
// DOMAIN: AGENT / ADVISOR SIMULATION TYPES (Stateless Aggregation)
// ============================================================================

/**
 * [DTO Request] Payload komprehensif untuk simulasi via Agen (Section 11).
 * Menggabungkan informasi entitas Klien dan parameter Impian dalam satu agregat.
 */
export interface CreateGoalSimulationDto {
    // --- Client Identity Aggregate ---
    clientName: string;
    clientDob: string; // YYYY-MM-DD
    clientCity: string;
    clientJob?: string;
    clientPhone?: string;

    // --- Financial Goal Aggregate ---
    goalName: string;
    targetAmount: number;   // Present Value / Biaya Saat Ini
    targetDate: string;     // YYYY-MM-DD
    /** Modal Awal (Lump Sum) yang sudah dimiliki klien */
    currentSaving?: number;

    // --- Economic Assumptions ---
    inflationRate?: number;
    returnRate?: number;
}