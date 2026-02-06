"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  User, Calendar, Briefcase, LogOut, Save, Mail,
  Phone, MapPin, Heart, ChevronRight, Camera, Pencil, X, ShieldCheck,
  Target, Building2, BadgeCheck, Sparkles
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

  const [backupData, setBackupData] = useState(formData);
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

        const initialForm = {
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
        };

        setFormData(initialForm);
        setBackupData(initialForm);
        setPreviewImage(user.avatar || null);

      } catch (error) {
        console.error("Gagal load profil:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarClick = () => isEditing && fileInputRef.current?.click();

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
      setUserData((prev: any) => ({ ...prev, fullName: formData.fullName, avatar: formData.avatar, goals: formData.goals }));
      alert("Profil profesional berhasil diperbarui!");
      setIsEditing(false);
    } catch (error) {
      alert("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = isEditing
    ? "bg-white border-orange-200 ring-4 ring-orange-50 shadow-sm focus:border-orange-500"
    : "bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed";

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white italic text-slate-400">Menyiapkan Workspace...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans">
      {/* Header Profile Section */}
      <div className="bg-slate-900 h-80 relative overflow-hidden"> {/* Tinggi ditambah dari h-64 ke h-80 agar ruang gambar lebih luas */}
        {/* Menggunakan Gambar orang2.png dengan penyesuaian posisi */}
        <Image
          src="/images/orang2.png"
          alt="Header Background"
          fill
          className="object-cover object-middle opacity-70" // Menggunakan object-bottom agar fokus ke bagian bawah gambar
          priority
        />

        {/* Overlay Gradient yang lebih halus agar transisi ke kartu profil tetap clean */}
        <div className="absolute inset-0 bg-linear-to-t from-[#FDFDFD] via-slate-900/40 to-transparent" />

        {/* Aksen warna branding tetap dipertahankan */}
        <div className="absolute inset-0 bg-orange-600/5 mix-blend-overlay" />

        {/* Efek Blur Dekoratif diturunkan intensitasnya agar tidak menutupi gambar orang */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Side: Identity Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 text-center relative">
              <div className="relative inline-block group mb-6" onClick={handleAvatarClick}>
                <div className={cn(
                  "w-36 h-36 rounded-2xl overflow-hidden border-4 transition-all duration-500 shadow-2xl relative",
                  isEditing ? "border-orange-500 rotate-2 scale-105 cursor-pointer" : "border-white"
                )}>
                  {previewImage ? (
                    <img src={previewImage} alt="Agent Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <User size={64} />
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-orange-600/40 flex items-center justify-center">
                      <Camera className="text-white" />
                    </div>
                  )}
                </div>
                {!isEditing && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-lg shadow-lg">
                    <BadgeCheck size={18} />
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{formData.fullName || "Pro Agent"}</h2>
              <p className="text-orange-600 font-bold text-xs uppercase tracking-widest mt-1 mb-6">Verified Financial Consultant</p>

              <div className="space-y-3 pt-6 border-t border-slate-50">
                <InfoItem icon={<Building2 size={14} />} label="Company" value={formData.companyName} />
                <InfoItem icon={<Briefcase size={14} />} label="Level" value={formData.agentLevel} />
              </div>

              <Button
                onClick={() => isEditing ? setIsEditing(false) : router.push('/login')}
                variant="ghost"
                className="mt-8 text-red-500 hover:bg-red-50 hover:text-red-600 w-full rounded-xl"
              >
                <LogOut size={16} className="mr-2" /> Logout Workspace
              </Button>
            </div>

            {/* Achievement/Goals Preview */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative group">
              <Sparkles className="absolute top-4 right-4 text-orange-400 opacity-30 group-hover:rotate-12 transition-transform" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 mb-3">Professional Goals</p>
              <p className="text-sm leading-relaxed italic opacity-90">
                {userData.goals || "Tentukan goals profesional Anda di mode edit..."}
              </p>
            </div>
          </div>

          {/* Right Side: Professional Details */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-20">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Workspace Profile</h3>
                  <p className="text-xs text-slate-400">Lengkapi data untuk meningkatkan kredibilitas di depan klien.</p>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-orange-600 hover:bg-orange-700 rounded-xl px-6 font-bold shadow-lg shadow-orange-200">
                    <Pencil size={14} className="mr-2" /> Edit Profil
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(false)} variant="outline" className="rounded-xl border-slate-200">Batal</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-slate-900 hover:bg-black rounded-xl px-6 font-bold">
                      {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-8 space-y-8">
                {/* Section: Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Nama Lengkap & Gelar" value={formData.fullName} editing={isEditing} onChange={(v) => setFormData({ ...formData, fullName: v })} />
                  <InputGroup label="Jabatan / Level" value={formData.agentLevel} editing={isEditing} onChange={(v) => setFormData({ ...formData, agentLevel: v })} />
                  <InputGroup label="Nama Perusahaan Induk" value={formData.companyName} editing={isEditing} onChange={(v) => setFormData({ ...formData, companyName: v })} />
                  <InputGroup label="Group Agency" value={formData.agencyName} editing={isEditing} onChange={(v) => setFormData({ ...formData, agencyName: v })} />
                </div>

                {/* Row untuk WhatsApp dan Tanggal Lahir */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Input WhatsApp dengan Icon WhatsApp agar lebih profesional */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <svg className="w-3 h-3 fill-green-500" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      Nomor WhatsApp Bisnis
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        disabled={!isEditing}
                        value={formData.noWa}
                        onChange={(e) => setFormData({ ...formData, noWa: e.target.value })}
                        placeholder="Contoh: 08123456789"
                        className={cn(
                          "w-full pl-12 pr-5 py-3 rounded-xl font-bold transition-all outline-none border",
                          isEditing ? "bg-white border-orange-200 ring-4 ring-orange-50 shadow-sm" : "bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed"
                        )}
                      />
                      <Phone className={cn("w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2", isEditing ? "text-orange-500" : "text-slate-400")} />
                    </div>
                  </div>

                  {/* Input Tanggal Lahir */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tanggal Lahir</label>
                    <div className="relative">
                      <input
                        type="date"
                        disabled={!isEditing}
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className={cn(
                          "w-full px-5 py-3 rounded-xl font-bold transition-all outline-none border",
                          isEditing ? "bg-white border-orange-200 ring-4 ring-orange-50 shadow-sm" : "bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed"
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tujuan Profesional (Vision Statement)</label>
                  <textarea
                    rows={3}
                    disabled={!isEditing}
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    placeholder="Contoh: Membantu 100 keluarga mencapai kebebasan finansial melalui edukasi risiko yang logis."
                    className={cn("w-full px-5 py-3 rounded-xl font-bold transition-all outline-none border resize-none leading-relaxed", inputStyle)}
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

function InfoItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between text-left p-3 rounded-xl hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3 text-slate-400">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-tight">{label}</span>
      </div>
      <span className="text-xs font-black text-slate-700">{value || "-"}</span>
    </div>
  );
}

function InputGroup({ label, value, editing, onChange }: { label: string, value: string, editing: boolean, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{label}</label>
      <input
        type="text"
        disabled={!editing}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full px-5 py-3 rounded-xl font-bold transition-all outline-none border",
          editing ? "bg-white border-orange-200 ring-4 ring-orange-50" : "bg-slate-50 border-slate-100 text-slate-500"
        )}
      />
    </div>
  );
}