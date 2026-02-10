// ============================================================================
// SRC/LIB/TYPES.TS
// THE CORE DATA CONTRACTS (CLEAN ARCHITECTURE)
// ============================================================================

// ============================================================================
// 1. EDUCATION MODULE (WIZARD & CALCULATOR)
// ============================================================================

export interface EducationStage {
  id: string;       // "TK", "SD", "S1", dll
  label: string;
  entryAge: number; // Usia masuk default
  duration: number; // Lama sekolah (tahun)
  paymentFrequency: "MONTHLY" | "SEMESTER"; // Pembeda SPP vs UKT
}

export type EducationLevel = "TK" | "SD" | "SMP" | "SMA" | "S1" | "S2";

// Data input user (Client Side - digunakan di Wizard)
export interface PlanInput {
  stageId: string;
  startGrade: number; // Default 1
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

export interface EducationStagePayload {
  level: EducationLevel;
  costType: "ENTRY" | "ANNUAL";
  currentCost: number;
  yearsToStart: number;
}

export interface EducationPayload {
  childName: string;
  childDob: string; // YYYY-MM-DD
  method?: "STATIC" | "GEOMETRIC"; // Updated to match BE enum
  inflationRate?: number;
  returnRate?: number;
  stages?: EducationStagePayload[]; // Optional if logic handled in BE
}

// [FIX] Alias DTO untuk Service
export interface CreateEducationPlanDto extends EducationPayload { }

export interface StageBreakdownItem {
  requiredSaving: number;
  item: any;
  dueYear: number;
  stage: string;
  stageId: string;
  level: EducationLevel;
  costType: "ENTRY" | "ANNUAL"; // Changed from ENTRY | MONTHLY to match BE
  currentCost: number;
  yearsToStart: number;

  // Hasil Hitungan Math
  futureCost: number;      // FV Item Ini
  monthlySaving: number;   // Tabungan Item Ini
}

export interface EducationCalculationResult {
  totalFutureCost: number;
  monthlySaving: number; // Total Saving (Sum of items)
  stagesBreakdown: StageBreakdownItem[]; // Data Rincian Granular
}

export interface EducationPlanResponse {
  plan: {
    id: string;
    userId: string;
    childName: string;
    childDob: string;
    createdAt: string;
    inflationRate: number;
    returnRate: number;
    method?: string;
  };
  calculation: EducationCalculationResult;
}

// [FIX] Alias Data Response untuk Service
export interface EducationPlanData extends EducationPlanResponse { }

export interface StageDetailItem {
  item: string;
  dueYear: number;
  futureCost: number;
  requiredSaving: number;
}

export interface StageResult {
  stageId: string;
  label: string;
  startGrade: number;
  paymentFrequency: "MONTHLY" | "SEMESTER";
  totalFutureCost: number;
  monthlySaving: number;
  details: StageDetailItem[];
}

// Adapter Type untuk UI Components
export interface ChildSimulationResult {
  childId?: string;
  childName?: string;
  totalMonthlySaving: number;
  stagesBreakdown?: StageBreakdownItem[]; // Dari API Backend
  stages?: StageResult[]; // Dari Client Calculation (Legacy Support / Direct Calc)
}

export interface PortfolioSummary {
  grandTotalMonthlySaving: number;
  totalFutureCost: number;
  details: ChildSimulationResult[];
}


// ============================================================================
// 2. BUDGETING MODULE (REFACTORED)
// ============================================================================

export interface BudgetInput {
  name: string;
  age: number;
  fixedIncome: number;
  variableIncome: number;
}

export interface BudgetAllocation {
  label: string;
  percentage: number;
  amount: number;
  type: "NEEDS" | "DEBT_PROD" | "DEBT_CONS" | "INSURANCE" | "SAVING" | "SURPLUS";
  description: string;
}

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

// [FIX] DTO untuk Create Budget ke Backend
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

// [FIX] History Data untuk List
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
// 3. PENSION & INSURANCE MODULES
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

export interface PensionPlanData {
  id: string;
  currentAge: number;
  retirementAge: number;
  totalFundNeeded: number;
  monthlySaving: number;
  createdAt: string;
}

export interface PensionInput {
  currentAge: number;
  retirementAge: number;
  retirementDuration: number;
  currentExpense: number;
  currentFund: number;
  inflationRate: number;
  investmentRate: number;
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

export interface InsurancePayload {
  type: "LIFE" | "HEALTH" | "CRITICAL_ILLNESS";
  dependentCount: number;
  monthlyExpense: number;
  existingDebt?: number;
  existingCoverage?: number;
  protectionDuration?: number;
  finalExpense?: number;         // [NEW] Tambahkan agar sinkron dengan DTO Backend
  inflationRate?: number;
  returnRate?: number;           // [UPDATED] Gunakan returnRate agar konsisten dengan Backend
  investmentReturnRate?: number; // Keep for legacy if needed
}

// [FIX] Alias DTO & Response Data
export interface CreateInsuranceDto extends InsurancePayload {
  // Field wajib di Backend, optional di UI Payload interface sebelumnya
  existingDebt: number;
  existingCoverage: number;
  protectionDuration: number;
}

export interface InsurancePlanData {
  id: string;
  type: string;
  coverageNeeded: number;
  recommendation: string;
  createdAt: string;
}

export interface InsuranceInput {
  investmentRate: number;
  debtKPR: number;
  debtKPM: number;
  debtProductive: number;
  debtConsumptive: number;
  debtOther: number;
  annualIncome: number;
  protectionDuration: number;
  inflationRate: number;
  returnRate: number;
  finalExpense: number;
  existingInsurance: number;
}

export interface InsuranceResult {
  totalDebt: number;
  incomeReplacementValue: number;
  totalFundNeeded: number;
  shortfall: number;
  otherneeds?: number;
}


// ============================================================================
// 4. GOAL SIMULATION (UPDATED)
// ============================================================================

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

export interface GoalPlanData {
  id: string;
  goalName: string;
  targetAmount: number;
  futureValue: number;
  monthlySaving: number;
  createdAt: string;
}

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
  years: number;
}

// Legacy Support
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
// 5. FINANCIAL HEALTH CHECK UP (REFACTORED)
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
  phone?: string; // Added phone
}

