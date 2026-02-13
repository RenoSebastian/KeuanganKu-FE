"use client";

import { useState, useEffect, SetStateAction } from "react";
import {
    Wallet, Banknote, Calculator, CreditCard, User, Briefcase, Users,
    ShoppingBag, Car, Gem, Phone, Umbrella, PiggyBank, ShieldCheck,
    Landmark, DollarSign, TrendingUp, Home, Coins, Plane, Activity,
    ArrowLeft, ArrowRight, Loader2
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InfoPopover } from "@/components/ui/info-popover";

import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/financial-math";
import { FINANCIAL_HELP_DATA } from "@/lib/financial-dictionary";
import { FinancialAnnualState, FinancialFormState } from "@/lib/types/financial-checkup";
import { financialService } from "@/services/financial.service";
import { HelpContent } from "@/lib/types";
import { MonthlyHelperModal } from "./monthly-helper-modal";

// ============================================================================
// TYPES & PROPS (CONTROLLED COMPONENT)
// ============================================================================

interface FinancialInputProps {
    // [CORE CHANGE] Data dilempar dari Parent, bukan state lokal
    data: FinancialAnnualState;
    // [CORE CHANGE] Updater dilempar ke Parent
    onUpdate: (field: keyof FinancialAnnualState, value: number) => void;

    onComplete: () => void; // Trigger submit di parent
    onBack: () => void;
    isLoading?: boolean;
}

// ============================================================================
// HELPER COMPONENTS (LOCAL)
// ============================================================================

function SectionHeader({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="mb-6 pb-2 border-b border-slate-100">
            <h3 className="font-black text-slate-800 text-lg tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
        </div>
    );
}

