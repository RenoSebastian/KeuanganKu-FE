"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Calculator, Wallet, BadgePercent, TrendingUp, 
  AlertTriangle, ShieldCheck, PiggyBank, RefreshCcw, Download,
  CalendarDays, CalendarRange, User, DollarSign, Loader2, Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateSmartBudget, formatRupiah } from "@/lib/financial-math"; // Masih dipakai untuk mapping visual hasil backend
import { generateBudgetPDF } from "@/lib/pdf";
import { BudgetResult, BudgetAllocation } from "@/lib/types";
import { financialService } from "@/services/financial.service"; 
import { BudgetGuide } from "@/components/features/calculator/budget-guide";

// --- 1. HELPER: MAPPING VISUAL BERDASARKAN TIPE ---
const getAllocationStyle = (type: BudgetAllocation["type"]) => {
  switch (type) {
    case "NEEDS": return { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", icon: Wallet, iconColor: "text-blue-500" };
    case "DEBT_PROD": return { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", icon: TrendingUp, iconColor: "text-amber-500" };
    case "DEBT_CONS": return { bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-700", icon: AlertTriangle, iconColor: "text-rose-500" };
    case "INSURANCE": return { bg: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-700", icon: ShieldCheck, iconColor: "text-indigo-500" };
    case "SAVING": return { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", icon: PiggyBank, iconColor: "text-emerald-500" };
    default: return { bg: "bg-slate-50", border: "border-slate-100", text: "text-slate-700", icon: Wallet, iconColor: "text-slate-500" };
  }
};

export default function BudgetPage() {
  // --- STATE INPUT ---
  const [fixedIncome, setFixedIncome] = useState("");
  const [variableIncome, setVariableIncome] = useState("");

  // --- STATE RESULT (DUAL VIEW) ---
  const [viewMode, setViewMode] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [result, setResult] = useState<BudgetResult | null>(null); // Menyimpan hasil perhitungan dari BE (mapped)
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State untuk menyimpan mode input (Total vs Kalkulasi)
  const [kprInputMode, setKprInputMode] = useState<'TOTAL' | 'CALC'>('TOTAL');
  const [kpmInputMode, setKpmInputMode] = useState<'TOTAL' | 'CALC'>('TOTAL');

  // --- 1. LOAD DATA AWAL (FETCH EXISTING BUDGET) ---
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const data = await financialService.getBudgets();
        if (data && data.length > 0) {
          const latestBudget = data[0];
          
          // Pastikan nilai dari DB diformat titik sebelum masuk ke state
          setFixedIncome(new Intl.NumberFormat("id-ID").format(Number(latestBudget.fixedIncome)));
          setVariableIncome(new Intl.NumberFormat("id-ID").format(Number(latestBudget.variableIncome)));
          
          const monthlyRes = calculateSmartBudget(
            Number(latestBudget.fixedIncome), 
            Number(latestBudget.variableIncome)
          );
          setResult(monthlyRes);
        }
      } catch (error) {
        console.error("Gagal memuat budget:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudget();
  }, []);

  // --- HANDLERS ---
  const handleMoneyInput = (val: string, setter: (v: string) => void) => {
    // 1. Hapus semua karakter non-digit
    const rawValue = val.replace(/\D/g, "");
    
    // 2. Jika kosong, set ke string kosong agar placeholder muncul
    if (!rawValue) {
      setter("");
      return;
    }

    // 3. Format ke ribuan (Contoh: 1000000 -> 1.000.000)
    const formatted = new Intl.NumberFormat("id-ID").format(parseInt(rawValue));
    setter(formatted);
  };

  const handleCalculateAndSave = async () => {
    // Gunakan regex global /./g untuk menghapus semua titik
    const fixed = parseInt(fixedIncome.replace(/\./g, "")) || 0;
    const variable = parseInt(variableIncome.replace(/\./g, "")) || 0;

    if (fixed === 0) {
      alert("Masukkan Pemasukkan Tetap terlebih dahulu.");
      return;
    }

    setIsSaving(true);

    try {
      // 1. Mapping Payload sesuai CreateBudgetDto di Backend
      const payload = {
        fixedIncome: fixed,
        variableIncome: variable,
        month: new Date().getMonth() + 1, // Mengirim bulan berjalan (1-12)
        year: new Date().getFullYear(),   // Mengirim tahun berjalan
        // Field lain (livingCost, dll) tidak perlu dikirim karena akan dihitung otomatis oleh BE
      };
      
      // 2. Simpan ke Backend dan ambil hasilnya
      const response = await financialService.createBudget(payload);

      // 3. Update UI dengan hasil kalkulasi CERDAS dari Backend
      // Backend mengembalikan { budget: BudgetPlan, analysis: any }
      if (response && response.budget) {
        // Kita petakan kembali ke format BudgetResult yang dibutuhkan UI
        const mappedResult: BudgetResult = {
          safeToSpend: Number(response.budget.livingCost),
          totalFixedAllocated: Number(response.budget.totalExpense),
          surplus: Number(response.budget.balance),
          allocations: [
            {
              label: "Kebutuhan Hidup",
              percentage: 45,
              amount: Number(response.budget.livingCost),
              type: "NEEDS",
              description: "Makan, Transport, Listrik & Pulsa."
            },
            {
              label: "Hutang Produktif",
              percentage: 20,
              amount: Number(response.budget.productiveDebt),
              type: "DEBT_PROD",
              description: "Cicilan KPR atau Modal Usaha."
            },
            {
              label: "Hutang Konsumtif",
              percentage: 15,
              amount: Number(response.budget.consumptiveDebt),
              type: "DEBT_CONS",
              description: "Cicilan Motor, HP, atau Kartu Kredit."
            },
            {
              label: "Asuransi",
              percentage: 10,
              amount: Number(response.budget.insurance),
              type: "INSURANCE",
              description: "Premi Jiwa & Kesehatan keluarga."
            },
            {
              label: "Tabungan & Investasi",
              percentage: 10,
              amount: Number(response.budget.saving),
              type: "SAVING",
              description: "Dana Darurat & Investasi masa depan."
            }
          ]
        };
        setResult(mappedResult);
      }

    } catch (error) {
      console.error("Gagal menyimpan budget:", error);
      alert("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if(confirm("Reset formulir anggaran?")) {
      setFixedIncome("");
      setVariableIncome("");
      setResult(null);
    }
  };

  const handleDownload = () => {
    if (result) {
      // Generate ANNUAL result on the fly for PDF
      const annualRes = calculateSmartBudget(
        (parseInt(fixedIncome.replace(/\./g, "")) || 0) * 12, 
        (parseInt(variableIncome.replace(/\./g, "")) || 0) * 12
      );
      
      // Mock user data for PDF header
      const user = { name: "User", age: "", fixedIncome: parseInt(fixedIncome.replace(/\./g, "")) || 0 };
      
      generateBudgetPDF(result, annualRes, user);
    }
  };

  // Switch View Mode Logic (Transform Monthly Result to Annual)
  const displayedResult = viewMode === "MONTHLY" ? result : (result ? {
      ...result,
      safeToSpend: result.safeToSpend * 12,
      totalFixedAllocated: result.totalFixedAllocated * 12,
      surplus: result.surplus * 12,
      allocations: result.allocations.map(a => ({ ...a, amount: a.amount * 12 }))
  } : null);

  if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center min-h-125">
              <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Memuat data anggaran...</p>
          </div>
      );
  }

  return (
    <div className="min-h-full w-full pb-24 md:pb-12">
      
      {/* --- HEADER (PAM BRAND IDENTITY) --- */}
      <div className="bg-brand-900 pt-10 pb-32 px-5 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-125 h-125 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
         
         <div className="relative z-10 max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-4">
               <Calculator className="w-4 h-4 text-cyan-300" />
               <span className="text-[10px] font-bold text-cyan-100 tracking-widest uppercase">Smart Budgeting 50/30/20</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
              Kalkulator Anggaran
            </h1>
            <p className="text-brand-100 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Metode cerdas membagi penghasilan untuk kebutuhan, keinginan, dan tabungan masa depan PAM JAYA.
            </p>
         </div>
      </div>

      <div className="relative z-20 max-w-5xl mx-auto px-5 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* --- LEFT: INPUT FORM (Clean UI) --- */}
          <Card className="md:col-span-5 p-6 md:p-8 rounded-[2rem] shadow-xl border-white/60 bg-white/95 backdrop-blur-xl card-clean">
          <BudgetGuide/>
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-brand-600" /> Input Pemasukan
            </h3>
            
            <div className="space-y-5">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-brand-600 uppercase tracking-wide">Pemasukkan Tetap (Gaji)</label>
                 <div className="relative group">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 font-bold text-xs transition-colors group-focus-within:bg-brand-600 group-focus-within:text-white">Rp</div>
                   <Input 
                     className="pl-14 h-14 text-lg font-bold bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl transition-all"
                     placeholder="0"
                     value={fixedIncome}
                     onChange={e => handleMoneyInput(e.target.value, setFixedIncome)}
                   />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pemasukkan Tidak Tetap</label>
                 <div className="relative group">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs transition-colors group-focus-within:bg-slate-600 group-focus-within:text-white">Rp</div>
                   <Input 
                     className="pl-14 h-12 font-bold bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl"
                     placeholder="0"
                     value={variableIncome}
                     onChange={e => handleMoneyInput(e.target.value, setVariableIncome)}
                   />
                 </div>
              </div>

              <Button 
                onClick={handleCalculateAndSave}
                disabled={isSaving}
                className="w-full h-12 bg-brand-600 hover:bg-brand-700 font-bold text-base shadow-lg shadow-brand-500/20 mt-2 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menyimpan...</>
                ) : (
                    <><Save className="w-4 h-4 mr-2" /> Hitung & Simpan</>
                )}
              </Button>
            </div>
          </Card>

          {/* --- RIGHT: RESULT DISPLAY --- */}
          <div className="md:col-span-7 space-y-6">
             {!displayedResult ? (
               <div className="h-full min-h-100 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white/50">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                     <BadgePercent className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Belum Ada Data</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-xs">Masukkan nominal gaji di panel kiri untuk melihat rekomendasi alokasi.</p>
               </div>
             ) : (
               <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-6">
                  
                  {/* TAB SWITCHER */}
                  <div className="bg-white p-1.5 rounded-xl flex gap-1 shadow-sm border border-slate-200 w-fit">
                     <button
                        onClick={() => setViewMode("MONTHLY")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                          viewMode === "MONTHLY" ? "bg-brand-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                        )}
                     >
                        <CalendarDays className="w-3.5 h-3.5" /> Bulanan
                     </button>
                     <button
                        onClick={() => setViewMode("ANNUAL")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                          viewMode === "ANNUAL" ? "bg-cyan-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                        )}
                     >
                        <CalendarRange className="w-3.5 h-3.5" /> Tahunan
                     </button>
                  </div>

                  {/* SAFE TO SPEND CARD */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className={cn(
                      "text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden border-0 flex flex-col justify-center",
                      viewMode === "MONTHLY" ? "bg-pam-gradient" : "bg-linear-to-br from-cyan-600 to-blue-700"
                    )}>
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                       <p className="text-brand-100 font-bold uppercase tracking-widest text-[10px] mb-1">
                         Safe to Spend ({viewMode === "MONTHLY" ? "Bulan Ini" : "Setahun"})
                       </p>
                       <h2 className="text-3xl font-black tracking-tight mb-2">
                          {formatRupiah(displayedResult.safeToSpend)}
                       </h2>
                       <div className="h-1 w-12 bg-white/30 rounded-full mb-2" />
                       <p className="text-[10px] text-brand-50 opacity-90 leading-relaxed">
                          Batas aman untuk Makan, Transport, & Gaya Hidup. Pastikan tidak melebihi angka ini.
                       </p>
                    </Card>

                    {/* DONUT CHART VISUALIZATION */}
                    <Card className="p-4 rounded-[2rem] bg-white border border-slate-100 flex items-center gap-6 shadow-sm">
                       <div className="relative w-24 h-24 rounded-full shrink-0" 
                           style={{ 
                             background: "conic-gradient(#3b82f6 0% 45%, #f59e0b 45% 65%, #f43f5e 65% 80%, #6366f1 80% 90%, #10b981 90% 100%)" 
                           }}>
                          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
                             <span className="text-[9px] font-bold text-slate-400 uppercase">Total</span>
                             <span className="text-xs font-black text-slate-800">100%</span>
                          </div>
                       </div>
                       <div className="space-y-1.5 text-[10px] font-bold text-slate-600">
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"/> Hidup (45%)</div>
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"/> Hutang P (20%)</div>
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"/> Hutang K (15%)</div>
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"/> Asuransi (10%)</div>
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Investasi (10%)</div>
                       </div>
                    </Card>
                  </div>

                  {/* ALLOCATION GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {displayedResult.allocations.map((item, idx) => {
                       const style = getAllocationStyle(item.type);
                       const Icon = style.icon;
                       return (
                         <div key={idx} className={cn(
                           "p-5 rounded-2xl border flex flex-col justify-between h-full transition-all hover:scale-[1.02] hover:shadow-md",
                           style.bg, style.border
                         )}>
                           <div className="flex justify-between items-start mb-3">
                              <div className={cn("p-2 rounded-xl bg-white shadow-sm", style.iconColor)}>
                                 <Icon className="w-5 h-5" />
                              </div>
                              <span className={cn("text-xs font-black px-2 py-1 rounded-lg bg-white/50 border border-black/5", style.text)}>
                                  {item.percentage}%
                              </span>
                           </div>
                           
                           <div>
                              <h4 className={cn("font-bold text-sm mb-1", style.text)}>{item.label}</h4>
                              <p className="text-2xl font-black text-slate-800 tracking-tight">
                                  {formatRupiah(item.amount)}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed min-h-[2.5em]">
                                  {item.description}
                              </p>
                           </div>
                         </div>
                       )
                     })}
                  </div>

                  {/* SURPLUS & ACTIONS */}
                  <div className="flex flex-col md:flex-row gap-4">
                     {displayedResult.surplus > 0 && (
                       <Card className="flex-1 bg-cyan-50 border-cyan-100 p-5 rounded-2xl flex items-center justify-between">
                          <div>
                             <p className="text-[10px] font-bold text-cyan-600 uppercase mb-1">
                               Surplus (Wajib Ditabung)
                             </p>
                             <h3 className="text-xl font-black text-cyan-900">{formatRupiah(displayedResult.surplus)}</h3>
                          </div>
                          <div className="h-10 w-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600">
                             <PiggyBank className="w-5 h-5" />
                          </div>
                       </Card>
                     )}
                     
                     <div className="flex gap-2 flex-1">
                        <Button variant="outline" onClick={handleReset} className="flex-1 h-auto rounded-xl border-slate-300 text-slate-600 hover:bg-slate-50">
                           <RefreshCcw className="w-4 h-4" />
                        </Button>
                        <Button 
                           className="flex-3 h-auto rounded-xl bg-slate-800 hover:bg-slate-900 shadow-xl" 
                           onClick={handleDownload}
                        >
                           <Download className="w-4 h-4 mr-2" /> Download PDF
                        </Button>
                     </div>
                  </div>

               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}