// [VERIFIED] Struktur ini sinkron 100% dengan field di Backend Prisma Schema
export interface FinancialRecord {
  id?: string;
  checkDate?: string;
  userProfile: PersonalInfo;
  spouseProfile?: PersonalInfo;

  // A. Aset Likuid
  assetCash: number;

  // B. Aset Personal
  assetHome: number;
  assetVehicle: number;
  assetJewelry: number;
  assetAntique: number;
  assetPersonalOther: number;

  // C. Aset Investasi
  assetInvHome: number;
  assetInvVehicle: number;
  assetGold: number;
  assetInvAntique: number;
  assetStocks: number;
  assetMutualFund: number;
  assetBonds: number;
  assetDeposit: number;
  assetInvOther: number;

  // E. Utang Konsumtif
  debtKPR: number;
  debtKPM: number;
  debtCC: number;
  debtCoop: number;
  debtConsumptiveOther: number;

  // F. Utang Usaha
  debtBusiness: number;

  // I. Penghasilan
  incomeFixed: number;
  incomeVariable: number;

  // K. Cicilan Utang
  installmentKPR: number;
  installmentKPM: number;
  installmentCC: number;
  installmentCoop: number;
  installmentConsumptiveOther: number;
  installmentBusiness: number;

  // L. Premi Asuransi
  insuranceLife: number;
  insuranceHealth: number;
  insuranceHome: number;
  insuranceVehicle: number;
  insuranceBPJS: number;
  insuranceOther: number;

  // M. Tabungan/Investasi
  savingEducation: number;
  savingRetirement: number;
  savingPilgrimage: number;
  savingHoliday: number;
  savingEmergency: number;
  savingOther: number;

  // N. Belanja Keluarga
  expenseFood: number;
  expenseSchool: number;
  expenseTransport: number;
  expenseCommunication: number;
  expenseHelpers: number;
  expenseTax: number;
  expenseLifestyle: number;
}

// [FIX] Alias DTO
export interface CreateFinancialRecordDto extends FinancialRecord { }

export type HealthStatus = "SEHAT" | "WASPADA" | "BAHAYA" | "AMAN" | "HATI-HATI" | "KURANG" | "IDEAL" | "SANGAT SEHAT";

// [VERIFIED] Ratio Detail Interface
export interface RatioDetail {
  id: string;
  label: string;
  value: number;
  benchmark: string; // or threshold
  statusColor: string;
  recommendation: string;
  status?: string;
  threshold?: string; // Add threshold for compatibility
  description?: string;
}

