// ============================================================================
// 1. UI STATE TYPES (FROM BRANCH SEMENTARA_1)
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


// ============================================================================
// 2. API PAYLOAD TYPES (REQ KE BACKEND)
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

export interface InsurancePayload {
  type: "LIFE" | "HEALTH" | "CRITICAL_ILLNESS";
  dependentCount: number;
  monthlyExpense: number;
  existingDebt?: number;
  existingCoverage?: number;
  protectionDuration?: number;
}

export interface GoalPayload {
  goalName: string;
  targetAmount: number;
  targetDate: string; // YYYY-MM-DD
  inflationRate?: number;
  returnRate?: number;
}

// --- EDUCATION PAYLOAD (GRANULAR) ---
export interface EducationStagePayload {
  level: "TK" | "SD" | "SMP" | "SMA" | "PT"; // Enum SchoolLevel
  costType: "ENTRY" | "ANNUAL";             // Enum CostType
  currentCost: number;
  yearsToStart: number;
}

export interface EducationPayload {
  childName: string;
  childDob: string; // YYYY-MM-DD
  method?: "ARITHMETIC" | "GEOMETRIC";
  inflationRate?: number;
  returnRate?: number;
  stages: EducationStagePayload[]; // Array of granular stages
}


// ============================================================================
// 3. API RESPONSE TYPES (RES DARI BACKEND)
// ============================================================================

export interface StageBreakdownItem {
  level: "TK" | "SD" | "SMP" | "SMA" | "PT";
  costType: "ENTRY" | "ANNUAL";
  currentCost: number;
  yearsToStart: number;
  
  // Hasil Hitungan Backend
  futureCost: number;      // FV Item Ini
  monthlySaving: number;   // Tabungan Item Ini
}

export interface EducationCalculationResult {
  totalFutureCost: number;
  monthlySaving: number; // Total Saving (Sum of items)
  stagesBreakdown: StageBreakdownItem[]; // Data Rincian Granular (Drill Down)
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
  calculation: EducationCalculationResult; // Object hasil hitungan
}

// --- ADAPTER TYPE (PENTING AGAR UI TIDAK ERROR) ---
// Tipe ini menjembatani data UI (ChildProfile) dengan data Backend (EducationPlanResponse)
// Digunakan di ChildCard & SimulationResult
export interface ChildSimulationResult {
  childId?: string;
  childName?: string;
  totalMonthlySaving: number; 
  // Support data granular baru dari Backend
  stagesBreakdown?: StageBreakdownItem[];
  // Support legacy data (opsional, jaga-jaga)
  stages?: any[]; 
}

// Represents the calculation result for a single education stage (e.g., TK)
export interface StageResult {
  stageId: string;
  label: string;
  startGrade: number;
  paymentFrequency: "MONTHLY" | "SEMESTER";
  totalFutureCost: number;
  monthlySaving: number;
  // Optional: Detailed breakdown if your logic supports it
  details?: any[]; 
}

// Represents the summary of calculations for all children
export interface PortfolioSummary {
  grandTotalMonthlySaving: number;
  totalFutureCost: number;
  details: ChildSimulationResult[]; // Reusing your existing ChildSimulationResult
}


// ============================================================================
// 4. EXISTING TYPES (BUDGET, PENSION, ETC - TIDAK BERUBAH)
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
  colorClass: string; 
}

export interface BudgetResult {
  safeToSpend: number; 
  allocations: BudgetAllocation[];
  totalFixedAllocated: number; 
  surplus: number;     
}

// --- PENSION TYPES (Client Side View) ---

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

// --- INSURANCE TYPES ---

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

// --- SPECIAL GOAL TYPES ---

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

// --- ADMIN & SYSTEM TYPES ---

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
// 5. FINANCIAL HEALTH CHECK UP TYPES
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

export type HealthStatus = "SEHAT" | "WASPADA" | "BAHAYA" | "AMAN" | "HATI-HATI" | "KURANG" | "IDEAL"; 

export interface RatioDetail {
  id: string;
  label: string;
  value: number;
  benchmark: string;
  statusColor: "GREEN_DARK" | "GREEN_LIGHT" | "YELLOW" | "RED";
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
}