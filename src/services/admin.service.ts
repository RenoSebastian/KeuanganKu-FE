import api from '@/lib/axios';

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
    unitKerjaId: string; // [REQUIRED] ID dari dropdown Master Data

    // Opsional
    jobTitle?: string;
    dateOfBirth?: string; // Format: YYYY-MM-DD
    dependentCount?: number;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> { }

export const adminService = {
    // Get List Users (Support Search & Filter Role)
    getUsers: async (params?: { search?: string; role?: string }) => {
        const response = await api.get<User[]>('/users', { params });
        return response.data;
    },

    // Get Detail User
    getUserById: async (id: string) => {
        const response = await api.get<User>(`/users/${id}`);
        return response.data;
    },

    // Create User Baru (Admin Only)
    createUser: async (data: CreateUserPayload) => {
        const response = await api.post<User>('/users', data);
        return response.data;
    },

    // Update User (Admin Only)
    updateUser: async (id: string, data: UpdateUserPayload) => {
        const response = await api.patch<User>(`/users/${id}`, data);
        return response.data;
    },

    // Delete User (Admin Only)
    deleteUser: async (id: string) => {
        const response = await api.delete<{ message: string; id: string }>(`/users/${id}`);
        return response.data;
    },
};