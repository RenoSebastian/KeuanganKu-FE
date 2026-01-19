"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, 
  Wallet, Building2, Banknote, Calculator,
  HelpCircle, AlertCircle, Coins, TrendingUp, 
  Home, CreditCard, Landmark, DollarSign, Calendar,
  User, Umbrella, PiggyBank, ShieldCheck
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FinancialRecord, HealthAnalysisResult } from "@/lib/types";
import { calculateFinancialHealth } from "@/lib/financial-math";
import { cn } from "@/lib/utils";
import { CheckupResult } from "./checkup-result"; 

// --- INITIAL STATE ---
const INITIAL_DATA: FinancialRecord = {
  // Personal
  fullName: "",
  age: 0,
  maritalStatus: "SINGLE",
  dependents: 0,
  // Aset
  assetCash: 0, assetDeposit: 0,
  assetGold: 0, assetMutualFund: 0, assetStocks: 0, assetPropertyInv: 0, assetOtherInv: 0,
  assetHome: 0, assetVehicle: 0, assetJewelry: 0, assetPersonalOther: 0,
  // Utang (Saldo)
  debtCC: 0, debtPersonal: 0,
  debtKPR: 0, debtKPM: 0, debtBusiness: 0,
  // Arus Kas
  incomeFixed: 0, incomeVariable: 0,
  expenseLiving: 0, expenseInsurance: 0,
  // Cicilan
  installmentKPR: 0, installmentKPM: 0, installmentCC: 0, installmentBusiness: 0, installmentOther: 0,
  // Tabungan
  savingRoutine: 0, investRoutine: 0,
  previousNetWorth: 0,
};

