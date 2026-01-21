"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  GraduationCap, Plus, Users, Settings2, 
  Download, Info, Loader2, AlertCircle, TrendingUp
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
  
  // Data Utama
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Asumsi Ekonomi
  const [assumptions, setAssumptions] = useState({
    inflation: 10,   
    returnRate: 12   
  });

  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await financialService.getEducationPlans();
      
      const mappedChildren: ChildProfile[] = data.map((plan: EducationPlanResponse) => {
        const breakdown = plan.calculation.stagesBreakdown;
        const uniqueLevels = Array.from(new Set(breakdown.map(b => b.level)));
        
        const reconstructedPlans: PlanInput[] = uniqueLevels.map(level => {
          const entryItem = breakdown.find(b => b.level === level && b.costType === "ENTRY");
          const annualItem = breakdown.find(b => b.level === level && b.costType === "ANNUAL");
          
          let monthlyFee = 0;
          if (annualItem) {
             monthlyFee = (level === "PT") 
                ? annualItem.currentCost / 2  
                : annualItem.currentCost / 12; 
          }

          return {
            stageId: level,
            startGrade: 1, 
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
          gender: "L", 
          avatarColor: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700",
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

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. CALCULATION ---
  useEffect(() => {
    if (children.length > 0) {
      const result = calculatePortfolio(children, assumptions.inflation, assumptions.returnRate);
      setPortfolio(result);
    } else {
      setPortfolio(null);
    }
  }, [children, assumptions]);

  // --- HANDLERS ---
  const handleWizardSuccess = () => {
    fetchData(); 
    setView("DASHBOARD");
  };

  const handleDeleteChild = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus rencana ini? Data tidak dapat dikembalikan.")) {
      try {
        await financialService.deleteEducationPlan(id);
        fetchData();
      } catch (error) {
        alert("Gagal menghapus data.");
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 relative pb-24 md:pb-12 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
      </div>

      {/* --- HEADER SECTION (FIXED) --- */}
      {/* PERBAIKAN: 
          1. Hapus 'h-64' atau 'md:h-72'. Biarkan height auto.
          2. Gunakan 'pb-32' (padding bottom) agar background memanjang ke bawah memberi ruang untuk kartu overlap.
      */}
      <div className="relative z-10 bg-gradient-to-r from-blue-700 to-indigo-700 w-full rounded-b-[3rem] md:rounded-b-[4rem] shadow-2xl shadow-blue-900/20 overflow-hidden">
         
         {/* Decoration Shapes */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
         <div className="absolute bottom-0 left-10 w-64 h-64 bg-white/10 rounded-full blur-2xl translate-y-1/2" />
         
         {/* Container Content */}
         <div className="max-w-7xl mx-auto px-6 pt-12 pb-32 md:pt-16 md:pb-40">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
               
               {/* Text Section */}
               <div className="text-white space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full shadow-lg">
                      <GraduationCap className="w-4 h-4 text-yellow-300" />
                      <span className="text-xs font-bold text-white tracking-widest uppercase">Education Planner Pro</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                    Rencanakan <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">Masa Depan</span> Anak
                  </h1>
                  <p className="text-blue-100 text-sm md:text-base leading-relaxed opacity-90">
                    Simulasi dana pendidikan presisi dengan metode <i>Sinking Fund</i>. Perhitungkan inflasi dan return investasi secara realtime.
                  </p>
               </div>

               {/* Action Button */}
               {view === "DASHBOARD" && (
                 <Button 
                   onClick={() => setView("WIZARD")} 
                   className="group bg-white text-blue-700 hover:bg-blue-50 shadow-xl shadow-blue-900/20 border-0 font-bold rounded-2xl h-12 px-6 transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
                 >
                   <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" /> 
                   Tambah Rencana
                 </Button>
               )}
            </div>
         </div>
      </div>

      {/* --- MAIN CONTENT (OVERLAPPING CARD) --- */}
      {/* Gunakan negative margin (-mt) untuk menarik konten ke atas area padding header */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-6 -mt-24 md:-mt-28">
        
        {/* MODE WIZARD */}
        {view === "WIZARD" && (
           <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
             <Card className="p-0 rounded-[2.5rem] shadow-2xl shadow-slate-200 border-white/60 bg-white/90 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="p-6 md:p-10 relative z-10">
                   <ChildWizard 
                     onSave={handleWizardSuccess} 
                     onCancel={() => setView("DASHBOARD")} 
                   />
                </div>
             </Card>
           </div>
        )}

        {/* MODE DASHBOARD */}
        {view === "DASHBOARD" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
             
             {/* LEFT COLUMN: Main Data (8/12) */}
             <div className="lg:col-span-8 space-y-8">
                
                {/* 1. Summary Board */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                   <SummaryBoard summary={portfolio} isLoading={isLoading} />
                </div>

                {/* 2. List Anak */}
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                   <div className="flex items-center justify-between px-2">
                     <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                       <Users className="w-5 h-5 text-blue-600" />
                       Daftar Rencana
                     </h3>
                     {children.length > 0 && (
                       <span className="text-xs font-bold bg-white border border-blue-100 text-blue-600 px-3 py-1 rounded-full shadow-sm">
                         {children.length} Anak Terdaftar
                       </span>
                     )}
                   </div>

                   {isLoading ? (
                     <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        <p className="text-sm text-slate-400 font-medium">Memuat data...</p>
                     </div>
                   ) : children.length === 0 ? (
                     // EMPTY STATE
                     <Card className="group relative overflow-hidden p-12 border-dashed border-2 border-slate-200 bg-white/50 hover:bg-white hover:border-blue-200 transition-all duration-500 rounded-3xl flex flex-col items-center justify-center text-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative z-10 w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                          <GraduationCap className="w-10 h-10 text-blue-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        
                        <div className="relative z-10 max-w-sm">
                           <h3 className="text-xl font-bold text-slate-800 mb-2">Belum ada data anak</h3>
                           <p className="text-slate-500 mb-8 leading-relaxed">
                             Mulai tambahkan profil anak dan rencana sekolah mereka untuk melihat simulasi biaya pendidikan.
                           </p>
                           <Button 
                             onClick={() => setView("WIZARD")} 
                             className="rounded-full bg-blue-600 hover:bg-blue-700 font-bold px-8 h-11 shadow-lg shadow-blue-500/30"
                           >
                             <Plus className="w-4 h-4 mr-2" /> Mulai Sekarang
                           </Button>
                        </div>
                     </Card>
                   ) : (
                     // DATA LIST
                     <div className="grid grid-cols-1 gap-5">
                        {children.map((child, idx) => {
                          const childResult = portfolio?.details.find(d => d.childId === child.id);
                          return (
                            <div key={child.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                               <ChildCard 
                                 profile={child} 
                                 result={childResult}
                                 onDelete={handleDeleteChild}
                               />
                            </div>
                          );
                        })}
                     </div>
                   )}
                </div>
             </div>

             {/* RIGHT COLUMN: Settings (4/12) */}
             <div className="lg:col-span-4 space-y-6">
                <div className="sticky top-8 space-y-6">
                   <Card className="p-6 md:p-8 rounded-[2.5rem] border-white/60 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 animate-in fade-in slide-in-from-right-8 duration-700">
                      
                      {/* Settings Header */}
                      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                         <div className="p-2.5 bg-slate-100 rounded-xl">
                            <Settings2 className="w-5 h-5 text-slate-600" />
                         </div>
                         <div>
                            <h3 className="font-bold text-slate-800 text-lg">Parameter Ekonomi</h3>
                            <p className="text-xs text-slate-400">Sesuaikan asumsi hitungan</p>
                         </div>
                      </div>

                      <div className="space-y-8">
                         {/* SLIDER INFLASI */}
                         <div className="space-y-4">
                           <div className="flex justify-between items-end">
                               <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                 <AlertCircle className="w-3.5 h-3.5" /> Inflasi Pendidikan
                               </Label>
                               <div className={cn(
                                 "text-sm font-bold px-3 py-1 rounded-lg border shadow-sm transition-colors",
                                 assumptions.inflation > 10 ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 text-slate-600 border-slate-100"
                               )}>
                                 {assumptions.inflation}% <span className="text-[10px] font-normal opacity-70">/thn</span>
                               </div>
                           </div>
                           <Slider 
                             value={assumptions.inflation} 
                             onChange={(val) => setAssumptions(prev => ({ ...prev, inflation: val }))}
                             min={5} max={20} step={1}
                             colorClass="accent-red-500"
                             className="py-2"
                           />
                           <p className="text-[10px] text-slate-400 text-right">Semakin tinggi inflasi, semakin besar dana yang dibutuhkan.</p>
                         </div>

                         {/* SLIDER RETURN INVESTASI */}
                         <div className="space-y-4">
                           <div className="flex justify-between items-end">
                               <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                 <TrendingUp className="w-3.5 h-3.5" /> Return Investasi
                               </Label>
                               <div className={cn(
                                 "text-sm font-bold px-3 py-1 rounded-lg border shadow-sm transition-colors",
                                 assumptions.returnRate > 10 ? "bg-green-50 text-green-600 border-green-100" : "bg-slate-50 text-slate-600 border-slate-100"
                               )}>
                                 {assumptions.returnRate}% <span className="text-[10px] font-normal opacity-70">/thn</span>
                               </div>
                           </div>
                           <Slider 
                             value={assumptions.returnRate}
                             onChange={(val) => setAssumptions(prev => ({ ...prev, returnRate: val }))} 
                             min={2} max={20} step={1}
                             colorClass="accent-green-500"
                             className="py-2"
                           />
                           <p className="text-[10px] text-slate-400 text-right">Estimasi keuntungan rata-rata instrumen investasi Anda.</p>
                         </div>
                      </div>

                      {/* Info Box */}
                      <div className="mt-8 bg-blue-50/80 p-5 rounded-2xl flex gap-3 border border-blue-100/50">
                         <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                         <div className="space-y-1">
                            <p className="text-xs font-bold text-blue-800">Simulasi Realtime</p>
                            <p className="text-[11px] text-blue-700/80 leading-relaxed">
                              Geser slider di atas untuk melihat dampak inflasi dan return investasi terhadap total tabungan bulanan secara langsung.
                            </p>
                         </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-6 rounded-xl h-12 text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800 font-medium"
                        onClick={() => alert("Fitur Download PDF akan segera hadir!")}
                      >
                        <Download className="w-4 h-4 mr-2" /> Download Laporan PDF
                      </Button>
                   </Card>
                </div>
             </div>

          </div>
        )}

      </div>
    </div>
  );
}