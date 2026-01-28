"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Plus, Edit, 
  RotateCcw, Briefcase, Building2,
  CheckCircle2, XCircle, Filter, User, Power,
  Users, ShieldCheck
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminUser, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

// MOCK DATA
const MOCK_USERS: AdminUser[] = [
  {
    id: "1",
    fullName: "Budi Santoso",
    email: "budi.s@maxipro.co.id",
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
    email: "siti.aminah@maxipro.co.id",
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
    email: "rudi.h@maxipro.co.id",
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
    email: "admin@maxipro.co.id",
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
    email: "joko.s@maxipro.co.id",
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

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case "ADMIN": return "bg-purple-50 text-purple-700 border-purple-200";
      case "DIRECTOR": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "UNIT_HEAD": return "bg-cyan-50 text-cyan-700 border-cyan-200";
      default: return "bg-slate-50 text-slate-600 border-slate-200";
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
    if(confirm(`Reset password untuk ${name}?\nPassword akan kembali ke default: maxipro123!`)) {
        alert(`Password untuk ${name} berhasil direset!`);
    }
  }

  return (
    <div className="min-h-screen w-full bg-surface-ground pb-24 md:pb-12">
      
      {/* --- HEADER (PAM IDENTITY) --- */}
      <div className="bg-brand-900 pt-10 pb-32 px-5 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-125 h-125 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
         <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-[0.05] mix-blend-overlay"></div>

         <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 mb-3">
                  <Users className="w-4 h-4 text-cyan-300" />
                  <span className="text-[10px] font-bold text-cyan-100 tracking-widest uppercase">Admin Portal</span>
               </div>
               <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                 Manajemen Pengguna
               </h1>
               <p className="text-brand-100 text-sm mt-1 opacity-90 max-w-lg">
                 Kelola data karyawan, hak akses, dan status akun dalam satu kendali.
               </p>
            </div>
            
            <Button 
              onClick={() => router.push("/admin/users/create")}
              variant="primary"
              className="shadow-xl shadow-brand-900/20 bg-emerald-600 hover:bg-emerald-700 border-0"
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah User Baru
            </Button>
         </div>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-5 -mt-20">
        
        {/* --- FILTERS & ACTIONS BAR --- */}
        <Card className="p-4 mb-6 shadow-lg border-white/60 bg-white/90 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Cari Nama, NIP, atau Email..." 
                className="pl-11 h-11 bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl text-sm font-medium transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto bg-slate-50 p-1 rounded-xl border border-slate-200">
              <div className="flex items-center px-3 text-slate-500 gap-2">
                 <Filter className="w-4 h-4" />
                 <span className="text-xs font-bold uppercase tracking-wider">Role</span>
              </div>
              <select 
                className="h-9 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer font-medium"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | "ALL")}
              >
                <option value="ALL">Semua Role</option>
                <option value="USER">User (Pegawai)</option>
                <option value="UNIT_HEAD">Pimpinan Unit</option>
                <option value="DIRECTOR">Direksi</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>
        </Card>

        {/* --- USERS TABLE --- */}
        <Card className="overflow-hidden shadow-sm border-slate-200 bg-white rounded-[1.5rem]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 font-bold">Info Pegawai</th>
                  <th className="px-6 py-5 font-bold">NIP & Unit</th>
                  <th className="px-6 py-5 font-bold text-center">Role</th>
                  <th className="px-6 py-5 font-bold">Status Akun</th>
                  <th className="px-6 py-5 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="bg-white hover:bg-brand-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shadow-inner border border-white">
                            {user.fullName.split(" ").map(n => n[0]).join("").substring(0,2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 group-hover:text-brand-700 transition-colors">{user.fullName}</div>
                            <div className="text-xs text-slate-500 font-medium">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-slate-700 font-mono text-xs font-bold bg-slate-50 px-2 py-0.5 rounded-md w-fit border border-slate-100">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            {user.nip}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {user.unitName || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider",
                          getRoleBadgeStyle(user.role)
                        )}>
                          {user.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.isActive ? (
                            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase">Aktif</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full">
                              <XCircle className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold uppercase">Non-Aktif</span>
                            </div>
                          )}
                        </div>
                        {user.lastLogin && (
                          <div className="text-[10px] text-slate-400 mt-1.5 ml-1">
                            Last: {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                           {/* Edit Button */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl"
                            onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          {/* Reset Password Button */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl"
                            onClick={() => handleResetPassword(user.id, user.fullName)}
                            title="Reset Password"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>

                          {/* Toggle Active Status */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                                "h-9 w-9 rounded-xl transition-colors",
                                user.isActive 
                                    ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" 
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
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-slate-300" />
                         </div>
                         <div>
                            <p className="text-slate-900 font-bold">Data tidak ditemukan</p>
                            <p className="text-slate-500 text-xs">Coba ubah kata kunci pencarian atau filter.</p>
                         </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Placeholder */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span className="font-medium">Menampilkan {filteredUsers.length} dari {users.length} user</span>
            <div className="flex gap-2">
               <Button variant="outline" size="sm" disabled className="h-8 text-xs bg-white">Sebelumnya</Button>
               <Button variant="outline" size="sm" disabled className="h-8 text-xs bg-white">Selanjutnya</Button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}