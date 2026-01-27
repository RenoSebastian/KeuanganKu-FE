"use client";

import { useState, useEffect, SetStateAction } from "react";
import {
    ArrowLeft, ArrowRight, CheckCircle2,
    Wallet, Banknote, Calculator,
    CreditCard, User, Heart, MapPin, Briefcase, Users,
    ShoppingBag, Car, Gem, Phone, Umbrella, PiggyBank, ShieldCheck,
    Landmark, DollarSign, TrendingUp, Home, Coins, Plane, AlertCircle,
    Loader2, CalendarDays, Activity
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FinancialRecord, HealthAnalysisResult, PersonalInfo } from "@/lib/types";
import { financialService } from "@/services/financial.service";
import { cn } from "@/lib/utils";
import { CheckupResult } from "./checkup-result";
import { formatRupiah } from "@/lib/financial-math";

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

    // 2. Aset (Neraca - STOCK)
    assetCash: 0,
    assetHome: 0, assetVehicle: 0, assetJewelry: 0, assetAntique: 0, assetPersonalOther: 0,
    assetInvHome: 0, assetInvVehicle: 0, assetGold: 0, assetInvAntique: 0,
    assetStocks: 0, assetMutualFund: 0, assetBonds: 0, assetDeposit: 0, assetInvOther: 0,

    // 3. Utang (Neraca - STOCK)
    debtKPR: 0, debtKPM: 0, debtCC: 0, debtCoop: 0, debtConsumptiveOther: 0,
    debtBusiness: 0,

    // 4. Arus Kas (Cashflow - FLOW)
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


    // --- STATE MODAL HELPER UTANG ---
    const [showDebtModal, setShowDebtModal] = useState<{ show: boolean, target: keyof FinancialRecord | null }>({
        show: false,
        target: null
    });
    const [tempMonthly, setTempMonthly] = useState("");
    const [tempTenor, setTempTenor] = useState("");

    // --- STATE MODAL EMAS ---
    const [showGoldModal, setShowGoldModal] = useState(false);
    const [currentGoldPrice, setCurrentGoldPrice] = useState<number>(0);
    const [goldWeight, setGoldWeight] = useState(""); // Menggunakan string untuk input desimal (titik/koma)

    // --- TOGGLE INPUT MODE ---
    const [inputMode, setInputMode] = useState<"MONTHLY" | "ANNUAL">("ANNUAL");

    useEffect(() => setIsClient(true), []);

    // --- LOGIC 1: HANDLE INPUT CHANGE ---
    const handleFinancialChange = (field: keyof FinancialRecord, value: string) => {
        const numericValue = parseFloat(value.replace(/[^0-9]/g, "")) || 0;
        setFormData((prev) => ({ ...prev, [field]: numericValue }));
    };

    const handleProfileChange = (type: "userProfile" | "spouseProfile", field: keyof PersonalInfo, value: any) => {
        setFormData((prev) => ({
            ...prev, [type]: { ...prev[type]!, [field]: value }
        }));
    };

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                // response di sini bertipe { success: boolean; data: any; timestamp: string; }
                const response = await financialService.getLatestGoldPrice();

                // Pastikan mengecek response.data karena buyPrice ada di dalamnya
                if (response && response.success && response.data) {
                    // Konversi string "2750571" menjadi angka
                    const price = Number(response.data.buyPrice);

                    if (!isNaN(price)) {
                        setCurrentGoldPrice(price);
                    } else {
                        console.error("Format buyPrice bukan angka:", response.data.buyPrice);
                    }
                }
            } catch (error) {
                console.error("Gagal mengambil harga emas:", error);
                setCurrentGoldPrice(0);
            }
        };
        fetchMarketData();
    }, []);


    // --- LOGIC 2: AUTO-CONVERT SAAT TOGGLE ---
    const toggleInputMode = (targetMode: "MONTHLY" | "ANNUAL") => {
        if (targetMode === inputMode) return; // Tidak perlu ubah jika sama

        // Tentukan faktor pengali
        // Jika dari Annual ke Monthly: Bagi 12
        // Jika dari Monthly ke Annual: Kali 12
        const factor = targetMode === "ANNUAL" ? 12 : 1 / 12;

        // Daftar field yang WAJIB dikonversi (Hanya Arus Kas)
        const flowFields: (keyof FinancialRecord)[] = [
            'incomeFixed', 'incomeVariable',
            'installmentKPR', 'installmentKPM', 'installmentCC', 'installmentCoop', 'installmentConsumptiveOther', 'installmentBusiness',
            'insuranceLife', 'insuranceHealth', 'insuranceHome', 'insuranceVehicle', 'insuranceBPJS', 'insuranceOther',
            'savingEducation', 'savingRetirement', 'savingPilgrimage', 'savingHoliday', 'savingEmergency', 'savingOther',
            'expenseFood', 'expenseSchool', 'expenseTransport', 'expenseCommunication', 'expenseHelpers', 'expenseTax', 'expenseLifestyle'
        ];

        setFormData(prev => {
            const next = { ...prev };
            flowFields.forEach(key => {
                // TypeScript hack untuk dynamic key access
                const val = next[key as keyof FinancialRecord];
                if (typeof val === 'number') {
                    // @ts-ignore
                    next[key] = Math.round(val * factor); // Round biar rapi (ga ada desimal aneh)
                }
            });
            return next;
        });

        setInputMode(targetMode);
    };

    // --- LOGIC 3: SUBMIT DATA ---
    const handleCalculate = async () => {
        setIsLoading(true);
        try {
            const payload: any = { ...formData };

            // Sanitasi Data Pasangan
            if (payload.userProfile.maritalStatus !== "MARRIED") {
                delete payload.spouseProfile;
            }

            // NORMALISASI FINAL KE BULANAN (Agar Backend Konsisten)
            // Jika Input Mode saat ini TAHUNAN, bagi semua Arus Kas dengan 12 sebelum kirim
            if (inputMode === "ANNUAL") {
                const flowFields = [
                    'incomeFixed', 'incomeVariable',
                    'installmentKPR', 'installmentKPM', 'installmentCC', 'installmentCoop', 'installmentConsumptiveOther', 'installmentBusiness',
                    'insuranceLife', 'insuranceHealth', 'insuranceHome', 'insuranceVehicle', 'insuranceBPJS', 'insuranceOther',
                    'savingEducation', 'savingRetirement', 'savingPilgrimage', 'savingHoliday', 'savingEmergency', 'savingOther',
                    'expenseFood', 'expenseSchool', 'expenseTransport', 'expenseCommunication', 'expenseHelpers', 'expenseTax', 'expenseLifestyle'
                ];

                flowFields.forEach(field => {
                    if (typeof payload[field] === 'number') {
                        payload[field] = Math.round(payload[field] / 12);
                    }
                });
            }

            const analysis = await financialService.createCheckup(payload);
            setResult(analysis);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error: any) {
            console.error("Gagal melakukan analisa:", error);
            const errorMsg = error.response?.data?.message
                ? Array.isArray(error.response.data.message)
                    ? error.response.data.message.join(", ")
                    : error.response.data.message
                : "Terjadi kesalahan saat memproses data.";
            alert(`Gagal: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setStep(prev => Math.min(prev + 1, 3)); // Maksimal step sekarang 3
    };

    const prevStep = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setStep(prev => Math.max(prev - 1, 0));
    };

    // --- HITUNG TOTAL UNTUK REVIEW PAGE (Step 4) ---
    const totalAssets =
        formData.assetCash + formData.assetHome + formData.assetVehicle + formData.assetJewelry + formData.assetAntique + formData.assetPersonalOther +
        formData.assetInvHome + formData.assetInvVehicle + formData.assetGold + formData.assetInvAntique + formData.assetStocks + formData.assetMutualFund + formData.assetBonds + formData.assetDeposit + formData.assetInvOther;

    const totalDebt =
        formData.debtKPR + formData.debtKPM + formData.debtCC + formData.debtCoop + formData.debtConsumptiveOther + formData.debtBusiness;

    const netWorth = totalAssets - totalDebt;

    const totalIncome = formData.incomeFixed + formData.incomeVariable;

    const totalInstallments = formData.installmentKPR + formData.installmentKPM + formData.installmentCC + formData.installmentCoop + formData.installmentConsumptiveOther + formData.installmentBusiness;
    const totalInsurance = formData.insuranceLife + formData.insuranceHealth + formData.insuranceHome + formData.insuranceVehicle + formData.insuranceBPJS + formData.insuranceOther;
    const totalSavings = formData.savingEducation + formData.savingRetirement + formData.savingPilgrimage + formData.savingHoliday + formData.savingEmergency + formData.savingOther;
    const totalLivingExpense = formData.expenseFood + formData.expenseSchool + formData.expenseTransport + formData.expenseCommunication + formData.expenseHelpers + formData.expenseLifestyle + formData.expenseTax;

    const totalExpense = totalInstallments + totalInsurance + totalSavings + totalLivingExpense;
    const surplusDeficit = totalIncome - totalExpense;

    // Labels
    const periodLabel = inputMode === "ANNUAL" ? "(PER TAHUN)" : "(PER BULAN)";
    const periodHint = inputMode === "ANNUAL" ? "Total setahun (x12)" : "Rata-rata per bulan";

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
        { label: "Neraca", icon: Wallet },
        // { label: "Utang", icon: CreditCard },
        { label: "Arus Kas", icon: Banknote },
        { label: "Review", icon: Calculator },
    ];

    const applyDebtCalculation = () => {
        if (!showDebtModal.target) return;

        const monthly = parseInt(tempMonthly.replace(/\./g, "")) || 0;
        const tenor = parseInt(tempTenor) || 0;
        const total = monthly * tenor;

        // Masukkan ke formData utama
        setFormData(prev => ({ ...prev, [showDebtModal.target!]: total }));

        // Reset dan tutup modal
        setShowDebtModal({ show: false, target: null });
        setTempMonthly("");
        setTempTenor("");
    };

    const applyGoldCalculation = () => {
        // 1. Pastikan weight bersih dari karakter aneh dan ganti koma ke titik
        const cleanWeight = goldWeight.replace(/[^0-9,.]/g, "").replace(",", ".");
        const weight = parseFloat(cleanWeight) || 0;

        // 2. Validasi harga emas
        if (!currentGoldPrice || currentGoldPrice <= 0) {
            alert("Harga emas belum tersedia dari server.");
            return;
        }

        // 3. Kalkulasi
        const totalPrice = Math.round(weight * currentGoldPrice);

        // 4. Update data (pastikan tidak NaN)
        if (!isNaN(totalPrice)) {
            handleFinancialChange("assetGold", totalPrice.toString());
            setShowGoldModal(false);
            setGoldWeight("");
        } else {
            console.error("Kalkulasi gagal (NaN):", { weight, currentGoldPrice });
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">

            {/* --- PROGRESS STEPPER --- */}
            <div className="mb-10 relative px-4 md:px-0">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 rounded-full z-0" />
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-linear-to-r from-brand-700 to-cyan-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-out"
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

            {/* --- MAIN CARD --- */}
            <div className="card-clean overflow-hidden">

                {/* HEADER & TOGGLE */}
                <div className="bg-slate-50/50 border-b border-slate-100 p-6 md:p-8 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
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
                                {step === 1 && "Neraca"}
                                {/* {step === 2 && "Neraca Utang (Kewajiban)"} */}
                                {step === 2 && "Arus Kas Tahunan"}
                                {step === 3 && "Review & Validasi"}
                            </h2>
                            <p className="text-slate-500 text-sm mt-1 font-medium">
                                {step === 0 && "Lengkapi data diri User dan Pasangan (jika ada)."}
                                {step === 1 && "Nilai aset saat ini (Snapshot). Tidak terpengaruh periode."}
                                {/* {step === 2 && "Sisa pokok utang saat ini (Snapshot). Tidak terpengaruh periode."} */}
                                {step === 2 && "Detail pemasukan & pengeluaran rutin."}
                                {step === 3 && "Cek ringkasan Neraca & Arus Kas sebelum diagnosa."}
                            </p>
                        </div>
                    </div>

                    {/* TOGGLE INPUT MODE (Hanya Muncul di Step 3 & 4 agar relevan) */}
                    {(step >= 2) && (
                        <div className="bg-white border border-slate-200 p-1 rounded-xl flex shadow-sm">
                            <button
                                onClick={() => toggleInputMode("MONTHLY")}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                                    inputMode === "MONTHLY" ? "bg-brand-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                <CalendarDays className="w-3.5 h-3.5" /> Bulanan
                            </button>
                            <button
                                onClick={() => toggleInputMode("ANNUAL")}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                                    inputMode === "ANNUAL" ? "bg-brand-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                                )}
                            >
                                <Banknote className="w-3.5 h-3.5" /> Tahunan
                            </button>
                        </div>
                    )}
                </div>

                {/* CONTENT */}
                <div className="p-6 md:p-8 space-y-8 min-h-100">
                    {/* STEP 0: DATA DIRI */}
                    {step === 0 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <SectionHeader title="Data Pribadi" desc="Informasi utama pengguna" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <TextInput label="Nama Lengkap" icon={<User className="w-4 h-4" />} value={formData.userProfile.name} onChange={(v) => handleProfileChange("userProfile", "name", v)} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <DateInput label="Tgl Lahir" value={formData.userProfile.dob} onChange={(v) => handleProfileChange("userProfile", "dob", v)} />
                                        <SelectInput label="Gender" value={formData.userProfile.gender} onChange={(v) => handleProfileChange("userProfile", "gender", v)} options={[{ value: "L", label: "Laki-laki" }, { value: "P", label: "Perempuan" }]} />
                                    </div>
                                    <TextInput label="Suku Bangsa" icon={<Users className="w-4 h-4" />} value={formData.userProfile.ethnicity} onChange={(v) => handleProfileChange("userProfile", "ethnicity", v)} />
                                    <SelectInput label="Agama" value={formData.userProfile.religion} onChange={(v) => handleProfileChange("userProfile", "religion", v)} options={[{ value: "ISLAM", label: "Islam" }, { value: "KRISTEN", label: "Kristen" }, { value: "KATOLIK", label: "Katolik" }, { value: "HINDU", label: "Hindu" }, { value: "BUDDHA", label: "Buddha" }, { value: "LAINNYA", label: "Lainnya" }]} />
                                    <SelectInput label="Status Perkawinan" value={formData.userProfile.maritalStatus} onChange={(v) => handleProfileChange("userProfile", "maritalStatus", v)} options={[{ value: "SINGLE", label: "Belum Menikah" }, { value: "MARRIED", label: "Menikah" }, { value: "DIVORCED", label: "Pernah Menikah" }]} />
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
                                        <SelectInput label="Agama" value={formData.spouseProfile?.religion} onChange={(v) => handleProfileChange("spouseProfile", "religion", v)} options={[{ value: "ISLAM", label: "Islam" }, { value: "KRISTEN", label: "Kristen" }, { value: "KATOLIK", label: "Katolik" }, { value: "HINDU", label: "Hindu" }, { value: "BUDDHA", label: "Buddha" }]} />
                                        <TextInput label="Pekerjaan Pasangan" icon={<Briefcase className="w-4 h-4" />} value={formData.spouseProfile?.occupation} onChange={(v) => handleProfileChange("spouseProfile", "occupation", v)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 1: LAPORAN NERACA (ASSETS & LIABILITIES) */}
                    {step === 1 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">

                            {/* --- SEKSI A: DAFTAR ASET (HARTA) --- */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b-2 border-brand-500 pb-2">
                                    <Wallet className="w-6 h-6 text-brand-600" />
                                    <h3 className="text-xl font-black text-slate-800">Daftar Aset (Harta)</h3>
                                </div>

                                <SectionHeader title="Aset Likuid" desc="Kas dan setara kas (Saldo Saat Ini)" />
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

                                    {/* LOGAM MULIA DENGAN MODAL HELPER */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Logam Mulia (Emas)</Label>
                                            <button
                                                type="button"
                                                onClick={() => setShowGoldModal(true)}
                                                className="text-[9px] font-bold text-brand-600 hover:text-brand-700 underline flex items-center gap-1 transition-colors"
                                            >
                                                <Calculator className="w-3 h-3" /> Bantu Hitung (Gram)
                                            </button>
                                        </div>
                                        <InputGroupNoLabel
                                            value={formData.assetGold}
                                            onChange={(v) => handleFinancialChange("assetGold", v)}
                                            icon={<Coins className="w-4 h-4" />}
                                        />
                                        {currentGoldPrice > 0 && (
                                            <p className="text-[9px] text-slate-400 italic ml-1">
                                                *Harga referensi: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(currentGoldPrice)}/gr
                                            </p>
                                        )}
                                    </div>

                                    <InputGroup label="Barang Antik " value={formData.assetInvAntique} onChange={(v) => handleFinancialChange("assetInvAntique", v)} icon={<Coins className="w-4 h-4" />} />
                                    <InputGroup label="Saham" value={formData.assetStocks} onChange={(v) => handleFinancialChange("assetStocks", v)} icon={<TrendingUp className="w-4 h-4" />} />
                                    <InputGroup label="Reksadana" value={formData.assetMutualFund} onChange={(v) => handleFinancialChange("assetMutualFund", v)} icon={<TrendingUp className="w-4 h-4" />} />
                                    <InputGroup label="Obligasi" value={formData.assetBonds} onChange={(v) => handleFinancialChange("assetBonds", v)} icon={<Landmark className="w-4 h-4" />} />
                                    <InputGroup label="Deposito Jangka Panjang" value={formData.assetDeposit} onChange={(v) => handleFinancialChange("assetDeposit", v)} icon={<Landmark className="w-4 h-4" />} />
                                    <InputGroup label="Aset Investasi Lain" value={formData.assetInvOther} onChange={(v) => handleFinancialChange("assetInvOther", v)} icon={<Briefcase className="w-4 h-4" />} />
                                </div>
                            </div>

                            {/* --- PEMISAH VISUAL (Garis Neraca) --- */}
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t-2 border-dashed border-slate-200"></span>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-4 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Kewajiban & Utang</span>
                                </div>
                            </div>

                            {/* --- SEKSI B: DAFTAR UTANG (KEWAJIBAN) --- */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b-2 border-rose-500 pb-2">
                                    <CreditCard className="w-6 h-6 text-rose-600" />
                                    <h3 className="text-xl font-black text-slate-800">Daftar Utang (Kewajiban)</h3>
                                </div>

                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-800 text-sm mb-6">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <div>
                                        <p className="font-bold">Penting:</p>
                                        <p>Masukkan <strong>Sisa Pokok Utang</strong> (Saldo berjalan yang belum lunas), bukan nominal cicilan bulanan.</p>
                                    </div>
                                </div>

                                <SectionHeader title="Utang Konsumtif" desc="Sisa Pokok Utang (Outstanding)" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* KPR DENGAN MODAL HELPER */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">KPR (Rumah)</Label>
                                            <button
                                                type="button"
                                                onClick={() => setShowDebtModal({ show: true, target: 'debtKPR' })}
                                                className="text-[9px] font-bold text-brand-600 hover:text-brand-700 underline flex items-center gap-1 transition-colors"
                                            >
                                                <Calculator className="w-3 h-3" /> Bantu Hitung Sisa
                                            </button>
                                        </div>
                                        <InputGroupNoLabel
                                            value={formData.debtKPR}
                                            onChange={(v) => handleFinancialChange("debtKPR", v)}
                                            icon={<Home className="w-4 h-4" />}
                                        />
                                    </div>

                                    {/* KPM DENGAN MODAL HELPER */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">KPM (Kendaraan)</Label>
                                            <button
                                                type="button"
                                                onClick={() => setShowDebtModal({ show: true, target: 'debtKPM' })}
                                                className="text-[9px] font-bold text-brand-600 hover:text-brand-700 underline flex items-center gap-1 transition-colors"
                                            >
                                                <Calculator className="w-3 h-3" /> Bantu Hitung Sisa
                                            </button>
                                        </div>
                                        <InputGroupNoLabel
                                            value={formData.debtKPM}
                                            onChange={(v) => handleFinancialChange("debtKPM", v)}
                                            icon={<Car className="w-4 h-4" />}
                                        />
                                    </div>

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

                            {/* --- LIVE NETWORTH COUNTER (Highlight Akhir Halaman) --- */}
                            <div className="mt-12 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl ring-4 ring-brand-500/20">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-[60px] -ml-20 -mb-20"></div>

                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                    <div className="text-center md:text-left">
                                        <p className="text-brand-300 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Kekayaan Bersih Saat Ini (Net Worth)</p>
                                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalAssets - totalDebt)}
                                        </h2>
                                        <p className="text-slate-400 text-xs mt-2 italic font-medium">Net Worth = Total Aset - Total Utang</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                        <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md text-center">
                                            <p className="text-[9px] text-white/50 font-bold uppercase mb-1">Total Aset</p>
                                            <p className="text-lg font-bold text-white">{formatRupiah(totalAssets)}</p>
                                        </div>
                                        <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md text-center">
                                            <p className="text-[9px] text-white/50 font-bold uppercase mb-1">Total Utang</p>
                                            <p className="text-lg font-bold text-white-400">{formatRupiah(totalDebt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: ARUS KAS (FLOW) */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl flex gap-3 text-brand-800 text-sm mb-4">
                                <Activity className="w-5 h-5 shrink-0" />
                                <p><strong>MODE INPUT: {inputMode === "ANNUAL" ? "TAHUNAN" : "BULANAN"}</strong>. Masukkan nominal {periodHint}.</p>
                            </div>

                            {/* I. PEMASUKAN */}
                            <SectionHeader title={`I. Pemasukan ${periodLabel}`} desc={`Total pendapatan ${periodHint}`} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="1. Pendapatan Tetap" value={formData.incomeFixed} onChange={(v) => handleFinancialChange("incomeFixed", v)} icon={<DollarSign className="w-4 h-4" />} />
                                <InputGroup label="2. Pendapatan Tidak Tetap" value={formData.incomeVariable} onChange={(v) => handleFinancialChange("incomeVariable", v)} icon={<TrendingUp className="w-4 h-4" />} />
                            </div>

                            <div className="border-t border-dashed border-slate-200" />

                            {/* 1. CICILAN UTANG */}
                            <SectionHeader title={`1. Cicilan Utang ${periodLabel}`} desc={`Total bayar cicilan ${periodHint}`} />
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
                            <SectionHeader title={`2. Premi Asuransi ${periodLabel}`} desc={`Total Premi ${periodHint}`} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Asuransi Jiwa" value={formData.insuranceLife} onChange={(v) => handleFinancialChange("insuranceLife", v)} icon={<Umbrella className="w-4 h-4" />} />
                                <InputGroup label="Asuransi Kesehatan" value={formData.insuranceHealth} onChange={(v) => handleFinancialChange("insuranceHealth", v)} icon={<Umbrella className="w-4 h-4" />} />
                                <InputGroup label="Asuransi Rumah" value={formData.insuranceHome} onChange={(v) => handleFinancialChange("insuranceHome", v)} icon={<Home className="w-4 h-4" />} />
                                <InputGroup label="Asuransi Kendaraan" value={formData.insuranceVehicle} onChange={(v) => handleFinancialChange("insuranceVehicle", v)} icon={<Car className="w-4 h-4" />} />
                                <InputGroup label="BPJS" value={formData.insuranceBPJS} onChange={(v) => handleFinancialChange("insuranceBPJS", v)} icon={<ShieldCheck className="w-4 h-4" />} />
                                <InputGroup label="Asuransi Lainnya" value={formData.insuranceOther} onChange={(v) => handleFinancialChange("insuranceOther", v)} icon={<Umbrella className="w-4 h-4" />} />
                            </div>

                            <div className="border-t border-dashed border-slate-200" />

                            {/* 3. TABUNGAN/INVESTASI */}
                            <SectionHeader title={`3. Tabungan/Investasi ${periodLabel}`} desc={`Alokasi tabungan ${periodHint}`} />
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
                            <SectionHeader title={`4. Belanja Keluarga ${periodLabel}`} desc={`Pengeluaran rutin ${periodHint}`} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Makan Keluarga" value={formData.expenseFood} onChange={(v) => handleFinancialChange("expenseFood", v)} icon={<ShoppingBag className="w-4 h-4" />} />
                                <InputGroup label="Uang Sekolah" value={formData.expenseSchool} onChange={(v) => handleFinancialChange("expenseSchool", v)} icon={<User className="w-4 h-4" />} />
                                <InputGroup label="Transportasi" value={formData.expenseTransport} onChange={(v) => handleFinancialChange("expenseTransport", v)} icon={<Car className="w-4 h-4" />} />
                                <InputGroup label="Telepon & Internet" value={formData.expenseCommunication} onChange={(v) => handleFinancialChange("expenseCommunication", v)} icon={<Phone className="w-4 h-4" />} />
                                <InputGroup label="ART / Supir" value={formData.expenseHelpers} onChange={(v) => handleFinancialChange("expenseHelpers", v)} icon={<User className="w-4 h-4" />} />
                                <InputGroup label="Belanja RT Lainnya" value={formData.expenseLifestyle} onChange={(v) => handleFinancialChange("expenseLifestyle", v)} icon={<ShoppingBag className="w-4 h-4" />} />
                                <div className="md:col-span-2">
                                    <InputGroup label={`Pajak (PBB/PKB) ${periodLabel}`} value={formData.expenseTax} onChange={(v) => handleFinancialChange("expenseTax", v)} icon={<Landmark className="w-4 h-4" />} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: REVIEW (DYNAMIC TOTALS & LABELS) */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                            <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-brand-500/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

                                <h3 className="font-bold text-brand-900 text-lg flex items-center gap-2 relative z-10">
                                    <Calculator className="w-5 h-5 text-brand-600" /> Ringkasan Data
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                    {/* --- KOLOM 1: NERACA (ASET - UTANG) --- */}
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">1. Neraca (Balance Sheet)</h4>
                                            <div className="space-y-3">
                                                <ReviewRow label="Total Aset Likuid" value={formData.assetCash} />
                                                <ReviewRow label="Total Aset Investasi" value={
                                                    formData.assetInvHome + formData.assetInvVehicle + formData.assetGold + formData.assetInvAntique +
                                                    formData.assetStocks + formData.assetMutualFund + formData.assetBonds + formData.assetDeposit + formData.assetInvOther
                                                } />
                                                <ReviewRow label="Total Aset Personal" value={
                                                    formData.assetHome + formData.assetVehicle + formData.assetJewelry + formData.assetAntique + formData.assetPersonalOther
                                                } />
                                                <ReviewRow label="Total Semua Aset (+)" value={totalAssets} highlight />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="space-y-3">
                                                <ReviewRow label="Total Utang (-)" value={totalDebt} isNegative />
                                            </div>
                                        </div>

                                        {/* NET WORTH RESULT */}
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Kekayaan Bersih (Net Worth)</p>
                                            <p className={cn("text-2xl font-black tracking-tight", netWorth >= 0 ? "text-emerald-600" : "text-red-600")}>
                                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(netWorth)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* --- KOLOM 2: ARUS KAS (INCOME - EXPENSE) --- */}
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">
                                                2. Arus Kas {periodLabel}
                                            </h4>
                                            <div className="space-y-3">
                                                <ReviewRow label="Total Pemasukan (+)" value={totalIncome} highlight />
                                                <ReviewRow label="Cicilan Utang (-)" value={totalInstallments} isNegative />
                                                <ReviewRow label="Premi Asuransi (-)" value={totalInsurance} isNegative />
                                                <ReviewRow label="Tabungan & Investasi (-)" value={totalSavings} isNegative />
                                                <ReviewRow label="Belanja Keluarga (-)" value={totalLivingExpense} isNegative />
                                                <ReviewRow label="Total Pengeluaran" value={totalExpense} isNegative bold />
                                            </div>
                                        </div>

                                        {/* SURPLUS/DEFICIT RESULT */}
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                            <p className="text-xs text-slate-500 font-bold uppercase mb-1">Surplus / Defisit {periodLabel}</p>
                                            <p className={cn("text-2xl font-black tracking-tight", surplusDeficit >= 0 ? "text-emerald-600" : "text-red-600")}>
                                                {surplusDeficit >= 0 ? "+" : ""}
                                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(surplusDeficit)}
                                            </p>
                                        </div>
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

                    {step < 3 ?
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
            {/* --- MODAL ASISTEN KALKULATOR UTANG --- */}
            {showDebtModal.show && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-5 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDebtModal({ show: false, target: null })} />
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Asisten Kalkulator</h3>
                                <p className="text-xs text-slate-500">Hitung sisa utang dari cicilan rutin.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cicilan Per Bulan</label>
                                <InputGroupNoLabel
                                    autoFocus
                                    value={tempMonthly ? parseInt(tempMonthly.replace(/\./g, "")) : 0}
                                    onChange={(v: SetStateAction<string>) => setTempMonthly(v)}
                                    icon={<Banknote className="w-4 h-4" />}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sisa Tenor (Bulan)</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={tempTenor}
                                        onChange={(e) => setTempTenor(e.target.value)}
                                        className="h-12 rounded-xl font-bold bg-slate-50 border-slate-200 focus:border-brand-500 pr-12"
                                        placeholder="Contoh: 120"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Bln</span>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setShowDebtModal({ show: false, target: null })}>Batal</Button>
                                <Button className="flex-2 h-12 rounded-xl bg-brand-600 font-bold" onClick={applyDebtCalculation}>Terapkan Hasil</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL ASISTEN EMAS --- */}
            {showGoldModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-5 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowGoldModal(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                                <Coins className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Kalkulator Emas</h3>
                                <p className="text-xs text-slate-500 font-medium">Konversi gram ke nilai rupiah terkini.</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Harga Emas Terkini</p>
                                <p className="text-lg font-bold text-slate-700">
                                    {/* Jika muncul RpNaN, berarti currentGoldPrice bermasalah */}
                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(currentGoldPrice)}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah Emas (Gram)</label>
                                <div className="relative group">
                                    <Input
                                        autoFocus
                                        type="text"
                                        inputMode="decimal"
                                        value={goldWeight}
                                        onChange={(e) => setGoldWeight(e.target.value)}
                                        className="h-12 rounded-xl font-bold bg-white border-slate-200 focus:border-brand-500 pr-12 transition-all shadow-sm"
                                        placeholder="Contoh: 3.21"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">GR</span>
                                </div>
                            </div>

                            <div className="bg-brand-50/50 p-4 rounded-xl border border-brand-100">
                                <p className="text-[10px] font-black text-brand-400 uppercase mb-1">Estimasi Nilai</p>
                                <p className="text-xl font-black text-brand-700">
                                    {formatRupiah(Math.round((parseFloat(goldWeight.replace(",", ".")) || 0) * currentGoldPrice))}
                                </p>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-slate-300 text-slate-600" onClick={() => setShowGoldModal(false)}>Batal</Button>
                                <Button
                                    className="flex-2 h-12 rounded-xl bg-brand-600 font-bold shadow-lg shadow-brand-500/20 text-white"
                                    onClick={applyGoldCalculation}
                                    disabled={!currentGoldPrice}
                                >
                                    Terapkan Nilai
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- SUB COMPONENTS ---

function SectionHeader({ title, desc }: { title: string, desc: string }) {
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

function ReviewRow({ label, value, isNegative, highlight, bold }: { label: string, value: number, isNegative?: boolean, highlight?: boolean, bold?: boolean }) {
    return (
        <div className={cn("flex justify-between items-center py-2.5 px-3 rounded-lg transition-colors border border-transparent", highlight ? "bg-brand-50 border-brand-100" : "hover:bg-slate-50 hover:border-slate-100")}>
            <span className={cn("text-sm font-medium", highlight ? "text-brand-800" : "text-slate-500")}>{label}</span>
            <span className={cn("font-mono text-base", bold ? "font-black" : "font-bold", isNegative ? "text-rose-600" : highlight ? "text-brand-700" : "text-slate-800")}>
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value)}
            </span>
        </div>
    );
}

function InputGroupNoLabel({ icon, value, onChange, autoFocus }: { icon: React.ReactNode, value: number, onChange: (val: string) => void, autoFocus?: boolean }) {
    const safeValue = (value === undefined || value === null || isNaN(value)) ? 0 : value;
    return (
        <div className="relative transition-all duration-300 group-focus-within:scale-[1.01]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500">{icon}</div>
            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 font-light text-xl">|</div>
            <div className="absolute left-14 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">Rp</div>
            <Input
                autoFocus={autoFocus}
                type="text"
                value={safeValue === 0 ? "" : safeValue.toLocaleString("id-ID")}
                onChange={(e) => onChange(e.target.value)}
                className="pl-20 h-12 bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white font-bold text-slate-800 rounded-xl transition-all"
                placeholder="0"
            />
        </div>
    );
}