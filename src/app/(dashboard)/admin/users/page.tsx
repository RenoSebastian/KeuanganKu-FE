"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as dateFnsId } from "date-fns/locale";
import {
  Search, Plus, MoreHorizontal,
  User as UserIcon, Shield, CreditCard,
  Loader2, AlertCircle, Mail, Filter,
  CheckCircle2, XCircle, Zap, Crown,
  MessageCircle, Clock, Calendar, LockKeyhole, Link as LinkIcon // [CHANGED] Menambahkan LinkIcon
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
import { subscriptionService } from "@/services/subscription.service";
import { SubscriptionPlan } from "@/lib/types/subscription";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

// [FASE 3] Import hook socket untuk mengaktifkan Observer Pattern di sisi Admin
import { useSocket } from "@/providers/socket-provider";

// [NEW] FASE 5: Import Komponen Zero-Knowledge Password Reset
import TriggerResetModal from "@/components/features/admin/users/trigger-reset-modal";

// --- INTERFACE MENYESUAIKAN RESPONSE BACKEND DENGAN COMPUTED METRICS ---
interface AgentUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phoneNumber?: string | null;
  agency?: { name: string; code: string };
  usage?: { simulationQuota: number; totalUsed: number };
  subscription?: {
    status: string;
    endDate: string;
    plan?: { name: string }
  };
  // [NEW] Objek terkomputasi dari Backend
  computed?: {
    subscription: {
      remainingDays: number;
      isActive: boolean;
      derivedStatus: string;
    };
    usageAnalytics: {
      isUnlimited: boolean;
      healthStatus: string;
      totalUsage: number;
    };
  };
  createdAt: string;
}

