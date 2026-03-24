import api from '@/lib/axios';
import {
    DashboardMetricsResponse,
    CashflowLedgerResponse,
    AnalyticsResolution,
    TimeSeriesDataPoint
} from '@/lib/types/dashboard';

// ============================================================================
// [REFACTORED] DATA CONTRACTS (SEJALAN DENGAN BACKEND SCHEMA)
// ============================================================================

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: 'USER' | 'ADMIN' | 'DIRECTOR';

    nip?: string;
    // [NEW] Fase 1: Penambahan phoneNumber untuk fitur penagihan WA
    phoneNumber?: string | null;

    // [CLEANUP] Mengganti unitKerja menjadi agency
    agencyId?: string | null;
    agency?: {
        id: string;
        code: string;
        name: string;
    } | null;

    dateOfBirth?: string | null;
    gender?: string | null;
    address?: string | null;
    agentLevel?: string | null;
    companyName?: string | null;
    goals?: string | null;
    dependentCount?: number;

    createdAt: string;
    updatedAt: string;

    // Relasi yang mungkin dikembalikan oleh GET /admin/users
    subscription?: {
        status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'GRACE_PERIOD';
        endDate: string;
        plan: {
            name: string;
        };
    } | null;
}

export interface CreateUserPayload {
    fullName: string;
    email: string;
    password: string;
    role: 'USER' | 'ADMIN' | 'DIRECTOR';

    nip?: string;
    // [NEW] Fase 1: Membuka gerbang agar Admin bisa input nomor HP saat Create User
    phoneNumber?: string;

    agencyId?: string;
    companyName?: string;
    agentLevel?: string;
    goals?: string;
    address?: string;
    gender?: string;
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
        lastPage: number; // Disinkronkan dengan response BE yang mengirim 'lastPage'
    };
}

export interface UserDetailResponse extends User { }

// ============================================================================
// SYSTEM LOGS CONTRACT
// ============================================================================

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

// ============================================================================
// ADMIN SERVICE API METHODS
// ============================================================================

export const adminService = {
    // ------------------------------------------------------------------------
    // ANALYTICS & DASHBOARD METHODS
    // ------------------------------------------------------------------------

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

    downloadCashflowReport: async (period: string = 'Keseluruhan'): Promise<Blob> => {
        const response = await api.get('/admin/dashboard/cashflow/export', {
            params: { period },
            responseType: 'blob'
        });
        return response.data;
    },

    getGrowthAnalytics: async (startDate: string, endDate: string, resolution: AnalyticsResolution) => {
        const response = await api.get<TimeSeriesDataPoint[]>('/admin/dashboard/analytics/growth', {
            params: { startDate, endDate, resolution }
        });
        return response.data;
    },

    getEngagementAnalytics: async (startDate: string, endDate: string, resolution: AnalyticsResolution) => {
        const response = await api.get<TimeSeriesDataPoint[]>('/admin/dashboard/analytics/engagement', {
            params: { startDate, endDate, resolution }
        });
        return response.data;
    },

    // ------------------------------------------------------------------------
    // USER MANAGEMENT METHODS
    // ------------------------------------------------------------------------

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

    // ------------------------------------------------------------------------
    // SYSTEM AUDIT LOGS
    // ------------------------------------------------------------------------

    getSystemLogs: async (params?: { cursor?: string; take?: number; action?: string }) => {
        const response = await api.get<SystemLogResponse>('/admin/audit/logs', { params });
        return response.data;
    }
};