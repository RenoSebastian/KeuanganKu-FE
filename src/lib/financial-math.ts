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
  // Excel menggunakan persentase integer (4, 8) dikonversi ke desimal
  const annualInflRate = input.inflationRate / 100;
  const annualInvestRate = input.investmentRate / 100;
  
  // Real Rate (Excel Logic: Invest - Inflasi)
  // Note: Ini simplifikasi Excel. Kalau mau strict Fisher Equation: ((1+i)/(1+f))-1
  const realRate = annualInvestRate - annualInflRate;

  // --- 2. FUTURE VALUE OF EXPENSE (LIFESTYLE) ---
  // Step A: Hitung biaya hidup tahunan SEKARANG
  const currentAnnualExpense = input.currentExpense * 12;

  // Step B: Inflasikan biaya tersebut ke masa depan (saat pensiun)
  // Excel Cell 1.1: PV * (1 + f)^n
  const futureAnnualExpense = currentAnnualExpense * Math.pow(1 + annualInflRate, workingYears);
  
  // Output untuk UI (Bulanan di masa depan)
  const fvMonthlyExpense = futureAnnualExpense / 12;

  // --- 3. CORPUS NEEDED (TOTAL DANA DIBUTUHKAN) ---
  // Excel Cell 1.2: Present Value of Annuity Due (PVAD)
  // Kita butuh dana di AWAL tahun, jadi dikali (1 + r)
  let totalFundNeeded = 0;

  if (retirementYears === 1) {
      totalFundNeeded = futureAnnualExpense;
  } else {
      // Handle jika Real Rate 0 (Investasi == Inflasi)
      if (Math.abs(realRate) < 0.0000001) {
          totalFundNeeded = futureAnnualExpense * retirementYears;
      } else {
          // Rumus: PMT * [ (1 - (1+r)^-n) / r ] * (1+r)
          // PMT di sini adalah futureAnnualExpense (kebutuhan per tahun di masa depan)
          const annuityFactor = (1 - Math.pow(1 + realRate, -retirementYears)) / realRate;
          const annuityDueAdjustment = 1 + realRate; // Adjustment untuk Beginning of Period
          
          totalFundNeeded = futureAnnualExpense * annuityFactor * annuityDueAdjustment;
      }
  }

  // --- 4. FUTURE VALUE OF EXISTING ASSET ---
  // Excel Cell 1.3: Aset tumbuh dengan full investment rate
  const fvExistingFund = input.currentFund * Math.pow(1 + annualInvestRate, workingYears);

  // --- 5. GAP ANALYSIS ---
  let shortfall = totalFundNeeded - fvExistingFund;
  if (shortfall < 0) shortfall = 0;

  // --- 6. MONTHLY SAVING CALCULATION ---
  // Excel Logic: Hitung Tabungan TAHUNAN dulu, baru bagi 12.
  // Rumus Sinking Fund: PMT = FV * i / ((1+i)^n - 1)
  
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

  // 1. Hitung Target Dana Masa Depan (FV)
  // Rumus: PV * (1 + i)^n
  // i = Inflasi
  const futureValue = calculateFV(currentCost, inflationRate, duration);

  // 2. Hitung Tabungan Bulanan (PMT)
  // Rumus: PMT = FV * i / ((1 + i)^n - 1)
  // i = Investasi
  // Hasil dibagi 12 untuk bulanan
  const monthlySaving = calculatePMT(futureValue, investmentRate, duration);

  return {
    futureValue,
    monthlySaving
  };
};

// ============================================================================
// FINANCIAL HEALTH CHECK UP ENGINE
// Logic by: Formula Financial Health Check Up Document
// Updated for Granular Data Input
// ============================================================================

