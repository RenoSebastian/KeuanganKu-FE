import {
  BudgetResult,
  BudgetAllocation,
  SchoolLevel,
  PensionInput,
  PensionResult,
  InsuranceInput,
  InsuranceResult,
  SpecialGoalInput,
  SpecialGoalResult,
} from "./types";

// Import Schema & Type Baru untuk Financial Checkup Adapter
import { FinancialFormState, FinancialApiPayload } from "@/lib/types/financial-checkup";
import { SchoolLevelType, DEFAULT_STAGE_DURATION } from "@/lib/schemas/education-simulation.schema";

// ============================================================================
// 1. EXISTING LOGIC (LEGACY)
// ============================================================================

export interface EducationStage {
  id: SchoolLevel;
  label: string;
  entryAge: number;
  duration: number;
  paymentFrequency: "MONTHLY" | "SEMESTER";
}

export const STAGES_DB: EducationStage[] = [
  { id: SchoolLevel.TK, label: "TK / PAUD", entryAge: 5, duration: 2, paymentFrequency: "MONTHLY" },
  { id: SchoolLevel.SD, label: "Sekolah Dasar", entryAge: 7, duration: 6, paymentFrequency: "MONTHLY" },
  { id: SchoolLevel.SMP, label: "SMP", entryAge: 13, duration: 3, paymentFrequency: "MONTHLY" },
  { id: SchoolLevel.SMA, label: "SMA", entryAge: 16, duration: 3, paymentFrequency: "MONTHLY" },
  { id: SchoolLevel.S1, label: "Sarjana (S1)", entryAge: 19, duration: 4, paymentFrequency: "SEMESTER" },
  { id: SchoolLevel.S2, label: "Magister (S2)", entryAge: 23, duration: 2, paymentFrequency: "SEMESTER" },
];

// --- BASIC HELPERS ---

export const formatRupiah = (val: number | undefined | null) => {
  if (val === undefined || val === null || isNaN(val)) return "Rp 0";
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

  // Rumus Anuitas / Sinking Fund: PMT = FV * i / ((1+i)^n - 1)
  // Dibagi 12 untuk jadi bulanan
  const annualPMT = (fv * rate) / (Math.pow(1 + rate, years) - 1);
  return annualPMT / 12;
};

// ============================================================================
// 2. NEW EDUCATION LOGIC (AGENT TOOL - STATELESS)
// ============================================================================

/**
 * Menghitung Future Value (FV) dan Monthly Investment (PMT)
 * untuk SATU item biaya pendidikan (misal: Uang Pangkal TK, SPP SD, UKT S1)
 *
 * @param currentCost Biaya saat ini (PV)
 * @param inflationRate Inflasi Pendidikan (%)
 * @param returnRate Return Investasi (%)
 * @param yearsToStart Jarak tahun dari sekarang sampai biaya dibutuhkan
 */
export const calculateStageFutureValue = (
  currentCost: number,
  inflationRate: number,
  returnRate: number,
  yearsToStart: number
) => {
  // 1. Future Value (Nilai Masa Depan)
  // FV = PV * (1 + i)^n
  const fv = calculateFV(currentCost, inflationRate, yearsToStart);

  // 2. Payment (Tabungan Rutin)
  // Menggunakan Interest Rate "Riil" jika inflasi & return dihitung terpisah
  // Namun sesuai dokumen PAM Jaya, PMT dihitung dari FV yang sudah diinflasikan,
  // dengan asumsi return investasi murni.
  const pmt = calculatePMT(fv, returnRate, yearsToStart);

  return {
    fv: Math.round(fv),
    pmt: Math.round(pmt),
  };
};

export interface EducationInvestmentInput {
  inflationRate: number;
  returnRate: number;
  childDob: string;
  stages: Array<{
    level: SchoolLevelType;
    startYear: number;
    duration: number;
    costEntry: number;
    costMonthly?: number;   // TK-SMA
    costSemester?: number;  // S1
    costFull?: number;      // S2
  }>;
}

/**
 * Menghitung Total Investasi Pendidikan untuk Satu Anak
 * Mengagregasi semua jenjang (TK -> S2) yang dipilih.
 */
