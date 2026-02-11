"use client";

import { useState, useEffect, SetStateAction } from "react";
import {
    ArrowLeft, ArrowRight, CheckCircle2,
    Wallet, Banknote, Calculator,
    CreditCard, User, Briefcase, Users,
    ShoppingBag, Car, Gem, Phone, Umbrella, PiggyBank, ShieldCheck,
    Landmark, DollarSign, TrendingUp, Home, Coins, Plane, AlertCircle,
    Loader2, RefreshCcw, FileText, Activity // [FIX] Activity dipindah ke sini
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FinancialRecord, HelpContent } from "@/lib/types";
import { financialService } from "@/services/financial.service";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/financial-math";
import { InfoPopover } from "@/components/ui/info-popover";
import { FINANCIAL_HELP_DATA } from "@/lib/financial-dictionary";
import { MonthlyHelperModal } from "./monthly-helper-modal";

// --- PROPS INTERFACE ---
interface CheckupWizardProps {
    initialData?: Partial<FinancialRecord>;
    onComplete: (data: any) => void;
    onBack: () => void;
    isLoading?: boolean;
}

// --- INITIAL STATE (ONLY FINANCIALS) ---
// Profile data is handled by parent component now
const INITIAL_DATA_FINANCIAL: Partial<FinancialRecord> = {
    // 2. Aset (Neraca - STOCK)
    assetCash: 0,
    assetHome: 0, assetVehicle: 0, assetJewelry: 0, assetAntique: 0, assetPersonalOther: 0,
    assetInvHome: 0, assetInvVehicle: 0, assetGold: 0, assetInvAntique: 0,
    assetStocks: 0, assetMutualFund: 0, assetBonds: 0, assetDeposit: 0, assetInvOther: 0,

    // 3. Utang (Neraca - STOCK)
    debtKPR: 0, debtKPM: 0, debtCC: 0, debtCoop: 0, debtConsumptiveOther: 0,
    debtBusiness: 0,

    // 4. Arus Kas (Cashflow - FLOW) -> Default 0
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

// List field arus kas yang perlu dikonversi (Bulan <-> Tahun)
const FLOW_FIELDS: (keyof FinancialRecord)[] = [
    'incomeFixed', 'incomeVariable',
    'installmentKPR', 'installmentKPM', 'installmentCC', 'installmentCoop', 'installmentConsumptiveOther', 'installmentBusiness',
    'insuranceLife', 'insuranceHealth', 'insuranceHome', 'insuranceVehicle', 'insuranceBPJS', 'insuranceOther',
    'savingEducation', 'savingRetirement', 'savingPilgrimage', 'savingHoliday', 'savingEmergency', 'savingOther',
    'expenseFood', 'expenseSchool', 'expenseTransport', 'expenseCommunication', 'expenseHelpers', 'expenseTax', 'expenseLifestyle'
];

export function CheckupWizard({ initialData, onComplete, onBack, isLoading }: CheckupWizardProps) {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<Partial<FinancialRecord>>({ ...INITIAL_DATA_FINANCIAL, ...initialData });
    const [isClient, setIsClient] = useState(false);

    // --- STATE MODAL HELPER (Monthly to Annual) ---
    const [monthlyHelperTarget, setMonthlyHelperTarget] = useState<keyof FinancialRecord | null>(null);

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
    const [goldWeight, setGoldWeight] = useState("");

    useEffect(() => setIsClient(true), []);

    // Update form data if initialData changes (e.g. from Import)
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    // --- LOGIC 1: HANDLE INPUT CHANGE ---
    const handleFinancialChange = (field: keyof FinancialRecord, value: string) => {
        const numericValue = parseFloat(value.replace(/[^0-9]/g, "")) || 0;
        setFormData((prev) => ({ ...prev, [field]: numericValue }));
    };

    // --- LOGIC 2: APPLY MONTHLY HELPER ---
    const applyMonthlyToAnnual = (annualValue: number) => {
        if (monthlyHelperTarget) {
            setFormData(prev => ({ ...prev, [monthlyHelperTarget]: annualValue }));
            setMonthlyHelperTarget(null);
        }
    };

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const response = await financialService.getLatestGoldPrice();
                if (response && response.success && response.data) {
                    const price = Number(response.data.buyPrice);
                    if (!isNaN(price)) {
                        setCurrentGoldPrice(price);
                    }
                }
            } catch (error) {
                console.error("Gagal mengambil harga emas:", error);
                setCurrentGoldPrice(0);
            }
        };
        if (isClient) fetchMarketData();
    }, [isClient]);

    // --- LOGIC 3: SUBMIT DATA ---
    const handleSubmit = () => {
        const payload: any = { ...formData };

        // NORMALISASI TAHUNAN KE BULANAN (Agar Backend Konsisten)
        FLOW_FIELDS.forEach(field => {
            if (typeof payload[field] === 'number') {
                payload[field] = Math.round(payload[field] / 12);
            }
        });

        onComplete(payload);
    };

    const nextStep = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setStep(prev => Math.min(prev + 1, 2));
    };

    const prevStep = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setStep(prev => Math.max(prev - 1, 0));
    };

    // --- HITUNG TOTAL UNTUK REVIEW PAGE (Step 2) ---
    const num = (n: any) => Number(n) || 0;

    const totalAssets =
        num(formData.assetCash) + num(formData.assetHome) + num(formData.assetVehicle) + num(formData.assetJewelry) + num(formData.assetAntique) + num(formData.assetPersonalOther) +
        num(formData.assetInvHome) + num(formData.assetInvVehicle) + num(formData.assetGold) + num(formData.assetInvAntique) + num(formData.assetStocks) + num(formData.assetMutualFund) + num(formData.assetBonds) + num(formData.assetDeposit) + num(formData.assetInvOther);

    const totalDebt =
        num(formData.debtKPR) + num(formData.debtKPM) + num(formData.debtCC) + num(formData.debtCoop) + num(formData.debtConsumptiveOther) + num(formData.debtBusiness);

    const netWorth = totalAssets - totalDebt;

    const totalIncomeAnnual = num(formData.incomeFixed) + num(formData.incomeVariable);

    const totalInstallmentsAnnual = num(formData.installmentKPR) + num(formData.installmentKPM) + num(formData.installmentCC) + num(formData.installmentCoop) + num(formData.installmentConsumptiveOther) + num(formData.installmentBusiness);
    const totalInsuranceAnnual = num(formData.insuranceLife) + num(formData.insuranceHealth) + num(formData.insuranceHome) + num(formData.insuranceVehicle) + num(formData.insuranceBPJS) + num(formData.insuranceOther);
    const totalSavingsAnnual = num(formData.savingEducation) + num(formData.savingRetirement) + num(formData.savingPilgrimage) + num(formData.savingHoliday) + num(formData.savingEmergency) + num(formData.savingOther);
    const totalLivingExpenseAnnual = num(formData.expenseFood) + num(formData.expenseSchool) + num(formData.expenseTransport) + num(formData.expenseCommunication) + num(formData.expenseHelpers) + num(formData.expenseLifestyle) + num(formData.expenseTax);

    const totalExpenseAnnual = totalInstallmentsAnnual + totalInsuranceAnnual + totalSavingsAnnual + totalLivingExpenseAnnual;
    const surplusDeficitAnnual = totalIncomeAnnual - totalExpenseAnnual;


    if (!isClient) return null;

    // STEP DISEDERHANAKAN: 0 (Neraca), 1 (Arus Kas), 2 (Review)
    const steps = [
        { label: "Neraca", icon: Wallet },
        { label: "Arus Kas", icon: Banknote },
        { label: "Review", icon: Calculator },
    ];

    const applyDebtCalculation = () => {
        if (!showDebtModal.target) return;
        const monthly = parseInt(tempMonthly.replace(/\./g, "")) || 0;
        const tenor = parseInt(tempTenor) || 0;
        const total = monthly * tenor;
        setFormData(prev => ({ ...prev, [showDebtModal.target!]: total }));
        setShowDebtModal({ show: false, target: null });
        setTempMonthly("");
        setTempTenor("");
    };

    const applyGoldCalculation = () => {
        const cleanWeight = goldWeight.replace(/[^0-9,.]/g, "").replace(",", ".");
        const weight = parseFloat(cleanWeight) || 0;
        if (!currentGoldPrice || currentGoldPrice <= 0) {
            alert("Harga emas belum tersedia dari server.");
            return;
        }
        const totalPrice = Math.round(weight * currentGoldPrice);
        if (!isNaN(totalPrice)) {
            handleFinancialChange("assetGold", totalPrice.toString());
            setShowGoldModal(false);
            setGoldWeight("");
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">

            {/* --- PROGRESS STEPPER --- */}
            <div className="mb-10 relative px-4 md:px-0">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 rounded-full z-0" />
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-linear-to-r from-brand-700 to-cyan-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-out"
                    style={{ width: `${(step / 2) * 100}%` }}
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

                {/* HEADER */}
                <div className="bg-slate-50/50 border-b border-slate-100 p-6 md:p-8 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className={cn(
                            "p-3.5 rounded-2xl shadow-sm transition-all duration-500 ring-1 ring-inset ring-white/50",
                            "bg-brand-50 text-brand-600"
                        )}>
                            {step === 0 && <Wallet className="w-8 h-8" />}
                            {step === 1 && <Banknote className="w-8 h-8" />}
                            {step === 2 && <Calculator className="w-8 h-8" />}
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                                {step === 0 && "Neraca (Aset & Utang)"}
                                {step === 1 && "Arus Kas (Tahunan)"}
                                {step === 2 && "Review & Validasi"}
                            </h2>
                            <p className="text-slate-500 text-sm mt-1 font-medium">
                                {step === 0 && "Nilai aset & sisa pokok utang saat ini (Snapshot)."}
                                {step === 1 && "Masukkan total pendapatan & pengeluaran DALAM SETAHUN."}
                                {step === 2 && "Cek ringkasan sebelum diagnosa dijalankan."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="p-6 md:p-8 space-y-8 min-h-100 relative">

                    {/* STEP 0: LAPORAN NERACA (ASSETS & LIABILITIES) */}
                    {step === 0 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
                            {/* --- SEKSI A: DAFTAR ASET (HARTA) --- */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b-2 border-brand-500 pb-2">
                                    <Wallet className="w-6 h-6 text-brand-600" />
                                    <h3 className="text-xl font-black text-slate-800">Daftar Aset (Harta)</h3>
                                </div>

                                <SectionHeader title="Aset Likuid" desc="Kas dan setara kas (Saldo Saat Ini)" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Kas / Tabungan / Deposito Cair" value={num(formData.assetCash)} onChange={(v) => handleFinancialChange("assetCash", v)} icon={<Wallet className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetCash} />
                                </div>

                                <div className="border-t border-dashed border-slate-200" />

                                <SectionHeader title="Aset Personal" desc="Aset guna pakai (tidak menghasilkan income)" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Rumah / Tanah (Ditempati)" value={num(formData.assetHome)} onChange={(v) => handleFinancialChange("assetHome", v)} icon={<Home className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetHome} />
                                    <InputGroup label="Kendaraan Pribadi" value={num(formData.assetVehicle)} onChange={(v) => handleFinancialChange("assetVehicle", v)} icon={<Car className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetVehicle} />
                                    <InputGroup label="Emas Perhiasan" value={num(formData.assetJewelry)} onChange={(v) => handleFinancialChange("assetJewelry", v)} icon={<Gem className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetJewelry} />
                                    <InputGroup label="Barang Antik / Koleksi" value={num(formData.assetAntique)} onChange={(v) => handleFinancialChange("assetAntique", v)} icon={<Coins className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetAntique} />
                                    <InputGroup label="Aset Personal Lain" value={num(formData.assetPersonalOther)} onChange={(v) => handleFinancialChange("assetPersonalOther", v)} icon={<Wallet className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetPersonalOther} />
                                </div>

                                <div className="border-t border-dashed border-slate-200" />

                                <SectionHeader title="Aset Investasi" desc="Aset yang diharapkan tumbuh nilainya" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Rumah / Tanah" value={num(formData.assetInvHome)} onChange={(v) => handleFinancialChange("assetInvHome", v)} icon={<Home className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetInvHome} />
                                    <InputGroup label="Kendaraan " value={num(formData.assetInvVehicle)} onChange={(v) => handleFinancialChange("assetInvVehicle", v)} icon={<Car className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetInvVehicle} />

                                    {/* LOGAM MULIA DENGAN MODAL HELPER */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <div className="flex items-center gap-1">
                                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Logam Mulia (Emas)</Label>
                                                <InfoPopover content={FINANCIAL_HELP_DATA.assetGold} />
                                            </div>
                                            <button type="button" onClick={() => setShowGoldModal(true)} className="text-[9px] font-bold text-brand-600 hover:text-brand-700 underline flex items-center gap-1 transition-colors">
                                                <Calculator className="w-3 h-3" /> Bantu Hitung (Gram)
                                            </button>
                                        </div>
                                        <InputGroupNoLabel value={num(formData.assetGold)} onChange={(v) => handleFinancialChange("assetGold", v)} icon={<Coins className="w-4 h-4" />} />
                                        {currentGoldPrice > 0 && (
                                            <p className="text-[9px] text-slate-400 italic ml-1">*Harga referensi: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(currentGoldPrice)}/gr</p>
                                        )}
                                    </div>

                                    <InputGroup label="Barang Antik " value={num(formData.assetInvAntique)} onChange={(v) => handleFinancialChange("assetInvAntique", v)} icon={<Coins className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetInvAntique} />
                                    <InputGroup label="Saham" value={num(formData.assetStocks)} onChange={(v) => handleFinancialChange("assetStocks", v)} icon={<TrendingUp className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetStocks} />
                                    <InputGroup label="Reksadana" value={num(formData.assetMutualFund)} onChange={(v) => handleFinancialChange("assetMutualFund", v)} icon={<TrendingUp className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetMutualFund} />
                                    <InputGroup label="Obligasi" value={num(formData.assetBonds)} onChange={(v) => handleFinancialChange("assetBonds", v)} icon={<Landmark className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetBonds} />
                                    <InputGroup label="Deposito Jangka Panjang" value={num(formData.assetDeposit)} onChange={(v) => handleFinancialChange("assetDeposit", v)} icon={<Landmark className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetDeposit} />
                                    <InputGroup label="Aset Investasi Lain" value={num(formData.assetInvOther)} onChange={(v) => handleFinancialChange("assetInvOther", v)} icon={<Briefcase className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetInvOther} />
                                </div>
                            </div>

                            {/* --- SEKSI B: DAFTAR UTANG (KEWAJIBAN) --- */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b-2 border-rose-500 pb-2">
                                    <CreditCard className="w-6 h-6 text-rose-600" />
                                    <h3 className="text-xl font-black text-slate-800">Daftar Utang (Kewajiban)</h3>
                                </div>

                                <SectionHeader title="Utang Konsumtif" desc="Sisa Pokok Utang (Outstanding)" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* KPR DENGAN MODAL HELPER */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <div className="flex items-center gap-1">
                                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">KPR (Rumah)</Label>
                                                <InfoPopover content={FINANCIAL_HELP_DATA.debtKPR} />
                                            </div>
                                            <button type="button" onClick={() => setShowDebtModal({ show: true, target: 'debtKPR' })} className="text-[9px] font-bold text-brand-600 hover:text-brand-700 underline flex items-center gap-1 transition-colors">
                                                <Calculator className="w-3 h-3" /> Bantu Hitung Sisa
                                            </button>
                                        </div>
                                        <InputGroupNoLabel value={num(formData.debtKPR)} onChange={(v) => handleFinancialChange("debtKPR", v)} icon={<Home className="w-4 h-4" />} />
                                    </div>

                                    {/* KPM DENGAN MODAL HELPER */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <div className="flex items-center gap-1">
                                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">KPM (Kendaraan)</Label>
                                                <InfoPopover content={FINANCIAL_HELP_DATA.debtKPM} />
                                            </div>
                                            <button type="button" onClick={() => setShowDebtModal({ show: true, target: 'debtKPM' })} className="text-[9px] font-bold text-brand-600 hover:text-brand-700 underline flex items-center gap-1 transition-colors">
                                                <Calculator className="w-3 h-3" /> Bantu Hitung Sisa
                                            </button>
                                        </div>
                                        <InputGroupNoLabel value={num(formData.debtKPM)} onChange={(v) => handleFinancialChange("debtKPM", v)} icon={<Car className="w-4 h-4" />} />
                                    </div>

                                    <InputGroup label="Kartu Kredit" value={num(formData.debtCC)} onChange={(v) => handleFinancialChange("debtCC", v)} icon={<CreditCard className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.debtCC} />
                                    <InputGroup label="Koperasi" value={num(formData.debtCoop)} onChange={(v) => handleFinancialChange("debtCoop", v)} icon={<Users className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.debtCoop} />
                                    <InputGroup label="Utang Lainnya" value={num(formData.debtConsumptiveOther)} onChange={(v) => handleFinancialChange("debtConsumptiveOther", v)} icon={<User className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.debtConsumptiveOther} />
                                </div>

                                <SectionHeader title="Utang Usaha" desc="Utang Produktif / Bisnis" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Utang Usaha / UMKM" value={num(formData.debtBusiness)} onChange={(v) => handleFinancialChange("debtBusiness", v)} icon={<Briefcase className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.debtBusiness} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 1: ARUS KAS (FLOW) - TAHUNAN ONLY */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl flex gap-3 text-brand-800 text-sm mb-4">
                                {/* [FIX] Wrap Icon in Div to avoid className props issue */}
                                <div className="shrink-0">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold">MODE INPUT: TAHUNAN</p>
                                    <p>Masukkan total pendapatan & pengeluaran Anda dalam <strong>1 TAHUN</strong>. Gunakan tombol kalkulator untuk bantuan hitung dari bulanan.</p>
                                </div>
                            </div>

                            {/* I. PEMASUKAN */}
                            <SectionHeader title="I. Pemasukan (Per Tahun)" desc="Total pendapatan setahun (x12)" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup
                                    label="1. Pendapatan Tetap"
                                    value={num(formData.incomeFixed)}
                                    onChange={(v) => handleFinancialChange("incomeFixed", v)}
                                    icon={<DollarSign className="w-4 h-4" />}
                                    helpContent={FINANCIAL_HELP_DATA.incomeFixed}
                                    onMonthlyClick={() => setMonthlyHelperTarget("incomeFixed")}
                                    showCalculator
                                />
                                <InputGroup
                                    label="2. Pendapatan Tidak Tetap"
                                    value={num(formData.incomeVariable)}
                                    onChange={(v) => handleFinancialChange("incomeVariable", v)}
                                    icon={<TrendingUp className="w-4 h-4" />}
                                    helpContent={FINANCIAL_HELP_DATA.incomeVariable}
                                    onMonthlyClick={() => setMonthlyHelperTarget("incomeVariable")}
                                    showCalculator
                                />
                            </div>

                            <div className="border-t border-dashed border-slate-200" />

                            {/* 1. CICILAN UTANG */}
                            <SectionHeader title="1. Cicilan Utang (Per Tahun)" desc="Total bayar cicilan setahun" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { k: 'installmentKPR', l: 'KPR', i: <Home className="w-4 h-4" /> },
                                    { k: 'installmentKPM', l: 'KPM', i: <Car className="w-4 h-4" /> },
                                    { k: 'installmentCC', l: 'Kartu Kredit', i: <CreditCard className="w-4 h-4" /> },
                                    { k: 'installmentCoop', l: 'Koperasi', i: <Users className="w-4 h-4" /> },
                                    { k: 'installmentConsumptiveOther', l: 'Utang Konsumtif Lain', i: <User className="w-4 h-4" /> },
                                    { k: 'installmentBusiness', l: 'Utang Usaha/UMKM', i: <Briefcase className="w-4 h-4" /> }
                                ].map((item) => (
                                    <InputGroup
                                        key={item.k}
                                        label={item.l}
                                        value={num(formData[item.k as keyof FinancialRecord])}
                                        onChange={(v) => handleFinancialChange(item.k as keyof FinancialRecord, v)}
                                        icon={item.i}
                                        helpContent={FINANCIAL_HELP_DATA[item.k]}
                                        onMonthlyClick={() => setMonthlyHelperTarget(item.k as keyof FinancialRecord)}
                                        showCalculator
                                    />
                                ))}
                            </div>

                            <div className="border-t border-dashed border-slate-200" />

                            {/* 2. PREMI ASURANSI */}
                            <SectionHeader title="2. Premi Asuransi (Per Tahun)" desc="Total premi setahun" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { k: 'insuranceLife', l: 'Asuransi Jiwa', i: <Umbrella className="w-4 h-4" /> },
                                    { k: 'insuranceHealth', l: 'Asuransi Kesehatan', i: <Umbrella className="w-4 h-4" /> },
                                    { k: 'insuranceHome', l: 'Asuransi Rumah', i: <Home className="w-4 h-4" /> },
                                    { k: 'insuranceVehicle', l: 'Asuransi Kendaraan', i: <Car className="w-4 h-4" /> },
                                    { k: 'insuranceBPJS', l: 'BPJS', i: <ShieldCheck className="w-4 h-4" /> },
                                    { k: 'insuranceOther', l: 'Asuransi Lainnya', i: <Umbrella className="w-4 h-4" /> }
                                ].map((item) => (
                                    <InputGroup
                                        key={item.k}
                                        label={item.l}
                                        value={num(formData[item.k as keyof FinancialRecord])}
                                        onChange={(v) => handleFinancialChange(item.k as keyof FinancialRecord, v)}
                                        icon={item.i}
                                        helpContent={FINANCIAL_HELP_DATA[item.k]}
                                        onMonthlyClick={() => setMonthlyHelperTarget(item.k as keyof FinancialRecord)}
                                        showCalculator
                                    />
                                ))}
                            </div>

                            <div className="border-t border-dashed border-slate-200" />

                            {/* 3. TABUNGAN/INVESTASI */}
                            <SectionHeader title="3. Tabungan/Investasi (Per Tahun)" desc="Total tabungan setahun" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { k: 'savingEducation', l: 'Dana Pendidikan Anak', i: <PiggyBank className="w-4 h-4" /> },
                                    { k: 'savingRetirement', l: 'Dana Hari Tua', i: <TrendingUp className="w-4 h-4" /> },
                                    { k: 'savingPilgrimage', l: 'Dana Ibadah', i: <Coins className="w-4 h-4" /> },
                                    { k: 'savingHoliday', l: 'Dana Liburan', i: <Plane className="w-4 h-4" /> },
                                    { k: 'savingEmergency', l: 'Dana Darurat', i: <ShieldCheck className="w-4 h-4" /> },
                                    { k: 'savingOther', l: 'Dana Lainnya', i: <Wallet className="w-4 h-4" /> }
                                ].map((item) => (
                                    <InputGroup
                                        key={item.k}
                                        label={item.l}
                                        value={num(formData[item.k as keyof FinancialRecord])}
                                        onChange={(v) => handleFinancialChange(item.k as keyof FinancialRecord, v)}
                                        icon={item.i}
                                        helpContent={FINANCIAL_HELP_DATA[item.k]}
                                        onMonthlyClick={() => setMonthlyHelperTarget(item.k as keyof FinancialRecord)}
                                        showCalculator
                                    />
                                ))}
                            </div>

                            <div className="border-t border-dashed border-slate-200" />

                            {/* 4. BELANJA KELUARGA */}
                            <SectionHeader title="4. Belanja Keluarga (Per Tahun)" desc="Total pengeluaran rutin setahun" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { k: 'expenseFood', l: 'Makan Keluarga', i: <ShoppingBag className="w-4 h-4" /> },
                                    { k: 'expenseSchool', l: 'Uang Sekolah', i: <User className="w-4 h-4" /> },
                                    { k: 'expenseTransport', l: 'Transportasi', i: <Car className="w-4 h-4" /> },
                                    { k: 'expenseCommunication', l: 'Telepon & Internet', i: <Phone className="w-4 h-4" /> },
                                    { k: 'expenseHelpers', l: 'ART / Supir', i: <User className="w-4 h-4" /> },
                                    { k: 'expenseLifestyle', l: 'Belanja RT Lainnya', i: <ShoppingBag className="w-4 h-4" /> },
                                    { k: 'expenseTax', l: 'Pajak (PBB/PKB)', i: <Landmark className="w-4 h-4" /> }
                                ].map((item) => (
                                    <InputGroup
                                        key={item.k}
                                        label={item.l}
                                        value={num(formData[item.k as keyof FinancialRecord])}
                                        onChange={(v) => handleFinancialChange(item.k as keyof FinancialRecord, v)}
                                        icon={item.i}
                                        helpContent={FINANCIAL_HELP_DATA[item.k]}
                                        onMonthlyClick={() => setMonthlyHelperTarget(item.k as keyof FinancialRecord)}
                                        showCalculator
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: REVIEW (LAYOUT BARU - NERACA & ARUS KAS TERPISAH) */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">

                            {/* --- KARTU 1: NERACA (BALANCE SHEET) --- */}
                            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-lg">Laporan Neraca</h3>
                                        <p className="text-xs text-slate-500">Posisi Aset vs Utang saat ini</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative z-10">
                                    {/* KIRI: ASET */}
                                    <div className="flex flex-col h-full">
                                        <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Aset (Harta)
                                        </h4>
                                        <div className="space-y-3 flex-1">
                                            {/* Grouping Aset agar rapi */}
                                            <ReviewRow label="Aset Likuid (Cash)" value={num(formData.assetCash)} />
                                            <ReviewRow label="Aset Personal (Rumah/Kendaraan)" value={
                                                num(formData.assetHome) + num(formData.assetVehicle) + num(formData.assetJewelry) + num(formData.assetAntique) + num(formData.assetPersonalOther)
                                            } />
                                            <ReviewRow label="Aset Investasi" value={
                                                num(formData.assetInvHome) + num(formData.assetInvVehicle) + num(formData.assetGold) + num(formData.assetInvAntique) +
                                                num(formData.assetStocks) + num(formData.assetMutualFund) + num(formData.assetBonds) + num(formData.assetDeposit) + num(formData.assetInvOther)
                                            } />
                                        </div>
                                        {/* Total Aset */}
                                        <div className="mt-6 pt-4 border-t border-slate-100">
                                            <ReviewRow label="TOTAL ASET" value={totalAssets} isTotal color="emerald" />
                                        </div>
                                    </div>

                                    {/* KANAN: UTANG */}
                                    <div className="flex flex-col h-full">
                                        <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Utang (Kewajiban)
                                        </h4>
                                        <div className="space-y-3 flex-1">
                                            <ReviewRow label="Sisa KPR (Rumah)" value={num(formData.debtKPR)} />
                                            <ReviewRow label="Sisa KPM (Kendaraan)" value={num(formData.debtKPM)} />
                                            <ReviewRow label="Utang Konsumtif Lain" value={num(formData.debtCC) + num(formData.debtCoop) + num(formData.debtConsumptiveOther)} />
                                            <ReviewRow label="Utang Produktif/Bisnis" value={num(formData.debtBusiness)} />
                                        </div>
                                        {/* Total Utang */}
                                        <div className="mt-6 pt-4 border-t border-slate-100">
                                            <ReviewRow label="TOTAL UTANG" value={totalDebt} isTotal color="rose" />
                                        </div>
                                    </div>
                                </div>

                                {/* FOOTER: NET WORTH */}
                                <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-100 text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Kekayaan Bersih (Net Worth)</p>
                                    <div className={cn(
                                        "text-3xl md:text-4xl font-black tracking-tight",
                                        netWorth >= 0 ? "text-brand-700" : "text-rose-600"
                                    )}>
                                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(netWorth)}
                                    </div>
                                </div>
                            </div>


                            {/* --- KARTU 2: ARUS KAS (CASHFLOW) --- */}
                            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <Banknote className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-lg">Laporan Arus Kas</h3>
                                        <p className="text-xs text-slate-500">Ringkasan Pemasukan & Pengeluaran (Tahunan)</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative z-10">
                                    {/* KIRI: PEMASUKAN */}
                                    <div className="flex flex-col h-full">
                                        <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Pemasukan
                                        </h4>
                                        <div className="space-y-3 flex-1">
                                            <ReviewRow label="Pemasukan Tetap" value={totalIncomeAnnual - num(formData.incomeVariable)} />
                                            <ReviewRow label="Pemasukan Tidak Tetap" value={num(formData.incomeVariable)} />
                                            <div className="hidden md:block h-6"></div>
                                        </div>
                                        {/* Total Pemasukan */}
                                        <div className="mt-6 pt-4 border-t border-slate-100">
                                            <ReviewRow label="TOTAL PEMASUKAN" value={totalIncomeAnnual} isTotal color="emerald" />
                                        </div>
                                    </div>

                                    {/* KANAN: PENGELUARAN */}
                                    <div className="flex flex-col h-full">
                                        <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Pengeluaran
                                        </h4>
                                        <div className="space-y-3 flex-1">
                                            <ReviewRow label="Cicilan Utang" value={totalInstallmentsAnnual} />
                                            <ReviewRow label="Premi Asuransi" value={totalInsuranceAnnual} />
                                            <ReviewRow label="Tabungan & Investasi" value={totalSavingsAnnual} />
                                            <ReviewRow label="Biaya Hidup & Pajak" value={totalLivingExpenseAnnual} />
                                        </div>
                                        {/* Total Pengeluaran */}
                                        <div className="mt-6 pt-4 border-t border-slate-100">
                                            <ReviewRow label="TOTAL PENGELUARAN" value={totalExpenseAnnual} isTotal color="rose" />
                                        </div>
                                    </div>
                                </div>

                                {/* FOOTER: SURPLUS */}
                                <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-100 text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Sisa Uang (Surplus / Defisit)</p>
                                    <div className={cn(
                                        "text-3xl md:text-4xl font-black tracking-tight",
                                        surplusDeficitAnnual >= 0 ? "text-emerald-600" : "text-rose-600"
                                    )}>
                                        {surplusDeficitAnnual >= 0 ? "+" : ""}
                                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(surplusDeficitAnnual)}
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                {/* FOOTER ACTIONS */}
                <div className="bg-white p-6 md:p-8 border-t border-slate-100 flex justify-between items-center rounded-b-2xl">
                    <Button variant="ghost" onClick={step === 0 ? onBack : prevStep} disabled={isLoading} className="text-slate-500 hover:text-brand-600">
                        <ArrowLeft className="w-4 h-4 mr-2" /> {step === 0 ? "Kembali ke Profil" : "Sebelumnya"}
                    </Button>

                    {step < 2 ?
                        <Button onClick={nextStep} className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/20 px-8 h-12 rounded-xl font-bold transition-all hover:translate-x-1">
                            Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
                        </Button> :
                        <Button
                            onClick={handleSubmit}
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

            {/* --- MODAL UTAMA: CALCULATOR BULAN KE TAHUN --- */}
            <MonthlyHelperModal
                isOpen={!!monthlyHelperTarget}
                onClose={() => setMonthlyHelperTarget(null)}
                onApply={applyMonthlyToAnnual}
                title={monthlyHelperTarget ? "Asisten Hitung Tahunan" : ""}
            />

            {/* --- MODAL UTANG (SISA POKOK) --- */}
            {showDebtModal.show && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-5 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDebtModal({ show: false, target: null })} />
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Kalkulator Sisa Utang</h3>
                                <p className="text-xs text-slate-500">Bukan untuk arus kas tahunan, tapi saldo utang.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cicilan Per Bulan</label>
                                <InputGroupNoLabel autoFocus value={tempMonthly ? parseInt(tempMonthly.replace(/\./g, "")) : 0} onChange={(v: SetStateAction<string>) => setTempMonthly(v)} icon={<Banknote className="w-4 h-4" />} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sisa Tenor (Bulan)</label>
                                <div className="relative">
                                    <Input type="number" value={tempTenor} onChange={(e) => setTempTenor(e.target.value)} className="h-12 rounded-xl font-bold bg-slate-50 border-slate-200 focus:border-brand-500 pr-12" placeholder="Contoh: 120" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Bln</span>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setShowDebtModal({ show: false, target: null })}>Batal</Button>
                                <Button className="flex-2 h-12 rounded-xl bg-brand-600 font-bold" onClick={applyDebtCalculation}>Terapkan</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL EMAS --- */}
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
                                <p className="text-lg font-bold text-slate-700">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(currentGoldPrice)}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah Emas (Gram)</label>
                                <div className="relative group">
                                    <Input autoFocus type="text" inputMode="decimal" value={goldWeight} onChange={(e) => setGoldWeight(e.target.value)} className="h-12 rounded-xl font-bold bg-white border-slate-200 focus:border-brand-500 pr-12 transition-all shadow-sm" placeholder="Contoh: 3.21" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">GR</span>
                                </div>
                            </div>
                            <div className="bg-brand-50/50 p-4 rounded-xl border border-brand-100">
                                <p className="text-[10px] font-black text-brand-400 uppercase mb-1">Estimasi Nilai</p>
                                <p className="text-xl font-black text-brand-700">{formatRupiah(Math.round((parseFloat(goldWeight.replace(",", ".")) || 0) * currentGoldPrice))}</p>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-slate-300 text-slate-600" onClick={() => setShowGoldModal(false)}>Batal</Button>
                                <Button className="flex-2 h-12 rounded-xl bg-brand-600 font-bold shadow-lg shadow-brand-500/20 text-white" onClick={applyGoldCalculation} disabled={!currentGoldPrice}>Terapkan Nilai</Button>
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

