"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, ShieldAlert, Search, Filter, 
  Download, Eye, Loader2, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types & Services
import { RiskyEmployeeDetail } from "@/lib/types";
import { directorService } from "@/services/director.service";

// Components
import RiskFilterBar from "@/components/features/director/risk/risk-filter-bar";

export default function RiskMonitorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<RiskyEmployeeDetail[]>([]);
  
  // --- FILTER STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await directorService.getRiskMonitor();
        setEmployees(data);
      } catch (error) {
        console.error("Failed to fetch risk data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Generate Options untuk Filter secara Dinamis
  const unitOptions = Array.from(new Set(employees.map(e => e.unitName)))
    .sort()
    .map(unit => ({ label: unit, value: unit }));

  const statusOptions = [
    { label: "Bahaya", value: "BAHAYA" },
    { label: "Waspada", value: "WASPADA" },
    { label: "Sehat", value: "SEHAT" },
  ];

  // 3. Logic Filtering (Multi-condition)
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.unitName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesUnit = filterUnit ? emp.unitName === filterUnit : true;
    const matchesStatus = filterStatus ? emp.status === filterStatus : true;

    return matchesSearch && matchesUnit && matchesStatus;
  });

  return (
    <div className="space-y-6 min-h-screen pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Button 
            variant="ghost" 
            className="pl-0 hover:bg-transparent hover:text-slate-600 text-slate-400 mb-2 h-auto py-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
          </Button>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-600" />
            Risk Monitor Center
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-2xl">
            Daftar lengkap karyawan yang terindikasi memiliki risiko kesehatan finansial <span className="font-bold text-rose-600 bg-rose-50 px-1 rounded">BAHAYA</span> atau <span className="font-bold text-amber-600 bg-amber-50 px-1 rounded">WASPADA</span>.
          </p>
        </div>
        
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2 border-slate-200 text-slate-600 bg-white shadow-sm hover:bg-slate-50">
             <Download className="w-4 h-4" /> Export CSV
           </Button>
        </div>
      </div>

      {/* --- CONTROL BAR --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between sticky top-20 z-30">
        
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Cari nama karyawan..." 
                  className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
            {/* <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0"> */}
                <RiskFilterBar 
                    label="Status" 
                    options={statusOptions} 
                    selectedValue={filterStatus}
                    onValueChange={setFilterStatus}
                    placeholder="Semua Status"
                />
                <RiskFilterBar 
                    label="Unit Kerja" 
                    options={unitOptions} 
                    selectedValue={filterUnit}
                    onValueChange={setFilterUnit}
                    placeholder="Semua Unit"
                />
            {/* </div> */}
        </div>
        
        {/* Count Badge */}
        <div className="flex items-center gap-3 text-sm text-slate-500 w-full xl:w-auto justify-between xl:justify-end border-t xl:border-t-0 pt-3 xl:pt-0">
           <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 ml-auto">
             <Filter className="w-4 h-4" />
             <span className="font-medium">{filteredEmployees.length}</span>
             <span className="text-slate-400">Data Ditemukan</span>
           </div>
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
           <div className="p-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
              <p className="text-sm font-medium">Mengambil data risiko...</p>
           </div>
        ) : filteredEmployees.length === 0 ? (
           <div className="p-20 text-center flex flex-col items-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-600 text-lg">Tidak ada data ditemukan</h3>
              <p className="text-sm max-w-xs mt-1">Coba ubah kata kunci pencarian atau reset filter Anda.</p>
              {(searchQuery || filterUnit || filterStatus) && (
                <Button 
                    variant="link" 
                    onClick={() => { setSearchQuery(""); setFilterUnit(""); setFilterStatus(""); }} 
                    className="mt-2 text-rose-600"
                >
                  Reset Semua Filter
                </Button>
              )}
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Identitas Karyawan</th>
                  <th className="px-6 py-4">Unit Kerja</th>
                  <th className="px-6 py-4 text-center">Status Kesehatan</th>
                  <th className="px-6 py-4 text-center">Health Score</th>
                  <th className="px-6 py-4 text-center">Debt Ratio</th>
                  <th className="px-6 py-4 text-center">Last Checkup</th>
                  <th className="px-6 py-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-rose-50/10 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-sm">{emp.fullName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">ID: {emp.id.substring(0,8)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-slate-50 text-slate-600 text-xs font-medium border border-slate-100">
                        {emp.unitName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline" className={cn(
                        "border-0 font-black text-[10px] px-2 py-0.5 uppercase",
                        emp.status === "BAHAYA" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {emp.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={cn(
                          "font-black text-lg",
                          emp.healthScore < 50 ? "text-rose-600" : "text-amber-600"
                        )}>
                          {emp.healthScore}
                        </span>
                        <span className="text-[9px] text-slate-400">/ 100</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 font-medium">
                      {emp.debtToIncomeRatio ? `${emp.debtToIncomeRatio}%` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 text-xs">
                      {new Date(emp.lastCheckDate).toLocaleDateString("id-ID", {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-all shadow-sm"
                        onClick={() => router.push(`/director/employees/${emp.id}/checkup`)}
                      >
                        Audit Detail <Eye className="w-3 h-3 ml-2" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}