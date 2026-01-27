import api from "@/lib/axios";
import { AxiosRequestConfig } from "axios";
import { 
  DirectorDashboardStats, 
  RiskyEmployeeDetail, 
  UnitHealthRanking,
  User,
  EmployeeAuditDetail,
  DashboardSummaryDto,
  SearchResult, // Pastikan Type ini sudah ada di @/lib/types (Phase 5)
} from "@/lib/types";

// =============================================================================
// HELPER: SERVER-SIDE TOKEN INJECTION
// =============================================================================
const getConfig = (token?: string): AxiosRequestConfig => {
  if (token) {
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  }
  return {}; 
};

export const directorService = {
  
  // ===========================================================================
  // 0. ORCHESTRATOR (PHASE 5 - SINGLE ENTRY POINT)
  // ===========================================================================
  getDashboardSummary: async (token?: string) => {
    try {
      const response = await api.get<DashboardSummaryDto>(
        "/director/dashboard/summary", 
        getConfig(token)
      );

      // [DEFENSIVE PROGRAMMING]
      // Hotfix untuk mencegah TypeError di Frontend jika Backend mengirim data null/undefined
      // Kita lakukan sanitasi data di level Service sebelum dikonsumsi Component.
      if (response.data && response.data.topRiskyEmployees) {
        response.data.topRiskyEmployees = response.data.topRiskyEmployees.map(emp => ({
          ...emp,
          // Fallback: Jika fullName kosong, cari property lain atau pakai placeholder
          fullName: emp.fullName || (emp as any).name || 'Nama Tidak Tersedia',
          unitName: emp.unitName || (emp as any).unit_name || '-'
        }));
      }

      return response.data;
    } catch (error) {
      console.error("[DirectorService] Failed to fetch dashboard summary:", error);
      throw error; // Re-throw agar bisa ditangani Error Boundary
    }
  },

  // ===========================================================================
  // 1. DASHBOARD STATS (Agregat Data)
  // ===========================================================================
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
  getUnitRankings: async (token?: string) => {
    const response = await api.get<UnitHealthRanking[]>(
      "/director/unit-rankings", 
      getConfig(token)
    );
    return response.data;
  },

  // ===========================================================================
  // 4. GLOBAL SEARCH (HYBRID SEARCH INTEGRATION)
  // ===========================================================================
  // Updated: Menggunakan endpoint /search/employees yang mendukung Meilisearch + Trigram
  searchEmployees: async (keyword: string, token?: string) => {
    const config = getConfig(token);
    
    // Backend Response Structure: { success: true, data: [...], meta: {...} }
    // Kita perlu mengambil array hasil pencarian yang ada di dalam properti 'data'
    const response = await api.get<{ data: SearchResult[] }>("/search/employees", {
      ...config,
      params: { 
        q: keyword,
        limit: 5 // Limit UI dropdown
      }
    });
    
    return response.data.data; // Return array of SearchResult
  },

  // ===========================================================================
  // 5. EMPLOYEE AUDIT DETAIL (Deep Dive)
  // ===========================================================================
  getEmployeeAuditDetail: async (id: string, token?: string) => {
    const response = await api.get<EmployeeAuditDetail>(
      `/director/employees/${id}/checkup`, 
      getConfig(token)
    );
    return response.data;
  }
};