import {
  BudgetResult,
  BudgetAllocation,
  ChildProfile,
  EducationLevel,
  PlanInput,
  PortfolioSummary,
  StageResult,
  ChildSimulationResult,
  PensionInput,
  PensionResult,
  InsuranceInput,
  InsuranceResult,
  SpecialGoalInput,
  SpecialGoalResult,
} from "./types";

// Import Type Baru untuk Financial Checkup Adapter
import { FinancialFormState, FinancialApiPayload } from "@/lib/types/financial-checkup";

// ============================================================================
// 1. EXISTING LOGIC (EDUCATION, PENSION, ETC)
// ============================================================================

export interface EducationStage {
  id: EducationLevel;
  label: string;
  entryAge: number;
  duration: number;
  paymentFrequency: "MONTHLY" | "SEMESTER";
}

export const STAGES_DB: EducationStage[] = [
  { id: "TK", label: "TK / PAUD", entryAge: 5, duration: 2, paymentFrequency: "MONTHLY" },
  { id: "SD", label: "Sekolah Dasar", entryAge: 7, duration: 6, paymentFrequency: "MONTHLY" },
  { id: "SMP", label: "SMP", entryAge: 13, duration: 3, paymentFrequency: "MONTHLY" },
  { id: "SMA", label: "SMA", entryAge: 16, duration: 3, paymentFrequency: "MONTHLY" },
  { id: "S1", label: "Sarjana (S1)", entryAge: 19, duration: 4, paymentFrequency: "SEMESTER" },
  { id: "S2", label: "Magister (S2)", entryAge: 23, duration: 2, paymentFrequency: "SEMESTER" },
];

// --- BASIC HELPERS ---

export const formatRupiah = (val: number | undefined | null) => {
  if (val === undefined || val === null) return "Rp 0";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
};

export function parseRupiah(value: string): number {
  if (!value) return 0;
  return parseFloat(value.replace(/[^0-9,-]+/g, "").replace(",", ".")) || 0;
}

export const calculateAge = (dob: string): number => {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

export const calculateFV = (pv: number, inflationRate: number, years: number): number => {
  return pv * Math.pow(1 + inflationRate / 100, years);
};

export const calculatePMT = (
  fv: number,
  investmentRate: number,
  years: number
): number => {
  if (years <= 0) return fv;

  const rate = investmentRate / 100;
  if (rate === 0) return fv / years / 12;

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
      labelItem = `Biaya Kuliah Tahun ke-${i + 1}`;
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

    details.push({
      childId: child.id,
      childName: child.name,
      stages: stageResults as any,
      totalMonthlySaving: childTotalSaving
    });
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
    { label: "Hutang Produktif", percentage: 20, amount: prodDebt, type: "DEBT_PROD", description: "Maksimal cicilan KPR/Modal Usaha." },
    { label: "Hutang Konsumtif", percentage: 15, amount: consDebt, type: "DEBT_CONS", description: "Limit cicilan HP/Kendaraan/Paylater." },
    { label: "Asuransi / Proteksi", percentage: 10, amount: insurance, type: "INSURANCE", description: "BPJS + Asuransi Swasta." },
    { label: "Tabungan Masa Depan", percentage: 10, amount: investment, type: "SAVING", description: "Investasi minimal (Wajib)." }
  ];

  return { safeToSpend, allocations, totalFixedAllocated: totalAllocated, surplus: variableIncome };
};

// --- PENSION ENGINE ---

