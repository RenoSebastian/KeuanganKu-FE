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
  currentAge: number;
  retirementAge: number;
  retirementDuration: number;
  currentExpense: number; // Monthly Expense
  currentFund: number;
  inflationRate: number; // Percentage (e.g. 4)
  investmentRate: number; // Percentage (e.g. 8)
}

export interface PensionResult {
  workingYears: number;
  retirementYears: number;
  fvMonthlyExpense: number;
  fvExistingFund: number;
  totalFundNeeded: number;
  shortfall: number;
  monthlySaving: number;
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

// --- ADMIN DASHBOARD TYPES ---

export interface AdminDashboardStats {
  totalUsers: number;       // Jumlah semua user yang terdaftar
  activeUsers: number;      // Jumlah user dengan status aktif
  inactiveUsers: number;    // Jumlah user non-aktif/suspended
  totalUnits: number;       // Jumlah Unit Kerja/Bidang yang terdaftar
  systemHealth: "Normal" | "Maintenance" | "Degraded"; // Status kesehatan sistem
}

// --- USER MANAGEMENT TYPES ---

export type UserRole = "USER" | "ADMIN" | "DIRECTOR" | "UNIT_HEAD";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  nip: string;              // Nomor Induk Pegawai
  unitId: string;           // ID Unit Kerja (Relasi ke Master Data)
  unitName?: string;        // Nama Unit Kerja (untuk display di tabel)
  role: UserRole;           // Role akses
  isActive: boolean;        // Status akun (True = Aktif, False = Non-Aktif/Resign)
  lastLogin?: string;       // Tanggal login terakhir (ISO String)
  createdAt: string;        // Tanggal pembuatan akun
}

// --- MASTER DATA TYPES (UPDATED: FLAT STRUCTURE) ---

export interface UnitKerja {
  id: string;
  name: string;             // Nama Bidang/Divisi (Misal: "Bidang Keuangan")
  code: string;             // Kode Unit (Misal: "FIN-01")
  userCount?: number;       // Optional: Jumlah karyawan di unit ini (untuk display)
}

// --- NEW MASTER DATA (JABATAN) ---

export interface Jabatan {
  id: string;
  name: string;             // Nama Jabatan (Misal: "Manajer", "Staf")
  level: number;            // Level/Golongan (Misal: 1, 2, 3) - Untuk sorting
  userCount?: number;       // Jumlah karyawan dengan jabatan ini
}

// --- SYSTEM SETTINGS ---

export interface SystemSettings {
  defaultInflationRate: number; // Default Inflasi (%)
  defaultInvestmentRate: number; // Default Return Investasi (%)
  companyName: string;          // Nama Perusahaan (Configurable)
  maintenanceMode: boolean;     // Status Maintenance
}

// --- FINANCIAL HEALTH CHECKUP TYPES (REVISED & DETAILED) ---

export interface FinancialRecord {
  // STEP 1: DATA DIRI (PERSONAL)
  fullName: string;
  age: number;
  maritalStatus: "SINGLE" | "MARRIED";
  dependents: number; // Jumlah Tanggungan

  // STEP 2: NERACA ASET (BALANCE SHEET - ASSETS)
  // 1. Aset Likuid
  assetCash: number;        // Kas & Tabungan
  assetDeposit: number;     // Deposito

  // 2. Aset Investasi
  assetGold: number;        // Logam Mulia
  assetMutualFund: number;  // Reksadana
  assetStocks: number;      // Saham
  assetPropertyInv: number; // Properti Investasi (Sewa/Tanah)
  assetOtherInv: number;    // Barang Koleksi Investasi

  // 3. Aset Personal
  assetHome: number;        // Rumah yang ditempati
  assetVehicle: number;     // Mobil/Motor yang dipakai
  assetJewelry: number;     // Perhiasan dipakai
  assetPersonalOther: number; // Barang koleksi dinikmati

  // STEP 3: NERACA UTANG (BALANCE SHEET - LIABILITIES)
  // 1. Utang Jangka Pendek
  debtCC: number;           // Kartu Kredit / Paylater
  debtPersonal: number;     // Utang ke Teman/Keluarga
  
  // 2. Utang Jangka Panjang
  debtKPR: number;          // Sisa Pokok KPR
  debtKPM: number;          // Sisa Pokok KPM (Kendaraan)
  debtBusiness: number;     // Utang Modal Usaha
  
  // STEP 4: ARUS KAS (CASHFLOW)
  // 1. Arus Kas Masuk (Income)
  incomeFixed: number;      // Penghasilan Tetap (Gaji) - Tahunan
  incomeVariable: number;   // Penghasilan Tidak Tetap (Bonus/Freelance) - Tahunan

  // 2. Arus Kas Keluar (Expenses)
  expenseLiving: number;    // Pengeluaran Rutin Bulanan (Makan, Listrik, dll)
  expenseInsurance: number; // Premi Asuransi (Tahunan)
  
  // 3. Cicilan Utang (Outflow - Debt Service)
  installmentKPR: number;       // Cicilan Rumah (Tahunan)
  installmentKPM: number;       // Cicilan Kendaraan (Tahunan)
  installmentCC: number;        // Cicilan Kartu Kredit/Paylater (Tahunan)
  installmentBusiness: number;  // Cicilan Modal Usaha (Tahunan)
  installmentOther: number;     // Cicilan Lainnya (Tahunan)

  // 4. Saving & Invest (Outflow - Future)
  savingRoutine: number;    // Tabungan Rutin Bulanan (Pendidikan, Hari Tua)
  investRoutine: number;    // Investasi Rutin Bulanan (Reksadana, dll)

  // META
  previousNetWorth?: number; // Kekayaan Bersih Tahun Lalu (Opsional)
}

export type HealthStatus = "SEHAT" | "WASPADA" | "BAHAYA";

export interface RatioDetail {
  id: string;
  label: string;
  value: number;
  benchmark: string;
  status: HealthStatus;
  recommendation: string;
}

export interface HealthAnalysisResult {
  score: number;
  globalStatus: HealthStatus;
  ratios: RatioDetail[];
  netWorth: number;
  generatedAt: string;
}