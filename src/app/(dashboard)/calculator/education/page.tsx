"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  GraduationCap, Plus, Users, Settings2, 
  Trash2, RefreshCcw, Save, Download, Info, Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import Komponen & Logic
import { ChildWizard } from "@/components/features/education/child-wizard";
import { ChildCard } from "@/components/features/education/child-card";
import { SummaryBoard } from "@/components/features/education/summary-board";
import { calculatePortfolio } from "@/lib/financial-math";
import { ChildProfile, PortfolioSummary, EducationPlanResponse, PlanInput } from "@/lib/types";
import { financialService } from "@/services/financial.service";

export default function EducationPage() {
  const [view, setView] = useState<"DASHBOARD" | "WIZARD">("DASHBOARD");
  
  // Data Utama (List Anak dari DB)
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Asumsi Ekonomi (Global untuk semua anak - Local State untuk Slider)
  const [assumptions, setAssumptions] = useState({
    inflation: 10,   // Default Inflasi Pendidikan 10%
    returnRate: 12   // Default Return Investasi 12%
  });

  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);

  // --- 1. FETCH DATA DARI API ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await financialService.getEducationPlans();
      
      // MAPPING: Convert Format Backend (Response) ke Format Frontend (ChildProfile)
      // Agar logika UI 'sementara_1' tetap jalan tanpa ubah banyak kode
      const mappedChildren: ChildProfile[] = data.map((plan: EducationPlanResponse) => {
        
        // Reconstruct 'Plans' dari 'StagesBreakdown'
        // Kita perlu mengelompokkan kembali data granular menjadi per Jenjang
        const breakdown = plan.calculation.stagesBreakdown;
        const uniqueLevels = Array.from(new Set(breakdown.map(b => b.level)));
        
        const reconstructedPlans: PlanInput[] = uniqueLevels.map(level => {
          const entryItem = breakdown.find(b => b.level === level && b.costType === "ENTRY");
          const annualItem = breakdown.find(b => b.level === level && b.costType === "ANNUAL");
          
          // [FIX Logic] Menentukan monthlyFee berdasarkan level
          let monthlyFee = 0;
          if (annualItem) {
             // Jika jenjang kuliah (PT/S2), biasanya backend simpan per semester/tahun
             // Kita reverse engineer menjadi "biaya periodik" yang diharapkan frontend
             // Menggunakan string check yang aman
             const isHigherEd = level === "PT" || level === "KULIAH" || (level as string) === "S2";
             
             monthlyFee = isHigherEd
                ? annualItem.currentCost / 2  // Asumsi data backend menyimpan total setahun, jadi dibagi 2 semester
                : annualItem.currentCost / 12; // Selain kuliah, dibagi 12 bulan
          }

          // Map level backend ke frontend stageId
          // Backend mungkin return "PT", frontend butuh "KULIAH"
          const stageIdMap: Record<string, string> = { "PT": "KULIAH" };
          const frontendStageId = stageIdMap[level] || level;

          return {
            stageId: frontendStageId,
            startGrade: 1, // Default start grade karena data ini mungkin hilang saat flattening di backend
            costNow: {
              entryFee: entryItem ? entryItem.currentCost : 0,
              monthlyFee: monthlyFee
            }
          };
        });

        return {
          id: plan.plan.id,
          name: plan.plan.childName,
          dob: plan.plan.childDob,
          gender: "L", // Default, karena gender tidak ada di response plan saat ini
          avatarColor: "bg-blue-100 text-blue-600",
          plans: reconstructedPlans
        };
      });

      setChildren(mappedChildren);
    } catch (error) {
      console.error("Failed to fetch education plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Panggil Fetch saat mount
  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. REALTIME CALCULATION ---
  // Setiap kali 'children' (dari DB) atau 'assumptions' (Slider) berubah, hitung ulang Portfolio lokal.
  useEffect(() => {
    if (children.length > 0) {
      const result = calculatePortfolio(children, assumptions.inflation, assumptions.returnRate);
      setPortfolio(result);
    } else {
      setPortfolio(null);
    }
  }, [children, assumptions]);

  // --- HANDLERS ---

  // Dipanggil setelah Wizard selesai save ke DB
  const handleWizardSuccess = () => {
    fetchData(); // Refresh data dari DB
    setView("DASHBOARD");
  };

  const handleDeleteChild = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus rencana pendidikan anak ini?")) {
      try {
        await financialService.deleteEducationPlan(id);
        fetchData(); // Refresh data setelah hapus
      } catch (error) {
        alert("Gagal menghapus data.");
      }
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12">
      
      {/* Header Decoration */}
      <div className="bg-blue-600 h-48 md:h-64 w-full absolute top-0 left-0 rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-xl z-0 overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 pt-8 md:pt-16">
        
        {/* Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 md:mb-12">
           <div className="text-white mx-auto md:mx-0 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 mb-3">
                  <GraduationCap className="w-4 h-4 text-blue-100" />
                  <span className="text-xs font-bold text-blue-50 tracking-wider uppercase">Education Planner</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Dana Pendidikan</h1>
              <p className="text-blue-100 text-sm md:text-base max-w-lg leading-relaxed">
                Simulasi dana pendidikan presisi dengan metode <i>Sinking Fund</i>. Data tersimpan aman.
              </p>
           </div>

           {view === "DASHBOARD" && (
             <Button 
               onClick={() => setView("WIZARD")} 
               className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl border-0 font-bold rounded-xl h-12 px-6"
             >
               <Plus className="w-5 h-5 mr-2" /> Tambah Anak
             </Button>
           )}
        </div>

        <div className="space-y-8">
           
           {/* MODE WIZARD */}
           {view === "WIZARD" && (
             <Card className="p-6 md:p-8 rounded-[2rem] shadow-2xl border-white/60 bg-white/95 backdrop-blur-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <ChildWizard 
                  onSave={handleWizardSuccess} 
                  onCancel={() => setView("DASHBOARD")} 
                />
             </Card>
           )}

           {/* MODE DASHBOARD */}
           {view === "DASHBOARD" && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Result & List */}
                <div className="lg:col-span-2 space-y-6">
                   
                   {/* Summary Board */}
                   <SummaryBoard summary={portfolio} isLoading={isLoading} />

                   {/* List Anak */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-500" />
                          Daftar Rencana Anak
                        </h3>
                        <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded-md">
                          {children.length} Anak
                        </span>
                      </div>

                      {isLoading ? (
                        <div className="flex justify-center py-12">
                           <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                      ) : children.length === 0 ? (
                        <Card className="p-12 border-dashed border-2 border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center rounded-3xl">
                           <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
                             <GraduationCap className="w-8 h-8" />
                           </div>
                           <p className="text-slate-500 font-medium">Belum ada data anak.</p>
                           <p className="text-sm text-slate-400 mb-6">Mulai tambahkan rencana pendidikan sekarang.</p>
                           <Button onClick={() => setView("WIZARD")} variant="outline">Mulai Buat Rencana</Button>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                           {children.map(child => {
                             // Cari hasil perhitungan spesifik anak ini dari portfolio global
                             const childResult = portfolio?.details.find(d => d.childId === child.id);
                             return (
                               <ChildCard 
                                 key={child.id} 
                                 profile={child} 
                                 result={childResult}
                                 onDelete={handleDeleteChild}
                               />
                             );
                           })}
                        </div>
                      )}
                   </div>
                </div>

                {/* Right Column: Settings / Assumptions */}
                <Card className="p-6 rounded-[2rem] border-white/60 bg-white/80 backdrop-blur-md shadow-sm space-y-8 sticky top-8 h-fit">
                   <div className="flex items-center gap-2 mb-2 pb-4 border-b border-slate-100">
                      <Settings2 className="w-5 h-5 text-slate-400" />
                      <h3 className="font-bold text-slate-700">Asumsi Ekonomi</h3>
                   </div>

                   {/* [FIX] Slider implementation fixed here */}
                   <div className="space-y-3">
                     <div className="flex justify-between text-sm">
                       <span className="text-slate-500 font-medium">Inflasi Pendidikan</span>
                       <span className="font-bold text-slate-700">{assumptions.inflation}% / tahun</span>
                     </div>
                     <Slider 
                       value={assumptions.inflation}
                       onValueChange={(val) => setAssumptions(prev => ({ ...prev, inflation: val }))}
                       min={5} max={20}
                       step={1}
                       className="accent-red-500"
                     />
                   </div>
                   
                   <div className="space-y-3">
                     <div className="flex justify-between text-sm">
                       <span className="text-slate-500 font-medium">Return Investasi</span>
                       <span className="font-bold text-slate-700">{assumptions.returnRate}% / tahun</span>
                     </div>
                     <Slider 
                       value={assumptions.returnRate}
                       onValueChange={(val) => setAssumptions(prev => ({ ...prev, returnRate: val }))}
                       min={2} max={20}
                       step={1}
                       className="accent-green-500"
                     />
                   </div>

                   <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <p className="text-xs text-blue-700 leading-relaxed text-justify">
                        <b>Tips:</b> Anda bisa mengubah asumsi ini secara realtime. 
                        Perubahan angka di sini akan langsung menghitung ulang total tabungan yang diperlukan untuk semua anak tanpa mengubah data di database.
                      </p>
                   </div>
                   
                   <Button 
                     variant="outline" 
                     className="w-full rounded-xl h-11 text-slate-500 border-slate-200"
                     onClick={() => alert("Fitur Download PDF akan segera hadir!")}
                   >
                     <Download className="w-4 h-4 mr-2" /> Download Laporan PDF
                   </Button>
                </Card>

             </div>
           )}

        </div>
      </div>
    </div>
  );
}