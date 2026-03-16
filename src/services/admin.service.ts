import api from '@/lib/axios';
import {
    DashboardMetricsResponse,
    CashflowLedgerResponse,
    AnalyticsResolution, // [NEW] Import dari DTO
    TimeSeriesDataPoint  // [NEW] Import dari DTO
} from '@/lib/types/dashboard';

// Tipe Data User sesuai response Backend terbaru
export interface User {
    dateOfBirth: any;
    id: string;
    nip: string;
    fullName: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'DIRECTOR';
    unitKerja?: {
        id: string;
        namaUnit: string;
    };
    jobTitle?: string;
    createdAt: string;
}

export interface CreateUserPayload {
    fullName: string;
    email: string;
    nip: string;
    password: string;
    role: 'USER' | 'ADMIN' | 'DIRECTOR';
    agencyId: string;

    jobTitle?: string;
    dateOfBirth?: string;
    dependentCount?: number;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> { }

export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
}

export interface AdminUsersResponse {
    data: User[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface UserDetailResponse extends User { }

// [PHASE 3 ENHANCEMENT] Kontrak API untuk System Logs (Cursor Paginated)
export interface SystemLog {
    id: string;
    actionType: string;
    entityName: string;
    entityId?: string;
    changes: any; // JSON Value
    ipAddress?: string;
    createdAt: string;
    admin: {
        id: string;
        fullName: string;
        email: string;
    };
}

export interface SystemLogResponse {
    data: SystemLog[];
    meta: {
        nextCursor?: string;
        hasMore: boolean;
        limit: number;
    };
}

export const adminService = {
    // ========================================================================
    // ANALYTICS & DASHBOARD METHODS (Phase 1)
    // ========================================================================

    getDashboardMetrics: async () => {
        const response = await api.get<DashboardMetricsResponse>('/admin/dashboard/metrics');
        return response.data;
    },

    getCashflowLedger: async (page: number = 1, limit: number = 10) => {
        const response = await api.get<CashflowLedgerResponse>('/admin/dashboard/cashflow', {
            params: { page, limit }
        });
        return response.data;
    },

    // [NEW] Fitur Unduh PDF (Task 1) - Menggunakan tipe kembalian Blob
    downloadCashflowReport: async (period: string = 'Keseluruhan'): Promise<Blob> => {
        const response = await api.get('/admin/dashboard/cashflow/export', {
            params: { period },
            responseType: 'blob' // SANGAT PENTING: Mencegah korupsi binary PDF
        });
        return response.data;
    },

    // [NEW] Analitik Kinerja / Akuisisi Pengguna (Task 4)
    getGrowthAnalytics: async (startDate: string, endDate: string, resolution: AnalyticsResolution) => {
        const response = await api.get<TimeSeriesDataPoint[]>('/admin/dashboard/analytics/growth', {
            params: { startDate, endDate, resolution }
        });
        return response.data;
    },

    // [NEW] Analitik Keterlibatan / Login Pengguna (Task 4)
    getEngagementAnalytics: async (startDate: string, endDate: string, resolution: AnalyticsResolution) => {
        const response = await api.get<TimeSeriesDataPoint[]>('/admin/dashboard/analytics/engagement', {
            params: { startDate, endDate, resolution }
        });
        return response.data;
    },

    // ========================================================================
    // USER MANAGEMENT METHODS
    // ========================================================================

    getUsers: async (params?: PaginationParams) => {
        const response = await api.get<AdminUsersResponse>('/admin/users', { params });
        return response.data;
    },

    getUserById: async (id: string) => {
        const response = await api.get<UserDetailResponse>(`/admin/users/${id}`);
        return response.data;
    },

    createUser: async (payload: CreateUserPayload) => {
        const response = await api.post<User>('/admin/users', payload);
        return response.data;
    },

    updateUser: async (id: string, payload: UpdateUserPayload) => {
        const response = await api.patch<User>(`/admin/users/${id}`, payload);
        return response.data;
    },

    deleteUser: async (id: string) => {
        const response = await api.delete<{ message: string; id: string }>(`/admin/users/${id}`);
        return response.data;
    },

    // ========================================================================
    // SYSTEM AUDIT LOGS (Phase 3)
    // ========================================================================

    getSystemLogs: async (params?: { cursor?: string; take?: number; action?: string }) => {
        const response = await api.get<SystemLogResponse>('/admin/audit/logs', { params });
        return response.data;
    }
};