// ============================================================================
// FINANCIAL GOALS MODULE TYPES
// ============================================================================

// [DTO] Alias Data Response untuk Service
export interface GoalPlanData {
    id: string;
    goalName: string;
    targetAmount: number;
    futureValue: number;
    monthlySaving: number;
    createdAt: string;
}

// Interface untuk SAVE (CreateGoalDto)
export interface GoalPayload {
    goalName: string;
    targetAmount: number; // Nilai Future Value yang sudah dihitung
    targetDate: string;   // Tanggal tercapai (Date.now() + years)
    inflationRate: number;
    returnRate: number;
    monthlySaving?: number; // Optional for simulation
}

// [FIX] Alias DTO & Response Data
export interface CreateGoalDto extends GoalPayload { }

// ============================================================================
// CALCULATOR SIMULATION TYPES (User / Self)
// ============================================================================

// Interface untuk SIMULATE (SimulateGoalDto)
export interface SimulateGoalDto {
    targetAmount: number;
    years: number;
    inflationRate: number;
    returnRate: number;
}

export interface GoalSimulationInput extends SimulateGoalDto {
    currentCost?: number; // Legacy support
}

// Interface Output Simulasi (Backend Response)
export interface GoalSimulationResult {
    futureTargetAmount: number; // Matches BE response property
    monthlySaving: number;      // PMT (Tabungan Bulanan)
    years?: number;             // [MERGE] Optional dari Pecahan Raksasa

    // [MERGE] Properti tambahan dari Section 11 Giant Types
    yearsDuration?: number;
    monthsDuration?: number;
    futureExistingFund?: number;   // Modal awal kena investasi
    netTarget?: number;            // Kekurangan (Gap)
}

// ============================================================================
// LEGACY SUPPORT TYPES
// ============================================================================

export type GoalType = "IBADAH" | "LIBURAN" | "PERNIKAHAN" | "LAINNYA";

export interface SpecialGoalInput {
    goalType: GoalType;
    currentCost: number;
    inflationRate: number;
    investmentRate: number;
    duration: number;
}

export interface SpecialGoalResult {
    futureValue: number;
    monthlySaving: number;
}

// ============================================================================
// AGENT SIMULATION TYPES (From Section 11 of Giant Types)
// ============================================================================

// [NEW] GOAL SIMULATION INPUT (STATELESS)
export interface CreateGoalSimulationDto {
    // Identity
    clientName: string;
    clientDob: string;
    clientCity: string;
    clientJob?: string;
    clientPhone?: string;

    // Goal Params
    goalName: string;
    targetAmount: number;
    targetDate: string; // YYYY-MM-DD
    currentSaving?: number; // Modal Awal

    // Economics
    inflationRate?: number;
    returnRate?: number;
}