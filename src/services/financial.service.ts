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
  FinancialMonthlyPayload,
  CheckupSimulationResponse
} from "@/lib/types/financial-checkup";

import {
  convertRecordToMonthly,
  convertRecordToAnnual
} from "@/lib/financial-math";

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
 * [TAHAP 2 & 3: BLUESPRINT DEFENSIVE PROGRAMMING]
 * Menginspeksi Blob yang diterima. Jika ternyata Backend mengembalikan JSON
 * (misal karena ada Error 500/400 yang tersembunyi), kita cegah browser
 * menelannya sebagai PDF murni yang berujung pada Infinite Loading Loop.
 */
async function validateBlobResponse(response: AxiosResponse<Blob>): Promise<Blob> {
  const blob = response.data;

  // Jika tipe MIME adalah JSON, ini mengindikasikan pelanggaran kontrak/Error State!
  if (blob.type && blob.type.includes('application/json')) {
    const text = await blob.text();
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch (e) {
      throw new Error('Terjadi kesalahan memproses respons dokumen dari server.');
    }

    // Lempar error agar bisa ditangkap oleh catch() di UI komponen (memunculkan Toast Error)
    throw new Error(errorData.message || errorData.error || 'Terjadi kegagalan saat membuat dokumen PDF.');
  }

  return blob;
}

/**
 * Mengonversi Annual State (UI) -> Monthly Payload (API)
 */
function toMonthlyPayload(data: FinancialAnnualState & { client?: any, spouse?: any, sessionId: string }): any {
  const { client, spouse, sessionId, ...rawFinancials } = data as any;

  const sanitizedFinancials: any = {};
  for (const key in rawFinancials) {
    const val = rawFinancials[key];
    if (val === undefined || val === null || val === "" || Number.isNaN(Number(val))) {
      sanitizedFinancials[key] = 0;
    } else {
      sanitizedFinancials[key] = Number(val);
    }
  }

  const monthlyFinancial = convertRecordToMonthly(sanitizedFinancials);

  return {
    ...sanitizedFinancials,
    ...monthlyFinancial,
    client,
    spouse,
    sessionId,
  };
}

/**
 * Mengonversi Monthly Payload (API) -> Annual State (UI)
 */
function toAnnualState(record: FinancialMonthlyPayload): FinancialAnnualState {
  return convertRecordToAnnual(record);
}

/**
 * [UPDATED HELPER] PWA-Friendly File Preparer dengan Validasi Defensive Async
 */
