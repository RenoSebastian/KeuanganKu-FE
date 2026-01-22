"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  GraduationCap, Plus, Users, Settings2, 
  Download, Info, Loader2, AlertCircle, TrendingUp, Calendar
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
          gender: "L", // Default gender jika BE belum kirim
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
    <div className="min-h-full w-full pb-24 md:pb-12 bg-surface-ground">
      
      {/* --- HEADER (PAM IDENTITY) --- */}
      <div className="bg-brand-900 pt-10 pb-32 px-5 relative overflow-hidden shadow-2xl">
         {/* Background Elements */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
         <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-[0.05] mix-blend-overlay"></div>

         <div className="relative z-10 max-w-6xl mx-auto px-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                
                {/* Title Section */}
                <div className="text-white space-y-3 max-w-2xl">
                   <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-sm">
                      <GraduationCap className="w-4 h-4 text-cyan-300" />
                      <span className="text-[10px] font-bold text-cyan-100 tracking-widest uppercase">Education Planner Pro</span>
                   </div>
                   <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                     Rencanakan <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-brand-200">Masa Depan</span> Anak
                   </h1>
                   <p className="text-brand-100 text-sm md:text-base leading-relaxed opacity-90 max-w-lg">
                     Simulasi dana pendidikan presisi dengan metode <i>Sinking Fund</i>. Perhitungkan inflasi dan return investasi secara realtime.
                   </p>
                </div>

                {/* Action Button */}
                {view === "DASHBOARD" && (
                  <Button 
                    onClick={() => setView("WIZARD")} 
                    className="group bg-white text-brand-700 hover:bg-brand-50 shadow-xl shadow-brand-900/20 border-0 font-bold rounded-2xl h-12 px-6 transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
                  >
                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" /> 
                    Tambah Rencana
                  </Button>
                )}
            </div>
         </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-6 -mt-20">
        
        {/* MODE WIZARD */}
        {view === "WIZARD" && (
           <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
             <Card className="p-0 rounded-[2.5rem] shadow-2xl shadow-slate-200 border-white/60 bg-white/95 backdrop-blur-xl relative overflow-hidden card-clean">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
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
                        <Users className="w-5 h-5 text-brand-600" />
                        Daftar Rencana
                      </h3>
                      {children.length > 0 && (
                        <span className="text-xs font-bold bg-white border border-brand-100 text-brand-600 px-3 py-1 rounded-full shadow-sm">
                          {children.length} Anak Terdaftar
                        </span>
                      )}
                    </div>

                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                         <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                         <p className="text-sm text-slate-400 font-medium">Memuat data...</p>
                      </div>
                    ) : children.length === 0 ? (
                      // EMPTY STATE
                      <Card className="group relative overflow-hidden p-12 border-dashed border-2 border-slate-200 bg-white/50 hover:bg-white hover:border-brand-200 transition-all duration-500 rounded-3xl flex flex-col items-center justify-center text-center">
                         <div className="absolute inset-0 bg-gradient-to-br from-transparent to-brand-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                         
                         <div className="relative z-10 w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                           <GraduationCap className="w-10 h-10 text-brand-400 group-hover:text-brand-600 transition-colors" />
                         </div>
                         
                         <div className="relative z-10 max-w-sm">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Belum ada data anak</h3>
                            <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                              Mulai tambahkan profil anak dan rencana sekolah mereka untuk melihat simulasi biaya pendidikan secara detail.
                            </p>
                            <Button 
                              onClick={() => setView("WIZARD")} 
                              className="rounded-full bg-brand-600 hover:bg-brand-700 font-bold px-8 h-11 shadow-lg shadow-brand-500/30 transition-all hover:scale-105"
                            >
                              <Plus className="w-4 h-4 mr-2" /> Mulai Sekarang
                            </Button>
                         </div>
                      </Card>
                    ) : (
                      // DATA LIST
                      <div className="grid grid-cols-1 gap-6">
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
                    <Card className="p-6 md:p-8 rounded-[2.5rem] border-white/60 bg-white/90 backdrop-blur-xl shadow-xl shadow-slate-200/50 animate-in fade-in slide-in-from-right-8 duration-700 card-clean">
                       
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
                                  assumptions.inflation > 10 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-600 border-slate-100"
                                )}>
                                  {assumptions.inflation}% <span className="text-[10px] font-normal opacity-70">/thn</span>
                                </div>
                            </div>
                            <Slider 
                              value={assumptions.inflation} 
                              onChange={(val) => setAssumptions(prev => ({ ...prev, inflation: val }))}
                              min={5} max={20} step={1}
                              colorClass="accent-rose-500"
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
                                  assumptions.returnRate > 10 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-600 border-slate-100"
                                )}>
                                  {assumptions.returnRate}% <span className="text-[10px] font-normal opacity-70">/thn</span>
                                </div>
                            </div>
                            <Slider 
                              value={assumptions.returnRate}
                              onChange={(val) => setAssumptions(prev => ({ ...prev, returnRate: val }))} 
                              min={2} max={20} step={1}
                              colorClass="accent-emerald-500"
                            />
                            <p className="text-[10px] text-slate-400 text-right">Estimasi keuntungan rata-rata instrumen investasi Anda.</p>
                          </div>
                       </div>

                       {/* Info Box */}
                       <div className="mt-8 bg-brand-50/80 p-5 rounded-2xl flex gap-3 border border-brand-100/50">
                          <Info className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                          <div className="space-y-1">
                             <p className="text-xs font-bold text-brand-800">Simulasi Realtime</p>
                             <p className="text-[11px] text-brand-700/80 leading-relaxed">
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