// ============================================================================
// BUDGETING MODULE TYPES
// ============================================================================

// Data input user (Calculator Standalone)
export interface BudgetInput {
    name: string;
    age: number;
    fixedIncome: number;
    variableIncome: number;
}

// Representasi satu baris alokasi budget (Needs, Wants, Savings, dll)
export interface BudgetAllocation {
    label: string;
    percentage: number;
    amount: number;
    type: "NEEDS" | "DEBT_PROD" | "DEBT_CONS" | "INSURANCE" | "SAVING" | "SURPLUS";
    description: string;
}

// Hasil Kalkulasi Budgeting
export interface BudgetResult {
    safeToSpend: number;
    totalFixedAllocated: number;
    surplus: number;
    allocations: BudgetAllocation[];
}

export interface BudgetPayload {
    monthlyIncome: number;
    variableIncome: number;
}

// [FIX] DTO untuk Create Budget ke Backend (Save Action)
export interface CreateBudgetDto {
    month: number;
    year: number;
    fixedIncome: number;
    variableIncome: number;
    livingCost?: number;
    productiveDebt?: number;
    consumptiveDebt?: number;
    insurance?: number;
    saving?: number;
}

// [FIX] History Data untuk List di Dashboard
export interface BudgetPlanHistory {
    id: string;
    month: number;
    year: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    status: string;
    createdAt: string;
}

// ============================================================================
// AGENT SIMULATION TYPES (From Section 10 of Giant Types)
// ============================================================================

// DTO untuk Simulasi Budgeting oleh Agen
export interface CreateBudgetSimulationDto {
    clientName: string;
    clientDob: string; // Format ISO 'YYYY-MM-DD'
    clientPhone?: string;
    clientCity: string;
    clientJob: string;
    fixedIncome: number;
    variableIncome?: number;
}