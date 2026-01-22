import api from "@/lib/axios";
import { 
  FinancialRecord, 
  HealthAnalysisResult,
  PensionPayload,
  InsurancePayload,
  GoalPayload,
  EducationPayload,
  EducationPlanResponse,
  GoalSimulationInput,   // [NEW] Tipe Input Simulasi
  GoalSimulationResult   // [NEW] Tipe Output Simulasi
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

  // [NEW] SIMULATOR GOAL (Sesuai Rumus PAM Jaya Menu 6)
  // Endpoint ini tidak menyimpan ke DB, hanya mengembalikan hasil hitungan
  simulateGoal: async (data: GoalSimulationInput) => {
    const response = await api.post<GoalSimulationResult>("/financial/calculator/goals/simulate", data);
    return response.data;
  },

  // D. Pendidikan Anak (LENGKAP: CRUD)
  
  saveEducationPlan: async (data: EducationPayload) => {
    const response = await api.post<EducationPlanResponse>("/financial/calculator/education", data);
    return response.data;
  },

  getEducationPlans: async () => {
    const response = await api.get<EducationPlanResponse[]>("/financial/calculator/education");
    return response.data;
  },

  deleteEducationPlan: async (id: string) => {
    const response = await api.delete(`/financial/calculator/education/${id}`);
    return response.data;
  }
};