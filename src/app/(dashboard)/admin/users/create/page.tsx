"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Save, UserPlus, 
  Building2, Shield, Lock, AlertCircle 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/lib/types"; 
import { cn } from "@/lib/utils";

// MOCK DATA UNITS (Nanti dari API Master Data)
const MOCK_UNITS = [
  { id: "U-001", name: "Bidang Keuangan" },
  { id: "U-002", name: "Bidang SDM" },
  { id: "U-003", name: "Bidang Operasional" },
  { id: "IT-001", name: "Divisi TI" },
  { id: "DIR-001", name: "Direktorat Utama" },
];

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    nip: "",
    email: "",
    unitId: "",
    role: "USER" as UserRole,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Nama Lengkap wajib diisi";
    if (!formData.nip) newErrors.nip = "NIP wajib diisi";
    if (!formData.email) newErrors.email = "Email wajib diisi";
    else if (!formData.email.includes("@")) newErrors.email = "Format email tidak valid";
    if (!formData.unitId) newErrors.unitId = "Unit Kerja wajib dipilih";
    
    // Simulasi Validasi Unik (Nanti cek ke DB)
    if (formData.nip === "99999999") newErrors.nip = "NIP sudah terdaftar";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    // Simulasi API Call
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`User ${formData.fullName} berhasil didaftarkan!\nPassword Default: PamJaya123!`);
      router.push("/admin/users");
    } catch (error) {
      alert("Gagal menyimpan user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12">
      {/* Header Decoration */}
      <div className="h-48 w-full bg-slate-900 absolute top-0 left-0 z-0" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-8 md:pt-12">
        
        {/* Navigasi Kembali */}
        <Button 
          variant="ghost" 
          className="text-slate-300 hover:text-white hover:bg-white/10 mb-6 pl-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Daftar User
        </Button>

        {/* Header Content */}
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20 text-white">
              <UserPlus className="w-6 h-6" />
           </div>
           <div className="text-white">
              <h1 className="text-2xl font-bold">Registrasi Karyawan Baru</h1>
              <p className="text-slate-400 text-sm">Tambahkan akun pegawai ke dalam sistem.</p>
           </div>
        </div>

        {/* Form Card */}
        <Card className="p-6 md:p-8 rounded-2xl shadow-xl border-slate-200 bg-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECTION 1: IDENTITAS */}
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                 1. Identitas Pegawai
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500">Nama Lengkap <span className="text-red-500">*</span></label>
                     <Input 
                       placeholder="Contoh: Budi Santoso"
                       value={formData.fullName}
                       onChange={e => setFormData({...formData, fullName: e.target.value})}
                       className={cn("bg-slate-50 focus:bg-white", errors.fullName && "border-red-500")}
                     />
                     {errors.fullName && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500">NIP (Nomor Induk Pegawai) <span className="text-red-500">*</span></label>
                     <Input 
                       placeholder="Contoh: 19900101 201501 1 001"
                       value={formData.nip}
                       onChange={e => setFormData({...formData, nip: e.target.value})}
                       className={cn("bg-slate-50 focus:bg-white", errors.nip && "border-red-500")}
                     />
                     {errors.nip && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.nip}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                     <label className="text-xs font-bold text-slate-500">Email Perusahaan <span className="text-red-500">*</span></label>
                     <Input 
                       type="email"
                       placeholder="nama@pamjaya.co.id"
                       value={formData.email}
                       onChange={e => setFormData({...formData, email: e.target.value})}
                       className={cn("bg-slate-50 focus:bg-white", errors.email && "border-red-500")}
                     />
                     {errors.email && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.email}</p>}
                  </div>
               </div>
            </div>

            {/* SECTION 2: ORGANISASI & AKSES */}
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                 2. Organisasi & Hak Akses
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Building2 className="w-3 h-3"/> Unit Kerja <span className="text-red-500">*</span></label>
                     <select 
                        className={cn(
                          "flex h-10 w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          errors.unitId && "border-red-500"
                        )}
                        value={formData.unitId}
                        onChange={e => setFormData({...formData, unitId: e.target.value})}
                     >
                        <option value="">-- Pilih Unit Kerja --</option>
                        {MOCK_UNITS.map(unit => (
                          <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                     </select>
                     {errors.unitId && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.unitId}</p>}
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Shield className="w-3 h-3"/> Role Aplikasi</label>
                     <div className="grid grid-cols-2 gap-2">
                        {["USER", "UNIT_HEAD", "DIRECTOR", "ADMIN"].map((role) => (
                           <button
                              key={role}
                              type="button"
                              onClick={() => setFormData({...formData, role: role as UserRole})}
                              className={cn(
                                "text-xs font-bold py-2 px-3 rounded-lg border transition-all text-center",
                                formData.role === role 
                                  ? "bg-slate-800 text-white border-slate-800 shadow-md" 
                                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                              )}
                           >
                              {role.replace("_", " ")}
                           </button>
                        ))}
                     </div>
                     <p className="text-[10px] text-slate-400 mt-1">
                       *User: Pegawai Biasa | Unit Head: Pimpinan Bidang | Director: Direksi
                     </p>
                  </div>
               </div>
            </div>

            {/* SECTION 3: KEAMANAN DEFAULT */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
               <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                  <Lock className="w-4 h-4" />
               </div>
               <div>
                  <h4 className="text-sm font-bold text-amber-800 mb-1">Password Default</h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    User baru akan dibuatkan password otomatis: <span className="font-mono font-bold bg-white px-1 rounded border border-amber-200">PamJaya123!</span>
                    <br/>Harap informasikan kepada user untuk segera mengganti password saat login pertama kali.
                  </p>
               </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 flex gap-3">
               <Button 
                 type="button" 
                 variant="outline" 
                 className="flex-1 h-12 border-slate-300 text-slate-600 hover:bg-slate-50"
                 onClick={() => router.back()}
               >
                 Batal
               </Button>
               <Button 
                 type="submit" 
                 disabled={loading}
                 className="flex-[2] h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-200"
               >
                 {loading ? "Menyimpan..." : (
                   <span className="flex items-center gap-2">
                     <Save className="w-5 h-5" /> Simpan User Baru
                   </span>
                 )}
               </Button>
            </div>

          </form>
        </Card>

      </div>
    </div>
  );
}