export interface HealthAnalysisResult {
  score: number;
  globalStatus: string;
  ratios: RatioDetail[];
  netWorth: number;
  surplusDeficit: number;
  generatedAt?: string;
}

// [FIX] Intersection Type for Full Data
export interface FinancialCheckupData extends FinancialRecord, HealthAnalysisResult { }

// [FIX] History List Item
export interface FinancialRecordHistory {
  id: string;
  checkDate: string;
  healthScore: number;
  status: string;
  totalNetWorth: number;
}

// [NEW] Interface Khusus untuk Response "Lihat Detail" (Modal Pop-up)
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
// 6. ADMIN & SYSTEM DASHBOARD TYPES
// ============================================================================

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalUnits: number;
  systemHealth: "Normal" | "Maintenance" | "Degraded";
}

export type UserRole = "USER" | "ADMIN" | "DIRECTOR" | "UNIT_HEAD";

export interface UnitKerja {
  id: string;
  kodeUnit: string;
  namaUnit: string;
  name?: string; // Fallback untuk compatibility
  code?: string; // Fallback
  userCount?: number;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  nip: string;
  unitId?: string; // Untuk backward compatibility
  unitKerjaId?: string;
  unitKerja?: UnitKerja;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Jabatan {
  id: string;
  name: string;
  level: number;
  userCount?: number;
}

export interface SystemSettings {
  defaultInflationRate: number;
  defaultInvestmentRate: number;
  companyName: string;
  maintenanceMode: boolean;
}


// ============================================================================
// 7. EXECUTIVE / DIRECTOR DASHBOARD TYPES
// ============================================================================

export interface StatusCountDto {
  SEHAT: number;
  WASPADA: number;
  BAHAYA: number;
}

export interface DirectorDashboardStats {
  totalEmployees: number;
  avgHealthScore: number;
  riskyEmployeesCount: number;
  totalAssetsManaged: number;
  statusCounts?: StatusCountDto; // Optional agar tidak error jika BE lama
  monthlyHealthTrend?: number[];
}

export interface UnitHealthRanking {
  id: string;
  unitName: string;
  avgScore: number;
  employeeCount: number;
  status: "SEHAT" | "WASPADA" | "BAHAYA";
}

export interface RiskyEmployeeDetail {
  id: string;
  fullName: string;
  unitName: string;
  healthScore: number;
  debtToIncomeRatio?: number; // Optional (sesuai DTO Backend)
  lastCheckDate: string;      // Rename dari 'lastCheckupDate' agar sesuai DTO Backend
  status: "BAHAYA" | "WASPADA";
}

// [NEW] Interface untuk Detail Audit Karyawan (Wrapper Utama)
export interface AuditProfile {
  id: string;
  fullName: string;
  unitName: string;
  email: string;
  status: HealthStatus;
  healthScore: number;
  lastCheckDate: string;
}

export interface EmployeeAuditDetail {
  profile: AuditProfile;
  record: FinancialRecord;        // Menggunakan tipe FinancialRecord yang sudah ada (40+ vars)
  analysis: HealthAnalysisResult; // Menggunakan tipe HealthAnalysisResult yang sudah ada
}

// [NEW] Interface untuk Dashboard Orchestrator (Composite Response)
export interface DashboardSummaryDto {
  stats: DirectorDashboardStats;
  topRiskyEmployees: RiskyEmployeeDetail[];
  unitRankings: UnitHealthRanking[];
  meta: {
    generatedAt: string; // ISO String
  };
}

// ============================================================================
// 8. AUTH TYPES (INTEGRATION PHASE 1)
// ============================================================================

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  role?: string;
  nip?: string;
  unitKerja?: string;
}

// [UPDATED] USER INTERFACE SINKRON DENGAN BACKEND PRISMA SCHEMA
export interface User {
  id: string;
  email: string;
  fullName: string;
  name?: string;    // Fallback
  role: UserRole;
  nip?: string;
  dateOfBirth?: string;

  // --- [NEW] ADDITIONAL PROFILE FIELDS ---
  avatar?: string;      // [ADDITION] Foto diri (Base64 String)
  gender?: string;      // [ADDITION] Jenis Kelamin
  address?: string;     // [ADDITION] Alamat Domisili
  noWa?: string;        // [ADDITION] Nomor WhatsApp
  agencyName?: string;  // [ADDITION] Nama Perusahaan Asuransi
  agentLevel?: string;  // [ADDITION] Jabatan/Level Agen
  companyName?: string;
  goals?: string;
  // ----------------------------------------

