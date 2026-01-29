"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, Plus, Pencil, Trash2,
  User as UserIcon, Building2,
  Loader2, AlertCircle, IdCard, Mail
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminService, User } from "@/services/admin.service";
import { toast } from "sonner";

export default function AdminUsersPage() {
  // --- STATE ---
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Debounce search agar tidak spam API setiap ketik huruf (delay 500ms)
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // --- FETCH DATA ---
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Backend sudah support search by Name OR NIP
      const data = await adminService.getUsers({ search: debouncedSearch });
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data pegawai");
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch saat search berubah
  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch]);

  // --- HANDLERS ---
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus pegawai "${name}"?\nTindakan ini tidak dapat dibatalkan.`)) return;

    try {
      await adminService.deleteUser(id);
      toast.success("Pegawai berhasil dihapus");
      fetchUsers(); // Refresh list
    } catch (error: any) {
      console.error(error);
      toast.error("Gagal menghapus pegawai");
    }
  };

  return (
    <div className="min-h-screen w-full bg-surface-ground pb-24 md:pb-12">

      {/* --- HEADER --- */}
      <div className="bg-brand-900 pt-10 pb-32 px-5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-125 h-125 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-[0.05] mix-blend-overlay"></div>

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 mb-3">
              <UserIcon className="w-4 h-4 text-cyan-300" />
              <span className="text-[10px] font-bold text-cyan-100 tracking-widest uppercase">Manajemen User</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Daftar Pegawai
            </h1>
            <p className="text-brand-100 text-sm mt-1 opacity-90 max-w-lg">
              Kelola akun, akses, dan penempatan unit kerja pegawai.
            </p>
          </div>

          <Link href="/admin/users/create">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-white shadow-xl shadow-brand-900/20 font-bold border border-cyan-400/20">
              <Plus className="w-4 h-4 mr-2" /> Tambah Pegawai
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative z-20 max-w-6xl mx-auto px-5 -mt-20">

        {/* --- SEARCH BAR --- */}
        <Card className="p-4 mb-6 shadow-lg border-white/60 bg-white/90 backdrop-blur-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Cari berdasarkan Nama atau NIP..."
              className="pl-12 h-12 bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl text-sm font-medium transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Card>

        {/* --- DATA TABLE --- */}
        <Card className="overflow-hidden shadow-sm border-slate-200 bg-white rounded-[1.5rem]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 font-bold">Info Pegawai</th>
                  <th className="px-6 py-5 font-bold">NIP</th>
                  <th className="px-6 py-5 font-bold">Unit Kerja</th>
                  <th className="px-6 py-5 font-bold">Role Akses</th>
                  <th className="px-6 py-5 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                        <p className="text-slate-500 font-medium text-xs">Memuat data pegawai...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="bg-white hover:bg-brand-50/30 transition-colors group">

                      {/* 1. INFO PEGAWAI */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{user.fullName}</div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                              <Mail className="w-3 h-3" /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. NIP */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <IdCard className="w-4 h-4 text-slate-400" />
                          <span className="font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                            {user.nip || "-"}
                          </span>
                        </div>
                      </td>

                      {/* 3. UNIT KERJA */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-700">
                            {user.unitKerja?.namaUnit || <span className="text-rose-500 italic text-xs">Belum di-assign</span>}
                          </span>
                        </div>
                      </td>

                      {/* 4. ROLE */}
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={`
                            ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              user.role === 'DIRECTOR' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-cyan-50 text-cyan-700 border-cyan-200'}
                          `}
                        >
                          {user.role}
                        </Badge>
                      </td>

                      {/* 5. AKSI */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <Link href={`/admin/users/${user.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
                              title="Edit Pegawai"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            onClick={() => handleDelete(user.id, user.fullName)}
                            title="Hapus Pegawai"
                          >
                            <Trash2 className="w-4 h-4" />
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
                          <AlertCircle className="w-8 h-8 text-slate-300" />
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold">Data tidak ditemukan</p>
                          <p className="text-slate-500 text-xs">Coba kata kunci lain atau tambah pegawai baru.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}