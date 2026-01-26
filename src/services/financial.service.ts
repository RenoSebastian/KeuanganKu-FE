import api from "@/lib/axios";
import { 
  FinancialRecord, 
  HealthAnalysisResult,
  PensionPayload,
  InsurancePayload,
  GoalPayload,
  EducationPayload,
  EducationPlanResponse,
  GoalSimulationInput,
  GoalSimulationResult
} from "@/lib/types";

export const financialService = {
  // ===========================================================================
  // 1. FINANCIAL CHECKUP
  // ===========================================================================
  
  createCheckup: async (data: FinancialRecord) => {
    // Explicit return type <HealthAnalysisResult> agar dikenali UI
    const response = await api.post<HealthAnalysisResult>("/financial/checkup", data);
    return response.data;
  },

  getLatestCheckup: async () => {
    // Mengambil data checkup terakhir user
    const response = await api.get("/financial/checkup/latest");
    return response.data; 
  },

  getCheckupHistory: async () => {
    // Mengambil history lengkap
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

  // D. Pendidikan Anak (LENGKAP: CRUD & FIX DATA TYPE)
  
  saveEducationPlan: async (data: EducationPayload) => {
    const response = await api.post<EducationPlanResponse>("/financial/calculator/education", data);
    return response.data;
  },

  // --- [FIXED] DATA TRANSFORMATION LAYER ---
  // Menangani data string dari BE dan mengubahnya menjadi number agar UI tidak error.
  // UPDATE: Logic ini juga menjamin nilai '0' (untuk S2 Lumpsum) tetap terbaca sebagai angka 0, bukan null/NaN.
  getEducationPlans: async () => {
    const response = await api.get("/financial/calculator/education");
    
    const cleanData = response.data.map((plan: any) => ({
      ...plan,
      plan: {
        ...plan.plan,
        // Paksa ubah string ke number
        inflationRate: Number(plan.plan.inflationRate || 0),
        returnRate: Number(plan.plan.returnRate || 0),
      },
      calculation: {
        ...plan.calculation,
        // Paksa ubah string ke number
        totalFutureCost: Number(plan.calculation.totalFutureCost || 0),
        monthlySaving: Number(plan.calculation.monthlySaving || 0),
        
        // Mapping array breakdown secara mendalam
        stagesBreakdown: plan.calculation.stagesBreakdown.map((stage: any) => ({
          ...stage,
          currentCost: Number(stage.currentCost || 0),
          futureCost: Number(stage.futureCost || 0),
          monthlySaving: Number(stage.monthlySaving || 0),
          yearsToStart: Number(stage.yearsToStart || 0)
        }))
      }
    }));

    return cleanData as EducationPlanResponse[];
  },

  deleteEducationPlan: async (id: string) => {
    const response = await api.delete(`/financial/calculator/education/${id}`);
    return response.data;
  },

  // ===========================================================================
  // 4. MARKET DATA (INTEGRASI HARGA EMAS BE)
  // ===========================================================================

  /**
   * Mengambil harga emas terbaru per gram (IDR) dari Backend
   * Digunakan sebagai referensi di Financial Checkup (Aset Logam Mulia)
   */
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
  }
};