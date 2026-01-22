"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Target, Plane, Heart, Star, 
  RefreshCcw, Download, CalendarDays, Coins, 
  TrendingUp, Wallet, ArrowRight, Loader2, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/financial-math"; 
import { SpecialGoalResult, GoalType, GoalSimulationInput } from "@/lib/types";
import { generateSpecialGoalPDF } from "@/lib/pdf-generator";
import { financialService } from "@/services/financial.service"; 

// --- KONFIGURASI TEMA PER TUJUAN ---
const GOAL_OPTIONS: { id: GoalType; label: string; icon: any; color: string; gradient: string; desc: string }[] = [
  { 
    id: "IBADAH", 
    label: "Ibadah", 
    icon: Star, 
    color: "text-emerald-600", 
    gradient: "from-emerald-500 to-teal-700",
    desc: "Haji, Umrah, atau Ziarah"
  },
  { 
    id: "LIBURAN", 
    label: "Liburan", 
    icon: Plane, 
    color: "text-sky-600", 
    gradient: "from-sky-500 to-blue-700",
    desc: "Traveling & Wisata Impian"
  },
  { 
    id: "PERNIKAHAN", 
    label: "Pernikahan", 
    icon: Heart, 
    color: "text-rose-600", 
    gradient: "from-rose-500 to-pink-700",
    desc: "Resepsi & Honeymoon"
  },
  { 
    id: "LAINNYA", 
    label: "Lainnya", 
    icon: Target, 
    color: "text-violet-600", 
    gradient: "from-violet-500 to-purple-700",
    desc: "Gadget, Hobi, Renovasi"
  },
];

