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

// [UPDATED] Import Response Type baru untuk Education
import {
  EducationSimulationPayload,
  EducationSimulationResponse
} from "@/lib/types/education";

// [NEW] Import Pure Fabrication Utility untuk standardisasi penamaan file
import { generateSimulationFilename } from "@/lib/formatters";

// ============================================================================
// PRIVATE ADAPTER HELPERS (Internal Service Logic)
// ============================================================================

/**
 * Mengonversi Annual State (UI) -> Monthly Payload (API)
 * Memisahkan data finansial dari data klien, mengonversi angka, lalu menggabungkan kembali.
 * [UPDATED] Menambahkan dukungan untuk sessionId agar tidak hilang saat konversi.
 */
function toMonthlyPayload(data: FinancialAnnualState & { client?: any, spouse?: any, sessionId: string }): any {
  // 1. Konversi Angka Finansial (Annual -> Monthly)
  const monthlyFinancial = convertRecordToMonthly(data);

  // 2. Pertahankan Data Non-Finansial (Client, Spouse, dll)
  // Kita ambil properti lain yang mungkin ada di object data
  const { client, spouse, sessionId, ...rest } = data as any;

  // 3. Gabungkan kembali (Flat Object untuk dikirim ke Backend)
  // Backend menerima object flat yang berisi field finansial + field client + sessionId
  return {
    ...monthlyFinancial,
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

  downloadCheckupPdf: async (checkupId: string, clientName: string = "Klien") => {
    const response = await api.get(`/financial/checkup/pdf/${checkupId}`, {
      responseType: 'blob',
      timeout: 60000,
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    // Menggunakan Formatter Terstandar
    const filename = generateSimulationFilename("Financial Checkup", clientName, "pdf");
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
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

  downloadBudgetPdf: async (budgetId: string, clientName: string = "Klien") => {
    const response = await api.get(`/financial/budget/pdf/${budgetId}`, {
      responseType: 'blob',
      timeout: 60000,
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    // Menggunakan Formatter Terstandar
    link.setAttribute('download', generateSimulationFilename("Budget Plan", clientName, "pdf"));
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // ===========================================================================
  // 3. NEW CALCULATORS
  // ===========================================================================

  // A. Pensiun
  calculatePension: async (data: CreatePensionDto) => {
    const response = await api.post<{ plan: PensionPlanData, calculation: any }>("/financial/calculator/pension", data);
    return response.data;
  },

  downloadPensionPdf: async (planId: string, clientName: string = "Klien") => {
    const response = await api.get(`/financial/pension/pdf/${planId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    // Menggunakan Formatter Terstandar
    link.setAttribute('download', generateSimulationFilename("Pension Plan", clientName, "pdf"));
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // B. Asuransi
  calculateInsurance: async (data: CreateInsuranceDto) => {
    const response = await api.post<{ plan: InsurancePlanData, calculation: any }>("/financial/calculator/insurance", data);
    const raw = response.data;
    if (raw.calculation) {
      raw.calculation = {
        ...raw.calculation,
        incomeReplacementValue: Number(raw.calculation.incomeReplacementValue || 0),
        debtClearanceValue: Number(raw.calculation.debtClearanceValue || 0),
        otherNeeds: Number(raw.calculation.otherNeeds || 0),
        totalNeeded: Number(raw.calculation.totalNeeded || 0),
        coverageGap: Number(raw.calculation.coverageGap || 0),
      };
    }
    return raw;
  },

  downloadInsurancePdf: async (planId: string, clientName: string = "Klien") => {
    const response = await api.get(`/financial/insurance/pdf/${planId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    // Menggunakan Formatter Terstandar
    link.setAttribute('download', generateSimulationFilename("Insurance Plan", clientName, "pdf"));
    document.body.appendChild(link);
    link.click();
    link.remove();
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

  downloadGoalPdf: async (planId: string, clientName: string = "Klien") => {
    const response = await api.get(`/financial/goals/pdf/${planId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    // Menggunakan Formatter Terstandar
    link.setAttribute('download', generateSimulationFilename("Goal Plan", clientName, "pdf"));
    document.body.appendChild(link);
    link.click();
    link.remove();
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

  // Download for PERSONAL Education Plan
  downloadEducationPdf: async (clientName: string = "Klien") => {
    const response = await api.get(`/financial/education/pdf`, {
      responseType: 'blob',
      timeout: 60000,
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    // Menggunakan Formatter Terstandar
    link.setAttribute('download', generateSimulationFilename("Education Plan", clientName, "pdf"));
    document.body.appendChild(link);
    link.click();
    link.remove();
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

  downloadHistoryPdf: async (historyId: string, clientName: string = "Klien") => {
    const response = await api.get(`/financial/checkup/history/pdf/${historyId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    // Menggunakan Formatter Terstandar
    link.setAttribute('download', generateSimulationFilename("Checkup History", clientName, "pdf"));
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // ===========================================================================
  // 8. AGENT SIMULATION (STATELESS / OFFLINE-FIRST)
  // [UPDATED] Added sessionId support for Quota & Idempotency
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
      responseType: 'arraybuffer'
    });
  },

  // [UPDATED] Checkup Simulation using new Adapter Logic
  simulateAgentCheckup: async (data: FinancialFormState & { sessionId: string }): Promise<CheckupSimulationResponse> => {
    const apiPayload = toMonthlyPayload(data);
    const response = await api.post<CheckupSimulationResponse>("/financial/simulation/checkup", apiPayload);
    return response.data;
  },

  /**
   * [SCENARIO B] simulateAgentEducation
   * ----------------------------------------
   * 1. Request Kalkulasi (JSON)
   * Mengirim payload ke Backend untuk dihitung dan LOG disimpan ke DB.
   * Return: JSON berisi Data Angka + ID Simulasi (bukan file PDF).
   */
  simulateAgentEducation: async (data: EducationSimulationPayload & { sessionId: string }): Promise<EducationSimulationResponse> => {
    const response = await api.post<EducationSimulationResponse>("/financial/simulation/education/calculate", data);
    return response.data;
  },

  /**
   * [SCENARIO B] downloadEducationSimulationPdf
   * ----------------------------------------
   * 2. Request Download (On-Demand)
   * Menggunakan ID Simulasi dari langkah 1 untuk men-stream file PDF.
   */
  downloadEducationSimulationPdf: async (simulationId: string, clientName: string = "Klien") => {
    const response = await api.get(`/financial/simulation/education/${simulationId}/pdf`, {
      responseType: 'blob',
      timeout: 60000,
    });

    // Proses pembuatan Link Download dari Blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Deteksi nama file dari Header (opsional), fallback ke formatter terstandar
    const contentDisposition = response.headers['content-disposition'];
    let filename = generateSimulationFilename("Education Plan", clientName, "pdf");

    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (fileNameMatch && fileNameMatch.length === 2) {
        // Jika server memaksa header nama file, bisa override atau dikomentari jika ingin FE mendikte nama.
        // filename = fileNameMatch[1]; 
      }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
   * Helper untuk mendownload .mgc Token (JSON -> File)
   * Digunakan jika kita ingin user bisa save session tanpa download PDF.
   */
  downloadSimulationFiles: (simulationResult: any, clientName: string = "Klien") => {
    const { mgcToken, filename } = simulationResult;

    // Jika filename dari parameter exist, kita gunakan base name-nya, jika tidak pakai formatter
    const fallbackFilename = generateSimulationFilename("Simulation", clientName, "mgc");
    const baseFilename = filename || fallbackFilename;

    if (mgcToken) {
      try {
        const tokenBlob = new Blob([mgcToken], { type: 'text/plain' });
        const tokenUrl = window.URL.createObjectURL(tokenBlob);
        const link = document.createElement('a');
        link.href = tokenUrl;

        // Memastikan ekstensinya adalah .mgc
        const tokenName = baseFilename.endsWith('.mgc') ? baseFilename : baseFilename.replace(/\.pdf$/i, '') + '.mgc';
        link.download = tokenName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(tokenUrl);
      } catch (e) {
        console.error("Gagal memproses token simulasi (.mgc):", e);
      }
    }
  }
};