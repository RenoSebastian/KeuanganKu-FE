import api from "@/lib/axios";
import { AxiosResponse } from "axios";
import {
  FinancialRecord,
  HealthAnalysisResult,
  CreateBudgetDto,
  CreatePensionDto,
  PensionPlanData,
  CreateInsuranceDto,
  InsurancePlanData,
  CreateGoalDto,
  SimulateGoalDto,
  GoalPlanData,
  GoalSimulationResult,
  CreateBudgetSimulationDto,
  CreateInsuranceSimulationDto,
  CreatePensionSimulationDto,
  CreateGoalSimulationDto,
  FinancialRecordHistory,
  BudgetPlanHistory,
} from "@/lib/types";
import { CreateRiskProfileSimulationDto } from "@/lib/types/risk-profile";

// [NEW] Import Adapter Types & Logic
import {
  FinancialFormState, // Alias untuk FinancialAnnualState
  FinancialAnnualState,
  FinancialMonthlyPayload
} from "@/lib/types/financial-checkup";

import {
  convertRecordToMonthly,
  convertRecordToAnnual
} from "@/lib/financial-math";

// [UPDATED] Import Response Type baru untuk Education
import {
  EducationSimulationPayload,
  EducationSimulationResponse
} from "@/lib/types/education";

// [NEW] Import Pure Fabrication Utility untuk standardisasi penamaan file
import { generateSimulationFilename } from "@/lib/formatters";

// [ADDED] Import type untuk PWA Post-Download Action
import { DownloadResultData } from "@/components/features/shared/post-download-action";

// ============================================================================
// PRIVATE ADAPTER HELPERS (Internal Service Logic)
// ============================================================================

/**
 * Mengonversi Annual State (UI) -> Monthly Payload (API)
 * Memisahkan data finansial dari data klien, mengonversi angka, lalu menggabungkan kembali.
 * [FIXED - Tahap 1 & 3] Menambahkan sanitasi Data FE dan mencegah hilangnya properti laten (destructuring bug).
 */
function toMonthlyPayload(data: FinancialAnnualState & { client?: any, spouse?: any, sessionId: string }): any {
  // 1. Ekstraksi eksplisit data non-finansial
  const { client, spouse, sessionId, ...rawFinancials } = data as any;

  // 2. Sanitasi data finansial murni (Mencegah string kosong "" atau NaN terkirim ke BE)
  const sanitizedFinancials: any = {};
  for (const key in rawFinancials) {
    const val = rawFinancials[key];
    // Jika nilai kosong, null, undefined, atau tidak bisa di-cast ke angka, paksa jadi 0 mutlak
    if (val === undefined || val === null || val === "" || Number.isNaN(Number(val))) {
      sanitizedFinancials[key] = 0;
    } else {
      sanitizedFinancials[key] = Number(val);
    }
  }

  // 3. Konversi Angka Finansial yang sudah bersih (Annual -> Monthly)
  const monthlyFinancial = convertRecordToMonthly(sanitizedFinancials);

  // 4. Gabungkan kembali secara utuh (tidak ada properti laten yang terbuang)
  return {
    ...sanitizedFinancials, // Fallback mempertahankan properti yang mungkin tidak ikut dikonversi oleh util
    ...monthlyFinancial,    // Timpa dengan hasil konversi bulanan
    client,
    spouse,
    sessionId, // [CRITICAL] Wajib ada untuk sistem kuota BE
  };
}

/**
 * Mengonversi Monthly Payload (API) -> Annual State (UI)
 * Memastikan semua flow (pemasukan/pengeluaran) dikali 12.
 */
function toAnnualState(record: FinancialMonthlyPayload): FinancialAnnualState {
  return convertRecordToAnnual(record);
}

/**
 * [NEW HELPER] PWA-Friendly File Preparer
 * Mengubah response Axios menjadi objek DownloadResultData tanpa memicu download otomatis.
 */
