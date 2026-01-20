"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, 
  Wallet, Building2, Banknote, Calculator,
  HelpCircle, AlertCircle, Coins, TrendingUp, 
  Home, CreditCard, Landmark, DollarSign, Calendar,
  User, Umbrella, PiggyBank, ShieldCheck, Heart, MapPin, Briefcase, Users,
  ShoppingBag, Car, Gem, Phone, Zap, Plane
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FinancialRecord, HealthAnalysisResult, PersonalInfo } from "@/lib/types";
import { calculateFinancialHealth } from "@/lib/financial-math";
import { cn } from "@/lib/utils";
import { CheckupResult } from "./checkup-result"; 

// --- INITIAL STATE SESUAI DOKUMEN REVISI ---
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
  // I. Pemasukan
  incomeFixed: 0, incomeVariable: 0,

  // J & K. Cicilan (Pengeluaran)
  installmentKPR: 0, // 1.a
  installmentKPM: 0, // 1.b
  installmentCC: 0,  // 1.c
  installmentCoop: 0, // 1.d
  installmentConsumptiveOther: 0, // 1.e
  installmentBusiness: 0, // 1.f

  // L. Asuransi (Pengeluaran)
  insuranceLife: 0, // 2.a
  insuranceHealth: 0, // 2.b
  insuranceHome: 0, // 2.c
  insuranceVehicle: 0, // 2.d
  insuranceBPJS: 0, // 2.e
  insuranceOther: 0, // 2.f

  // M. Tabungan (Pengeluaran)
  savingEducation: 0, // 3.a
  savingRetirement: 0, // 3.b
  savingPilgrimage: 0, // 3.c
  savingHoliday: 0, // 3.d
  savingEmergency: 0, // 3.e
  savingOther: 0, // 3.f

  // N. Belanja Keluarga (Pengeluaran)
  expenseFood: 0, // 4.a
  expenseSchool: 0, // 4.b
  expenseTransport: 0, // 4.c
  expenseCommunication: 0, // 4.d
  expenseHelpers: 0, // 4.e
  expenseTax: 0, // 4.f
  expenseLifestyle: 0, // 4.g
};

