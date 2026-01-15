"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Wallet, TrendingUp, TrendingDown, Save, 
  AlertCircle, AlertTriangle, Info,
  ShieldCheck, PiggyBank, Briefcase, CreditCard, ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/axios"; // Pastikan file axios.ts sudah ada

// --- 1. HELPER FUNCTIONS (Di Luar Component) ---
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseNumber = (str: string) => {
  const cleanStr = str.replace(/\./g, ""); 
  return parseInt(cleanStr) || 0;
};

// --- 2. SUB-COMPONENT (Di Luar Page agar Focus Aman) ---
const BudgetInput = ({ 
  label, value, field, setter, icon, placeholder, desc, 
  limitPercent, isMinLimit = false, fixedIncome 
}: any) => {
  
  // Hitung Limit Nominal
  const limitAmount = (fixedIncome * limitPercent) / 100;
  
  // Cek Pelanggaran Rule
  const isViolation = isMinLimit ? value < limitAmount : value > limitAmount;
  
  const suggestionText = isMinLimit 
    ? `Min: ${limitPercent}% (${formatNumber(limitAmount)})`
    : `Max: ${limitPercent}% (${formatNumber(limitAmount)})`;

  return (
    <div className="space-y-1.5 group">
       <div className="flex justify-between items-end">
         <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-tight">{label}</label>
         
         {/* Badge Indikator Cerdas */}
         <span className={cn(
           "text-[10px] font-bold transition-all px-2 py-0.5 rounded-md border",
           fixedIncome === 0 ? "hidden" : "",
           isViolation 
             ? "text-orange-700 border-orange-200 bg-orange-50 animate-pulse" 
             : "text-green-700 border-green-200 bg-green-50"
         )}>
           {isViolation && <AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" />}
           {suggestionText}
         </span>
       </div>

       <Input 
          icon={icon}
          type="text"
          inputMode="numeric"
          value={formatNumber(value)}
          onChange={(e) => {
            const val = parseNumber(e.target.value);
            setter((prev: any) => ({ ...prev, [field]: val }));
          }}
          className={cn(
             "transition-all duration-200 h-11 md:h-12 font-medium",
             isViolation && fixedIncome > 0 
                ? "border-orange-300 ring-2 ring-orange-50 bg-orange-50/10 focus-visible:ring-orange-200" 
                : "focus-visible:ring-blue-100"
          )}
          placeholder={placeholder}
       />
       
       <div className="flex justify-between items-start px-1">
          <p className="text-[10px] text-slate-400 italic">{desc}</p>
          {isViolation && fixedIncome > 0 && (
            <p className="text-[10px] text-orange-600 font-bold text-right">
              {isMinLimit ? "⚠️ Belum Target" : "⚠️ Over Budget"}
            </p>
          )}
       </div>
    </div>
  );
};

// --- 3. MAIN PAGE COMPONENT ---
export default function BudgetPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [income, setIncome] = useState({
    fixed: 8400000, // Default bisa 0 atau angka dummy
    variable: 1500000 
  });

  const [expenses, setExpenses] = useState({
    productiveDebt: 1000000,
    consumptiveDebt: 500000,
    insurance: 500000,
    saving: 1000000,
    living: 3000000,
  });

  // Memoize Total Expense
  const totalExpense = useMemo(() => {
    return Object.values(expenses).reduce((a, b) => a + b, 0);
  }, [expenses]);

  const totalIncome = income.fixed + income.variable;
  const balance = totalIncome - totalExpense;
  const usagePercentage = income.fixed > 0 ? Math.round((totalExpense / income.fixed) * 100) : 0;

  const formatRupiah = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  // --- FUNGSI SAVE KE BACKEND ---
  const handleSave = async () => {
    if (income.fixed <= 0) {
      setError("Gaji Tetap wajib diisi dan tidak boleh 0!");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Siapkan Payload (Data yang akan dikirim)
      const payload = {
        month: new Date().getMonth() + 1, // Bulan sekarang (1-12)
        year: new Date().getFullYear(),   // Tahun sekarang
        fixedIncome: income.fixed,
        variableIncome: income.variable,
        productiveDebt: expenses.productiveDebt,
        consumptiveDebt: expenses.consumptiveDebt,
        insurance: expenses.insurance,
        saving: expenses.saving,
        livingCost: expenses.living,
      };

      // 2. Tembak API Backend
      await api.post("/financial/budget", payload);
      
      // 3. Sukses
      alert("Anggaran Berhasil Disimpan & Dianalisa!");
      router.push("/"); // Kembali ke Dashboard

    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Gagal menyimpan data ke server.";
      setError(Array.isArray(msg) ? msg[0] : msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-5 pt-4 pb-24 min-h-full font-sans max-w-5xl mx-auto">
      
      {/* HEADER & SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-center">
        <div className="space-y-1">
           <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Atur Anggaran</h1>
           <p className="text-sm text-slate-600 font-medium">
             Perencanaan 5 Pos Anggaran (Financial Health Rule).
           </p>
           {error && (
             <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-lg text-xs font-bold w-fit animate-pulse border border-red-100">
                <AlertTriangle className="w-4 h-4" /> {error}
             </div>
           )}
        </div>

        {/* SUMMARY CARD */}
        <div className={cn(
            "rounded-[2rem] p-6 shadow-2xl text-white transition-all duration-500 relative overflow-hidden group",
            balance >= 0 ? "bg-blue-600 shadow-blue-200" : "bg-red-600 shadow-red-200"
        )}>
           <div className="relative z-10 flex justify-between items-start mb-2">
              <div>
                 <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">
                   {balance >= 0 ? "Cashflow Positif" : "Defisit Anggaran"}
                 </p>
                 <h2 className="text-3xl font-black tracking-tighter mt-1">
                   {formatRupiah(balance)}
                 </h2>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                 <Wallet className="w-6 h-6 text-white" />
              </div>
           </div>
           
           <div className="mt-4 relative z-10">
              <div className="flex justify-between text-[10px] font-bold text-blue-50 mb-1.5">
                 <span>UTILISASI: {usagePercentage}% DARI GAJI TETAP</span>
                 <span>TARGET: 100%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                 <div 
                   className={cn("h-full rounded-full transition-all duration-1000", usagePercentage > 100 ? "bg-red-300" : "bg-green-300")} 
                   style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                 ></div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* A. PENDAPATAN (Left / Top) */}
        <section className="lg:col-span-4 space-y-4">
           <div className="flex items-center gap-2 px-1">
              <div className="p-1.5 bg-green-100 rounded-lg text-green-600">
                 <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 uppercase">Pendapatan</h3>
           </div>
           
           <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[2rem] p-6 shadow-sm space-y-5">
              <div className="space-y-1">
                 <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Gaji Tetap</label>
                 <Input 
                    type="text"
                    inputMode="numeric"
                    value={formatNumber(income.fixed)}
                    onChange={(e: any) => {
                      const val = parseNumber(e.target.value);
                      setIncome(prev => ({ ...prev, fixed: val }));
                      if (val > 0) setError(null);
                    }}
                    className={cn(
                      "font-bold text-green-700 bg-white h-12 text-lg rounded-xl",
                      income.fixed === 0 ? "border-red-300 ring-2 ring-red-100" : "border-green-200 focus-visible:ring-green-400"
                    )}
                 />
                 {income.fixed === 0 && <p className="text-[9px] text-red-500 font-bold ml-1">*Wajib diisi sebagai acuan.</p>}
              </div>

              <div className="space-y-1">
                 <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Bonus / Sampingan</label>
                 <Input 
                    type="text"
                    inputMode="numeric"
                    value={formatNumber(income.variable)}
                    onChange={(e: any) => {
                      const val = parseNumber(e.target.value);
                      setIncome(prev => ({ ...prev, variable: val }));
                    }}
                    className="bg-slate-50 border-slate-200 text-slate-600 h-12 rounded-xl"
                 />
              </div>
           </div>
        </section>

        {/* B. PENGELUARAN (Right / Bottom) */}
        <section className="lg:col-span-8 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center gap-2 px-1">
              <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
                 <TrendingDown className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 uppercase">5 Pos Anggaran (Rules)</h3>
           </div>
           
           <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-[2rem] p-6 shadow-sm">
             {/* Grid Layout untuk Desktop biar tidak kepanjangan */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                <BudgetInput 
                  label="1. Hutang Produktif" field="productiveDebt" value={expenses.productiveDebt}
                  setter={setExpenses} icon={<Briefcase className="w-4 h-4" />}
                  placeholder="0" desc="KPR, Modal Usaha." 
                  limitPercent={20} fixedIncome={income.fixed}
                />

                <BudgetInput 
                  label="2. Hutang Konsumtif" field="consumptiveDebt" value={expenses.consumptiveDebt}
                  setter={setExpenses} icon={<CreditCard className="w-4 h-4" />}
                  placeholder="0" desc="Paylater, Kartu Kredit." 
                  limitPercent={15} fixedIncome={income.fixed}
                />

                <BudgetInput 
                  label="3. Asuransi & Proteksi" field="insurance" value={expenses.insurance}
                  setter={setExpenses} icon={<ShieldCheck className="w-4 h-4" />}
                  placeholder="0" desc="Kesehatan, Jiwa." 
                  limitPercent={10} isMinLimit fixedIncome={income.fixed}
                />

                <BudgetInput 
                  label="4. Tabungan & Investasi" field="saving" value={expenses.saving}
                  setter={setExpenses} icon={<PiggyBank className="w-4 h-4" />}
                  placeholder="0" desc="Dana Darurat, Pensiun." 
                  limitPercent={10} isMinLimit fixedIncome={income.fixed}
                />

                <div className="md:col-span-2">
                  <BudgetInput 
                    label="5. Biaya Hidup" field="living" value={expenses.living}
                    setter={setExpenses} icon={<ShoppingBag className="w-4 h-4" />}
                    placeholder="0" desc="Makan, Listrik, Transport, Gaya Hidup." 
                    limitPercent={45} fixedIncome={income.fixed}
                  />
                </div>
             </div>
           </div>
        </section>

      </div>

      {/* FOOTER ACTION */}
      <div className="mt-8 pb-4 space-y-4 max-w-lg mx-auto lg:max-w-none">
         <Button 
            fullWidth size="lg" onClick={handleSave}
            disabled={isLoading || income.fixed === 0}
            className={cn(
               "shadow-2xl rounded-2xl h-14 text-base font-black transition-all",
               income.fixed === 0 ? "bg-slate-300 text-slate-500" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
            )}
         >
            {isLoading ? "MENYIMPAN DATA..." : "SIMPAN & ANALISA"}
         </Button>
         
         <div className="flex items-center justify-center gap-2 opacity-50">
            <Info className="w-3 h-3 text-slate-400" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               Enterprise Financial Logic
            </p>
         </div>
      </div>

    </div>
  );
}