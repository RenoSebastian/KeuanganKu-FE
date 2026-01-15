"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Calculator, Wallet, BadgePercent, TrendingUp, 
  AlertTriangle, ShieldCheck, PiggyBank, RefreshCcw, Save, Download,
  CalendarDays, CalendarRange
} from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateSmartBudget, formatRupiah } from "@/lib/financial-math";
import { generateBudgetPDF } from "@/lib/pdf-generator";
import { BudgetResult } from "@/lib/types";

export default function BudgetPage() {
  // --- STATE INPUT ---
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [fixedIncome, setFixedIncome] = useState("");
  const [variableIncome, setVariableIncome] = useState("");

  // --- STATE RESULT (DUAL VIEW) ---
  const [viewMode, setViewMode] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [results, setResults] = useState<{
    monthly: BudgetResult | null;
    annual: BudgetResult | null;
  }>({ monthly: null, annual: null });

  const [isLoaded, setIsLoaded] = useState(false);

  // --- 1. LOAD FROM LOCALSTORAGE ---
  useEffect(() => {
    const savedData = localStorage.getItem("budget_data_v2"); // Ganti key v2 biar fresh
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setName(parsed.name || "");
      setAge(parsed.age || "");
      setFixedIncome(parsed.fixedIncome || "");
      setVariableIncome(parsed.variableIncome || "");
      
      // Auto Calculate jika data lengkap
      if (parsed.fixedIncome) {
        const fixed = parseInt(parsed.fixedIncome.replace(/\./g, "")) || 0;
        const variable = parseInt(parsed.variableIncome.replace(/\./g, "")) || 0;
        if (fixed > 0) {
          setResults({
            monthly: calculateSmartBudget(fixed, variable),
            annual: calculateSmartBudget(fixed * 12, variable * 12)
          });
        }
      }
    }
    setIsLoaded(true);
  }, []);

  // --- 2. SAVE TO LOCALSTORAGE ---
  useEffect(() => {
    if (!isLoaded) return;
    const data = { name, age, fixedIncome, variableIncome };
    localStorage.setItem("budget_data_v2", JSON.stringify(data));
  }, [name, age, fixedIncome, variableIncome, isLoaded]);

  // --- HANDLERS ---
  const handleCalculate = () => {
    const fixed = parseInt(fixedIncome.replace(/\./g, "")) || 0;
    const variable = parseInt(variableIncome.replace(/\./g, "")) || 0;

    if (fixed === 0) {
      alert("Masukkan Pemasukkan Tetap terlebih dahulu.");
      return;
    }

    // HITUNG DUA KALI (BULANAN & TAHUNAN)
    const monthly = calculateSmartBudget(fixed, variable);
    const annual = calculateSmartBudget(fixed * 12, variable * 12);

    setResults({ monthly, annual });
  };

  const handleReset = () => {
    if(confirm("Reset data form?")) {
      setFixedIncome("");
      setVariableIncome("");
      setResults({ monthly: null, annual: null });
      localStorage.removeItem("budget_data_v2");
    }
  };

  const handleDownload = () => {
    // Pastikan kedua data sudah ada sebelum download
    if (results.monthly && results.annual) {
      const fixed = parseInt(fixedIncome.replace(/\./g, "")) || 0;
      
      generateBudgetPDF(
        results.monthly, 
        results.annual, 
        { name, age, fixedIncome: fixed }
      );
    } else {
      alert("Silakan tekan tombol 'Analisa Sekarang' terlebih dahulu.");
    }
  };

  // Helper Input Currency
  const handleMoneyInput = (val: string, setter: (v: string) => void) => {
    const num = val.replace(/\D/g, "");
    setter(num.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
  };

  // --- DATA DISPLAY HELPER ---
  // Ambil data sesuai Tab yang aktif
  const currentResult = viewMode === "MONTHLY" ? results.monthly : results.annual;

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12">
      
      {/* Header Decoration */}
      <div className="bg-emerald-600 h-48 md:h-64 w-full absolute top-0 left-0 rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-xl z-0 overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 pt-8 md:pt-16">
        
        {/* Title */}
        <div className="text-center text-white mb-8">
           <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 mb-3">
              <Calculator className="w-4 h-4 text-emerald-100" />
              <span className="text-xs font-bold text-emerald-50 tracking-wider uppercase">Smart Budgeting</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Checkup Anggaran</h1>
           <p className="text-emerald-100 text-sm md:text-base max-w-lg mx-auto">
             Analisa kesehatan finansial Anda dalam perspektif Bulanan & Tahunan.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: INPUT FORM */}
          <Card className="md:col-span-5 p-6 md:p-8 rounded-[2rem] shadow-xl border-white/60 bg-white/95 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" /> Data Keuangan
            </h3>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 ml-1">Nama</label>
                   <Input 
                     placeholder="Nama Anda" 
                     value={name} onChange={e => setName(e.target.value)}
                     className="bg-slate-50 border-slate-200"
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-500 ml-1">Usia</label>
                   <Input 
                     type="number" placeholder="25" 
                     value={age} onChange={e => setAge(e.target.value)}
                     className="bg-slate-50 border-slate-200"
                   />
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-600 ml-1 uppercase">Pemasukkan Tetap (Gaji)</label>
                 <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                   <Input 
                     className="pl-12 h-12 text-lg font-bold bg-white border-emerald-200 focus:ring-emerald-500"
                     placeholder="0"
                     value={fixedIncome}
                     onChange={e => handleMoneyInput(e.target.value, setFixedIncome)}
                   />
                 </div>
                 <p className="text-[10px] text-slate-400 ml-1">*Input gaji bulanan Anda di sini.</p>
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-600 ml-1 uppercase">Pemasukkan Tidak Tetap</label>
                 <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                   <Input 
                     className="pl-12 h-12 text-lg font-bold bg-white border-blue-200 focus:ring-blue-500"
                     placeholder="0"
                     value={variableIncome}
                     onChange={e => handleMoneyInput(e.target.value, setVariableIncome)}
                   />
                 </div>
                 <p className="text-[10px] text-slate-400 ml-1">*Rata-rata bonus per bulan (Opsional).</p>
              </div>

              <Button 
                onClick={handleCalculate}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 font-bold text-lg shadow-lg shadow-emerald-200 mt-2 rounded-xl"
              >
                Analisa Sekarang
              </Button>
            </div>
          </Card>

          {/* RIGHT: RESULT DISPLAY */}
          <div className="md:col-span-7 space-y-6">
             {!currentResult ? (
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center opacity-60 p-8 border-2 border-dashed border-emerald-200/50 rounded-[2rem]">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                     <BadgePercent className="w-10 h-10 text-emerald-300" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-900">Menunggu Data</h3>
                  <p className="text-emerald-700 text-sm">Masukkan gaji Anda di samping untuk melihat resep pembagian anggaran.</p>
               </div>
             ) : (
               <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                  
                  {/* --- TAB SWITCHER (NEW) --- */}
                  <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl flex gap-2 shadow-sm border border-white/40 w-fit mx-auto md:mx-0">
                     <button
                        onClick={() => setViewMode("MONTHLY")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                          viewMode === "MONTHLY" 
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                            : "text-slate-500 hover:bg-slate-100"
                        )}
                     >
                        <CalendarDays className="w-4 h-4" /> Mode Bulanan
                     </button>
                     <button
                        onClick={() => setViewMode("ANNUAL")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                          viewMode === "ANNUAL" 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                            : "text-slate-500 hover:bg-slate-100"
                        )}
                     >
                        <CalendarRange className="w-4 h-4" /> Proyeksi Tahunan
                     </button>
                  </div>

                  {/* 1. SAFE TO SPEND CARD */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className={cn(
                      "text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden border-0 flex flex-col justify-center",
                      viewMode === "MONTHLY" ? "bg-gradient-to-br from-emerald-600 to-teal-700" : "bg-gradient-to-br from-blue-600 to-indigo-700"
                    )}>
                       <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                       <p className="text-emerald-100 font-bold uppercase tracking-widest text-[10px] mb-1">
                         {viewMode === "MONTHLY" ? "Biaya Hidup (Bulan Ini)" : "Biaya Hidup (Setahun)"}
                       </p>
                       <h2 className="text-3xl font-black mb-1">
                          {formatRupiah(currentResult.safeToSpend)}
                       </h2>
                       <p className="text-[10px] text-emerald-50 opacity-90 leading-relaxed">
                          {viewMode === "MONTHLY" 
                            ? "Batas aman untuk Makan, Transport, & Gaya Hidup bulan ini."
                            : "Total uang yang akan Anda habiskan untuk hidup dalam satu tahun."}
                       </p>
                    </Card>

                    {/* CSS DONUT CHART */}
                    <Card className="p-4 rounded-[2rem] bg-white border border-slate-100 flex items-center gap-4">
                       <div className="relative w-24 h-24 rounded-full flex-shrink-0" 
                            style={{ 
                              background: "conic-gradient(#10b981 0% 45%, #f97316 45% 65%, #ef4444 65% 80%, #3b82f6 80% 90%, #22c55e 90% 100%)" 
                            }}>
                          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center flex-col">
                             <span className="text-[10px] font-bold text-slate-400">Total</span>
                             <span className="text-xs font-black text-slate-800">100%</span>
                          </div>
                       </div>
                       <div className="space-y-1 text-[9px] font-bold text-slate-500">
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Hidup (45%)</div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"/> Hutang P (20%)</div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"/> Hutang K (15%)</div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"/> Asuransi (10%)</div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"/> Investasi (10%)</div>
                       </div>
                    </Card>
                  </div>

                  {/* 2. ALLOCATION GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {currentResult.allocations.map((item, idx) => (
                       <div key={idx} className={cn("p-4 rounded-2xl border flex flex-col justify-between h-full bg-white transition-all hover:scale-[1.02]", item.colorClass)}>
                          <div>
                             <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black uppercase tracking-wider opacity-70 border border-current px-2 py-0.5 rounded-full">
                                  {item.percentage}%
                                </span>
                                {item.type === "DEBT_PROD" && <TrendingUp className="w-4 h-4" />}
                                {item.type === "DEBT_CONS" && <AlertTriangle className="w-4 h-4" />}
                                {item.type === "INSURANCE" && <ShieldCheck className="w-4 h-4" />}
                                {item.type === "SAVING" && <PiggyBank className="w-4 h-4" />}
                             </div>
                             <h4 className="font-bold text-sm mb-0.5">{item.label}</h4>
                             <p className="text-xs opacity-80 leading-tight mb-3 min-h-[2.5em]">{item.description}</p>
                          </div>
                          <p className="text-lg font-black">
                             {formatRupiah(item.amount)}
                          </p>
                       </div>
                     ))}
                  </div>

                  {/* 3. SURPLUS CARD */}
                  {currentResult.surplus > 0 && (
                    <Card className="bg-blue-50 border-blue-100 p-5 rounded-2xl flex items-center justify-between">
                       <div>
                          <p className="text-xs font-bold text-blue-600 uppercase mb-1">
                            {viewMode === "MONTHLY" ? "Surplus Bulanan" : "Surplus Tahunan"}
                          </p>
                          <h3 className="text-2xl font-black text-blue-800">{formatRupiah(currentResult.surplus)}</h3>
                          <p className="text-[10px] text-blue-500 mt-1">Dari Pemasukkan Tidak Tetap (Wajib 100% Ditabung)</p>
                       </div>
                       <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          <PiggyBank className="w-6 h-6" />
                       </div>
                    </Card>
                  )}

                  {/* ACTIONS */}
                  <div className="flex gap-3 pt-2">
                     <Button variant="outline" onClick={handleReset} className="flex-1 rounded-xl h-11 border-slate-300">
                       <RefreshCcw className="w-4 h-4 mr-2" /> Reset
                     </Button>
                     <Button 
                       className="flex-[2] rounded-xl h-11 bg-slate-800 hover:bg-slate-900 shadow-xl" 
                       onClick={handleDownload}
                     >
                       <Download className="w-4 h-4 mr-2" /> Unduh Laporan PDF
                     </Button>
                  </div>
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}