export function CheckupWizard() {
  const [step, setStep] = useState(0); 
  const [formData, setFormData] = useState<FinancialRecord>(INITIAL_DATA);
  const [result, setResult] = useState<HealthAnalysisResult | null>(null);
  const [isClient, setIsClient] = useState(false);

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
  const handleCalculate = () => { setResult(calculateFinancialHealth(formData)); window.scrollTo({ top: 0, behavior: "smooth" }); };

  if (result) return <CheckupResult data={result} onReset={() => setResult(null)} />;
  if (!isClient) return null;

  const steps = [
    { label: "Data Diri", icon: User },
    { label: "Aset", icon: Wallet },
    { label: "Utang", icon: CreditCard },
    { label: "Arus Kas", icon: Banknote },
    { label: "Review", icon: Calculator },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Progress Stepper */}
      <div className="mb-10 relative px-4 md:px-0">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0" />
        <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }} />
        <div className="flex justify-between relative z-10">
            {steps.map((s, idx) => {
                const isActive = step === idx;
                const isCompleted = step > idx;
                const Icon = s.icon;
                return (
                    <div key={idx} className="flex flex-col items-center group cursor-default">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-sm", isActive ? "border-emerald-500 bg-white text-emerald-600 scale-110 shadow-lg shadow-emerald-500/20" : isCompleted ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-100 bg-white text-slate-300")}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <span className={cn("text-[10px] font-bold mt-3 uppercase tracking-wider absolute -bottom-6 w-24 text-center", isActive ? "text-emerald-600" : isCompleted ? "text-emerald-500" : "text-slate-300")}>{s.label}</span>
                    </div>
                )
            })}
        </div>
      </div>
      <div className="h-6" />

      <Card className="overflow-hidden border-0 shadow-2xl bg-white/90 backdrop-blur-sm ring-1 ring-slate-900/5 rounded-3xl">
        <div className="bg-slate-50/80 border-b border-slate-100 p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                {step === 0 && "Identitas & Profil"}
                {step === 1 && "Neraca Aset (Harta)"}
                {step === 2 && "Neraca Utang (Kewajiban)"}
                {step === 3 && "Arus Kas (Cashflow)"}
                {step === 4 && "Review Data"}
            </h2>
            <p className="text-slate-500 text-sm mt-1">Lengkapi data sesuai kondisi keuangan Anda saat ini.</p>
        </div>

        <div className="p-6 md:p-8 space-y-8 min-h-[400px]">
            {/* STEP 0: DATA DIRI */}
            {step === 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
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
                            <SelectInput label="Status Perkawinan" value={formData.userProfile.maritalStatus} onChange={(v) => handleProfileChange("userProfile", "maritalStatus", v)} options={[{value: "SINGLE", label: "Belum Menikah"}, {value: "MARRIED", label: "Menikah"}, {value: "DIVORCED", label: "Cerai"}]} />
                            <div className="grid grid-cols-2 gap-4">
                                <TextInput label="Jumlah Anak" type="number" icon={<User className="w-4 h-4" />} value={formData.userProfile.childrenCount} onChange={(v) => handleProfileChange("userProfile", "childrenCount", parseInt(v) || 0)} />
                                <TextInput label="Tanggungan Ortu" type="number" icon={<User className="w-4 h-4" />} value={formData.userProfile.dependentParents} onChange={(v) => handleProfileChange("userProfile", "dependentParents", parseInt(v) || 0)} />
                            </div>
                            <TextInput label="Pekerjaan" icon={<Briefcase className="w-4 h-4" />} value={formData.userProfile.occupation} onChange={(v) => handleProfileChange("userProfile", "occupation", v)} />
                            <TextInput label="Kota Domisili" icon={<MapPin className="w-4 h-4" />} value={formData.userProfile.city} onChange={(v) => handleProfileChange("userProfile", "city", v)} />
                        </div>
                    </div>
                    {formData.userProfile.maritalStatus === "MARRIED" && (
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
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
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <SectionHeader title="A. Aset Likuid" desc="Kas dan setara kas" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="1. Kas / Tabungan / Deposito Cair" value={formData.assetCash} onChange={(v) => handleFinancialChange("assetCash", v)} icon={<Wallet className="w-4 h-4" />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    <SectionHeader title="B. Aset Personal" desc="Aset guna pakai (tidak menghasilkan income)" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="2. Rumah / Tanah (Ditempati)" value={formData.assetHome} onChange={(v) => handleFinancialChange("assetHome", v)} icon={<Home className="w-4 h-4" />} />
                        <InputGroup label="3. Kendaraan Pribadi" value={formData.assetVehicle} onChange={(v) => handleFinancialChange("assetVehicle", v)} icon={<Car className="w-4 h-4" />} />
                        <InputGroup label="4. Emas Perhiasan" value={formData.assetJewelry} onChange={(v) => handleFinancialChange("assetJewelry", v)} icon={<Gem className="w-4 h-4" />} />
                        <InputGroup label="5. Barang Antik / Koleksi" value={formData.assetAntique} onChange={(v) => handleFinancialChange("assetAntique", v)} icon={<Coins className="w-4 h-4" />} />
                        <InputGroup label="6. Aset Personal Lain" value={formData.assetPersonalOther} onChange={(v) => handleFinancialChange("assetPersonalOther", v)} icon={<Wallet className="w-4 h-4" />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    <SectionHeader title="C. Aset Investasi" desc="Aset yang diharapkan tumbuh nilainya" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="1. Rumah / Tanah (Investasi)" value={formData.assetInvHome} onChange={(v) => handleFinancialChange("assetInvHome", v)} icon={<Building2 className="w-4 h-4" />} />
                        <InputGroup label="2. Kendaraan (Investasi/Sewa)" value={formData.assetInvVehicle} onChange={(v) => handleFinancialChange("assetInvVehicle", v)} icon={<Car className="w-4 h-4" />} />
                        <InputGroup label="3. Logam Mulia (Batangan)" value={formData.assetGold} onChange={(v) => handleFinancialChange("assetGold", v)} icon={<Coins className="w-4 h-4" />} />
                        <InputGroup label="4. Barang Antik (Investasi)" value={formData.assetInvAntique} onChange={(v) => handleFinancialChange("assetInvAntique", v)} icon={<Coins className="w-4 h-4" />} />
                        <InputGroup label="5. Saham" value={formData.assetStocks} onChange={(v) => handleFinancialChange("assetStocks", v)} icon={<TrendingUp className="w-4 h-4" />} />
                        <InputGroup label="6. Reksadana" value={formData.assetMutualFund} onChange={(v) => handleFinancialChange("assetMutualFund", v)} icon={<TrendingUp className="w-4 h-4" />} />
                        <InputGroup label="7. Obligasi / SBN" value={formData.assetBonds} onChange={(v) => handleFinancialChange("assetBonds", v)} icon={<Landmark className="w-4 h-4" />} />
                        <InputGroup label="8. Deposito Jangka Panjang" value={formData.assetDeposit} onChange={(v) => handleFinancialChange("assetDeposit", v)} icon={<Landmark className="w-4 h-4" />} />
                        <InputGroup label="9. Aset Investasi Lain" value={formData.assetInvOther} onChange={(v) => handleFinancialChange("assetInvOther", v)} icon={<Briefcase className="w-4 h-4" />} />
                    </div>
                </div>
            )}

            {/* STEP 2: UTANG */}
            {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <SectionHeader title="E. Utang Konsumtif" desc="Sisa Pokok Utang (Outstanding)" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="1. KPR" value={formData.debtKPR} onChange={(v) => handleFinancialChange("debtKPR", v)} icon={<Home className="w-4 h-4" />} />
                        <InputGroup label="2. KPM (Kendaraan)" value={formData.debtKPM} onChange={(v) => handleFinancialChange("debtKPM", v)} icon={<Car className="w-4 h-4" />} />
                        <InputGroup label="3. Kartu Kredit" value={formData.debtCC} onChange={(v) => handleFinancialChange("debtCC", v)} icon={<CreditCard className="w-4 h-4" />} />
                        <InputGroup label="4. Koperasi" value={formData.debtCoop} onChange={(v) => handleFinancialChange("debtCoop", v)} icon={<Users className="w-4 h-4" />} />
                        <InputGroup label="5. Utang Lainnya" value={formData.debtConsumptiveOther} onChange={(v) => handleFinancialChange("debtConsumptiveOther", v)} icon={<User className="w-4 h-4" />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    <SectionHeader title="F. Utang Usaha" desc="Utang Produktif / Bisnis" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="1. Utang Usaha / UMKM" value={formData.debtBusiness} onChange={(v) => handleFinancialChange("debtBusiness", v)} icon={<Briefcase className="w-4 h-4" />} />
                    </div>
                </div>
            )}

            {/* STEP 3: ARUS KAS (COMPLETE GRANULAR) */}
            {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-800 text-sm mb-4">
                        <Coins className="w-5 h-5 shrink-0" />
                        <p><strong>PENTING:</strong> Perhatikan label periode <strong>(PER TAHUN)</strong> atau <strong>(PER BULAN)</strong>.</p>
                    </div>

                    {/* I. PEMASUKAN */}
                    <SectionHeader title="I. Pemasukan (PER TAHUN)" desc="Total pendapatan bersih setahun" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="1. Pendapatan Tetap" value={formData.incomeFixed} onChange={(v) => handleFinancialChange("incomeFixed", v)} icon={<DollarSign className="w-4 h-4" />} />
                        <InputGroup label="2. Pendapatan Tidak Tetap" value={formData.incomeVariable} onChange={(v) => handleFinancialChange("incomeVariable", v)} icon={<TrendingUp className="w-4 h-4" />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    {/* 1. CICILAN UTANG */}
                    <SectionHeader title="1. Cicilan Utang (PER BULAN)" desc="Angsuran yang dibayar tiap bulan" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="1.a KPR" value={formData.installmentKPR} onChange={(v) => handleFinancialChange("installmentKPR", v)} icon={<Home className="w-4 h-4" />} />
                        <InputGroup label="1.b KPM" value={formData.installmentKPM} onChange={(v) => handleFinancialChange("installmentKPM", v)} icon={<Car className="w-4 h-4" />} />
                        <InputGroup label="1.c Kartu Kredit" value={formData.installmentCC} onChange={(v) => handleFinancialChange("installmentCC", v)} icon={<CreditCard className="w-4 h-4" />} />
                        <InputGroup label="1.d Koperasi" value={formData.installmentCoop} onChange={(v) => handleFinancialChange("installmentCoop", v)} icon={<Users className="w-4 h-4" />} />
                        <InputGroup label="1.e Utang Konsumtif Lain" value={formData.installmentConsumptiveOther} onChange={(v) => handleFinancialChange("installmentConsumptiveOther", v)} icon={<User className="w-4 h-4" />} />
                        <InputGroup label="1.f Utang Usaha/UMKM" value={formData.installmentBusiness} onChange={(v) => handleFinancialChange("installmentBusiness", v)} icon={<Briefcase className="w-4 h-4" />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    {/* 2. PREMI ASURANSI */}
                    <SectionHeader title="2. Premi Asuransi (PER TAHUN)" desc="Total bayar premi dalam setahun" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="2.a Asuransi Jiwa" value={formData.insuranceLife} onChange={(v) => handleFinancialChange("insuranceLife", v)} icon={<Umbrella className="w-4 h-4" />} />
                        <InputGroup label="2.b Asuransi Kesehatan" value={formData.insuranceHealth} onChange={(v) => handleFinancialChange("insuranceHealth", v)} icon={<Umbrella className="w-4 h-4" />} />
                        <InputGroup label="2.c Asuransi Rumah" value={formData.insuranceHome} onChange={(v) => handleFinancialChange("insuranceHome", v)} icon={<Home className="w-4 h-4" />} />
                        <InputGroup label="2.d Asuransi Kendaraan" value={formData.insuranceVehicle} onChange={(v) => handleFinancialChange("insuranceVehicle", v)} icon={<Car className="w-4 h-4" />} />
                        <InputGroup label="2.e BPJS" value={formData.insuranceBPJS} onChange={(v) => handleFinancialChange("insuranceBPJS", v)} icon={<ShieldCheck className="w-4 h-4" />} desc="Jika bayar bulanan, kalikan 12" />
                        <InputGroup label="2.f Asuransi Lainnya" value={formData.insuranceOther} onChange={(v) => handleFinancialChange("insuranceOther", v)} icon={<Umbrella className="w-4 h-4" />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    {/* 3. TABUNGAN/INVESTASI */}
                    <SectionHeader title="3. Tabungan/Investasi (PER BULAN)" desc="Rutin disisihkan tiap bulan" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="3.a Dana Pendidikan Anak" value={formData.savingEducation} onChange={(v) => handleFinancialChange("savingEducation", v)} icon={<PiggyBank className="w-4 h-4" />} />
                        <InputGroup label="3.b Dana Hari Tua" value={formData.savingRetirement} onChange={(v) => handleFinancialChange("savingRetirement", v)} icon={<TrendingUp className="w-4 h-4" />} />
                        <InputGroup label="3.c Dana Ibadah" value={formData.savingPilgrimage} onChange={(v) => handleFinancialChange("savingPilgrimage", v)} icon={<Coins className="w-4 h-4" />} />
                        <InputGroup label="3.d Dana Liburan" value={formData.savingHoliday} onChange={(v) => handleFinancialChange("savingHoliday", v)} icon={<Plane className="w-4 h-4" />} />
                        <InputGroup label="3.e Dana Darurat" value={formData.savingEmergency} onChange={(v) => handleFinancialChange("savingEmergency", v)} icon={<ShieldCheck className="w-4 h-4" />} />
                        <InputGroup label="3.f Dana Lainnya" value={formData.savingOther} onChange={(v) => handleFinancialChange("savingOther", v)} icon={<Wallet className="w-4 h-4" />} />
                    </div>

                    <div className="border-t border-dashed border-slate-200" />

                    {/* 4. BELANJA KELUARGA */}
                    <SectionHeader title="4. Belanja Keluarga (PER BULAN)" desc="Pengeluaran rutin bulanan" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="4.a Makan Keluarga" value={formData.expenseFood} onChange={(v) => handleFinancialChange("expenseFood", v)} icon={<ShoppingBag className="w-4 h-4" />} />
                        <InputGroup label="4.b Uang Sekolah" value={formData.expenseSchool} onChange={(v) => handleFinancialChange("expenseSchool", v)} icon={<User className="w-4 h-4" />} />
                        <InputGroup label="4.c Transportasi" value={formData.expenseTransport} onChange={(v) => handleFinancialChange("expenseTransport", v)} icon={<Car className="w-4 h-4" />} />
                        <InputGroup label="4.d Telepon & Internet" value={formData.expenseCommunication} onChange={(v) => handleFinancialChange("expenseCommunication", v)} icon={<Phone className="w-4 h-4" />} />
                        <InputGroup label="4.e ART / Supir" value={formData.expenseHelpers} onChange={(v) => handleFinancialChange("expenseHelpers", v)} icon={<User className="w-4 h-4" />} />
                        <InputGroup label="4.g Belanja RT Lainnya" value={formData.expenseLifestyle} onChange={(v) => handleFinancialChange("expenseLifestyle", v)} icon={<ShoppingBag className="w-4 h-4" />} />
                        <div className="md:col-span-2">
                            <InputGroup label="4.f Pajak (PBB/PKB) - PER TAHUN" value={formData.expenseTax} onChange={(v) => handleFinancialChange("expenseTax", v)} icon={<Landmark className="w-4 h-4" />} desc="Masukkan nominal pajak tahunan" />
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 4: REVIEW */}
            {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
                    <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-24 bg-indigo-500/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
                        
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 relative z-10">
                            <Calculator className="w-5 h-5 text-indigo-600" /> Ringkasan Data
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-3">
                                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Neraca Aset & Utang</h4>
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
                            <div className="space-y-3">
                                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Estimasi Arus Kas (Tahunan)</h4>
                                <ReviewRow label="Total Pemasukan" value={formData.incomeFixed + formData.incomeVariable} highlight />
                                <ReviewRow label="Total Cicilan Utang" value={
                                    (formData.installmentKPR + formData.installmentKPM + formData.installmentCC + formData.installmentCoop + formData.installmentConsumptiveOther + formData.installmentBusiness) * 12
                                } isNegative />
                                <ReviewRow label="Total Pengeluaran Lain" value={
                                    // Insurance
                                    (formData.insuranceLife + formData.insuranceHealth + formData.insuranceHome + formData.insuranceVehicle + formData.insuranceBPJS + formData.insuranceOther) +
                                    // Savings (x12)
                                    ((formData.savingEducation + formData.savingRetirement + formData.savingPilgrimage + formData.savingHoliday + formData.savingEmergency + formData.savingOther) * 12) +
                                    // Expenses (x12) + Tax
                                    ((formData.expenseFood + formData.expenseSchool + formData.expenseTransport + formData.expenseCommunication + formData.expenseHelpers + formData.expenseLifestyle) * 12 + formData.expenseTax)
                                } isNegative />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white p-6 md:p-8 border-t border-slate-100 flex justify-between items-center rounded-b-3xl">
            <Button variant="ghost" onClick={prevStep} disabled={step === 0}><ArrowLeft className="w-4 h-4 mr-2" /> Sebelumnya</Button>
            {step < 4 ? 
                <Button onClick={nextStep} className="bg-slate-900 text-white">Selanjutnya <ArrowRight className="w-4 h-4 ml-2" /></Button> : 
                <Button onClick={handleCalculate} className="bg-emerald-600 text-white"><Calculator className="w-4 h-4 mr-2" /> Diagnosa Sekarang</Button>
            }
        </div>
      </Card>
    </div>
  );
}

// --- SUB COMPONENTS (TYPED) ---

function SectionHeader({title, desc}: {title: string, desc: string}) {
    return (
        <div className="mb-4 pb-2 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
        </div>
    );
}

// Interfaces for component props to avoid 'any' error
interface TextInputProps {
    label: string;
    icon?: React.ReactNode;
    value: string | number | undefined;
    onChange: (val: string) => void;
    type?: string;
}

function TextInput({ label, icon, value, onChange, type = "text" }: TextInputProps) {
    return (
        <div className="group space-y-2">
            <Label className="font-bold text-slate-700 group-focus-within:text-blue-600 transition-colors text-xs uppercase">{label}</Label>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">{icon}</div>
                <Input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 rounded-xl" />
            </div>
        </div>
    )
}

interface DateInputProps {
    label: string;
    value: string | undefined;
    onChange: (val: string) => void;
}

function DateInput({ label, value, onChange }: DateInputProps) {
    return (
        <div className="group space-y-2">
            <Label className="font-bold text-slate-700 text-xs uppercase">{label}</Label>
            <Input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} className="h-11 bg-slate-50 border-slate-200 focus:bg-white rounded-xl" />
        </div>
    )
}

interface SelectInputProps {
    label: string;
    value: string | undefined;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
}

function SelectInput({ label, value, onChange, options }: SelectInputProps) {
    return (
        <div className="group space-y-2">
            <Label className="font-bold text-slate-700 text-xs uppercase">{label}</Label>
            <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm">
                {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    )
}

interface InputGroupProps {
    icon: React.ReactNode;
    label: string;
    desc?: string;
    value: number;
    onChange: (val: string) => void;
}

function InputGroup({ icon, label, desc, value, onChange }: InputGroupProps) {
    // FIX: Pastikan value selalu number, default 0 jika undefined/NaN
    const safeValue = (value === undefined || value === null || isNaN(value)) ? 0 : value;

    return (
        <div className="group space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide group-focus-within:text-emerald-600 transition-colors">{label}</Label>
            <div className="relative transition-all duration-300 group-focus-within:ring-4 group-focus-within:ring-emerald-500/10 rounded-xl">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">{icon}</div>
                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 font-light text-xl">|</div>
                <div className="absolute left-14 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-xs">Rp</div>
                <Input 
                    type="text" 
                    // FIX: Gunakan safeValue untuk formatting
                    value={safeValue === 0 ? "" : safeValue.toLocaleString("id-ID")} 
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
        <div className={cn("flex justify-between items-center py-2 px-3 rounded-lg transition-colors", highlight ? "bg-emerald-50/80 border border-emerald-100" : "hover:bg-slate-50")}>
            <span className={cn("text-sm font-medium", highlight ? "text-emerald-800" : "text-slate-500")}>{label}</span>
            <span className={cn("font-mono font-bold text-base", isNegative ? "text-red-600" : highlight ? "text-emerald-700" : "text-slate-800")}>
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value)}
            </span>
        </div>
    );
}