"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Target, Plane, Heart, Star, 
  RefreshCcw, Download, CalendarDays, Coins, 
  TrendingUp, Wallet, ArrowRight, Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/financial-math"; 
import { SpecialGoalResult, GoalType, GoalSimulationInput } from "@/lib/types";
import { generateSpecialGoalPDF } from "@/lib/pdf-generator";
import { financialService } from "@/services/financial.service"; 

// Konfigurasi Tema per Tujuan
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
    color: "text-blue-600", 
    gradient: "from-blue-500 to-indigo-700",
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
    if (result) setResult(null);
  };

  // --- API INTEGRATION ---
  const handleCalculate = async () => {
    const cost = parseInt(currentCost.replace(/\./g, "")) || 0;
    const years = parseInt(duration) || 0;

    if (cost === 0 || years === 0) {
      alert("Mohon lengkapi estimasi biaya dan jangka waktu.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Prepare Payload sesuai Interface GoalSimulationInput (Tahap 1)
      const payload: GoalSimulationInput = {
        currentCost: cost,
        years: years,
        inflationRate: inflation,
        returnRate: investmentRate
      };

      // 2. Call API Simulator (Tahap 2)
      // Note: Kita pakai 'simulateGoal' karena tidak menyimpan ke DB dulu
      const data = await financialService.simulateGoal(payload);

      // 3. Map Response to UI State
      setResult({
        futureValue: data.futureCost,    // Mapping: futureCost -> futureValue
        monthlySaving: data.monthlySaving
      });

    } catch (error) {
      console.error("Gagal menghitung goals:", error);
      alert("Terjadi kesalahan saat menghitung data. Pastikan Backend berjalan.");
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
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12">
      
      {/* Dynamic Header Background */}
      <div className={cn(
        "h-48 md:h-64 w-full absolute top-0 left-0 rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-xl z-0 overflow-hidden transition-all duration-700 bg-gradient-to-br",
        currentTheme.gradient
      )}>
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 pt-8 md:pt-16">
        
        {/* Title Section */}
        <div className="text-center text-white mb-8">
           <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 mb-3">
              <Target className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white tracking-wider uppercase">Special Goal Planner</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Wujudkan Mimpi Anda</h1>
           <p className="text-white/90 text-sm md:text-base max-w-lg mx-auto">
             Apapun impiannya, mari kita hitung strategi menabung yang tepat untuk mencapainya.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN - INPUTS */}
            <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Goal Selector */}
                <Card className="p-5 rounded-[2rem] shadow-md border-slate-100 bg-white/95 backdrop-blur-xl">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Pilih Jenis Tujuan</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {GOAL_OPTIONS.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => { setSelectedGoal(option.id); setResult(null); }}
                                className={cn(
                                    "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 gap-2",
                                    selectedGoal === option.id 
                                        ? `bg-slate-900 border-slate-900 text-white shadow-lg scale-105` 
                                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                                )}
                            >
                                <option.icon className={cn("w-6 h-6", selectedGoal === option.id ? "text-white" : option.color)} />
                                <span className="text-xs font-bold">{option.label}</span>
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-xs text-slate-400 mt-3 italic">
                        "{currentTheme.desc}"
                    </p>
                </Card>

                {/* 2. Input Parameters */}
                <Card className="p-6 rounded-[2rem] shadow-md border-slate-100 bg-white/95 backdrop-blur-xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                <Coins className="w-3 h-3" /> Biaya Saat Ini
                            </label>
                            <Input 
                                placeholder="0" 
                                value={currentCost} 
                                onChange={(e) => handleMoneyInput(e.target.value)} 
                                className="h-12 text-lg font-bold text-slate-700 bg-slate-50 border-slate-200 focus:ring-slate-400"
                            />
                            <p className="text-[10px] text-slate-400">Harga jika Anda membelinya hari ini.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" /> Target Waktu
                            </label>
                            <div className="relative">
                                <Input 
                                    type="number"
                                    value={duration} 
                                    onChange={(e) => { setDuration(e.target.value); setResult(null); }} 
                                    className="h-12 text-lg font-bold text-center text-slate-700 bg-slate-50 border-slate-200 focus:ring-slate-400 pl-4 pr-12"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Tahun</span>
                            </div>
                            <p className="text-[10px] text-slate-400">Berapa lama lagi ingin tercapai?</p>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-slate-100">
                        {/* Inflation Slider */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Asumsi Inflasi (Kenaikan Harga)</label>
                                <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-md">{inflation}% / thn</span>
                            </div>
                            <Slider 
                                value={inflation} 
                                onChange={(val: number) => { setInflation(val); setResult(null); }} 
                                min={0} max={20} step={0.5} 
                                colorClass="accent-red-500"
                            />
                        </div>

                        {/* Investment Slider */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Estimasi Return Investasi</label>
                                <span className="text-xs font-bold bg-emerald-100 text-emerald-600 px-2 py-1 rounded-md">{investmentRate}% / thn</span>
                            </div>
                            <Slider 
                                value={investmentRate} 
                                onChange={(val: number) => { setInvestmentRate(val); setResult(null); }} 
                                min={0} max={20} step={0.5} 
                                colorClass="accent-emerald-500"
                            />
                        </div>
                    </div>

                    <Button 
                        onClick={handleCalculate}
                        disabled={isLoading}
                        className={cn(
                            "w-full h-12 text-lg font-bold shadow-lg rounded-xl text-white transition-all active:scale-95 bg-gradient-to-r disabled:opacity-70 disabled:cursor-not-allowed",
                            currentTheme.gradient
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

            {/* RIGHT COLUMN - RESULT */}
            <div className="lg:col-span-5 space-y-6">
                {!result ? (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center opacity-60 p-8 border-2 border-dashed border-slate-200 bg-white/50 rounded-[2rem]">
                        <div className={cn("w-24 h-24 rounded-full flex items-center justify-center mb-4 bg-slate-100", currentTheme.color)}>
                            <currentTheme.icon className="w-10 h-10 opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700">Menunggu Data</h3>
                        <p className="text-slate-500 text-sm max-w-xs">
                            Masukkan biaya <b>{currentTheme.label}</b> dan target waktu untuk melihat analisanya.
                        </p>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                        
                        {/* MAIN RESULT CARD */}
                        <Card className={cn(
                            "text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden border-0 bg-gradient-to-br",
                            currentTheme.gradient
                        )}>
                            {/* Decoration Circles */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3" />

                            <div className="relative z-10 text-center space-y-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 mb-3">
                                        <Wallet className="w-3 h-3 text-white" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">Target Tabungan</span>
                                    </div>
                                    <p className="text-sm text-white/80 font-medium mb-1">Rekomendasi Setoran Per Bulan</p>
                                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                        {formatRupiah(result.monthlySaving)}
                                    </h2>
                                </div>

                                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="text-white/70">Biaya Hari Ini</span>
                                        <span className="font-bold">{formatRupiah(parseInt(currentCost.replace(/\./g, "")))}</span>
                                    </div>
                                    <div className="flex justify-center my-2">
                                        <ArrowRight className="w-4 h-4 text-white/50 rotate-90" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70 text-xs text-left">
                                            Biaya {duration} Tahun Lagi<br/>
                                            <span className="text-[10px] opacity-70">(Akibat Inflasi {inflation}%)</span>
                                        </span>
                                        <span className="text-xl font-bold text-white">{formatRupiah(result.futureValue)}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* INFO CARD */}
                        <Card className="p-5 rounded-2xl shadow-sm border border-slate-100 bg-white space-y-3">
                            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Strategi Investasi
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Untuk mencapai <b>{currentTheme.label}</b> dalam {duration} tahun, uang Anda harus tumbuh minimal <b>{investmentRate}% per tahun</b> (di atas inflasi).
                            </p>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Disetor</p>
                                    <p className="text-sm font-bold text-slate-600">
                                        {formatRupiah(result.monthlySaving * 12 * parseInt(duration))}
                                    </p>
                                </div>
                                <div className="flex-1 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                    <p className="text-[10px] text-emerald-600 uppercase font-bold mb-1">Hasil Bunga</p>
                                    <p className="text-sm font-bold text-emerald-700">
                                        {formatRupiah(Math.max(0, result.futureValue - (result.monthlySaving * 12 * parseInt(duration))))}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* ACTIONS */}
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" onClick={handleReset} className="flex-1 rounded-xl h-11 border-slate-300">
                                <RefreshCcw className="w-4 h-4 mr-2" /> Reset
                            </Button>
                            <Button className="flex-[2] rounded-xl h-11 bg-slate-800 hover:bg-slate-900 shadow-xl text-white" onClick={handleDownload}>
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