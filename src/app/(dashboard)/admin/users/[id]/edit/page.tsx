"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Save, Briefcase, 
  Building2, Shield, AlertTriangle, UserCheck
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/lib/types"; 
import { cn } from "@/lib/utils";

// MOCK DATA UNITS (Harusnya dari API Master Data)
const MOCK_UNITS = [
  { id: "U-001", name: "Bidang Keuangan" },
  { id: "U-002", name: "Bidang SDM" },
  { id: "U-003", name: "Bidang Operasional" },
  { id: "IT-001", name: "Divisi TI" },
  { id: "DIR-001", name: "Direktorat Utama" },
];

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    nip: "",
    email: "",
    unitId: "",
    role: "USER" as UserRole,
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. FETCH USER DATA (Simulasi)
  useEffect(() => {
    const fetchUser = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock Data (Ceritanya dapat dari DB based on userId)
      const mockUser = {
        fullName: "Budi Santoso",
        nip: "19880123 201001 1 001",
        email: "budi.s@pamjaya.co.id",
        unitId: "U-001",
        role: "USER" as UserRole,
        isActive: true
      };

      setFormData(mockUser);
      setLoading(false);
    };

    fetchUser();
  }, [userId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Nama Lengkap wajib diisi";
    if (!formData.nip) newErrors.nip = "NIP wajib diisi";
    if (!formData.email) newErrors.email = "Email wajib diisi";
    if (!formData.unitId) newErrors.unitId = "Unit Kerja wajib dipilih";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    try {
      // Simulate Update API
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Data user ${formData.fullName} berhasil diperbarui!`);
      router.push("/admin/users");
    } catch (error) {
      alert("Gagal memperbarui user.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <p className="text-slate-500 animate-pulse font-medium">Memuat data user...</p>
        </div>
    );
  }

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
          <ArrowLeft className="w-5 h-5 mr-2" /> Kembali
        </Button>

        {/* Header Content */}
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 text-white">
              <Briefcase className="w-6 h-6" />
           </div>
           <div className="text-white">
              <h1 className="text-2xl font-bold">Edit Data Karyawan</h1>
              <p className="text-slate-400 text-sm">Perbarui informasi jabatan, unit, atau hak akses.</p>
           </div>
        </div>

        {/* Form Card */}
        <Card className="p-6 md:p-8 rounded-2xl shadow-xl border-slate-200 bg-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECTION 1: IDENTITAS */}
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                 1. Identitas & Kontak
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500">Nama Lengkap</label>
                     <Input 
                       value={formData.fullName}
                       onChange={e => setFormData({...formData, fullName: e.target.value})}
                       className={cn("bg-slate-50 focus:bg-white", errors.fullName && "border-red-500")}
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500">NIP</label>
                     <Input 
                       value={formData.nip}
                       onChange={e => setFormData({...formData, nip: e.target.value})}
                       className={cn("bg-slate-50 focus:bg-white font-mono", errors.nip && "border-red-500")}
                     />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                     <label className="text-xs font-bold text-slate-500">Email Perusahaan</label>
                     <Input 
                       type="email"
                       value={formData.email}
                       onChange={e => setFormData({...formData, email: e.target.value})}
                       className={cn("bg-slate-50 focus:bg-white", errors.email && "border-red-500")}
                     />
                  </div>
               </div>
            </div>

            {/* SECTION 2: MUTASI & PROMOSI */}
            <div className="space-y-4">
               <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    2. Mutasi & Hak Akses
                  </h3>
                  <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                    Area Sensitif
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3"/> Unit Kerja (Mutasi)
                     </label>
                     <select 
                        className={cn(
                          "flex h-10 w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Shield className="w-3 h-3"/> Role Aplikasi (Promosi)
                     </label>
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
                  </div>
               </div>

               {/* ROLE CONTEXT WARNING */}
               <div className={cn(
                 "mt-4 p-4 rounded-xl border flex gap-3 text-xs leading-relaxed transition-all",
                 formData.role === "DIRECTOR" ? "bg-indigo-50 border-indigo-200 text-indigo-700" :
                 formData.role === "UNIT_HEAD" ? "bg-blue-50 border-blue-200 text-blue-700" :
                 formData.role === "ADMIN" ? "bg-purple-50 border-purple-200 text-purple-700" :
                 "bg-slate-50 border-slate-200 text-slate-600"
               )}>
                  <div className="mt-0.5">
                    {formData.role === "DIRECTOR" && <UserCheck className="w-4 h-4" />}
                    {formData.role === "ADMIN" && <AlertTriangle className="w-4 h-4" />}
                    {(formData.role === "USER" || formData.role === "UNIT_HEAD") && <Briefcase className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold block mb-1">
                        {formData.role === "DIRECTOR" ? "Akses Direksi (Global View)" : 
                         formData.role === "UNIT_HEAD" ? "Akses Pimpinan Bidang" :
                         formData.role === "ADMIN" ? "Akses Super Admin" : "Akses Pegawai"}
                    </span>
                    {formData.role === "DIRECTOR" && "User ini dapat melihat data agregat dan detail seluruh karyawan PAM JAYA."}
                    {formData.role === "UNIT_HEAD" && `User ini dapat melihat rekapitulasi data karyawan di unit ${MOCK_UNITS.find(u => u.id === formData.unitId)?.name || "terpilih"}.`}
                    {formData.role === "ADMIN" && "User ini memiliki kontrol penuh atas sistem, manajemen user, dan konfigurasi."}
                    {formData.role === "USER" && "User hanya dapat mengakses dan mengelola data pribadinya sendiri."}
                  </div>
               </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
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
                 disabled={saving}
                 className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-200"
               >
                 {saving ? "Menyimpan Perubahan..." : (
                   <span className="flex items-center gap-2">
                     <Save className="w-5 h-5" /> Simpan Perubahan
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