export const calculateFinancialHealth = (data: FinancialRecord): HealthAnalysisResult => {
  // --- 1. AGGREGATION (PENGGABUNGAN DATA) ---
  
  // A. Total Aset
  const totalLiquid = data.assetCash + data.assetDeposit;
  
  const totalInvestment = 
    data.assetGold + 
    data.assetMutualFund + 
    data.assetStocks + 
    data.assetPropertyInv + 
    data.assetOtherInv;
    
  const totalPersonal = 
    data.assetHome + 
    data.assetVehicle + 
    data.assetJewelry + 
    data.assetPersonalOther;

  const totalAssets = totalLiquid + totalInvestment + totalPersonal;

  // B. Total Utang (Saldo Pokok)
  const totalShortTermDebt = data.debtCC + data.debtPersonal;
  const totalLongTermDebt = data.debtKPR + data.debtKPM + data.debtBusiness;
  const totalDebt = totalShortTermDebt + totalLongTermDebt;

  // C. Kekayaan Bersih (Net Worth)
  const netWorth = totalAssets - totalDebt;

  // D. Arus Kas (Tahunan)
  const totalAnnualIncome = data.incomeFixed + data.incomeVariable;
  
  // E. Cicilan Utang (Tahunan)
  // Total Cicilan (Semua jenis utang)
  const totalAnnualInstallment = 
    data.installmentKPR + 
    data.installmentKPM + 
    data.installmentCC + 
    data.installmentBusiness + 
    data.installmentOther;
  
  // Cicilan Konsumtif (Strict Definition: KPM + CC + Personal/Other)
  // KPR dan Modal Usaha biasanya dianggap Produktif (Asset Backed / Income Generating)
  const consumptiveAnnualInstallment = 
    data.installmentKPM + 
    data.installmentCC + 
    data.installmentOther;

  // F. Tabungan & Investasi (Tahunan)
  // Input di form adalah bulanan, jadi dikali 12
  const totalAnnualSaving = (data.savingRoutine * 12) + (data.investRoutine * 12);

  // --- 2. CONFIG & INIT ---
  let totalScore = 0;
  const ratios: RatioDetail[] = [];
  const MAX_POINT = 12.5; // 100 poin dibagi 8 indikator

  // --- 3. PERHITUNGAN 8 RASIO ---

  // #1. RASIO DANA DARURAT (LIQUIDITY RATIO)
  // Rumus: Aset Likuid / Pengeluaran Rutin Bulanan
  // Benchmark: 3 - 6 kali
  const liquidityRatio = data.expenseLiving > 0 ? totalLiquid / data.expenseLiving : 0;
  
  let status1: HealthStatus = "BAHAYA";
  let rec1 = "";
  let score1 = 0;

  if (liquidityRatio >= 6) {
    status1 = "SEHAT"; score1 = MAX_POINT;
    rec1 = "Dana darurat sangat kuat (> 6 bulan). Anda aman dari risiko jangka pendek.";
  } else if (liquidityRatio >= 3) {
    status1 = "SEHAT"; score1 = MAX_POINT;
    rec1 = "Dana darurat ideal (3-6 bulan). Pertahankan.";
  } else if (liquidityRatio >= 1) {
    status1 = "WASPADA"; score1 = MAX_POINT / 2;
    rec1 = "Dana darurat tipis (1-3 bulan). Risiko tinggi jika terjadi kondisi darurat.";
  } else {
    status1 = "BAHAYA"; score1 = 0;
    rec1 = "Kritis! Dana darurat < 1 bulan. Segera sisihkan uang tunai secepatnya.";
  }
  
  ratios.push({ 
    id: "liquidity_ratio", 
    label: "Rasio Dana Darurat", 
    value: parseFloat(liquidityRatio.toFixed(1)), 
    benchmark: "3 - 6 kali", 
    status: status1, 
    recommendation: rec1 
  });

  // #2. RASIO LIKUIDITAS TERHADAP NET WORTH
  // Rumus: Aset Likuid / Kekayaan Bersih
  // Benchmark: 15% - 20%
  const liquidityNW = netWorth > 0 ? (totalLiquid / netWorth) * 100 : 0;
  
  let status2: HealthStatus = "BAHAYA";
  let rec2 = "";
  let score2 = 0;

  if (liquidityNW >= 15 && liquidityNW <= 20) {
    status2 = "SEHAT"; score2 = MAX_POINT; 
    rec2 = "Komposisi uang tunai ideal (15-20% dari kekayaan).";
  } else if (liquidityNW > 20) {
    status2 = "WASPADA"; score2 = MAX_POINT * 0.75; 
    rec2 = "Cash terlalu banyak (>20%). Uang Anda 'menganggur' terkena inflasi. Investasikan segera.";
  } else {
    status2 = "BAHAYA"; score2 = 0; 
    rec2 = "Likuiditas terlalu kecil (<15%). Anda 'Kaya Aset tapi Miskin Tunai'. Susah jika butuh uang cepat.";
  }
  
  ratios.push({ 
    id: "liquidity_nw", 
    label: "Likuiditas Net Worth", 
    value: parseFloat(liquidityNW.toFixed(1)), 
    benchmark: "15% - 20%", 
    status: status2, 
    recommendation: rec2 
  });

  // #3. RASIO MENABUNG (SAVING RATIO)
  // Rumus: (Tabungan + Investasi Tahunan) / Total Pendapatan Tahunan
  // Benchmark: Min 10%
  const savingRatio = totalAnnualIncome > 0 ? (totalAnnualSaving / totalAnnualIncome) * 100 : 0;
  
  let status3: HealthStatus = "BAHAYA";
  let rec3 = "";
  let score3 = 0;

  if (savingRatio >= 20) {
    status3 = "SEHAT"; score3 = MAX_POINT; 
    rec3 = "Excellent! Menabung > 20%. Masa depan cerah.";
  } else if (savingRatio >= 10) {
    status3 = "SEHAT"; score3 = MAX_POINT; 
    rec3 = "Baik. Sudah memenuhi standar minimal menabung (10%).";
  } else {
    status3 = "BAHAYA"; score3 = 0; 
    rec3 = "Kurang menabung (<10%). Kurangi gaya hidup, paksa sisihkan di awal gajian.";
  }

  ratios.push({ 
    id: "saving_ratio", 
    label: "Rasio Menabung", 
    value: parseFloat(savingRatio.toFixed(1)), 
    benchmark: "Min 10%", 
    status: status3, 
    recommendation: rec3 
  });

  // #4. RASIO UTANG TERHADAP ASET (SOLVENCY)
  // Rumus: Total Utang / Total Aset
  // Benchmark: Maks 50%
  const solvencyRatio = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0;
  
  let status4: HealthStatus = "BAHAYA";
  let rec4 = "";
  let score4 = 0;

  if (solvencyRatio < 30) {
    status4 = "SEHAT"; score4 = MAX_POINT; 
    rec4 = "Sangat sehat. Aset jauh lebih besar dari utang.";
  } else if (solvencyRatio <= 50) {
    status4 = "WASPADA"; score4 = MAX_POINT / 2; 
    rec4 = "Hati-hati. Utang mendekati 50% aset. Jangan tambah utang lagi.";
  } else {
    status4 = "BAHAYA"; score4 = 0; 
    rec4 = "Bahaya! Utang > 50% Aset. Secara teknis kondisi keuangan tidak sehat.";
  }

  ratios.push({ 
    id: "solvency_ratio", 
    label: "Rasio Utang Aset", 
    value: parseFloat(solvencyRatio.toFixed(1)), 
    benchmark: "Maks 50%", 
    status: status4, 
    recommendation: rec4 
  });

  // #5. RASIO CICILAN UTANG (DEBT SERVICE RATIO)
  // Rumus: Total Cicilan Tahunan / Total Pendapatan Tahunan
  // Benchmark: Maks 35%
  const dsr = totalAnnualIncome > 0 ? (totalAnnualInstallment / totalAnnualIncome) * 100 : 0;
  
  let status5: HealthStatus = "BAHAYA";
  let rec5 = "";
  let score5 = 0;

  if (dsr < 30) {
    status5 = "SEHAT"; score5 = MAX_POINT; 
    rec5 = "Beban cicilan ringan. Cashflow aman.";
  } else if (dsr <= 35) {
    status5 = "WASPADA"; score5 = MAX_POINT / 2; 
    rec5 = "Waspada. Cicilan sudah di batas maksimal aman (35%).";
  } else {
    status5 = "BAHAYA"; score5 = 0; 
    rec5 = "Overleverage! Gaji habis buat bayar cicilan (>35%). Lakukan pelunasan atau restrukturisasi.";
  }

  ratios.push({ 
    id: "dsr", 
    label: "Rasio Cicilan Total", 
    value: parseFloat(dsr.toFixed(1)), 
    benchmark: "Maks 35%", 
    status: status5, 
    recommendation: rec5 
  });

  // #6. RASIO UTANG KONSUMTIF
  // Rumus: Cicilan Konsumtif Tahunan / Total Pendapatan Tahunan
  // Benchmark: Maks 15%
  const consRatio = totalAnnualIncome > 0 ? (consumptiveAnnualInstallment / totalAnnualIncome) * 100 : 0;
  
  let status6: HealthStatus = "BAHAYA";
  let rec6 = "";
  let score6 = 0;

  if (consRatio < 10) {
    status6 = "SEHAT"; score6 = MAX_POINT; 
    rec6 = "Utang konsumtif sangat rendah. Bagus.";
  } else if (consRatio <= 15) {
    status6 = "WASPADA"; score6 = MAX_POINT / 2; 
    rec6 = "Hati-hati. Utang konsumtif sudah di ambang batas (15%). Stop Paylater/CC.";
  } else {
    status6 = "BAHAYA"; score6 = 0; 
    rec6 = "Boros! Terlalu banyak cicilan barang konsumtif (>15%). Hentikan gaya hidup kredit.";
  }

  ratios.push({ 
    id: "cons_debt", 
    label: "Rasio Cicilan Konsumtif", 
    value: parseFloat(consRatio.toFixed(1)), 
    benchmark: "Maks 15%", 
    status: status6, 
    recommendation: rec6 
  });

  // #7. RASIO ASET INVESTASI TERHADAP NET WORTH
  // Rumus: Aset Investasi / Kekayaan Bersih
  // Benchmark: Min 50%
  const invRatio = netWorth > 0 ? (totalInvestment / netWorth) * 100 : 0;
  
  let status7: HealthStatus = "BAHAYA";
  let rec7 = "";
  let score7 = 0;

  if (invRatio >= 50) {
    status7 = "SEHAT"; score7 = MAX_POINT; 
    rec7 = "Portofolio produktif dominan (>50%). Kekayaan Anda bekerja untuk Anda.";
  } else if (invRatio >= 30) {
    status7 = "WASPADA"; score7 = MAX_POINT / 2; 
    rec7 = "Cukup. Tingkatkan lagi aset investasi dibanding aset konsumtif.";
  } else {
    status7 = "BAHAYA"; score7 = 0; 
    rec7 = "Aset mayoritas 'mati' (Rumah/Mobil) atau Tunai. Kurang produktif melawan inflasi.";
  }

  ratios.push({ 
    id: "inv_ratio", 
    label: "Rasio Aset Investasi", 
    value: parseFloat(invRatio.toFixed(1)), 
    benchmark: "Min 50%", 
    status: status7, 
    recommendation: rec7 
  });

  // #8. PERTUMBUHAN KEKAYAAN BERSIH
  // Rumus: (NW Sekarang - NW Tahun Lalu) / NW Tahun Lalu
  // Benchmark: > 0%
  let growthStatus: HealthStatus = "SEHAT";
  let growthScore = MAX_POINT;
  let growthVal = 0;
  let growthRec = "Data tahun lalu tidak tersedia. Diasumsikan positif.";

  if (data.previousNetWorth) {
    // Handle division by zero or negative base logic if needed
    growthVal = ((netWorth - data.previousNetWorth) / Math.abs(data.previousNetWorth)) * 100;
    
    if (growthVal > 10) {
      growthStatus = "SEHAT"; growthScore = MAX_POINT;
      growthRec = "Pertumbuhan kekayaan signifikan (>10%). Strategi sudah benar.";
    } else if (growthVal > 0) {
      growthStatus = "SEHAT"; growthScore = MAX_POINT;
      growthRec = "Kekayaan tumbuh positif. Lanjutkan.";
    } else if (growthVal === 0) {
      growthStatus = "WASPADA"; growthScore = MAX_POINT / 2;
      growthRec = "Kekayaan stagnan. Evaluasi pengeluaran.";
    } else {
      growthStatus = "BAHAYA"; growthScore = 0;
      growthRec = "Kekayaan menurun! Cek kebocoran anggaran atau penurunan nilai aset.";
    }
  }

  ratios.push({ 
    id: "growth", 
    label: "Pertumbuhan Kekayaan", 
    value: parseFloat(growthVal.toFixed(1)), 
    benchmark: "> 0%", 
    status: growthStatus, 
    recommendation: growthRec 
  });

  // --- 4. FINAL RESULT ---
  totalScore = score1 + score2 + score3 + score4 + score5 + score6 + score7 + growthScore;
  
  let globalStatus: HealthStatus = "BAHAYA";
  if (totalScore >= 80) globalStatus = "SEHAT";
  else if (totalScore >= 50) globalStatus = "WASPADA";
  else globalStatus = "BAHAYA";

  return {
    score: Math.round(totalScore),
    globalStatus,
    ratios,
    netWorth,
    generatedAt: new Date().toISOString()
  };
};