"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  User, Briefcase, LogOut, Camera, Pencil, ShieldCheck,
  Building2, BadgeCheck, Sparkles, Phone, Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [userData, setUserData] = useState<any>({
    fullName: "",
    nip: "",
    email: "",
    role: "",
    unitKerja: "",
    joinDate: "01 Agustus 2015",
    avatar: "",
    goals: "",
  });

  const handleLogout = () => {
    // Hapus token dari storage (sesuai implementasi lib/axios Anda)
    localStorage.removeItem('token');
    // Jika menggunakan cookies, hapus juga di sini
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Redirect ke login
    router.push('/login');
  };

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "Laki-laki",
    address: "",
    noWa: "",
    email: "",
    avatar: "",
    agencyName: "",
    companyName: "",
    agentLevel: "",
    goals: "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/me");
        const user = response.data;

        setUserData({
          fullName: user.fullName || "",
          nip: user.nip || "-",
          email: user.email || "",
          role: user.role || "USER",
          unitKerja: user.unitKerja?.namaUnit || "Unit Kerja Tidak Diketahui",
          joinDate: "01 Agustus 2015",
          avatar: user.avatar || "",
          goals: user.goals || "",
        });

        const dob = user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "";

        setFormData({
          fullName: user.fullName || "",
          dateOfBirth: dob,
          gender: user.gender || "Laki-laki",
          address: user.address || "",
          noWa: user.noWa || "",
          email: user.email || "",
          agencyName: user.agencyName || "",
          companyName: user.companyName || "",
          agentLevel: user.agentLevel || "",
          goals: user.goals || "",
          avatar: user.avatar || "",
        });
        setPreviewImage(user.avatar || null);

      } catch (error) {
        console.error("Gagal load profil:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto terlalu besar (Max 2MB)");
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
      await api.patch("/users/me", formData);
      setUserData((prev: any) => ({
        ...prev,
        fullName: formData.fullName,
        avatar: formData.avatar,
        goals: formData.goals
      }));
      setIsEditing(false);
    } catch (error) {
      alert("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white italic text-blue-400">Menyiapkan Workspace...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* Header Profile Section - Blue Gradient */}
      <div className="bg-slate-900 h-80 relative overflow-hidden">
        <Image
          src="/images/orang2.png"
          alt="Header Background"
          fill
          className="object-cover object-center opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#F8FAFC] via-slate-900/60 to-transparent" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Side: Identity Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 p-8 text-center relative">

              {/* Avatar Section */}
              <div className="relative inline-block group mb-6 cursor-pointer" onClick={handleAvatarClick}>
                <div className={cn(
                  "w-36 h-36 rounded-2xl overflow-hidden border-4 transition-all duration-500 shadow-2xl relative",
                  isEditing ? "border-blue-600 rotate-1 scale-105" : "border-white"
                )}>
                  {previewImage ? (
                    <img src={previewImage} alt="Agent Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <User size={64} />
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-blue-700/40 flex items-center justify-center backdrop-blur-[2px]">
                      <Camera className="text-white" />
                    </div>
                  )}
                </div>
                {!isEditing && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-lg shadow-lg border-2 border-white">
                    <BadgeCheck size={18} />
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{formData.fullName || "Pro Agent"}</h2>
              <p className="text-blue-600 font-semibold text-xs uppercase tracking-widest mt-1 mb-6">Tier Subscription</p>

              <div className="space-y-3 pt-6 border-t border-slate-50 text-left">
                <InfoItem icon={<Building2 size={14} />} label="Instansi" value={formData.companyName} />
                <InfoItem icon={<Briefcase size={14} />} label="Jabatan" value={formData.agentLevel} />
              </div>

              {/* Ganti Button logout lama di lg:col-span-4 dengan ini */}
              <div className="mt-8 pt-6 border-t border-slate-50">
                <button
                  onClick={handleLogout}
                  className="group flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-colors",
                      userData.role === "ADMIN" ? "bg-teal-100 text-teal-700" :
                        userData.role === "DIRECTOR" ? "bg-slate-200 text-slate-700" :
                          "bg-blue-100 text-blue-700"
                    )}>
                      {/* Mengambil inisial nama */}
                      {userData.fullName?.split(' ').map((n: any) => n[0]).join('').toUpperCase() || "AG"}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="leading-none group-hover:text-red-600 transition-colors font-bold">Keluar</span>
                      <span className="text-[9px] text-slate-400 font-normal mt-1 uppercase tracking-tighter">
                        {userData.role === "ADMIN" ? "Administrator" : userData.role === "DIRECTOR" ? "Director" : "Agent"}
                      </span>
                    </div>
                  </div>
                  <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Blue Achievement Box */}
            <div className="bg-blue-600 rounded-3xl p-6 text-white overflow-hidden relative group shadow-lg shadow-blue-200">
              <Sparkles className="absolute top-4 right-4 text-blue-300 opacity-40" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100 mb-3">Visi Profesional</p>
              <p className="text-sm leading-relaxed font-medium">
                "{userData.goals || "Tentukan goals profesional Anda..."}"
              </p>
            </div>
          </div>

          {/* Right Side: Professional Details */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-20">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Detail Akun</h3>
                  <p className="text-xs text-slate-400">Kelola informasi kredibilitas profesional Anda.</p>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold shadow-md shadow-blue-100">
                    <Pencil size={14} className="mr-2" /> Edit Profil
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(false)} variant="outline" className="rounded-xl border-slate-200 text-slate-600">Batal</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-slate-900 hover:bg-black text-white rounded-xl px-6 font-bold">
                      {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Nama Lengkap & Gelar" value={formData.fullName} editing={isEditing} onChange={(v) => setFormData({ ...formData, fullName: v })} />
                  <InputGroup label="Level Keagenan" value={formData.agentLevel} editing={isEditing} onChange={(v) => setFormData({ ...formData, agentLevel: v })} />
                  <InputGroup label="Perusahaan" value={formData.companyName} editing={isEditing} onChange={(v) => setFormData({ ...formData, companyName: v })} />
                  <InputGroup label="Kantor Agency" value={formData.agencyName} editing={isEditing} onChange={(v) => setFormData({ ...formData, agencyName: v })} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <Phone size={10} className="text-blue-500" /> WhatsApp Bisnis
                    </label>
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={formData.noWa}
                      onChange={(e) => setFormData({ ...formData, noWa: e.target.value })}
                      className={cn(
                        "w-full px-5 py-3 rounded-xl font-semibold transition-all outline-none border",
                        isEditing ? "bg-white border-blue-200 ring-4 ring-blue-50 shadow-sm" : "bg-slate-50 border-slate-100 text-slate-400"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Tanggal Lahir</label>
                    <input
                      type="date"
                      disabled={!isEditing}
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className={cn(
                        "w-full px-5 py-3 rounded-xl font-semibold transition-all outline-none border",
                        isEditing ? "bg-white border-blue-200 ring-4 ring-blue-50 shadow-sm" : "bg-slate-50 border-slate-100 text-slate-400"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Statement Goals</label>
                  <textarea
                    rows={3}
                    disabled={!isEditing}
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    className={cn(
                      "w-full px-5 py-3 rounded-xl font-semibold transition-all outline-none border resize-none leading-relaxed",
                      isEditing ? "bg-white border-blue-200 ring-4 ring-blue-50 shadow-sm" : "bg-slate-50 border-slate-100 text-slate-400"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-komponen tetap sama secara fungsional, hanya update style
function InfoItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/50 transition-colors">
      <div className="flex items-center gap-3 text-slate-400">
        <span className="text-blue-500">{icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-tight">{label}</span>
      </div>
      <span className="text-xs font-bold text-slate-700">{value || "-"}</span>
    </div>
  );
}

function InputGroup({ label, value, editing, onChange }: { label: string, value: string, editing: boolean, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{label}</label>
      <input
        type="text"
        disabled={!editing}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full px-5 py-3 rounded-xl font-semibold transition-all outline-none border",
          editing ? "bg-white border-blue-200 ring-4 ring-blue-50 shadow-sm focus:border-blue-500" : "bg-slate-50 border-slate-100 text-slate-400"
        )}
      />
    </div>
  );
}