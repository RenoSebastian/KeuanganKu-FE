import { BudgetResult, BudgetAllocation } from "./types";
import { ChildProfile, EducationStage, PlanInput, PortfolioSummary, StageResult, ChildSimulationResult } from "./types";

// --- DATABASE JENJANG (Tetap Sesuai Request Sebelumnya) ---
export const STAGES_DB: EducationStage[] = [
  { id: "TK", label: "TK / PAUD", entryAge: 5, duration: 2, paymentFrequency: "MONTHLY" },
  { id: "SD", label: "Sekolah Dasar", entryAge: 7, duration: 6, paymentFrequency: "MONTHLY" },
  { id: "SMP", label: "SMP", entryAge: 13, duration: 3, paymentFrequency: "MONTHLY" },
  { id: "SMA", label: "SMA", entryAge: 16, duration: 3, paymentFrequency: "MONTHLY" },
  { id: "KULIAH", label: "Universitas", entryAge: 19, duration: 4, paymentFrequency: "SEMESTER" },
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
// Aturan Merah: Rate = Inflasi
export const calculateFV = (pv: number, inflationRate: number, years: number): number => {
  return pv * Math.pow(1 + inflationRate / 100, years);
};

// 2. Rumus PMT (Payment / Tabungan Rutin)
// Aturan Hijau: Rate = Investasi (Murni)
export const calculatePMT = (
  fv: number, 
  investmentRate: number, // Pake Rate Investasi full
  years: number
): number => {
  if (years <= 0) return fv;

  const rate = investmentRate / 100;

  // Rumus PMT Tahunan (Sesuai Struktur Dokumen PAM: Tahunan dibagi 12)
  // PMT = FV * i / ((1 + i)^n - 1)
  const annualPMT = (fv * rate) / (Math.pow(1 + rate, years) - 1);

  // Bagi 12 untuk dapat angka bulanan
  return annualPMT / 12;
};

// --- ADVANCED CALCULATION ENGINE (CASHFLOW MATCHING) ---

const calculateStageGranular = (
  input: PlanInput, 
  childAge: number, 
  inflation: number, 
  returnRate: number
): StageResult | null => {
  
  const refStage = STAGES_DB.find(s => s.id === input.stageId);
  if (!refStage) return null;

  // Hitung Jarak Waktu (N)
  const gradeOffset = input.startGrade - 1;
  const targetEntryAge = refStage.entryAge + gradeOffset;
  let yearsUntilEntry = targetEntryAge - childAge;
  
  if (yearsUntilEntry < 0) yearsUntilEntry = 0;

  let totalFutureCost = 0;
  let totalMonthlySaving = 0;
  const breakdownDetails: any[] = [];

  // --- KOMPONEN A: UANG PANGKAL ---
  if (input.startGrade === 1 && input.costNow.entryFee > 0) {
    const timeDistance = yearsUntilEntry;
    
    // FV pakai Inflasi
    const fvEntry = calculateFV(input.costNow.entryFee, inflation, timeDistance);
    
    // PMT pakai Return Investasi
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

  // --- KOMPONEN B: BIAYA PERIODIK (SPP / UKT) ---
  const remainingDuration = refStage.duration - gradeOffset;

  for (let i = 0; i < remainingDuration; i++) {
    const timeDistance = yearsUntilEntry + i;
    
    let yearlyBaseCost = 0;
    let labelItem = "";

    if (refStage.paymentFrequency === "MONTHLY") {
      yearlyBaseCost = input.costNow.monthlyFee * 12; 
      labelItem = `SPP Tahun ke-${i + 1}`;
    } else {
      yearlyBaseCost = input.costNow.monthlyFee * 2; 
      labelItem = `UKT Tahun ke-${i + 1}`;
    }

    if (yearlyBaseCost > 0) {
      // FV pakai Inflasi
      const fvYearly = calculateFV(yearlyBaseCost, inflation, timeDistance);
      
      // PMT pakai Return Investasi
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

/**
 * ENGINE UTAMA: Menghitung Portfolio Seluruh Anak
 */
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
      stages: stageResults,
      totalMonthlySaving: childTotalSaving
    });

    grandTotalSaving += childTotalSaving;
  });

  return {
    grandTotalMonthlySaving: grandTotalSaving,
    totalFutureCost: totalPortfolioCost,
    details
  };
};

// --- BUDGETING ENGINE (50/30/20 MODIFIED) ---

export const calculateSmartBudget = (fixedIncome: number, variableIncome: number): BudgetResult => {
  
  // 1. Hitung Alokasi Wajib (55% Total)
  const prodDebt = fixedIncome * 0.20;  // 20% Hutang Produktif
  const consDebt = fixedIncome * 0.15;  // 15% Hutang Konsumtif
  const insurance = fixedIncome * 0.10; // 10% Asuransi
  const investment = fixedIncome * 0.10;// 10% Tabungan/Invest

  const totalAllocated = prodDebt + consDebt + insurance + investment;

  // 2. Hitung Sisa untuk Hidup (45%)
  const safeToSpend = fixedIncome - totalAllocated;

  // 3. Susun Detail Alokasi
  const allocations: BudgetAllocation[] = [
    {
      label: "Hutang Produktif",
      percentage: 20,
      amount: prodDebt,
      type: "DEBT_PROD",
      description: "Maksimal cicilan KPR/Modal Usaha.",
      colorClass: "bg-orange-100 text-orange-700 border-orange-200"
    },
    {
      label: "Hutang Konsumtif",
      percentage: 15,
      amount: consDebt,
      type: "DEBT_CONS",
      description: "Limit cicilan HP/Kendaraan/Paylater.",
      colorClass: "bg-red-100 text-red-700 border-red-200"
    },
    {
      label: "Asuransi / Proteksi",
      percentage: 10,
      amount: insurance,
      type: "INSURANCE",
      description: "BPJS + Asuransi Swasta.",
      colorClass: "bg-blue-100 text-blue-700 border-blue-200"
    },
    {
      label: "Tabungan Masa Depan",
      percentage: 10,
      amount: investment,
      type: "SAVING",
      description: "Investasi minimal (Wajib).",
      colorClass: "bg-green-100 text-green-700 border-green-200"
    }
  ];

  return {
    safeToSpend,
    allocations,
    totalFixedAllocated: totalAllocated,
    surplus: variableIncome // 100% Masuk Surplus
  };
};