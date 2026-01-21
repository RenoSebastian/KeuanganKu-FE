"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Plus } from "lucide-react";
import { ChildWizard } from "@/components/features/education/child-wizard";
import { SimulationResult, SimulationResultData } from "@/components/features/education/simulation-result";
import { EducationPlanResponse } from "@/lib/types"; // Import tipe response API yang sudah kita buat

export default function EducationPage() {
  // State untuk mengontrol tampilan (Welcome Screen / Form Wizard / Result)
  const [view, setView] = useState<"WELCOME" | "WIZARD" | "RESULT">("WELCOME");
  
  // State untuk menampung hasil perhitungan yang dikembalikan oleh Backend
  const [simulationResult, setSimulationResult] = useState<SimulationResultData | null>(null);

  // --- HANDLERS ---
  
  // Handler ini dipanggil ketika ChildWizard berhasil menyimpan data ke API
  const handleSuccess = (result: EducationPlanResponse) => {
    // Mapping respon Backend ke format data visual yang dibutuhkan komponen SimulationResult
    
    // Pastikan konversi tipe data aman (Number() untuk jaga-jaga jika string desimal)
    const totalFV = Number(result.calculation.totalFutureCost);
    const monthlySaving = Number(result.calculation.monthlySaving);
    const inflation = Number(result.plan.inflationRate || 10);
    const returnRate = Number(result.plan.returnRate || 12);

    setSimulationResult({
      childName: result.plan.childName,
      totalFutureCost: totalFV,
      monthlySaving: monthlySaving,
      inflationRate: inflation,
      returnRate: returnRate,
      // Pass data rincian granular ke komponen visual (Drill Down)
      stagesBreakdown: result.calculation.stagesBreakdown 
    });

    // Pindah ke tampilan hasil
    setView("RESULT");
  };

  const handleReset = () => {
    setSimulationResult(null);
    setView("WELCOME");
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12">
      
      {/* Header Decoration (Sesuai UI sementara_1) */}
      <div className="bg-blue-600 h-48 md:h-64 w-full absolute top-0 left-0 rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-xl z-0 overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 pt-8 md:pt-16">
        
        {/* Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 md:mb-12">
           <div className="text-white mx-auto md:mx-0 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 mb-3">
                  <GraduationCap className="w-4 h-4 text-blue-100" />
                  <span className="text-xs font-bold text-blue-50 tracking-wider uppercase">Education Planner</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Perencanaan Pendidikan</h1>
              <p className="text-blue-100 text-sm md:text-base max-w-lg leading-relaxed">
                Simulasi dana pendidikan presisi dengan metode <i>Cashflow Matching</i> untuk seluruh jenjang sekolah anak Anda.
              </p>
           </div>
        </div>

        {/* --- VIEW: WELCOME (EMPTY STATE) --- */}
        {view === "WELCOME" && (
           <Card className="border-dashed border-2 border-slate-300 bg-white/80 backdrop-blur-sm p-12 flex flex-col items-center justify-center text-center rounded-[2rem] animate-in fade-in zoom-in-95">
              <div className="w-24 h-24 bg-blue-100/50 rounded-full flex items-center justify-center mb-6">
                 <GraduationCap className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-700 mb-2">Mulai Perencanaan</h3>
              <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                Tambahkan data anak Anda untuk menghitung biaya pendidikan dari TK hingga Kuliah secara detail dan akurat.
              </p>
              <Button onClick={() => setView("WIZARD")} size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 rounded-xl h-12 px-8 text-base">
                 <Plus className="w-5 h-5 mr-2" /> Buat Rencana Baru
              </Button>
           </Card>
        )}

        {/* --- VIEW: WIZARD FORM --- */}
        {view === "WIZARD" && (
           <Card className="p-6 md:p-8 rounded-[2rem] shadow-2xl border-white/60 bg-white/95 backdrop-blur-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <ChildWizard 
                onSave={handleSuccess} 
                onCancel={() => setView("WELCOME")} 
              />
           </Card>
        )}

        {/* --- VIEW: RESULT --- */}
        {view === "RESULT" && simulationResult && (
           <Card className="p-6 md:p-8 rounded-[2rem] shadow-2xl border-white/60 bg-white/95 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
              <SimulationResult 
                data={simulationResult}
                onReset={handleReset}
                onSave={() => alert("Data sudah tersimpan otomatis di database!")}
              />
           </Card>
        )}

      </div>
    </div>
  );
}