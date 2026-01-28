"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Calculator, User, Briefcase, TrendingUp,
  RefreshCcw, Download, Hourglass, PiggyBank, AlertCircle, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/financial-math";
import { PensionResult } from "@/lib/types";
import { generatePensionPDF } from "@/lib/pdf";
import { financialService } from "@/services/financial.service";
import { PensionGuide } from "@/components/features/calculator/pension-guide";

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
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- STATE BACKGROUND SLIDESHOW (HEADER) ---
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const backgroundImages = [
    '/images/pensiun/rancangdanaharitua1.webp',
    '/images/pensiun/rancangdanaharitua2.webp'
  ];

  // --- EFFECT: BACKGROUND ROTATION ---
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Ganti gambar setiap 5 detik

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

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
      // 1. Prepare Data & Sanitasi
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
        currentSaving: fund, // Optional field di BE
        inflationRate: inflation,
        returnRate: returnRate
      });

      // Response Backend dibungkus dalam object { id, userId, ..., calculation: {...} }
      const calc = (response as any).calculation;

      // 3. Map Response to UI State
      const yearsToRetire = rAge - cAge;
      const estimatedFvFund = fund * Math.pow(1 + (returnRate / 100), yearsToRetire);

      setResult({
        workingYears: yearsToRetire,
        retirementYears: rDur,
        fvMonthlyExpense: calc.futureMonthlyExpense || 0,
        fvExistingFund: estimatedFvFund,
        totalFundNeeded: calc.totalFundNeeded,
        shortfall: calc.monthlySaving > 0 ? calc.monthlySaving * 12 * yearsToRetire : 0,
        monthlySaving: calc.monthlySaving
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
    <div className="min-h-full w-full pb-24 md:pb-12">

      {/* --- HEADER (DYNAMIC BACKGROUND SLIDESHOW) --- */}
      <div className="relative pt-10 pb-32 px-5 overflow-hidden shadow-2xl bg-brand-900">

        {/* 1. LAYER GAMBAR (ABSOLUTE) */}
        <div className="absolute inset-0 w-full h-full z-0">
          {backgroundImages.map((image, index) => (
            <div
              key={image}
              className={cn(
                "absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out",
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              )}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}

          {/* Overlay: Gelap + Pattern Wave */}
          <div className="absolute inset-0 bg-brand-300/85 mix-blend-multiply" />
          <div className="absolute inset-0 bg-linear-to-t from-brand-500 via-brand-500/40 to-transparent" />

          {/* Existing Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-[0.05] mix-blend-overlay"></div>
        </div>

        {/* 2. LAYER DEKORASI (Z-10) */}
        <div className="absolute top-0 right-0 w-125 h-125 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none z-10" />

        {/* 3. LAYER KONTEN (Z-20) */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-4 shadow-lg">
            <Calculator className="w-4 h-4 text-cyan-300" />
            <span className="text-[10px] font-bold text-cyan-100 tracking-widest uppercase">Pension Planner</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3 drop-shadow-xl">
            Dana Pensiun
          </h1>
          <p className="text-brand-100 text-sm md:text-base max-w-lg mx-auto leading-relaxed opacity-90 drop-shadow-md">
            Rencanakan masa depan sejahtera dengan kekuatan dana Anda saat ini bersama MAXIPRO.
          </p>
        </div>
      </div>

      <div className="relative z-20 max-w-6xl mx-auto px-5 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: INPUT FORM */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="card-clean p-6 md:p-8 bg-white/95 backdrop-blur-xl space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
                <User className="w-5 h-5 text-brand-600" /> Profil Pensiun
              </h3>

              {/* Usia Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Usia Kini</label>
                  <Input
                    type="text" inputMode="numeric" placeholder="25"
                    value={currentAge}
                    onChange={e => handleYearInput(e.target.value, setCurrentAge)}
                    className={cn("bg-slate-50 border-slate-200 text-center font-bold focus:ring-brand-500", errors.currentAge && "border-red-500 bg-red-50")}
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
                    className={cn("bg-slate-50 border-slate-200 text-center font-bold focus:ring-brand-500", errors.retirementDuration && "border-red-500 bg-red-50")}
                  />
                </div>
              </div>

              {(errors.currentAge || errors.retirementAge) && (
                <div className="text-[10px] text-red-500 font-bold flex items-center gap-1 bg-red-50 p-2 rounded-lg -mt-2">
                  <AlertCircle className="w-3 h-3" />
                  {errors.currentAge === "Harus lebih muda" ? "Usia kini harus lebih kecil dari pensiun!" : "Mohon lengkapi data usia."}
                </div>
              )}

              {/* Input Pemasukan Target */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase ml-1">Target Pemasukan Bulanan</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                  <Input
                    className={cn("pl-12 h-12 text-lg font-bold bg-white border-indigo-200 focus:ring-indigo-500 transition-all", errors.currentExpense && "border-red-500 bg-red-50")}
                    placeholder="0"
                    value={currentExpense}
                    onChange={e => handleMoneyInput(e.target.value, setCurrentExpense)}
                  />
                </div>
                <p className="text-[10px] text-slate-400 ml-1">
                  *Nilai uang saat ini (akan disesuaikan inflasi).
                </p>
              </div>

              {/* Input Saldo Awal */}
              <div className="space-y-1 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <label className="text-xs font-bold text-emerald-700 uppercase ml-1 flex items-center gap-1">
                  <PiggyBank className="w-3 h-3" /> Saldo JHT / DPLK Saat Ini
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-600">Rp</span>
                  <Input
                    className="pl-12 h-12 text-lg font-bold bg-white border-emerald-200 focus:ring-emerald-500 text-emerald-800 transition-all"
                    placeholder="0"
                    value={currentFund}
                    onChange={e => handleMoneyInput(e.target.value, setCurrentFund)}
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-6 border border-slate-100">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Asumsi Inflasi</span>
                    <span>{inflation}% / tahun</span>
                  </div>
                  <Slider
                    value={inflation}
                    onChange={(val) => setInflation(val)}
                    min={0} max={15} step={0.5}
                    className="accent-red-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Return Investasi</span>
                    <span>{returnRate}% / tahun</span>
                  </div>
                  <Slider
                    value={returnRate}
                    onChange={(val) => setReturnRate(val)}
                    min={4} max={20} step={0.5}
                    className="accent-emerald-500"
                  />
                </div>
              </div>

              {/* BUTTON WITH LOADING STATE */}
              <Button
                onClick={handleCalculate}
                disabled={isLoading}
                className="w-full h-12 bg-brand-600 hover:bg-brand-700 font-bold text-lg shadow-lg shadow-brand-500/20 rounded-xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menghitung...</>
                ) : (
                  "Hitung Strategi"
                )}
              </Button>
            </Card>
          </div>

          {/* RIGHT: RESULT DISPLAY */}
          <div className="lg:col-span-7 space-y-6">
            {!result ? (
              <div className="h-full min-h-100 flex flex-col items-center justify-center text-center opacity-60 p-8 border-2 border-dashed border-indigo-200/50 rounded-[2rem] bg-white/50">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <Hourglass className="w-10 h-10 text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-indigo-900">Menunggu Data</h3>
                <p className="text-indigo-700 text-sm">Masukkan data profil untuk melihat simulasi.</p>
              </div>
            ) : (
              <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">

                {/* Visual Timeline */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" /> Roadmap Kehidupan
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

                {/* MAIN RESULT CARD (Indigo Gradient) */}
                <Card className="bg-linear-to-br from-indigo-600 to-violet-700 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden border-0">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 space-y-8">
                    <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/20">
                      <div>
                        <p className="text-indigo-200 text-[10px] font-bold uppercase mb-1">Target Dana ({result.retirementYears} Th)</p>
                        <p className="text-xl font-bold truncate" title={formatRupiah(result.totalFundNeeded)}>
                          {formatRupiah(result.totalFundNeeded)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-300 text-[10px] font-bold uppercase mb-1">FV Saldo Awal</p>
                        <p className="text-xl font-bold text-emerald-100 truncate" title={formatRupiah(result.fvExistingFund)}>
                          {formatRupiah(result.fvExistingFund)}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 mb-3">
                        <TrendingUp className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Investasi Bulanan (Kekurangan)</span>
                      </div>

                      <h2 className="text-4xl md:text-5xl font-black mb-3 text-white tracking-tight drop-shadow-sm">
                        {formatRupiah(result.monthlySaving)}
                      </h2>
                      <p className="text-xs text-indigo-100 opacity-80 leading-relaxed max-w-sm mx-auto">
                        Jika Anda menabung nominal ini, dana pensiun Anda aman untuk membiayai hidup selama {result.retirementYears} tahun (sesuai input).
                      </p>
                    </div>
                  </div>
                </Card>

                {/* INFO CARD */}
                <Card className="p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-orange-400 bg-white shadow-sm">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nilai Masa Depan (FV) Target</p>
                    <p className="text-xl font-black text-slate-800 mt-1">{formatRupiah(result.fvMonthlyExpense)} <span className="text-xs font-normal text-slate-400">/ bulan</span></p>
                    <p className="text-[10px] text-slate-400 mt-1 italic">Akibat inflasi {inflation}% selama {result.workingYears} tahun.</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 shadow-sm">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </Card>

                {/* ACTIONS */}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={handleReset} className="flex-1 rounded-xl h-11 border-slate-300 text-slate-600 hover:bg-slate-50">
                    <RefreshCcw className="w-4 h-4 mr-2" /> Reset
                  </Button>
                  <Button className="flex-2 rounded-xl h-11 bg-slate-800 hover:bg-slate-900 shadow-xl text-white font-bold" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" /> Simpan Rencana PDF
                  </Button>
                </div>
              </div>
            )}
            <PensionGuide />
          </div>
        </div>
      </div>
    </div>
  );
}