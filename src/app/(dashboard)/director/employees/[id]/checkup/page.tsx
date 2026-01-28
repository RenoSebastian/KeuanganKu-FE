// SERVER COMPONENT
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { 
  ArrowLeft, 
  ShieldAlert, 
  ChevronRight,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Types & Services
import { directorService } from "@/services/director.service";

// Components
import EmployeeProfileHeader from "@/components/features/director/audit/employee-profile-header";
import AuditNotice from "@/components/features/director/audit/audit-notice";
import { CheckupResult } from "@/components/features/finance/checkup-result";
import PrintButton from "@/components/features/director/audit/print-button";

// [FIX NEXT.JS 15] Params sebagai Promise
export default async function EmployeeAuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Ambil Token
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  // 2. Fetch Data
  let data = null;
  let error = null;

  try {
    data = await directorService.getEmployeeAuditDetail(id, token);
  } catch (err) {
    console.error("Failed to fetch audit detail:", err);
    error = "Gagal memuat data audit.";
  }

  // --- STATE: ERROR ---
  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="bg-red-50 text-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-6">{error || "Karyawan ini belum memiliki data checkup."}</p>
          <Link href="/director/dashboard">
            <Button variant="outline">Kembali ke Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { profile, record, analysis } = data;

  // --- STATE: SUCCESS (MINIMALIST VIEW) ---
  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* 1. HEADER NAVIGASI (Sangat Minimalis & Clean) */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Breadcrumb Style Nav */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/director/dashboard" className="hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-px h-4 bg-slate-200 mx-2" />
            <span className="hidden sm:inline">Executive Audit</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="font-medium text-slate-900 truncate max-w-37.5 sm:max-w-xs">
              {profile.fullName}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs font-medium text-slate-600">
                <FileText className="w-3 h-3" />
                <span>REF: {id.substring(0, 6).toUpperCase()}</span>
             </div>
             <PrintButton />
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT WRAPPER */}
      <main className="max-w-5xl mx-auto px-6 pt-8 space-y-8">

        {/* SECTION A: IDENTITY & CONTEXT */}
        <section>
          <div className="mb-6">
             {/* Security Notice yang tidak mencolok tapi ada */}
             <AuditNotice viewerName="DIREKSI" />
          </div>

          {/* Profile Header - Langsung flat, tanpa card berlebihan */}
          <div className="bg-white">
             <EmployeeProfileHeader profile={profile} />
          </div>
        </section>

        <div className="border-t border-slate-100" />

        {/* SECTION B: FINANCIAL REPORT */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Laporan Kesehatan Finansial</h2>
              <p className="text-sm text-slate-500 mt-1">
                Generated at {new Date(analysis.generatedAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
              </p>
            </div>
          </div>

          {/* CheckupResult biasanya sudah punya Card/Border sendiri. 
            Kita taruh langsung di sini tanpa wrapper Card tambahan.
            Ini menghilangkan efek "Card dalam Card".
          */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             <CheckupResult 
                data={analysis} 
                rawData={record} 
                mode="DIRECTOR_VIEW" 
             />
          </div>
        </section>

      </main>

      {/* FOOTER SIMPLE */}
      <footer className="max-w-5xl mx-auto px-6 mt-16 pt-8 border-t border-slate-100 text-center pb-8">
        <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
          MAXIPRO Internal Confidential Document
        </p>
      </footer>

    </div>
  );
}