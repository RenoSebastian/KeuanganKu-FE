import { 
  BudgetResult, BudgetAllocation, ChildProfile, EducationStage, 
  PlanInput, PortfolioSummary, StageResult, ChildSimulationResult, 
  PensionInput, PensionResult,
  InsuranceInput, InsuranceResult,
  SpecialGoalInput, SpecialGoalResult,
  FinancialRecord, HealthAnalysisResult, 
  RatioDetail, HealthStatus,
} from "./types";

// --- DATABASE JENJANG (DIKEMBALIKAN SESUAI BRANCH SEMENTARA_1) ---
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
// Engine ini tetap ada untuk kalkulasi instan di UI jika diperlukan
// (Walaupun save data akan menembak API Backend)

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
// FINANCIAL HEALTH CHECK UP ENGINE (FINAL REVISION)
// Logic by: Formula Financial Health Check Up Document
// Updated for Granular Data Input 2026
// ============================================================================

export const calculateFinancialHealth = (data: FinancialRecord): HealthAnalysisResult => {
  // --- 1. AGGREGATION (PENGGABUNGAN DATA) ---
  
  // A. Total Aset
  const totalLiquid = data.assetCash; // Hanya kas/setara kas (Sesuai Dokumen Revisi Poin 2.A)
  
  // Aset Personal (B)
  const totalPersonal = 
    data.assetHome + 
    data.assetVehicle + 
    data.assetJewelry + 
    data.assetAntique + 
    data.assetPersonalOther;

  // Aset Investasi (C)
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

  // Total Aset (D)
  const totalAssets = totalLiquid + totalPersonal + totalInvestment;

  // B. Total Utang (Saldo Pokok)
  // Utang Konsumtif (E)
  const totalConsumptiveDebt = 
    data.debtKPR + 
    data.debtKPM + 
    data.debtCC + 
    data.debtCoop + 
    data.debtConsumptiveOther;

  // Utang Usaha (F)
  const totalBusinessDebt = data.debtBusiness;

  // Total Utang (G)
  const totalDebt = totalConsumptiveDebt + totalBusinessDebt;

  // C. Kekayaan Bersih (H)
  const netWorth = totalAssets - totalDebt;

  // D. Arus Kas (Tahunan)
  // Total Penghasilan (I)
  const totalAnnualIncome = data.incomeFixed + data.incomeVariable;
  
  // E. Pengeluaran Tahunan
  // Cicilan Utang Konsumtif (J)
  const totalConsumptiveInstallment = 
    data.installmentKPR + 
    data.installmentKPM + 
    data.installmentCC + 
    data.installmentCoop + 
    data.installmentConsumptiveOther;

  // Total Cicilan Utang (K) = J + Cicilan Usaha
  const totalAnnualInstallment = totalConsumptiveInstallment + data.installmentBusiness;

  // Total Premi Asuransi (L)
  const totalInsurance = 
    data.insuranceLife + 
    data.insuranceHealth + 
    data.insuranceHome + 
    data.insuranceVehicle + 
    data.insuranceBPJS + 
    data.insuranceOther;

  // Total Tabungan/Investasi (M) - Dikali 12 karena input bulanan
  const totalAnnualSaving = 
    (data.savingEducation + 
     data.savingRetirement + 
     data.savingPilgrimage + 
     data.savingHoliday + 
     data.savingEmergency + 
     data.savingOther);

  // Total Belanja Keluarga (N) - Dikali 12 karena input bulanan (Kecuali Pajak biasanya tahunan, tapi asumsi input disamakan)
  const totalFamilyExpense = 
    (data.expenseFood + 
     data.expenseSchool + 
     data.expenseTransport + 
     data.expenseCommunication + 
     data.expenseHelpers + 
     data.expenseLifestyle) + data.expenseTax; // Tax biasanya tahunan

  // Total Pengeluaran (O)
  const totalAnnualExpense = totalAnnualInstallment + totalInsurance + totalAnnualSaving + totalFamilyExpense;

  // Pengeluaran Bulanan (P)
  const monthlyExpense = totalAnnualExpense / 12;

  // Surplus/Defisit (Q)
  const surplusDeficit = totalAnnualIncome - totalAnnualExpense;

  // --- 2. PERHITUNGAN 8 RASIO SESUAI REVISI ---
  const ratios: RatioDetail[] = [];
  let passedRatios = 0; // Untuk scoring sederhana

  // #1. RASIO DANA DARURAT (A / P)
  // Benchmark: 3 - 6 kali
  const r1 = monthlyExpense > 0 ? totalLiquid / monthlyExpense : 0;
  let s1: any = "RED";
  let rec1 = "Dana darurat sangat kurang (< 3 bulan). Risiko tinggi!";
  
  if (r1 >= 3 && r1 <= 6) { s1 = "GREEN_DARK"; rec1 = "Ideal (3-6 bulan)."; passedRatios++; }
  else if (r1 >= 7 && r1 <= 12) { s1 = "GREEN_LIGHT"; rec1 = "Aman, tapi agak berlebih (7-12 bulan)."; passedRatios++; }
  else if (r1 > 12) { s1 = "YELLOW"; rec1 = "Terlalu banyak uang menganggur (> 12 bulan). Investasikan."; }
  else { s1 = "RED"; } // < 3

  ratios.push({ 
    id: "emergency_fund", label: "Rasio Dana Darurat", 
    value: parseFloat(r1.toFixed(1)), benchmark: "3 - 6 kali", 
    statusColor: s1, recommendation: rec1,
    status: ""
  });

  // #2. RASIO LIKUIDITAS vs KEKAYAAN BERSIH (A / H)
  // Benchmark: 15% - 20%
  const r2 = netWorth > 0 ? (totalLiquid / netWorth) * 100 : 0;
  let s2: any = "RED";
  let rec2 = "Aset likuid terlalu sedikit (< 15%). Susah cairkan uang.";

  if (r2 > 50) { s2 = "GREEN_DARK"; rec2 = "Sangat likuid (> 50%)."; passedRatios++; }
  else if (r2 >= 20) { s2 = "GREEN_LIGHT"; rec2 = "Cukup likuid (20-50%)."; passedRatios++; }
  else if (r2 >= 15) { s2 = "YELLOW"; rec2 = "Agak ketat (15-20%)."; }
  else { s2 = "RED"; } // < 15

  ratios.push({ 
    id: "liq_networth", label: "Likuiditas vs Net Worth", 
    value: parseFloat(r2.toFixed(1)), benchmark: "15% - 20%", 
    statusColor: s2, recommendation: rec2,
    status: ""
  });

  // #3. RASIO TABUNGAN (M / I)
  // Benchmark: Min 10%
  const r3 = totalAnnualIncome > 0 ? (totalAnnualSaving / totalAnnualIncome) * 100 : 0;
  let s3: any = "RED";
  let rec3 = "Kurang menabung (< 10%). Masa depan terancam.";

  if (r3 >= 30) { s3 = "GREEN_DARK"; rec3 = "Excellent! Menabung > 30%."; passedRatios++; }
  else if (r3 >= 20) { s3 = "GREEN_LIGHT"; rec3 = "Sangat baik (20-30%)."; passedRatios++; }
  else if (r3 >= 10) { s3 = "YELLOW"; rec3 = "Cukup (10-20%). Tingkatkan lagi."; passedRatios++; } // Logic warna sesuai request
  else { s3 = "RED"; } // < 10

  ratios.push({ 
    id: "saving_ratio", label: "Rasio Tabungan", 
    value: parseFloat(r3.toFixed(1)), benchmark: "Min 10%", 
    statusColor: s3, recommendation: rec3,
    status: ""
  });

  // #4. RASIO UTANG vs ASET (G / D)
  // Benchmark: Maks 50%
  const r4 = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0;
  let s4: any = "RED";
  let rec4 = "Bahaya! Utang > 50% Aset. Risiko kebangkrutan.";

  if (r4 < 15) { s4 = "GREEN_DARK"; rec4 = "Sangat sehat. Utang sangat kecil (< 15%)."; passedRatios++; }
  else if (r4 < 35) { s4 = "GREEN_LIGHT"; rec4 = "Wajar (15-35%)."; passedRatios++; }
  else if (r4 <= 50) { s4 = "YELLOW"; rec4 = "Hati-hati. Utang mendekati batas aman (35-50%)."; }
  else { s4 = "RED"; } // > 50

  ratios.push({ 
    id: "debt_asset_ratio", label: "Rasio Utang vs Aset", 
    value: parseFloat(r4.toFixed(1)), benchmark: "Maks 50%", 
    statusColor: s4, recommendation: rec4,
    status: ""
  });

  // #5. RASIO CICILAN UTANG (K / I)
  // Benchmark: Maks 35%
  const r5 = totalAnnualIncome > 0 ? (totalAnnualInstallment / totalAnnualIncome) * 100 : 0;
  let s5: any = "RED";
  let rec5 = "Overleverage! Cicilan > 35% penghasilan.";

  if (r5 < 10) { s5 = "GREEN_DARK"; rec5 = "Beban cicilan sangat ringan (< 10%)."; passedRatios++; }
  else if (r5 < 15) { s5 = "GREEN_LIGHT"; rec5 = "Ringan (10-15%)."; passedRatios++; }
  else if (r5 <= 35) { s5 = "YELLOW"; rec5 = "Waspada (15-35%). Jangan tambah utang."; }
  else { s5 = "RED"; } // > 35

  ratios.push({ 
    id: "debt_service_ratio", label: "Rasio Cicilan Utang", 
    value: parseFloat(r5.toFixed(1)), benchmark: "Maks 35%", 
    statusColor: s5, recommendation: rec5,
    status: ""
  });

  // #6. RASIO CICILAN KONSUMTIF (J / I)
  // Benchmark: Maks 15%
  const r6 = totalAnnualIncome > 0 ? (totalConsumptiveInstallment / totalAnnualIncome) * 100 : 0;
  let s6: any = "RED";
  let rec6 = "Boros! Cicilan konsumtif > 15%. Stop hutang baru.";

  if (r6 < 5) { s6 = "GREEN_DARK"; rec6 = "Sangat hemat. Cicilan konsumtif < 5%."; passedRatios++; }
  else if (r6 < 10) { s6 = "GREEN_LIGHT"; rec6 = "Terkendali (5-10%)."; passedRatios++; }
  else if (r6 <= 15) { s6 = "YELLOW"; rec6 = "Batas wajar (10-15%)."; }
  else { s6 = "RED"; } // > 15

  ratios.push({ 
    id: "consumptive_ratio", label: "Rasio Cicilan Konsumtif", 
    value: parseFloat(r6.toFixed(1)), benchmark: "Maks 15%", 
    statusColor: s6, recommendation: rec6,
    status: ""
  });

  // #7. RASIO ASET INVESTASI vs KEKAYAAN BERSIH (C / H)
  // Benchmark: Min 50%
  const r7 = netWorth > 0 ? (totalInvestment / netWorth) * 100 : 0;
  let s7: any = "RED";
  let rec7 = "Aset mayoritas konsumtif/mati. Tingkatkan investasi.";

  if (r7 > 50) { s7 = "GREEN_DARK"; rec7 = "Portofolio produktif (> 50%)."; passedRatios++; }
  else if (r7 >= 25) { s7 = "GREEN_LIGHT"; rec7 = "Cukup (25-50%)."; passedRatios++; }
  else if (r7 >= 10) { s7 = "YELLOW"; rec7 = "Kurang (10-25%)."; }
  else { s7 = "RED"; } // < 10

  ratios.push({ 
    id: "invest_asset_ratio", label: "Rasio Aset Investasi", 
    value: parseFloat(r7.toFixed(1)), benchmark: "Min 50%", 
    statusColor: s7, recommendation: rec7,
    status: ""
  });

  // #8. RASIO SOLVABILITAS (H / D)
  // Benchmark: Min 50%
  const r8 = totalAssets > 0 ? (netWorth / totalAssets) * 100 : 0;
  let s8: any = "RED";
  let rec8 = "Risiko kebangkrutan tinggi! Modal sendiri < 25%.";

  if (r8 > 75) { s8 = "GREEN_DARK"; rec8 = "Sangat kuat (> 75% modal sendiri)."; passedRatios++; }
  else if (r8 >= 50) { s8 = "GREEN_LIGHT"; rec8 = "Sehat (50-75%)."; passedRatios++; }
  else if (r8 >= 25) { s8 = "YELLOW"; rec8 = "Rentan (25-50%)."; }
  else { s8 = "RED"; } // < 25

  ratios.push({ 
    id: "solvency_ratio", label: "Rasio Solvabilitas", 
    value: parseFloat(r8.toFixed(1)), benchmark: "Min 50%", 
    statusColor: s8, recommendation: rec8,
    status: ""
  });

  // --- FINAL SCORE (SIMPLIFIED) ---
  // Skor 0-100 berdasarkan persentase rasio yang lulus (GREEN/YELLOW dianggap lulus parsial)
  const score = Math.round((passedRatios / 8) * 100);
  
  let globalStatus = "BAHAYA";
  if (score >= 80) globalStatus = "SEHAT";
  else if (score >= 50) globalStatus = "WASPADA";
  
  return {
    score,
    globalStatus,
    ratios,
    netWorth,
    surplusDeficit, // Q
    generatedAt: new Date().toISOString()
  };
};