import { BudgetResult, BudgetAllocation, ChildProfile, EducationStage, PlanInput, PortfolioSummary, StageResult, ChildSimulationResult, PensionInput, PensionResult } from "./types";

// --- DATABASE JENJANG (REVISI: S1, S2, & Label TK) ---
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

  // Logic Offset Tahun
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

  // KOMPONEN A: UANG PANGKAL
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

  // KOMPONEN B: BIAYA PERIODIK (SPP / UKT)
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

// --- BUDGETING ENGINE ---

export const calculateSmartBudget = (fixedIncome: number, variableIncome: number): BudgetResult => {
  
  const prodDebt = fixedIncome * 0.20;
  const consDebt = fixedIncome * 0.15;
  const insurance = fixedIncome * 0.10;
  const investment = fixedIncome * 0.10;

  const totalAllocated = prodDebt + consDebt + insurance + investment;
  const safeToSpend = fixedIncome - totalAllocated;

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
    surplus: variableIncome
  };
};

// --- PENSION ENGINE (AWP MATCH READY) ---

export const calculatePension = (input: PensionInput): PensionResult => {
  // 1. Hitung Periode Kerja (N)
  const workingYears = input.retirementAge - input.currentAge;
  
  // 2. Ambil Durasi Pensiun dari Input User (Agar Dinamis)
  // Tidak lagi hardcode 20 tahun. User bisa input 1 tahun.
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

  // 3. Hitung FV Pengeluaran (Biaya Hidup di Masa Depan)
  // Rate: Inflasi (Merah)
  const fvMonthlyExpense = calculateFV(input.currentExpense, input.inflationRate, workingYears);

  // 4. Hitung Total Kebutuhan Dana (Corpus)
  // Logic: Biaya Tahunan Masa Depan x Durasi Pensiun
  // Jika user isi durasi 1 tahun (seperti AWP), maka targetnya = Biaya 1 tahun saja.
  const annualExpenseAtRetirement = fvMonthlyExpense * 12;
  const totalFundNeeded = annualExpenseAtRetirement * retirementYears;

  // 5. Hitung FV Saldo Awal (Existing Fund Power)
  // Dana JHT/DPLK yang ada sekarang didiamkan tumbuh sampai pensiun (Rate Investasi)
  const fvExistingFund = calculateFV(input.currentFund, input.investmentRate, workingYears);

  // 6. Hitung Kekurangan (Shortfall)
  // Target Corpus - Uang yang sudah siap nanti
  let shortfall = totalFundNeeded - fvExistingFund;
  if (shortfall < 0) shortfall = 0; // Surplus, tabungan bulanan jadi 0

  // 7. Hitung Tabungan Bulanan (PMT)
  // Target: Shortfall
  // Rate: Investasi (Hijau)
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