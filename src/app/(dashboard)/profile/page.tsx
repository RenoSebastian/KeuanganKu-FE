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

  // State Data User (Database Fields)
  const [userData, setUserData] = useState<any>({
    fullName: "",
    nip: "",
    email: "",
    role: "",
    unitKerja: "",
    joinDate: "01 Agustus 2015", // Hardcoded sementara
    avatar: "", // Default avatar dari DB
  });

  // State Form Input
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "", // YYYY-MM-DD
    gender: "Laki-laki", // Visual Only
    maritalStatus: "Menikah", // Visual Only
    dependents: 0,
    phone: "0812-3456-7890", // Visual Only
    address: "Jakarta, Indonesia", // Visual Only
    avatar: "", // Base64 string baru (jika ada upload)
  });

  // Backup Data (Untuk fitur Cancel)
  const [backupData, setBackupData] = useState(formData);

  // State Preview Image (Untuk UX instan saat upload)
  const [previewImage, setPreviewImage] = useState<string | null>(null);


  // --- 1. FETCH DATA (GET /users/me) ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/me");
        const user = response.data;

        // Set Data Tampilan Static
        setUserData({
          fullName: user.fullName,
          nip: user.nip,
          email: user.email,
          role: user.role,
          unitKerja: user.unitKerja?.namaUnit || "Unit Kerja Tidak Diketahui",
          joinDate: "01 Agustus 2015",
          avatar: user.avatar || "",
        });

        // Set Data Form Editable
        const dob = user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "";

        const initialForm = {
          fullName: user.fullName,
          dateOfBirth: dob,
          dependents: user.dependentCount || 0,
          gender: "Laki-laki",
          maritalStatus: "Menikah",
          phone: "0812-3456-7890",
          address: "Jakarta, Indonesia",
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
      // Siapkan Payload
      const payload = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        dependentCount: Number(formData.dependents),
        avatar: formData.avatar, // Kirim string base64
      };

      // Tembak API Patch
      await api.patch("/users/me", payload);

      // Update Tampilan Static
      setUserData((prev: any) => ({
        ...prev,
        fullName: formData.fullName,
        avatar: formData.avatar
      }));

      // Update LocalStorage user
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.fullName = formData.fullName;
        // Opsional: simpan avatar di localstorage jika perlu, tapi hati-hati size limit
        // parsed.avatar = formData.avatar; 
        localStorage.setItem("user", JSON.stringify(parsed));
      }

      alert("Data Profil Berhasil Diperbarui!");
      setIsEditing(false);

    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan perubahan.");
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
                      {userData.fullName.charAt(0)}
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
                  {isEditing ? <Pencil className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-slate-800">{userData.fullName}</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">{userData.role} • {userData.nip}</p>

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

            {/* 2. HR Info Card */}
            <div className="bg-white/60 backdrop-blur-md border border-white/60 shadow-sm rounded-3xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-100/50 border-b border-slate-200/50 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Data Kepegawaian
                </h3>
                <ShieldCheck className="w-4 h-4 text-slate-400" />
              </div>
              <div className="divide-y divide-slate-100">
                <InfoRow label="NIP" value={userData.nip} />
                <InfoRow label="Unit Kerja" value={userData.unitKerja} />
                <InfoRow label="Bergabung" value={userData.joinDate} />
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
                {isEditing && <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold animate-pulse border border-blue-200">Mode Edit</span>}
              </div>

              <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] p-5 md:p-8 shadow-sm space-y-5">
                {/* Nama Lengkap */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Nama Lengkap</label>
                  <input
                    disabled={!isEditing}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={cn("w-full px-5 py-3.5 rounded-2xl text-sm font-bold transition-all focus:outline-none", inputStyle)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Tgl Lahir</label>
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

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Gender (Visual)</label>
                    <div className="relative">
                      <select
                        disabled={!isEditing}
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className={cn("w-full px-5 py-3.5 rounded-2xl text-sm font-bold transition-all focus:outline-none appearance-none", inputStyle)}
                      >
                        <option>Laki-laki</option>
                        <option>Perempuan</option>
                      </select>
                      <ChevronRight className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Status (Visual)</label>
                    <div className="relative">
                      <select
                        disabled={!isEditing}
                        value={formData.maritalStatus}
                        onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                        className={cn("w-full px-5 py-3.5 rounded-2xl text-sm font-bold transition-all focus:outline-none appearance-none", inputStyle)}
                      >
                        <option>Lajang</option>
                        <option>Menikah</option>
                        <option>Pernah Menikah</option>
                      </select>
                      <Heart className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Jumlah Tanggungan</label>
                    <input
                      type="number"
                      disabled={!isEditing}
                      value={formData.dependents}
                      onChange={(e) => setFormData({ ...formData, dependents: parseInt(e.target.value) || 0 })}
                      className={cn("w-full px-5 py-3.5 rounded-2xl text-sm font-bold transition-all focus:outline-none", inputStyle)}
                    />
                    <p className="text-[10px] text-slate-400 mt-1 italic">*Mempengaruhi perhitungan pajak & PTKP</p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION B: Kontak & Alamat (VISUAL ONLY) */}
            <section className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600"><Phone className="w-5 h-5" /></div>
                  Kontak & Alamat
                </h3>
              </div>

              <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2rem] p-5 md:p-8 shadow-sm space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Email Pribadi</label>
                  <div className="relative">
                    <input
                      disabled={true} // Email tidak boleh diedit user
                      value={userData.email} // Ambil dari DB
                      className="w-full pl-12 pr-5 py-3.5 rounded-2xl text-sm font-bold bg-slate-100 text-slate-500 cursor-not-allowed"
                    />
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">No. Handphone (Visual)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={cn("w-full pl-12 pr-5 py-3.5 rounded-2xl text-sm font-bold transition-all focus:outline-none", inputStyle)}
                    />
                    <Phone className={cn("w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2", isEditing ? "text-slate-500" : "text-slate-400")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Alamat Domisili (Visual)</label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      disabled={!isEditing}
                      className={cn("w-full px-5 py-3.5 rounded-2xl text-sm font-bold transition-all resize-none focus:outline-none leading-relaxed", inputStyle)}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    <MapPin className={cn("w-5 h-5 absolute right-4 top-4", isEditing ? "text-slate-500" : "text-slate-400")} />
                  </div>
                </div>
              </div>
            </section>

            {/* FLOATING ACTION BUTTONS */}
            <div className={cn(
              "transition-all duration-300",
              "fixed bottom-24 left-5 right-5 z-50 md:static md:mt-8 md:p-0"
            )}>
              {!isEditing ? (
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleStartEdit}
                  className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 shadow-xl shadow-slate-200/50 rounded-2xl h-14 md:h-12 text-sm font-bold backdrop-blur-md"
                >
                  <Pencil className="w-4 h-4 mr-2" /> Ubah Data Profil
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    fullWidth
                    variant="secondary"
                    size="lg"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="bg-white/90 backdrop-blur-md text-red-600 border border-red-100 hover:bg-red-50 rounded-2xl h-14 md:h-12 text-sm font-bold shadow-lg"
                  >
                    <X className="w-5 h-5 mr-2" /> Batal
                  </Button>

                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-300/50 rounded-2xl h-14 md:h-12 text-sm font-bold flex-2"
                  >
                    {isSaving ? "Menyimpan..." : (
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
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
      <span className="text-xs text-slate-500 font-semibold">{label}</span>
      <span className="text-xs text-slate-800 font-bold">{value}</span>
    </div>
  )
}