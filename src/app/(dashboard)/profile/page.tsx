"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  User, Calendar, Briefcase, LogOut, Save, Mail,
  Phone, MapPin, Heart, ChevronRight, Camera, Pencil, X, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios"; // Import Helper Axios

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Loading & Edit
  const [isLoading, setIsLoading] = useState(true); // Loading awal fetch data
  const [isSaving, setIsSaving] = useState(false);  // Loading saat simpan
  const [isEditing, setIsEditing] = useState(false);

  // State Data User (Display Only / Static Info)
  const [userData, setUserData] = useState<any>({
    fullName: "",
    nip: "",
    email: "",
    role: "",
    unitKerja: "",
    joinDate: "01 Agustus 2015", // Hardcoded sesuai template awal
    avatar: "",
  });

  // State Form Input (Editable Fields)
  // Menghapus dependents dan maritalStatus sesuai list permintaan
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "Laki-laki",
    address: "",
    noWa: "",         // Nomor WhatsApp
    email: "",        // Email Pribadi
    avatar: "",       // Base64 string foto diri
    agencyName: "",   // Nama Perusahaan Asuransi
    agentLevel: "",   // Jabatan/Level Agen
  });

  // Backup Data (Untuk fitur Cancel)
  const [backupData, setBackupData] = useState(formData);

  // State Preview Image (Untuk UX instan saat upload)
  const [previewImage, setPreviewImage] = useState<string | null>(null);


  // --- 1. FETCH DATA (GET /users/me) ---
  // --- 1. FETCH DATA (GET /users/me) ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/me");
        const user = response.data;

        // Set Data Tampilan Static (Informasi Akun/Kepegawaian)
        setUserData({
          fullName: user.fullName || "",
          nip: user.nip || "-",
          email: user.email || "",
          role: user.role || "USER",
          unitKerja: user.unitKerja?.namaUnit || "Unit Kerja Tidak Diketahui",
          joinDate: "01 Agustus 2015", // Hardcoded sesuai template awal
          avatar: user.avatar || "",
        });

        // Format Tanggal Lahir untuk input type="date" (YYYY-MM-DD)
        const dob = user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "";

        // Set Data Form Editable (Sesuai List Field yang Diinginkan)
        const initialForm = {
          fullName: user.fullName || "",
          dateOfBirth: dob,
          gender: user.gender || "Laki-laki",
          address: user.address || "",
          noWa: user.noWa || "",           // Mapping Field Baru
          email: user.email || "",         // Mapping Field Baru
          agencyName: user.agencyName || "", // Mapping Field Baru
          agentLevel: user.agentLevel || "", // Mapping Field Baru
          avatar: user.avatar || "",
        };

        setFormData(initialForm);
        setBackupData(initialForm);
        setPreviewImage(user.avatar || null);

      } catch (error) {
        console.error("Gagal load profil:", error);
        alert("Gagal memuat data profil. Silakan login ulang.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // --- 2. HANDLERS IMAGE PICKER ---
  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
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
        setPreviewImage(base64String); // Update UI langsung
        setFormData((prev) => ({ ...prev, avatar: base64String })); // Simpan ke state form
      };
      reader.readAsDataURL(file);
    }
  };

  // --- 3. HANDLERS EDIT FORM ---
  const handleStartEdit = () => {
    setBackupData(formData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(backupData);
    setPreviewImage(userData.avatar || null); // Reset preview ke gambar lama
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Siapkan Payload sesuai dengan list field yang diinginkan
      // Field yang tidak ada di list (seperti dependentCount) dihilangkan
      const payload = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        noWa: formData.noWa,           // Field Baru (WhatsApp)
        agencyName: formData.agencyName, // Field Baru (Perusahaan)
        agentLevel: formData.agentLevel, // Field Baru (Jabatan)
        avatar: formData.avatar,       // Base64 String
      };

      // 2. Eksekusi API Patch (Menggunakan service agar alur program standar)
      // Jika Anda ingin tetap menggunakan 'api.patch', kodenya tetap sama
      await api.patch("/users/me", payload);

      // 3. Update Tampilan Static (Data yang ditampilkan di Card kiri)
      setUserData((prev: any) => ({
        ...prev,
        fullName: formData.fullName,
        avatar: formData.avatar,
        // Update field lain jika ditampilkan secara statis di UI
      }));

      // 4. Sinkronisasi LocalStorage (Sangat penting untuk integritas data aplikasi)
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);

        // Update informasi dasar yang sering digunakan komponen lain
        parsed.fullName = formData.fullName;
        parsed.avatar = formData.avatar;

        // Simpan field baru ke storage jika diperlukan oleh modul lain
        parsed.noWa = formData.noWa;
        parsed.agencyName = formData.agencyName;
        parsed.agentLevel = formData.agentLevel;

        localStorage.setItem("user", JSON.stringify(parsed));
      }

      alert("Profil berhasil diperbarui!");
      setIsEditing(false);

    } catch (error) {
      console.error("Save error details:", error);
      alert("Gagal menyimpan perubahan. Silakan periksa koneksi Anda.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  // Helper styles
  const inputStyle = isEditing
    ? "bg-white border-blue-300 ring-2 ring-blue-100 shadow-sm"
    : "bg-slate-50 border-transparent text-slate-600 cursor-not-allowed opacity-90";

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Memuat Profil...</div>;
  }

  return (
    <div className="relative w-full bg-slate-50/50 pb-36 md:pb-12 pt-4 md:pt-0">

      {/* Background Decorations */}
      <div className="hidden md:block absolute top-0 left-0 w-150 h-150 bg-blue-100/40 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="hidden md:block absolute bottom-0 right-0 w-125 h-125 bg-purple-100/40 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10 md:pt-12">

        {/* LAYOUT GRID */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">

          {/* === KOLOM KIRI: PROFILE CARD & HR INFO === */}
          <div className="w-full md:w-1/3 flex flex-col gap-6 md:sticky md:top-24">

            {/* 1. Avatar Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg rounded-[2rem] p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 w-full h-32 bg-linear-to-b from-blue-50 to-transparent -z-10" />

              <div className="relative group mb-4" onClick={handleAvatarClick}>
                <div className={cn(
                  "w-28 h-28 md:w-32 md:h-32 rounded-full border-4 shadow-xl overflow-hidden relative transition-all duration-300",
                  isEditing ? "border-blue-400 scale-105 cursor-pointer" : "border-white bg-slate-200"
                )}>
                  {previewImage ? (
                    <img src={previewImage} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-4xl md:text-5xl text-white font-bold uppercase">
                      {formData.fullName ? formData.fullName.charAt(0) : <User />}
                    </div>
                  )}

                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-in fade-in group-hover:bg-black/50 transition-colors">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                {/* Hidden Input File */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />

                {/* Mode Badge */}
                <div className={cn(
                  "absolute bottom-1 right-1 p-2 rounded-full border-2 border-white shadow-sm transition-colors",
                  isEditing ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {isEditing ? <Pencil className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-slate-800 wrap-break-word w-full">
                {formData.fullName || "User Name"}
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1">
                <Mail className="w-3 h-3" /> {userData.email}
              </p>

              {isEditing && (
                <p className="text-[10px] text-blue-500 mt-2 font-semibold animate-pulse">Klik foto untuk mengganti</p>
              )}

              {!isEditing && (
                <button
                  onClick={handleLogout}
                  className="mt-6 text-xs font-bold text-red-500 flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-full transition-colors border border-transparent hover:border-red-100"
                >
                  <LogOut className="w-4 h-4" /> Keluar Aplikasi
                </button>
              )}
            </div>

            {/* 2. Agen Info Card (HR Info Refactored) */}
            <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-3xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-100/50 border-b border-slate-200/50 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Informasi Agen
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                <InfoRow
                  label="Perusahaan"
                  value={formData.agencyName || "-"}
                />
                <InfoRow
                  label="Level/Jabatan"
                  value={formData.agentLevel || "-"}
                />
                <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <svg className="w-3 h-3 fill-green-500" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </span>
                  <span className="text-xs text-slate-800 font-bold">{formData.noWa || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* === KOLOM KANAN: EDITABLE FORMS === */}
          <div className="w-full md:w-2/3 space-y-6">

            {/* SECTION A: Identitas Diri */}
            <section className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><User className="w-5 h-5" /></div>
                  Identitas Diri
                </h3>
                {isEditing && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold animate-pulse border border-blue-200">
                    Mode Edit Aktif
                  </span>
                )}
              </div>

              <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] p-5 md:p-8 shadow-sm space-y-5">
                {/* Nama Lengkap */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Nama Lengkap</label>
                  <input
                    disabled={!isEditing}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Masukkan nama lengkap Anda"
                    className={cn("w-full px-5 py-3.5 rounded-2xl text-sm font-bold transition-all focus:outline-none", inputStyle)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Tanggal Lahir */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Tanggal Lahir</label>
                    <div className="relative">
                      <input
                        type="date"
                        disabled={!isEditing}
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className={cn("w-full px-5 py-3.5 rounded-2xl text-sm font-bold transition-all focus:outline-none", inputStyle)}
                      />
                      <Calendar className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Jenis Kelamin */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Jenis Kelamin</label>
                    <div className="relative">
                      <select
                        disabled={!isEditing}
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className={cn("w-full px-5 py-3.5 rounded-2xl text-sm font-bold transition-all focus:outline-none appearance-none", inputStyle)}
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                      <ChevronRight className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION B: Informasi Keagenan & Kontak */}
            <section className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600"><Briefcase className="w-5 h-5" /></div>
                  Informasi Keagenan & Kontak
                </h3>
              </div>

              <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] p-5 md:p-8 shadow-sm space-y-5">

                {/* Email - Read Only (Identitas Akun) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Email (Akun)</label>
                  <div className="relative">
                    <input
                      disabled={true}
                      value={userData.email}
                      className="w-full pl-12 pr-5 py-3.5 rounded-2xl text-sm font-bold bg-slate-100 text-slate-400 cursor-not-allowed border-transparent"
                    />
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Nama Perusahaan Asuransi */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Perusahaan Asuransi</label>
                    <input
                      disabled={!isEditing}
                      value={formData.agencyName}
                      onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                      placeholder="Contoh: PT Prudential"
                      className={cn("w-full px-5 py-3.5 rounded-2xl text-sm font-bold transition-all focus:outline-none", inputStyle)}
                    />
                  </div>

                  {/* Jabatan/Level Agen */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Jabatan / Level</label>
                    <div className="relative">
                      <select
                        disabled={!isEditing}
                        value={formData.agentLevel}
                        onChange={(e) => setFormData({ ...formData, agentLevel: e.target.value })}
                        className={cn("w-full px-5 py-3.5 rounded-2xl text-sm font-bold transition-all focus:outline-none appearance-none", inputStyle)}
                      >
                        <option value="">Pilih Level</option>
                        <option value="Agent">Agent</option>
                        <option value="Senior Agent">Senior Agent</option>
                        <option value="Associate Unit Manager">Associate Unit Manager</option>
                        <option value="Unit Manager">Unit Manager</option>
                        <option value="Agency Manager">Agency Manager</option>
                      </select>
                      <ChevronRight className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* WhatsApp dengan Logo */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider flex items-center gap-1">
                    Nomor WhatsApp
                    <svg className="w-3.5 h-3.5 fill-green-500" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={formData.noWa}
                      onChange={(e) => setFormData({ ...formData, noWa: e.target.value })}
                      placeholder="Contoh: 08123456789"
                      className={cn("w-full pl-12 pr-5 py-3.5 rounded-2xl text-sm font-bold transition-all focus:outline-none", inputStyle)}
                    />
                    <Phone className={cn("w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2", isEditing ? "text-slate-500" : "text-slate-400")} />
                  </div>
                </div>

                {/* Alamat Domisili */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Alamat Domisili</label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      disabled={!isEditing}
                      className={cn("w-full px-5 py-3.5 rounded-2xl text-sm font-bold transition-all resize-none focus:outline-none leading-relaxed", inputStyle)}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Masukkan alamat lengkap Anda saat ini"
                    />
                    <MapPin className={cn("w-5 h-5 absolute right-4 top-4", isEditing ? "text-slate-500" : "text-slate-400")} />
                  </div>
                </div>
              </div>
            </section>
          </div>
          {/* FLOATING ACTION BUTTONS */}
          <div className={cn(
            "transition-all duration-300",
            "fixed bottom-24 left-5 right-5 z-50 md:static md:mt-10 md:p-0"
          )}>
            {!isEditing ? (
              <Button
                w-full
                variant="outline"
                size="lg"
                onClick={handleStartEdit}
                className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 shadow-xl shadow-slate-200/50 rounded-2xl h-14 md:h-12 text-sm font-bold backdrop-blur-md transition-all active:scale-95"
              >
                <Pencil className="w-4 h-4 mr-2" /> Ubah Data Profil
              </Button>
            ) : (
              <div className="flex gap-3 animate-in fade-in zoom-in-95 duration-300">
                <Button
                  w-full
                  variant="secondary"
                  size="lg"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="bg-white/90 backdrop-blur-md text-red-600 border border-red-100 hover:bg-red-50 rounded-2xl h-14 md:h-12 text-sm font-bold shadow-lg"
                >
                  <X className="w-5 h-5 mr-2" /> Batal
                </Button>

                <Button
                  w-full
                  variant="default"
                  size="lg"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-300/50 rounded-2xl h-14 md:h-12 text-sm font-bold flex-2 transition-all active:scale-95"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Menyimpan...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-5 h-5" /> Simpan Perubahan
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/**
 * InfoRow Component
 * Digunakan untuk menampilkan data statis di Kolom Kiri (Profile Card)
 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors group">
      <span className="text-xs text-slate-500 font-semibold group-hover:text-slate-600 transition-colors">
        {label}
      </span>
      <span className="text-xs text-slate-800 font-bold break-all ml-4 text-right uppercase tracking-tight">
        {value}
      </span>
    </div>
  );
}