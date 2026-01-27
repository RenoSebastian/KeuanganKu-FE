// ============================================================================
// SRC/LIB/TYPES.TS
// THE CORE DATA CONTRACTS (CLEAN ARCHITECTURE)
// ============================================================================

// ============================================================================
// 1. EDUCATION MODULE (WIZARD & CALCULATOR)
// ============================================================================

export interface EducationStage {
  id: string;       // "TK", "SD", "KULIAH", dll
  label: string;
  entryAge: number; // Usia masuk default
  duration: number; // Lama sekolah (tahun)
  paymentFrequency: "MONTHLY" | "SEMESTER"; // Pembeda SPP vs UKT
}

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
  level: "TK" | "SD" | "SMP" | "SMA" | "PT"; 
  costType: "ENTRY" | "ANNUAL";             
  currentCost: number;
  yearsToStart: number;
}

export interface EducationPayload {
  childName: string;
  childDob: string; // YYYY-MM-DD
  method?: "ARITHMETIC" | "GEOMETRIC";
  inflationRate?: number;
  returnRate?: number;
  stages: EducationStagePayload[]; 
}

export interface StageBreakdownItem {
  requiredSaving: number;
  item: any;
  dueYear: number;
  stage: string;
  stageId: string;
  level: "TK" | "SD" | "SMP" | "SMA" | "PT";
  costType: "ENTRY" | "ANNUAL";
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
  allocations: BudgetAllocation[];
  totalFixedAllocated: number; 
  surplus: number;     
}

export interface BudgetPayload {
  monthlyIncome: number;
  variableIncome: number;
  // Backend akan menghitung alokasi (50/30/20) secara otomatis
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
}

export interface InsuranceInput {
  debtKPR: number;            
  debtKPM: number;            
  debtProductive: number;   
  debtConsumptive: number;  
  debtOther: number;        
  annualIncome: number;     
  protectionDuration: number; 
  inflationRate: number;    
  investmentRate: number;   
  finalExpense: number;     
  existingInsurance: number; 
}

export interface InsuranceResult {
  totalDebt: number;              
  incomeReplacementValue: number; 
  totalFundNeeded: number;        
  shortfall: number;              
}


// ============================================================================
// 4. GOAL SIMULATION (PAM JAYA MENU 6)
// ============================================================================

export interface GoalPayload {
  goalName: string;
  targetAmount: number;
  targetDate: string; 
  inflationRate?: number;
  returnRate?: number;
}

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

export interface GoalSimulationInput {
  currentCost: number;   // PV
  inflationRate: number; // i
  returnRate: number;    // r
  years: number;         // n
}

export interface GoalSimulationResult {
  futureCost: number;    // FV
  monthlySaving: number; // PMT
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
}

export interface FinancialRecord {
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

export type HealthStatus = "SEHAT" | "WASPADA" | "BAHAYA" | "AMAN" | "HATI-HATI" | "KURANG" | "IDEAL" | "SANGAT SEHAT"; 

export interface RatioDetail {
  id: string;
  label: string;
  value: number;
  benchmark: string;
  grade: "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL"; 
  statusColor?: string; // Tambahan untuk mapping warna dari backend (GREEN_DARK, dll)
  recommendation: string;
  status?: string; 
}

export interface HealthAnalysisResult {
  score: number;
  globalStatus: string;
  ratios: RatioDetail[];
  netWorth: number;         
  surplusDeficit: number;   
  generatedAt: string;
  // Fallback props untuk data dari DB raw
  incomeFixed?: number;
  incomeVariable?: number;
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

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  nip: string;              
  unitId: string;           
  unitName?: string;        
  role: UserRole;           
  isActive: boolean;        
  lastLogin?: string;       
  createdAt: string;        
}

export interface UnitKerja {
  id: string;
  name: string;             
  code: string;             
  userCount?: number;       
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
  name: string;
  email: string;
  password: string;
  role?: string;
  nip?: string;
  unitKerjaId?: string;
}

// [UPDATED] USER INTERFACE SESUAI BACKEND
export interface User {
  id: string;
  email: string;
  fullName: string; // sesuaikan dengan backend (fullName bukan name)
  name?: string;    // fallback
  role: UserRole;
  nip?: string;
  dateOfBirth?: string;
  unitKerja?: UnitKerja; // Nested object
  createdAt?: string;
  updatedAt?: string;
  // [ADDITION] Properti untuk hasil pencarian (Fuzzy Search)
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
  id: string;          // ID unik untuk list key (misal: "db_PERSON_123")
  redirectId: string;  // ID asli untuk navigasi (UUID User / Unit)
  type: "PERSON" | "UNIT";
  title: string;       // Nama User / Nama Unit
  subtitle: string;    // Email / Kode Unit
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