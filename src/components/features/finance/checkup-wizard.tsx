"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, 
  Wallet, Banknote, Calculator,
  CreditCard, User, Heart, MapPin, Briefcase, Users,
  ShoppingBag, Car, Gem, Phone, Umbrella, PiggyBank, ShieldCheck, 
  Landmark, DollarSign, TrendingUp, Home, Coins, Plane, AlertCircle, 
  Loader2 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FinancialRecord, HealthAnalysisResult, PersonalInfo } from "@/lib/types";
import { financialService } from "@/services/financial.service"; 
import { cn } from "@/lib/utils";
import { CheckupResult } from "./checkup-result"; 

// --- INITIAL STATE ---
const EMPTY_PROFILE: PersonalInfo = {
  name: "", dob: "", gender: "L", ethnicity: "", religion: "ISLAM",
  maritalStatus: "SINGLE", childrenCount: 0, dependentParents: 0,
  occupation: "", city: ""
};

const INITIAL_DATA: FinancialRecord = {
  // 1. Metadata
  userProfile: { ...EMPTY_PROFILE },
  spouseProfile: { ...EMPTY_PROFILE },

  // 2. Aset (Neraca)
  assetCash: 0,
  assetHome: 0, assetVehicle: 0, assetJewelry: 0, assetAntique: 0, assetPersonalOther: 0,
  assetInvHome: 0, assetInvVehicle: 0, assetGold: 0, assetInvAntique: 0, 
  assetStocks: 0, assetMutualFund: 0, assetBonds: 0, assetDeposit: 0, assetInvOther: 0,

  // 3. Utang (Neraca - Sisa Pokok)
  debtKPR: 0, debtKPM: 0, debtCC: 0, debtCoop: 0, debtConsumptiveOther: 0,
  debtBusiness: 0,

  // 4. Arus Kas (Cashflow)
  incomeFixed: 0, incomeVariable: 0,
  installmentKPR: 0, installmentKPM: 0, installmentCC: 0, installmentCoop: 0, 
  installmentConsumptiveOther: 0, installmentBusiness: 0,
  insuranceLife: 0, insuranceHealth: 0, insuranceHome: 0, insuranceVehicle: 0, 
  insuranceBPJS: 0, insuranceOther: 0,
  savingEducation: 0, savingRetirement: 0, savingPilgrimage: 0, savingHoliday: 0, 
  savingEmergency: 0, savingOther: 0,
  expenseFood: 0, expenseSchool: 0, expenseTransport: 0, expenseCommunication: 0, 
  expenseHelpers: 0, expenseTax: 0, expenseLifestyle: 0,
};