export default function AdminUsersPage() {
  const { socket } = useSocket();

  // --- STATE ---
  const [users, setUsers] = useState<AgentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [isInjectModalOpen, setIsInjectModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AgentUser | null>(null);
  const [injectAmount, setInjectAmount] = useState<number | string>("");
  const [injectReason, setInjectReason] = useState("");
  const [isInjecting, setIsInjecting] = useState(false);

  // [NEW] FASE 5: State untuk Trigger Reset Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<AgentUser | null>(null);

  // [NEW] State untuk Aktivasi PRO Langsung (Manual Override)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [selectedUserForPro, setSelectedUserForPro] = useState<AgentUser | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [proDuration, setProDuration] = useState<number>(1);
  const [proReason, setProReason] = useState("Akses Khusus Leader / Tim Sales");
  const [isGrantingPro, setIsGrantingPro] = useState(false);

  const fetchPlans = async () => {
    try {
      const data = await subscriptionService.getPlans();
      setPlans(data);
      if (data.length > 0) {
        setSelectedPlanId((prev) => prev || data[0].id);
        setProDuration((prev) => prev || data[0].durationMonths || 1);
      }
    } catch (err) {
      console.error("Failed to load plans", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // --- FETCH DATA ---
  const fetchUsers = useCallback(async (isSilentRefetch = false) => {
    if (!isSilentRefetch) setIsLoading(true);
    try {
      const queryParams: any = { search: debouncedSearch, limit: 50 };
      if (filterRole !== "ALL") queryParams.role = filterRole;

      const response: any = await adminService.getUsers(queryParams);
      const dataList = response.data ? response.data : response;
      setUsers(dataList);
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
      toast.error("Gagal memuat data pengguna");
    } finally {
      if (!isSilentRefetch) setIsLoading(false);
    }
  }, [debouncedSearch, filterRole]);

  useEffect(() => {
    fetchUsers(false);
  }, [fetchUsers]);

  useEffect(() => {
    if (!socket) return;
    const handleProfileMutated = () => fetchUsers(true);
    socket.on('USER_PROFILE_MUTATED', handleProfileMutated);
    return () => { socket.off('USER_PROFILE_MUTATED', handleProfileMutated); };
  }, [socket, fetchUsers]);

  // --- HANDLERS ---
  const handleAction = async (action: string, user: AgentUser) => {
    if (action === "delete") {
      if (!confirm(`Hapus pengguna ${user.fullName}?`)) return;
      try {
        await adminService.deleteUser(user.id);
        toast.success("User berhasil dihapus");
        fetchUsers();
      } catch (error: any) {
        toast.error("Gagal menghapus user");
      }
    } else if (action === "inject") {
      setSelectedUser(user);
      setInjectAmount("");
      setInjectReason("");
      setIsInjectModalOpen(true);
    } else if (action === "reset_password") {
      // [NEW] Memicu modal reset sandi
      setSelectedUserForReset(user);
      setIsResetModalOpen(true);
    } else if (action === "grant_pro") {
      setSelectedUserForPro(user);
      fetchPlans();
      setProReason("Akses Khusus Leader / Tim Sales");
      setIsProModalOpen(true);
    }
  };

  const handleGrantProSubmit = async () => {
    if (!selectedUserForPro || !selectedPlanId) {
      toast.error("Pilih paket langganan terlebih dahulu");
      return;
    }
    setIsGrantingPro(true);
    try {
      await adminService.manualOverride({
        userId: selectedUserForPro.id,
        planId: selectedPlanId,
        durationMonths: Number(proDuration) || undefined,
        reason: proReason,
      });
      toast.success(`Akses PRO berhasil diaktifkan untuk ${selectedUserForPro.fullName}!`);
      setIsProModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengaktifkan akses PRO");
    } finally {
      setIsGrantingPro(false);
    }
  };

  const handleInjectSubmit = async () => {
    if (!selectedUser) return;
    setIsInjecting(true);
    try {
      await api.patch(`/admin/subscription/users/${selectedUser.id}/quota`, {
        amount: Number(injectAmount),
        reason: injectReason
      });
      toast.success(`Berhasil update kuota ${selectedUser.fullName}`);
      setIsInjectModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error("Gagal melakukan injeksi kuota");
    } finally {
      setIsInjecting(false);
    }
  };

  const handleWhatsAppBilling = (user: AgentUser) => {
    if (!user.phoneNumber) {
      toast.error(`Nomor WhatsApp ${user.fullName} belum diisi.`);
      return;
    }
    const message = `Halo Bapak/Ibu *${user.fullName}*,\n\nKami menginformasikan bahwa masa berlaku langganan KeuanganKu Anda perlu diperbarui.\n\nTerima Kasih.`;
    window.open(`https://wa.me/${user.phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12 font-sans">
      {/* --- HEADER --- */}
      <div className="bg-slate-900 pt-10 pb-32 px-5 relative overflow-hidden shadow-xl rounded-b-[2.5rem]">
        <div className="absolute top-0 right-0 w-125 h-125 bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-md px-3 py-1 rounded-full border border-blue-500/20 mb-3">
              <UserIcon className="w-3.5 h-3.5 text-blue-300" />
              <span className="text-[10px] font-bold text-blue-100 tracking-widest uppercase">Subscriber Database</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">User Management</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/users/create">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg font-bold border border-blue-400/20">
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
              placeholder="Fuzzy Search by name, email, agency..."
              className="pl-10 h-11 bg-transparent border-transparent focus:bg-slate-50 rounded-xl text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 p-1 overflow-x-auto">
            {["ALL", "USER", "ADMIN"].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                  filterRole === role ? "bg-slate-900 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
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
                  <th className="px-6 py-4 font-bold">Subscription Tracking</th>
                  <th className="px-6 py-4 font-bold">Usage Health (FUP)</th>
                  <th className="px-6 py-4 font-bold">Joined</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}><td colSpan={5} className="px-6 py-4"><div className="h-10 bg-slate-100 animate-pulse rounded-lg w-full" /></td></tr>
                  ))
                ) : users.map((user) => {
                  const computed = user.computed;
                  const isPro = computed?.subscription?.isActive || false;
                  const remainingDays = computed?.subscription?.remainingDays || 0;
                  const derivedStatus = computed?.subscription?.derivedStatus || "INACTIVE";
                  const healthStatus = computed?.usageAnalytics?.healthStatus || "NORMAL";

                  return (
                    <tr key={user.id} className="bg-white hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm",
                            user.role.includes("ADMIN") ? "bg-slate-800" : "bg-linear-to-br from-blue-500 to-blue-600"
                          )}>
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{user.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{user.role} • {user.agency?.name || 'Independent'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <Badge className={cn(
                              "font-black text-[9px] uppercase tracking-tighter border-0 px-2 py-0.5",
                              derivedStatus === 'ACTIVE' ? "bg-emerald-100 text-emerald-700" :
                                derivedStatus === 'EXPIRED' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"
                            )}>
                              {isPro && <Crown className="w-2.5 h-2.5 mr-1 fill-emerald-700/20" />}
                              {user.subscription?.plan?.name || "FREE"}
                            </Badge>
                          </div>
                          {isPro && (
                            <div className={cn(
                              "flex items-center gap-1 text-[10px] font-bold",
                              remainingDays <= 7 ? "text-amber-600 animate-pulse" : "text-slate-500"
                            )}>
                              <Clock className="w-3 h-3" />
                              {remainingDays} Hari Tersisa
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center w-32 mb-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase">Usage Health</span>
                            <Badge className={cn(
                              "text-[8px] px-1 py-0 h-4 min-w-10 justify-center font-black",
                              healthStatus === 'NORMAL' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                healthStatus === 'WARNING' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                  "bg-red-50 text-red-600 border-red-100"
                            )} variant="outline">
                              {healthStatus}
                            </Badge>
                          </div>
                          <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all duration-1000",
                                healthStatus === 'NORMAL' ? "bg-blue-500" : healthStatus === 'WARNING' ? "bg-amber-500" : "bg-red-500"
                              )}
                              style={{ width: isPro ? `${Math.min((user.usage?.totalUsed || 0) / 100, 100)}%` : `${((user.usage?.totalUsed || 0) / (user.usage?.simulationQuota || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {user.createdAt && !isNaN(new Date(user.createdAt).getTime()) ? (
                          format(new Date(user.createdAt), "dd MMM yyyy", { locale: dateFnsId })
                        ) : (
                          <span className="text-slate-300 italic">Tanggal tidak tersedia</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Aksi Cepat</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-violet-600 font-bold focus:bg-violet-50" onClick={() => handleAction('grant_pro', user)}>
                              <Crown className="w-4 h-4 mr-2 text-violet-500" /> Aktivasi PRO Langsung
                            </DropdownMenuItem>
                            {(!isPro || remainingDays <= 7) && (
                              <DropdownMenuItem className="text-emerald-600 font-bold focus:bg-emerald-50" onClick={() => handleWhatsAppBilling(user)}>
                                <MessageCircle className="mr-2 h-4 w-4" /> Tagih Pembayaran
                              </DropdownMenuItem>
                            )}
                            <Link href={`/admin/users/${user.id}/edit`}><DropdownMenuItem><UserIcon className="w-4 h-4 mr-2" /> Edit Profil</DropdownMenuItem></Link>
                            <DropdownMenuItem onClick={() => handleAction('inject', user)}><Zap className="w-4 h-4 mr-2 text-amber-500" /> Inject Token</DropdownMenuItem>

                            {/* [REFACTORED] Trigger Email Magic Link Sandi (Menyesuaikan Roadmap Tahap 4) */}
                            <DropdownMenuItem className="text-blue-600 font-bold focus:bg-blue-50" onClick={() => handleAction('reset_password', user)}>
                              <LinkIcon className="w-4 h-4 mr-2" /> Kirim Tautan Pemulihan
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleAction('delete', user)}><XCircle className="w-4 h-4 mr-2" /> Deactivate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* --- MOBILE VIEW --- */}
        <div className="md:hidden space-y-4 mb-12">
          {users.map((user) => (
            <Card key={user.id} className="p-4 rounded-2xl border-slate-200 bg-white shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">{user.fullName.charAt(0)}</div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{user.fullName}</div>
                    <div className="text-[10px] text-slate-400">{user.email}</div>
                  </div>
                </div>
                <Badge className={cn(
                  "text-[9px] font-black",
                  user.computed?.subscription?.isActive ? "bg-emerald-500" : "bg-slate-400"
                )}>
                  {user.subscription?.plan?.name || "FREE"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sisa Masa Aktif</p>
                  <p className="text-xs font-bold text-slate-700">{user.computed?.subscription?.isActive ? `${user.computed?.subscription?.remainingDays} Hari` : '-'}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status Penggunaan</p>
                  <p className={cn("text-xs font-bold", user.computed?.usageAnalytics?.healthStatus === 'CRITICAL' ? "text-red-600" : "text-blue-600")}>
                    {user.computed?.usageAnalytics?.healthStatus}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button variant="outline" size="sm" className="w-full rounded-xl h-9 text-[10px] font-black uppercase text-violet-600 border-violet-200 hover:bg-violet-50" onClick={() => handleAction('grant_pro', user)}>
                  <Crown className="w-3 h-3 mr-1 text-violet-500" /> PRO
                </Button>
                <Button variant="outline" size="sm" className="w-full rounded-xl h-9 text-[10px] font-black uppercase" onClick={() => handleWhatsAppBilling(user)}>
                  <MessageCircle className="w-3 h-3 mr-1" /> Hubungi
                </Button>
                <Button variant="outline" size="sm" className="w-full rounded-xl h-9 text-[10px] font-black uppercase text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleAction('reset_password', user)}>
                  <LinkIcon className="w-3 h-3 mr-1" /> Sandi
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* --- MODAL AKTIVASI PRO LANGSUNG (MANUAL OVERRIDE) --- */}
      <Dialog open={isProModalOpen} onOpenChange={setIsProModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-violet-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-violet-950 font-black">
              <div className="p-2 bg-violet-100 rounded-xl text-violet-600">
                <Crown className="w-5 h-5 fill-violet-500" />
              </div>
              Aktivasi Akses PRO Langsung
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Berikan akses paket PRO secara instan kepada <strong className="text-slate-800">{selectedUserForPro?.fullName}</strong> ({selectedUserForPro?.email}) tanpa perlu pembayaran / struk transfer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Pilihan Paket */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Pilih Paket Langganan</Label>
              <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                {plans.length === 0 ? (
                  <div className="p-3 bg-slate-50 text-xs text-slate-400 rounded-xl">Memuat daftar paket...</div>
                ) : (
                  plans.map((p) => {
                    const isSelected = selectedPlanId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPlanId(p.id);
                          setProDuration(p.durationMonths || 1);
                        }}
                        className={cn(
                          "p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between",
                          isSelected
                            ? "border-violet-500 bg-violet-50/60 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        )}
                      >
                        <div>
                          <div className="font-black text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-slate-500">
                            Durasi {p.durationMonths || 1} Bulan &bull; Bonus {p.bonusQuota || 50} Token
                          </div>
                        </div>
                        <div className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center",
                          isSelected ? "border-violet-600 bg-violet-600" : "border-slate-300"
                        )}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Durasi Tambahan (Opsional) */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Durasi Akses (Bulan)</Label>
              <Input
                type="number"
                min="1"
                max="120"
                value={proDuration}
                onChange={(e) => setProDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="rounded-xl h-11"
              />
              <p className="text-[10px] text-slate-400">Default mengikuti durasi paket yang dipilih.</p>
            </div>

            {/* Alasan Audit */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Alasan Pemberian Akses (Audit Log)</Label>
              <Textarea
                value={proReason}
                onChange={(e) => setProReason(e.target.value)}
                placeholder="Contoh: Leader Asuransi / Tim Sales Internal / Free Pass"
                className="rounded-xl resize-none text-xs"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setIsProModalOpen(false)}>
              Batal
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl px-6 shadow-lg shadow-violet-500/20"
              onClick={handleGrantProSubmit}
              disabled={isGrantingPro || !selectedPlanId}
            >
              {isGrantingPro ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Mengaktifkan...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" /> Aktifkan PRO Sekarang
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- INJECT MODAL --- */}
      <Dialog open={isInjectModalOpen} onOpenChange={setIsInjectModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Zap className="text-amber-500" /> Manual Token Injection</DialogTitle>
            <DialogDescription>Tambahkan kuota simulasi secara manual untuk {selectedUser?.fullName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Jumlah Token</Label>
              <Input type="number" value={injectAmount} onChange={(e) => setInjectAmount(e.target.value)} placeholder="Contoh: 10" className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label>Alasan (Audit Log)</Label>
              <Textarea value={injectReason} onChange={(e) => setInjectReason(e.target.value)} placeholder="Bonus pendaftaran, kompensasi error, dll." className="rounded-xl resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setIsInjectModalOpen(false)}>Batal</Button>
            <Button className="bg-slate-900 hover:bg-black rounded-xl px-8" onClick={handleInjectSubmit} disabled={isInjecting}>
              {isInjecting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eksekusi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- [NEW] FASE 5: TRIGGER RESET MODAL --- */}
      {selectedUserForReset && (
        <TriggerResetModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          userId={selectedUserForReset.id}
          userEmail={selectedUserForReset.email}
          userName={selectedUserForReset.fullName}
        />
      )}
    </div>
  );
}