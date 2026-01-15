import { ChildProfile, EducationStage, PlanInput, PortfolioSummary, StageResult, ChildSimulationResult } from "./types";

// --- DATABASE JENJANG (Diupdate dengan Payment Frequency) ---
export const STAGES_DB: EducationStage[] = [
  { id: "TK", label: "TK / PAUD", entryAge: 4, duration: 2, paymentFrequency: "MONTHLY" },
  { id: "SD", label: "Sekolah Dasar", entryAge: 6, duration: 6, paymentFrequency: "MONTHLY" },
  { id: "SMP", label: "SMP", entryAge: 12, duration: 3, paymentFrequency: "MONTHLY" },
  { id: "SMA", label: "SMA", entryAge: 15, duration: 3, paymentFrequency: "MONTHLY" },
  { id: "KULIAH", label: "Universitas", entryAge: 18, duration: 4, paymentFrequency: "SEMESTER" },
];

// --- BASIC HELPERS ---

export const formatRupiah = (val: number) => 
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

export const calculateAge = (dob: string): number => {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

export const calculateFV = (pv: number, rate: number, years: number): number => {
  return pv * Math.pow(1 + rate / 100, years);
};

export const calculatePMT = (fv: number, annualReturn: number, months: number): number => {
  if (months <= 0) return fv; // Jika waktu habis/negatif, harus bayar lunas sekarang
  const monthlyReturn = (annualReturn / 100) / 12;
  if (monthlyReturn === 0) return fv / months;
  return (fv * monthlyReturn) / (Math.pow(1 + monthlyReturn, months) - 1);
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

  // 1. Tentukan Titik Awal (Tahun keberapa anak masuk?)
  // Jika startGrade = 1, masuk sesuai entryAge normal.
  // Jika startGrade = 3, berarti masuknya telat 2 tahun (entryAge + 2).
  // Jarak Waktu (n) = Target Usia - Usia Sekarang.
  const gradeOffset = input.startGrade - 1;
  const targetEntryAge = refStage.entryAge + gradeOffset;
  let yearsUntilEntry = targetEntryAge - childAge;
  if (yearsUntilEntry < 0) yearsUntilEntry = 0;

  // Variabel Penampung Total
  let totalFutureCost = 0;
  let totalMonthlySaving = 0;
  const breakdownDetails: any[] = [];

  // --- KOMPONEN A: UANG PANGKAL (ENTRY FEE) ---
  // Hanya dihitung jika anak masuk dari Kelas 1 (startGrade === 1)
  // Asumsi: Kalau pindahan/lanjut kelas tengah, uang pangkal dianggap sudah lunas/beda skema.
  if (input.startGrade === 1 && input.costNow.entryFee > 0) {
    const timeDistance = yearsUntilEntry; // Jarak waktu (Tahun)
    const fvEntry = calculateFV(input.costNow.entryFee, inflation, timeDistance);
    
    // Hitung PMT untuk item ini
    const monthsToSave = timeDistance * 12;
    const savingReq = calculatePMT(fvEntry, returnRate, monthsToSave);

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
  // Dihitung per tahun ajaran
  const remainingDuration = refStage.duration - gradeOffset;

  for (let i = 0; i < remainingDuration; i++) {
    // Jarak waktu pembayaran untuk tahun ke-i
    // Tahun 1 jaraknya = yearsUntilEntry
    // Tahun 2 jaraknya = yearsUntilEntry + 1, dst.
    const timeDistance = yearsUntilEntry + i;
    
    // Tentukan Base Cost per Tahun
    let yearlyBaseCost = 0;
    let labelItem = "";

    if (refStage.paymentFrequency === "MONTHLY") {
      yearlyBaseCost = input.costNow.monthlyFee * 12; // SPP x 12 bulan
      labelItem = `SPP Tahun ke-${i + 1}`;
    } else {
      yearlyBaseCost = input.costNow.monthlyFee * 2; // UKT x 2 semester
      labelItem = `UKT Tahun ke-${i + 1}`;
    }

    if (yearlyBaseCost > 0) {
      // 1. Hitung Inflasi untuk tahun ke-i
      const fvYearly = calculateFV(yearlyBaseCost, inflation, timeDistance);
      
      // 2. Hitung PMT (Menabung sampai tahun ke-i)
      // Logic: Kita punya waktu menabung sampai tagihan tahun ke-i datang.
      // Jadi beban SPP kelas 6 SD, bisa dicicil selama 6 tahun, bukan 1 tahun.
      const monthsToSave = timeDistance * 12;
      const savingReq = calculatePMT(fvYearly, returnRate, monthsToSave);

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