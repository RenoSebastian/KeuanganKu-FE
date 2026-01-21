"use client";

import { useState } from "react"; // Hapus useMemo jika tidak dipakai
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Calculator, User, Briefcase, TrendingUp, 
  RefreshCcw, Download, Hourglass, PiggyBank, AlertCircle, Loader2 
} from "lucide-react"; // Tambah Loader2
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/financial-math"; // Hapus calculatePension import
import { PensionResult } from "@/lib/types";
import { generatePensionPDF } from "@/lib/pdf-generator";
import { financialService } from "@/services/financial.service"; // Import Service

export default function PensionPage() {
  // --- STATE INPUT ---
  const [currentAge, setCurrentAge] = useState<string>("");
  const [retirementAge, setRetirementAge] = useState<string>("55");
  const [retirementDuration, setRetirementDuration] = useState<string>("20");
  const [currentExpense, setCurrentExpense] = useState<string>("");
  const [currentFund, setCurrentFund] = useState<string>("");
  
  const [inflation, setInflation] = useState(5);      
  const [returnRate, setReturnRate] = useState(12);   

  const [result, setResult] = useState<PensionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false); // New State
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- VALIDATION LOGIC ---
  const validateInputs = () => {
    const newErrors: Record<string, string> = {};
    const cAge = parseInt(currentAge) || 0;
    const rAge = parseInt(retirementAge) || 0;
    const rDur = parseInt(retirementDuration) || 0;

    if (!currentAge) newErrors.currentAge = "Wajib diisi";
    if (!retirementAge) newErrors.retirementAge = "Wajib diisi";
    if (!currentExpense) newErrors.currentExpense = "Wajib diisi";
    
    if (cAge > 0 && rAge > 0 && cAge >= rAge) {
      newErrors.currentAge = "Harus lebih muda";
      newErrors.retirementAge = "Harus lebih tua";
    }

    if (rDur === 0) newErrors.retirementDuration = "Min 1 thn";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- HANDLERS ---
  const handleYearInput = (val: string, setter: (v: string) => void) => {
    let clean = val.replace(/\D/g, "");
    if (clean === "0") clean = "";
    if (clean.length > 3) return;
    setter(clean);
    if (result) setResult(null); 
  };

  const handleMoneyInput = (val: string, setter: (v: string) => void) => {
    const num = val.replace(/\D/g, "");
    setter(num.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    if (result) setResult(null);
  };

  // --- UPDATED CALCULATE HANDLER ---
  const handleCalculate = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true); // Start Loading

    try {
      // 1. Prepare Data
      const cAge = parseInt(currentAge) || 0;
      const rAge = parseInt(retirementAge) || 0;
      const rDur = parseInt(retirementDuration) || 20;
      const expense = parseInt(currentExpense.replace(/\./g, "")) || 0;
      const fund = parseInt(currentFund.replace(/\./g, "")) || 0;

      // 2. Call Backend API
      const response = await financialService.savePensionPlan({
        currentAge: cAge,
        retirementAge: rAge,
        lifeExpectancy: rAge + rDur, // BE butuh umur harapan hidup total
        currentExpense: expense,
        currentSaving: fund,
        inflationRate: inflation,
        returnRate: returnRate
      });

      const calc = response.calculation;

      // 3. Map Response to UI State
      // Kita hitung FV fund manual untuk display karena BE fokus ke shortfall
      const yearsToRetire = rAge - cAge;
      const estimatedFvFund = fund * Math.pow(1 + (returnRate/100), yearsToRetire);

      setResult({
        workingYears: yearsToRetire,
        retirementYears: rDur,
        fvMonthlyExpense: calc.futureMonthlyExpense, // Dari BE
        fvExistingFund: estimatedFvFund, // Hitung lokal utk display
        totalFundNeeded: calc.totalFundNeeded, // Dari BE
        shortfall: calc.monthlySaving, // Asumsi shortfall ditutup monthly saving
        monthlySaving: calc.monthlySaving // Dari BE
      });

    } catch (error) {
      console.error("Calculation error:", error);
      alert("Gagal menghitung simulasi. Periksa koneksi internet Anda.");
    } finally {
      setIsLoading(false); // Stop Loading
    }
  };

  const handleReset = () => {
    setCurrentAge("");
    setRetirementAge("55");
    setRetirementDuration("20");
    setCurrentExpense("");
    setCurrentFund("");
    setErrors({});
    setResult(null);
  };

  const handleDownload = () => {
    if (result) {
      let userName = "User";
      if (typeof window !== "undefined") {
        const savedUser = localStorage.getItem("user");
        if (savedUser) { userName = JSON.parse(savedUser).name || "User"; }
      }

      const inputData = {
        currentAge: parseInt(currentAge) || 0,
        retirementAge: parseInt(retirementAge) || 0,
        retirementDuration: parseInt(retirementDuration) || 0,
        currentExpense: parseInt(currentExpense.replace(/\./g, "")) || 0,
        currentFund: parseInt(currentFund.replace(/\./g, "")) || 0,
        inflationRate: inflation,
        investmentRate: returnRate
      };

      generatePensionPDF(inputData, result, userName);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12">
      {/* ... (Header Section sama) ... */}
      <div className="bg-indigo-600 h-48 md:h-64 w-full absolute top-0 left-0 rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-xl z-0 overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 pt-8 md:pt-16">
        <div className="text-center text-white mb-8">
           <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 mb-3">
              <Calculator className="w-4 h-4 text-indigo-100" />
              <span className="text-xs font-bold text-indigo-50 tracking-wider uppercase">Pension Planner</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Dana Pensiun</h1>
           <p className="text-indigo-100 text-sm md:text-base max-w-lg mx-auto">
             Rencanakan masa depan sejahtera dengan kekuatan dana Anda saat ini.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: INPUT FORM */}
          <Card className="lg:col-span-5 p-6 md:p-8 rounded-[2rem] shadow-xl border-white/60 bg-white/95 backdrop-blur-xl space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <User className="w-5 h-5 text-indigo-600" /> Profil Pensiun
            </h3>
            
            {/* ... (Input Usia sama) ... */}
            <div className="grid grid-cols-3 gap-3">
               <div className="space-y-1">
                 <label className="text-[10px] font-bold text-slate-500 uppercase">Usia Kini</label>
                 <Input 
                   type="text" inputMode="numeric" placeholder="25"
                   value={currentAge} 
                   onChange={e => handleYearInput(e.target.value, setCurrentAge)}
                   className={cn("bg-slate-50 border-slate-200 text-center font-bold focus:ring-indigo-500", errors.currentAge && "border-red-500 bg-red-50")}
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-bold text-slate-500 uppercase">Usia Pensiun</label>
                 <Input 
                   type="text" inputMode="numeric" placeholder="55"
                   value={retirementAge} 
                   onChange={e => handleYearInput(e.target.value, setRetirementAge)}
                   className={cn("bg-indigo-50 border-indigo-200 text-indigo-700 text-center font-bold focus:ring-indigo-500", errors.retirementAge && "border-red-500 bg-red-50")}
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-bold text-slate-500 uppercase flex flex-col leading-tight">
                    <span>Lama Pensiun</span>
                    <span className="text-[8px] text-slate-400 font-normal">(Tahun)</span>
                 </label>
                 <Input 
                   type="text" inputMode="numeric" placeholder="20"
                   value={retirementDuration} 
                   onChange={e => handleYearInput(e.target.value, setRetirementDuration)}
                   className={cn("bg-slate-50 border-slate-200 text-center font-bold focus:ring-indigo-500", errors.retirementDuration && "border-red-500 bg-red-50")}
                 />
               </div>
            </div>
            
            {(errors.currentAge || errors.retirementAge) && (
               <div className="text-[10px] text-red-500 font-bold flex items-center gap-1 bg-red-50 p-2 rounded-lg -mt-2">
                  <AlertCircle className="w-3 h-3" /> 
                  {errors.currentAge === "Harus lebih muda" ? "Usia kini harus lebih kecil dari pensiun!" : "Mohon lengkapi data usia."}
               </div>
            )}

            {/* Input Pemasukan Target (Sama) */}
            <div className="space-y-1">
               <label className="text-xs font-bold text-slate-600 uppercase ml-1">Target Pemasukan Bulanan</label>
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                 <Input 
                   className={cn("pl-12 h-12 text-lg font-bold bg-white border-indigo-200 focus:ring-indigo-500", errors.currentExpense && "border-red-500 bg-red-50")}
                   placeholder="0"
                   value={currentExpense}
                   onChange={e => handleMoneyInput(e.target.value, setCurrentExpense)}
                 />
               </div>
               <p className="text-[10px] text-slate-400 ml-1">
                 *Nilai uang saat ini (akan disesuaikan inflasi).
               </p>
            </div>

            {/* Input Saldo Awal (Sama) */}
            <div className="space-y-1 bg-green-50 p-3 rounded-xl border border-green-100">
               <label className="text-xs font-bold text-green-700 uppercase ml-1 flex items-center gap-1">
                 <PiggyBank className="w-3 h-3" /> Saldo JHT / DPLK Saat Ini
               </label>
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-green-600">Rp</span>
                 <Input 
                   className="pl-12 h-12 text-lg font-bold bg-white border-green-200 focus:ring-green-500 text-green-800"
                   placeholder="0"
                   value={currentFund}
                   onChange={e => handleMoneyInput(e.target.value, setCurrentFund)}
                 />
               </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-6 border border-slate-100">
               <Slider 
                 label="Asumsi Inflasi" valueLabel={`${inflation}% / tahun`}
                 value={inflation} onChange={setInflation} min={0} max={15} step={0.5} colorClass="accent-red-500"
               />
               <Slider 
                 label="Return Investasi" valueLabel={`${returnRate}% / tahun`}
                 value={returnRate} onChange={setReturnRate} min={4} max={20} step={0.5} colorClass="accent-green-500"
               />
            </div>

            {/* BUTTON WITH LOADING STATE */}
            <Button 
                onClick={handleCalculate} 
                disabled={isLoading}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-bold text-lg shadow-lg shadow-indigo-200 rounded-xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menghitung...</>
              ) : (
                "Hitung Strategi"
              )}
            </Button>
          </Card>

          {/* ... (RIGHT COLUMN: Result Display SAMA, tidak perlu ubah banyak) ... */}
          <div className="lg:col-span-7 space-y-6">
             {!result ? (
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center opacity-60 p-8 border-2 border-dashed border-indigo-200/50 rounded-[2rem]">
                  <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                     <Hourglass className="w-10 h-10 text-indigo-300" />
                  </div>
                  <h3 className="text-xl font-bold text-indigo-900">Menunggu Data</h3>
                  <p className="text-indigo-700 text-sm">Masukkan data profil untuk melihat simulasi.</p>
               </div>
             ) : (
               // ... (Render Result SAMA) ...
               <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                  {/* Visual Timeline, Main Card, Info Card, dll tetap sama */}
                  {/* ... paste code render result dari yang lama ... */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                     <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                       <Briefcase className="w-4 h-4 text-slate-400" /> Roadmap
                     </h4>
                     <div className="relative pt-6 pb-2">
                       <div className="h-2 bg-slate-100 rounded-full w-full absolute top-1/2 -translate-y-1/2"></div>
                       <div className="flex justify-between relative z-10">
                          <div className="text-center">
                             <div className="w-4 h-4 bg-slate-800 rounded-full mx-auto mb-2 border-4 border-white shadow"></div>
                             <p className="text-[10px] font-bold text-slate-500">Sekarang</p>
                             <p className="text-xs font-bold text-slate-800">{currentAge} Th</p>
                          </div>
                          <div className="text-center">
                             <div className="w-4 h-4 bg-indigo-600 rounded-full mx-auto mb-2 border-4 border-white shadow"></div>
                             <p className="text-[10px] font-bold text-indigo-600">Pensiun</p>
                             <p className="text-xs font-bold text-indigo-700">{retirementAge} Th</p>
                          </div>
                          <div className="text-center">
                             <div className="w-4 h-4 bg-emerald-500 rounded-full mx-auto mb-2 border-4 border-white shadow"></div>
                             <p className="text-[10px] font-bold text-emerald-600">Tercover</p>
                             <p className="text-xs font-bold text-emerald-700">{result.retirementYears} Th</p>
                          </div>
                       </div>
                     </div>
                  </div>

                  <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden border-0">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                     <div className="relative z-10 space-y-6">
                        <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/20">
                           <div>
                              <p className="text-indigo-200 text-[10px] font-bold uppercase mb-1">Target Dana ({result.retirementYears} Th)</p>
                              <p className="text-xl font-bold">{formatRupiah(result.totalFundNeeded)}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-emerald-300 text-[10px] font-bold uppercase mb-1">FV Saldo Awal</p>
                              <p className="text-xl font-bold text-emerald-100">{formatRupiah(result.fvExistingFund)}</p>
                           </div>
                        </div>
                        <div className="text-center">
                           <p className="text-indigo-200 font-bold uppercase tracking-widest text-[10px] mb-2">
                             Investasi Bulanan (Kekurangan)
                           </p>
                           <h2 className="text-4xl md:text-5xl font-black mb-2 text-white">
                              {formatRupiah(result.monthlySaving)}
                           </h2>
                           <p className="text-[10px] text-indigo-100 opacity-80 leading-relaxed max-w-sm mx-auto">
                              Jika Anda menabung nominal ini, dana pensiun Anda aman untuk membiayai hidup selama {result.retirementYears} tahun (sesuai input).
                           </p>
                        </div>
                     </div>
                  </Card>

                  <Card className="p-4 rounded-2xl flex items-center justify-between border-l-4 border-l-orange-400">
                     <div>
                        <p className="text-xs font-bold text-slate-500">Nilai Masa Depan (FV) Target Pemasukan</p>
                        <p className="text-lg font-black text-slate-800">{formatRupiah(result.fvMonthlyExpense)} <span className="text-xs font-normal text-slate-400">/ bulan</span></p>
                        <p className="text-[10px] text-slate-400 mt-1">Akibat inflasi {inflation}% selama {result.workingYears} tahun.</p>
                     </div>
                     <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <TrendingUp className="w-5 h-5" />
                     </div>
                  </Card>

                  <div className="flex gap-3 pt-2">
                     <Button variant="outline" onClick={handleReset} className="flex-1 rounded-xl h-11 border-slate-300">
                       <RefreshCcw className="w-4 h-4 mr-2" /> Reset
                     </Button>
                     <Button className="flex-[2] rounded-xl h-11 bg-slate-800 hover:bg-slate-900 shadow-xl" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" /> Simpan Rencana PDF
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