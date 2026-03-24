"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as dateFnsId } from "date-fns/locale";
import {
  Search, Plus, MoreHorizontal,
  User as UserIcon, Shield, CreditCard,
  Loader2, AlertCircle, Mail, Filter,
  CheckCircle2, XCircle, Zap, Crown,
  MessageCircle // [NEW] Icon WhatsApp
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";
import { adminService } from "@/services/admin.service";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import router from "next/router";

// --- INTERFACE MENYESUAIKAN RESPONSE BACKEND PHASE 2 ---
interface AgentUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phoneNumber?: string | null; // [NEW] Diperlukan untuk fitur WA
  agency?: { name: string; code: string };
  usage?: { simulationQuota: number; totalUsed: number };
  subscription?: { status: string; endDate: string; plan?: { name: string } };
  createdAt: string;
}

export default function AdminUsersPage() {
  // --- STATE ---
  const [users, setUsers] = useState<AgentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // State untuk Inject Quota Modal
  const [isInjectModalOpen, setIsInjectModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AgentUser | null>(null);
  const [injectAmount, setInjectAmount] = useState<number | string>("");
  const [injectReason, setInjectReason] = useState("");
  const [isInjecting, setIsInjecting] = useState(false);

  // Debounce search untuk optimalisasi panggilan API Fuzzy Search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // --- FETCH DATA ---
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const queryParams: any = { search: debouncedSearch, limit: 50 };
      if (filterRole !== "ALL") {
        queryParams.role = filterRole;
      }

      const response: any = await adminService.getUsers(queryParams);
      const dataList = response.data ? response.data : response;
      setUsers(dataList);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data pengguna");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterRole]);

  // --- HANDLERS ---
  const handleAction = async (action: string, user: AgentUser) => {
    if (action === "delete") {
      if (!confirm(`Hapus pengguna ${user.fullName} secara permanen? Aksi ini akan dicatat di Audit Log.`)) return;
      try {
        await adminService.deleteUser(user.id);
        toast.success("User berhasil dihapus");
        fetchUsers();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Gagal menghapus user");
      }
    } else if (action === "inject") {
      setSelectedUser(user);
      setInjectAmount("");
      setInjectReason("");
      setIsInjectModalOpen(true);
    } else if (action === "reset_password") {
      toast.info(`Email reset password dikirim ke ${user.email} (Fitur segera hadir)`);
    }
  };

  const handleInjectSubmit = async () => {
    if (!selectedUser) return;
    if (!injectAmount || Number(injectAmount) === 0) {
      toast.warning("Nominal token tidak valid.");
      return;
    }
    if (!injectReason.trim()) {
      toast.warning("Alasan wajib diisi untuk pencatatan Audit Log.");
      return;
    }

    setIsInjecting(true);
    try {
      await api.patch(`/admin/subscription/users/${selectedUser.id}/quota`, {
        amount: Number(injectAmount),
        reason: injectReason
      });

      toast.success(`Berhasil menambahkan ${injectAmount} token ke ${selectedUser.fullName}`);
      setIsInjectModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal melakukan injeksi kuota");
    } finally {
      setIsInjecting(false);
    }
  };

  // ====================================================================
  // [NEW] FASE 3: LOGIKA PEMANGGIL WHATSAPP (ACTION HANDLER)
  // ====================================================================
  const handleWhatsAppBilling = (user: AgentUser) => {
    // 1. Guard Clause
    if (!user.phoneNumber || user.phoneNumber.trim() === "") {
      toast.error(`Nomor WhatsApp untuk ${user.fullName} belum diisi.`);
      return;
    }

    // 2. Rakit template dinamis
    const planName = user.subscription?.plan?.name || "Premium";
    const message = `Halo Bapak/Ibu *${user.fullName}*,\n\nKami dari KeuanganKu ingin menginformasikan bahwa masa berlaku langganan Anda untuk paket *${planName}* telah habis/perlu diperbarui.\n\nYuk perpanjang sekarang agar bisa terus menggunakan fitur kalkulator finansial kami tanpa gangguan! Silakan hubungi kami untuk info perpanjangan.\n\nTerima Kasih,\nTim KeuanganKu`;

    // 3. URL Encoding
    const encodedText = encodeURIComponent(message);

    // 4. Sanitasi fallback (jika diperlukan)
    let phone = user.phoneNumber;
    if (phone.startsWith("0")) phone = "62" + phone.substring(1);
    else if (phone.startsWith("+")) phone = phone.substring(1);

    // 5. Eksekusi Deep Link
    window.open(`https://wa.me/${phone}?text=${encodedText}`, "_blank");
  };
  // ====================================================================

  return (
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12">

      {/* --- HEADER (SaaS Style) --- */}
      <div className="bg-slate-900 pt-10 pb-32 px-5 relative overflow-hidden shadow-xl rounded-b-[2.5rem]">
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
              Monitor subscriber, kelola kuota, dan atur hak akses sistem secara komprehensif.
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
              placeholder="Fuzzy Search by name, email, agency, nip, phone..."
              className="pl-10 h-11 bg-transparent border-transparent focus:bg-slate-50 rounded-xl text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="h-8 w-px bg-slate-200 hidden md:block my-auto" />

          <div className="flex gap-2 p-1 overflow-x-auto">
            {["ALL", "USER", "ADMIN", "DIRECTOR"].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                  filterRole === role
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {role}
              </button>
            ))}
          </div>
        </Card>

        {/* --- DESKTOP DATA TABLE --- */}
        <Card className="overflow-hidden shadow-sm border-slate-200 bg-white rounded-2xl hidden md:block mb-12">
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
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      {Array.from({ length: 5 }).map((_, colIdx) => (
                        <td key={colIdx} className="px-6 py-4">
                          <div className="h-10 bg-slate-100 animate-pulse rounded-lg w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length > 0 ? (
                  users.map((user) => {
                    const planName = user.subscription?.plan?.name?.toUpperCase() || "FREE";
                    const isPro = user.subscription?.status === "ACTIVE";
                    const quotaLimit = user.usage?.simulationQuota || 0;
                    const quotaUsed = user.usage?.totalUsed || 0;
                    const quotaPercentage = quotaLimit > 0 ? (quotaUsed / quotaLimit) * 100 : 0;

                    return (
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
                              {/* [NEW] Menampilkan nomor WA di UI */}
                              {user.phoneNumber && (
                                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-mono mt-0.5">
                                  <MessageCircle className="w-3 h-3" /> {user.phoneNumber}
                                </div>
                              )}
                              {user.agency && (
                                <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                                  {user.agency.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. PLAN & STATUS */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1.5">
                            <Badge variant="outline" className={cn(
                              "border-0 font-bold px-2 py-0.5",
                              planName.includes("ENTERPRISE") ? "bg-purple-50 text-purple-700 ring-1 ring-purple-100" :
                                isPro ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" :
                                  "bg-slate-100 text-slate-600"
                            )}>
                              {planName.includes("ENTERPRISE") && <Crown className="w-3 h-3 mr-1 fill-purple-200" />}
                              {planName} PLAN
                            </Badge>

                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide">
                              {isPro ? (
                                <>
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-emerald-600">Active Subs</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                  <span className="text-slate-400">Basic / Inactive</span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 3. USAGE QUOTA */}
                        <td className="px-6 py-4">
                          <div className="w-full max-w-35">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                              <span>{quotaUsed} used</span>
                              <span>{quotaLimit} limit</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={cn("h-full rounded-full transition-all duration-500",
                                  quotaPercentage > 90 ? "bg-red-500" : "bg-blue-500"
                                )}
                                style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                              />
                            </div>
                            {quotaPercentage > 90 && (
                              <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1 font-medium">
                                <AlertCircle className="w-3 h-3" /> Low Quota
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 4. JOINED DATE */}
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">
                          {user.createdAt && !isNaN(new Date(user.createdAt).getTime())
                            ? format(new Date(user.createdAt), "dd MMM yyyy", { locale: dateFnsId })
                            : "-"}
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

                              {/* [NEW] FASE 4: TOMBOL TAGIH VIA WHATSAPP BERDASARKAN KONDISI */}
                              {(!isPro) && (
                                <DropdownMenuItem
                                  className="cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 font-medium"
                                  onClick={() => handleWhatsAppBilling(user)}
                                >
                                  <MessageCircle className="mr-2 h-4 w-4" /> Tagih via WA
                                </DropdownMenuItem>
                              )}

                              <Link href={`/admin/users/${user.id}/edit`} className="w-full">
                                <DropdownMenuItem className="cursor-pointer">
                                  <UserIcon className="w-4 h-4 mr-2" /> Edit Details
                                </DropdownMenuItem>
                              </Link>
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
                    )
                  })
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

        {/* --- MOBILE CARD LIST PATTERN --- */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx} className="p-4 rounded-2xl border-slate-200 bg-white shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-100 animate-pulse rounded w-1/2" />
                    <div className="h-3 bg-slate-100 animate-pulse rounded w-1/3" />
                  </div>
                </div>
                <div className="h-6 bg-slate-100 animate-pulse rounded w-1/4" />
                <div className="h-8 bg-slate-100 animate-pulse rounded w-full mt-2" />
              </Card>
            ))
          ) : users.length > 0 ? (
            users.map((user) => {
              const planName = user.subscription?.plan?.name?.toUpperCase() || "FREE";
              const isPro = user.subscription?.status === "ACTIVE";
              const quotaLimit = user.usage?.simulationQuota || 0;
              const quotaUsed = user.usage?.totalUsed || 0;
              const quotaPercentage = quotaLimit > 0 ? (quotaUsed / quotaLimit) * 100 : 0;

              return (
                <Card key={user.id} className="p-4 rounded-2xl border-slate-200 bg-white/95 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm",
                        user.role.includes("ADMIN") ? "bg-slate-800" : "bg-linear-to-br from-blue-500 to-blue-600"
                      )}>
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                          {user.fullName}
                          {user.role === 'SUPER_ADMIN' && <Shield className="w-3 h-3 text-blue-600 fill-blue-100" />}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Mail className="w-3 h-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 -mr-2 -mt-2">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 z-50">
                        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* [NEW] FASE 4: TOMBOL TAGIH VIA WHATSAPP (Mobile) */}
                        {(!isPro) && (
                          <DropdownMenuItem
                            className="cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 font-medium"
                            onClick={() => handleWhatsAppBilling(user)}
                          >
                            <MessageCircle className="mr-2 h-4 w-4" /> Tagih via WA
                          </DropdownMenuItem>
                        )}

                        <Link href={`/admin/users/${user.id}/edit`} className="w-full">
                          <DropdownMenuItem className="cursor-pointer">
                            <UserIcon className="w-4 h-4 mr-2" /> Edit Details
                          </DropdownMenuItem>
                        </Link>
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
                  </div>

                  <div className="flex items-center justify-between border-y border-slate-50 py-2">
                    <Badge variant="outline" className={cn(
                      "border-0 font-bold px-2 py-0.5",
                      planName.includes("ENTERPRISE") ? "bg-purple-50 text-purple-700 ring-1 ring-purple-100" :
                        isPro ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" :
                          "bg-slate-100 text-slate-600"
                    )}>
                      {planName.includes("ENTERPRISE") && <Crown className="w-3 h-3 mr-1 fill-purple-200" />}
                      {planName} PLAN
                    </Badge>

                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide">
                      {isPro ? (
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

                  <div className="w-full">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>{quotaUsed} used</span>
                      <span>{quotaLimit} limit</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500",
                          quotaPercentage > 90 ? "bg-red-500" : "bg-blue-500"
                        )}
                        style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-8 rounded-2xl border-slate-200 bg-white/95 shadow-sm text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-3">
                <Filter className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-900 font-bold">No subscribers found</p>
              <p className="text-slate-500 text-xs">Try adjusting your filters.</p>
            </Card>
          )}
        </div>
      </div>

      {/* --- INJECT QUOTA MODAL / DIALOG --- */}
      <Dialog open={isInjectModalOpen} onOpenChange={(open) => !open && setIsInjectModalOpen(false)}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Inject Token Kuota</DialogTitle>
            <DialogDescription>
              Menambah atau mengurangi (dengan minus) kuota user <b>{selectedUser?.fullName}</b>.
              Setiap aksi akan dicatat secara ketat di Audit Log.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 mt-2">
            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-slate-700 font-semibold">Nominal Token</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Contoh: 50 atau -10"
                value={injectAmount}
                onChange={(e) => setInjectAmount(e.target.value)}
              />
              <p className="text-[10px] text-slate-500 font-medium">Gunakan angka negatif untuk memotong kuota.</p>
            </div>

            <div className="grid gap-2 mt-2">
              <Label htmlFor="reason" className="text-slate-700 font-semibold">Alasan Injeksi (Wajib Audit)</Label>
              <Textarea
                id="reason"
                placeholder="Contoh: Kompensasi downtime sistem, bonus manual, dll."
                value={injectReason}
                onChange={(e) => setInjectReason(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setIsInjectModalOpen(false)} disabled={isInjecting}>
              Batal
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleInjectSubmit}
              disabled={isInjecting || !injectReason.trim() || !injectAmount}
            >
              {isInjecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              Eksekusi Injeksi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}