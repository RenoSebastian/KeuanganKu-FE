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
// FINANCIAL HEALTH CHECK UP ENGINE (FINAL REVISION)
// Updated for Granular Data Input 2026
// ============================================================================

export const calculateFinancialHealth = (data: FinancialRecord): HealthAnalysisResult => {
  // --- 1. AGGREGATION ---
  
  // A. Total Aset
  const totalLiquid = data.assetCash; 
  
  const totalPersonal = 
    data.assetHome + 
    data.assetVehicle + 
    data.assetJewelry + 
    data.assetAntique + 
    data.assetPersonalOther;

  const totalInvestment = 
    data.assetInvHome +
    data.assetInvVehicle +
    data.assetGold + 
    data.assetInvAntique +
    data.assetStocks + 
    data.assetMutualFund + 
    data.assetBonds +
    data.assetDeposit +
    data.assetInvOther;

  const totalAssets = totalLiquid + totalPersonal + totalInvestment;

  // B. Total Utang
  const totalConsumptiveDebt = 
    data.debtKPR + 
    data.debtKPM + 
    data.debtCC + 
    data.debtCoop + 
    data.debtConsumptiveOther;

  const totalBusinessDebt = data.debtBusiness;
  const totalDebt = totalConsumptiveDebt + totalBusinessDebt;

  // C. Kekayaan Bersih
  const netWorth = totalAssets - totalDebt;

  // D. Arus Kas
  const totalAnnualIncome = data.incomeFixed + data.incomeVariable;
  
  const totalConsumptiveInstallment = 
    data.installmentKPR + 
    data.installmentKPM + 
    data.installmentCC + 
    data.installmentCoop + 
    data.installmentConsumptiveOther;

  const totalAnnualInstallment = totalConsumptiveInstallment + data.installmentBusiness;

  const totalInsurance = 
    data.insuranceLife + 
    data.insuranceHealth + 
    data.insuranceHome + 
    data.insuranceVehicle + 
    data.insuranceBPJS + 
    data.insuranceOther;

  const totalAnnualSaving = 
    (data.savingEducation + 
     data.savingRetirement + 
     data.savingPilgrimage + 
     data.savingHoliday + 
     data.savingEmergency + 
     data.savingOther);

  const totalFamilyExpense = 
    (data.expenseFood + 
     data.expenseSchool + 
     data.expenseTransport + 
     data.expenseCommunication + 
     data.expenseHelpers + 
     data.expenseLifestyle) + data.expenseTax; 

  const totalAnnualExpense = totalAnnualInstallment + totalInsurance + totalAnnualSaving + totalFamilyExpense;
  const monthlyExpense = totalAnnualExpense / 12;
  const surplusDeficit = totalAnnualIncome - totalAnnualExpense;

  // --- 2. PERHITUNGAN 8 RASIO (SEMANTIC GRADING) ---
  const ratios: RatioDetail[] = [];
  let passedRatios = 0; 

  // #1. RASIO DANA DARURAT (A / P)
  const r1 = monthlyExpense > 0 ? totalLiquid / monthlyExpense : 0;
  let g1: "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL" = "CRITICAL";
  let rec1 = "Dana darurat sangat kurang (< 3 bulan). Risiko tinggi!";
  
  if (r1 >= 3 && r1 <= 6) { g1 = "EXCELLENT"; rec1 = "Ideal (3-6 bulan)."; passedRatios++; }
  else if (r1 >= 7 && r1 <= 12) { g1 = "GOOD"; rec1 = "Aman, tapi agak berlebih (7-12 bulan)."; passedRatios++; }
  else if (r1 > 12) { g1 = "WARNING"; rec1 = "Terlalu banyak uang menganggur (> 12 bulan). Investasikan."; }
  else { g1 = "CRITICAL"; } 

  ratios.push({ 
    id: "emergency_fund", label: "Rasio Dana Darurat", 
    value: parseFloat(r1.toFixed(1)), benchmark: "3 - 6 kali", 
    grade: g1, recommendation: rec1
  });

  // #2. RASIO LIKUIDITAS vs NET WORTH
  const r2 = netWorth > 0 ? (totalLiquid / netWorth) * 100 : 0;
  let g2: any = "CRITICAL";
  let rec2 = "Aset likuid terlalu sedikit (< 15%). Susah cairkan uang.";

  if (r2 > 50) { g2 = "EXCELLENT"; rec2 = "Sangat likuid (> 50%)."; passedRatios++; }
  else if (r2 >= 20) { g2 = "GOOD"; rec2 = "Cukup likuid (20-50%)."; passedRatios++; }
  else if (r2 >= 15) { g2 = "WARNING"; rec2 = "Agak ketat (15-20%)."; }
  else { g2 = "CRITICAL"; } 

  ratios.push({ 
    id: "liq_networth", label: "Likuiditas vs Net Worth", 
    value: parseFloat(r2.toFixed(1)), benchmark: "15% - 20%", 
    grade: g2, recommendation: rec2
  });

  // #3. RASIO TABUNGAN
  const r3 = totalAnnualIncome > 0 ? (totalAnnualSaving / totalAnnualIncome) * 100 : 0;
  let g3: any = "CRITICAL";
  let rec3 = "Kurang menabung (< 10%). Masa depan terancam.";

  if (r3 >= 30) { g3 = "EXCELLENT"; rec3 = "Excellent! Menabung > 30%."; passedRatios++; }
  else if (r3 >= 20) { g3 = "GOOD"; rec3 = "Sangat baik (20-30%)."; passedRatios++; }
  else if (r3 >= 10) { g3 = "WARNING"; rec3 = "Cukup (10-20%). Tingkatkan lagi."; passedRatios++; } 
  else { g3 = "CRITICAL"; }

  ratios.push({ 
    id: "saving_ratio", label: "Rasio Tabungan", 
    value: parseFloat(r3.toFixed(1)), benchmark: "Min 10%", 
    grade: g3, recommendation: rec3
  });

  // #4. RASIO UTANG vs ASET
  const r4 = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0;
  let g4: any = "CRITICAL";
  let rec4 = "Bahaya! Utang > 50% Aset. Risiko kebangkrutan.";

  if (r4 < 15) { g4 = "EXCELLENT"; rec4 = "Sangat sehat. Utang sangat kecil (< 15%)."; passedRatios++; }
  else if (r4 < 35) { g4 = "GOOD"; rec4 = "Wajar (15-35%)."; passedRatios++; }
  else if (r4 <= 50) { g4 = "WARNING"; rec4 = "Hati-hati. Utang mendekati batas aman (35-50%)."; }
  else { g4 = "CRITICAL"; } 

  ratios.push({ 
    id: "debt_asset_ratio", label: "Rasio Utang vs Aset", 
    value: parseFloat(r4.toFixed(1)), benchmark: "Maks 50%", 
    grade: g4, recommendation: rec4
  });

  // #5. RASIO CICILAN UTANG
  const r5 = totalAnnualIncome > 0 ? (totalAnnualInstallment / totalAnnualIncome) * 100 : 0;
  let g5: any = "CRITICAL";
  let rec5 = "Overleverage! Cicilan > 35% penghasilan.";

  if (r5 < 10) { g5 = "EXCELLENT"; rec5 = "Beban cicilan sangat ringan (< 10%)."; passedRatios++; }
  else if (r5 < 15) { g5 = "GOOD"; rec5 = "Ringan (10-15%)."; passedRatios++; }
  else if (r5 <= 35) { g5 = "WARNING"; rec5 = "Waspada (15-35%). Jangan tambah utang."; }
  else { g5 = "CRITICAL"; } 

  ratios.push({ 
    id: "debt_service_ratio", label: "Rasio Cicilan Utang", 
    value: parseFloat(r5.toFixed(1)), benchmark: "Maks 35%", 
    grade: g5, recommendation: rec5
  });

  // #6. RASIO CICILAN KONSUMTIF
  const r6 = totalAnnualIncome > 0 ? (totalConsumptiveInstallment / totalAnnualIncome) * 100 : 0;
  let g6: any = "CRITICAL";
  let rec6 = "Boros! Cicilan konsumtif > 15%. Stop hutang baru.";

  if (r6 < 5) { g6 = "EXCELLENT"; rec6 = "Sangat hemat. Cicilan konsumtif < 5%."; passedRatios++; }
  else if (r6 < 10) { g6 = "GOOD"; rec6 = "Terkendali (5-10%)."; passedRatios++; }
  else if (r6 <= 15) { g6 = "WARNING"; rec6 = "Batas wajar (10-15%)."; }
  else { g6 = "CRITICAL"; } 

  ratios.push({ 
    id: "consumptive_ratio", label: "Rasio Cicilan Konsumtif", 
    value: parseFloat(r6.toFixed(1)), benchmark: "Maks 15%", 
    grade: g6, recommendation: rec6
  });

  // #7. RASIO ASET INVESTASI
  const r7 = netWorth > 0 ? (totalInvestment / netWorth) * 100 : 0;
  let g7: any = "CRITICAL";
  let rec7 = "Aset mayoritas konsumtif/mati. Tingkatkan investasi.";

  if (r7 > 50) { g7 = "EXCELLENT"; rec7 = "Portofolio produktif (> 50%)."; passedRatios++; }
  else if (r7 >= 25) { g7 = "GOOD"; rec7 = "Cukup (25-50%)."; passedRatios++; }
  else if (r7 >= 10) { g7 = "WARNING"; rec7 = "Kurang (10-25%)."; }
  else { g7 = "CRITICAL"; } 

  ratios.push({ 
    id: "invest_asset_ratio", label: "Rasio Aset Investasi", 
    value: parseFloat(r7.toFixed(1)), benchmark: "Min 50%", 
    grade: g7, recommendation: rec7
  });

  // #8. RASIO SOLVABILITAS
  const r8 = totalAssets > 0 ? (netWorth / totalAssets) * 100 : 0;
  let g8: any = "CRITICAL";
  let rec8 = "Risiko kebangkrutan tinggi! Modal sendiri < 25%.";

  if (r8 > 75) { g8 = "EXCELLENT"; rec8 = "Sangat kuat (> 75% modal sendiri)."; passedRatios++; }
  else if (r8 >= 50) { g8 = "GOOD"; rec8 = "Sehat (50-75%)."; passedRatios++; }
  else if (r8 >= 25) { g8 = "WARNING"; rec8 = "Rentan (25-50%)."; }
  else { g8 = "CRITICAL"; } 

  ratios.push({ 
    id: "solvency_ratio", label: "Rasio Solvabilitas", 
    value: parseFloat(r8.toFixed(1)), benchmark: "Min 50%", 
    grade: g8, recommendation: rec8
  });

  // --- FINAL SCORE ---
  const score = Math.round((passedRatios / 8) * 100);
  
  let globalStatus = "BAHAYA";
  if (score >= 80) globalStatus = "SEHAT";
  else if (score >= 50) globalStatus = "WASPADA";
  
  return {
    score,
    globalStatus,
    ratios,
    netWorth,
    surplusDeficit, 
    generatedAt: new Date().toISOString()
  };
};