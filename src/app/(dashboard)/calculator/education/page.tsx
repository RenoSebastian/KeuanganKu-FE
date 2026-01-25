"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  GraduationCap, Plus, Users, Settings2, 
  Download, Info, Loader2, AlertCircle, TrendingUp, Sparkles, ArrowLeft
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
  
  // Asumsi Ekonomi (Slider State)
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
          plans: reconstructedPlans,
          simulationResult: {
             totalMonthlySaving: plan.calculation.monthlySaving,
             stagesBreakdown: breakdown
          }
        } as any;
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
    if (confirm("Hapus rencana pendidikan ini?")) {
      try {
        await financialService.deleteEducationPlan(id);
        fetchData(); 
      } catch (error) {
        console.error(error);
      }
    }
  };

  // --- RENDER WIZARD VIEW ---
  if (view === "WIZARD") {
    return (
      <div className="min-h-screen bg-slate-50 pb-20 px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Button 
            variant="ghost" 
            onClick={() => setView("DASHBOARD")} 
            className="pl-0 text-slate-500 hover:text-slate-800 hover:bg-transparent"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Dashboard
          </Button>
          
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
             <div className="p-6 md:p-8">
               <ChildWizard 
                 onSave={handleWizardSuccess} 
                 onCancel={() => setView("DASHBOARD")} 
               />
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-slate-50 pb-32 md:pb-20">
      
      {/* 1. HEADER & HERO */}
      <div className="bg-white border-b border-slate-100 pt-8 pb-10 px-5 md:px-10 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3 border border-brand-100">
              <GraduationCap className="w-3.5 h-3.5" /> Education Planner
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight mb-2">
              Dana Pendidikan Anak
            </h1>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
              Simulasi investasi masa depan dengan metode <i>Sinking Fund</i>.
            </p>
          </div>

          {/* Main Action Button (Visible on both Mobile & Desktop) */}
          <Button 
            onClick={() => setView("WIZARD")}
            className="h-12 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 font-bold transition-all hover:-translate-y-0.5 active:scale-95 w-full md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" /> Tambah Anak
          </Button>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        {/* GRID LAYOUT: Mobile = Stacked (Sidebar Top), Desktop = Sidebar Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* SIDEBAR AREA (Summary & Controls) */}
            {/* Order 1 di Mobile (Tampil Duluan), Order 2 di Desktop (Tampil Kanan) */}
            <div className="order-1 lg:order-2 lg:col-span-4 space-y-6 lg:sticky lg:top-8">
                
                {/* A. Summary Widget */}
                <SummaryBoard summary={portfolio} isLoading={isLoading} />

                {/* B. Control Panel (Sliders) */}
                <Card className="p-5 md:p-6 rounded-3xl border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                            <Settings2 className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">Asumsi Ekonomi</h3>
                            <p className="text-[10px] text-slate-400">Geser untuk simulasi stress-test</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Inflasi */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <AlertCircle className="w-3 h-3" /> Inflasi / Tahun
                                </Label>
                                <span className={cn(
                                    "text-xs font-bold px-2 py-1 rounded border",
                                    assumptions.inflation > 10 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-600 border-slate-100"
                                )}>
                                    {assumptions.inflation}%
                                </span>
                            </div>
                            
                            {/* [FIX] Menggunakan 'value' (number) dan 'onChange' (number) */}
                            <Slider 
                                value={assumptions.inflation} 
                                onChange={(val: number) => setAssumptions(prev => ({ ...prev, inflation: val }))}
                                min={5} max={20} step={1}
                                className="py-2 cursor-pointer touch-none"
                                colorClass="accent-rose-500"
                            />
                        </div>

                        {/* Return Investasi */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <TrendingUp className="w-3 h-3" /> Return Investasi
                                </Label>
                                <span className={cn(
                                    "text-xs font-bold px-2 py-1 rounded border",
                                    assumptions.returnRate > 10 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-600 border-slate-100"
                                )}>
                                    {assumptions.returnRate}%
                                </span>
                            </div>
                            
                            {/* [FIX] Menggunakan 'value' (number) dan 'onChange' (number) */}
                            <Slider 
                                value={assumptions.returnRate} 
                                onChange={(val: number) => setAssumptions(prev => ({ ...prev, returnRate: val }))}
                                min={2} max={20} step={1}
                                className="py-2 cursor-pointer touch-none"
                                colorClass="accent-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50 p-3 rounded-xl border border-blue-100 flex gap-2">
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-blue-700/80 leading-relaxed">
                            Tip: Inflasi pendidikan Indonesia rata-rata <b>10-15%</b> per tahun. Pastikan investasi Anda (misal Reksadana Saham) bisa mengejar angka ini.
                        </p>
                    </div>
                </Card>
            </div>

            {/* MAIN CONTENT (List) */}
            {/* Order 2 di Mobile (Tampil Bawah), Order 1 di Desktop (Tampil Kiri) */}
            <div className="order-2 lg:order-1 lg:col-span-8 space-y-6">
               
               <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-slate-400" />
                      Daftar Anak ({children.length})
                  </h3>
               </div>

               {/* Loading State */}
               {isLoading && (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse">
                      <Loader2 className="w-8 h-8 text-brand-300 animate-spin mb-3" />
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Memuat Data...</p>
                  </div>
               )}

               {/* Empty State */}
               {!isLoading && children.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-[2rem] border border-dashed border-slate-200 shadow-sm">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <Sparkles className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">Belum ada simulasi</h3>
                      <p className="text-slate-500 max-w-xs text-sm mb-6">
                          Tambahkan data anak untuk mulai menghitung biaya pendidikan.
                      </p>
                      <Button 
                          onClick={() => setView("WIZARD")}
                          variant="outline"
                          className="rounded-full border-brand-200 text-brand-600 hover:bg-brand-50"
                      >
                          Buat Simulasi Baru
                      </Button>
                  </div>
               )}

               {/* Cards Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {children.map((child) => {
                      // Logic: Priority Live Calc -> Backend Data -> Zero
                      const liveResult = portfolio?.details.find(d => d.childId === child.id);
                      
                      const cardResult = {
                          totalMonthlySaving: liveResult 
                              ? liveResult.totalMonthlySaving 
                              : (child as any).simulationResult?.totalMonthlySaving || 0,
                          stagesBreakdown: liveResult 
                              ? undefined 
                              : (child as any).simulationResult?.stagesBreakdown,
                          stages: liveResult?.stages 
                      };

                      return (
                          <ChildCard 
                              key={child.id}
                              profile={child} 
                              result={cardResult}
                              onDelete={handleDeleteChild} 
                          />
                      );
                  })}
               </div>
            </div>

        </div>
      </div>
    </div>
  );
}