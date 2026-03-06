"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, Plus, MoreHorizontal,
  User as UserIcon, Shield, CreditCard,
  Loader2, AlertCircle, Mail, Filter,
  CheckCircle2, XCircle, Zap, Crown
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";
import { cn } from "@/lib/utils";

// --- MOCK INTERFACE FOR SAAS USER (To replace legacy User type) ---
interface SaaSUser {
  id: string;
  fullName: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  plan: "FREE" | "PRO" | "ENTERPRISE";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  quotaUsed: number;
  quotaLimit: number;
  joinedAt: string;
}

export default function AdminUsersPage() {
  // --- STATE ---
  const [users, setUsers] = useState<SaaSUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // --- FETCH DATA ---
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // NOTE: Di production, ganti ini dengan call API asli
      // const data = await adminService.getUsers({ search: debouncedSearch });

      // Simulasi Data SaaS untuk UI Preview
      await new Promise(r => setTimeout(r, 800));
      const mockUsers: SaaSUser[] = [
        { id: "1", fullName: "Reno Sebastian", email: "reno@example.com", role: "SUPER_ADMIN", plan: "ENTERPRISE", status: "ACTIVE", quotaUsed: 45, quotaLimit: 1000, joinedAt: "2025-01-10" },
        { id: "2", fullName: "Budi Santoso", email: "budi.s@agency.com", role: "USER", plan: "PRO", status: "ACTIVE", quotaUsed: 88, quotaLimit: 100, joinedAt: "2025-02-14" },
        { id: "3", fullName: "Siti Aminah", email: "siti@gmail.com", role: "USER", plan: "FREE", status: "INACTIVE", quotaUsed: 5, quotaLimit: 5, joinedAt: "2024-12-05" },
        { id: "4", fullName: "Operational Team", email: "ops@keuanganku.com", role: "ADMIN", plan: "ENTERPRISE", status: "ACTIVE", quotaUsed: 12, quotaLimit: 9999, joinedAt: "2024-11-20" },
      ];

      // Filter logic (Client side simulation)
      let filtered = mockUsers.filter(u =>
        u.fullName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
      );

      if (filterStatus !== "ALL") {
        filtered = filtered.filter(u => u.status === filterStatus);
      }

      setUsers(filtered);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data subscriber");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, filterStatus]);

  // --- HANDLERS ---
  const handleAction = (action: string, user: SaaSUser) => {
    if (action === "delete") {
      if (!confirm(`Hapus user ${user.fullName}? Data transaksi akan di-archive.`)) return;
      toast.success("User berhasil dinonaktifkan (Soft Delete)");
    } else if (action === "inject") {
      toast.success(`Bonus kuota ditambahkan ke ${user.fullName}`);
    } else if (action === "reset_password") {
      toast.info(`Email reset password dikirim ke ${user.email}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12">

      {/* --- HEADER (SaaS Style) --- */}
      <div className="bg-slate-900 pt-10 pb-32 px-5 relative overflow-hidden shadow-xl rounded-b-[2.5rem]">
        {/* Abstract Tech Patterns */}
        <div className="absolute top-0 right-0 w-125 h-125 bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-75 h-75 bg-emerald-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10 mix-blend-overlay"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-md px-3 py-1 rounded-full border border-blue-500/20 mb-3">
              <UserIcon className="w-3.5 h-3.5 text-blue-300" />
              <span className="text-[10px] font-bold text-blue-100 tracking-widest uppercase">Subscriber DB</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              User Management
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-lg">
              Monitor subscriber, kelola kuota, dan atur hak akses sistem.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 hidden md:flex">
              Export CSV
            </Button>
            <Link href="/admin/users/create">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 font-bold border border-blue-400/20">
                <Plus className="w-4 h-4 mr-2" /> Add User
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-5 -mt-20">

        {/* --- CONTROLS BAR --- */}
        <Card className="p-2 mb-6 shadow-lg border-slate-200/60 bg-white/90 backdrop-blur-xl rounded-2xl flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email..."
              className="pl-10 h-11 bg-transparent border-transparent focus:bg-slate-50 rounded-xl text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="h-8 w-px bg-slate-200 hidden md:block my-auto" />

          <div className="flex gap-2 p-1 overflow-x-auto">
            {["ALL", "ACTIVE", "INACTIVE", "SUSPENDED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                  filterStatus === status
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </Card>

        {/* --- DATA TABLE --- */}
        <Card className="overflow-hidden shadow-sm border-slate-200 bg-white rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold">User Identity</th>
                  <th className="px-6 py-4 font-bold">Plan & Status</th>
                  <th className="px-6 py-4 font-bold">Usage / Quota</th>
                  <th className="px-6 py-4 font-bold">Joined Date</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        <p className="text-slate-500 font-medium text-xs">Loading subscribers...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="bg-white hover:bg-slate-50 transition-colors group">

                      {/* 1. USER IDENTITY */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm",
                            user.role.includes("ADMIN") ? "bg-slate-800" : "bg-linear-to-br from-blue-500 to-blue-600"
                          )}>
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-2">
                              {user.fullName}
                              {user.role === 'SUPER_ADMIN' && <Shield className="w-3 h-3 text-blue-600 fill-blue-100" />}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                              <Mail className="w-3 h-3" /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. PLAN & STATUS */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          <Badge variant="outline" className={cn(
                            "border-0 font-bold px-2 py-0.5",
                            user.plan === "ENTERPRISE" ? "bg-purple-50 text-purple-700 ring-1 ring-purple-100" :
                              user.plan === "PRO" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" :
                                "bg-slate-100 text-slate-600"
                          )}>
                            {user.plan === "ENTERPRISE" && <Crown className="w-3 h-3 mr-1 fill-purple-200" />}
                            {user.plan} PLAN
                          </Badge>

                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide">
                            {user.status === "ACTIVE" ? (
                              <>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-emerald-600">Active</span>
                              </>
                            ) : (
                              <>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                <span className="text-slate-400">Inactive</span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. USAGE QUOTA */}
                      <td className="px-6 py-4">
                        <div className="w-full max-w-35">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                            <span>{user.quotaUsed} used</span>
                            <span>{user.quotaLimit} limit</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all duration-500",
                                (user.quotaUsed / user.quotaLimit) > 0.9 ? "bg-red-500" : "bg-blue-500"
                              )}
                              style={{ width: `${Math.min((user.quotaUsed / user.quotaLimit) * 100, 100)}%` }}
                            />
                          </div>
                          {(user.quotaUsed / user.quotaLimit) > 0.9 && (
                            <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1 font-medium">
                              <AlertCircle className="w-3 h-3" /> Low Quota
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. JOINED DATE */}
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {new Date(user.joinedAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>

                      {/* 5. ACTIONS */}
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleAction('edit', user)}>
                              <UserIcon className="w-4 h-4 mr-2" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('inject', user)}>
                              <Zap className="w-4 h-4 mr-2 text-amber-500" /> Inject Quota
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('reset_password', user)}>
                              <Shield className="w-4 h-4 mr-2" /> Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => handleAction('delete', user)}
                            >
                              <XCircle className="w-4 h-4 mr-2" /> Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                          <Filter className="w-8 h-8 text-slate-300" />
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold">No subscribers found</p>
                          <p className="text-slate-500 text-xs">Try adjusting your search or filters.</p>
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