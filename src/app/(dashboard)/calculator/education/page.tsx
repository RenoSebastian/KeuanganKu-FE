"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  GraduationCap, Plus, Users, Settings2, 
  Trash2, RefreshCcw, Save, Download, Info 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import Komponen & Logic (Pastikan path sesuai)
import { ChildWizard } from "@/components/features/education/child-wizard";
import { ChildCard } from "@/components/features/education/child-card";
import { SummaryBoard } from "@/components/features/education/summary-board";
import { calculatePortfolio } from "@/lib/financial-math";
import { generateEducationPDF } from "@/lib/pdf-generator";
import { ChildProfile, PortfolioSummary } from "@/lib/types";

export default function EducationPage() {
  const [view, setView] = useState<"DASHBOARD" | "WIZARD">("DASHBOARD");
  
  // Data Utama (List Anak)
  const [children, setChildren] = useState<ChildProfile[]>([]);
  
  // Asumsi Ekonomi (Global untuk semua anak)
  const [assumptions, setAssumptions] = useState({
    inflation: 10,   // Default Inflasi Pendidikan 10%
    returnRate: 12   // Default Return Investasi 12%
  });

  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [isLoaded, setIsLoaded] = useState(false); // Penanda client-side load agar tidak hydration error

  // --- 1. LOAD DATA FROM LOCALSTORAGE (ON MOUNT) ---
  useEffect(() => {
    try {
      const savedChildren = localStorage.getItem("edu_children_v2"); // Gunakan key v2 biar fresh
      const savedAssumptions = localStorage.getItem("edu_assumptions_v2");

      if (savedChildren) setChildren(JSON.parse(savedChildren));
      if (savedAssumptions) setAssumptions(JSON.parse(savedAssumptions));
    } catch (e) {
      console.error("Gagal load data", e);
    }
    
    setIsLoaded(true);
  }, []);

  // --- 2. SAVE DATA & CALCULATE (ON CHANGE) ---
  useEffect(() => {
    if (!isLoaded) return; 

    // Simpan ke LocalStorage
    localStorage.setItem("edu_children_v2", JSON.stringify(children));
    localStorage.setItem("edu_assumptions_v2", JSON.stringify(assumptions));

    // Hitung Portfolio menggunakan Logic Granular Baru
    if (children.length > 0) {
      const result = calculatePortfolio(children, assumptions.inflation, assumptions.returnRate);
      setPortfolio(result);
    } else {
      setPortfolio(null);
    }
  }, [children, assumptions, isLoaded]);

  // --- HANDLERS ---
  const handleAddChild = (newChild: ChildProfile) => {
    setChildren(prev => [...prev, newChild]);
    setView("DASHBOARD");
  };

  const handleDeleteChild = (id: string) => {
    if (confirm("Yakin ingin menghapus data anak ini?")) {
      setChildren(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleReset = () => {
    if (confirm("Reset semua data simulasi? Data akan dihapus permanen dari browser.")) {
      setChildren([]);
      localStorage.removeItem("edu_children_v2");
    }
  };

  const handleDownloadPDF = () => {
    if (portfolio && children.length > 0) {
      generateEducationPDF(portfolio, assumptions);
    } else {
      alert("Belum ada data untuk diunduh.");
    }
  };

  // Prevent Hydration Error
  if (!isLoaded) return null;

  // --- MODE: WIZARD INPUT ---
  if (view === "WIZARD") {
    return (
      <div className="min-h-screen w-full bg-slate-50/50 pb-12 pt-8 px-5 animate-in fade-in duration-300">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 md:p-8 rounded-[2rem] shadow-2xl border-white/60 bg-white/95 backdrop-blur-xl relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <ChildWizard 
              onSave={handleAddChild} 
              onCancel={() => setView("DASHBOARD")} 
            />
          </Card>
        </div>
      </div>
    );
  }

  // --- MODE: DASHBOARD ---
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
           <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 mb-3">
                  <GraduationCap className="w-4 h-4 text-blue-100" />
                  <span className="text-xs font-bold text-blue-50 tracking-wider uppercase">Education Planner Pro</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Perencanaan Pendidikan</h1>
              <p className="text-blue-100 text-sm md:text-base max-w-lg leading-relaxed">
                Simulasi dana pendidikan presisi dengan metode <i>Cashflow Matching</i> untuk seluruh jenjang.
              </p>
           </div>
           
           {/* Global Actions */}
           <div className="flex gap-3">
              <Button 
                onClick={handleReset}
                variant="outline" 
                className="bg-white/10 text-blue-50 border-white/20 hover:bg-white/20 backdrop-blur-md hover:text-white"
                disabled={children.length === 0}
              >
                <RefreshCcw className="w-4 h-4 mr-2" /> Reset
              </Button>
              <Button 
                onClick={handleDownloadPDF}
                className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg font-bold border-0"
                disabled={children.length === 0}
              >
                <Download className="w-4 h-4 mr-2" /> Unduh Laporan
              </Button>
           </div>
        </div>

        {/* --- SUMMARY BOARD --- */}
        {children.length > 0 && (
          <div className="mb-8 animate-in slide-in-from-top-4 duration-700">
             <SummaryBoard summary={portfolio} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* LEFT: LIST ANAK */}
           <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-1">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                   <Users className="w-5 h-5 text-blue-600" /> Daftar Rencana Anak
                 </h3>
                 <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                   {children.length} Anak
                 </span>
              </div>

              {children.length === 0 ? (
                // EMPTY STATE
                <Card className="border-dashed border-2 border-slate-300 bg-slate-50/50 p-12 flex flex-col items-center justify-center text-center rounded-[2rem]">
                   <div className="w-24 h-24 bg-blue-100/50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <GraduationCap className="w-12 h-12 text-blue-500" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-700 mb-2">Mulai Perencanaan</h3>
                   <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                     Tambahkan data anak pertama Anda untuk menghitung biaya dari TK hingga Kuliah secara detail.
                   </p>
                   <Button onClick={() => setView("WIZARD")} size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 rounded-xl h-12 px-8 text-base">
                      <Plus className="w-5 h-5 mr-2" /> Tambah Data Anak
                   </Button>
                </Card>
              ) : (
                // LIST CARD ANAK
                <div className="space-y-4">
                   {children.map((child, idx) => {
                     // Cari hasil perhitungan untuk anak ini
                     const childResult = portfolio?.details.find(d => d.childId === child.id);
                     
                     return (
                       <div key={child.id} className="animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                         <ChildCard 
                           profile={child} 
                           result={childResult}
                           onDelete={handleDeleteChild}
                         />
                       </div>
                     );
                   })}

                   {/* Add More Button */}
                   <button 
                     onClick={() => setView("WIZARD")}
                     className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-2xl py-6 hover:border-blue-400 hover:bg-blue-50 transition-all group mt-4"
                   >
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                      <span className="text-sm font-bold text-slate-400 group-hover:text-blue-600">Tambah Anak Lagi</span>
                   </button>
                </div>
              )}
           </div>

           {/* RIGHT: GLOBAL ASSUMPTIONS */}
           {children.length > 0 && (
             <div className="lg:col-span-4 space-y-6">
                <div className="flex items-center justify-between px-1">
                   <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <Settings2 className="w-5 h-5 text-slate-600" /> Parameter Ekonomi
                   </h3>
                </div>

                <Card className="p-6 rounded-[2rem] border-white/60 bg-white/80 backdrop-blur-md shadow-sm space-y-8 sticky top-8">
                   <Slider 
                     label="Inflasi Pendidikan"
                     valueLabel={`${assumptions.inflation}% / tahun`}
                     value={assumptions.inflation}
                     onChange={(val) => setAssumptions(prev => ({ ...prev, inflation: val }))}
                     min={5} max={20}
                     colorClass="accent-red-500"
                   />
                   
                   <Slider 
                     label="Return Investasi"
                     valueLabel={`${assumptions.returnRate}% / tahun`}
                     value={assumptions.returnRate}
                     onChange={(val) => setAssumptions(prev => ({ ...prev, returnRate: val }))}
                     min={2} max={20}
                     colorClass="accent-green-500"
                   />

                   <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Perubahan parameter ini akan menghitung ulang seluruh rencana anak secara otomatis.
                      </p>
                   </div>
                </Card>
             </div>
           )}

        </div>
      </div>
    </div>
  );
}