export function CheckupWizard() {
  const [step, setStep] = useState(0); // Start at 0 (Data Diri)
  const [formData, setFormData] = useState<FinancialRecord>(INITIAL_DATA);
  const [result, setResult] = useState<HealthAnalysisResult | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const handleInputChange = (field: keyof FinancialRecord, value: string) => {
    if (field === "fullName") {
      setFormData(prev => ({ ...prev, [field]: value }));
      return;
    }
    // Remove non-numeric chars logic
    const numericValue = parseFloat(value.replace(/[^0-9]/g, "")) || 0;
    setFormData((prev) => ({ ...prev, [field]: numericValue }));
  };

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep((prev) => Math.min(prev + 1, 4));
  };
  
  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleCalculate = () => {
    const analysis = calculateFinancialHealth(formData);
    setResult(analysis);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- SHOW RESULT IF DONE ---
  if (result) {
    return <CheckupResult data={result} onReset={() => setResult(null)} />;
  }

  if (!isClient) return null; // Prevent hydration mismatch

  // --- STEPS CONFIGURATION ---
  const steps = [
    { label: "Data Diri", icon: User },
    { label: "Aset", icon: Wallet },
    { label: "Utang", icon: CreditCard },
    { label: "Arus Kas", icon: Banknote },
    { label: "Review", icon: Calculator },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      
      {/* --- MODERN PROGRESS STEPPER --- */}
      <div className="mb-10 relative px-4 md:px-0">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0" />
        <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-out" 
            style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
        />
        
        <div className="flex justify-between relative z-10">
            {steps.map((s, idx) => {
                const isActive = step === idx;
                const isCompleted = step > idx;
                const Icon = s.icon;
                
                return (
                    <div key={idx} className="flex flex-col items-center group cursor-default">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-sm",
                            isActive ? "border-emerald-500 bg-white text-emerald-600 scale-110 shadow-lg shadow-emerald-500/20" : 
                            isCompleted ? "border-emerald-500 bg-emerald-500 text-white" : 
                            "border-slate-100 bg-white text-slate-300"
                        )}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <span className={cn(
                            "text-[10px] font-bold mt-3 uppercase tracking-wider transition-colors duration-300 absolute -bottom-6 w-24 text-center",
                            isActive ? "text-emerald-600" : isCompleted ? "text-emerald-500" : "text-slate-300"
                        )}>{s.label}</span>
                    </div>
                )
            })}
        </div>
      </div>

      <div className="h-6" /> {/* Spacer for labels */}

      {/* --- FORM CONTAINER --- */}
      <Card className="overflow-hidden border-0 shadow-2xl bg-white/90 backdrop-blur-sm ring-1 ring-slate-900/5 rounded-3xl">
        
        {/* Dynamic Header per Step */}
        <div className="bg-slate-50/80 border-b border-slate-100 p-6 md:p-8">
            <div className="flex items-center gap-4">
                <div className={cn("p-3.5 rounded-2xl shadow-sm transition-colors duration-500", 
                    step === 0 ? "bg-blue-100 text-blue-600" :
                    step === 1 ? "bg-emerald-100 text-emerald-600" :
                    step === 2 ? "bg-red-100 text-red-600" :
                    step === 3 ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"
                )}>
                    {step === 0 && <User className="w-6 h-6" />}
                    {step === 1 && <Wallet className="w-6 h-6" />}
                    {step === 2 && <CreditCard className="w-6 h-6" />}
                    {step === 3 && <Banknote className="w-6 h-6" />}
                    {step === 4 && <Calculator className="w-6 h-6" />}
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                        {step === 0 && "Identitas Pribadi"}
                        {step === 1 && "Kekayaan & Aset"}
                        {step === 2 && "Kewajiban & Utang"}
                        {step === 3 && "Arus Kas Tahunan"}
                        {step === 4 && "Review Data"}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                        {step === 0 && "Lengkapi data diri untuk profil risiko yang akurat."}
                        {step === 1 && "Masukkan estimasi nilai pasar aset Anda saat ini."}
                        {step === 2 && "Catat sisa pokok utang yang belum lunas (Outstanding)."}
                        {step === 3 && "Gambaran pemasukan dan pengeluaran Anda dalam setahun."}
                        {step === 4 && "Pastikan data valid sebelum sistem melakukan diagnosa."}
                    </p>
                </div>
            </div>
        </div>

        <div className="p-6 md:p-8 space-y-8 min-h-[400px]">
            
            {/* STEP 0: DATA DIRI */}
            {step === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="md:col-span-2 group space-y-2">
                         <Label className="font-bold text-slate-700 group-focus-within:text-blue-600 transition-colors">Nama Lengkap</Label>
                         <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                            <Input 
                                value={formData.fullName} 
                                onChange={(e) => handleInputChange("fullName", e.target.value)} 
                                className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all" 
                                placeholder="Masukkan nama Anda"
                            />
                         </div>
                    </div>
                    <div className="group space-y-2">
                         <Label className="font-bold text-slate-700 group-focus-within:text-blue-600 transition-colors">Usia (Tahun)</Label>
                         <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                            <Input 
                                type="number" value={formData.age || ""} 
                                onChange={(e) => handleInputChange("age", e.target.value)} 
                                className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
                                placeholder="Contoh: 30"
                            />
                         </div>
                    </div>
                    <div className="group space-y-2">
                         <Label className="font-bold text-slate-700 group-focus-within:text-blue-600 transition-colors">Jumlah Tanggungan</Label>
                         <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                            <Input 
                                type="number" value={formData.dependents || ""} 
                                onChange={(e) => handleInputChange("dependents", e.target.value)} 
                                className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
                                placeholder="0"
                            />
                         </div>
                    </div>
                    
                    <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-sm text-blue-800 mt-4">
                        <ShieldCheck className="w-5 h-5 shrink-0" />
                        <p>Data ini digunakan untuk menentukan profil risiko dan rekomendasi yang sesuai dengan usia produktif Anda.</p>
                    </div>
                </div>
            )}

            {/* STEP 1: ASET */}
            {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <SectionHeader title="1. Aset Likuid" desc="Uang tunai yang mudah dicairkan saat darurat" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Kas & Tabungan" value={formData.assetCash} onChange={(v) => handleInputChange("assetCash", v)} icon={<Wallet />} />
                        <InputGroup label="Deposito" value={formData.assetDeposit} onChange={(v) => handleInputChange("assetDeposit", v)} icon={<Landmark />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    <SectionHeader title="2. Aset Investasi" desc="Aset yang diharapkan tumbuh nilainya (Produktif)" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Logam Mulia (Emas)" value={formData.assetGold} onChange={(v) => handleInputChange("assetGold", v)} icon={<Coins />} />
                        <InputGroup label="Reksadana" value={formData.assetMutualFund} onChange={(v) => handleInputChange("assetMutualFund", v)} icon={<TrendingUp />} />
                        <InputGroup label="Saham / Obligasi" value={formData.assetStocks} onChange={(v) => handleInputChange("assetStocks", v)} icon={<TrendingUp />} />
                        <InputGroup label="Properti Sewa (Kos/Ruko)" value={formData.assetPropertyInv} onChange={(v) => handleInputChange("assetPropertyInv", v)} icon={<Building2 />} />
                        <InputGroup label="Investasi Lainnya" value={formData.assetOtherInv} onChange={(v) => handleInputChange("assetOtherInv", v)} icon={<Coins />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    <SectionHeader title="3. Aset Personal" desc="Aset guna pakai (tidak menghasilkan cashflow)" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Rumah Tinggal" value={formData.assetHome} onChange={(v) => handleInputChange("assetHome", v)} icon={<Home />} />
                        <InputGroup label="Kendaraan Pribadi" value={formData.assetVehicle} onChange={(v) => handleInputChange("assetVehicle", v)} icon={<CreditCard />} />
                        <InputGroup label="Perhiasan / Koleksi" value={formData.assetJewelry} onChange={(v) => handleInputChange("assetJewelry", v)} icon={<Coins />} />
                        <InputGroup label="Aset Personal Lain" value={formData.assetPersonalOther} onChange={(v) => handleInputChange("assetPersonalOther", v)} icon={<Wallet />} />
                    </div>
                </div>
            )}

            {/* STEP 2: UTANG */}
            {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                     <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 text-red-800 text-sm mb-6">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <div>
                            <p className="font-bold">Penting:</p>
                            <p>Masukkan <strong>Sisa Pokok Utang</strong> (Saldo berjalan yang belum lunas), bukan nominal cicilan bulanan.</p>
                        </div>
                    </div>

                    <SectionHeader title="1. Utang Jangka Pendek" desc="Jatuh tempo < 1 tahun (Kartu Kredit, Paylater)" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Kartu Kredit / Paylater" value={formData.debtCC} onChange={(v) => handleInputChange("debtCC", v)} icon={<CreditCard />} />
                        <InputGroup label="Utang Pribadi / Keluarga" value={formData.debtPersonal} onChange={(v) => handleInputChange("debtPersonal", v)} icon={<User />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    <SectionHeader title="2. Utang Jangka Panjang" desc="Jatuh tempo > 1 tahun (KPR, Leasing)" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="KPR (Rumah)" value={formData.debtKPR} onChange={(v) => handleInputChange("debtKPR", v)} icon={<Home />} />
                        <InputGroup label="KPM (Kendaraan)" value={formData.debtKPM} onChange={(v) => handleInputChange("debtKPM", v)} icon={<CreditCard />} />
                        <InputGroup label="Utang Modal Usaha" value={formData.debtBusiness} onChange={(v) => handleInputChange("debtBusiness", v)} icon={<Building2 />} />
                    </div>
                </div>
            )}

            {/* STEP 3: ARUS KAS */}
            {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-800 text-sm mb-2">
                        <Coins className="w-5 h-5 shrink-0" />
                        <p>Pastikan membedakan antara angka <strong>Tahunan</strong> dan <strong>Bulanan</strong> sesuai label.</p>
                    </div>

                    <div className="space-y-4">
                        <SectionHeader title="1. Pemasukan (Per Tahun)" desc="Total pendapatan bersih (Take Home Pay) setahun" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Penghasilan Tetap (Gaji)" value={formData.incomeFixed} onChange={(v) => handleInputChange("incomeFixed", v)} icon={<DollarSign />} />
                            <InputGroup label="Penghasilan Tidak Tetap (Bonus)" value={formData.incomeVariable} onChange={(v) => handleInputChange("incomeVariable", v)} icon={<TrendingUp />} />
                        </div>
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    <div className="space-y-4">
                        <SectionHeader title="2. Pengeluaran Rutin" desc="Biaya hidup sehari-hari & proteksi" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Biaya Hidup (Per Bulan)" value={formData.expenseLiving} onChange={(v) => handleInputChange("expenseLiving", v)} icon={<Wallet />} />
                            <InputGroup label="Premi Asuransi (Per Tahun)" value={formData.expenseInsurance} onChange={(v) => handleInputChange("expenseInsurance", v)} icon={<Umbrella />} />
                        </div>
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    <div className="space-y-4">
                        <SectionHeader title="3. Cicilan Utang (Per Tahun)" desc="Total uang yang keluar untuk bayar utang setahun" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Cicilan KPR" value={formData.installmentKPR} onChange={(v) => handleInputChange("installmentKPR", v)} icon={<Home />} />
                            <InputGroup label="Cicilan Kendaraan (KPM)" value={formData.installmentKPM} onChange={(v) => handleInputChange("installmentKPM", v)} icon={<CreditCard />} />
                            <InputGroup label="Cicilan CC / Paylater" value={formData.installmentCC} onChange={(v) => handleInputChange("installmentCC", v)} icon={<CreditCard />} />
                            <InputGroup label="Cicilan Modal Usaha" value={formData.installmentBusiness} onChange={(v) => handleInputChange("installmentBusiness", v)} icon={<Building2 />} />
                            <InputGroup label="Cicilan Lainnya" value={formData.installmentOther} onChange={(v) => handleInputChange("installmentOther", v)} icon={<User />} />
                        </div>
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    <div className="space-y-4">
                        <SectionHeader title="4. Tabungan & Investasi (Bulanan)" desc="Uang yang disisihkan setiap bulan" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Tabungan Rutin" value={formData.savingRoutine} onChange={(v) => handleInputChange("savingRoutine", v)} icon={<PiggyBank />} />
                            <InputGroup label="Investasi Rutin" value={formData.investRoutine} onChange={(v) => handleInputChange("investRoutine", v)} icon={<TrendingUp />} />
                            <InputGroup label="Net Worth Tahun Lalu (Opsional)" value={formData.previousNetWorth || 0} onChange={(v) => handleInputChange("previousNetWorth", v)} icon={<Calendar />} />
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 4: REVIEW */}
            {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
                    <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 space-y-6 relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-24 bg-indigo-500/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
                        
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 relative z-10">
                            <Calculator className="w-5 h-5 text-indigo-600" /> Ringkasan Neraca
                        </h3>
                        
                        <div className="space-y-3 relative z-10">
                            <ReviewRow label="Total Aset Likuid" value={formData.assetCash + formData.assetDeposit} />
                            <ReviewRow label="Total Aset Investasi" value={formData.assetGold + formData.assetMutualFund + formData.assetStocks + formData.assetPropertyInv + formData.assetOtherInv} />
                            <ReviewRow label="Total Aset Personal" value={formData.assetHome + formData.assetVehicle + formData.assetJewelry + formData.assetPersonalOther} />
                            <div className="border-t border-slate-200 my-2" />
                            <ReviewRow label="Total Kewajiban (Utang)" value={formData.debtCC + formData.debtPersonal + formData.debtKPR + formData.debtKPM + formData.debtBusiness} isNegative />
                        </div>

                        <div className="mt-6 pt-6 border-t border-dashed border-slate-300 relative z-10">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
                                <Banknote className="w-5 h-5 text-emerald-600" /> Ringkasan Arus Kas
                            </h3>
                            <div className="space-y-3">
                                <ReviewRow label="Total Pemasukan (Thn)" value={formData.incomeFixed + formData.incomeVariable} highlight />
                                <ReviewRow label="Total Cicilan (Thn)" value={formData.installmentKPR + formData.installmentKPM + formData.installmentCC + formData.installmentBusiness + formData.installmentOther} isNegative />
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-3 text-indigo-800 text-sm">
                        <HelpCircle className="w-5 h-5 shrink-0 text-indigo-600" />
                        <p>Sistem akan menggunakan data ini untuk menghitung <strong>8 indikator kesehatan finansial</strong> Anda secara presisi sesuai standar perencana keuangan.</p>
                    </div>
                </div>
            )}

        </div>

        {/* --- FOOTER ACTION --- */}
        <div className="bg-white p-6 md:p-8 border-t border-slate-100 flex justify-between items-center rounded-b-3xl">
            <Button 
                variant="ghost" 
                onClick={prevStep}
                disabled={step === 0}
                className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Sebelumnya
            </Button>

            {step < 4 ? (
                <Button 
                    onClick={nextStep}
                    className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 px-8 h-12 rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-xl"
                >
                    Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            ) : (
                <Button 
                    onClick={handleCalculate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 px-8 h-12 rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-emerald-600/30"
                >
                    <Calculator className="w-4 h-4 mr-2" /> Diagnosa Sekarang
                </Button>
            )}
        </div>

      </Card>
    </div>
  );
}

