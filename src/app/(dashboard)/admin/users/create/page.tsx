"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
   ArrowLeft, Save, UserPlus,
   Building2, Lock, Calendar, // [NEW] Icon Calendar
   User, Mail, BadgeCheck, Briefcase, UserCheck, AlertTriangle, Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { adminService } from "@/services/admin.service";
import { masterDataService, UnitKerja } from "@/services/master-data.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CreateUserPage() {
   const router = useRouter();
   const [loading, setLoading] = useState(false);
   const [units, setUnits] = useState<UnitKerja[]>([]);

   // Form State
   const [formData, setFormData] = useState({
      fullName: "",
      nip: "",
      email: "",
      password: "Maxipro123!",
      unitKerjaId: "",
      role: "USER" as "USER" | "ADMIN" | "DIRECTOR",
      jobTitle: "",
      dateOfBirth: "", // [NEW] Field Tanggal Lahir
   });

   const [errors, setErrors] = useState<Record<string, string>>({});

   useEffect(() => {
      const fetchUnits = async () => {
         try {
            const data = await masterDataService.getAllUnits();
            setUnits(data);
         } catch (error) {
            toast.error("Gagal memuat daftar unit kerja");
         }
      };
      fetchUnits();
   }, []);

   const validate = () => {
      const newErrors: Record<string, string> = {};
      if (!formData.fullName) newErrors.fullName = "Nama Lengkap wajib diisi";
      if (!formData.nip) newErrors.nip = "NIP wajib diisi";
      if (!formData.email) newErrors.email = "Email wajib diisi";
      if (!formData.unitKerjaId) newErrors.unitKerjaId = "Unit Kerja wajib dipilih";
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Tanggal Lahir wajib diisi"; // [NEW] Validasi

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) {
         toast.warning("Mohon lengkapi data yang wajib diisi");
         return;
      }

      setLoading(true);

      try {
         // Backend mengharapkan ISO Date string, input type="date" sudah format YYYY-MM-DD
         // yang bisa langsung diterima Prisma sebagai Date
         await adminService.createUser(formData);
         toast.success(`User ${formData.fullName} berhasil didaftarkan!`);
         router.push("/admin/users");
      } catch (error: any) {
         console.error(error);
         const msg = error.response?.data?.message || "Gagal menyimpan user";
         // Handle error array dari class-validator backend
         const displayMsg = Array.isArray(msg) ? msg[0] : msg;
         toast.error(displayMsg);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen w-full bg-surface-ground pb-24 md:pb-12">
         <div className="bg-brand-900 pt-10 pb-32 px-5 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-125 h-125 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 max-w-4xl mx-auto">
               <Button variant="ghost" className="text-brand-100 hover:text-white hover:bg-brand-800 mb-6 pl-0 gap-2" onClick={() => router.back()}>
                  <ArrowLeft className="w-5 h-5" /> Kembali ke Daftar
               </Button>
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg text-white border border-white/20">
                     <UserPlus className="w-7 h-7" />
                  </div>
                  <div className="text-white">
                     <h1 className="text-2xl md:text-3xl font-black tracking-tight">Registrasi Karyawan</h1>
                     <p className="text-brand-100 text-sm opacity-90 mt-1">Tambahkan akun pegawai baru ke dalam sistem.</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="relative z-20 max-w-4xl mx-auto px-5 -mt-20">
            <Card className="p-6 md:p-8 rounded-[1.5rem] shadow-xl border-white/60 bg-white/95 backdrop-blur-xl">
               <form onSubmit={handleSubmit} className="space-y-8">

                  {/* SECTION 1: IDENTITAS */}
                  <div className="space-y-5">
                     <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="p-2 bg-brand-50 rounded-lg text-brand-600"><User className="w-5 h-5" /></div>
                        <h3 className="font-bold text-slate-800 text-lg">Identitas Pegawai</h3>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label>Nama Lengkap</Label>
                           <Input
                              placeholder="Contoh: Budi Santoso"
                              value={formData.fullName}
                              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                              className={cn(errors.fullName && "border-rose-500")}
                           />
                           {errors.fullName && <p className="text-[10px] text-rose-500 font-bold">{errors.fullName}</p>}
                        </div>

                        <div className="space-y-2">
                           <Label>NIP</Label>
                           <Input
                              placeholder="1990..."
                              value={formData.nip}
                              onChange={e => setFormData({ ...formData, nip: e.target.value })}
                              className={cn("font-mono", errors.nip && "border-rose-500")}
                           />
                           {errors.nip && <p className="text-[10px] text-rose-500 font-bold">{errors.nip}</p>}
                        </div>

                        <div className="space-y-2">
                           <Label>Email Perusahaan</Label>
                           <Input
                              type="email"
                              placeholder="nama@maxipro.co.id"
                              value={formData.email}
                              onChange={e => setFormData({ ...formData, email: e.target.value })}
                              className={cn(errors.email && "border-rose-500")}
                           />
                           {errors.email && <p className="text-[10px] text-rose-500 font-bold">{errors.email}</p>}
                        </div>

                        {/* [NEW] KOLOM TANGGAL LAHIR */}
                        <div className="space-y-2">
                           <Label>Tanggal Lahir</Label>
                           <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                              <Input
                                 type="date"
                                 value={formData.dateOfBirth}
                                 onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                 className={cn("pl-10 block", errors.dateOfBirth && "border-rose-500")}
                              />
                           </div>
                           {errors.dateOfBirth && <p className="text-[10px] text-rose-500 font-bold">{errors.dateOfBirth}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                           <Label>Jabatan (Opsional)</Label>
                           <Input
                              placeholder="Contoh: Staff IT"
                              value={formData.jobTitle}
                              onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                           />
                        </div>
                     </div>
                  </div>

                  {/* SECTION 2: ORGANISASI */}
                  <div className="space-y-5">
                     <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Building2 className="w-5 h-5" /></div>
                        <h3 className="font-bold text-slate-800 text-lg">Organisasi & Hak Akses</h3>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <Label>Unit Kerja</Label>
                           <select
                              className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm", errors.unitKerjaId && "border-rose-500")}
                              value={formData.unitKerjaId}
                              onChange={e => setFormData({ ...formData, unitKerjaId: e.target.value })}
                           >
                              <option value="">-- Pilih Unit Kerja --</option>
                              {units.map(unit => (
                                 <option key={unit.id} value={unit.id}>{unit.namaUnit} ({unit.kodeUnit})</option>
                              ))}
                           </select>
                           {errors.unitKerjaId && <p className="text-[10px] text-rose-500 font-bold">{errors.unitKerjaId}</p>}
                        </div>

                        <div className="space-y-3">
                           <Label>Role Aplikasi</Label>
                           <div className="grid grid-cols-3 gap-2">
                              {["USER", "DIRECTOR", "ADMIN"].map((role) => (
                                 <button
                                    key={role}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: role as any })}
                                    className={cn(
                                       "text-xs font-bold py-2 px-2 rounded-md border transition-all",
                                       formData.role === role ? "bg-brand-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"
                                    )}
                                 >
                                    {role}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                     <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Batal</Button>
                     <Button type="submit" disabled={loading} className="flex-2 bg-emerald-600 hover:bg-emerald-700">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Simpan User
                     </Button>
                  </div>
               </form>
            </Card>
         </div>
      </div>
   );
}