interface InputGroupProps {
    icon: React.ReactNode;
    label: string;
    desc?: string;
    value: number;
    onChange: (val: string) => void;
    helpContent?: HelpContent;
    onMonthlyClick?: () => void;
    showCalculator?: boolean;
}

function InputGroup({ icon, label, desc, value, onChange, helpContent, onMonthlyClick, showCalculator }: InputGroupProps) {
    const safeValue = (value === undefined || value === null || isNaN(value)) ? 0 : value;
    return (
        <div className="group space-y-1.5">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide group-focus-within:text-brand-600 transition-colors">{label}</Label>
                    <InfoPopover content={helpContent} />
                </div>
                {showCalculator && onMonthlyClick && (
                    <button
                        type="button"
                        onClick={onMonthlyClick}
                        className="text-[9px] font-bold text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                    >
                        <Calculator className="w-3 h-3" /> Hitung Bulanan
                    </button>
                )}
            </div>
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

// UPDATE: Component ReviewRow (Letakkan di bagian bawah file checkup-wizard.tsx)
interface ReviewRowProps {
    label: string;
    value: number;
    isTotal?: boolean;
    color?: "emerald" | "rose" | "brand"; // Opsional untuk total
}

function ReviewRow({ label, value, isTotal, color }: ReviewRowProps) {
    // Base style untuk text angka
    let valueClass = "font-mono font-medium text-slate-700"; // Default Hitam/Abu Tua

    if (isTotal) {
        // Jika Total, gunakan font tebal dan warna spesifik
        valueClass = "font-mono font-black text-lg ";
        if (color === "emerald") valueClass += "text-emerald-700";
        else if (color === "rose") valueClass += "text-rose-700";
        else valueClass += "text-brand-700";
    }

    return (
        <div className={cn(
            "flex justify-between items-center py-1",
            isTotal && "py-2" // Beri spacing lebih jika total
        )}>
            <span className={cn(
                "text-sm",
                isTotal ? "font-bold text-slate-800 uppercase tracking-wide" : "font-medium text-slate-500"
            )}>
                {label}
            </span>
            <span className={valueClass}>
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