export default function GoalsPage() {
  // --- STATE ---
  const [selectedGoal, setSelectedGoal] = useState<GoalType>("LAINNYA");
  const [currentCost, setCurrentCost] = useState("");
  const [duration, setDuration] = useState("5");
  const [inflation, setInflation] = useState(5);
  const [investmentRate, setInvestmentRate] = useState(6);

  const [result, setResult] = useState<SpecialGoalResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- HANDLERS ---
  const handleMoneyInput = (val: string) => {
    let num = val.replace(/\D/g, "");
    if (num.length > 1 && num.startsWith("0")) num = num.substring(1);
    setCurrentCost(num.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    // Reset result jika input berubah agar user menghitung ulang
    if (result) setResult(null);
  };

  const handleCalculate = async () => {
    const cost = parseInt(currentCost.replace(/\./g, "")) || 0;
    const years = parseInt(duration) || 0;

    if (cost === 0 || years === 0) {
      alert("Mohon lengkapi estimasi biaya dan jangka waktu.");
      return;
    }

    setIsLoading(true);

    try {
      const payload: GoalSimulationInput = {
        currentCost: cost,
        years: years,
        inflationRate: inflation,
        returnRate: investmentRate
      };

      // Call API Service (Simulasi)
      const data = await financialService.simulateGoal(payload);

      setResult({
        futureValue: data.futureCost,
        monthlySaving: data.monthlySaving
      });

    } catch (error) {
      console.error("Gagal menghitung goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentCost("");
    setDuration("5");
    setResult(null);
  };

  const handleDownload = () => {
    if (result) {
      let userName = "User";
      if (typeof window !== "undefined") {
        const savedUser = localStorage.getItem("user");
        if (savedUser) { userName = JSON.parse(savedUser).name || "User"; }
      }

      const cost = parseInt(currentCost.replace(/\./g, "")) || 0;
      const years = parseInt(duration) || 0;

      const inputData = {
        goalType: selectedGoal,
        currentCost: cost,
        duration: years,
        inflationRate: inflation,
        investmentRate: investmentRate
      };

      generateSpecialGoalPDF(inputData, result, userName);
    }
  };

  // Get current theme based on selection
  const currentTheme = GOAL_OPTIONS.find(g => g.id === selectedGoal) || GOAL_OPTIONS[3];

  return (
    <div className="min-h-full w-full pb-24 md:pb-12">
      
      {/* --- HEADER (PAM IDENTITY) --- */}
      <div className="bg-brand-900 pt-10 pb-32 px-5 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
         <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-[0.05] mix-blend-overlay"></div>

         <div className="relative z-10 max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-4">
               <Target className="w-4 h-4 text-cyan-300" />
               <span className="text-[10px] font-bold text-cyan-100 tracking-widest uppercase">Special Goal Planner</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
              Wujudkan Mimpi Anda
            </h1>
            <p className="text-brand-100 text-sm md:text-base max-w-lg mx-auto leading-relaxed opacity-90">
              Apapun impiannya, mari kita hitung strategi menabung yang tepat untuk mencapainya bersama PAM JAYA.
            </p>
         </div>
      </div>

      <div className="relative z-20 max-w-6xl mx-auto px-5 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* --- LEFT COLUMN: INPUTS --- */}
            <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Goal Selector (Clean Grid) */}
                <div className="bg-white p-5 rounded-[2rem] shadow-xl border border-slate-100 relative overflow-hidden">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Pilih Jenis Tujuan</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
                        {GOAL_OPTIONS.map((option) => {
                            const isSelected = selectedGoal === option.id;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => { setSelectedGoal(option.id); setResult(null); }}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 gap-2 h-28",
                                        isSelected
                                            ? "bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-600/20 scale-105" 
                                            : "bg-white border-slate-100 text-slate-500 hover:border-brand-200 hover:bg-brand-50/50"
                                    )}
                                >
                                    <div className={cn("p-2 rounded-full transition-colors", isSelected ? "bg-white/20" : "bg-slate-50")}>
                                        <option.icon className={cn("w-5 h-5", isSelected ? "text-white" : option.color)} />
                                    </div>
                                    <span className="text-xs font-bold">{option.label}</span>
                                </button>
                            )
                        })}
                    </div>
                    {/* Dynamic Description Footer */}
                    <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                            <Sparkles className="w-3 h-3 text-amber-400" /> 
                            <span className="italic">"{currentTheme.desc}"</span>
                        </p>
                    </div>
                </div>

                {/* 2. Input Parameters (Glassy Card) */}
                <Card className="card-clean p-6 md:p-8 space-y-6 bg-white/95 backdrop-blur-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cost Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                <Coins className="w-3 h-3" /> Biaya Saat Ini
                            </label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs transition-colors group-focus-within:bg-brand-600 group-focus-within:text-white">Rp</div>
                                <Input 
                                    placeholder="0" 
                                    value={currentCost} 
                                    onChange={(e) => handleMoneyInput(e.target.value)} 
                                    className="pl-14 h-14 text-lg font-bold text-slate-800 bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl transition-all"
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 pl-1">Harga jika Anda membelinya hari ini.</p>
                        </div>

                        {/* Duration Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" /> Target Waktu
                            </label>
                            <div className="relative group">
                                <Input 
                                    type="number"
                                    value={duration} 
                                    onChange={(e) => { setDuration(e.target.value); setResult(null); }} 
                                    className="h-14 text-lg font-bold text-center text-slate-800 bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl pr-16 pl-4"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">Tahun</div>
                            </div>
                            <p className="text-[10px] text-slate-400 pl-1">Berapa lama lagi ingin tercapai?</p>
                        </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-slate-100">
                        {/* Inflation Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-600">Asumsi Inflasi (Kenaikan Harga)</label>
                                <span className="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded-md border border-rose-100">{inflation}% / thn</span>
                            </div>
                            <Slider 
                                value={inflation} // FIX: Sekarang tipe number
                                onChange={(val) => { setInflation(val); setResult(null); }} // FIX: Menggunakan onChange & val adalah number
                                min={0} max={20} step={0.5} 
                                colorClass="accent-rose-500" // Custom style
                                className="py-2"
                            />
                        </div>

                        {/* Investment Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-600">Estimasi Return Investasi</label>
                                <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-100">{investmentRate}% / thn</span>
                            </div>
                            <Slider 
                                value={investmentRate} // FIX: Sekarang tipe number
                                onChange={(val) => { setInvestmentRate(val); setResult(null); }} // FIX: Menggunakan onChange & val adalah number
                                min={0} max={20} step={0.5} 
                                colorClass="accent-emerald-500" // Custom style
                                className="py-2"
                            />
                        </div>
                    </div>

                    <Button 
                        onClick={handleCalculate}
                        disabled={isLoading}
                        className={cn(
                            "w-full h-12 text-base font-bold shadow-lg shadow-brand-500/20 rounded-xl text-white transition-all hover:scale-[1.02] bg-brand-600 hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed"
                        )}
                    >
                        {isLoading ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menghitung...</>
                        ) : (
                            "Hitung Strategi Menabung"
                        )}
                    </Button>
                </Card>
            </div>

            {/* --- RIGHT COLUMN: RESULT --- */}
            <div className="lg:col-span-5 space-y-6">
                {!result ? (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 bg-white/50 rounded-[2rem]">
                        <div className={cn("w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-slate-100 transition-colors duration-500", currentTheme.color.replace("text-", "bg-").replace("600", "50"))}>
                            <currentTheme.icon className={cn("w-10 h-10 opacity-50", currentTheme.color)} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Belum Ada Hasil</h3>
                        <p className="text-slate-500 text-sm max-w-xs mt-2 leading-relaxed">
                            Masukkan estimasi biaya <b>{currentTheme.label}</b> dan target waktu pada form di samping untuk melihat analisanya.
                        </p>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                        
                        {/* MAIN RESULT CARD (Theme Based) */}
                        <Card className={cn(
                            "text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden border-0 bg-gradient-to-br flex flex-col justify-center min-h-[280px]",
                            currentTheme.gradient
                        )}>
                            {/* Decoration */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3" />

                            <div className="relative z-10 text-center">
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 mb-4">
                                    <Wallet className="w-3 h-3 text-white" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">Rekomendasi Setoran</span>
                                </div>
                                
                                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-sm">
                                    {formatRupiah(result.monthlySaving)}
                                </h2>
                                <p className="text-white/80 font-medium text-sm mb-8">per bulan</p>

                                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md text-left">
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="text-white/80 font-medium">Biaya Hari Ini</span>
                                        <span className="font-bold">{formatRupiah(parseInt(currentCost.replace(/\./g, "")))}</span>
                                    </div>
                                    <div className="flex justify-center my-2 opacity-50">
                                        <ArrowRight className="w-4 h-4 text-white rotate-90" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-white/80 text-xs font-medium">Estimasi Masa Depan</span>
                                            <span className="text-[10px] opacity-70">({duration} Tahun, Inflasi {inflation}%)</span>
                                        </div>
                                        <span className="text-xl font-bold text-white bg-white/20 px-2 py-1 rounded">{formatRupiah(result.futureValue)}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* STRATEGY INFO */}
                        <Card className="p-6 rounded-2xl shadow-sm border border-slate-100 bg-white space-y-4">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-brand-600" /> Analisa Investasi
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Untuk mencapai <b>{currentTheme.label}</b> dalam {duration} tahun, uang Anda harus ditempatkan pada instrumen investasi dengan return minimal <b>{investmentRate}% per tahun</b>.
                            </p>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Pokok</p>
                                    <p className="text-sm font-black text-slate-700">
                                        {formatRupiah(result.monthlySaving * 12 * parseInt(duration))}
                                    </p>
                                </div>
                                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                    <p className="text-[10px] text-emerald-600 uppercase font-bold mb-1">Hasil Bunga</p>
                                    <p className="text-sm font-black text-emerald-700">
                                        {formatRupiah(Math.max(0, result.futureValue - (result.monthlySaving * 12 * parseInt(duration))))}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* ACTIONS */}
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={handleReset} className="flex-1 rounded-xl h-11 border-slate-300 text-slate-600 hover:bg-slate-50">
                                <RefreshCcw className="w-4 h-4 mr-2" /> Reset
                            </Button>
                            <Button className="flex-[2] rounded-xl h-11 bg-slate-800 hover:bg-slate-900 shadow-xl text-white font-bold" onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-2" /> Simpan PDF
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