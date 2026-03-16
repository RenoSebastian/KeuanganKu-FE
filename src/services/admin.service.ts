import api from '@/lib/axios';
import {
    DashboardMetricsResponse,
    CashflowLedgerResponse
} from '@/lib/types/dashboard';

// Tipe Data User sesuai response Backend terbaru
export interface User {
    dateOfBirth: any;
    id: string;
    nip: string; // [NEW] Field Baru
    fullName: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'DIRECTOR';
    // Unit Kerja sekarang berupa object relasi
    unitKerja?: {
        id: string;
        namaUnit: string;
    };
    jobTitle?: string; // Optional display only
    createdAt: string;
}

// Payload untuk Create User (Wajib NIP & UnitKerjaId)
export interface CreateUserPayload {
    fullName: string;
    email: string;
    nip: string; // [REQUIRED]
    password: string;
    role: 'USER' | 'ADMIN' | 'DIRECTOR';
    agencyId: string; // [REQUIRED] ID dari dropdown Master Data

    // Opsional
    jobTitle?: string;
    dateOfBirth?: string; // Format: YYYY-MM-DD
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

export interface UserDetailResponse extends User {
    // Extend with extra detail if needed by the backend payload
}

export const adminService = {
    // ========================================================================
    // ANALYTICS & DASHBOARD METHODS (Phase 1)
    // ========================================================================

    // Get Analytics Metrics (Revenue, Users, Usage) - Cached via Redis
    getDashboardMetrics: async () => {
        const response = await api.get<DashboardMetricsResponse>('/admin/dashboard/metrics');
        return response.data;
    },

    // Get Cashflow Ledger Table Data with Pagination
    getCashflowLedger: async (page: number = 1, limit: number = 10) => {
        const response = await api.get<CashflowLedgerResponse>('/admin/dashboard/cashflow', {
            params: { page, limit }
        });
        return response.data;
    },

    // ========================================================================
    // USER MANAGEMENT METHODS
    // ========================================================================

    // Get List Users (Support Search & Filter Role)
    getUsers: async (params?: PaginationParams) => {
        const response = await api.get<AdminUsersResponse>('/admin/users', { params });
        return response.data;
    },

    // Get Detail User
    getUserById: async (id: string) => {
        const response = await api.get<UserDetailResponse>(`/admin/users/${id}`);
        return response.data;
    },

    // Create User Baru (Admin Only)
    createUser: async (payload: CreateUserPayload) => {
        const response = await api.post<User>('/admin/users', payload);
        return response.data;
    },

    // Update User (Admin Only)
    updateUser: async (id: string, payload: UpdateUserPayload) => {
        const response = await api.patch<User>(`/admin/users/${id}`, payload);
        return response.data;
    },

    // Delete User (Admin Only)
    deleteUser: async (id: string) => {
        const response = await api.delete<{ message: string; id: string }>(`/admin/users/${id}`);
        return response.data;
    },
};