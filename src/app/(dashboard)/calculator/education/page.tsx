"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider"; 
import { Label } from "@/components/ui/label";
import { 
  Plus, Users, Settings2, 
  Download, Info, Loader2, AlertCircle, TrendingUp,
  Droplets, GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import Komponen & Logic
import { ChildWizard } from "@/components/features/education/child-wizard";
import { ChildCard } from "@/components/features/education/child-card";
import { SummaryBoard } from "@/components/features/education/summary-board";
import { calculatePortfolio } from "@/lib/financial-math";
import { ChildProfile, PortfolioSummary, PlanInput } from "@/lib/types";
import { financialService } from "@/services/financial.service";

export default function EducationPage() {
  const [view, setView] = useState<"DASHBOARD" | "WIZARD">("DASHBOARD");
  
  // Data Utama
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Asumsi Ekonomi (Default Value)
  const [assumptions, setAssumptions] = useState({
    inflation: 10,   
    returnRate: 12   
  });

  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);

  // --- 1. FETCH DATA & PREPARE ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // ✅ DATA SOURCE: Mengambil data bersih dari Service
      const data = await financialService.getEducationPlans();
      
      // A. Construct Child Profiles (Untuk kebutuhan Edit/Wizard)
      const mappedChildren: ChildProfile[] = data.map((plan) => {
        const breakdown = plan.calculation.stagesBreakdown;
        const uniqueLevels = Array.from(new Set(breakdown.map(b => b.level)));
        
        const reconstructedPlans: PlanInput[] = uniqueLevels.map((level) => {
          const entryItem = breakdown.find(b => b.level === level && b.costType === "ENTRY");
          const annualItem = breakdown.find(b => b.level === level && b.costType === "ANNUAL");
          
          // [FIX] Handle jika Annual Item tidak ada (Kasus S2/Lumpsum)
          let monthlyFee = 0;
          if (annualItem) {
             const annualCost = annualItem.currentCost || 0;
             monthlyFee = (level === "PT") 
                ? annualCost / 2   
                : annualCost / 12; 
          }

          return {
            stageId: level,
            startGrade: 1, 
            costNow: {
              entryFee: entryItem ? (entryItem.currentCost || 0) : 0,
              monthlyFee: monthlyFee
            }
          };
        });

        return {
          id: plan.plan.id,
          name: plan.plan.childName,
          dob: plan.plan.childDob,
          gender: "L", 
          avatarColor: "bg-cyan-100 text-cyan-700",
          plans: reconstructedPlans
        };
      });

      // B. Construct Initial Portfolio (Langsung dari BE)
      const initialDetails = data.map((plan) => ({
         childId: plan.plan.id,
         childName: plan.plan.childName,
         totalMonthlySaving: plan.calculation.monthlySaving,
         stagesBreakdown: plan.calculation.stagesBreakdown
      }));

      const initialPortfolio: PortfolioSummary = {
          grandTotalMonthlySaving: initialDetails.reduce((acc, curr) => acc + curr.totalMonthlySaving, 0),
          totalFutureCost: data.reduce((acc, curr) => acc + curr.calculation.totalFutureCost, 0),
          details: initialDetails
      };

      setChildren(mappedChildren);
      setPortfolio(initialPortfolio);

    } catch (error) {
      console.error("Failed to fetch education plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. CLIENT-SIDE RE-CALCULATION ---
  useEffect(() => {
    if (children.length > 0) {
      const result = calculatePortfolio(children, assumptions.inflation, assumptions.returnRate);
      setPortfolio(result);
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
    <div className="min-h-screen w-full bg-slate-50/50 relative pb-24 md:pb-12 overflow-x-hidden selection:bg-cyan-100 selection:text-cyan-900">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/80 to-transparent" />
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-100/30 rounded-full blur-[100px]" />
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[80px]" />
      </div>

      {/* HEADER SECTION */}
      <div className="relative z-10 w-full">
         <div className="max-w-7xl mx-auto px-6 pt-10 pb-8 md:pt-14 md:pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-slate-200/50 px-3 py-1 rounded-full shadow-sm mb-2">
                      <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                      <span className="text-[10px] md:text-xs font-bold text-slate-600 tracking-wider uppercase">
                        Education Planner
                      </span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-800">
                    Rencanakan <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Masa Depan</span> Anak
                  </h1>
                  <p className="text-slate-500 text-sm md:text-base max-w-2xl leading-relaxed">
                    Simulasi dana pendidikan dengan metode <i>Sinking Fund</i>. Akurat, transparan, dan terintegrasi.
                  </p>
               </div>

               {view === "DASHBOARD" && (
                 <Button 
                   onClick={() => setView("WIZARD")} 
                   className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-600/20 border-0 font-bold rounded-xl h-11 px-6 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                 >
                   <Plus className="w-5 h-5 mr-2" /> 
                   Tambah Rencana
                 </Button>
               )}
            </div>
         </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-6">
        
        {view === "WIZARD" && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Card className="p-0 rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 relative overflow-hidden">
                <div className="p-6 md:p-10 relative z-10">
                   <ChildWizard 
                     onSave={handleWizardSuccess} 
                     onCancel={() => setView("DASHBOARD")} 
                   />
                </div>
             </Card>
           </div>
        )}

        {view === "DASHBOARD" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
             
             {/* LEFT COLUMN: Main Data */}
             <div className="lg:col-span-8 space-y-6">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                   <SummaryBoard summary={portfolio} isLoading={isLoading} />
                </div>

                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                   <div className="flex items-center justify-between px-1">
                     <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                       <Users className="w-5 h-5 text-cyan-600" />
                       Daftar Rencana
                     </h3>
                     {children.length > 0 && (
                       <span className="text-xs font-bold bg-white border border-slate-200 text-slate-500 px-3 py-1 rounded-full">
                         {children.length} Anak
                       </span>
                     )}
                   </div>

                   {isLoading ? (
                     <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                        <p className="text-sm text-slate-400 font-medium">Memuat data...</p>
                     </div>
                   ) : children.length === 0 ? (
                     <Card className="group relative overflow-hidden p-12 border-dashed border-2 border-slate-200 bg-white/50 hover:bg-white hover:border-cyan-200 transition-all duration-500 rounded-3xl flex flex-col items-center justify-center text-center">
                        <div className="relative z-10 w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                          <GraduationCap className="w-8 h-8 text-cyan-500 group-hover:text-cyan-600 transition-colors" />
                        </div>
                        <div className="relative z-10 max-w-sm">
                           <h3 className="text-lg font-bold text-slate-800 mb-2">Belum ada simulasi</h3>
                           <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                             Mulai tambahkan profil anak untuk melihat kalkulasi biaya pendidikan di masa depan.
                           </p>
                           <Button 
                             onClick={() => setView("WIZARD")} 
                             className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 h-10"
                           >
                             <Plus className="w-4 h-4 mr-2" /> Mulai Sekarang
                           </Button>
                        </div>
                     </Card>
                   ) : (
                     <div className="grid grid-cols-1 gap-4">
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

             {/* RIGHT COLUMN: Settings */}
             <div className="lg:col-span-4 space-y-6">
                <div className="sticky top-6 space-y-6">
                   <Card className="p-6 rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-100/80">
                      
                      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                         <div className="p-2.5 bg-cyan-50 rounded-xl">
                            <Settings2 className="w-5 h-5 text-cyan-600" />
                         </div>
                         <div>
                            <h3 className="font-bold text-slate-800 text-base">Parameter Ekonomi</h3>
                            <p className="text-xs text-slate-400">Sesuaikan asumsi hitungan</p>
                         </div>
                      </div>

                      <div className="space-y-8">
                          {/* SLIDER INFLASI (FIXED: Value number, onChange explicit) */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <Label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5" /> Inflasi Pendidikan
                                </Label>
                                <div className={cn(
                                  "text-xs font-bold px-2.5 py-1 rounded-md border transition-colors",
                                  assumptions.inflation > 10 ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 text-slate-600 border-slate-100"
                                )}>
                                  {assumptions.inflation}%
                                </div>
                            </div>
                            <Slider 
                              value={assumptions.inflation} 
                              onChange={(val: number) => setAssumptions(prev => ({ ...prev, inflation: val }))}
                              min={5} max={20} step={1}
                              className="py-2"
                              colorClass="accent-red-500" 
                            />
                          </div>

                          {/* SLIDER RETURN INVESTASI (FIXED) */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <Label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                  <TrendingUp className="w-3.5 h-3.5" /> Return Investasi
                                </Label>
                                <div className={cn(
                                  "text-xs font-bold px-2.5 py-1 rounded-md border transition-colors",
                                  assumptions.returnRate > 10 ? "bg-green-50 text-green-600 border-green-100" : "bg-slate-50 text-slate-600 border-slate-100"
                                )}>
                                  {assumptions.returnRate}%
                                </div>
                            </div>
                            <Slider 
                              value={assumptions.returnRate}
                              onChange={(val: number) => setAssumptions(prev => ({ ...prev, returnRate: val }))} 
                              min={2} max={20} step={1}
                              className="py-2"
                              colorClass="accent-green-500"
                            />
                          </div>
                      </div>

                      <div className="mt-8 bg-slate-50 p-4 rounded-2xl flex gap-3 border border-slate-100">
                         <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                         <p className="text-[10px] text-slate-500 leading-relaxed text-justify">
                             Geser slider di atas untuk melihat dampak inflasi dan return investasi terhadap total tabungan bulanan secara langsung.
                         </p>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-4 rounded-xl h-10 text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800 font-medium text-xs"
                        onClick={() => alert("Fitur Download PDF akan segera hadir!")}
                      >
                        <Download className="w-3.5 h-3.5 mr-2" /> Download Laporan
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