// --- SUB COMPONENTS ---

function SectionHeader({title, desc}: {title: string, desc: string}) {
    return (
        <div className="mb-4 pb-2 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
        </div>
    );
}

function InputGroup({ icon, label, desc, value, onChange }: { icon: React.ReactNode, label: string, desc?: string, value: number, onChange: (val: string) => void }) {
    return (
        <div className="group space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide group-focus-within:text-emerald-600 transition-colors">
                {label}
            </Label>
            <div className="relative transition-all duration-300 group-focus-within:ring-4 group-focus-within:ring-emerald-500/10 rounded-xl">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    {icon}
                </div>
                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 font-light text-xl">|</div>
                <div className="absolute left-14 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-xs">Rp</div>
                <Input 
                    type="text" 
                    value={value === 0 ? "" : value.toLocaleString("id-ID")}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-20 h-12 bg-slate-50/50 border-slate-200 focus:border-emerald-500 focus:bg-white font-bold text-slate-800 shadow-sm rounded-xl transition-all"
                    placeholder="0"
                />
            </div>
            {desc && <p className="text-[11px] text-slate-400 leading-tight pl-1">{desc}</p>}
        </div>
    );
}

function ReviewRow({ label, value, isNegative, highlight }: { label: string, value: number, isNegative?: boolean, highlight?: boolean }) {
    return (
        <div className={cn(
            "flex justify-between items-center py-2 px-3 rounded-lg transition-colors",
            highlight ? "bg-emerald-50/80 border border-emerald-100" : "hover:bg-slate-50"
        )}>
            <span className={cn("text-sm font-medium", highlight ? "text-emerald-800" : "text-slate-500")}>{label}</span>
            <span className={cn(
                "font-mono font-bold text-base", 
                isNegative ? "text-red-600" : highlight ? "text-emerald-700" : "text-slate-800"
            )}>
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value)}
            </span>
        </div>
    );
}