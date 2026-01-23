import { 
  BudgetResult, BudgetAllocation, ChildProfile, EducationStage, 
  PlanInput, PortfolioSummary, StageResult, ChildSimulationResult, 
  PensionInput, PensionResult,
  InsuranceInput, InsuranceResult,
  SpecialGoalInput, SpecialGoalResult,
  FinancialRecord, HealthAnalysisResult, 
  RatioDetail, HealthStatus,
} from "./types";

// --- DATABASE JENJANG ---
export const STAGES_DB: EducationStage[] = [
  { id: "TK", label: "TK / PAUD", entryAge: 5, duration: 2, paymentFrequency: "MONTHLY" },
  { id: "SD", label: "Sekolah Dasar", entryAge: 7, duration: 6, paymentFrequency: "MONTHLY" },
  { id: "SMP", label: "SMP", entryAge: 13, duration: 3, paymentFrequency: "MONTHLY" },
  { id: "SMA", label: "SMA", entryAge: 16, duration: 3, paymentFrequency: "MONTHLY" },
  { id: "KULIAH", label: "Sarjana (S1)", entryAge: 19, duration: 4, paymentFrequency: "SEMESTER" },
  { id: "S2", label: "Magister (S2)", entryAge: 23, duration: 2, paymentFrequency: "SEMESTER" },
];

// --- BASIC HELPERS ---

export const formatRupiah = (val: number) => 
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

