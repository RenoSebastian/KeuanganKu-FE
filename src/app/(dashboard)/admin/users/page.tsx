"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Plus, Edit, Trash2, 
  RotateCcw, Briefcase, Building2,
  CheckCircle2, XCircle, Filter, User, Power
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminUser, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

// MOCK DATA (Simulasi database)
const MOCK_USERS: AdminUser[] = [
  {
    id: "1",
    fullName: "Budi Santoso",
    email: "budi.s@pamjaya.co.id",
    nip: "19880123 201001 1 001",
    unitId: "U-001",
    unitName: "Bidang Keuangan",
    role: "USER",
    isActive: true,
    lastLogin: "2024-01-15T08:30:00Z",
    createdAt: "2023-01-01T00:00:00Z"
  },
  {
    id: "2",
    fullName: "Siti Aminah",
    email: "siti.aminah@pamjaya.co.id",
    nip: "19900512 201502 2 005",
    unitId: "U-002",
    unitName: "Bidang SDM",
    role: "UNIT_HEAD",
    isActive: true,
    lastLogin: "2024-01-18T09:15:00Z",
    createdAt: "2023-02-15T00:00:00Z"
  },
  {
    id: "3",
    fullName: "Rudi Hermawan",
    email: "rudi.h@pamjaya.co.id",
    nip: "19750817 200003 1 009",
    unitId: "DIR-001",
    unitName: "Direktorat Utama",
    role: "DIRECTOR",
    isActive: true,
    lastLogin: "2024-01-18T10:00:00Z",
    createdAt: "2022-12-01T00:00:00Z"
  },
  {
    id: "4",
    fullName: "Admin System",
    email: "admin@pamjaya.co.id",
    nip: "99999999",
    unitId: "IT-001",
    unitName: "Divisi TI",
    role: "ADMIN",
    isActive: true,
    lastLogin: "2024-01-18T11:45:00Z",
    createdAt: "2022-01-01T00:00:00Z"
  },
  {
    id: "5",
    fullName: "Joko Susilo",
    email: "joko.s@pamjaya.co.id",
    nip: "19951201 201901 1 022",
    unitId: "U-003",
    unitName: "Bidang Operasional",
    role: "USER",
    isActive: false,
    lastLogin: "2023-11-20T16:00:00Z",
    createdAt: "2023-06-10T00:00:00Z"
  }
];

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

  // Filtering Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nip.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN": return "bg-purple-100 text-purple-700 border-purple-200";
      case "DIRECTOR": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "UNIT_HEAD": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    const action = currentStatus ? "menonaktifkan" : "mengaktifkan";
    if(confirm(`Apakah Anda yakin ingin ${action} akses user ini?`)) {
      setUsers(prev => prev.map(u => 
        u.id === id ? { ...u, isActive: !currentStatus } : u
      ));
    }
  }

  const handleResetPassword = (id: string, name: string) => {
    if(confirm(`Reset password untuk ${name}?\nPassword akan kembali ke default: PamJaya123!`)) {
        // Simulasi API call
        alert(`Password untuk ${name} berhasil direset!`);
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12">
      {/* Header Decoration */}
      <div className="h-32 w-full bg-slate-900 absolute top-0 left-0 z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8 md:pt-12">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 text-white">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
            <p className="text-slate-300 text-sm">Kelola data karyawan, role, dan status akun.</p>
          </div>
          <Button 
            onClick={() => router.push("/admin/users/create")}
            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah User Baru
          </Button>
        </div>

        {/* Filters & Actions Bar */}
        <Card className="p-4 mb-6 shadow-sm border-slate-200 bg-white">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Cari Nama, NIP, atau Email..." 
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-500" />
              <select 
                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | "ALL")}
              >
                <option value="ALL">Semua Role</option>
                <option value="USER">User (Pegawai)</option>
                <option value="UNIT_HEAD">Pimpinan Bidang</option>
                <option value="DIRECTOR">Direksi</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden shadow-sm border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Info Pegawai</th>
                  <th className="px-6 py-4 font-bold">NIP & Jabatan</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="bg-white hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                            {user.fullName.split(" ").map(n => n[0]).join("").substring(0,2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{user.fullName}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            {user.nip}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {user.unitName || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-md text-[10px] font-bold border",
                          getRoleBadgeColor(user.role)
                        )}>
                          {user.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.isActive ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span className="text-emerald-700 font-bold text-xs">Aktif</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-500 font-bold text-xs">Non-Aktif</span>
                            </>
                          )}
                        </div>
                        {user.lastLogin && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Last: {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           {/* Edit Button */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          {/* Reset Password Button */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                            onClick={() => handleResetPassword(user.id, user.fullName)}
                            title="Reset Password"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>

                          {/* Toggle Active Status (Soft Delete) */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                                "h-8 w-8",
                                user.isActive 
                                    ? "text-slate-500 hover:text-red-600 hover:bg-red-50" 
                                    : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            )}
                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                            title={user.isActive ? "Non-aktifkan User" : "Aktifkan User"}
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Tidak ada data user yang ditemukan.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>Menampilkan {filteredUsers.length} dari {users.length} user</span>
            <div className="flex gap-2">
               <Button variant="outline" size="sm" disabled className="h-8 text-xs">Sebelumnya</Button>
               <Button variant="outline" size="sm" disabled className="h-8 text-xs">Selanjutnya</Button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}