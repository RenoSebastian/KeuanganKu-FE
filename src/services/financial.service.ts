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
    // [UPDATED] Menggunakan Intersection Type untuk return value
    // Backend mengembalikan object gabungan: Data Mentah (FinancialRecord) + Hasil Analisa (HealthAnalysisResult)
    // Data ini krusial untuk fitur "Persistence/Hydration" agar form bisa terisi otomatis.
    const response = await api.get<FinancialRecord & HealthAnalysisResult>("/financial/checkup/latest");
    return response.data;
  },

  getCheckupHistory: async () => {
    // Mengambil history lengkap (List Only)
    const response = await api.get("/financial/checkup/history");
    return response.data;
  },

  // Method untuk mengambil Detail Analisa per Item History
  getCheckupDetail: async (id: string) => {
    const response = await api.get(`/financial/checkup/detail/${id}`);
    return response.data;
  },

  downloadCheckupPdf: async (checkupId: string) => {
    // Request dengan responseType 'blob' sangat PENTING untuk file binary
    // Timeout diperpanjang ke 60s karena Puppeteer BE butuh waktu render
    const response = await api.get(`/financial/checkup/pdf/${checkupId}`, {
      responseType: 'blob',
      timeout: 60000,
    });

    // Helper untuk trigger download di browser
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Financial-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
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

  // [NEW] Download Budget PDF
  downloadBudgetPdf: async (budgetId: string) => {
    // Gunakan timeout panjang (60s) karena Puppeteer rendering itu berat
    const response = await api.get(`/financial/budget/pdf/${budgetId}`, {
      responseType: 'blob',
      timeout: 60000,
    });

    // Logic download file di browser
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    // Format nama file: Budget-Report-YYYY-MM-DD.pdf
    link.setAttribute('download', `Budget-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // ===========================================================================
  // 3. NEW CALCULATORS (INTEGRASI BARU)
  // ===========================================================================

  // A. Pensiun
  savePensionPlan: async (data: PensionPayload) => {
    const response = await api.post("/financial/calculator/pension", data);
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
  saveInsurancePlan: async (data: InsurancePayload) => {
    const response = await api.post("/financial/calculator/insurance", data);
    return response.data;
  },

  // [NEW] Download Insurance PDF
  downloadInsurancePdf: async (planId: string) => {
    const response = await api.get(`/financial/insurance/pdf/${planId}`, {
      responseType: 'blob',
      timeout: 60000, // Tunggu Puppeteer render
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
  saveGoalPlan: async (data: GoalPayload) => {
    const response = await api.post("/financial/calculator/goals", data);
    return response.data;
  },

  // [FIXED] SIMULATOR GOAL
  // Backend returns: { status: 'success', data: { futureValue, monthlySaving } }
  simulateGoal: async (data: GoalSimulationInput) => {
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

  saveEducationPlan: async (data: EducationPayload) => {
    const response = await api.post<EducationPlanResponse>("/financial/calculator/education", data);
    return response.data;
  },

  // --- [FIXED] DATA TRANSFORMATION LAYER ---
  // Menangani data string dari BE dan mengubahnya menjadi number agar UI tidak error.
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