export const calculateEducationInvestment = (input: EducationInvestmentInput) => {
  let totalFutureCost = 0;
  let totalMonthlySaving = 0;
  const currentYear = new Date().getFullYear();

  // Mapping hasil per jenjang
  const stageResults = input.stages.map((stage) => {
    const yearsToStart = Math.max(0, stage.startYear - currentYear);

    let stageTotalFV = 0;
    let stageTotalPMT = 0;

    // A. HITUNG BIAYA MASUK (ENTRY FEE / UANG PANGKAL)
    // Dibutuhkan di awal tahun masuk (Tahun ke-0 jenjang tersebut)
    if (stage.costEntry > 0) {
      const entryCalc = calculateStageFutureValue(
        stage.costEntry,
        input.inflationRate,
        input.returnRate,
        yearsToStart
      );
      stageTotalFV += entryCalc.fv;
      stageTotalPMT += entryCalc.pmt;
    }

    // B. HITUNG BIAYA PERIODIK (SPP / UKT)
    // Dilakukan loop untuk setiap tahun/semester durasi pendidikan

    // CASE 1: BULANAN (TK, SD, SMP, SMA)
    if (stage.costMonthly && stage.costMonthly > 0) {
      const annualSPP = stage.costMonthly * 12;
      for (let i = 0; i < stage.duration; i++) {
        // Biaya tahun ke-i dibutuhkan di (yearsToStart + i)
        const timeHorizon = yearsToStart + i;
        const sppCalc = calculateStageFutureValue(
          annualSPP,
          input.inflationRate,
          input.returnRate,
          timeHorizon
        );
        stageTotalFV += sppCalc.fv;
        stageTotalPMT += sppCalc.pmt;
      }
    }

    // CASE 2: SEMESTER (S1 - Kuliah)
    if (stage.costSemester && stage.costSemester > 0) {
      const annualUKT = stage.costSemester * 2; // Asumsi 2 semester/tahun
      for (let i = 0; i < stage.duration; i++) {
        const timeHorizon = yearsToStart + i;
        const uktCalc = calculateStageFutureValue(
          annualUKT,
          input.inflationRate,
          input.returnRate,
          timeHorizon
        );
        stageTotalFV += uktCalc.fv;
        stageTotalPMT += uktCalc.pmt;
      }
    }

    // CASE 3: FULL PACKAGE (S2 - Pascasarjana)
    // Asumsi dibayar lunas di awal (seperti Entry Fee)
    if (stage.costFull && stage.costFull > 0) {
      const fullCalc = calculateStageFutureValue(
        stage.costFull,
        input.inflationRate,
        input.returnRate,
        yearsToStart
      );
      stageTotalFV += fullCalc.fv;
      stageTotalPMT += fullCalc.pmt;
    }

    totalFutureCost += stageTotalFV;
    totalMonthlySaving += stageTotalPMT;

    return {
      level: stage.level,
      totalFv: stageTotalFV,
      totalPmt: stageTotalPMT,
    };
  });

  return {
    totalFutureCost,
    totalMonthlySaving,
    stageResults,
  };
};


// ============================================================================
// 3. LEGACY BUDGET ENGINE
// ============================================================================

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
// 4. FINANCIAL CHECKUP TRANSFORMER (ADAPTER LOGIC)
// ============================================================================

const FLOW_FIELDS: (keyof FinancialFormState)[] = [
  'incomeFixed', 'incomeVariable',
  'installmentKPR', 'installmentKPM', 'installmentCC', 'installmentCoop', 'installmentConsumptiveOther', 'installmentBusiness',
  'insuranceLife', 'insuranceHealth', 'insuranceHome', 'insuranceVehicle', 'insuranceBPJS', 'insuranceOther',
  'savingEducation', 'savingRetirement', 'savingPilgrimage', 'savingHoliday', 'savingEmergency', 'savingOther',
  'expenseFood', 'expenseSchool', 'expenseTransport', 'expenseCommunication', 'expenseHelpers', 'expenseTax', 'expenseLifestyle', 'expenseOther'
];

export function convertRecordToMonthly(annualData: FinancialFormState): FinancialApiPayload {
  const monthlyData: any = { ...annualData };
  FLOW_FIELDS.forEach((field) => {
    const value = annualData[field];
    if (typeof value === 'number' && value > 0) {
      monthlyData[field] = Math.round(value / 12);
    } else {
      monthlyData[field] = 0;
    }
  });
  return monthlyData as FinancialApiPayload;
}

export function convertRecordToAnnual(monthlyData: FinancialApiPayload): FinancialFormState {
  const annualData: any = { ...monthlyData };
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

export function calculateTotalDebt(data: Partial<FinancialFormState>): number {
  const debtFields: (keyof FinancialFormState)[] = [
    'debtKPR', 'debtKPM', 'debtCC', 'debtCoop', 'debtConsumptiveOther', 'debtBusiness'
  ];

  return debtFields.reduce((total, key) => {
    const val = data[key];
    return total + (typeof val === 'number' ? val : 0);
  }, 0);
}