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
  SearchResult, // Wajib import dari types.ts yang sudah diupdate
} from "@/lib/types";

// Service
import { directorService } from "@/services/director.service";

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
  const { stats, topRiskyEmployees, unitRankings, meta } = initialData;

  const [searchQuery, setSearchQuery] = useState("");
  // State menggunakan tipe SearchResult[]
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search Logic (Debounce 500ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) { // Minimal 2 karakter agar Meilisearch bekerja optimal
        setIsSearching(true);
        try {
          const results = await directorService.searchEmployees(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Hybrid Search Error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const formatMoney = (val: number) => 
    new Intl.NumberFormat("id-ID", { 
      style: "currency", currency: "IDR", maximumFractionDigits: 0, notation: "compact" 
    }).format(val);

  const formatTime = (date: string | Date) => {
    try { return new Date(date).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }); } 
    catch (e) { return "-"; }
  };

  return (
    <div className="min-h-full w-full pb-24">
      {/* --- HEADER (Visual Code omitted for brevity, same as yours) --- */}
      <div className="bg-slate-900 pt-10 pb-28 px-5 md:px-10 relative overflow-hidden shadow-2xl rounded-3xl mb-8 mx-4 mt-4">
         {/* ... Isi header sama ... */}
         <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-3">
               <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Dashboard Kinerja</h1>
               <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>Data as of {formatTime(meta?.generatedAt || new Date())}</span>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 -mt-20 relative z-20 space-y-8">
        
        {/* --- KPI STATS (Code omitted, same as yours) --- */}
        {/* ... */}

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
                    placeholder="Cari karyawan (Meilisearch + Trigram)..." 
                    className="pl-9 bg-white border-slate-200 focus:border-emerald-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500">
                      <X className="w-4 h-4" />
                    </button>
                  )}
               </div>
            </div>
            
            <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
              
              {/* STATE 1: LOADING */}
              {isSearching && (
                <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                   <Loader2 className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
                   <p className="text-sm">Mencari data...</p>
                </div>
              )}

              {/* STATE 2: SEARCH RESULTS (HYBRID) */}
              {!isSearching && searchQuery.length >= 2 && searchResults.length > 0 && (
                 searchResults.map((result) => (
                    <div 
                      key={result.id} 
                      className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                      onClick={() => {
                        if (result.type === "PERSON") {
                            router.push(`/director/employees/${result.redirectId}/checkup`);
                        }
                      }}
                    >
                       <div className="flex items-center gap-4">
                          {/* Avatar Initials */}
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold border shrink-0",
                            result.type === 'PERSON' ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-orange-50 text-orange-600 border-orange-100"
                          )}>
                             {result.type === 'PERSON' ? (
                                (result.title || "?").substring(0, 2).toUpperCase()
                             ) : (
                                <Building className="w-5 h-5" />
                             )}
                          </div>
                          
                          {/* Info Text */}
                          <div className="min-w-0">
                             <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors truncate">
                                    {result.title}
                                </h4>
                                {/* Badge Typo Tolerance */}
                                {result.metadata?.isFuzzy && (
                                    <Badge variant="outline" className="text-[9px] px-1 h-4 border-amber-200 bg-amber-50 text-amber-700 shrink-0">
                                        Typo?
                                    </Badge>
                                )}
                             </div>
                             <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                                {result.type === "UNIT" ? "Unit Code: " : ""}
                                {result.subtitle || "-"}
                             </p>
                          </div>
                       </div>
                       
                       <Button variant="ghost" size="sm" className="text-xs text-slate-400 group-hover:text-emerald-600">
                         Detail <ArrowUpRight className="w-3 h-3 ml-1" />
                       </Button>
                    </div>
                 ))
              )}

              {/* STATE 3: SEARCH NOT FOUND */}
              {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="p-10 text-center text-slate-400">
                   <p>Tidak ditemukan hasil untuk "{searchQuery}"</p>
                </div>
              )}

              {/* STATE 4: DEFAULT VIEW (UNIT RANKINGS) - Fallback saat tidak search */}
              {searchQuery.length < 2 && (
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
                                <span className="text-xs font-bold text-slate-600">{unit.avgScore}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full", unit.status === "SEHAT" ? "bg-emerald-500" : unit.status === "WASPADA" ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${unit.avgScore}%` }} />
                            </div>
                        </div>
                      </div>
                  ))
                )
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Risk Monitor (Code omitted, same as yours) */}
          <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden h-fit">
             {/* ... Risk Monitor Content ... */}
             <div className="p-5 border-b border-rose-100 bg-rose-50/30">
               <h3 className="font-bold text-rose-700 text-base flex items-center gap-2">
                 <ShieldAlert className="w-4 h-4" /> Risk Monitor
               </h3>
             </div>
             <div className="divide-y divide-rose-50 max-h-150 overflow-y-auto">
               {topRiskyEmployees.map((emp) => (
                  <div key={emp.id} className="p-4 hover:bg-rose-50/20 transition-colors">
                      <h4 className="font-bold text-slate-800 text-sm">{emp.fullName || "Nama Tidak Tersedia"}</h4>
                      <p className="text-[10px] text-slate-500">{emp.unitName || "-"}</p>
                  </div>
               ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}