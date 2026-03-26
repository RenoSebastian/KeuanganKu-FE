"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  User, Briefcase, LogOut, Camera, Pencil, ShieldCheck,
  Building2, BadgeCheck, Sparkles, Phone, Calendar,
  Globe, Zap, CreditCard, Award, ChevronRight, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import Image from "next/image";
import { toast } from "sonner";

// Import hook socket untuk mengaktifkan Observer Pattern
import { useSocket } from "@/providers/socket-provider";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inisialisasi socket instance
  const { socket } = useSocket();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [userData, setUserData] = useState<any>({
    fullName: "",
    nip: "",
    email: "",
    role: "",
    unitKerja: "",
    joinDate: "",
    avatar: "",
    goals: "",
    simulationQuota: 0,
    tier: "FREE",
    isPro: false,
    // [FASE 3] Integrasi properti computed dari Backend
    isUnlimited: false,
    remainingDays: 0,
  });

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "Laki-laki",
    address: "",
    phoneNumber: "", // Tersinkronisasi dengan DTO Backend
    email: "",
    avatar: "",
    agencyName: "",
    companyName: "",
    agentLevel: "",
    goals: "",
    // Menyimpan foreign key state agar tidak ter-drop saat PATCH
    agencyId: "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Refaktor fetchProfile menggunakan useCallback agar bisa dipanggil ulang (Re-fetchable)
  const fetchProfile = useCallback(async (isSilentRefetch = false) => {
    if (!isSilentRefetch) setIsLoading(true);

    try {
      const response = await api.get("/users/me");
      const user = response.data;

      // [FASE 3] Single Source of Truth: Menarik logika in-memory langsung dari BE
      const computed = user.computed || {};
      const isPro = computed.subscription?.isActive ?? (user.subscription?.status === 'ACTIVE');
      const isUnlimited = computed.usageAnalytics?.isUnlimited ?? false;
      const remainingDays = computed.subscription?.remainingDays ?? 0;

      const tierName = isPro ? user.subscription?.plan?.name || "PRO ACCOUNT" : "FREE ACCOUNT";

      setUserData({
        fullName: user.fullName || "",
        nip: user.nip || "-",
        email: user.email || "",
        role: user.role || "USER",
        unitKerja: user.agency?.name || user.agencyName || "Independen",
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : "-",
        avatar: user.avatar || "",
        goals: user.goals || "",
        simulationQuota: user.usage?.simulationQuota || 0,
        tier: tierName,
        isPro: isPro,
        isUnlimited: isUnlimited,
        remainingDays: remainingDays,
      });

      // [FASE 1] Defensive Programming: Validasi Tanggal
      let dob = "";
      if (user.dateOfBirth) {
        const parsedDate = new Date(user.dateOfBirth);
        if (!isNaN(parsedDate.getTime())) {
          dob = parsedDate.toISOString().split('T')[0];
        }
      }

      setFormData({
        fullName: user.fullName || "",
        dateOfBirth: dob,
        gender: user.gender || "Laki-laki",
        address: user.address || "",
        phoneNumber: user.phoneNumber || "",
        email: user.email || "",
        agencyName: user.agencyName || "",
        companyName: user.companyName || "",
        agentLevel: user.agentLevel || "",
        goals: user.goals || "",
        avatar: user.avatar || "",
        agencyId: user.agencyId || "",
      });
      setPreviewImage(user.avatar || null);

    } catch (error) {
      toast.error("Gagal memuat profil");
    } finally {
      if (!isSilentRefetch) setIsLoading(false);
    }
  }, []);

  // Initial Fetch pada saat komponen dimuat
  useEffect(() => {
    fetchProfile(false);
  }, [fetchProfile]);

  // Observer Listener: Melakukan background re-fetch saat ada mutasi eksternal
  useEffect(() => {
    if (!socket) return;

    const handleProfileMutated = () => {
      // Memanggil API ulang secara diam-diam tanpa memicu layar loading penuh
      fetchProfile(true);
    };

    socket.on('USER_PROFILE_MUTATED', handleProfileMutated);

    return () => {
      // Cleanup memory leak
      socket.off('USER_PROFILE_MUTATED', handleProfileMutated);
    };
  }, [socket, fetchProfile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/login');
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran foto terlalu besar (Max 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        setFormData((prev) => ({ ...prev, avatar: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // [SECURITY LAYER] Immutability Constraint
      // Destructure 'email' untuk memastikan payload update tidak membawa kredensial
      const { email, ...safeFormData } = formData;

      // Sanitasi Payload Pre-flight
      const payloadToSubmit = {
        ...safeFormData,
        fullName: safeFormData.fullName.trim(),
        phoneNumber: safeFormData.phoneNumber.trim(),
        goals: safeFormData.goals.trim(),
        companyName: safeFormData.companyName.trim(),
        agencyName: safeFormData.agencyName.trim(),
        agentLevel: safeFormData.agentLevel.trim(),
      };

      await api.patch("/users/me", payloadToSubmit);

      // Single Source of Truth Synchronization
      await fetchProfile(true);

      setIsEditing(false);
      toast.success("Profil berhasil diperbarui");
    } catch (error: any) {
      console.error("❌ Profile Update Error:", error);
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="italic text-slate-500 font-medium">Sinkronisasi Data Profil...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-24 font-sans selection:bg-blue-100">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* Hero Header */}
      <div className="bg-slate-950 h-72 md:h-80 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <Image
          src="/images/orang2.png"
          alt="Header Background"
          fill
          className="object-cover object-top opacity-50 transition-opacity duration-700"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#F1F5F9] via-slate-950/40 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-36 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

          {/* LEFT COLUMN: IDENTITY & USAGE */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white p-8 text-center relative">

              {/* Avatar Section */}
              <div className="relative inline-block mb-6 group" onClick={handleAvatarClick}>
                <div className={cn(
                  "w-40 h-40 rounded-[2.5rem] overflow-hidden border-[6px] transition-all duration-700 shadow-2xl relative z-10",
                  isEditing ? "border-blue-600 rotate-2 scale-105" : "border-white rotate-0"
                )}>
                  {previewImage ? (
                    <img src={previewImage} alt="Agent Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <User size={64} />
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-blue-900/60 flex flex-col items-center justify-center backdrop-blur-[2px] text-white animate-in fade-in duration-300">
                      <Camera size={28} className="mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Ubah Foto</span>
                    </div>
                  )}
                </div>
                <div className="absolute -inset-2 bg-blue-100 rounded-[2.8rem] blur-xl opacity-50"></div>
                {!isEditing && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-2xl shadow-xl border-4 border-white z-20">
                    <BadgeCheck size={20} />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {formData.fullName || "Professional Agent"}
                </h2>
              </div>

              {/* Company Info */}
              <div className="grid grid-cols-2 gap-3 mt-8 pt-8 border-t border-slate-50">
                <div className="bg-slate-50 p-4 rounded-3xl text-left border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Perusahaan</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{formData.companyName || "-"}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl text-left border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Jabatan</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{formData.agentLevel || "-"}</p>
                </div>
              </div>
            </div>

            {/* SUBSCRIPTION & LIMIT CARD */}
            <div className={cn(
              "rounded-[2.5rem] p-8 text-white overflow-hidden relative group shadow-2xl transition-all duration-500",
              userData.isPro
                ? "bg-linear-to-br from-purple-700 to-indigo-900 shadow-purple-200"
                : "bg-linear-to-br from-slate-800 to-slate-950 shadow-slate-200"
            )}>
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Zap size={100} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
                    <CreditCard size={20} className="text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                    Membership Info
                  </span>
                </div>

                <div className="space-y-1 mb-6">
                  <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Tipe Akun</p>
                  <h4 className="text-2xl font-black tracking-tighter flex items-center gap-2">
                    {userData.tier}
                    {userData.isPro && <Sparkles size={20} className="text-yellow-400 animate-pulse" />}
                  </h4>
                  {/* Dynamic Frontend Render: Sisa hari langganan dikonsumsi langsung dari state */}
                  {userData.isPro && userData.remainingDays > 0 && (
                    <p className="text-[10px] text-white/80 font-bold tracking-widest">
                      SISA MASA AKTIF: <span className="text-yellow-400">{userData.remainingDays} HARI</span>
                    </p>
                  )}
                </div>

                <div className="bg-white/10 rounded-3xl p-5 backdrop-blur-xs border border-white/10">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Sisa Kuota Simulasi</p>
                      <p className="text-3xl font-black tracking-tighter">
                        {userData.isUnlimited ? "UNLIMITED" : `${userData.simulationQuota} Token`}
                      </p>
                    </div>
                    {!userData.isPro && (
                      <Button
                        size="sm"
                        onClick={() => router.push('/pricing')}
                        className="bg-white text-slate-900 hover:bg-yellow-400 font-black text-[10px] rounded-xl h-8 px-4"
                      >
                        UPGRADE
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Vision Statement Box */}
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200">
              <div className="relative z-10">
                <div className="bg-white/20 w-fit p-2 rounded-xl backdrop-blur-md mb-4">
                  <Globe size={16} className="text-blue-100" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/80 mb-3">Pesan Visi</p>
                <p className="text-sm leading-relaxed font-bold tracking-tight italic">
                  "{userData.goals || "Tentukan goals profesional Anda di menu edit profil..."}"
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-between w-full p-4 bg-white border border-slate-200 rounded-[1.8rem] hover:bg-red-50 hover:border-red-100 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <LogOut size={18} className="text-slate-400 group-hover:text-red-600" />
                </div>
                <span className="text-sm font-black text-slate-700 group-hover:text-red-600 uppercase tracking-tight">Keluar Aplikasi</span>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-red-400" />
            </button>
          </div>

          {/* RIGHT COLUMN: PROFESSIONAL DETAILS */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white overflow-hidden">
              <div className="px-8 md:px-10 py-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Informasi Kredibilitas <ShieldCheck className="text-blue-500 w-5 h-5" />
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Data ini akan tampil pada laporan klien</p>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 h-12 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 transition-all active:scale-95">
                    <Pencil size={14} className="mr-2" /> Edit Profil
                  </Button>
                ) : (
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button onClick={() => {
                      setIsEditing(false);
                      fetchProfile(true); // Re-sync untuk membatalkan un-saved changes
                    }} variant="outline" className="flex-1 md:flex-none rounded-2xl border-slate-200 text-slate-600 font-bold h-12 transition-all">Batal</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none bg-slate-950 hover:bg-black text-white rounded-2xl px-8 h-12 font-black shadow-xl transition-all">
                      {isSaving ? "Sinkronisasi..." : "Simpan"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Form Section */}
              <div className="p-8 md:p-10 space-y-10">

                {/* [NEW] CREDENTIAL LOCK: Bagian Email Immutability UX */}
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-slate-200/50 rounded-full blur-xl -mr-10 -mt-10"></div>
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                        <Lock size={12} className="text-slate-400" /> Email Identitas Login
                      </label>
                      <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Terkunci</span>
                    </div>
                    <input
                      type="text"
                      disabled={true} // Constraint Immutability Absolut
                      value={formData.email}
                      className="w-full px-6 py-4 rounded-[1.2rem] font-bold outline-none border border-slate-200 bg-slate-200/50 text-slate-400 cursor-not-allowed select-none"
                    />
                    <p className="text-[10px] text-slate-400 font-medium italic mt-2">
                      *Email digunakan sebagai pengenal utama (*identifier*) dan tidak dapat diubah demi alasan keamanan transaksi asuransi.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputGroup label="Nama Lengkap & Gelar" value={formData.fullName} editing={isEditing} icon={<User size={14} />} onChange={(v) => setFormData({ ...formData, fullName: v })} />
                  <InputGroup label="Level Keagenan" value={formData.agentLevel} editing={isEditing} icon={<Award size={14} />} onChange={(v) => setFormData({ ...formData, agentLevel: v })} />
                  <InputGroup label="Perusahaan" value={formData.companyName} editing={isEditing} icon={<Building2 size={14} />} onChange={(v) => setFormData({ ...formData, companyName: v })} />
                  <InputGroup label="Kantor Agency" value={formData.agencyName} editing={isEditing} icon={<Briefcase size={14} />} onChange={(v) => setFormData({ ...formData, agencyName: v })} />
                </div>

                <div className="h-px bg-slate-50 w-full"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                      <Phone size={12} className="text-blue-500" /> WhatsApp Bisnis
                    </label>
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={formData.phoneNumber}
                      placeholder="62812..."
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className={cn(
                        "w-full px-6 py-4 rounded-[1.2rem] font-bold transition-all outline-none border text-slate-700",
                        isEditing ? "bg-white border-blue-200 ring-4 ring-blue-50 focus:border-blue-500" : "bg-slate-50 border-slate-100"
                      )}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                      <Calendar size={12} className="text-blue-500" /> Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      disabled={!isEditing}
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className={cn(
                        "w-full px-6 py-4 rounded-[1.2rem] font-bold transition-all outline-none border text-slate-700",
                        isEditing ? "bg-white border-blue-200 ring-4 ring-blue-50 focus:border-blue-500" : "bg-slate-50 border-slate-100"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Pesan Visi Profesional</label>
                  <textarea
                    rows={3}
                    disabled={!isEditing}
                    value={formData.goals}
                    placeholder="Contoh: Membantu 100 keluarga mencapai kebebasan finansial di tahun 2024."
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    className={cn(
                      "w-full px-6 py-4 rounded-[1.5rem] font-bold transition-all outline-none border resize-none leading-relaxed text-slate-700",
                      isEditing ? "bg-white border-blue-200 ring-4 ring-blue-50 focus:border-blue-500" : "bg-slate-50 border-slate-100"
                    )}
                  />
                  <p className="text-[10px] text-slate-400 font-medium italic">*Visi ini akan muncul sebagai quote pembuka di setiap PDF laporan kesehatan keuangan klien.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Improved Sub-components
function InputGroup({ label, value, editing, icon, onChange }: { label: string, value: string, editing: boolean, icon: any, onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
        <span className="text-blue-500">{icon}</span> {label}
      </label>
      <input
        type="text"
        disabled={!editing}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full px-6 py-4 rounded-[1.2rem] font-bold transition-all outline-none border text-slate-700",
          editing ? "bg-white border-blue-200 ring-4 ring-blue-50 shadow-sm focus:border-blue-500" : "bg-slate-50 border-slate-100"
        )}
      />
    </div>
  );
}