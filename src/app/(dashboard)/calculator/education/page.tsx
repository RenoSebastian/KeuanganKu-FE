"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider"; // Custom Component Anda
import { Label } from "@/components/ui/label";
import { 
  GraduationCap, Plus, Users, Settings2, 
  Info, Loader2, AlertCircle, TrendingUp, Sparkles, ArrowLeft
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
      <div className="min-h-screen bg-slate-50/50 pb-20">
        <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-20 shadow-sm">
            <div className="max-w-3xl mx-auto flex items-center gap-2">
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setView("DASHBOARD")} 
                    className="text-slate-500 hover:text-slate-900 -ml-2"
                >
                    <ArrowLeft className="w-5 h-5 mr-1" /> Kembali
                </Button>
                <span className="text-sm font-semibold text-slate-900">Buat Simulasi Baru</span>
            </div>
        </div>

        <div className="px-4 py-6 md:py-10">
          <div className="max-w-3xl mx-auto">
             <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                <div className="p-5 md:p-8">
                  <ChildWizard 
                    onSave={handleWizardSuccess} 
                    onCancel={() => setView("DASHBOARD")} 
                  />
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-slate-50 pb-32 md:pb-20">
      
      {/* 1. HERO HEADER */}
      <div className="relative bg-white border-b border-slate-200 pt-8 pb-10 px-4 md:px-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 md:w-96 md:h-96 bg-brand-50/80 rounded-full blur-[60px] md:blur-[100px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100/50 shadow-sm">
              <GraduationCap className="w-3.5 h-3.5" /> 
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Education Planner</span>
            </div>
            
            <div className="space-y-1">
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Dana Pendidikan Anak
                </h1>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-lg">
                Rencanakan masa depan buah hati dengan metode <i>Sinking Fund</i> yang presisi dan terukur.
                </p>
            </div>
          </div>

          <Button 
            onClick={() => setView("WIZARD")}
            className="h-12 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/20 font-semibold transition-all hover:-translate-y-0.5 active:scale-95 w-full md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" /> Tambah Anak
          </Button>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID - LAYOUT UTAMA */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        
        {/* STRATEGI LAYOUT: 
            Desktop: Grid 12 kolom (Main Content: 8 Kolom, Sidebar: 4 Kolom)
            Mobile: Flex Column (Sidebar di atas/bawah, Main Content di bawah/atas)
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* AREA UTAMA (KIRI pada Desktop) - DAFTAR ANAK */}
            <div className="lg:col-span-8 order-2 lg:order-1 space-y-6">
               
               {/* Section Title */}
               <div className="flex items-center justify-between px-1">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <div className="bg-brand-100 p-1.5 rounded-lg">
                        <Users className="w-4 h-4 text-brand-600" />
                      </div>
                      Daftar Anak 
                      <span className="text-sm font-medium text-slate-400 ml-1 bg-slate-100 px-2 py-0.5 rounded-full">
                        {children.length}
                      </span>
                  </h3>
               </div>

               {/* Loading State */}
               {isLoading && (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                      <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Menghitung Proyeksi...</p>
                  </div>
               )}

               {/* Empty State */}
               {!isLoading && children.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200 hover:border-brand-200 transition-colors group">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                          <Sparkles className="w-10 h-10 text-slate-300 group-hover:text-brand-400 transition-colors" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Belum ada simulasi</h3>
                      <p className="text-slate-500 max-w-sm text-sm mb-8 leading-relaxed">
                          Tambahkan data anak Anda untuk mulai menghitung estimasi biaya pendidikan dari SD hingga Universitas.
                      </p>
                      <Button 
                          onClick={() => setView("WIZARD")}
                          variant="outline"
                          className="h-11 px-6 rounded-full border-brand-200 text-brand-700 hover:bg-brand-50 hover:text-brand-800 hover:border-brand-300 font-medium"
                      >
                          <Plus className="w-4 h-4 mr-2" />
                          Buat Simulasi Baru
                      </Button>
                  </div>
               )}

               {/* Grid Kartu Anak */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {children.map((child) => {
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

            {/* SIDEBAR (KANAN pada Desktop) - SUMMARY & CONTROLS */}
            {/* Menggunakan 'sticky top-8' agar panel ini tetap terlihat saat user scroll daftar anak */}
            <div className="lg:col-span-4 order-1 lg:order-2 space-y-6 lg:sticky lg:top-8 h-fit">
                
                {/* 1. Summary Widget */}
                {(children.length > 0 || isLoading) && (
                     <SummaryBoard summary={portfolio} isLoading={isLoading} />
                )}

                {/* 2. Control Panel (Asumsi Ekonomi) */}
                <Card className="p-5 md:p-6 rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-white border border-slate-100 rounded-lg text-slate-600 shadow-sm">
                            <Settings2 className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">Asumsi Ekonomi</h3>
                            <p className="text-[10px] text-slate-500 font-medium">Geser untuk simulasi stress-test</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Slider Inflasi */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" /> Inflasi Pendidikan
                                </Label>
                                <span className={cn(
                                    "text-xs font-bold px-2.5 py-1 rounded-md border shadow-sm transition-colors",
                                    assumptions.inflation >= 10 
                                        ? "bg-rose-50 text-rose-700 border-rose-200" 
                                        : "bg-slate-50 text-slate-700 border-slate-200"
                                )}>
                                    {assumptions.inflation}%
                                </span>
                            </div>
                            
                            {/* FIX: Props disesuaikan dengan Slider custom Anda (value: number) */}
                            <Slider 
                                value={assumptions.inflation} 
                                onChange={(val) => setAssumptions(prev => ({ ...prev, inflation: val }))}
                                min={5} max={20} step={1}
                                colorClass="accent-rose-500" 
                                className="cursor-pointer"
                            />
                        </div>

                        {/* Slider Return */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <TrendingUp className="w-3.5 h-3.5" /> Return Investasi
                                </Label>
                                <span className={cn(
                                    "text-xs font-bold px-2.5 py-1 rounded-md border shadow-sm transition-colors",
                                    assumptions.returnRate >= 12 
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                        : "bg-slate-50 text-slate-700 border-slate-200"
                                )}>
                                    {assumptions.returnRate}%
                                </span>
                            </div>
                            
                            {/* FIX: Props disesuaikan dengan Slider custom Anda */}
                            <Slider 
                                value={assumptions.returnRate} 
                                onChange={(val) => setAssumptions(prev => ({ ...prev, returnRate: val }))}
                                min={2} max={20} step={1}
                                colorClass="accent-emerald-500" 
                                className="cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex gap-3">
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] md:text-[11px] text-blue-700/80 leading-relaxed font-medium">
                            Inflasi pendidikan: <b>10-15%</b>/tahun. Pastikan return investasi Anda di atas angka ini.
                        </p>
                    </div>
                </Card>
            </div>

        </div>
      </div>
    </div>
  );
}