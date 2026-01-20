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

// ============================================================================
// FINANCIAL HEALTH CHECK UP TYPES (FIXED & GRANULAR)
// Sesuai Dokumen Revisi (A-Q)
// ============================================================================

// 1. Data Diri & Metadata
export interface PersonalInfo {
  name: string;
  dob: string;                // Date YYYY-MM-DD
  gender: "L" | "P";
  ethnicity: string;          // Suku Bangsa
  religion: string;           // Agama
  maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED";
  childrenCount: number;      // Jumlah Anak
  dependentParents: number;   // Orang tua yang ditanggung
  occupation: string;         // Pekerjaan
  city: string;               // Kota Tempat Tinggal
}

export interface FinancialRecord {
  expenseLifestyle: number;

  debtPersonal: number;
  investRoutine: number;
  assetOtherInv: number;
  assetPropertyInv: number;
  savingRoutine: any;
  // --- 1. METADATA ---
  userProfile: PersonalInfo;
  spouseProfile?: PersonalInfo;

  // --- 2. NERACA ASET (HARTA) ---
  
  // A. Aset Likuid
  assetCash: number;          // 1. Kas / setara kas

  // B. Aset Personal
  assetHome: number;          // 2. Rumah / tanah
  assetVehicle: number;       // 3. Kendaraan
  assetJewelry: number;       // 4. Emas Perhiasan
  assetAntique: number;       // 5. Barang antik / koleksi
  assetPersonalOther: number; // 6. Aset personal lain

  // C. Aset Investasi
  assetInvHome: number;       // 1. Rumah / tanah (Inv)
  assetInvVehicle: number;    // 2. Kendaraan (Inv)
  assetGold: number;          // 3. Logam mulia
  assetInvAntique: number;    // 4. Barang antik (Inv)
  assetStocks: number;        // 5. Saham
  assetMutualFund: number;    // 6. Reksadana
  assetBonds: number;         // 7. Obligasi
  assetDeposit: number;       // 8. Deposito jangka panjang
  assetInvOther: number;      // 9. Aset investasi lain

  // --- 3. NERACA UTANG (KEWAJIBAN) - Sisa Pokok ---

  // E. Utang Konsumtif
  debtKPR: number;            // 1. KPR
  debtKPM: number;            // 2. KPM
  debtCC: number;             // 3. Kartu Kredit
  debtCoop: number;           // 4. Koperasi
  debtConsumptiveOther: number; // 5. Utang Lainnya

  // F. Utang Usaha
  debtBusiness: number;       // 1. Utang usaha / UMKM

  // --- 4. ARUS KAS (CASHFLOW) - PER TAHUN ---

  // I. Penghasilan
  incomeFixed: number;        // 1. Pendapatan tetap
  incomeVariable: number;     // 2. Pendapatan tidak tetap

  // --- PENGELUARAN (Input Bulanan x 12 atau Tahunan) ---

  // K. Cicilan Utang
  installmentKPR: number;                 // 1.a
  installmentKPM: number;                 // 1.b
  installmentCC: number;                  // 1.c
  installmentCoop: number;                // 1.d
  installmentConsumptiveOther: number;    // 1.e
  installmentBusiness: number;            // 1.f

  // L. Premi Asuransi
  insuranceLife: number;      // 2.a
  insuranceHealth: number;    // 2.b
  insuranceHome: number;      // 2.c
  insuranceVehicle: number;   // 2.d
  insuranceBPJS: number;      // 2.e
  insuranceOther: number;     // 2.f

  // M. Tabungan/Investasi
  savingEducation: number;    // 3.a
  savingRetirement: number;   // 3.b
  savingPilgrimage: number;   // 3.c (Ibadah)
  savingHoliday: number;      // 3.d (Liburan)
  savingEmergency: number;    // 3.e (Darurat)
  savingOther: number;        // 3.f (Lainnya)

  // N. Belanja Keluarga
  expenseFood: number;        // 4.a Makan Keluarga
  expenseSchool: number;      // 4.b Uang Sekolah
  expenseTransport: number;   // 4.c Transportasi
  expenseCommunication: number; // 4.d Telepon & internet
  expenseHelpers: number;     // 4.e ART / Supir
  expenseTax: number;         // 4.f Pajak (PBB/PKB)
  expenseHouseholdOther: number; // 4.g Belanja rumah tangga lainnya
}

export type HealthStatus = "SEHAT" | "WASPADA" | "BAHAYA" | "AMAN" | "HATI-HATI" | "KURANG" | "IDEAL"; 

export interface RatioDetail {
  status: string;
  id: string;
  label: string;
  value: number;
  benchmark: string;
  statusColor: "GREEN_DARK" | "GREEN_LIGHT" | "YELLOW" | "RED";
  recommendation: string;
}

export interface HealthAnalysisResult {
  score: number;
  globalStatus: string;
  ratios: RatioDetail[];
  netWorth: number;         // H. Kekayaan Bersih
  surplusDeficit: number;   // Q. Surplus/Defisit
  generatedAt: string;
}