function prepareFileForPwa(response: AxiosResponse<Blob>, defaultTitle: string, clientName: string): DownloadResultData {
  const disposition = response.headers["content-disposition"];
  let filename = generateSimulationFilename(defaultTitle, clientName, "pdf");

  // Pertajam pencarian nama file dari header Content-Disposition
  if (disposition) {
    const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, "");
    }
  }

  // Bungkus ke objek File asli agar kompatibel dengan navigator.share (PWA)
  const file = new File([response.data], filename, {
    type: response.data.type || "application/pdf",
    lastModified: Date.now()
  });

  const url = window.URL.createObjectURL(file);

  return { file, url, filename };
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export const financialService = {
  // ===========================================================================
  // 1. FINANCIAL CHECKUP (EXISTING / PERSONAL - DB SAVED)
  // ===========================================================================

  createCheckup: async (data: FinancialRecord) => {
    const response = await api.post<HealthAnalysisResult>("/financial/checkup", data);
    return response.data;
  },

  getLatestCheckup: async () => {
    const response = await api.get<FinancialRecord & HealthAnalysisResult>("/financial/checkup/latest");
    return response.data;
  },

  getCheckupHistory: async () => {
    const response = await api.get<FinancialRecordHistory[]>("/financial/checkup/history");
    return response.data;
  },

  getCheckupDetail: async (id: string) => {
    const response = await api.get(`/financial/checkup/detail/${id}`);
    return response.data;
  },

  /**
   * [UPDATED] downloadCheckupPdf
   * Sekarang mengembalikan DownloadResultData untuk diproses oleh PostDownloadAction Modal.
   */
  downloadCheckupPdf: async (checkupId: string, clientName: string = "Klien"): Promise<DownloadResultData> => {
    const response = await api.get(`/financial/checkup/pdf/${checkupId}`, {
      responseType: 'blob',
      timeout: 60000,
    });

    return prepareFileForPwa(response, "Financial Checkup", clientName);
  },

  // ===========================================================================
  // 2. BUDGETING
  // ===========================================================================

  createBudget: async (data: CreateBudgetDto) => {
    const response = await api.post("/financial/budget", data);
    return response.data;
  },

  getBudgets: async () => {
    const response = await api.get<BudgetPlanHistory[]>("/financial/budget/history");
    return response.data;
  },

  /**
   * [UPDATED] downloadBudgetPdf
   */
  downloadBudgetPdf: async (budgetId: string, clientName: string = "Klien"): Promise<DownloadResultData> => {
    const response = await api.get(`/financial/budget/pdf/${budgetId}`, {
      responseType: 'blob',
      timeout: 60000,
    });

    return prepareFileForPwa(response, "Budget Plan", clientName);
  },

  // ===========================================================================
  // 3. NEW CALCULATORS
  // ===========================================================================

  // A. Pensiun
  calculatePension: async (data: CreatePensionDto) => {
    const response = await api.post<{ plan: PensionPlanData, calculation: any }>("/financial/calculator/pension", data);
    return response.data;
  },

  /**
   * [UPDATED] downloadPensionPdf
   */
  downloadPensionPdf: async (planId: string, clientName: string = "Klien"): Promise<DownloadResultData> => {
    const response = await api.get(`/financial/pension/pdf/${planId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    return prepareFileForPwa(response, "Pension Plan", clientName);
  },

  // B. Asuransi
  calculateInsurance: async (data: CreateInsuranceDto) => {
    const response = await api.post<{ plan: InsurancePlanData, calculation: any }>("/financial/calculator/insurance", data);
    const raw = response.data;

    // [FIXED] Parsing aman: Tetap pertahankan null/undefined jika memang dikembalikan oleh BE (Information Expert)
    if (raw.calculation) {
      const safeNumber = (val: any) => (val === null || val === undefined) ? undefined : Number(val);
      raw.calculation = {
        ...raw.calculation,
        incomeReplacementValue: safeNumber(raw.calculation.incomeReplacementValue),
        debtClearanceValue: safeNumber(raw.calculation.debtClearanceValue),
        otherNeeds: safeNumber(raw.calculation.otherNeeds),
        totalNeeded: safeNumber(raw.calculation.totalNeeded),
        coverageGap: safeNumber(raw.calculation.coverageGap),
      };
    }
    return raw;
  },

  /**
   * [UPDATED] downloadInsurancePdf
   */
  downloadInsurancePdf: async (planId: string, clientName: string = "Klien"): Promise<DownloadResultData> => {
    const response = await api.get(`/financial/insurance/pdf/${planId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    return prepareFileForPwa(response, "Insurance Plan", clientName);
  },

  // C. Goals
  calculateGoal: async (data: CreateGoalDto) => {
    const response = await api.post<{ plan: GoalPlanData, calculation: any }>("/financial/calculator/goals", data);
    return response.data;
  },

  simulateGoal: async (data: SimulateGoalDto) => {
    const response = await api.post<{ status: string, data: GoalSimulationResult }>("/financial/goals/simulate", data);
    return response.data.data;
  },

  /**
   * [UPDATED] downloadGoalPdf
   */
  downloadGoalPdf: async (planId: string, clientName: string = "Klien"): Promise<DownloadResultData> => {
    const response = await api.get(`/financial/goals/pdf/${planId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    return prepareFileForPwa(response, "Goal Plan", clientName);
  },

  // D. Pendidikan Anak (PERSONAL - DB SAVED)
  calculateEducation: async (data: any) => {
    const response = await api.post<{ plan: any, calculation: any }>("/financial/calculator/education", data);
    return response.data;
  },

  getEducationPlans: async () => {
    const response = await api.get<any[]>("/financial/calculator/education");
    const cleanData = response.data.map((plan: any) => ({
      ...plan,
      plan: {
        ...plan.plan,
        inflationRate: Number(plan.plan.inflationRate || 0),
        returnRate: Number(plan.plan.returnRate || 0),
      },
      calculation: {
        ...plan.calculation,
        totalFutureCost: Number(plan.calculation.totalFutureCost || 0),
        monthlySaving: Number(plan.calculation.monthlySaving || 0),
        stagesBreakdown: plan.calculation.stagesBreakdown.map((stage: any) => ({
          ...stage,
          currentCost: Number(stage.currentCost || 0),
          futureCost: Number(stage.futureCost || 0),
          monthlySaving: Number(stage.monthlySaving || 0),
          yearsToStart: Number(stage.yearsToStart || 0)
        }))
      }
    }));
    return cleanData;
  },

  deleteEducationPlan: async (id: string) => {
    const response = await api.delete(`/financial/calculator/education/${id}`);
    return response.data;
  },

  /**
   * [UPDATED] downloadEducationPdf (Personal)
   */
  downloadEducationPdf: async (clientName: string = "Klien"): Promise<DownloadResultData> => {
    const response = await api.get(`/financial/education/pdf`, {
      responseType: 'blob',
      timeout: 60000,
    });
    return prepareFileForPwa(response, "Education Plan", clientName);
  },

  // ===========================================================================
  // 4. MARKET DATA
  // ===========================================================================

  getLatestGoldPrice: async () => {
    const response = await api.get<{
      success: boolean;
      data: {
        buyPrice: string;
        sellPrice: string;
        [key: string]: any;
      };
      timestamp: string;
    }>("/market/gold-price");
    return response.data;
  },

  /**
   * [UPDATED] downloadHistoryPdf
   */
  downloadHistoryPdf: async (historyId: string, clientName: string = "Klien"): Promise<DownloadResultData> => {
    const response = await api.get(`/financial/checkup/history/pdf/${historyId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    return prepareFileForPwa(response, "Checkup History", clientName);
  },

  // ===========================================================================
  // 8. AGENT SIMULATION (STATELESS / OFFLINE-FIRST)
  // ===========================================================================

  simulateAgentBudget: async (data: CreateBudgetSimulationDto & { sessionId: string }): Promise<AxiosResponse<Blob>> => {
    return await api.post("/financial/simulation/budget", data, {
      responseType: 'blob'
    });
  },

  simulateAgentInsurance: async (data: CreateInsuranceSimulationDto & { sessionId: string }): Promise<AxiosResponse<Blob>> => {
    return await api.post("/financial/simulation/insurance", data, {
      responseType: 'blob'
    });
  },

  simulateAgentPension: async (data: CreatePensionSimulationDto & { sessionId: string }): Promise<AxiosResponse<Blob>> => {
    return await api.post("/financial/simulation/pension", data, {
      responseType: 'blob'
    });
  },

  simulateAgentGoal: async (data: CreateGoalSimulationDto & { sessionId: string }): Promise<AxiosResponse<Blob>> => {
    return await api.post("/financial/simulation/goals", data, {
      responseType: 'blob'
    });
  },

  simulateAgentRiskProfile: async (data: CreateRiskProfileSimulationDto & { sessionId: string }): Promise<AxiosResponse<Blob>> => {
    return await api.post("/financial/simulation/risk-profile-pdf", data, {
      responseType: 'blob'
    });
  },

  // [UPDATED] Arsitektur Base64 JSON Pipeline untuk Checkup
  simulateAgentCheckup: async (data: FinancialFormState & { sessionId: string }): Promise<any> => {
    const apiPayload = toMonthlyPayload(data);

    // PERHATIKAN: Kita membuang { responseType: 'blob' } karena sekarang responnya JSON
    const response = await api.post("/financial/simulation/checkup", apiPayload);

    return response.data; // Mengembalikan JSON langsung
  },

  // ===========================================================================
  // 13. AGENT EDUCATION SIMULATION (SINGLE ENDPOINT - BASE64 JSON PIPELINE)
  // ===========================================================================

  /**
   * Kalkulasi Data & Extract PDF Base64 dalam satu payload
   */
  simulateAgentEducation: async (data: EducationSimulationPayload & { sessionId: string }): Promise<any> => {
    // Tembak endpoint JSON standar (tanpa blob stream)
    const response = await api.post("/financial/simulation/education", data);

    const responseData = response.data;

    // Normalisasi token MGC jika struktur kembalian bersarang (Edge Case Guard)
    if (responseData && responseData.data && responseData.data.mgcToken && !responseData.mgcToken) {
      responseData.mgcToken = responseData.data.mgcToken;
    }

    return responseData;
  },

  /**
   * [CRITICAL FIX] Endpoint Stateless untuk me-render ulang PDF dari sesi Import MGC
   */
  exportEducationPdfStateless: async (data: any): Promise<string> => {
    const response = await api.post("/financial/simulation/education/export-pdf", data);
    // Mengembalikan string base64 secara langsung sesuai kontrak data
    return response.data.pdfBase64;
  },

  /**
   * decodeSimulationToken
   */
  decodeSimulationToken: async (token: string) => {
    const response = await api.post("/financial/simulation/decode", { simulationToken: token });
    let rawData = response.data;

    if (rawData && rawData.data && !rawData.financial) {
      rawData = rawData.data;
    }

    if (rawData && rawData.financial) {
      rawData.financial = toAnnualState(rawData.financial);
    }

    return rawData;
  },

  /**
   * [UPDATED] downloadSimulationFiles
   * Mengolah token MGC hasil simulasi menjadi objek DownloadResultData (PWA Ready)
   * Menggunakan application/octet-stream agar didownload sebagai file biner .mgc
   */
  downloadSimulationFiles: (simulationResult: any, clientName: string = "Klien"): DownloadResultData => {
    const { mgcToken, filename } = simulationResult;
    const actualToken = mgcToken || simulationResult?.data?.mgcToken;

    if (!actualToken) {
      throw new Error("Token MGC tidak ditemukan pada payload balasan server.");
    }

    const fallbackFilename = generateSimulationFilename("Simulation", clientName, "mgc");
    let baseFilename = filename || fallbackFilename;

    // Pastikan ekstensinya adalah .mgc
    const tokenName = baseFilename.endsWith('.mgc')
      ? baseFilename
      : baseFilename.replace(/\.pdf$/i, '') + '.mgc';

    // Bungkus ke objek File biner
    const blob = new Blob([actualToken], { type: 'application/octet-stream' });
    const file = new File([blob], tokenName, {
      type: 'application/octet-stream',
      lastModified: Date.now()
    });

    const url = window.URL.createObjectURL(file);

    return { file, url, filename: tokenName };
  }
};