export const calculateAge = (dob: string): number => {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

// 1. Rumus FV (Future Value)
export const calculateFV = (pv: number, inflationRate: number, years: number): number => {
  return pv * Math.pow(1 + inflationRate / 100, years);
};

// 2. Rumus PMT (Payment / Tabungan Rutin)
export const calculatePMT = (
  fv: number, 
  investmentRate: number, 
  years: number
): number => {
  if (years <= 0) return fv;

  const rate = investmentRate / 100;
  // Jika rate 0, pembagian biasa
  if (rate === 0) return fv / years / 12;

  const annualPMT = (fv * rate) / (Math.pow(1 + rate, years) - 1);
  return annualPMT / 12;
};

// --- ADVANCED CALCULATION ENGINE (EDUCATION - CLIENT SIDE) ---
// Note: Masih dipakai di UI Wizard Pendidikan untuk preview cepat sebelum save ke DB

const calculateStageGranular = (
  input: PlanInput, 
  childAge: number, 
  inflation: number, 
  returnRate: number
): StageResult | null => {
  
  const refStage = STAGES_DB.find(s => s.id === input.stageId);
  if (!refStage) return null;

  let gradeOffset = 0;
  if (refStage.paymentFrequency === "SEMESTER") {
    gradeOffset = Math.floor((input.startGrade - 1) / 2);
  } else {
    gradeOffset = input.startGrade - 1;
  }

  const targetEntryAge = refStage.entryAge + gradeOffset;
  let yearsUntilEntry = targetEntryAge - childAge;
  if (yearsUntilEntry < 0) yearsUntilEntry = 0;

  let totalFutureCost = 0;
  let totalMonthlySaving = 0;
  const breakdownDetails: any[] = [];

  // Uang Pangkal
  if (input.startGrade === 1 && input.costNow.entryFee > 0) {
    const timeDistance = yearsUntilEntry;
    const fvEntry = calculateFV(input.costNow.entryFee, inflation, timeDistance);
    const savingReq = calculatePMT(fvEntry, returnRate, timeDistance);

    totalFutureCost += fvEntry;
    totalMonthlySaving += savingReq;

    breakdownDetails.push({
      item: "Uang Pangkal",
      dueYear: timeDistance,
      futureCost: fvEntry,
      requiredSaving: savingReq
    });
  }

  // Biaya Periodik
  const remainingDuration = refStage.duration - gradeOffset;

  for (let i = 0; i < remainingDuration; i++) {
    const timeDistance = yearsUntilEntry + i;
    let yearlyBaseCost = 0;
    let labelItem = "";

    if (refStage.paymentFrequency === "MONTHLY") {
      yearlyBaseCost = input.costNow.monthlyFee * 12; 
      if (refStage.id === "TK") {
        const effectiveGrade = input.startGrade + i;
        labelItem = effectiveGrade === 1 ? "SPP TK A" : "SPP TK B";
      } else {
        labelItem = `SPP Tahun ke-${i + 1}`;
      }
    } else {
      yearlyBaseCost = input.costNow.monthlyFee * 2; 
      labelItem = `UKT Tahun ke-${i + 1}`;
    }

    if (yearlyBaseCost > 0) {
      const fvYearly = calculateFV(yearlyBaseCost, inflation, timeDistance);
      const savingReq = calculatePMT(fvYearly, returnRate, timeDistance);

      totalFutureCost += fvYearly;
      totalMonthlySaving += savingReq;

      breakdownDetails.push({
        item: labelItem,
        dueYear: timeDistance,
        futureCost: fvYearly,
        requiredSaving: savingReq
      });
    }
  }

  return {
    stageId: input.stageId,
    label: refStage.label,
    startGrade: input.startGrade,
    paymentFrequency: refStage.paymentFrequency,
    totalFutureCost,
    monthlySaving: totalMonthlySaving,
    details: breakdownDetails
  };
};

export const calculatePortfolio = (
  children: ChildProfile[], 
  inflation: number, 
  returnRate: number
): PortfolioSummary => {
  let grandTotalSaving = 0;
  let totalPortfolioCost = 0;
  const details: ChildSimulationResult[] = [];

  children.forEach(child => {
    const childAge = calculateAge(child.dob);
    const stageResults: StageResult[] = [];
    let childTotalSaving = 0;
    child.plans.forEach(plan => {
      const result = calculateStageGranular(plan, childAge, inflation, returnRate);
      if (result) {
        stageResults.push(result);
        childTotalSaving += result.monthlySaving;
        totalPortfolioCost += result.totalFutureCost;
      }
    });
    // Use 'any' to bypass strict type check for legacy UI component support
    details.push({ childId: child.id, childName: child.name, stages: stageResults as any, totalMonthlySaving: childTotalSaving });
    grandTotalSaving += childTotalSaving;
  });

  return { grandTotalMonthlySaving: grandTotalSaving, totalFutureCost: totalPortfolioCost, details };
};

// --- BUDGET ENGINE (REFACTORED: NO COLOR CLASS) ---

export const calculateSmartBudget = (fixedIncome: number, variableIncome: number): BudgetResult => {
  const prodDebt = fixedIncome * 0.20;
  const consDebt = fixedIncome * 0.15;
  const insurance = fixedIncome * 0.10;
  const investment = fixedIncome * 0.10;
  const totalAllocated = prodDebt + consDebt + insurance + investment;
  const safeToSpend = fixedIncome - totalAllocated;

  const allocations: BudgetAllocation[] = [
    { label: "Hutang Produktif", percentage: 20, amount: prodDebt, type: "DEBT_PROD", description: "Maksimal cicilan KPR/Modal Usaha." },
    { label: "Hutang Konsumtif", percentage: 15, amount: consDebt, type: "DEBT_CONS", description: "Limit cicilan HP/Kendaraan/Paylater." },
    { label: "Asuransi / Proteksi", percentage: 10, amount: insurance, type: "INSURANCE", description: "BPJS + Asuransi Swasta." },
    { label: "Tabungan Masa Depan", percentage: 10, amount: investment, type: "SAVING", description: "Investasi minimal (Wajib)." }
  ];

  return { safeToSpend, allocations, totalFixedAllocated: totalAllocated, surplus: variableIncome };
};

// --- PENSION ENGINE (MATCHING EXCEL LOGIC) ---

export const calculatePension = (input: PensionInput): PensionResult => {
  const workingYears = input.retirementAge - input.currentAge;
  const retirementYears = input.retirementDuration;

  // Safety Check
  if (workingYears <= 0) {
    return { 
        workingYears: 0, 
        retirementYears, 
        fvMonthlyExpense: 0, 
        fvExistingFund: 0, 
        totalFundNeeded: 0, 
        shortfall: 0, 
        monthlySaving: 0 
    };
  }

  // --- 1. PREPARE RATES ---
  const annualInflRate = input.inflationRate / 100;
  const annualInvestRate = input.investmentRate / 100;
  
  // Real Rate (Excel Logic: Invest - Inflasi)
  const realRate = annualInvestRate - annualInflRate;

  // --- 2. FUTURE VALUE OF EXPENSE (LIFESTYLE) ---
  const currentAnnualExpense = input.currentExpense * 12;
  const futureAnnualExpense = currentAnnualExpense * Math.pow(1 + annualInflRate, workingYears);
  
  const fvMonthlyExpense = futureAnnualExpense / 12;

  // --- 3. CORPUS NEEDED (TOTAL DANA DIBUTUHKAN) ---
  let totalFundNeeded = 0;

  if (retirementYears === 1) {
      totalFundNeeded = futureAnnualExpense;
  } else {
      if (Math.abs(realRate) < 0.0000001) {
          totalFundNeeded = futureAnnualExpense * retirementYears;
      } else {
          const annuityFactor = (1 - Math.pow(1 + realRate, -retirementYears)) / realRate;
          const annuityDueAdjustment = 1 + realRate; 
          totalFundNeeded = futureAnnualExpense * annuityFactor * annuityDueAdjustment;
      }
  }

  // --- 4. FUTURE VALUE OF EXISTING ASSET ---
  const fvExistingFund = input.currentFund * Math.pow(1 + annualInvestRate, workingYears);

  // --- 5. GAP ANALYSIS ---
  let shortfall = totalFundNeeded - fvExistingFund;
  if (shortfall < 0) shortfall = 0;

  // --- 6. MONTHLY SAVING CALCULATION ---
  let annualSaving = 0;
  if (shortfall > 0) {
      if (annualInvestRate === 0) {
          annualSaving = shortfall / workingYears;
      } else {
          const compoundFactor = Math.pow(1 + annualInvestRate, workingYears) - 1;
          annualSaving = (shortfall * annualInvestRate) / compoundFactor;
      }
  }

  const monthlySaving = annualSaving / 12;

  return {
    workingYears,
    retirementYears,
    fvMonthlyExpense, 
    fvExistingFund,
    totalFundNeeded,
    shortfall,
    monthlySaving
  };
};

// --- INSURANCE ENGINE ---

export const calculateInsurance = (input: InsuranceInput): InsuranceResult => {
  const totalDebt = 
    input.debtKPR + 
    input.debtKPM + 
    input.debtProductive + 
    input.debtConsumptive + 
    input.debtOther;

  const investRate = input.investmentRate / 100;
  const inflRate = input.inflationRate / 100;
  const realRate = investRate - inflRate;
  
  const n = input.protectionDuration;
  const pmt = input.annualIncome;

  let incomeReplacementValue = 0;

  if (n > 0) {
    if (Math.abs(realRate) < 0.0001) {
      incomeReplacementValue = pmt * n;
    } else {
      const factor = (1 - Math.pow(1 + realRate, -n)) / realRate;
      incomeReplacementValue = pmt * factor * (1 + realRate);
    }
  }

  const totalFundNeeded = totalDebt + incomeReplacementValue + input.finalExpense;

  let shortfall = totalFundNeeded - input.existingInsurance;
  if (shortfall < 0) shortfall = 0; 

  return {
    totalDebt,
    incomeReplacementValue,
    totalFundNeeded,
    shortfall
  };
};

// --- SPECIAL GOAL ENGINE (MENU 6) ---

export const calculateSpecialGoal = (input: SpecialGoalInput): SpecialGoalResult => {
  const { currentCost, inflationRate, investmentRate, duration } = input;

  const futureValue = calculateFV(currentCost, inflationRate, duration);
  const monthlySaving = calculatePMT(futureValue, investmentRate, duration);

  return {
    futureValue,
    monthlySaving
  };
};

// ============================================================================
// FINANCIAL HEALTH CHECK UP ENGINE (DEPRECATED)
// ============================================================================
// Logic perhitungan ini sekarang dipindah ke Backend (NestJS).
// Fungsi ini dinonaktifkan untuk mencegah 'double truth' atau perbedaan hasil hitung.
// Gunakan `financialService.createCheckup()` untuk mendapatkan hasil dari server.
// ============================================================================

/* export const calculateFinancialHealth = (data: FinancialRecord): HealthAnalysisResult => {
  // ... LOGIC LAMA DIHAPUS / DIKOMENTARI AGAR TIDAK DIPAKAI ...
  throw new Error("This function is deprecated. Use API call instead.");
}; 
*/