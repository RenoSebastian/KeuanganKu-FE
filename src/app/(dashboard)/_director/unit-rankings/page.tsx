"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Building, Users, 
  TrendingUp, TrendingDown, Loader2, 
  BarChart3, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Services & Types
import { directorService } from "@/services/director.service";
import { UnitHealthRanking } from "@/lib/types";

export default function UnitRankingsPage() {
  const router = useRouter();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [units, setUnits] = useState<UnitHealthRanking[]>([]);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC"); // ASC = Terendah (Bahaya) dulu

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await directorService.getUnitRankings();
        setUnits(data);
      } catch (error) {
        console.error("Gagal mengambil data unit:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Sorting Logic
  // ASC: Menampilkan score terendah dulu (Prioritas Penanganan)
  // DESC: Menampilkan score tertinggi dulu (Apresiasi)
  const sortedUnits = [...units].sort((a, b) => {
    return sortOrder === "ASC" 
      ? a.avgScore - b.avgScore 
      : b.avgScore - a.avgScore;
  });

  // Helper Warna Status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SEHAT": return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "WASPADA": return "text-amber-700 bg-amber-50 border-amber-200";
      case "BAHAYA": return "text-rose-700 bg-rose-50 border-rose-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "SEHAT": return "bg-emerald-500";
      case "WASPADA": return "bg-amber-500";
      case "BAHAYA": return "bg-rose-500";
      default: return "bg-slate-300";
    }
  };

  return (
    <div className="space-y-8 pb-20 min-h-screen">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button 
            variant="ghost" 
            className="pl-0 text-slate-500 hover:text-slate-800 hover:bg-transparent h-auto py-0 mb-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
          </Button>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <Building className="w-8 h-8 text-brand-600" />
            Peringkat Kesehatan Unit
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Analisa komparatif kesehatan finansial antar divisi/unit kerja. 
            Gunakan data ini untuk menentukan prioritas program edukasi keuangan.
          </p>
        </div>

        {/* SORT CONTROL */}
        <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <button
                onClick={() => setSortOrder("ASC")}
                className={cn(
                    "px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-all",
                    sortOrder === "ASC" ? "bg-rose-50 text-rose-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"
                )}
            >
                <TrendingDown className="w-4 h-4" />
                Prioritas (Low Score)
            </button>
            <button
                onClick={() => setSortOrder("DESC")}
                className={cn(
                    "px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-all",
                    sortOrder === "DESC" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-slate-50"
                )}
            >
                <TrendingUp className="w-4 h-4" />
                Top Performers
            </button>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            <p className="text-sm font-medium tracking-wide uppercase">Menganalisa Data Unit...</p>
        </div>
      ) : units.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <BarChart3 className="w-12 h-12 text-slate-300 mb-2" />
            <p className="font-bold text-slate-600">Belum Ada Data</p>
            <p className="text-xs">Data unit kerja belum tersedia untuk ditampilkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedUnits.map((unit, index) => (
                <div 
                    key={unit.id}
                    className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-brand-200 transition-all duration-300 relative overflow-hidden"
                >
                    {/* Rank Number Background */}
                    <div className="absolute -top-4 -right-4 text-[100px] font-black text-slate-50 group-hover:text-brand-50/50 transition-colors select-none z-0">
                        #{index + 1}
                    </div>

                    <div className="relative z-10">
                        {/* Header Card */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                <Building className="w-6 h-6" />
                            </div>
                            <Badge variant="outline" className={cn("font-bold border uppercase tracking-wider", getStatusColor(unit.status))}>
                                {unit.status}
                            </Badge>
                        </div>

                        {/* Unit Info */}
                        <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-1 group-hover:text-brand-700 transition-colors">
                            {unit.unitName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                            <Users className="w-3.5 h-3.5" />
                            <span>{unit.employeeCount} Karyawan Terdaftar</span>
                        </div>

                        {/* Score Metrics */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">Avg. Health Score</span>
                                <span className={cn("text-2xl font-black", 
                                    unit.avgScore >= 80 ? "text-emerald-600" :
                                    unit.avgScore >= 60 ? "text-amber-500" : "text-rose-600"
                                )}>
                                    {unit.avgScore}
                                </span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                    className={cn("h-full rounded-full transition-all duration-1000", getProgressColor(unit.status))}
                                    style={{ width: `${unit.avgScore}%` }}
                                />
                            </div>
                        </div>

                        {/* Alert jika Bahaya */}
                        {unit.status === "BAHAYA" && (
                            <div className="mt-4 flex items-start gap-2 text-[10px] text-rose-600 bg-rose-50 p-2 rounded border border-rose-100">
                                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                <p>Perhatian: Skor rata-rata unit ini di bawah standar minimum perusahaan. Disarankan intervensi.</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}