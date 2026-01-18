import { 
  BudgetResult, BudgetAllocation, ChildProfile, EducationStage, 
  PlanInput, PortfolioSummary, StageResult, ChildSimulationResult, 
  PensionInput, PensionResult, 
  InsuranceInput, InsuranceResult 
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
  const annualPMT = (fv * rate) / (Math.pow(1 + rate, years) - 1);
  return annualPMT / 12;
};

// --- ADVANCED CALCULATION ENGINE (EDUCATION) ---

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
    details.push({ childId: child.id, childName: child.name, stages: stageResults, totalMonthlySaving: childTotalSaving });
    grandTotalSaving += childTotalSaving;
  });

  return { grandTotalMonthlySaving: grandTotalSaving, totalFutureCost: totalPortfolioCost, details };
};

// --- BUDGET ENGINE ---

export const calculateSmartBudget = (fixedIncome: number, variableIncome: number): BudgetResult => {
  const prodDebt = fixedIncome * 0.20;
  const consDebt = fixedIncome * 0.15;
  const insurance = fixedIncome * 0.10;
  const investment = fixedIncome * 0.10;
  const totalAllocated = prodDebt + consDebt + insurance + investment;
  const safeToSpend = fixedIncome - totalAllocated;

  const allocations: BudgetAllocation[] = [
    { label: "Hutang Produktif", percentage: 20, amount: prodDebt, type: "DEBT_PROD", description: "Maksimal cicilan KPR/Modal Usaha.", colorClass: "bg-orange-100 text-orange-700 border-orange-200" },
    { label: "Hutang Konsumtif", percentage: 15, amount: consDebt, type: "DEBT_CONS", description: "Limit cicilan HP/Kendaraan/Paylater.", colorClass: "bg-red-100 text-red-700 border-red-200" },
    { label: "Asuransi / Proteksi", percentage: 10, amount: insurance, type: "INSURANCE", description: "BPJS + Asuransi Swasta.", colorClass: "bg-blue-100 text-blue-700 border-blue-200" },
    { label: "Tabungan Masa Depan", percentage: 10, amount: investment, type: "SAVING", description: "Investasi minimal (Wajib).", colorClass: "bg-green-100 text-green-700 border-green-200" }
  ];

  return { safeToSpend, allocations, totalFixedAllocated: totalAllocated, surplus: variableIncome };
};

// --- PENSION ENGINE ---

export const calculatePension = (input: PensionInput): PensionResult => {
  const workingYears = input.retirementAge - input.currentAge;
  const retirementYears = input.retirementDuration;

  if (workingYears <= 0) {
    return { workingYears: 0, retirementYears, fvMonthlyExpense: 0, fvExistingFund: 0, totalFundNeeded: 0, shortfall: 0, monthlySaving: 0 };
  }

  // FV Pengeluaran (Visualisasi)
  const fvMonthlyExpense = calculateFV(input.currentExpense, input.inflationRate, workingYears);

  // Hitung Corpus dengan Real Rate
  const annualExpenseBase = input.currentExpense * 12;
  const investRate = input.investmentRate / 100;
  const inflRate = input.inflationRate / 100;
  const realRate = ((1 + investRate) / (1 + inflRate)) - 1;

  let totalFundNeeded = 0;

  if (retirementYears === 1) {
      totalFundNeeded = annualExpenseBase; 
  } else {
      if (Math.abs(realRate) < 0.0001) {
         totalFundNeeded = annualExpenseBase * retirementYears;
      } else {
         const factor = (1 - Math.pow(1 + realRate, -retirementYears)) / realRate;
         totalFundNeeded = annualExpenseBase * factor;
      }
  }

  // FV Saldo Awal
  const fvExistingFund = calculateFV(input.currentFund, input.investmentRate, workingYears);

  // Shortfall & Monthly Saving
  let shortfall = totalFundNeeded - fvExistingFund;
  if (shortfall < 0) shortfall = 0;
  const monthlySaving = calculatePMT(shortfall, input.investmentRate, workingYears);

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

// --- INSURANCE ENGINE (FIXED: NO TAX) ---

export const calculateInsurance = (input: InsuranceInput): InsuranceResult => {
  // 1. Hitung Total Utang (Component A)
  const totalDebt = 
    input.debtKPR + 
    input.debtKPM + 
    input.debtProductive + 
    input.debtConsumptive + 
    input.debtOther;

  // 2. Hitung Nilai Penggantian Penghasilan (Income Replacement - Component B)
  const investRate = input.investmentRate / 100;
  const inflRate = input.inflationRate / 100;
  
  // Real Rate (Bunga Riil)
  const realRate = ((1 + investRate) / (1 + inflRate)) - 1;
  const n = input.protectionDuration;
  const pmt = input.annualIncome;

  let incomeReplacementValue = 0;

  if (n > 0) {
    if (Math.abs(realRate) < 0.0001) {
      // Jika Real Rate 0
      incomeReplacementValue = pmt * n;
    } else {
      // Rumus PV Annuity Due
      const factor = (1 - Math.pow(1 + realRate, -n)) / realRate;
      incomeReplacementValue = pmt * factor * (1 + realRate);
    }
  }

  // 3. Hitung Total Kebutuhan (Total Needs)
  // Utang + Income Replacement + Biaya Duka (TANPA Pajak sesuai koreksi)
  const totalFundNeeded = totalDebt + incomeReplacementValue + input.finalExpense;

  // 4. Hitung Kekurangan (Shortfall)
  let shortfall = totalFundNeeded - input.existingInsurance;
  if (shortfall < 0) shortfall = 0; 

  return {
    totalDebt,
    incomeReplacementValue,
    totalFundNeeded,
    shortfall
  };
};