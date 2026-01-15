"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, Activity, Users, FileText, 
  Lock, AlertTriangle, Eye, Search, Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";

// --- TYPES (Supaya Type Safe) ---
interface RiskyEmployee {
  id: string;
  score: number;
  status: string;
  incomeSnapshot: string;
  expenseSnapshot: string;
  checkDate: string;
  user: {
    fullName: string;
    unitKerja: {
      namaUnit: string;
    } | null;
  };
}

interface AuditLog {
  id: string;
  action: string;
  accessedAt: string;
  metadata: string;
  actor: {
    fullName: string;
    email: string;
    role: string;
  };
}

export default function DirectorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [riskyEmployees, setRiskyEmployees] = useState<RiskyEmployee[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // --- 1. SECURITY CHECK & DATA FETCHING ---
  useEffect(() => {
    const initPage = async () => {
      // A. Cek Hak Akses (Client Side Guard)
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(storedUser);
      if (user.role !== "DIRECTOR") {
        alert("AKSES DITOLAK: Halaman ini khusus Direksi.");
        router.push("/"); // Tendang ke Dashboard Karyawan
        return;
      }

      // B. Fetch Data (Parallel)
      try {
        const [resRisky, resLogs] = await Promise.all([
          api.get("/director/risky-employees"),
          api.get("/director/logs")
        ]);

        setRiskyEmployees(resRisky.data);
        setAuditLogs(resLogs.data);
      } catch (error) {
        console.error("Gagal memuat data direksi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initPage();
  }, [router]);

  // --- FORMATTER ---
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
    });
  };

  const formatMoney = (val: string) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-slate-800 animate-spin" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memverifikasi Otoritas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-100/50 pb-24">
      
      {/* HEADER EKSEKUTIF */}
      <div className="bg-slate-900 text-white pt-8 pb-24 px-5 md:px-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-300 font-bold text-xs uppercase tracking-widest">
              <Lock className="w-3 h-3" /> Restricted Area
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Executive Dashboard</h1>
            <p className="text-slate-400 mt-1 max-w-xl">
              Pusat pemantauan kesehatan finansial SDM dan audit keamanan sistem.
            </p>
          </div>
          
          <div className="hidden md:block">
             <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono text-slate-300">SYSTEM STATUS: ONLINE</span>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 -mt-16 relative z-20 space-y-8">
        
        {/* === SECTION 1: RISK MONITOR === */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <div className="p-2 bg-red-100 text-red-600 rounded-lg">
               <ShieldAlert className="w-5 h-5" />
             </div>
             <div>
               <h2 className="text-lg font-bold text-slate-800">Risk Monitor</h2>
               <p className="text-xs text-slate-500">Karyawan dengan status "BAHAYA" (Perlu Intervensi)</p>
             </div>
          </div>

          <Card className="border-0 shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
            {riskyEmployees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Nama Karyawan</th>
                      <th className="px-6 py-4">Unit Kerja</th>
                      <th className="px-6 py-4 text-center">Skor</th>
                      <th className="px-6 py-4">Snapshot Keuangan</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {riskyEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-red-50/30 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {emp.user.fullName}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {emp.user.unitKerja?.namaUnit || "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge className="bg-red-100 text-red-600 border-red-200 hover:bg-red-200">
                            {emp.score} / 100
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-xs">
                             <span className="text-green-600">In: {formatMoney(emp.incomeSnapshot)}</span>
                             <span className="text-red-500">Out: {formatMoney(emp.expenseSnapshot)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button size="sm" variant="outline" className="h-8 text-xs border-slate-200">
                             Detail <Eye className="w-3 h-3 ml-2" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-3">
                    <ShieldAlert className="w-8 h-8 text-green-500" />
                 </div>
                 <h3 className="text-slate-800 font-bold">Semua Aman</h3>
                 <p className="text-slate-500 text-sm">Tidak ada karyawan dengan risiko keuangan tinggi saat ini.</p>
              </div>
            )}
          </Card>
        </section>

        {/* === SECTION 2: AUDIT TRAIL (CCTV) === */}
        <section>
          <div className="flex items-center gap-2 mb-4">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
               <Activity className="w-5 h-5" />
             </div>
             <div>
               <h2 className="text-lg font-bold text-slate-800">Audit Trail</h2>
               <p className="text-xs text-slate-500">Rekaman aktivitas sistem (Real-time Log)</p>
             </div>
          </div>

          <Card className="border-0 shadow-lg shadow-slate-200/50 overflow-hidden bg-white">
             <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3">Waktu</th>
                      <th className="px-6 py-3">Aktor (User)</th>
                      <th className="px-6 py-3">Aktivitas</th>
                      <th className="px-6 py-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-mono text-xs">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 text-slate-400 whitespace-nowrap">
                          {formatDate(log.accessedAt)}
                        </td>
                        <td className="px-6 py-3 font-bold text-slate-700">
                          {log.actor.fullName}
                          <div className="text-[10px] text-slate-400 font-normal">{log.actor.email}</div>
                        </td>
                        <td className="px-6 py-3">
                          <span className={cn(
                            "px-2 py-1 rounded border",
                            log.action.includes("DELETE") ? "bg-red-50 border-red-100 text-red-600" :
                            log.action.includes("POST") ? "bg-green-50 border-green-100 text-green-600" :
                            "bg-slate-50 border-slate-100 text-slate-600"
                          )}>
                             {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                           <Badge variant="outline" className="text-[9px]">
                             {log.actor.role}
                           </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </Card>
        </section>

      </div>
    </div>
  );
}