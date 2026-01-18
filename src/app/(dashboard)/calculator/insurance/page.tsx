"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  ShieldCheck, HeartPulse, BadgeDollarSign, 
  RefreshCcw, Download, Landmark, Wallet, 
  TrendingUp, AlertCircle, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateInsurance, formatRupiah } from "@/lib/financial-math";
import { InsuranceResult } from "@/lib/types";
import { generateInsurancePDF } from "@/lib/pdf-generator";

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
  const [protectionDuration, setProtectionDuration] = useState("10"); // Default 10 tahun
  const [inflation, setInflation] = useState(5);
  const [returnRate, setReturnRate] = useState(6); // Investasi moderat

  // Card 3: Lainnya
  const [finalExpense, setFinalExpense] = useState("");
  const [existingInsurance, setExistingInsurance] = useState("");

  const [result, setResult] = useState<InsuranceResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- VALIDATION & HANDLERS ---
  
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

  const handleCalculate = () => {
    if (!validateInputs()) return;

    const input = {
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

    const calc = calculateInsurance(input);
    setResult(calc);
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
    <div className="min-h-screen w-full bg-slate-50/50 pb-24 md:pb-12">
      
      {/* Header Decoration */}
      <div className="bg-rose-600 h-48 md:h-64 w-full absolute top-0 left-0 rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-xl z-0 overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 pt-8 md:pt-16">
        
        {/* Title */}
        <div className="text-center text-white mb-8">
           <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 mb-3">
              <ShieldCheck className="w-4 h-4 text-rose-100" />
              <span className="text-xs font-bold text-rose-50 tracking-wider uppercase">Insurance Planner</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Perencanaan Asuransi</h1>
           <p className="text-rose-100 text-sm md:text-base max-w-lg mx-auto">
             Hitung berapa dana tunai (Uang Pertanggungan) yang harus disiapkan untuk melindungi keluarga jika terjadi risiko.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN - INPUTS */}
            <div className="lg:col-span-7 space-y-6">
                
                {/* Card 1: Kewajiban / Utang */}
                <Card className="p-6 rounded-[2rem] shadow-md border-slate-100 bg-white/95 backdrop-blur-xl">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                        <BadgeDollarSign className="w-5 h-5 text-rose-600" /> 1. Lunasi Utang Keluarga
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 -mt-2">Masukkan sisa utang berjalan agar keluarga tidak terbebani cicilan.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Sisa KPR (Rumah)</label>
                            <Input placeholder="0" value={debtKPR} onChange={e => handleMoneyInput(e.target.value, setDebtKPR)} className="bg-slate-50 text-right focus:ring-rose-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Sisa Kredit Kendaraan (KPM)</label>
                            <Input placeholder="0" value={debtKPM} onChange={e => handleMoneyInput(e.target.value, setDebtKPM)} className="bg-slate-50 text-right focus:ring-rose-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Utang Usaha / Modal</label>
                            <Input placeholder="0" value={debtProductive} onChange={e => handleMoneyInput(e.target.value, setDebtProductive)} className="bg-slate-50 text-right focus:ring-rose-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Utang Kartu Kredit / Paylater</label>
                            <Input placeholder="0" value={debtConsumptive} onChange={e => handleMoneyInput(e.target.value, setDebtConsumptive)} className="bg-slate-50 text-right focus:ring-rose-500" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Utang Lainnya (Arisan, Teman, dll)</label>
                            <Input placeholder="0" value={debtOther} onChange={e => handleMoneyInput(e.target.value, setDebtOther)} className="bg-slate-50 text-right focus:ring-rose-500" />
                        </div>
                    </div>
                </Card>

                {/* Card 2: Income Replacement */}
                <Card className="p-6 rounded-[2rem] shadow-md border-slate-100 bg-white/95 backdrop-blur-xl">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                        <Wallet className="w-5 h-5 text-rose-600" /> 2. Dana Biaya Hidup Keluarga
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 -mt-2">Berapa lama keluarga butuh dana pengganti gaji?</p>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Gaji Bersih Setahun</label>
                                <Input 
                                    placeholder="0" 
                                    value={annualIncome} 
                                    onChange={e => handleMoneyInput(e.target.value, setAnnualIncome)} 
                                    className={cn(
                                        "bg-emerald-50 border-emerald-100 text-right font-bold text-emerald-900 focus:ring-emerald-500",
                                        errors.annualIncome && "border-red-500 bg-red-50 text-red-900"
                                    )} 
                                />
                                {errors.annualIncome && (
                                    <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-3 h-3"/> {errors.annualIncome}
                                    </p>
                                )}
                                <p className="text-[9px] text-emerald-600 ml-1">*Total gaji 12 bulan (Take Home Pay)</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Lama Ditanggung</label>
                                <Input 
                                    type="text" inputMode="numeric" 
                                    placeholder="10" 
                                    value={protectionDuration} 
                                    onChange={e => handleYearInput(e.target.value, setProtectionDuration)} 
                                    className="bg-slate-50 text-center font-bold focus:ring-rose-500" 
                                />
                                <p className="text-[9px] text-slate-400 text-center">*Dalam Tahun</p>
                            </div>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-xl space-y-6 border border-slate-100">
                            <Slider 
                                label="Asumsi Inflasi Tahunan" valueLabel={`${inflation}%`}
                                value={inflation} onChange={setInflation} min={3} max={10} step={0.5} colorClass="accent-red-500"
                            />
                            <Slider 
                                label="Target Return Investasi" valueLabel={`${returnRate}%`}
                                value={returnRate} onChange={setReturnRate} min={3} max={12} step={0.5} colorClass="accent-emerald-500"
                            />
                            <p className="text-[9px] text-slate-400 italic leading-tight">
                                *Sistem akan menghitung "Nett Rate" (Selisih Investasi - Inflasi) untuk menentukan modal yang dibutuhkan.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Card 3: Lainnya */}
                <Card className="p-6 rounded-[2rem] shadow-md border-slate-100 bg-white/95 backdrop-blur-xl">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                        <Landmark className="w-5 h-5 text-rose-600" /> 3. Dana Darurat & Aset
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Biaya Pemakaman & RS</label>
                            <Input placeholder="0" value={finalExpense} onChange={e => handleMoneyInput(e.target.value, setFinalExpense)} className="bg-slate-50 text-right focus:ring-rose-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-emerald-600 uppercase">Asuransi Jiwa yg Sudah Punya</label>
                            <Input placeholder="0" value={existingInsurance} onChange={e => handleMoneyInput(e.target.value, setExistingInsurance)} className="bg-emerald-50 border-emerald-100 text-right font-bold text-emerald-800 focus:ring-emerald-500" />
                        </div>
                    </div>
                </Card>

                <Button 
                    onClick={handleCalculate} 
                    className="w-full h-12 bg-rose-600 hover:bg-rose-700 font-bold text-lg shadow-lg shadow-rose-200 rounded-xl transition-all active:scale-95"
                >
                    Hitung Total Kebutuhan Proteksi
                </Button>
            </div>

            {/* RIGHT COLUMN - RESULT */}
            <div className="lg:col-span-5 space-y-6">
                {!result ? (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center opacity-60 p-8 border-2 border-dashed border-rose-200/50 rounded-[2rem]">
                        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                            <HeartPulse className="w-10 h-10 text-rose-300" />
                        </div>
                        <h3 className="text-xl font-bold text-rose-900">Menunggu Data</h3>
                        <p className="text-rose-700 text-sm">Lengkapi data di samping untuk melihat analisa kebutuhan asuransi Anda.</p>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                        
                        {/* MAIN RESULT CARD */}
                        <Card className={cn(
                            "text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden border-0",
                            result.shortfall > 0 ? "bg-gradient-to-br from-rose-600 to-pink-700" : "bg-gradient-to-br from-emerald-600 to-teal-700"
                        )}>
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            
                            <div className="relative z-10 space-y-6">
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-2 bg-black/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 mb-3">
                                        {result.shortfall > 0 ? <AlertCircle className="w-4 h-4 text-rose-200" /> : <CheckCircle2 className="w-4 h-4 text-emerald-200" />}
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
                                            {result.shortfall > 0 ? "Asuransi Tambahan yg Dibutuhkan" : "Proteksi Sudah Cukup"}
                                        </span>
                                    </div>
                                    
                                    <h2 className="text-3xl md:text-5xl font-black mb-2 text-white">
                                        {formatRupiah(result.shortfall)}
                                    </h2>
                                    <p className="text-[10px] text-white/80 opacity-90 leading-relaxed max-w-sm mx-auto">
                                        {result.shortfall > 0 
                                            ? "Disarankan menambah Uang Pertanggungan (UP) sebesar nilai ini agar keluarga aman secara finansial."
                                            : "Selamat! Aset asuransi Anda saat ini sudah cukup menutupi estimasi kebutuhan dana darurat keluarga."
                                        }
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                                    <div>
                                        <p className="text-white/60 text-[10px] font-bold uppercase mb-1">Total Dana Dibutuhkan</p>
                                        <p className="text-lg font-bold">{formatRupiah(result.totalFundNeeded)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/60 text-[10px] font-bold uppercase mb-1">Asuransi Lama</p>
                                        <p className="text-lg font-bold text-white">{formatRupiah(existingInsurance ? parseInt(existingInsurance.replace(/\./g, "")) : 0)}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* BREAKDOWN CARD */}
                        <Card className="p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Rincian Penggunaan Dana
                            </h4>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">1. Bayar Lunas Semua Utang</span>
                                    <span className="font-bold text-slate-700">{formatRupiah(result.totalDebt)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">2. Modal Hidup Keluarga (15 Thn)</span>
                                    <span className="font-bold text-slate-700">{formatRupiah(result.incomeReplacementValue)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">3. Biaya Pemakaman & RS</span>
                                    <span className="font-bold text-slate-700">{formatRupiah(finalExpense ? parseInt(finalExpense.replace(/\./g, "")) : 0)}</span>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-3 rounded-xl text-[10px] text-slate-500 leading-relaxed border border-slate-100">
                                <span className="font-bold text-rose-600">Info:</span> Dana "Modal Hidup Keluarga" adalah uang tunai yang harus disimpan (Deposito/SBN) agar bunganya bisa menggantikan gaji bulanan selama {protectionDuration} tahun ke depan.
                            </div>
                        </Card>

                        {/* ACTIONS */}
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" onClick={handleReset} className="flex-1 rounded-xl h-11 border-slate-300">
                                <RefreshCcw className="w-4 h-4 mr-2" /> Reset
                            </Button>
                            <Button className="flex-[2] rounded-xl h-11 bg-slate-800 hover:bg-slate-900 shadow-xl" onClick={handleDownload}>
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