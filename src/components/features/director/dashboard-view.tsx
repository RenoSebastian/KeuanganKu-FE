"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, Activity, Users, FileText, 
  Lock, Loader2, TrendingUp, AlertOctagon,
  Building, ArrowUpRight, CheckCircle2, Search, X, Eye, Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Types
import { 
  DirectorDashboardStats, 
  UnitHealthRanking, 
  RiskyEmployeeDetail,
  User 
} from "@/lib/types";

// Service (Hanya untuk Client-Side Action seperti Search)
import { directorService } from "@/services/director.service";

// Definisi Props sesuai Payload Backend Phase 5
interface DashboardSummaryDto {
  stats: DirectorDashboardStats;
  topRiskyEmployees: RiskyEmployeeDetail[];
  unitRankings: UnitHealthRanking[];
  meta: {
    generatedAt: string | Date;
  };
}

interface DashboardViewProps {
  initialData: DashboardSummaryDto;
}

export default function DashboardView({ initialData }: DashboardViewProps) {
  const router = useRouter();
  
  // Destructure Data dari Server (SSR) - Tidak perlu Loading State untuk ini
  const { stats, topRiskyEmployees, unitRankings, meta } = initialData;

  // --- CLIENT SIDE STATE (Search & Interaction) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search Logic with Debounce
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
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Helper Formatter
  const formatMoney = (val: number) => 
    new Intl.NumberFormat("id-ID", { 
      style: "currency", 
      currency: "IDR", 
      maximumFractionDigits: 0,
      notation: "compact" 
    }).format(val);

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-full w-full pb-24">
      
      {/* --- HEADER VISUAL (EXECUTIVE THEME) --- */}
      <div className="bg-slate-900 pt-10 pb-28 px-5 md:px-10 relative overflow-hidden shadow-2xl rounded-3xl mb-8 mx-4 mt-4">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-150 h-150 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-75 h-75 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <Lock className="w-3 h-3 text-emerald-400" /> 
                    <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-100">
                        Executive View
                    </span>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>Data as of {formatTime(meta.generatedAt)}</span>
                </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Dashboard Kinerja
            </h1>
            <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
              Analisa kesehatan finansial SDM secara menyeluruh. Data diperbarui secara real-time untuk mendukung pengambilan keputusan strategis.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 -mt-20 relative z-20 space-y-8">
        
        {/* --- KPI STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Card 1: Health Index */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
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

          {/* Card 2: Risk Count (Warning) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-rose-500 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-0 text-[9px] font-black uppercase tracking-wider">
                Action Needed
              </Badge>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">High Risk Employees</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                 {stats?.riskyEmployeesCount || 0} 
                 <span className="text-sm font-medium text-slate-400 ml-1">Orang</span>
              </h3>
            </div>
          </div>

          {/* Card 3: Total Employees */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total SDM</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stats?.totalEmployees || 0}</h3>
            </div>
          </div>

          {/* Card 4: Total Assets */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-cyan-50 rounded-xl text-cyan-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Aset (Est)</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{formatMoney(stats?.totalAssetsManaged || 0)}</h3>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT SPLIT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* LEFT COLUMN: Search & Unit Rankings */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-150">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
               <div className="flex justify-between items-center">
                  <div>
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <Building className="w-5 h-5 text-slate-500" /> Profil Unit Kerja
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Peringkat kesehatan finansial per divisi</p>
                  </div>
               </div>

               {/* SEARCH INPUT */}
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Cari karyawan berdasarkan Nama atau Unit..." 
                    className="pl-9 bg-white border-slate-200 focus:border-emerald-500 transition-all"
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
            
            <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
              
              {/* STATE 1: LOADING SEARCH */}
              {isSearching && (
                <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                   <Loader2 className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
                   <p className="text-sm">Mencari data...</p>
                </div>
              )}

              {/* STATE 2: SEARCH RESULTS */}
              {!isSearching && searchQuery.length > 2 && searchResults.length > 0 && (
                 searchResults.map((user) => (
                    <div 
                      key={user.id} 
                      className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                      onClick={() => router.push(`/director/employees/${user.id}/checkup`)}
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                             {user.fullName.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{user.fullName}</h4>
                             <p className="text-xs text-slate-500">{user.unitKerja?.name || "Unit Tidak Diketahui"}</p>
                          </div>
                       </div>
                       <Button 
                         variant="ghost" size="sm" 
                         className="text-xs text-slate-400 group-hover:text-emerald-600"
                       >
                         Lihat Detail <ArrowUpRight className="w-3 h-3 ml-1" />
                       </Button>
                    </div>
                 ))
              )}

              {/* STATE 3: SEARCH NOT FOUND */}
              {!isSearching && searchQuery.length > 2 && searchResults.length === 0 && (
                <div className="p-10 text-center text-slate-400">
                   <p>Tidak ditemukan karyawan dengan kata kunci "{searchQuery}"</p>
                </div>
              )}

              {/* STATE 4: DEFAULT VIEW (UNIT RANKINGS) */}
              {searchQuery.length <= 2 && (
                unitRankings.length === 0 ? (
                   <div className="p-8 text-center text-slate-400 text-sm">Belum ada data unit kerja.</div>
                ) : (
                  unitRankings.map((unit, index) => (
                      <div key={unit.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center gap-4">
                        <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold text-xs">
                            {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-2">
                                <h4 className="font-bold text-slate-700 text-sm truncate">{unit.unitName}</h4>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "text-[10px] font-bold px-2 py-0.5 rounded border",
                                      unit.status === "SEHAT" ? "text-emerald-700 bg-emerald-50 border-emerald-100" :
                                      unit.status === "WASPADA" ? "text-amber-700 bg-amber-50 border-amber-100" : 
                                      "text-rose-700 bg-rose-50 border-rose-100"
                                    )}>
                                      {unit.status}
                                    </span>
                                    <span className="text-xs font-bold text-slate-600">{unit.avgScore}</span>
                                </div>
                            </div>
                            
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                      "h-full rounded-full",
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

          {/* RIGHT COLUMN: Risk Monitor */}
          <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden h-fit">
            <div className="p-5 border-b border-rose-100 bg-rose-50/30">
               <h3 className="font-bold text-rose-700 text-base flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4" /> Risk Monitor
               </h3>
               <p className="text-[10px] text-rose-600/80 mt-1 uppercase tracking-wider font-bold">Priority Attention Required</p>
            </div>

            <div className="divide-y divide-rose-50 max-h-150 overflow-y-auto">
               {topRiskyEmployees.length === 0 ? (
                  <div className="p-8 text-center text-emerald-600 text-sm font-medium">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
                      Tidak ada karyawan berisiko tinggi saat ini.
                  </div>
               ) : (
                   topRiskyEmployees.map((emp) => (
                    <div key={emp.id} className="p-4 hover:bg-rose-50/20 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                               <h4 className="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition-colors">{emp.fullName}</h4>
                               <p className="text-[10px] text-slate-500 uppercase mt-0.5">{emp.unitName}</p>
                           </div>
                           <Badge variant="outline" className={cn(
                               "text-[9px] uppercase font-black border-0",
                               emp.status === "BAHAYA" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                           )}>
                               {emp.status}
                           </Badge>
                        </div>
                        
                        <div className="flex justify-between items-end mt-3">
                           <div className="text-center bg-slate-50 px-3 py-1 rounded">
                               <p className="text-[9px] text-slate-400 uppercase font-bold">Health Score</p>
                               <p className="text-sm font-black text-rose-600">{emp.healthScore}</p>
                           </div>
                           
                           {/* TOMBOL AUDIT */}
                           <Button 
                             onClick={() => router.push(`/director/employees/${emp.id}/checkup`)}
                             variant="outline"
                             size="sm" 
                             className="h-8 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                           >
                             Audit <Eye className="w-3 h-3 ml-1" />
                           </Button>
                        </div>
                    </div>
                   ))
               )}
            </div>
            
            <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                <button 
                    onClick={() => router.push('/director/risk-monitor')}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest flex items-center justify-center gap-1 w-full"
                >
                    View Full List <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>
          </div>

        </div>

        {/* --- REPORT SECTION --- */}
        <section className="bg-slate-900 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
           
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 text-center md:text-left">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-xl text-white rounded-2xl border border-white/10 flex items-center justify-center">
                     <FileText className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="font-bold text-white text-lg mb-1">Executive Report Generator</h4>
                     <p className="text-sm text-slate-400 max-w-md">
                        Unduh laporan PDF komprehensif untuk keperluan rapat direksi. Mencakup analisis demografi dan kesehatan finansial.
                     </p>
                  </div>
              </div>
              <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-6 h-12 rounded-xl transition-all">
                  Download Report <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
           </div>
        </section>

      </div>
    </div>
  );
}