  unitKerja?: UnitKerja;
  createdAt?: string;
  updatedAt?: string;

  // Properti untuk hasil pencarian & dashboard
  financialChecks?: {
    status: HealthStatus;
    healthScore: number;
    checkDate?: string;
  }[];
}

export interface AuthResponse {
  access_token: string;
  user: User;
}



// ============================================================================
// 9. HYBRID SEARCH TYPES (NEW INTEGRAION)
// ============================================================================

export interface SearchResultMetadata {
  source: "MEILI_ENGINE" | "DB_FALLBACK";
  isFuzzy: boolean;
}

export interface SearchResult {
  id: string;           // ID unik untuk list key (misal: "db_PERSON_123")
  redirectId: string;   // ID asli untuk navigasi (UUID User / Unit)
  type: "PERSON" | "UNIT";
  title: string;        // Nama User / Nama Unit
  subtitle: string;     // Email / Kode Unit
  metadata: SearchResultMetadata;
}

export interface SearchResponse {
  success: boolean;
  data: SearchResult[];
  meta: {
    total: number;
    limit: number;
    query: string;
  };
}

// --- UI/UX HELPERS ---

export interface HelpContent {
  title: string;       // Judul field (misal: Aset Likuid)
  definition: string;  // Penjelasan singkat & padat
  includes?: string[]; // Array string: Apa saja yang masuk kategori ini
  excludes?: string[]; // Array string: Apa yang TIDAK masuk
  example?: string;    // Contoh konkret angka/kasus
}

// ============================================================================
// 10. AGENT SIMULATION TYPES (BUDGETING, INSURANCE, & PENSION)
// ============================================================================

export interface CreateBudgetSimulationDto {
  clientName: string;
  clientDob: string; // Format ISO 'YYYY-MM-DD'
  clientPhone?: string;
  clientCity: string;
  clientJob: string;
  fixedIncome: number;
  variableIncome?: number;
}

// [INSURANCE SIMULATION]
export interface CreateInsuranceSimulationDto {
  // Identity
  clientName: string;
  clientDob: string;
  clientCity: string;
  clientJob: string;
  clientPhone?: string;

  // Calculation Params
  type: 'LIFE' | 'HEALTH' | 'CRITICAL_ILLNESS';
  dependentCount: number;
  monthlyExpense: number;
  existingDebt: number;
  existingCoverage: number;
  protectionDuration: number;
  finalExpense?: number; // Optional
  inflationRate?: number;
  returnRate?: number;
}

export interface InsuranceSimulationResult {
  // Granular
  annualExpense: number;
  nettRatePercentage: string;
  incomeReplacementValue: number;
  debtClearanceValue: number;
  otherNeeds: number;

  // Aggregated
  totalNeeded: number;
  coverageGap: number;
  recommendation: string;
}

// [NEW] PENSION SIMULATION INPUT (STATELESS)
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
  lifeExpectancy?: number;
  currentExpense: number;
  currentSaving?: number;

  // Assumptions
  inflationRate?: number;
  returnRate?: number;
}

// [NEW] PENSION SIMULATION OUTPUT (Decoded from .mgc Token)
export interface PensionSimulationResult {
  yearsToRetire: number;
  retirementDuration: number;
  futureMonthlyExpense: number; // Shock Therapy Value
  totalFundNeeded: number;
  fvExistingFund: number;
  shortfall: number;
  monthlySaving: number; // Solution Value
}

export interface SimulationResponse {
  message: string;
  data: {
    preview: any;
    download: {
      pdf_url: string;
      mgc_token: string;
      filename_mgc: string;
    };
    recommendation: string;
  };
}

// ============================================================================
// 11. GOAL SIMULATION TYPES (STATELESS)
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

// [NEW] GOAL SIMULATION OUTPUT (Decoded from .mgc Token)
export interface GoalSimulationResult {
  // Time
  yearsDuration: number;
  monthsDuration: number;

  // Future Values
  futureTargetAmount: number;   // Target dana kena inflasi
  futureExistingFund: number;   // Modal awal kena investasi

  // Calculation
  netTarget: number;            // Kekurangan (Gap)
  monthlySaving: number;        // PMT (Solusi)
}