function ReviewRow({ label, value, isTotal, color }: { label: string, value: number, isTotal?: boolean, color?: string }) {
    return (
        <div className={cn("flex justify-between items-center py-1", isTotal && "py-2 font-bold")}>
            <span className={cn("text-sm", isTotal ? "text-slate-800 uppercase tracking-wide" : "text-slate-500 font-medium")}>{label}</span>
            <span className={cn(
                "font-mono font-medium text-slate-700",
                isTotal && "text-lg font-black",
                color === "emerald" && "text-emerald-700",
                color === "rose" && "text-rose-700"
            )}>
                {formatRupiah(value)}
            </span>
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
    // Safety check: value dari parent bisa undefined jika inisialisasi belum sempurna
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
                    // Menggunakan toLocaleString untuk format ribuan visual
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

// ============================================================================
// MAIN COMPONENT (PURE / DUMB)
// ============================================================================

export function FinancialInputSection({ data, onUpdate, onComplete, onBack, isLoading }: FinancialInputProps) {
    // View State (Hanya mengatur tampilan Tab/Step, bukan Data)
    const [step, setStep] = useState(0); // 0: Neraca, 1: Arus Kas, 2: Review

    // Helper Modal States
    const [monthlyHelperTarget, setMonthlyHelperTarget] = useState<keyof FinancialAnnualState | null>(null);
    const [showDebtModal, setShowDebtModal] = useState<{ show: boolean, target: keyof FinancialAnnualState | null }>({ show: false, target: null });

    // Temporary calculation states (Local only)
    const [tempMonthly, setTempMonthly] = useState("");
    const [tempTenor, setTempTenor] = useState("");
    const [showGoldModal, setShowGoldModal] = useState(false);
    const [currentGoldPrice, setCurrentGoldPrice] = useState<number>(0);
    const [goldWeight, setGoldWeight] = useState("");

    // [REMOVED] useEffect sync initialData -> Tidak perlu lagi karena 'data' via props selalu fresh dari Parent

    useEffect(() => {
        const fetchGold = async () => {
            try {
                const res = await financialService.getLatestGoldPrice();
                if (res.success && res.data) setCurrentGoldPrice(Number(res.data.buyPrice));
            } catch (e) { console.error("Gold price fetch failed", e); }
        };
        fetchGold();
    }, []);

    // [UPDATED] Handler langsung memanggil onUpdate (Parent)
    const handleLocalChange = (field: keyof FinancialAnnualState, valueString: string) => {
        const numericValue = parseFloat(valueString.replace(/[^0-9]/g, "")) || 0;
        onUpdate(field, numericValue);
    };

    // [UPDATED] Apply Monthly Helper Result
    const applyMonthlyToAnnual = (annualValue: number) => {
        if (monthlyHelperTarget) {
            onUpdate(monthlyHelperTarget, annualValue);
            setMonthlyHelperTarget(null);
        }
    };

    // [UPDATED] Apply Debt Calculation
    const applyDebtCalculation = () => {
        if (!showDebtModal.target) return;
        const monthly = parseInt(tempMonthly.replace(/\./g, "")) || 0;
        const tenor = parseInt(tempTenor) || 0;
        const total = monthly * tenor;

        onUpdate(showDebtModal.target, total);

        setShowDebtModal({ show: false, target: null });
        setTempMonthly("");
        setTempTenor("");
    };

    // [UPDATED] Apply Gold Calculation
    const applyGoldCalculation = () => {
        const cleanWeight = goldWeight.replace(/[^0-9,.]/g, "").replace(",", ".");
        const weight = parseFloat(cleanWeight) || 0;
        if (!currentGoldPrice || currentGoldPrice <= 0) {
            alert("Harga emas belum tersedia dari server.");
            return;
        }
        const totalPrice = Math.round(weight * currentGoldPrice);
        if (!isNaN(totalPrice)) {
            onUpdate("assetGold", totalPrice);
            setShowGoldModal(false);
            setGoldWeight("");
        }
    };

    const num = (n: any) => Number(n) || 0;

    // Helper functions for Review Step (Read Directly from Props)
    const totalAssets = num(data.assetCash) + num(data.assetHome) + num(data.assetVehicle) + num(data.assetJewelry) + num(data.assetAntique) + num(data.assetPersonalOther) + num(data.assetInvHome) + num(data.assetInvVehicle) + num(data.assetGold) + num(data.assetInvAntique) + num(data.assetStocks) + num(data.assetMutualFund) + num(data.assetBonds) + num(data.assetDeposit) + num(data.assetInvOther);
    const totalDebt = num(data.debtKPR) + num(data.debtKPM) + num(data.debtCC) + num(data.debtCoop) + num(data.debtConsumptiveOther) + num(data.debtBusiness);
    const netWorth = totalAssets - totalDebt;

    const totalIncomeAnnual = num(data.incomeFixed) + num(data.incomeVariable);
    const totalInstallmentsAnnual = num(data.installmentKPR) + num(data.installmentKPM) + num(data.installmentCC) + num(data.installmentCoop) + num(data.installmentConsumptiveOther) + num(data.installmentBusiness);
    const totalInsuranceAnnual = num(data.insuranceLife) + num(data.insuranceHealth) + num(data.insuranceHome) + num(data.insuranceVehicle) + num(data.insuranceBPJS) + num(data.insuranceOther);
    const totalSavingsAnnual = num(data.savingEducation) + num(data.savingRetirement) + num(data.savingPilgrimage) + num(data.savingHoliday) + num(data.savingEmergency) + num(data.savingOther);
    const totalLivingExpenseAnnual = num(data.expenseFood) + num(data.expenseSchool) + num(data.expenseTransport) + num(data.expenseCommunication) + num(data.expenseHelpers) + num(data.expenseLifestyle) + num(data.expenseTax);
    const totalExpenseAnnual = totalInstallmentsAnnual + totalInsuranceAnnual + totalSavingsAnnual + totalLivingExpenseAnnual;
    const surplusDeficitAnnual = totalIncomeAnnual - totalExpenseAnnual;

    return (
        <div className="w-full">
            <div className="card-clean overflow-hidden">
                {/* SUB-HEADER FOR STEPS */}
                <div className="bg-slate-50/50 border-b border-slate-100 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl shadow-sm ring-1 ring-white/50", step === 0 ? "bg-brand-50 text-brand-600" : step === 1 ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600")}>
                            {step === 0 && <Wallet className="w-6 h-6" />}
                            {step === 1 && <Banknote className="w-6 h-6" />}
                            {step === 2 && <Calculator className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                {step === 0 ? "Neraca (Harta & Utang)" : step === 1 ? "Arus Kas (Tahunan)" : "Review Data"}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">Langkah {step + 1} dari 3</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    {/* STEP 0: NERACA (ASET & UTANG) */}
                    {step === 0 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* A. DAFTAR ASET */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b-2 border-brand-500 pb-2">
                                    <Wallet className="w-6 h-6 text-brand-600" />
                                    <h3 className="text-xl font-black text-slate-800">Daftar Aset (Harta)</h3>
                                </div>

                                <SectionHeader title="Aset Likuid" desc="Kas dan setara kas (Saldo Saat Ini)" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Kas / Tabungan / Deposito Cair" value={num(data.assetCash)} onChange={(v) => handleLocalChange("assetCash", v)} icon={<Wallet className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetCash} />
                                </div>

                                <div className="border-t border-dashed border-slate-200" />

                                <SectionHeader title="Aset Personal" desc="Aset guna pakai (tidak menghasilkan income)" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Rumah / Tanah (Ditempati)" value={num(data.assetHome)} onChange={(v) => handleLocalChange("assetHome", v)} icon={<Home className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetHome} />
                                    <InputGroup label="Kendaraan Pribadi" value={num(data.assetVehicle)} onChange={(v) => handleLocalChange("assetVehicle", v)} icon={<Car className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetVehicle} />
                                    <InputGroup label="Emas Perhiasan" value={num(data.assetJewelry)} onChange={(v) => handleLocalChange("assetJewelry", v)} icon={<Gem className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetJewelry} />
                                    <InputGroup label="Barang Antik / Koleksi" value={num(data.assetAntique)} onChange={(v) => handleLocalChange("assetAntique", v)} icon={<Coins className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetAntique} />
                                    <InputGroup label="Aset Personal Lain" value={num(data.assetPersonalOther)} onChange={(v) => handleLocalChange("assetPersonalOther", v)} icon={<Wallet className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetPersonalOther} />
                                </div>

                                <div className="border-t border-dashed border-slate-200" />

                                <SectionHeader title="Aset Investasi" desc="Aset yang diharapkan tumbuh nilainya" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Rumah / Tanah" value={num(data.assetInvHome)} onChange={(v) => handleLocalChange("assetInvHome", v)} icon={<Home className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetInvHome} />
                                    <InputGroup label="Kendaraan " value={num(data.assetInvVehicle)} onChange={(v) => handleLocalChange("assetInvVehicle", v)} icon={<Car className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetInvVehicle} />

                                    {/* LOGAM MULIA */}
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
                                        <InputGroupNoLabel value={num(data.assetGold)} onChange={(v) => handleLocalChange("assetGold", v)} icon={<Coins className="w-4 h-4" />} />
                                        {currentGoldPrice > 0 && (
                                            <p className="text-[9px] text-slate-400 italic ml-1">*Harga referensi: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(currentGoldPrice)}/gr</p>
                                        )}
                                    </div>

                                    <InputGroup label="Barang Antik " value={num(data.assetInvAntique)} onChange={(v) => handleLocalChange("assetInvAntique", v)} icon={<Coins className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetInvAntique} />
                                    <InputGroup label="Saham" value={num(data.assetStocks)} onChange={(v) => handleLocalChange("assetStocks", v)} icon={<TrendingUp className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetStocks} />
                                    <InputGroup label="Reksadana" value={num(data.assetMutualFund)} onChange={(v) => handleLocalChange("assetMutualFund", v)} icon={<TrendingUp className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetMutualFund} />
                                    <InputGroup label="Obligasi" value={num(data.assetBonds)} onChange={(v) => handleLocalChange("assetBonds", v)} icon={<Landmark className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetBonds} />
                                    <InputGroup label="Deposito Jangka Panjang" value={num(data.assetDeposit)} onChange={(v) => handleLocalChange("assetDeposit", v)} icon={<Landmark className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetDeposit} />
                                    <InputGroup label="Aset Investasi Lain" value={num(data.assetInvOther)} onChange={(v) => handleLocalChange("assetInvOther", v)} icon={<Briefcase className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetInvOther} />
                                </div>
                            </div>

                            {/* B. DAFTAR UTANG */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b-2 border-rose-500 pb-2">
                                    <CreditCard className="w-6 h-6 text-rose-600" />
                                    <h3 className="text-xl font-black text-slate-800">Daftar Utang (Kewajiban)</h3>
                                </div>

                                <SectionHeader title="Utang Konsumtif" desc="Sisa Pokok Utang (Outstanding)" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* KPR */}
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
                                        <InputGroupNoLabel value={num(data.debtKPR)} onChange={(v) => handleLocalChange("debtKPR", v)} icon={<Home className="w-4 h-4" />} />
                                    </div>

                                    {/* KPM */}
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
                                        <InputGroupNoLabel value={num(data.debtKPM)} onChange={(v) => handleLocalChange("debtKPM", v)} icon={<Car className="w-4 h-4" />} />
                                    </div>

                                    <InputGroup label="Kartu Kredit" value={num(data.debtCC)} onChange={(v) => handleLocalChange("debtCC", v)} icon={<CreditCard className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.debtCC} />
                                    <InputGroup label="Koperasi" value={num(data.debtCoop)} onChange={(v) => handleLocalChange("debtCoop", v)} icon={<Users className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.debtCoop} />
                                    <InputGroup label="Utang Lainnya" value={num(data.debtConsumptiveOther)} onChange={(v) => handleLocalChange("debtConsumptiveOther", v)} icon={<User className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.debtConsumptiveOther} />
                                </div>

                                <SectionHeader title="Utang Usaha" desc="Utang Produktif / Bisnis" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Utang Usaha / UMKM" value={num(data.debtBusiness)} onChange={(v) => handleLocalChange("debtBusiness", v)} icon={<Briefcase className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.debtBusiness} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 1: ARUS KAS (TAHUNAN) */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl flex gap-3 text-brand-800 text-sm mb-4">
                                <div className="shrink-0"><Activity className="w-5 h-5" /></div>
                                <div>
                                    <p className="font-bold">MODE INPUT: TAHUNAN</p>
                                    <p>Masukkan total pendapatan & pengeluaran Anda dalam <strong>1 TAHUN</strong>. Gunakan tombol kalkulator untuk bantuan hitung dari bulanan.</p>
                                </div>
                            </div>

                            {/* I. PEMASUKAN */}
                            <SectionHeader title="I. Pemasukan (Per Tahun)" desc="Total pendapatan setahun (x12)" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="1. Pendapatan Tetap" value={num(data.incomeFixed)} onChange={(v) => handleLocalChange("incomeFixed", v)} icon={<DollarSign className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.incomeFixed} onMonthlyClick={() => setMonthlyHelperTarget("incomeFixed")} showCalculator />
                                <InputGroup label="2. Pendapatan Tidak Tetap" value={num(data.incomeVariable)} onChange={(v) => handleLocalChange("incomeVariable", v)} icon={<TrendingUp className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.incomeVariable} onMonthlyClick={() => setMonthlyHelperTarget("incomeVariable")} showCalculator />
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
                                        value={num(data[item.k as keyof FinancialAnnualState])}
                                        onChange={(v) => handleLocalChange(item.k as keyof FinancialAnnualState, v)}
                                        icon={item.i}
                                        helpContent={FINANCIAL_HELP_DATA[item.k as keyof typeof FINANCIAL_HELP_DATA]}
                                        onMonthlyClick={() => setMonthlyHelperTarget(item.k as keyof FinancialAnnualState)}
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
                                        value={num(data[item.k as keyof FinancialAnnualState])}
                                        onChange={(v) => handleLocalChange(item.k as keyof FinancialAnnualState, v)}
                                        icon={item.i}
                                        helpContent={FINANCIAL_HELP_DATA[item.k as keyof typeof FINANCIAL_HELP_DATA]}
                                        onMonthlyClick={() => setMonthlyHelperTarget(item.k as keyof FinancialAnnualState)}
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
                                        value={num(data[item.k as keyof FinancialAnnualState])}
                                        onChange={(v) => handleLocalChange(item.k as keyof FinancialAnnualState, v)}
                                        icon={item.i}
                                        helpContent={FINANCIAL_HELP_DATA[item.k as keyof typeof FINANCIAL_HELP_DATA]}
                                        onMonthlyClick={() => setMonthlyHelperTarget(item.k as keyof FinancialAnnualState)}
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
                                        value={num(data[item.k as keyof FinancialAnnualState])}
                                        onChange={(v) => handleLocalChange(item.k as keyof FinancialAnnualState, v)}
                                        icon={item.i}
                                        helpContent={FINANCIAL_HELP_DATA[item.k as keyof typeof FINANCIAL_HELP_DATA]}
                                        onMonthlyClick={() => setMonthlyHelperTarget(item.k as keyof FinancialAnnualState)}
                                        showCalculator
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* REVIEW CARDS */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* CARD 1: NERACA */}
                                <div className="bg-white border border-slate-200 p-6 rounded-2xl">
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                                        <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600"><Wallet className="w-4 h-4" /></div>
                                        <h4 className="font-bold text-slate-700">Laporan Neraca</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <ReviewRow label="Total Aset" value={totalAssets} color="emerald" />
                                        <ReviewRow label="Total Utang" value={totalDebt} color="rose" />
                                        <div className="border-t border-slate-100 pt-2 mt-2">
                                            <ReviewRow label="Kekayaan Bersih" value={netWorth} isTotal />
                                        </div>
                                    </div>
                                </div>

                                {/* CARD 2: ARUS KAS */}
                                <div className="bg-white border border-slate-200 p-6 rounded-2xl">
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><Banknote className="w-4 h-4" /></div>
                                        <h4 className="font-bold text-slate-700">Laporan Arus Kas</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <ReviewRow label="Total Pemasukan" value={totalIncomeAnnual} color="emerald" />
                                        <ReviewRow label="Total Pengeluaran" value={totalExpenseAnnual} color="rose" />
                                        <div className="border-t border-slate-100 pt-2 mt-2">
                                            <ReviewRow label="Surplus / Defisit" value={surplusDeficitAnnual} isTotal />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER ACTIONS */}
                <div className="bg-white p-6 md:p-8 border-t border-slate-100 flex justify-between items-center rounded-b-2xl">
                    <Button variant="ghost" onClick={step === 0 ? onBack : () => setStep(prev => prev - 1)} disabled={isLoading} className="text-slate-500 hover:text-brand-600">
                        <ArrowLeft className="w-4 h-4 mr-2" /> {step === 0 ? "Kembali" : "Sebelumnya"}
                    </Button>

                    {step < 2 ? (
                        <Button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setStep(prev => prev + 1); }} className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/20 px-8 h-12 rounded-xl font-bold">
                            Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={onComplete} disabled={isLoading} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 px-8 h-12 rounded-xl font-bold">
                            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menganalisa...</> : <><Calculator className="w-4 h-4 mr-2" /> Diagnosa Sekarang</>}
                        </Button>
                    )}
                </div>
            </div>

            {/* Modals: Monthly Helper */}
            <MonthlyHelperModal
                isOpen={!!monthlyHelperTarget}
                onClose={() => setMonthlyHelperTarget(null)}
                onApply={(val) => applyMonthlyToAnnual(val)}
                title="Asisten Hitung Tahunan"
            />

            {/* Modals: Debt Calculator */}
            {showDebtModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-5 animate-in fade-in duration-200">
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

            {/* Modals: Gold Calculator */}
            {showGoldModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-5 animate-in fade-in duration-200">
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