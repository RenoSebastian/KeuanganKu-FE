// SERVER COMPONENT
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { 
  ArrowLeft, User, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Types & Services
import { directorService } from "@/services/director.service";

// Components
import EmployeeProfileHeader from "@/components/features/director/audit/employee-profile-header";
import AuditNotice from "@/components/features/director/audit/audit-notice";
import { CheckupResult } from "@/components/features/finance/checkup-result";

// Helper untuk format Rupiah (Opsional, tapi biasanya dihandle component)
// const formatMoney = (val: number) => 
//   new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

export default async function EmployeeAuditPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // 1. Ambil Token (Server Side)
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  // 2. Fetch Data Audit (SSR - Memicu Audit Trail di Backend)
  let data = null;
  let error = null;

  try {
    data = await directorService.getEmployeeAuditDetail(id, token);
  } catch (err) {
    console.error("Failed to fetch audit detail:", err);
    error = "Gagal memuat data audit. Terjadi kesalahan sistem atau sesi habis.";
  }

  // 3. Render State: Error / Empty / Success
  
  // STATE: ERROR / NOT FOUND
  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-3xl border border-slate-200 m-4 md:m-8">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <User className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Data Tidak Tersedia</h2>
        <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
            {error || "Karyawan ini belum pernah melakukan Financial Checkup atau data profil belum lengkap."}
        </p>
        <Link href="/director/dashboard">
            <Button variant="outline" className="border-slate-300">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
            </Button>
        </Link>
      </div>
    );
  }

  // Destructure Data
  const { profile, record, analysis } = data;

  // STATE: SUCCESS
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. TOP NAV & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <Link href="/director/dashboard">
            <Button 
                variant="ghost" 
                className="pl-0 text-slate-500 hover:text-slate-800 hover:bg-transparent"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
            </Button>
        </Link>
        {/* Tombol Print bisa ditambahkan client-side wrapper jika perlu, tapi browser print works fine */}
      </div>

      {/* 2. AUDIT NOTICE (Security Context) */}
      <AuditNotice viewerName="DIRECTOR" />

      {/* 3. PROFILE HEADER (Identity Context) */}
      <EmployeeProfileHeader profile={profile} />

      {/* 4. FINANCIAL REPORT (The Data) */}
      {/* Menggunakan komponen CheckupResult yang sudah dimodifikasi (Step 1) */}
      <CheckupResult 
        data={analysis} 
        rawData={record} 
        mode="DIRECTOR_VIEW" // Mengaktifkan mode Read-Only
      />

      {/* FOOTER METADATA */}
      <div className="text-center pt-10 pb-6 border-t border-slate-200 mt-12">
        <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-mono uppercase tracking-widest mb-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Confidential Document</span>
        </div>
        <p className="text-slate-400 text-xs">
            Audit ID: {id} • Generated at: {new Date().toISOString()}
        </p>
      </div>

    </div>
  );
}