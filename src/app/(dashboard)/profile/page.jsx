"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { USER_PROFILE } from "@/lib/dummy-data";
import { 
  User, Calendar, Briefcase, LogOut, Save, Mail, 
  Phone, MapPin, Heart, ChevronRight, Camera, Pencil, X
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Default: Tidak bisa diedit
  
  // State Form
  const [formData, setFormData] = useState({
    fullName: USER_PROFILE.name,
    email: "budi.santoso@pamjaya.co.id",
    phone: "0812-3456-7890",
    address: "Jl. Penjernihan 1 No. 20, Jakarta Pusat",
    birthDate: "1990-05-15",
    gender: "Laki-laki",
    maritalStatus: "Menikah",
    dependents: 2,
  });

  // Backup data untuk fitur "Batal"
  const [backupData, setBackupData] = useState(formData);

  const handleStartEdit = () => {
    setBackupData(formData); // Simpan kondisi terakhir
    setIsEditing(true);      // Aktifkan mode edit
  };

  const handleCancel = () => {
    setFormData(backupData); // Kembalikan data ke awal
    setIsEditing(false);     // Matikan mode edit
  };

  const handleSave = () => {
    setIsLoading(true);
    // Simulasi Save ke Backend
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false); // Kembali ke mode read-only setelah simpan
      alert("Data Profil Berhasil Diperbarui!");
    }, 1500);
  };

  // Helper class untuk input yang disabled vs active
  const inputStyle = isEditing 
    ? "bg-white border-blue-300 ring-2 ring-blue-100" // Mode Edit: Terang & Fokus
    : "bg-slate-100/50 border-transparent text-slate-600 cursor-not-allowed opacity-80"; // Mode View: Abu & Mati

  return (
    <div className="px-5 pt-4 pb-10 min-h-full font-sans">
      
      {/* 1. HEADER PROFILE (Avatar) */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative group">
           {/* Avatar Circle */}
           <div className={cn(
             "w-28 h-28 rounded-full border-4 shadow-xl overflow-hidden relative transition-all duration-300",
             isEditing ? "border-blue-400 scale-105" : "border-white bg-slate-200"
           )}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-4xl text-white font-bold">
                {formData.fullName.charAt(0)}
              </div>
              
              {/* Overlay Edit Kamera (Hanya muncul saat Mode Edit) */}
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-in fade-in cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              )}
           </div>
           
           {/* Badge Status Mode */}
           <div className={cn(
             "absolute bottom-1 right-1 p-2 rounded-full border-2 border-white shadow-sm transition-colors",
             isEditing ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"
           )}>
             {isEditing ? <Pencil className="w-4 h-4" /> : <User className="w-4 h-4" />}
           </div>
        </div>
        
        <div className="text-center mt-3">
           <h2 className="text-xl font-bold text-slate-800">{formData.fullName}</h2>
           <p className="text-sm text-slate-500">{USER_PROFILE.role} • {USER_PROFILE.nip}</p>
        </div>
      </div>

      {/* 2. FORM DATA (Kondisional ReadOnly) */}
      <div className="space-y-6">
        
        {/* SECTION A: Identitas Diri */}
        <section className="animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" /> Identitas Diri
              </h3>
              {isEditing && <span className="text-[10px] text-blue-600 font-semibold animate-pulse">Mode Edit Aktif</span>}
           </div>
           
           <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-sm space-y-4">
              
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 ml-1">Nama Lengkap</label>
                <input 
                   disabled={!isEditing}
                   value={formData.fullName}
                   onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                   className={cn("w-full px-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none", inputStyle)}
                />
              </div>

              {/* Grid: Tgl Lahir & Gender */}
              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Tgl Lahir</label>
                    <input 
                      type="date" 
                      disabled={!isEditing}
                      value={formData.birthDate}
                      onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                      className={cn("w-full px-3 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none", inputStyle)}
                    />
                 </div>
                 
                 <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Gender</label>
                    <div className="relative">
                      <select 
                        disabled={!isEditing}
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className={cn("w-full px-3 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none appearance-none", inputStyle)}
                      >
                        <option>Laki-laki</option>
                        <option>Perempuan</option>
                      </select>
                      {isEditing && <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />}
                    </div>
                 </div>
              </div>

              {/* Grid: Status & Tanggungan */}
              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Status</label>
                    <div className="relative">
                      <select 
                        disabled={!isEditing}
                        value={formData.maritalStatus}
                        onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}
                        className={cn("w-full px-3 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none appearance-none", inputStyle)}
                      >
                        <option>Lajang</option>
                        <option>Menikah</option>
                        <option>Cerai</option>
                      </select>
                      {isEditing && <Heart className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />}
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Tanggungan</label>
                    <input 
                      type="number"
                      disabled={!isEditing}
                      value={formData.dependents}
                      onChange={(e) => setFormData({...formData, dependents: parseInt(e.target.value)})}
                      className={cn("w-full px-3 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none", inputStyle)}
                    />
                 </div>
              </div>
           </div>
        </section>

        {/* SECTION B: Kontak & Alamat */}
        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
           <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-600" /> Kontak & Alamat
              </h3>
           </div>

           <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-sm space-y-4">
              
              <div className="space-y-1.5">
                 <label className="text-xs font-semibold text-slate-600 ml-1">Email Pribadi</label>
                 <div className="relative">
                    <input 
                       disabled={!isEditing}
                       value={formData.email}
                       onChange={(e) => setFormData({...formData, email: e.target.value})}
                       className={cn("w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none", inputStyle)}
                    />
                    <Mail className={cn("w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2", isEditing ? "text-slate-500" : "text-slate-400")} />
                 </div>
              </div>
              
              <div className="space-y-1.5">
                 <label className="text-xs font-semibold text-slate-600 ml-1">No. Handphone</label>
                 <div className="relative">
                    <input 
                       type="tel"
                       disabled={!isEditing}
                       value={formData.phone}
                       onChange={(e) => setFormData({...formData, phone: e.target.value})}
                       className={cn("w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none", inputStyle)}
                    />
                    <Phone className={cn("w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2", isEditing ? "text-slate-500" : "text-slate-400")} />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-xs font-semibold text-slate-600 ml-1">Alamat Domisili</label>
                 <div className="relative">
                    <textarea 
                      rows={3}
                      disabled={!isEditing}
                      className={cn("w-full px-4 py-3 rounded-xl text-sm font-medium transition-all resize-none focus:outline-none", inputStyle)}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                    <MapPin className={cn("w-4 h-4 absolute right-3 top-3", isEditing ? "text-slate-500" : "text-slate-400")} />
                 </div>
              </div>
           </div>
        </section>

        {/* SECTION C: Data Kepegawaian (ALWAYS READ ONLY) */}
        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
           <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-500" /> Data Kepegawaian
              </h3>
              <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-medium">Read-only</span>
           </div>

           <div className="bg-slate-100/50 border border-slate-200 rounded-2xl overflow-hidden opacity-80">
              <InfoRow label="NIP Karyawan" value={USER_PROFILE.nip} />
              <div className="h-px bg-slate-200 mx-4"></div>
              <InfoRow label="Unit Kerja" value="Divisi Teknologi Informasi" />
              <div className="h-px bg-slate-200 mx-4"></div>
              <InfoRow label="Tanggal Bergabung" value="01 Agustus 2015" />
           </div>
        </section>

        {/* --- TOMBOL AKSI DINAMIS --- */}
        <div className="pt-2 sticky bottom-4 z-30">
           {!isEditing ? (
             // MODE VIEW: Tombol Ubah
             <Button 
               fullWidth 
               size="lg"
               onClick={handleStartEdit}
               className="bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 shadow-xl shadow-slate-200/50 rounded-2xl h-12 text-sm font-bold"
             >
               <Pencil className="w-4 h-4 mr-2" /> Ubah Data Profil
             </Button>
           ) : (
             // MODE EDIT: Tombol Batal & Simpan
             <div className="flex gap-3">
               <Button 
                 fullWidth 
                 variant="secondary"
                 size="lg"
                 onClick={handleCancel}
                 disabled={isLoading}
                 className="bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl h-12 text-sm font-bold"
               >
                 <X className="w-4 h-4 mr-2" /> Batal
               </Button>
               
               <Button 
                 fullWidth 
                 size="lg"
                 onClick={handleSave}
                 disabled={isLoading}
                 className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 rounded-2xl h-12 text-sm font-bold flex-1"
               >
                 {isLoading ? "Menyimpan..." : (
                   <span className="flex items-center gap-2">
                     <Save className="w-4 h-4" /> Simpan
                   </span>
                 )}
               </Button>
             </div>
           )}
        </div>

        {/* LOGOUT BUTTON (Tetap ada di bawah) */}
        {!isEditing && (
          <div className="pb-4 text-center">
              <button className="text-xs font-semibold text-red-500 flex items-center justify-center gap-2 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors mx-auto">
                 <LogOut className="w-4 h-4" /> Keluar Aplikasi
              </button>
          </div>
        )}

      </div>
    </div>
  );
}

// Helper Component Read-Only Row
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center p-4">
       <span className="text-xs text-slate-500 font-medium">{label}</span>
       <span className="text-xs text-slate-800 font-bold">{value}</span>
    </div>
  )
}