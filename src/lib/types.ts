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

// --- BUDGETING TYPES ---

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

// --- PENSION TYPES ---

export interface PensionInput {
  currentAge: number;       // Usia Sekarang
  retirementAge: number;    // Usia Pensiun
  retirementDuration: number; // NEW: Jangka Waktu Penerimaan (Bisa 1 th, 5 th, 20 th, dll)
  currentExpense: number;   // Pengeluaran Bulanan Saat Ini / Target Pemasukan
  currentFund: number;      // NEW: Saldo JHT/DPLK/Tabungan Saat Ini
  inflationRate: number;    // Asumsi Inflasi (%)
  investmentRate: number;   // Asumsi Return Investasi (%)
}

export interface PensionResult {
  workingYears: number;     // Masa Kerja (n)
  retirementYears: number;  // Masa Pensiun (Sesuai input retirementDuration)
  fvMonthlyExpense: number; // Biaya Hidup/Bulan saat Pensiun (Future Value)
  
  fvExistingFund: number;   // NEW: Nilai masa depan dari saldo awal (currentFund)
  totalFundNeeded: number;  // Total Dana yang Dibutuhkan saat Pensiun (Corpus)
  shortfall: number;        // NEW: Kekurangan dana (Total - Existing)
  
  monthlySaving: number;    // Tabungan Bulanan yang Harus Disisihkan Sekarang
}

// --- INSURANCE TYPES (FIXED: NO TAX) ---

export interface InsuranceInput {
  // 4.A Dana Melunasi Utang (Liabilities)
  debtKPR: number;          // Sisa Utang KPR
  debtKPM: number;          // Sisa Utang Kendaraan (Mobil/Motor)
  debtProductive: number;   // Utang Produktif / Modal Usaha
  debtConsumptive: number;  // Utang Konsumtif (Kartu Kredit, Paylater)
  debtOther: number;        // Utang Lainnya (Arisan, Pinjam Teman)

  // 4.B Dana Penggantian Penghasilan (Income Replacement)
  annualIncome: number;     // Penghasilan Bersih per Tahun
  protectionDuration: number; // Masa Perlindungan (Tahun) - n
  inflationRate: number;    // Asumsi Inflasi (%)
  investmentRate: number;   // Asumsi Return Investasi (%)

  // 4.C Biaya Duka (Final Expenses)
  finalExpense: number;     // Biaya Pemakaman & RS Terakhir
  
  // (Pajak dihapus sesuai Menu 4)

  // 4.D Asuransi Lama
  existingInsurance: number; // Total UP Asuransi Jiwa yang sudah dimiliki
}

export interface InsuranceResult {
  totalDebt: number;              // Total Kewajiban (Sum of 4.A)
  incomeReplacementValue: number; // Nilai Pertanggungan Penghasilan (PVAD calculation)
  totalFundNeeded: number;        // Total Kebutuhan (Utang + Income + Duka)
  shortfall: number;              // Kekurangan UP (Total Kebutuhan - Asuransi Lama)
}

// --- SPECIAL GOAL TYPES (MENU 6) ---

export type GoalType = "IBADAH" | "LIBURAN" | "PERNIKAHAN" | "LAINNYA";

export interface SpecialGoalInput {
  goalType: GoalType;       // 1) Ibadah, 2) Liburan, 3) Pernikahan, 4) Lainnya
  currentCost: number;      // 6.3 Dana yang dibutuhkan sekarang (PV)
  inflationRate: number;    // 6.4 Perkiraan inflasi (%)
  investmentRate: number;   // 6.5 Harapan tingkat investasi (%)
  duration: number;         // 6.6 Jangka waktu (n tahun)
}

export interface SpecialGoalResult {
  futureValue: number;      // FVn: Nilai dana di masa depan
  monthlySaving: number;    // PMT: Tabungan per bulan
}