export const calculatePension = (input: PensionInput): PensionResult => {
  const workingYears = input.retirementAge - input.currentAge;
  const retirementYears = input.retirementDuration;

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

  const annualInflRate = input.inflationRate / 100;
  const annualInvestRate = input.investmentRate / 100;
  const realRate = annualInvestRate - annualInflRate;

  const currentAnnualExpense = input.currentExpense * 12;
  const futureAnnualExpense = currentAnnualExpense * Math.pow(1 + annualInflRate, workingYears);
  const fvMonthlyExpense = futureAnnualExpense / 12;

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

  const fvExistingFund = input.currentFund * Math.pow(1 + annualInvestRate, workingYears);

  let shortfall = totalFundNeeded - fvExistingFund;
  if (shortfall < 0) shortfall = 0;

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

// --- SPECIAL GOAL ENGINE ---

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
// 2. FINANCIAL CHECKUP TRANSFORMER (ADAPTER LOGIC)
// ============================================================================

/**
 * Daftar field yang termasuk kategori "Arus Kas" (Flow).
 * Field-field ini WAJIB dikonversi (Kali 12 atau Bagi 12) saat transformasi.
 * * NOTE: Field "Neraca" (Asset & Debt Outstanding) TIDAK masuk sini karena nilainya tetap.
 */
const FLOW_FIELDS: (keyof FinancialFormState)[] = [
  // Income
  'incomeFixed', 'incomeVariable',
  // Installments (Cicilan Bulanan)
  'installmentKPR', 'installmentKPM', 'installmentCC', 'installmentCoop', 'installmentConsumptiveOther', 'installmentBusiness',
  // Insurance (Premi Bulanan)
  'insuranceLife', 'insuranceHealth', 'insuranceHome', 'insuranceVehicle', 'insuranceBPJS', 'insuranceOther',
  // Savings (Tabungan Rutin Bulanan)
  'savingEducation', 'savingRetirement', 'savingPilgrimage', 'savingHoliday', 'savingEmergency', 'savingOther',
  // Living Expenses (Biaya Hidup Bulanan)
  'expenseFood', 'expenseSchool', 'expenseTransport', 'expenseCommunication', 'expenseHelpers', 'expenseTax', 'expenseLifestyle', 'expenseOther'
];

/**
 * ADAPTER: Annual -> Monthly
 * Mengubah data UI (Tahunan) menjadi data API (Bulanan).
 * Digunakan sebelum mengirim data ke Backend.
 * @param annualData Data dari Form (Annual)
 */
export function convertRecordToMonthly(annualData: FinancialFormState): FinancialApiPayload {
  // 1. Shallow Copy untuk menghindari mutasi object asli
  const monthlyData: any = { ...annualData };

  // 2. Iterasi field Flow untuk konversi (Bagi 12)
  FLOW_FIELDS.forEach((field) => {
    const value = annualData[field];
    if (typeof value === 'number' && value > 0) {
      // Pembulatan ke integer terdekat untuk menghindari desimal aneh di API (misal 3333.33)
      monthlyData[field] = Math.round(value / 12);
    } else {
      monthlyData[field] = 0;
    }
  });

  return monthlyData as FinancialApiPayload;
}

/**
 * ADAPTER: Monthly -> Annual
 * Mengubah data API/Import (Bulanan) menjadi data UI (Tahunan).
 * Digunakan saat Import file .mgc (Re-hydration) agar UI menampilkan angka Tahunan yang benar.
 * @param monthlyData Data dari API/File (Monthly)
 */
export function convertRecordToAnnual(monthlyData: FinancialApiPayload): FinancialFormState {
  // 1. Shallow Copy
  const annualData: any = { ...monthlyData };

  // 2. Iterasi field Flow untuk konversi (Kali 12)
  FLOW_FIELDS.forEach((field) => {
    const value = monthlyData[field];
    if (typeof value === 'number' && value > 0) {
      annualData[field] = Math.round(value * 12);
    } else {
      annualData[field] = 0;
    }
  });

  return annualData as FinancialFormState;
}

/**
 * Helper untuk menghitung Total Aset (Neraca)
 * Menjumlahkan semua field kategori Asset
 */
export function calculateTotalAssets(data: Partial<FinancialFormState>): number {
  const assetFields: (keyof FinancialFormState)[] = [
    'assetCash', 'assetHome', 'assetVehicle', 'assetJewelry', 'assetAntique', 'assetPersonalOther',
    'assetInvHome', 'assetInvVehicle', 'assetGold', 'assetInvAntique',
    'assetStocks', 'assetMutualFund', 'assetBonds', 'assetDeposit', 'assetInvOther'
  ];

  return assetFields.reduce((total, key) => {
    const val = data[key];
    return total + (typeof val === 'number' ? val : 0);
  }, 0);
}

/**
 * Helper untuk menghitung Total Utang (Neraca)
 * Menjumlahkan semua field kategori Debt Outstanding
 */
export function calculateTotalDebt(data: Partial<FinancialFormState>): number {
  const debtFields: (keyof FinancialFormState)[] = [
    'debtKPR', 'debtKPM', 'debtCC', 'debtCoop', 'debtConsumptiveOther', 'debtBusiness'
  ];

  return debtFields.reduce((total, key) => {
    const val = data[key];
    return total + (typeof val === 'number' ? val : 0);
  }, 0);
}