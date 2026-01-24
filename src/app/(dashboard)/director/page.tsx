"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import Input
import { 
  ShieldAlert, Activity, Users, FileText, 
  Lock, Loader2, TrendingUp, AlertOctagon,
  Building, ArrowUpRight, Filter, Eye, CheckCircle2, Search, X
} from "lucide-react";
import { cn } from "@/lib/utils";

import { 
  DirectorDashboardStats, 
  UnitHealthRanking, 
  RiskyEmployeeDetail,
  User // Tipe data user untuk hasil search
} from "@/lib/types"; 

import { directorService } from "@/services/director.service";

export default function DirectorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [stats, setStats] = useState<DirectorDashboardStats | null>(null);
  const [unitRankings, setUnitRankings] = useState<UnitHealthRanking[]>([]);
  const [riskyEmployees, setRiskyEmployees] = useState<RiskyEmployeeDetail[]>([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 1. Initial Data Fetching
  useEffect(() => {
    const initPage = async () => {
      const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (!storedUser) {
        router.push("/login");
        return;
      }
      const user = JSON.parse(storedUser);
      if (user.role !== "DIRECTOR") {
        router.push("/"); 
        return;
      }

      try {
        const [statsData, riskData, unitData] = await Promise.all([
            directorService.getDashboardStats(),
            directorService.getRiskMonitor(),
            directorService.getUnitRankings()
        ]);
        setStats(statsData);
        setRiskyEmployees(riskData);
        setUnitRankings(unitData);
      } catch (error) {
        console.error("Gagal sinkronisasi data direksi:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initPage();
  }, [router]);

  // 2. Search Logic with Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const results = await directorService.searchEmployees(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500); // Tunggu 500ms setelah user berhenti mengetik

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const formatMoney = (val: number) => 
    new Intl.NumberFormat("id-ID", { 
      style: "currency", 
      currency: "IDR", 
      maximumFractionDigits: 0,
      notation: "compact" 
    }).format(val);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-ground gap-4">
        <Loader2 className="w-10 h-10 text-brand-700 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Verifying Executive Access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full pb-24">
      
      {/* HEADER EKSEKUTIF */}
      <div className="bg-brand-900 pt-10 pb-28 px-5 md:px-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-5 mix-blend-overlay"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-brand-800/50 backdrop-blur-md px-3 py-1 rounded-full border border-brand-700">
               <Lock className="w-3 h-3 text-brand-300" /> 
               <span className="text-[10px] font-bold tracking-widest uppercase text-brand-100">Restricted Area</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">Executive Dashboard</h1>
            <p className="text-brand-200/80 max-w-2xl text-sm md:text-base leading-relaxed">
              Analisa kesehatan finansial SDM PAM JAYA secara agregat. Fokus pada mitigasi risiko dan efektivitas program kesejahteraan.
            </p>
          </div>
          
          <div className="hidden md:block text-right">
             <div className="glass-panel bg-white/5 border-white/10 px-4 py-2 rounded-xl inline-flex items-center gap-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">System Online</span>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 -mt-20 relative z-20 space-y-8">
        
        {/* KPI STATS GRID (Tetap Sama) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-clean p-6 flex flex-col justify-between group border-t-4 border-t-emerald-500 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Health Index</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                {stats?.avgHealthScore || 0}
                <span className="text-sm font-bold text-emerald-600 ml-1">/ 100</span>
              </h3>
            </div>
          </div>

          <div className="card-clean p-6 flex flex-col justify-between group border-t-4 border-t-rose-500 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
             <div className="absolute inset-0 bg-rose-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-rose-50 rounded-xl text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-0 text-[9px] font-black uppercase tracking-wider">Action Needed</Badge>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">High Risk Employees</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight flex items-baseline gap-2">
                 {stats?.riskyEmployeesCount || 0} 
                 <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Orang</span>
              </h3>
            </div>
          </div>

          <div className="card-clean p-6 flex flex-col justify-between group border-t-4 border-t-brand-500 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-brand-50 rounded-xl text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total SDM Terdaftar</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stats?.totalEmployees || 0}</h3>
            </div>
          </div>

          <div className="card-clean p-6 flex flex-col justify-between group border-t-4 border-t-cyan-500 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Est. Total Aset</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{formatMoney(stats?.totalAssetsManaged || 0)}</h3>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT SPLIT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* LEFT: Unit Kerja & SEARCH RESULT */}
          <div className="lg:col-span-2 card-clean p-0 overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-6 border-b border-surface-border bg-surface-ground/30 space-y-4">
               <div className="flex justify-between items-center">
                  <div>
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Building className="w-5 h-5 text-brand-500" /> Profil Unit Kerja
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Peringkat kesehatan finansial per divisi</p>
                  </div>
               </div>

               {/* SEARCH BAR */}
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Cari karyawan berdasarkan Nama atau Unit..." 
                    className="pl-9 bg-white border-slate-200 focus:border-brand-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
               </div>
            </div>
            
            <div className="divide-y divide-surface-border overflow-y-auto flex-1">
              
              {/* KONDISI 1: SEDANG MENCARI (Searching...) */}
              {isSearching && (
                <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                   <Loader2 className="w-8 h-8 animate-spin mb-2 text-brand-500" />
                   <p className="text-sm">Mencari data...</p>
                </div>
              )}

              {/* KONDISI 2: HASIL PENCARIAN DITEMUKAN */}
              {!isSearching && searchQuery.length > 2 && searchResults.length > 0 && (
                 searchResults.map((user) => (
                    <div key={user.id} className="p-5 hover:bg-brand-50/30 transition-colors flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                             {user.fullName.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-800">{user.fullName}</h4>
                             <p className="text-xs text-slate-500">{user.unitKerja?.name || "Unit Tidak Diketahui"}</p>
                          </div>
                       </div>
                       <Button 
                         variant="outline" size="sm" 
                         onClick={() => router.push(`/director/${user.id}`)}
                         className="text-xs border-brand-200 text-brand-700 hover:bg-brand-50"
                       >
                         Lihat Profil
                       </Button>
                    </div>
                 ))
              )}

              {/* KONDISI 3: HASIL PENCARIAN KOSONG */}
              {!isSearching && searchQuery.length > 2 && searchResults.length === 0 && (
                <div className="p-10 text-center text-slate-400">
                   <p>Tidak ditemukan karyawan dengan kata kunci "{searchQuery}"</p>
                </div>
              )}

              {/* KONDISI 4: DEFAULT VIEW (UNIT RANKINGS) */}
              {searchQuery.length <= 2 && (
                unitRankings.length === 0 ? (
                   <div className="p-8 text-center text-slate-400 text-sm">Belum ada data unit kerja.</div>
                ) : (
                  unitRankings.map((unit, index) => (
                      <div key={unit.id} className="p-5 hover:bg-brand-50/30 transition-colors flex items-center gap-4 group">
                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold text-xs group-hover:bg-brand-600 group-hover:text-white transition-all">
                          {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-2">
                              <h4 className="font-bold text-slate-700 text-sm truncate">{unit.unitName}</h4>
                              <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-medium text-slate-400">Score</span>
                                  <span className={cn(
                                  "text-xs font-bold px-2 py-0.5 rounded border",
                                  unit.status === "SEHAT" ? "text-emerald-700 bg-emerald-50 border-emerald-100" :
                                  unit.status === "WASPADA" ? "text-amber-700 bg-amber-50 border-amber-100" : 
                                  "text-rose-700 bg-rose-50 border-rose-100"
                                  )}>
                                  {unit.avgScore}
                                  </span>
                              </div>
                          </div>
                          
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                              className={cn(
                                  "h-full rounded-full transition-all duration-1000 ease-out",
                                  unit.status === "SEHAT" ? "bg-emerald-500" :
                                  unit.status === "WASPADA" ? "bg-amber-500" : "bg-rose-500"
                              )}
                              style={{ width: `${unit.avgScore}%` }}
                              />
                          </div>
                      </div>
                      </div>
                  ))
                )
              )}
            </div>
          </div>

          {/* RIGHT: Risk Monitor (Tetap Sama) */}
          <div className="card-clean p-0 overflow-hidden h-fit border-t-4 border-t-rose-500">
            <div className="p-5 border-b border-rose-100 bg-rose-50/50">
               <h3 className="font-bold text-rose-700 text-base flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4" /> Risk Monitor
               </h3>
               <p className="text-[10px] text-rose-600/80 mt-1 uppercase tracking-wider font-bold">Priority Attention Required</p>
            </div>

            <div className="divide-y divide-surface-border max-h-[500px] overflow-y-auto">
               {riskyEmployees.length === 0 ? (
                  <div className="p-8 text-center text-emerald-600 text-sm font-medium">
                     <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
                     Tidak ada karyawan berisiko tinggi saat ini.
                  </div>
               ) : (
                   riskyEmployees.map((emp) => (
                    <div key={emp.id} className="p-4 hover:bg-rose-50/20 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">{emp.fullName}</h4>
                            <span className="text-[10px] text-slate-500 font-medium uppercase inline-block bg-slate-100 px-1.5 py-0.5 rounded mt-1">
                                {emp.unitName}
                            </span>
                        </div>
                        <Badge variant="outline" className={cn(
                            "text-[9px] uppercase font-black border-0",
                            emp.status === "BAHAYA" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                        )}>
                            {emp.status}
                        </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                            <p className="text-[9px] text-slate-400 uppercase font-bold">Health</p>
                            <p className="text-sm font-black text-rose-600">{emp.healthScore}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                            <p className="text-[9px] text-slate-400 uppercase font-bold">Debt Ratio</p>
                            <p className="text-sm font-black text-slate-700">
                                {emp.debtToIncomeRatio ?? 0}%
                            </p>
                        </div>
                        </div>
                        
                        <Button 
                        onClick={() => router.push(`/director/${emp.id}`)}
                        variant="outline"
                        size="sm" 
                        className="w-full h-8 text-xs font-bold border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-200"
                        >
                        Audit Profil <Eye className="w-3 h-3 ml-2" />
                        </Button>
                    </div>
                    ))
               )}
            </div>
            
            <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                <button className="text-[10px] font-bold text-slate-500 hover:text-brand-600 uppercase tracking-widest flex items-center justify-center gap-1 w-full">
                    View All Risks <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>
          </div>

        </div>

        {/* --- REPORT SECTION --- */}
        <section className="bg-pam-gradient p-8 rounded-3xl shadow-xl shadow-brand-900/10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-700" />
           
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 text-center md:text-left">
                 <div className="w-16 h-16 bg-white/20 backdrop-blur-xl text-white rounded-2xl border border-white/20 flex items-center justify-center shadow-inner">
                    <FileText className="w-8 h-8" />
                 </div>
                 <div>
                    <h4 className="font-black text-white text-xl mb-1">Executive Report Generator</h4>
                    <p className="text-sm text-brand-50 max-w-md opacity-90 leading-relaxed">
                        Unduh laporan komprehensif untuk Rapat Direksi. Mencakup analisis demografi, kesehatan finansial, dan rekomendasi intervensi.
                    </p>
                 </div>
              </div>
              <Button className="bg-white text-brand-700 hover:bg-brand-50 font-bold px-6 h-12 rounded-xl shadow-lg w-full md:w-auto transition-all hover:scale-105">
                 Download PDF <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
           </div>
        </section>

      </div>
    </div>
  );
}