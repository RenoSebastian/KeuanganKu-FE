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
  CreateEducationPlanDto,
  EducationPlanData,
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

// [UPDATED] Import Response Type baru
import {
  EducationSimulationPayload,
  EducationSimulationResponse
} from "@/lib/types/education";

// ============================================================================
// PRIVATE ADAPTER HELPERS (Internal Service Logic)
// ============================================================================

/**
 * Mengonversi Annual State (UI) -> Monthly Payload (API)
 * Memisahkan data finansial dari data klien, mengonversi angka, lalu menggabungkan kembali.
 */
function toMonthlyPayload(data: FinancialAnnualState & { client?: any, spouse?: any }): any {
  // 1. Konversi Angka Finansial (Annual -> Monthly)
  const monthlyFinancial = convertRecordToMonthly(data);

  // 2. Pertahankan Data Non-Finansial (Client, Spouse, dll)
  // Kita ambil properti lain yang mungkin ada di object data
  const { client, spouse, ...rest } = data as any;

  // 3. Gabungkan kembali (Flat Object untuk dikirim ke Backend)
  // Backend menerima object flat yang berisi field finansial + field client
  return {
    ...monthlyFinancial,
    client,
    spouse
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

  downloadCheckupPdf: async (checkupId: string) => {
    const response = await api.get(`/financial/checkup/pdf/${checkupId}`, {
      responseType: 'blob',
      timeout: 60000,
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    const filename = `Financial-Report-${new Date().toISOString().split('T')[0]}.pdf`;
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

  downloadBudgetPdf: async (budgetId: string) => {
    const response = await api.get(`/financial/budget/pdf/${budgetId}`, {
      responseType: 'blob',
      timeout: 60000,
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Budget-Report-${new Date().toISOString().split('T')[0]}.pdf`);
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

  downloadPensionPdf: async (planId: string) => {
    const response = await api.get(`/financial/pension/pdf/${planId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Pension-Plan-${new Date().toISOString().split('T')[0]}.pdf`);
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

  downloadInsurancePdf: async (planId: string) => {
    const response = await api.get(`/financial/insurance/pdf/${planId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Insurance-Plan-${new Date().toISOString().split('T')[0]}.pdf`);
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

  downloadGoalPdf: async (planId: string) => {
    const response = await api.get(`/financial/goals/pdf/${planId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Goal-Plan-${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // D. Pendidikan Anak
  calculateEducation: async (data: CreateEducationPlanDto) => {
    const response = await api.post<{ plan: EducationPlanData, calculation: any }>("/financial/calculator/education", data);
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

  downloadEducationPdf: async () => {
    const response = await api.get(`/financial/education/pdf`, {
      responseType: 'blob',
      timeout: 60000,
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Education-Family-Plan-${new Date().toISOString().split('T')[0]}.pdf`);
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

  downloadHistoryPdf: async (historyId: string) => {
    const response = await api.get(`/financial/checkup/history/pdf/${historyId}`, {
      responseType: 'blob',
      timeout: 60000,
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Checkup-History-${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // ===========================================================================
  // 8. AGENT SIMULATION (STATELESS / OFFLINE-FIRST)
  // ===========================================================================

  simulateAgentBudget: async (data: CreateBudgetSimulationDto): Promise<AxiosResponse<Blob>> => {
    return await api.post("/financial/simulation/budget", data, {
      responseType: 'blob'
    });
  },

  simulateAgentInsurance: async (data: CreateInsuranceSimulationDto): Promise<AxiosResponse<Blob>> => {
    return await api.post("/financial/simulation/insurance", data, {
      responseType: 'blob'
    });
  },

  simulateAgentPension: async (data: CreatePensionSimulationDto): Promise<AxiosResponse<Blob>> => {
    return await api.post("/financial/simulation/pension", data, {
      responseType: 'blob'
    });
  },

  simulateAgentGoal: async (data: CreateGoalSimulationDto): Promise<AxiosResponse<Blob>> => {
    return await api.post("/financial/simulation/goals", data, {
      responseType: 'blob'
    });
  },

  // [NEW] Risk Profile Simulation (Fix PDF Download)
  simulateAgentRiskProfile: async (data: CreateRiskProfileSimulationDto): Promise<AxiosResponse<Blob>> => {
    return await api.post("/financial/risk-profile/simulation", data, {
      // PENTING: responseType 'arraybuffer' atau 'blob' agar Axios tidak menganggap ini teks/JSON
      // dan merusak binary data PDF.
      responseType: 'arraybuffer'
    });
  },

  /**
   * simulateAgentCheckup (ADAPTER PATTERN IMPLEMENTATION)
   * -----------------------------------------------------
   * Menerima Data TAHUNAN dari UI, mengonversi ke BULANAN untuk API.
   * Mencegah 'Double Division' bug.
   */
  simulateAgentCheckup: async (data: FinancialFormState): Promise<CheckupSimulationResponse> => {
    // 1. TRANSFORMER: Convert Annual State -> Monthly API Payload
    // Gunakan helper private yang sudah aman
    const apiPayload = toMonthlyPayload(data);

    // 2. REQUEST: Kirim data BULANAN ke Backend
    const response = await api.post<CheckupSimulationResponse>("/financial/simulation/checkup", apiPayload);

    return response.data;
  },

  /**
   * [UPDATED PHASE 1] simulateAgentEducation
   * ----------------------------------------
   * Mengirim payload ke Backend dan menerima JSON Object
   * yang berisi Data Visualisasi + PDF Buffer + Token.
   */
  simulateAgentEducation: async (data: EducationSimulationPayload): Promise<EducationSimulationResponse> => {
    const response = await api.post<EducationSimulationResponse>("/financial/simulation/education", data, {
      // HAPUS responseType: 'blob' agar axios memproses JSON response
      timeout: 60000,
    });
    return response.data;
  },

  /**
   * decodeSimulationToken (AGGRESSIVE UNWRAPPING STRATEGY)
   * ------------------------------------------------------
   * Membuka paksa nesting data dan mengonversi BULANAN -> TAHUNAN.
   * Mencegah 'Shrinking Number' bug saat import.
   */
  decodeSimulationToken: async (token: string) => {
    const response = await api.post("/financial/simulation/decode", { simulationToken: token });

    // 1. AGGRESSIVE UNWRAPPING (Mencari payload asli)
    // Kadang response.data masih membungkus 'data' lagi (e.g., { status: 'ok', data: { ... } })
    // Kita cari root object yang memiliki properti 'financial'
    let rawData = response.data;

    if (rawData && rawData.data && !rawData.financial) {
      // Jika 'financial' tidak ada di root, tapi ada di dalam 'data', kita masuk ke dalam.
      rawData = rawData.data;
    }

    // 2. ADAPTER: Convert Monthly API Data -> Annual UI State
    // Jika ditemukan data finansial, PAKSA konversi ke Annual (x12)
    if (rawData && rawData.financial) {
      rawData.financial = toAnnualState(rawData.financial);
    }

    // Hasilnya adalah object { client, financial (Annual), result } yang aman untuk UI
    return rawData;
  },

  /**
   * [NEW FIX] Helper untuk download hasil simulasi dari JSON Response.
   * Digunakan di Component Result untuk menangani 'Hybrid JSON Response' dari Backend.
   */
  downloadSimulationFiles: (simulationResult: any) => {
    // 1. Validasi Data
    if (!simulationResult) {
      console.warn("Data simulasi kosong, download dibatalkan.");
      return;
    }

    const { pdfBuffer, mgcToken, filename } = simulationResult;
    const baseFilename = filename || `Financial_Checkup_${new Date().toISOString().split('T')[0]}`;

    // 2. PROSES DOWNLOAD PDF (Re-hydrating Buffer -> Blob)
    if (pdfBuffer && pdfBuffer.data) {
      try {
        // Konversi Array Angka (dari JSON) menjadi Uint8Array (Binary)
        const byteArray = new Uint8Array(pdfBuffer.data);
        const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });

        // Buat Object URL
        const pdfUrl = window.URL.createObjectURL(pdfBlob);

        // Trigger Download
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = baseFilename.endsWith('.pdf') ? baseFilename : `${baseFilename}.pdf`;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(pdfUrl);
      } catch (e) {
        console.error("Gagal memproses file PDF dari simulasi:", e);
      }
    }

    // 3. PROSES DOWNLOAD TOKEN (.mgc)
    if (mgcToken) {
      try {
        const tokenBlob = new Blob([mgcToken], { type: 'text/plain' });
        const tokenUrl = window.URL.createObjectURL(tokenBlob);

        const link = document.createElement('a');
        link.href = tokenUrl;

        // Gunakan nama file yang sama tapi ekstensi .mgc
        // Regex: hapus .pdf di akhir string (case insensitive) jika ada
        const tokenName = baseFilename.replace(/\.pdf$/i, '') + '.mgc';
        link.download = tokenName;

        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(tokenUrl);
      } catch (e) {
        console.error("Gagal memproses token simulasi (.mgc):", e);
      }
    }
  }
};