async function prepareFileForPwa(response: AxiosResponse<Blob>, defaultTitle: string, clientName: string): Promise<DownloadResultData> {
  // Validasi tipe blob terlebih dahulu (Mencegah parse error ke depannya)
  const validBlob = await validateBlobResponse(response);

  const disposition = response.headers["content-disposition"];
  let filename = generateSimulationFilename(defaultTitle, clientName, "pdf");

  if (disposition) {
    const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, "");
    }
  }

  const contentTypeHeader = response.headers['content-type'] || response.headers['Content-Type'] || '';
  const mimeType = contentTypeHeader.split(';')[0].trim() || 'application/pdf';

  const file = new File([validBlob], filename, {
    type: mimeType,
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

  downloadCheckupPdf: async (checkupId: string, clientName: string = "Klien"): Promise<DownloadResultData> => {
    const response = await api.get(`/financial/checkup/pdf/${checkupId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    // Menambahkan await karena helper sudah diubah menjadi async
    return await prepareFileForPwa(response, "Financial Checkup", clientName);
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

  downloadBudgetPdf: async (budgetId: string, clientName: string = "Klien"): Promise<DownloadResultData> => {
    const response = await api.get(`/financial/budget/pdf/${budgetId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    return await prepareFileForPwa(response, "Budget Plan", clientName);
  },

  // ===========================================================================
  // 3. NEW CALCULATORS
  // ===========================================================================

  calculatePension: async (data: CreatePensionDto) => {
    const response = await api.post<{ plan: PensionPlanData, calculation: any }>("/financial/calculator/pension", data);
    return response.data;
  },

  downloadPensionPdf: async (planId: string, clientName: string = "Klien"): Promise<DownloadResultData> => {
    const response = await api.get(`/financial/pension/pdf/${planId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    return await prepareFileForPwa(response, "Pension Plan", clientName);
  },

  calculateInsurance: async (data: CreateInsuranceDto) => {
    const response = await api.post<{ plan: InsurancePlanData, calculation: any }>("/financial/calculator/insurance", data);
    const raw = response.data;

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

  downloadInsurancePdf: async (planId: string, clientName: string = "Klien"): Promise<DownloadResultData> => {
    const response = await api.get(`/financial/insurance/pdf/${planId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    return await prepareFileForPwa(response, "Insurance Plan", clientName);
  },

  calculateGoal: async (data: CreateGoalDto) => {
    const response = await api.post<{ plan: GoalPlanData, calculation: any }>("/financial/calculator/goals", data);
    return response.data;
  },

  simulateGoal: async (data: SimulateGoalDto) => {
    const response = await api.post<{ status: string, data: GoalSimulationResult }>("/financial/goals/simulate", data);
    return response.data.data;
  },

  downloadGoalPdf: async (planId: string, clientName: string = "Klien"): Promise<DownloadResultData> => {
    const response = await api.get(`/financial/goals/pdf/${planId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    return await prepareFileForPwa(response, "Goal Plan", clientName);
  },

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

  downloadEducationPdf: async (clientName: string = "Klien"): Promise<DownloadResultData> => {
    const response = await api.get(`/financial/education/pdf`, {
      responseType: 'blob',
      timeout: 60000,
    });
    return await prepareFileForPwa(response, "Education Plan", clientName);
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

  downloadHistoryPdf: async (historyId: string, clientName: string = "Klien"): Promise<DownloadResultData> => {
    const response = await api.get(`/financial/checkup/history/pdf/${historyId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    return await prepareFileForPwa(response, "Checkup History", clientName);
  },

  // ===========================================================================
  // 8. AGENT SIMULATION (STATELESS / OFFLINE-FIRST)
  // ===========================================================================

  simulateAgentBudget: async (data: CreateBudgetSimulationDto & { sessionId: string }): Promise<AxiosResponse<Blob>> => {
    const response = await api.post("/financial/simulation/budget", data, { responseType: 'blob' });
    // Validasi tipe blob sebelum mengembalikan objek response Axios utuh ke komponen
    await validateBlobResponse(response);
    return response;
  },

  simulateAgentInsurance: async (data: CreateInsuranceSimulationDto & { sessionId: string }): Promise<AxiosResponse<Blob>> => {
    const response = await api.post("/financial/simulation/insurance", data, { responseType: 'blob' });
    await validateBlobResponse(response);
    return response;
  },

  simulateAgentPension: async (data: CreatePensionSimulationDto & { sessionId: string }): Promise<AxiosResponse<Blob>> => {
    const response = await api.post("/financial/simulation/pension", data, { responseType: 'blob' });
    await validateBlobResponse(response);
    return response;
  },

  simulateAgentGoal: async (data: CreateGoalSimulationDto & { sessionId: string }): Promise<AxiosResponse<Blob>> => {
    const response = await api.post("/financial/simulation/goals", data, { responseType: 'blob' });
    await validateBlobResponse(response);
    return response;
  },

  simulateAgentRiskProfile: async (data: CreateRiskProfileSimulationDto & { sessionId: string }): Promise<AxiosResponse<Blob>> => {
    const response = await api.post("/financial/simulation/risk-profile-pdf", data, { responseType: 'blob' });
    await validateBlobResponse(response);
    return response;
  },

  simulateAgentCheckup: async (data: FinancialFormState & { sessionId: string }): Promise<CheckupSimulationResponse> => {
    const apiPayload = toMonthlyPayload(data);
    const response = await api.post<CheckupSimulationResponse>("/financial/simulation/checkup/calculate", apiPayload);

    const responseData = response.data as any;

    if (responseData && responseData.data && responseData.data.mgcToken && !responseData.mgcToken) {
      responseData.mgcToken = responseData.data.mgcToken;
    }

    return responseData;
  },

  downloadAgentCheckupPdf: async (simulationId: string, clientName: string = "Klien"): Promise<DownloadResultData> => {
    const response = await api.get(`/financial/simulation/checkup/${simulationId}/pdf`, {
      responseType: 'blob',
      timeout: 60000,
    });
    return await prepareFileForPwa(response, "Checkup Simulation", clientName);
  },

  // ===========================================================================
  // [TAHAP 2] DEDICATED PREVIEW ENDPOINTS (MODAL IN-MEMORY VIEWER)
  // Menargetkan /preview-pdf dari BE. Murni mengembalikan Blob tervalidasi.
  // ===========================================================================

  previewAgentBudget: async (data: CreateBudgetSimulationDto & { sessionId: string }): Promise<Blob> => {
    const response = await api.post("/financial/simulation/budget/preview-pdf", data, { responseType: 'blob' });
    return await validateBlobResponse(response);
  },

  previewAgentInsurance: async (data: CreateInsuranceSimulationDto & { sessionId: string }): Promise<Blob> => {
    const response = await api.post("/financial/simulation/insurance/preview-pdf", data, { responseType: 'blob' });
    return await validateBlobResponse(response);
  },

  previewAgentPension: async (data: CreatePensionSimulationDto & { sessionId: string }): Promise<Blob> => {
    const response = await api.post("/financial/simulation/pension/preview-pdf", data, { responseType: 'blob' });
    return await validateBlobResponse(response);
  },

  previewAgentGoal: async (data: CreateGoalSimulationDto & { sessionId: string }): Promise<Blob> => {
    const response = await api.post("/financial/simulation/goals/preview-pdf", data, { responseType: 'blob' });
    return await validateBlobResponse(response);
  },

  previewAgentRiskProfile: async (data: CreateRiskProfileSimulationDto & { sessionId: string }): Promise<Blob> => {
    const response = await api.post("/financial/simulation/risk-profile/preview-pdf", data, { responseType: 'blob' });
    return await validateBlobResponse(response);
  },

  previewAgentCheckup: async (data: FinancialFormState & { sessionId: string }): Promise<Blob> => {
    const apiPayload = toMonthlyPayload(data);
    const response = await api.post("/financial/simulation/checkup/preview-pdf", apiPayload, { responseType: 'blob' });
    return await validateBlobResponse(response);
  },

  previewAgentEducation: async (data: EducationSimulationPayload & { sessionId: string }): Promise<Blob> => {
    const response = await api.post("/financial/simulation/education/preview-pdf", data, { responseType: 'blob' });
    return await validateBlobResponse(response);
  },


  // ===========================================================================
  // AGENT EDUCATION SIMULATION (SCENARIO B: DECOUPLED I/O)
  // ===========================================================================

  simulateAgentEducation: async (data: EducationSimulationPayload & { sessionId: string }): Promise<EducationSimulationResponse> => {
    const response = await api.post<EducationSimulationResponse>("/financial/simulation/education/calculate", data);

    const responseData = response.data as any;

    if (responseData && responseData.data && responseData.data.mgcToken && !responseData.mgcToken) {
      responseData.mgcToken = responseData.data.mgcToken;
    }

    return responseData;
  },

  downloadEducationSimulationPdf: async (simulationId: string, clientName: string = "Klien"): Promise<DownloadResultData> => {
    const response = await api.get(`/financial/simulation/education/${simulationId}/pdf`, {
      responseType: 'blob',
      timeout: 60000,
    });
    return await prepareFileForPwa(response, "Education Plan", clientName);
  },

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

  downloadSimulationFiles: (simulationResult: any, clientName: string = "Klien"): DownloadResultData => {
    const { mgcToken, filename } = simulationResult;
    const actualToken = mgcToken || simulationResult?.data?.mgcToken;

    if (!actualToken) {
      throw new Error("Token MGC tidak ditemukan pada payload balasan server.");
    }

    const fallbackFilename = generateSimulationFilename("Simulation", clientName, "mgc");
    let baseFilename = filename || fallbackFilename;

    const tokenName = baseFilename.endsWith('.mgc')
      ? baseFilename
      : baseFilename.replace(/\.pdf$/i, '') + '.mgc';

    const blob = new Blob([actualToken], { type: 'application/octet-stream' });
    const file = new File([blob], tokenName, {
      type: 'application/octet-stream',
      lastModified: Date.now()
    });

    const url = window.URL.createObjectURL(file);

    return { file, url, filename: tokenName };
  }
};