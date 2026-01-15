// --- TIPE DATA UTAMA ---

export interface EducationStage {
  id: string;       // "TK", "SD", "KULIAH", dll
  label: string;
  entryAge: number; // Usia masuk default
  duration: number; // Lama sekolah (tahun)
  paymentFrequency: "MONTHLY" | "SEMESTER"; // Baru: Pembeda SPP vs UKT
}

// Data input user
export interface PlanInput {
  stageId: string;
  startGrade: number; // Baru: Default 1. Bisa 2, 3, dst.
  costNow: {
    entryFee: number;   
    monthlyFee: number; // SPP (x12) atau UKT (x2)
  };
}

export interface ChildProfile {
  id: string;
  name: string;
  dob: string;
  gender: "L" | "P";
  avatarColor: string;
  plans: PlanInput[];
}

// --- TIPE DATA HASIL (OUTPUT) ---

export interface StageResult {
  stageId: string;
  label: string;
  startGrade: number; // Baru: Info kelas mulai
  paymentFrequency: string; // Baru: Info tipe bayar
  
  // Hasil Perhitungan
  totalFutureCost: number; // Total nominal yang harus dibayarkan nanti
  monthlySaving: number;   // Total tabungan per bulan yang harus disisihkan SEKARANG
  
  // Detail Cashflow (Opsional jika mau ditampilkan di PDF nanti)
  details?: {
    item: string;
    dueYear: number; // Berapa tahun lagi
    futureCost: number;
    requiredSaving: number;
  }[];
}

export interface ChildSimulationResult {
  childId: string;
  childName: string;
  stages: StageResult[];
  totalMonthlySaving: number; // Sum of stages monthly saving
}

export interface PortfolioSummary {
  grandTotalMonthlySaving: number;
  totalFutureCost: number;
  details: ChildSimulationResult[];
}
export interface BudgetInput {
  name: string;
  age: number;
  fixedIncome: number;    // Gaji Tetap
  variableIncome: number; // Bonus/Freelance
}

export interface BudgetAllocation {
  label: string;
  percentage: number; // 20, 15, 10, dll
  amount: number;     // Nilai Rupiah
  type: "NEEDS" | "DEBT_PROD" | "DEBT_CONS" | "INSURANCE" | "SAVING" | "SURPLUS";
  description: string;
  colorClass: string; // Utk styling (bg-red-100, dll)
}

export interface BudgetResult {
  safeToSpend: number; // 45% untuk Hidup
  allocations: BudgetAllocation[];
  totalFixedAllocated: number; // Total yang "diambil" sistem (55%)
  surplus: number;     // Variable Income
}