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

// [NEW] Import Adapter Types & Logic
import {
  FinancialFormState,
  CheckupSimulationResponse
} from "@/lib/types/financial-checkup";
import {
  convertRecordToMonthly,
  convertRecordToAnnual
} from "@/lib/financial-math";

export const financialService = {
  // ===========================================================================
  // 1. FINANCIAL CHECKUP (EXISTING / PERSONAL - DB SAVED)
  // ===========================================================================

  createCheckup: async (data: FinancialRecord) => {
    // Explicit return type <HealthAnalysisResult> agar dikenali UI
    const response = await api.post<HealthAnalysisResult>("/financial/checkup", data);
    return response.data;
  },

  getLatestCheckup: async () => {
    // [UPDATED] Menggunakan Intersection Type untuk return value
    // Backend mengembalikan object gabungan: Data Mentah (FinancialRecord) + Hasil Analisa (HealthAnalysisResult)
    const response = await api.get<FinancialRecord & HealthAnalysisResult>("/financial/checkup/latest");
    return response.data;
  },

  getCheckupHistory: async () => {
    // Mengambil history lengkap (List Only)
    const response = await api.get<FinancialRecordHistory[]>("/financial/checkup/history");
    return response.data;
  },

  // Method untuk mengambil Detail Analisa per Item History
  getCheckupDetail: async (id: string) => {
    const response = await api.get(`/financial/checkup/detail/${id}`);
    return response.data;
  },

  downloadCheckupPdf: async (checkupId: string) => {
    // Request dengan responseType 'blob' sangat PENTING untuk file binary
    const response = await api.get(`/financial/checkup/pdf/${checkupId}`, {
      responseType: 'blob',
      timeout: 60000,
    });

    // Helper untuk trigger download di browser
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

  // [NEW] Download Budget PDF
  downloadBudgetPdf: async (budgetId: string) => {
    const response = await api.get(`/financial/budget/pdf/${budgetId}`, {
      responseType: 'blob',
      timeout: 60000,
    });

    // Logic download file di browser
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Budget-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // ===========================================================================
  // 3. NEW CALCULATORS (INTEGRASI BARU)
  // ===========================================================================

  // A. Pensiun
  calculatePension: async (data: CreatePensionDto) => {
    const response = await api.post<{ plan: PensionPlanData, calculation: any }>("/financial/calculator/pension", data);
    return response.data;
  },

  // [NEW] Download Pension PDF
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

    // [LOGICAL FIX] Data Transformation Layer
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

  // [NEW] Download Insurance PDF
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

  // C. Goals (Tujuan Keuangan)
  calculateGoal: async (data: CreateGoalDto) => {
    const response = await api.post<{ plan: GoalPlanData, calculation: any }>("/financial/calculator/goals", data);
    return response.data;
  },

  // [FIXED] SIMULATOR GOAL
  simulateGoal: async (data: SimulateGoalDto) => {
    // Kita definisikan tipe return axios sebagai Wrapper Object
    const response = await api.post<{ status: string, data: GoalSimulationResult }>("/financial/goals/simulate", data);
    // Kita unwrap data disini agar UI langsung terima result bersih
    return response.data.data;
  },

  // [NEW] Download Goal PDF
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

  // D. Pendidikan Anak (LENGKAP: CRUD & FIX DATA TYPE)

  calculateEducation: async (data: CreateEducationPlanDto) => {
    const response = await api.post<{ plan: EducationPlanData, calculation: any }>("/financial/calculator/education", data);
    return response.data;
  },

  // --- [FIXED] DATA TRANSFORMATION LAYER ---
  // Menangani data string dari BE dan mengubahnya menjadi number agar UI tidak error.
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
  // 4. MARKET DATA (INTEGRASI HARGA EMAS BE)
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

  // [NEW] Download History PDF
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

  /**
   * simulateAgentBudget
   * Melakukan request simulasi dengan respons tipe BLOB (File PDF).
   */
  simulateAgentBudget: async (data: CreateBudgetSimulationDto): Promise<AxiosResponse<Blob>> => {
    return await api.post("/financial/simulation/budget", data, {
      responseType: 'blob'
    });
  },

  /**
   * simulateAgentInsurance
   * [NEW] Simulasi Asuransi Stateless
   */
  simulateAgentInsurance: async (data: CreateInsuranceSimulationDto): Promise<AxiosResponse<Blob>> => {
    return await api.post("/financial/simulation/insurance", data, {
      responseType: 'blob'
    });
  },

  /**
   * simulateAgentPension
   * [NEW] Simulasi Dana Pensiun Stateless
   */
  simulateAgentPension: async (data: CreatePensionSimulationDto): Promise<AxiosResponse<Blob>> => {
    return await api.post("/financial/simulation/pension", data, {
      responseType: 'blob'
    });
  },

  /**
   * simulateAgentGoal
   * [NEW] Simulasi Tujuan Keuangan Stateless
   */
  simulateAgentGoal: async (data: CreateGoalSimulationDto): Promise<AxiosResponse<Blob>> => {
    return await api.post("/financial/simulation/goals", data, {
      responseType: 'blob'
    });
  },

  /**
   * simulateAgentCheckup (ADAPTER PATTERN IMPLEMENTATION)
   * -----------------------------------------------------
   * Fungsi ini bertindak sebagai ADAPTER yang mengubah data "Tahunan" (UI)
   * menjadi data "Bulanan" (API) sebelum dikirim.
   *
   * @param data FinancialFormState (Annual Values from Form)
   * @returns CheckupSimulationResponse (Data Result + PDF Buffer)
   */
  simulateAgentCheckup: async (data: FinancialFormState): Promise<CheckupSimulationResponse> => {
    // 1. TRANSFORMER: Convert Annual State -> Monthly API Payload
    // Kita spread `...data` untuk mempertahankan field non-financial (seperti client info)
    // dan menimpa field financial dengan nilai bulanan.
    const apiPayload = convertRecordToMonthly(data);

    // 2. REQUEST: Kirim data yang sudah dinormalisasi ke Backend
    // Backend akan memproses angka bulanan ini untuk skor & rasio.
    const response = await api.post<CheckupSimulationResponse>("/financial/simulation/checkup", apiPayload);

    return response.data;
  },

  /**
   * decodeSimulationToken (RE-HYDRATION STRATEGY)
   * ---------------------------------------------
   * Fungsi ini memecahkan token import dan melakukan RE-HYDRATION
   * data agar kembali menjadi format Tahunan untuk ditampilkan di UI.
   *
   * @param token Encrypted string from .mgc file
   * @returns Transformed Object (Annual Values)
   */
  decodeSimulationToken: async (token: string) => {
    const response = await api.post("/financial/simulation/decode", { simulationToken: token });
    const rawData = response.data;

    // CHECK: Apakah data yang di-import adalah Financial Checkup?
    // Struktur Checkup biasanya memiliki properti 'financial' yang berisi record angka.
    if (rawData && rawData.financial) {
      // TRANSFORMER: Convert Monthly API Data -> Annual UI State
      // Ini mencegah user melihat angka yang "mengecil" (dibagi 12) saat import ulang.
      rawData.financial = convertRecordToAnnual(rawData.financial);
    }

    return rawData;
  }
};