import api from "@/lib/axios";
import { 
  DirectorDashboardStats, 
  RiskyEmployeeDetail, 
  UnitHealthRanking,
  User,
  EmployeeAuditDetail // [NEW] Import tipe data gabungan dari Tahap 1
} from "@/lib/types";

export const directorService = {
  // ===========================================================================
  // 1. DASHBOARD STATS (Agregat Data)
  // ===========================================================================
  // Mengambil ringkasan eksekutif: Total Aset, Rata-rata Skor, & Counter Risiko
  getDashboardStats: async () => {
    const response = await api.get<DirectorDashboardStats>("/director/dashboard-stats");
    return response.data;
  },

  // ===========================================================================
  // 2. RISK MONITOR (Red Alert)
  // ===========================================================================
  // Mengambil daftar karyawan dengan status BAHAYA atau WASPADA
  getRiskMonitor: async () => {
    const response = await api.get<RiskyEmployeeDetail[]>("/director/risk-monitor");
    return response.data;
  },

  // ===========================================================================
  // 3. UNIT RANKING (Performa Divisi)
  // ===========================================================================
  // Mengambil data peringkat kesehatan finansial per unit kerja
  getUnitRankings: async () => {
    const response = await api.get<UnitHealthRanking[]>("/director/unit-rankings");
    return response.data;
  },

  // ===========================================================================
  // 4. GLOBAL SEARCH (Investigasi)
  // ===========================================================================
  // Mencari karyawan spesifik berdasarkan Nama, Email, atau Unit Kerja
  searchEmployees: async (keyword: string) => {
    const response = await api.get<User[]>("/director/search", {
      params: { q: keyword }
    });
    return response.data;
  },

  // ===========================================================================
  // 5. EMPLOYEE AUDIT DETAIL (Deep Dive) - [NEW]
  // ===========================================================================
  // Mengambil data lengkap (Profil + Record Mentah + Hasil Analisa)
  // Endpoint ini sesuai dengan yang kita buat di DirectorController Backend
  getEmployeeDetail: async (id: string) => {
    const response = await api.get<EmployeeAuditDetail>(`/director/employees/${id}/audit-data`);
    return response.data;
  }
};