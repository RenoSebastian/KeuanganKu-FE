import api from "@/lib/axios";
import { 
  FinancialRecord, 
  HealthAnalysisResult,
  PensionPayload,
  InsurancePayload,
  GoalPayload,
  EducationPayload,
  EducationPlanResponse // Added: Import tipe response agar autocomplete jalan di UI
} from "@/lib/types";

export const financialService = {
  // ===========================================================================
  // 1. FINANCIAL CHECKUP
  // ===========================================================================
  
  createCheckup: async (data: FinancialRecord) => {
    const response = await api.post<HealthAnalysisResult>("/financial/checkup", data);
    return response.data;
  },

  getLatestCheckup: async () => {
    const response = await api.get("/financial/checkup/latest");
    return response.data; 
  },

  getCheckupHistory: async () => {
    const response = await api.get("/financial/checkup/history");
    return response.data;
  },

  // ===========================================================================
  // 2. BUDGETING
  // ===========================================================================
  
  createBudget: async (data: any) => {
    const response = await api.post("/financial/budget", data);
    return response.data;
  },

  getBudgets: async () => {
    const response = await api.get("/financial/budget/history");
    return response.data;
  },

  // ===========================================================================
  // 3. NEW CALCULATORS (INTEGRASI BARU)
  // ===========================================================================

  // A. Pensiun
  savePensionPlan: async (data: PensionPayload) => {
    const response = await api.post("/financial/calculator/pension", data);
    return response.data;
  },

  // B. Asuransi
  saveInsurancePlan: async (data: InsurancePayload) => {
    const response = await api.post("/financial/calculator/insurance", data);
    return response.data;
  },

  // C. Goals (Tujuan Keuangan)
  saveGoalPlan: async (data: GoalPayload) => {
    const response = await api.post("/financial/calculator/goals", data);
    return response.data;
  },

  // D. Pendidikan Anak (UPDATED)
  // Payload 'data' sekarang sudah berisi array 'stages' lengkap dari ChildWizard.
  // Response akan berisi 'calculation.stagesBreakdown' untuk drill-down.
  saveEducationPlan: async (data: EducationPayload) => {
    const response = await api.post<EducationPlanResponse>("/financial/calculator/education", data);
    return response.data;
  }
};