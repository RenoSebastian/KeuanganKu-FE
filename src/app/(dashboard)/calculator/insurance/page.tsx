"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider"; 
import { 
  ShieldCheck, HeartPulse, BadgeDollarSign, 
  RefreshCcw, Download, Landmark, Wallet, 
  TrendingUp, AlertCircle, CheckCircle2, Loader2, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/financial-math"; 
import { InsuranceResult } from "@/lib/types";
import { generateInsurancePDF } from "@/lib/pdf-generator";
import { financialService } from "@/services/financial.service"; 

export default function InsurancePage() {
  // --- STATE INPUT ---
  // Card 1: Utang
  const [debtKPR, setDebtKPR] = useState("");
  const [debtKPM, setDebtKPM] = useState("");
  const [debtProductive, setDebtProductive] = useState("");
  const [debtConsumptive, setDebtConsumptive] = useState("");
  const [debtOther, setDebtOther] = useState("");

  // Card 2: Proteksi Penghasilan
  const [annualIncome, setAnnualIncome] = useState("");
  const [protectionDuration, setProtectionDuration] = useState("10"); 
  const [inflation, setInflation] = useState(5);
  const [returnRate, setReturnRate] = useState(6); 

  // Card 3: Lainnya
  const [finalExpense, setFinalExpense] = useState("");
  const [existingInsurance, setExistingInsurance] = useState("");

  const [result, setResult] = useState<InsuranceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- HANDLERS ---
  
  const handleMoneyInput = (val: string, setter: (v: string) => void) => {
    let num = val.replace(/\D/g, "");
    if (num.length > 1 && num.startsWith("0")) num = num.substring(1);
    setter(num.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    
    if (errors.annualIncome) setErrors((prev) => ({ ...prev, annualIncome: "" }));
    if (result) setResult(null);
  };

  const handleYearInput = (val: string, setter: (v: string) => void) => {
    let num = val.replace(/\D/g, "");
    if (num.length > 1 && num.startsWith("0")) num = num.substring(1);
    setter(num);
    if (result) setResult(null);
  };

  const parseMoney = (val: string) => parseInt(val.replace(/\./g, "")) || 0;

  const validateInputs = () => {
    const newErrors: Record<string, string> = {};
    const income = parseMoney(annualIncome);
    const debt = parseMoney(debtKPR) + parseMoney(debtKPM) + parseMoney(debtProductive) + parseMoney(debtConsumptive) + parseMoney(debtOther);

    if (income === 0 && debt === 0) {
        newErrors.annualIncome = "Wajib diisi (atau isi data utang)";
    }

    if (parseInt(protectionDuration) <= 0) {
        newErrors.protectionDuration = "Min 1 thn";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- API INTEGRATION ---
  const handleCalculate = async () => {
    if (!validateInputs()) return;
    setIsLoading(true);

    try {
        const pDebtKPR = parseMoney(debtKPR);
        const pDebtKPM = parseMoney(debtKPM);
        const pDebtProd = parseMoney(debtProductive);
        const pDebtCons = parseMoney(debtConsumptive);
        const pDebtOther = parseMoney(debtOther);
        
        const totalDebt = pDebtKPR + pDebtKPM + pDebtProd + pDebtCons + pDebtOther;
        const pIncome = parseMoney(annualIncome);
        const pFinalExpense = parseMoney(finalExpense);
        const pExisting = parseMoney(existingInsurance);

        const response = await financialService.saveInsurancePlan({
            type: "LIFE", 
            dependentCount: 2, 
            monthlyExpense: pIncome / 12, 
            existingDebt: totalDebt,
            existingCoverage: pExisting,
            protectionDuration: parseInt(protectionDuration) || 10
        });

        const calc = response.calculation;

        setResult({
            totalDebt: totalDebt,
            incomeReplacementValue: calc.totalNeeded - totalDebt - pFinalExpense, 
            totalFundNeeded: calc.totalNeeded,
            shortfall: calc.coverageGap
        });

    } catch (error) {
        console.error("Gagal menghitung asuransi:", error);
        alert("Terjadi kesalahan saat menghitung data. Silakan coba lagi.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDebtKPR(""); setDebtKPM(""); setDebtProductive(""); setDebtConsumptive(""); setDebtOther("");
    setAnnualIncome(""); setProtectionDuration("10");
    setFinalExpense(""); setExistingInsurance("");
    setResult(null);
    setErrors({});
  };

  const handleDownload = () => {
    if (result) {
        let userName = "User";
        if (typeof window !== "undefined") {
          const savedUser = localStorage.getItem("user");
          if (savedUser) { userName = JSON.parse(savedUser).name || "User"; }
        }
  
        const inputData = {
            debtKPR: parseMoney(debtKPR),
            debtKPM: parseMoney(debtKPM),
            debtProductive: parseMoney(debtProductive),
            debtConsumptive: parseMoney(debtConsumptive),
            debtOther: parseMoney(debtOther),
            annualIncome: parseMoney(annualIncome),
            protectionDuration: parseInt(protectionDuration) || 0,
            inflationRate: inflation,
            investmentRate: returnRate,
            finalExpense: parseMoney(finalExpense),
            existingInsurance: parseMoney(existingInsurance),
        };
  
        generateInsurancePDF(inputData, result, userName);
    }
  };

  return (
    <div className="min-h-full w-full pb-24 md:pb-12">
      
      {/* --- HEADER (PAM BRAND IDENTITY) --- */}
      <div className="bg-brand-900 pt-10 pb-32 px-5 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
         <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-[0.05] mix-blend-overlay"></div>

         <div className="relative z-10 max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-4">
               <ShieldCheck className="w-4 h-4 text-cyan-300" />
               <span className="text-[10px] font-bold text-cyan-100 tracking-widest uppercase">Insurance Planner</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
              Perencanaan Asuransi
            </h1>
            <p className="text-brand-100 text-sm md:text-base max-w-lg mx-auto leading-relaxed opacity-90">
              Hitung kebutuhan Uang Pertanggungan (UP) untuk melindungi masa depan finansial keluarga Anda bersama PAM JAYA.
            </p>
         </div>
      </div>

      <div className="relative z-20 max-w-6xl mx-auto px-5 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN - INPUTS */}
            <div className="lg:col-span-7 space-y-6">
                
                {/* Card 1: Kewajiban / Utang */}
                <div className="card-clean p-6 md:p-8 bg-white/95 backdrop-blur-xl">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                        <BadgeDollarSign className="w-5 h-5 text-brand-600" /> 1. Sisa Utang Keluarga
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 -mt-2">Masukkan sisa pokok utang (outstanding) agar keluarga tidak terbebani cicilan jika terjadi risiko.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Sisa KPR (Rumah)</label>
                            <InputGroup value={debtKPR} onChange={e => handleMoneyInput(e.target.value, setDebtKPR)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Sisa Kredit Kendaraan (KPM)</label>
                            <InputGroup value={debtKPM} onChange={e => handleMoneyInput(e.target.value, setDebtKPM)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Utang Usaha / Modal</label>
                            <InputGroup value={debtProductive} onChange={e => handleMoneyInput(e.target.value, setDebtProductive)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Utang Kartu Kredit</label>
                            <InputGroup value={debtConsumptive} onChange={e => handleMoneyInput(e.target.value, setDebtConsumptive)} />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Utang Lainnya</label>
                            <InputGroup value={debtOther} onChange={e => handleMoneyInput(e.target.value, setDebtOther)} />
                        </div>
                    </div>
                </div>

                {/* Card 2: Income Replacement */}
                <div className="card-clean p-6 md:p-8 bg-white/95 backdrop-blur-xl">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                        <Wallet className="w-5 h-5 text-brand-600" /> 2. Dana Biaya Hidup Keluarga
                    </h3>
                    <p className="text-xs text-slate-500 mb-6 -mt-2">Berapa dana yang dibutuhkan keluarga untuk bertahan hidup tanpa penghasilan utama?</p>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-[10px] font-bold text-brand-600 uppercase">Gaji Bersih Setahun</label>
                                <InputGroup 
                                    value={annualIncome} 
                                    onChange={e => handleMoneyInput(e.target.value, setAnnualIncome)} 
                                    isPrimary
                                    error={errors.annualIncome}
                                />
                                {errors.annualIncome && (
                                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-3 h-3"/> {errors.annualIncome}
                                    </p>
                                )}
                                <p className="text-[9px] text-slate-400 ml-1 mt-1">*Total gaji 12 bulan (Take Home Pay)</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Lama Ditanggung</label>
                                <div className="relative group">
                                    <Input 
                                        type="number"
                                        placeholder="10" 
                                        value={protectionDuration} 
                                        onChange={e => handleYearInput(e.target.value, setProtectionDuration)} 
                                        className="h-12 bg-slate-50 text-center font-bold text-slate-800 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl pr-12 pl-4" 
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Tahun</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-brand-50/50 p-5 rounded-xl space-y-6 border border-brand-100/50">
                            {/* SLIDER CONFIGURATION */}
                            <Slider 
                                label="Asumsi Inflasi Tahunan" 
                                valueLabel={`${inflation}%`}
                                value={inflation} 
                                onChange={(val) => { setInflation(val); setResult(null); }} 
                                min={0} max={20} step={0.5} 
                                colorClass="accent-rose-500"
                            />
                            
                            <Slider 
                                label="Target Return Investasi" 
                                valueLabel={`${returnRate}%`}
                                value={returnRate} 
                                onChange={(val) => { setReturnRate(val); setResult(null); }} 
                                min={0} max={20} step={0.5} 
                                colorClass="accent-emerald-500"
                            />
                            
                            <p className="text-[10px] text-slate-400 italic leading-tight pt-2 border-t border-brand-100">
                                *Sistem akan menghitung "Nett Rate" (Selisih Investasi - Inflasi) untuk menentukan modal yang dibutuhkan.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card 3: Lainnya */}
                <div className="card-clean p-6 md:p-8 bg-white/95 backdrop-blur-xl">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                        <Landmark className="w-5 h-5 text-brand-600" /> 3. Biaya Duka & Asuransi Existing
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Biaya Pemakaman & RS</label>
                            <InputGroup value={finalExpense} onChange={e => handleMoneyInput(e.target.value, setFinalExpense)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-emerald-600 uppercase">Asuransi Jiwa yg Sudah Punya</label>
                            <InputGroup value={existingInsurance} onChange={e => handleMoneyInput(e.target.value, setExistingInsurance)} isGreen />
                        </div>
                    </div>
                </div>

                <Button 
                    onClick={handleCalculate} 
                    disabled={isLoading}
                    className="w-full h-12 bg-brand-600 hover:bg-brand-700 font-bold text-lg shadow-lg shadow-brand-500/20 rounded-xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menghitung...</>
                    ) : (
                        "Hitung Total Kebutuhan Proteksi"
                    )}
                </Button>
            </div>

            {/* RIGHT COLUMN - RESULT */}
            <div className="lg:col-span-5 space-y-6">
                {!result ? (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 bg-white/50 rounded-[2rem]">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <HeartPulse className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700">Menunggu Data</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-xs leading-relaxed">
                            Lengkapi data di samping untuk melihat analisa kebutuhan asuransi Anda.
                        </p>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                        
                        {/* MAIN RESULT CARD */}
                        <Card className={cn(
                            "text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden border-0 bg-gradient-to-br flex flex-col justify-center min-h-[300px]",
                            result.shortfall > 0  ? "from-[#083A52] to-[#0A84B8]" : "from-[#083A52] to-[#0A84B8]"
                        )}>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3" />
                            
                            <div className="relative z-10 text-center">
                                <div className="inline-flex items-center gap-2 bg-black/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10 mb-6">
                                    {result.shortfall > 0 ? <AlertCircle className="w-4 h-4 text-rose-200" /> : <CheckCircle2 className="w-4 h-4 text-emerald-200" />}
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
                                        {result.shortfall > 0 ? "Kekurangan Proteksi" : "Proteksi Sudah Cukup"}
                                    </span>
                                </div>
                                
                                <h2 className="text-4xl lg:text-5xl font-black mb-3 text-white tracking-tight drop-shadow-sm">
                                    {formatRupiah(result.shortfall)}
                                </h2>
                                <p className="text-xs text-white/80 opacity-90 leading-relaxed max-w-sm mx-auto mb-8 border-b border-white/20 pb-6">
                                    {result.shortfall > 0 
                                        ? "Disarankan menambah Uang Pertanggungan (UP) sebesar nilai ini agar keluarga aman secara finansial."
                                        : "Selamat! Aset asuransi Anda saat ini sudah cukup menutupi estimasi kebutuhan dana darurat keluarga."
                                    }
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-left">
                                        <p className="text-white/60 text-[10px] font-bold uppercase mb-1">Total Dana Dibutuhkan</p>
                                        <p className="text-lg font-bold truncate" title={formatRupiah(result.totalFundNeeded)}>
                                            {formatRupiah(result.totalFundNeeded)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/60 text-[10px] font-bold uppercase mb-1">Asuransi Lama</p>
                                        <p className="text-lg font-bold text-white truncate" title={formatRupiah(existingInsurance ? parseInt(existingInsurance.replace(/\./g, "")) : 0)}>
                                            {formatRupiah(existingInsurance ? parseInt(existingInsurance.replace(/\./g, "")) : 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* BREAKDOWN CARD */}
                        <div className="p-6 rounded-2xl shadow-sm border border-slate-100 bg-white space-y-5">
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-brand-600" /> Rincian Penggunaan Dana
                            </h4>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm group">
                                    <span className="text-slate-500 group-hover:text-slate-700 transition-colors">1. Bayar Lunas Semua Utang</span>
                                    <span className="font-bold text-slate-700">{formatRupiah(result.totalDebt)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm group">
                                    <span className="text-slate-500 group-hover:text-slate-700 transition-colors">2. Modal Hidup Keluarga ({protectionDuration} Thn)</span>
                                    <span className="font-bold text-slate-700">{formatRupiah(result.incomeReplacementValue)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm group">
                                    <span className="text-slate-500 group-hover:text-slate-700 transition-colors">3. Biaya Pemakaman & RS</span>
                                    <span className="font-bold text-slate-700">{formatRupiah(finalExpense ? parseInt(finalExpense.replace(/\./g, "")) : 0)}</span>
                                </div>
                            </div>
                            
                            <div className="bg-brand-50 p-4 rounded-xl text-[10px] text-brand-700 leading-relaxed border border-brand-100">
                                <span className="font-bold">Info:</span> Dana "Modal Hidup Keluarga" adalah uang tunai yang harus disimpan (Deposito/SBN) agar bunganya bisa menggantikan gaji bulanan selama {protectionDuration} tahun ke depan.
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex gap-3 pt-2">
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

// --- SUB COMPONENTS (REUSABLE) ---

interface InputGroupProps { 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    isPrimary?: boolean; 
    isGreen?: boolean;
    error?: string;
}

function InputGroup({ value, onChange, isPrimary, isGreen, error }: InputGroupProps) {
    return (
        <div className="relative group">
            <div className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors",
                isGreen 
                    ? "bg-emerald-100 text-emerald-600 group-focus-within:bg-emerald-600 group-focus-within:text-white"
                    : isPrimary
                        ? "bg-brand-100 text-brand-600 group-focus-within:bg-brand-600 group-focus-within:text-white"
                        : "bg-slate-100 text-slate-500 group-focus-within:bg-slate-600 group-focus-within:text-white"
            )}>Rp</div>
            <Input 
                value={value} 
                onChange={onChange} 
                className={cn(
                    "pl-14 h-12 font-bold rounded-xl transition-all",
                    isGreen 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white"
                        : isPrimary
                            ? "bg-brand-50 border-brand-200 text-brand-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:bg-white"
                            : "bg-slate-50 border-slate-200 text-slate-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:bg-white",
                    error && "border-red-500 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500/10"
                )}
                placeholder="0"
            />
        </div>
    );
}