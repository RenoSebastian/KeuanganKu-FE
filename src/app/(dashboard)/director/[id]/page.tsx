"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Loader2, User as UserIcon, Building2, 
  Mail, Calendar, ShieldCheck, Download, Printer, Lock, 
  Activity, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckupResult } from "@/components/features/finance/checkup-result";

// [UPDATE] Import Tipe Data
import { 
  FinancialRecord, 
  HealthAnalysisResult, 
  EmployeeAuditDetail // Menggunakan tipe gabungan dari Tahap 1
} from "@/lib/types";

// [UPDATE] Import Service & Axios
import { directorService } from "@/services/director.service";
import { cn } from "@/lib/utils";

export default function EmployeeFinancialDetail() {
  const params = useParams();
  const router = useRouter();
  
  // State Management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Menggunakan tipe dari EmployeeAuditDetail
  const [profile, setProfile] = useState<EmployeeAuditDetail['profile'] | null>(null);
  const [record, setRecord] = useState<FinancialRecord | null>(null);
  const [analysis, setAnalysis] = useState<HealthAnalysisResult | null>(null);

  useEffect(() => {
    const initPage = async () => {
      // 1. Auth Check (Security)
      const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (!storedUser) {
        router.push("/login");
        return;
      }
      const user = JSON.parse(storedUser);
      if (user.role !== "DIRECTOR") {
        alert("AKSES DITOLAK: Anda tidak memiliki otoritas audit.");
        router.push("/");
        return;
      }

      // 2. Fetch Real Data
      try {
        const employeeId = params.id as string;
        
        // Panggil Service
        const data = await directorService.getEmployeeDetail(employeeId);
        
        if (data) {
          setProfile(data.profile);
          setRecord(data.record);
          setAnalysis(data.analysis);
        } else {
          setError("Data karyawan tidak ditemukan atau belum melakukan checkup.");
        }
      } catch (err: any) {
        console.error("Gagal mengambil detail karyawan:", err);
        setError("Terjadi kesalahan saat mengambil data audit. Pastikan karyawan valid.");
      } finally {
        setIsLoading(false);
      }
    };

    initPage();
  }, [params.id, router]);

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-ground gap-4">
        <Loader2 className="w-10 h-10 text-brand-700 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Opening Secure File...</p>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !profile || !record || !analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-ground gap-4 px-4 text-center">
        <div className="p-4 bg-rose-50 rounded-full text-rose-500 mb-2">
            <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Akses Data Gagal</h3>
        <p className="text-slate-500 max-w-md mb-6">{error || "Data finansial karyawan ini tidak tersedia."}</p>
        <Button onClick={() => router.push("/director")} variant="outline">
           <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full pb-20">
      
      {/* --- EXECUTIVE HEADER (Deep Blue) --- */}
      <div className="bg-brand-900 pt-8 pb-32 px-6 relative overflow-hidden shadow-2xl">
         {/* Background Elements */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
         
         <div className="relative z-10 max-w-7xl mx-auto">
            {/* Top Bar Navigation */}
            <div className="flex justify-between items-start mb-8">
               <Button 
                 variant="ghost" 
                 onClick={() => router.push("/director")}
                 className="text-brand-100 hover:text-white hover:bg-brand-800 -ml-4"
               >
                 <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
               </Button>

               <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-transparent border-brand-700 text-brand-100 hover:bg-brand-800 hover:text-white">
                     <Printer className="w-4 h-4 mr-2" /> Print
                  </Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 border-0">
                     <Download className="w-4 h-4 mr-2" /> Export PDF
                  </Button>
               </div>
            </div>

            {/* Title Block */}
            <div className="flex items-center gap-3 mb-2">
               <div className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Confidential Audit
               </div>
               <span className="text-brand-300 text-xs font-mono">ID: {profile.id.substring(0, 8).toUpperCase()}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Audit Finansial Personal</h1>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20 space-y-8">
        
        {/* --- EMPLOYEE PROFILE CARD (The "Dossier") --- */}
        <div className="card-clean p-8 bg-white/95 backdrop-blur-xl relative overflow-hidden">
           {/* Watermark Icon */}
           <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none transform rotate-12">
              <ShieldCheck className="w-64 h-64 text-slate-900" />
           </div>

           <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar Section */}
              <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner shrink-0">
                 <UserIcon className="w-12 h-12" />
              </div>
              
              {/* Details Grid */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                 <div className="md:col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Karyawan</p>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{profile.fullName}</h2>
                    <div className="flex items-center gap-2 mt-2">
                       <Badge variant="outline" className="rounded-md border-brand-200 bg-brand-50 text-brand-700">
                          <Building2 className="w-3 h-3 mr-1" /> {profile.unitName}
                       </Badge>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kontak</p>
                       <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-brand-500" /> 
                          {/* Menggunakan email asli dari profile, dengan fallback */}
                          {profile.email || `${profile.fullName.split(' ')[0].toLowerCase()}@pamjaya.co.id`}
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Terakhir Update</p>
                       <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-brand-500" /> 
                          {new Date(profile.lastCheckDate).toLocaleDateString("id-ID", {
                             day: 'numeric', month: 'long', year: 'numeric'
                          })}
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col items-start lg:items-end justify-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status Kesehatan</p>
                    <Badge className={cn(
                      "px-4 py-1.5 text-xs font-bold uppercase tracking-widest border-0",
                      profile.status === "BAHAYA" ? "bg-rose-600 hover:bg-rose-700 text-white" : 
                      profile.status === "WASPADA" ? "bg-amber-500 hover:bg-amber-600 text-white" :
                      "bg-emerald-600 hover:bg-emerald-700 text-white"
                    )}>
                       {profile.status}
                    </Badge>
                 </div>
              </div>
           </div>
        </div>

        {/* --- REPORT SECTION --- */}
        <div>
           <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-2 bg-brand-100 rounded-lg text-brand-600">
                 <Activity className="w-5 h-5" />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-slate-800">Laporan Analisa Sistem</h2>
                 <p className="text-xs text-slate-500">Data hasil kalkulasi otomatis berdasarkan input terakhir karyawan.</p>
              </div>
           </div>
           
           {/* Reusing CheckupResult Component in Read-Only Mode */}
           <div className="opacity-100 pointer-events-none grayscale-[0.05]">
              <CheckupResult 
                data={analysis} 
                rawData={record} 
                onReset={() => {}} // Disable reset function
              />
           </div>
        </div>

      </div>
    </div>
  );
}