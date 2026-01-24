import api from "@/lib/axios";
import { AxiosRequestConfig } from "axios";
import { 
  DirectorDashboardStats, 
  RiskyEmployeeDetail, 
  UnitHealthRanking,
  User,
  EmployeeAuditDetail,
  DashboardSummaryDto // Pastikan interface ini sudah ada di @/lib/types sesuai Phase 5 Backend
} from "@/lib/types";

// =============================================================================
// HELPER: SERVER-SIDE TOKEN INJECTION
// =============================================================================
// Fungsi ini menentukan apakah request menggunakan token dari parameter (SSR)
// atau mengandalkan interceptor bawaan axios (CSR/LocalStorage).
const getConfig = (token?: string): AxiosRequestConfig => {
  if (token) {
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  }
  return {}; // Biarkan interceptor axios menangani token dari localStorage/cookie browser
};

export const directorService = {
  
  // ===========================================================================
  // 0. ORCHESTRATOR (PHASE 5 - SINGLE ENTRY POINT)
  // ===========================================================================
  // Mengambil seluruh data dashboard dalam satu request.
  // Sangat disarankan untuk Initial Load (SSR).
  getDashboardSummary: async (token?: string) => {
    const response = await api.get<DashboardSummaryDto>(
      "/director/dashboard/summary", 
      getConfig(token)
    );
    return response.data;
  },

  // ===========================================================================
  // 1. DASHBOARD STATS (Agregat Data)
  // ===========================================================================
  // Mengambil ringkasan eksekutif secara terpisah (jika perlu refresh parsial)
  getDashboardStats: async (token?: string) => {
    const response = await api.get<DirectorDashboardStats>(
      "/director/dashboard-stats", 
      getConfig(token)
    );
    return response.data;
  },

  // ===========================================================================
  // 2. RISK MONITOR (Red Alert)
  // ===========================================================================
  // Mengambil daftar karyawan dengan status BAHAYA atau WASPADA
  getRiskMonitor: async (token?: string) => {
    const response = await api.get<RiskyEmployeeDetail[]>(
      "/director/risk-monitor", 
      getConfig(token)
    );
    return response.data;
  },

  // ===========================================================================
  // 3. UNIT RANKING (Performa Divisi)
  // ===========================================================================
  // Mengambil data peringkat kesehatan finansial per unit kerja
  getUnitRankings: async (token?: string) => {
    const response = await api.get<UnitHealthRanking[]>(
      "/director/unit-rankings", 
      getConfig(token)
    );
    return response.data;
  },

  // ===========================================================================
  // 4. GLOBAL SEARCH (Investigasi)
  // ===========================================================================
  // Mencari karyawan (Biasanya CSR, tapi disiapkan untuk SSR search result page)
  searchEmployees: async (keyword: string, token?: string) => {
    const config = getConfig(token);
    
    // Merge params dengan config headers
    const response = await api.get<User[]>("/director/search", {
      ...config,
      params: { q: keyword }
    });
    return response.data;
  },

  // ===========================================================================
  // 5. EMPLOYEE AUDIT DETAIL (Deep Dive)
  // ===========================================================================
  // Mengambil data audit lengkap. Wajib SSR untuk memastikan Audit Log tercatat 
  // tepat 1x saat halaman di-request.
  // Endpoint disesuaikan dengan Controller Backend Phase 3 (/checkup)
  getEmployeeAuditDetail: async (id: string, token?: string) => {
    const response = await api.get<EmployeeAuditDetail>(
      `/director/employees/${id}/checkup`, 
      getConfig(token)
    );
    return response.data;
  }
};