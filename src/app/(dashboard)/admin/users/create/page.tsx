"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Save, UserPlus, 
  Building2, Shield, Lock, AlertCircle,
  User, Mail, BadgeCheck, Briefcase, UserCheck, AlertTriangle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen w-full bg-surface-ground pb-24 md:pb-12">
      
      {/* --- HEADER (PAM IDENTITY) --- */}
      <div className="bg-brand-900 pt-10 pb-32 px-5 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-125 h-125 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
         <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-[0.05] mix-blend-overlay"></div>

         <div className="relative z-10 max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              className="text-brand-100 hover:text-white hover:bg-brand-800 mb-6 pl-0 gap-2 transition-colors"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5" /> Kembali ke Daftar
            </Button>

            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20 text-white border border-white/20">
                   <UserPlus className="w-7 h-7" />
                </div>
                <div className="text-white">
                   <h1 className="text-2xl md:text-3xl font-black tracking-tight">Registrasi Karyawan</h1>
                   <p className="text-brand-100 text-sm opacity-90 mt-1">Tambahkan akun pegawai baru ke dalam sistem database.</p>
                </div>
            </div>
         </div>
      </div>

      <div className="relative z-20 max-w-4xl mx-auto px-5 -mt-20">
        
        {/* Form Card */}
        <Card className="p-6 md:p-8 rounded-[1.5rem] shadow-xl border-white/60 bg-white/95 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECTION 1: IDENTITAS */}
            <div className="space-y-5">
               <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                     <User className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">Identitas Pegawai</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <Label variant="field">Nama Lengkap</Label>
                     <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                        <Input 
                          placeholder="Contoh: Budi Santoso"
                          value={formData.fullName}
                          onChange={e => setFormData({...formData, fullName: e.target.value})}
                          className={cn("pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all", errors.fullName && "border-rose-500 focus:border-rose-500")}
                        />
                     </div>
                     {errors.fullName && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                     <Label variant="field">Nomor Induk Pegawai (NIP)</Label>
                     <div className="relative group">
                        <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                        <Input 
                          placeholder="1990..."
                          value={formData.nip}
                          onChange={e => setFormData({...formData, nip: e.target.value})}
                          className={cn("pl-10 h-12 rounded-xl bg-slate-50 focus:bg-white font-mono", errors.nip && "border-rose-500")}
                        />
                     </div>
                     {errors.nip && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.nip}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                     <Label variant="field">Email Perusahaan</Label>
                     <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                        <Input 
                          type="email"
                          placeholder="nama@maxipro.co.id"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className={cn("pl-10 h-12 rounded-xl bg-slate-50 focus:bg-white", errors.email && "border-rose-500")}
                        />
                     </div>
                     {errors.email && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.email}</p>}
                  </div>
               </div>
            </div>

            {/* SECTION 2: ORGANISASI & AKSES */}
            <div className="space-y-5">
               <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Building2 className="w-5 h-5" />
                     </div>
                     <h3 className="font-bold text-slate-800 text-lg">Organisasi & Hak Akses</h3>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <Label variant="field">Unit Kerja</Label>
                     <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <select 
                           className={cn(
                             "flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer appearance-none",
                             errors.unitId && "border-rose-500"
                           )}
                           value={formData.unitId}
                           onChange={e => setFormData({...formData, unitId: e.target.value})}
                        >
                           <option value="">-- Pilih Unit Kerja --</option>
                           {MOCK_UNITS.map(unit => (
                             <option key={unit.id} value={unit.id}>{unit.name}</option>
                           ))}
                        </select>
                     </div>
                     {errors.unitId && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.unitId}</p>}
                  </div>

                  <div className="space-y-3">
                     <Label variant="field">Role Aplikasi</Label>
                     <div className="grid grid-cols-2 gap-3">
                        {["USER", "UNIT_HEAD", "DIRECTOR", "ADMIN"].map((role) => (
                           <button
                              key={role}
                              type="button"
                              onClick={() => setFormData({...formData, role: role as UserRole})}
                              className={cn(
                                "text-xs font-bold py-3 px-3 rounded-xl border transition-all text-center flex items-center justify-center gap-2",
                                formData.role === role 
                                  ? "bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-500/20" 
                                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                              )}
                           >
                              {role === "USER" && <User className="w-3.5 h-3.5" />}
                              {role === "ADMIN" && <Shield className="w-3.5 h-3.5" />}
                              {role.replace("_", " ")}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               {/* ROLE CONTEXT INFO */}
               <div className={cn(
                 "p-4 rounded-xl border flex gap-3 text-xs leading-relaxed transition-all items-start",
                 formData.role === "DIRECTOR" ? "bg-indigo-50 border-indigo-200 text-indigo-700" :
                 formData.role === "UNIT_HEAD" ? "bg-cyan-50 border-cyan-200 text-cyan-700" :
                 formData.role === "ADMIN" ? "bg-purple-50 border-purple-200 text-purple-700" :
                 "bg-slate-50 border-slate-200 text-slate-600"
               )}>
                  <div className="mt-0.5 shrink-0">
                    {formData.role === "DIRECTOR" && <UserCheck className="w-4 h-4" />}
                    {formData.role === "ADMIN" && <AlertTriangle className="w-4 h-4" />}
                    {(formData.role === "USER" || formData.role === "UNIT_HEAD") && <Briefcase className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold block mb-1 uppercase tracking-wide">
                        {formData.role === "DIRECTOR" ? "Akses Eksekutif" : 
                         formData.role === "UNIT_HEAD" ? "Akses Pimpinan Bidang" :
                         formData.role === "ADMIN" ? "Akses Super Admin" : "Akses Pegawai"}
                    </span>
                    <p className="opacity-90">
                        {formData.role === "DIRECTOR" && "Melihat data agregat dan detail seluruh karyawan."}
                        {formData.role === "UNIT_HEAD" && `Melihat data karyawan di unit ${MOCK_UNITS.find(u => u.id === formData.unitId)?.name || "terpilih"}.`}
                        {formData.role === "ADMIN" && "Kontrol penuh sistem & user. Hati-hati memberikan role ini."}
                        {formData.role === "USER" && "Hanya mengakses data pribadi."}
                    </p>
                  </div>
               </div>
            </div>

            {/* SECTION 3: KEAMANAN DEFAULT */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
               <div className="p-2 bg-amber-100 rounded-full text-amber-600 mt-0.5">
                  <Lock className="w-4 h-4" />
               </div>
               <div>
                  <h4 className="text-sm font-bold text-amber-800 mb-1">Password Default</h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    User baru akan dibuatkan password otomatis: <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-200 mx-1 select-all">Maxipro!</span>
                    <br/>Harap informasikan kepada user untuk segera mengganti password saat login pertama kali.
                  </p>
               </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
               <Button 
                 type="button" 
                 variant="outline" 
                 className="flex-1 h-12 border-slate-300 text-slate-600 hover:bg-slate-50 font-bold rounded-xl"
                 onClick={() => router.back()}
               >
                 Batal
               </Button>
               <Button 
                 type="submit" 
                 disabled={loading}
                 className="flex-2 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-200 rounded-xl"
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