export function CheckupWizard() {
  const [step, setStep] = useState(0); 
  const [formData, setFormData] = useState<FinancialRecord>(INITIAL_DATA);
  const [result, setResult] = useState<HealthAnalysisResult | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => setIsClient(true), []);

  const handleFinancialChange = (field: keyof FinancialRecord, value: string) => {
    const numericValue = parseFloat(value.replace(/[^0-9]/g, "")) || 0;
    setFormData((prev) => ({ ...prev, [field]: numericValue }));
  };

  const handleProfileChange = (type: "userProfile" | "spouseProfile", field: keyof PersonalInfo, value: any) => {
    setFormData((prev) => ({
      ...prev, [type]: { ...prev[type]!, [field]: value }
    }));
  };

  const nextStep = () => { window.scrollTo({ top: 0, behavior: "smooth" }); setStep(prev => Math.min(prev + 1, 4)); };
  const prevStep = () => { window.scrollTo({ top: 0, behavior: "smooth" }); setStep(prev => Math.max(prev - 1, 0)); };
  
  // --- UPDATE LOGIC: API CALL WITH SANITIZATION ---
  const handleCalculate = async () => { 
    setIsLoading(true);
    try {
      // 1. Buat salinan data agar tidak mengubah state form UI secara langsung
      const payload = { ...formData };

      // 2. SANITASI: Hapus data pasangan jika status bukan menikah
      // Backend akan menolak jika spouseProfile ada tapi isinya kosong/invalid date
      if (payload.userProfile.maritalStatus !== "MARRIED") {
        delete payload.spouseProfile;
      }

      // 3. Panggil API Backend via Service
      const analysis = await financialService.createCheckup(payload);
      
      setResult(analysis); 
      window.scrollTo({ top: 0, behavior: "smooth" }); 
    } catch (error: any) {
      console.error("Gagal melakukan analisa:", error);
      
      // Ambil pesan error detail dari backend jika ada
      const errorMsg = error.response?.data?.message 
        ? Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(", ") 
          : error.response.data.message
        : "Terjadi kesalahan saat memproses data. Silakan periksa koneksi atau input Anda.";

      alert(`Gagal: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (result) {
    return (
      <CheckupResult 
        data={result} 
        rawData={formData} 
        onReset={() => setResult(null)} 
      />
    );
  }

  if (!isClient) return null;

  const steps = [
    { label: "Data Diri", icon: User },
    { label: "Aset", icon: Wallet },
    { label: "Utang", icon: CreditCard },
    { label: "Arus Kas", icon: Banknote },
    { label: "Review", icon: Calculator },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      
      {/* --- PROGRESS STEPPER (PAM BRAND THEME) --- */}
      <div className="mb-10 relative px-4 md:px-0">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 rounded-full z-0" />
        <div 
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-brand-700 to-cyan-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-out" 
            style={{ width: `${(step / 4) * 100}%` }} 
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
                            isActive ? "border-brand-500 bg-white text-brand-600 scale-110 shadow-lg shadow-brand-500/20" : 
                            isCompleted ? "border-brand-500 bg-brand-500 text-white" : 
                            "border-slate-100 bg-slate-50 text-slate-300"
                        )}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <span className={cn(
                            "text-[10px] font-bold mt-3 uppercase tracking-wider absolute -bottom-6 w-24 text-center transition-colors duration-300", 
                            isActive ? "text-brand-700" : isCompleted ? "text-brand-500" : "text-slate-300"
                        )}>
                            {s.label}
                        </span>
                    </div>
                )
            })}
        </div>
      </div>
      <div className="h-6" />

      {/* --- MAIN CARD (CLEAN UI) --- */}
      <div className="card-clean overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-slate-50/50 border-b border-slate-100 p-6 md:p-8">
            <div className="flex items-center gap-5">
                <div className={cn(
                    "p-3.5 rounded-2xl shadow-sm transition-all duration-500 ring-1 ring-inset ring-white/50", 
                    "bg-brand-50 text-brand-600" 
                )}>
                    {step === 0 && <User className="w-8 h-8" />}
                    {step === 1 && <Wallet className="w-8 h-8" />}
                    {step === 2 && <CreditCard className="w-8 h-8" />}
                    {step === 3 && <Banknote className="w-8 h-8" />}
                    {step === 4 && <Calculator className="w-8 h-8" />}
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                        {step === 0 && "Identitas & Profil"}
                        {step === 1 && "Neraca Aset (Harta)"}
                        {step === 2 && "Neraca Utang (Kewajiban)"}
                        {step === 3 && "Arus Kas Tahunan"}
                        {step === 4 && "Review Data"}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                        {step === 0 && "Lengkapi data diri User dan Pasangan (jika ada)."}
                        {step === 1 && "Detail aset likuid, investasi, dan personal."}
                        {step === 2 && "Sisa pokok utang konsumtif dan produktif."}
                        {step === 3 && "Detail pemasukan, pengeluaran, cicilan, dan tabungan."}
                        {step === 4 && "Pastikan semua data valid sebelum diagnosa."}
                    </p>
                </div>
            </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 md:p-8 space-y-8 min-h-[400px]">
            {/* STEP 0: DATA DIRI */}
            {step === 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div>
                        <SectionHeader title="Data Pribadi" desc="Informasi utama pengguna" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextInput label="Nama Lengkap" icon={<User className="w-4 h-4" />} value={formData.userProfile.name} onChange={(v) => handleProfileChange("userProfile", "name", v)} />
                            <div className="grid grid-cols-2 gap-4">
                                <DateInput label="Tgl Lahir" value={formData.userProfile.dob} onChange={(v) => handleProfileChange("userProfile", "dob", v)} />
                                <SelectInput label="Gender" value={formData.userProfile.gender} onChange={(v) => handleProfileChange("userProfile", "gender", v)} options={[{value: "L", label: "Laki-laki"}, {value: "P", label: "Perempuan"}]} />
                            </div>
                            <TextInput label="Suku Bangsa" icon={<Users className="w-4 h-4" />} value={formData.userProfile.ethnicity} onChange={(v) => handleProfileChange("userProfile", "ethnicity", v)} />
                            <SelectInput label="Agama" value={formData.userProfile.religion} onChange={(v) => handleProfileChange("userProfile", "religion", v)} options={[{value: "ISLAM", label: "Islam"}, {value: "KRISTEN", label: "Kristen"}, {value: "KATOLIK", label: "Katolik"}, {value: "HINDU", label: "Hindu"}, {value: "BUDDHA", label: "Buddha"}, {value: "LAINNYA", label: "Lainnya"}]} />
                            <SelectInput label="Status Perkawinan" value={formData.userProfile.maritalStatus} onChange={(v) => handleProfileChange("userProfile", "maritalStatus", v)} options={[{value: "SINGLE", label: "Belum Menikah"}, {value: "MARRIED", label: "Menikah"}, {value: "DIVORCED", label: "Pernah Menikah"}]} />
                            <div className="grid grid-cols-2 gap-4">
                                <TextInput label="Jumlah Anak" type="number" icon={<User className="w-4 h-4" />} value={formData.userProfile.childrenCount} onChange={(v) => handleProfileChange("userProfile", "childrenCount", parseInt(v) || 0)} />
                                <TextInput label="Tanggungan Ortu" type="number" icon={<User className="w-4 h-4" />} value={formData.userProfile.dependentParents} onChange={(v) => handleProfileChange("userProfile", "dependentParents", parseInt(v) || 0)} />
                            </div>
                            <TextInput label="Pekerjaan" icon={<Briefcase className="w-4 h-4" />} value={formData.userProfile.occupation} onChange={(v) => handleProfileChange("userProfile", "occupation", v)} />
                            <TextInput label="Kota Domisili" icon={<MapPin className="w-4 h-4" />} value={formData.userProfile.city} onChange={(v) => handleProfileChange("userProfile", "city", v)} />
                        </div>
                    </div>
                    {formData.userProfile.maritalStatus === "MARRIED" && (
                        <div className="bg-brand-50/50 p-6 rounded-2xl border border-brand-100/50">
                            <SectionHeader title="Data Pasangan" desc="Informasi suami/istri" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <TextInput label="Nama Pasangan" icon={<Heart className="w-4 h-4" />} value={formData.spouseProfile?.name} onChange={(v) => handleProfileChange("spouseProfile", "name", v)} />
                                <DateInput label="Tgl Lahir Pasangan" value={formData.spouseProfile?.dob} onChange={(v) => handleProfileChange("spouseProfile", "dob", v)} />
                                <TextInput label="Suku Bangsa" icon={<Users className="w-4 h-4" />} value={formData.spouseProfile?.ethnicity} onChange={(v) => handleProfileChange("spouseProfile", "ethnicity", v)} />
                                <SelectInput label="Agama" value={formData.spouseProfile?.religion} onChange={(v) => handleProfileChange("spouseProfile", "religion", v)} options={[{value: "ISLAM", label: "Islam"}, {value: "KRISTEN", label: "Kristen"}, {value: "KATOLIK", label: "Katolik"}, {value: "HINDU", label: "Hindu"}, {value: "BUDDHA", label: "Buddha"}]} />
                                <TextInput label="Pekerjaan Pasangan" icon={<Briefcase className="w-4 h-4" />} value={formData.spouseProfile?.occupation} onChange={(v) => handleProfileChange("spouseProfile", "occupation", v)} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* STEP 1: ASET */}
            {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <SectionHeader title="Aset Likuid" desc="Kas dan setara kas" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Kas / Tabungan / Deposito Cair" value={formData.assetCash} onChange={(v) => handleFinancialChange("assetCash", v)} icon={<Wallet className="w-4 h-4" />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    <SectionHeader title="Aset Personal" desc="Aset guna pakai (tidak menghasilkan income)" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Rumah / Tanah (Ditempati)" value={formData.assetHome} onChange={(v) => handleFinancialChange("assetHome", v)} icon={<Home className="w-4 h-4" />} />
                        <InputGroup label="Kendaraan Pribadi" value={formData.assetVehicle} onChange={(v) => handleFinancialChange("assetVehicle", v)} icon={<Car className="w-4 h-4" />} />
                        <InputGroup label="Emas Perhiasan" value={formData.assetJewelry} onChange={(v) => handleFinancialChange("assetJewelry", v)} icon={<Gem className="w-4 h-4" />} />
                        <InputGroup label="Barang Antik / Koleksi" value={formData.assetAntique} onChange={(v) => handleFinancialChange("assetAntique", v)} icon={<Coins className="w-4 h-4" />} />
                        <InputGroup label="Aset Personal Lain" value={formData.assetPersonalOther} onChange={(v) => handleFinancialChange("assetPersonalOther", v)} icon={<Wallet className="w-4 h-4" />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    <SectionHeader title="Aset Investasi" desc="Aset yang diharapkan tumbuh nilainya" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Rumah / Tanah" value={formData.assetInvHome} onChange={(v) => handleFinancialChange("assetInvHome", v)} icon={<Home className="w-4 h-4" />} />
                        <InputGroup label="Kendaraan " value={formData.assetInvVehicle} onChange={(v) => handleFinancialChange("assetInvVehicle", v)} icon={<Car className="w-4 h-4" />} />
                        <InputGroup label="Logam Mulia" value={formData.assetGold} onChange={(v) => handleFinancialChange("assetGold", v)} icon={<Coins className="w-4 h-4" />} />
                        <InputGroup label="Barang Antik " value={formData.assetInvAntique} onChange={(v) => handleFinancialChange("assetInvAntique", v)} icon={<Coins className="w-4 h-4" />} />
                        <InputGroup label="Saham" value={formData.assetStocks} onChange={(v) => handleFinancialChange("assetStocks", v)} icon={<TrendingUp className="w-4 h-4" />} />
                        <InputGroup label="Reksadana" value={formData.assetMutualFund} onChange={(v) => handleFinancialChange("assetMutualFund", v)} icon={<TrendingUp className="w-4 h-4" />} />
                        <InputGroup label="Obligasi" value={formData.assetBonds} onChange={(v) => handleFinancialChange("assetBonds", v)} icon={<Landmark className="w-4 h-4" />} />
                        <InputGroup label="Deposito Jangka Panjang" value={formData.assetDeposit} onChange={(v) => handleFinancialChange("assetDeposit", v)} icon={<Landmark className="w-4 h-4" />} />
                        <InputGroup label="Aset Investasi Lain" value={formData.assetInvOther} onChange={(v) => handleFinancialChange("assetInvOther", v)} icon={<Briefcase className="w-4 h-4" />} />
                    </div>
                </div>
            )}

            {/* STEP 2: UTANG */}
            {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-800 text-sm mb-6">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <div><p className="font-bold">Penting:</p><p>Masukkan <strong>Sisa Pokok Utang</strong> (Saldo berjalan yang belum lunas), bukan nominal cicilan.</p></div>
                    </div>

                    <SectionHeader title="Utang Konsumtif" desc="Sisa Pokok Utang (Outstanding)" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="KPR (Rumah)" value={formData.debtKPR} onChange={(v) => handleFinancialChange("debtKPR", v)} icon={<Home className="w-4 h-4" />} />
                        <InputGroup label="KPM (Kendaraan)" value={formData.debtKPM} onChange={(v) => handleFinancialChange("debtKPM", v)} icon={<Car className="w-4 h-4" />} />
                        <InputGroup label="Kartu Kredit" value={formData.debtCC} onChange={(v) => handleFinancialChange("debtCC", v)} icon={<CreditCard className="w-4 h-4" />} />
                        <InputGroup label="Koperasi" value={formData.debtCoop} onChange={(v) => handleFinancialChange("debtCoop", v)} icon={<Users className="w-4 h-4" />} />
                        <InputGroup label="Utang Lainnya" value={formData.debtConsumptiveOther} onChange={(v) => handleFinancialChange("debtConsumptiveOther", v)} icon={<User className="w-4 h-4" />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    <SectionHeader title="Utang Usaha" desc="Utang Produktif / Bisnis" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Utang Usaha / UMKM" value={formData.debtBusiness} onChange={(v) => handleFinancialChange("debtBusiness", v)} icon={<Briefcase className="w-4 h-4" />} />
                    </div>
                </div>
            )}

            {/* STEP 3: ARUS KAS */}
            {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl flex gap-3 text-brand-800 text-sm mb-4">
                        <Coins className="w-5 h-5 shrink-0" />
                        <p><strong>PENTING:</strong> Perhatikan label periode <strong>(PER TAHUN)</strong> atau <strong>(PER BULAN)</strong>. Umumnya data ini diisi PER TAHUN (dikalikan 12).</p>
                    </div>

                    {/* I. PEMASUKAN */}
                    <SectionHeader title="I. Pemasukan (PER TAHUN)" desc="Total pendapatan bersih setahun" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="1. Pendapatan Tetap" value={formData.incomeFixed} onChange={(v) => handleFinancialChange("incomeFixed", v)} icon={<DollarSign className="w-4 h-4" />} />
                        <InputGroup label="2. Pendapatan Tidak Tetap" value={formData.incomeVariable} onChange={(v) => handleFinancialChange("incomeVariable", v)} icon={<TrendingUp className="w-4 h-4" />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    {/* 1. CICILAN UTANG */}
                    <SectionHeader title="1. Cicilan Utang (PER TAHUN)" desc="Total bayar cicilan dalam setahun" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="KPR" value={formData.installmentKPR} onChange={(v) => handleFinancialChange("installmentKPR", v)} icon={<Home className="w-4 h-4" />} />
                        <InputGroup label="KPM" value={formData.installmentKPM} onChange={(v) => handleFinancialChange("installmentKPM", v)} icon={<Car className="w-4 h-4" />} />
                        <InputGroup label="Kartu Kredit" value={formData.installmentCC} onChange={(v) => handleFinancialChange("installmentCC", v)} icon={<CreditCard className="w-4 h-4" />} />
                        <InputGroup label="Koperasi" value={formData.installmentCoop} onChange={(v) => handleFinancialChange("installmentCoop", v)} icon={<Users className="w-4 h-4" />} />
                        <InputGroup label="Utang Konsumtif Lain" value={formData.installmentConsumptiveOther} onChange={(v) => handleFinancialChange("installmentConsumptiveOther", v)} icon={<User className="w-4 h-4" />} />
                        <InputGroup label="Utang Usaha/UMKM" value={formData.installmentBusiness} onChange={(v) => handleFinancialChange("installmentBusiness", v)} icon={<Briefcase className="w-4 h-4" />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    {/* 2. PREMI ASURANSI */}
                    <SectionHeader title="2. Premi Asuransi (PER TAHUN)" desc="Total Premi Seluruh Keluarga" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Asuransi Jiwa" value={formData.insuranceLife} onChange={(v) => handleFinancialChange("insuranceLife", v)} icon={<Umbrella className="w-4 h-4" />} />
                        <InputGroup label="Asuransi Kesehatan" value={formData.insuranceHealth} onChange={(v) => handleFinancialChange("insuranceHealth", v)} icon={<Umbrella className="w-4 h-4" />} />
                        <InputGroup label="Asuransi Rumah" value={formData.insuranceHome} onChange={(v) => handleFinancialChange("insuranceHome", v)} icon={<Home className="w-4 h-4" />} />
                        <InputGroup label="Asuransi Kendaraan" value={formData.insuranceVehicle} onChange={(v) => handleFinancialChange("insuranceVehicle", v)} icon={<Car className="w-4 h-4" />} />
                        <InputGroup label="BPJS" value={formData.insuranceBPJS} onChange={(v) => handleFinancialChange("insuranceBPJS", v)} icon={<ShieldCheck className="w-4 h-4" />} desc="Jika bayar bulanan, kalikan 12" />
                        <InputGroup label="Asuransi Lainnya" value={formData.insuranceOther} onChange={(v) => handleFinancialChange("insuranceOther", v)} icon={<Umbrella className="w-4 h-4" />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    {/* 3. TABUNGAN/INVESTASI */}
                    <SectionHeader title="3. Tabungan/Investasi (PER TAHUN)" desc="Alokasi tabungan dalam setahun" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Dana Pendidikan Anak" value={formData.savingEducation} onChange={(v) => handleFinancialChange("savingEducation", v)} icon={<PiggyBank className="w-4 h-4" />} />
                        <InputGroup label="Dana Hari Tua" value={formData.savingRetirement} onChange={(v) => handleFinancialChange("savingRetirement", v)} icon={<TrendingUp className="w-4 h-4" />} />
                        <InputGroup label="Dana Ibadah" value={formData.savingPilgrimage} onChange={(v) => handleFinancialChange("savingPilgrimage", v)} icon={<Coins className="w-4 h-4" />} />
                        <InputGroup label="Dana Liburan" value={formData.savingHoliday} onChange={(v) => handleFinancialChange("savingHoliday", v)} icon={<Plane className="w-4 h-4" />} />
                        <InputGroup label="Dana Darurat" value={formData.savingEmergency} onChange={(v) => handleFinancialChange("savingEmergency", v)} icon={<ShieldCheck className="w-4 h-4" />} />
                        <InputGroup label="Dana Lainnya" value={formData.savingOther} onChange={(v) => handleFinancialChange("savingOther", v)} icon={<Wallet className="w-4 h-4" />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    {/* 4. BELANJA KELUARGA */}
                    <SectionHeader title="4. Belanja Keluarga (PER TAHUN)" desc="Pengeluaran rutin bulanan kalikan 12" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Makan Keluarga" value={formData.expenseFood} onChange={(v) => handleFinancialChange("expenseFood", v)} icon={<ShoppingBag className="w-4 h-4" />} />
                        <InputGroup label="Uang Sekolah" value={formData.expenseSchool} onChange={(v) => handleFinancialChange("expenseSchool", v)} icon={<User className="w-4 h-4" />} />
                        <InputGroup label="Transportasi" value={formData.expenseTransport} onChange={(v) => handleFinancialChange("expenseTransport", v)} icon={<Car className="w-4 h-4" />} />
                        <InputGroup label="Telepon & Internet" value={formData.expenseCommunication} onChange={(v) => handleFinancialChange("expenseCommunication", v)} icon={<Phone className="w-4 h-4" />} />
                        <InputGroup label="ART / Supir" value={formData.expenseHelpers} onChange={(v) => handleFinancialChange("expenseHelpers", v)} icon={<User className="w-4 h-4" />} />
                        <InputGroup label="Belanja RT Lainnya" value={formData.expenseLifestyle} onChange={(v) => handleFinancialChange("expenseLifestyle", v)} icon={<ShoppingBag className="w-4 h-4" />} />
                        <div className="md:col-span-2">
                            <InputGroup label="Pajak (PBB/PKB) - PER TAHUN" value={formData.expenseTax} onChange={(v) => handleFinancialChange("expenseTax", v)} icon={<Landmark className="w-4 h-4" />} desc="Masukkan nominal pajak tahunan" />
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 4: REVIEW */}
            {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                    <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 space-y-6 relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 p-32 bg-brand-500/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
                        
                        <h3 className="font-bold text-brand-900 text-lg flex items-center gap-2 relative z-10">
                            <Calculator className="w-5 h-5 text-brand-600" /> Ringkasan Data
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-4">
                                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2">Neraca Aset & Utang</h4>
                                <ReviewRow label="Total Aset Likuid" value={formData.assetCash} />
                                <ReviewRow label="Total Aset Investasi" value={
                                    formData.assetInvHome + formData.assetInvVehicle + formData.assetGold + formData.assetInvAntique + 
                                    formData.assetStocks + formData.assetMutualFund + formData.assetBonds + formData.assetDeposit + formData.assetInvOther
                                } />
                                <ReviewRow label="Total Utang" value={
                                    (formData.debtKPR + formData.debtKPM + formData.debtCC + formData.debtCoop + formData.debtConsumptiveOther) + 
                                    formData.debtBusiness
                                } isNegative />
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2">Estimasi Arus Kas (Tahunan)</h4>
                                <ReviewRow label="Total Pemasukan" value={formData.incomeFixed + formData.incomeVariable} highlight />
                                <ReviewRow label="Total Cicilan Utang" value={
                                    formData.installmentKPR + formData.installmentKPM + formData.installmentCC + formData.installmentCoop + formData.installmentConsumptiveOther + formData.installmentBusiness
                                } isNegative />
                                <ReviewRow label="Pengeluaran Lain" value={
                                    (formData.insuranceLife + formData.insuranceHealth + formData.insuranceHome + formData.insuranceVehicle + formData.insuranceBPJS + formData.insuranceOther) +
                                    (formData.savingEducation + formData.savingRetirement + formData.savingPilgrimage + formData.savingHoliday + formData.savingEmergency + formData.savingOther) +
                                    (formData.expenseFood + formData.expenseSchool + formData.expenseTransport + formData.expenseCommunication + formData.expenseHelpers + formData.expenseLifestyle + formData.expenseTax)
                                } isNegative />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-white p-6 md:p-8 border-t border-slate-100 flex justify-between items-center rounded-b-2xl">
            <Button variant="ghost" onClick={prevStep} disabled={step === 0 || isLoading} className="text-slate-500 hover:text-brand-600">
                <ArrowLeft className="w-4 h-4 mr-2" /> Sebelumnya
            </Button>
            
            {step < 4 ? 
                <Button onClick={nextStep} className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/20 px-8 h-12 rounded-xl font-bold transition-all hover:translate-x-1">
                    Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
                </Button> : 
                <Button 
                  onClick={handleCalculate} 
                  disabled={isLoading}
                  className={cn(
                    "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 px-8 h-12 rounded-xl font-bold transition-all hover:scale-[1.02]",
                    isLoading && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menganalisa...</>
                  ) : (
                    <><Calculator className="w-4 h-4 mr-2" /> Diagnosa Sekarang</>
                  )}
                </Button>
            }
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS (STYLING UPDATE) ---

function SectionHeader({title, desc}: {title: string, desc: string}) {
    return (
        <div className="mb-6 pb-2 border-b border-slate-100">
            <h3 className="font-black text-slate-800 text-lg tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
        </div>
    );
}

interface TextInputProps { label: string; icon?: React.ReactNode; value: string | number | undefined; onChange: (val: string) => void; type?: string; }
function TextInput({ label, icon, value, onChange, type = "text" }: TextInputProps) {
    return (
        <div className="group space-y-2">
            <Label className="font-bold text-slate-600 group-focus-within:text-brand-600 transition-colors text-xs uppercase tracking-wide">{label}</Label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">{icon}</div>
                <Input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl transition-all font-medium text-slate-800" />
            </div>
        </div>
    )
}

interface DateInputProps { label: string; value: string | undefined; onChange: (val: string) => void; }
function DateInput({ label, value, onChange }: DateInputProps) {
    return (
        <div className="group space-y-2">
            <Label className="font-bold text-slate-600 text-xs uppercase tracking-wide">{label}</Label>
            <Input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl font-medium text-slate-800" />
        </div>
    )
}

interface SelectInputProps { label: string; value: string | undefined; onChange: (val: string) => void; options: { value: string; label: string }[]; }
function SelectInput({ label, value, onChange, options }: SelectInputProps) {
    return (
        <div className="group space-y-2">
            <Label className="font-bold text-slate-600 text-xs uppercase tracking-wide">{label}</Label>
            <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm font-medium text-slate-800 transition-all">
                {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    )
}

interface InputGroupProps { icon: React.ReactNode; label: string; desc?: string; value: number; onChange: (val: string) => void; }
function InputGroup({ icon, label, desc, value, onChange }: InputGroupProps) {
    const safeValue = (value === undefined || value === null || isNaN(value)) ? 0 : value;
    return (
        <div className="group space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide group-focus-within:text-brand-600 transition-colors">{label}</Label>
            <div className="relative transition-all duration-300 group-focus-within:scale-[1.01]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">{icon}</div>
                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 font-light text-xl">|</div>
                <div className="absolute left-14 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">Rp</div>
                <Input 
                    type="text" 
                    value={safeValue === 0 ? "" : safeValue.toLocaleString("id-ID")} 
                    onChange={(e) => onChange(e.target.value)} 
                    className="pl-20 h-12 bg-slate-50/50 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:bg-white font-bold text-slate-800 shadow-sm rounded-xl transition-all" 
                    placeholder="0" 
                />
            </div>
            {desc && <p className="text-[10px] text-slate-400 leading-tight pl-1">{desc}</p>}
        </div>
    );
}

function ReviewRow({ label, value, isNegative, highlight }: { label: string, value: number, isNegative?: boolean, highlight?: boolean }) {
    return (
        <div className={cn("flex justify-between items-center py-2.5 px-3 rounded-lg transition-colors border border-transparent", highlight ? "bg-brand-50 border-brand-100" : "hover:bg-slate-50 hover:border-slate-100")}>
            <span className={cn("text-sm font-medium", highlight ? "text-brand-800" : "text-slate-500")}>{label}</span>
            <span className={cn("font-mono font-bold text-base", isNegative ? "text-rose-600" : highlight ? "text-brand-700" : "text-slate-800")}>
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value)}
            </span>
        </div>
    );
}