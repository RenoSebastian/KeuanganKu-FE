"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, Activity, Users, FileText, 
  Lock, Eye, Loader2, TrendingUp, AlertOctagon,
  Building, ArrowUpRight, Filter 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Impor kontrak data dan simulasi data dari fondasi yang telah diperbarui
import { 
  DirectorDashboardStats, 
  UnitHealthRanking, 
  RiskyEmployeeDetail 
} from "@/lib/types"; 
import { 
  DIRECTOR_STATS_MOCK, 
  UNIT_HEALTH_RANKING_MOCK, 
  RISKY_EMPLOYEES_MOCK 
} from "@/lib/dummy-data"; 

export default function DirectorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // State manajemen data eksekutif
  const [stats, setStats] = useState<DirectorDashboardStats | null>(null);
  const [unitRankings, setUnitRankings] = useState<UnitHealthRanking[]>([]);
  const [riskyEmployees, setRiskyEmployees] = useState<RiskyEmployeeDetail[]>([]);

  useEffect(() => {
    const initPage = async () => {
      // Proteksi Akses: Hanya role DIRECTOR yang diizinkan
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(storedUser);
      if (user.role !== "DIRECTOR") {
        alert("AKSES DITOLAK: Otoritas Anda tidak mencukupi untuk area ini.");
        router.push("/"); 
        return;
      }

      // Memuat data simulasi untuk keperluan demo eksekutif
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(DIRECTOR_STATS_MOCK);
        setUnitRankings(UNIT_HEALTH_RANKING_MOCK);
        setRiskyEmployees(RISKY_EMPLOYEES_MOCK);
      } catch (error) {
        console.error("Gagal sinkronisasi data direksi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initPage();
  }, [router]);

  // Formatter untuk angka besar dengan notasi ringkas (contoh: 45 M)
  const formatMoney = (val: number) => 
    new Intl.NumberFormat("id-ID", { 
      style: "currency", 
      currency: "IDR", 
      maximumFractionDigits: 0,
      notation: "compact" 
    }).format(val);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-slate-800 animate-spin" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Otoritas Terverifikasi. Memuat Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-100/50 pb-24">
      
      {/* HEADER EKSEKUTIF (Premium Dark Theme) */}
      <div className="bg-slate-900 text-white pt-10 pb-24 px-5 md:px-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
               <Badge variant="outline" className="border-blue-400/30 text-blue-300 bg-blue-900/20 uppercase tracking-widest text-[10px]">
                  <Lock className="w-3 h-3 mr-1" /> Restricted Area
               </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Executive Dashboard</h1>
            <p className="text-slate-400 mt-2 max-w-xl text-sm md:text-base leading-relaxed">
              Analisa kesehatan finansial SDM PAM JAYA secara agregat. Fokus pada mitigasi risiko dan efektivitas program kesejahteraan.
            </p>
          </div>
          
          <div className="hidden md:block text-right">
             <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg inline-flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono text-slate-300 uppercase tracking-wider">System Status: Online</span>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 -mt-16 relative z-20 space-y-8">
        
        {/* KPI STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 shadow-xl border-0 flex flex-col justify-between hover:translate-y-[-2px] transition-all bg-white group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Corporate Health Index</p>
              <h3 className="text-3xl font-black text-slate-800">
                {stats?.avgHealthScore}
                <span className="text-sm font-normal text-slate-400 ml-1">/ 100</span>
              </h3>
            </div>
          </Card>

          <Card className="p-6 shadow-xl border-0 flex flex-col justify-between hover:translate-y-[-2px] transition-all bg-white ring-1 ring-red-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-50 rounded-xl text-red-600">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <Badge className="bg-red-100 text-red-700 border-0 text-[10px] font-bold tracking-tighter">WATCHLIST</Badge>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Intervensi Diperlukan</p>
              <h3 className="text-3xl font-black text-slate-800">{stats?.riskyEmployeesCount} <span className="text-sm font-normal text-slate-400">Karyawan</span></h3>
            </div>
          </Card>

          <Card className="p-6 shadow-xl border-0 flex flex-col justify-between hover:translate-y-[-2px] transition-all bg-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total SDM Aktif</p>
              <h3 className="text-3xl font-black text-slate-800">{stats?.totalEmployees}</h3>
            </div>
          </Card>

          <Card className="p-6 shadow-xl border-0 flex flex-col justify-between hover:translate-y-[-2px] transition-all bg-white">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assets Managed (Est)</p>
              <h3 className="text-3xl font-black text-slate-800">{formatMoney(stats?.totalAssetsManaged || 0)}</h3>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Unit Kerja Health Ranking */}
          <Card className="lg:col-span-2 border-0 shadow-lg p-0 overflow-hidden bg-white">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <div>
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Building className="w-5 h-5 text-slate-400" /> Profil Unit Kerja
                  </h3>
                  <p className="text-xs text-slate-500">Perbandingan kesehatan finansial antar divisi</p>
               </div>
               <Button variant="outline" size="sm" className="text-xs h-8 border-slate-200">
                 <Filter className="w-3 h-3 mr-2" /> Sortir Unit
               </Button>
            </div>
            
            <div className="divide-y divide-slate-50">
              {unitRankings.map((unit, index) => (
                <div key={unit.id} className="p-5 border-slate-50 hover:bg-slate-50 transition-colors flex items-center gap-4 group">
                   <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold text-xs group-hover:bg-slate-900 group-hover:text-white transition-all">
                     {index + 1}
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-bold text-slate-700 text-sm">{unit.unitName}</h4>
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded",
                          unit.status === "SEHAT" ? "text-emerald-600 bg-emerald-50" :
                          unit.status === "WASPADA" ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50"
                        )}>
                          Skor: {unit.avgScore}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            unit.status === "SEHAT" ? "bg-emerald-500" :
                            unit.status === "WASPADA" ? "bg-amber-500" : "bg-red-500"
                          )}
                          style={{ width: `${unit.avgScore}%` }}
                        />
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Risk Monitor */}
          <Card className="border-0 shadow-lg p-0 overflow-hidden bg-white h-fit">
            <div className="p-6 border-b border-slate-100 bg-red-50/30">
               <h3 className="font-bold text-red-700 text-lg flex items-center gap-2">
                 <ShieldAlert className="w-5 h-5" /> Risk Monitor
               </h3>
               <p className="text-xs text-red-600/80 tracking-tight">Anomali rasio pengeluaran & utang</p>
            </div>

            <div className="divide-y divide-slate-100">
               {riskyEmployees.map((emp) => (
                 <div key={emp.id} className="p-5 hover:bg-red-50/10 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                       <div>
                          <h4 className="font-bold text-slate-800 text-sm leading-none">{emp.fullName}</h4>
                          <span className="text-[10px] text-slate-400 font-medium uppercase mt-1 inline-block">{emp.unitName}</span>
                       </div>
                       <Badge variant="outline" className={cn(
                         "text-[9px] uppercase font-black",
                         emp.status === "BAHAYA" ? "text-red-600 border-red-200 bg-white" : "text-amber-600 border-amber-200 bg-white"
                       )}>
                          {emp.status}
                       </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                       <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                          <p className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">Health</p>
                          <p className="text-base font-black text-red-600 leading-tight">{emp.healthScore}</p>
                       </div>
                       <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                          <p className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">Debt Ratio</p>
                          <p className="text-base font-black text-slate-700 leading-tight">{emp.debtToIncomeRatio}%</p>
                       </div>
                    </div>
                    {/* Tahap 5: Implementasi Navigasi ke Halaman Audit Personal */}
                    <Button 
                      onClick={() => router.push(`/director/${emp.id}`)}
                      variant="ghost" 
                      size="sm" 
                      className="w-full h-8 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all"
                    >
                       Audit Profil <Eye className="w-3 h-3 ml-2" />
                    </Button>
                 </div>
               ))}
            </div>
          </Card>

        </div>

        {/* Laporan Kesejahteraan SDM */}
        <section className="bg-slate-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all" />
           
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 text-center md:text-left">
                 <div className="p-4 bg-white/10 backdrop-blur-xl text-blue-400 rounded-2xl border border-white/10">
                    <FileText className="w-8 h-8" />
                 </div>
                 <div>
                    <h4 className="font-black text-white text-xl">Laporan Kesejahteraan SDM</h4>
                    <p className="text-sm text-slate-400 max-w-sm">Eksportir data komprehensif untuk evaluasi kebijakan kenaikan gaji atau bantuan finansial.</p>
                 </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-blue-600/30 w-full md:w-auto">
                 Download Laporan <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
           </div>
        </section>

      </div>
    </div>
  );
}