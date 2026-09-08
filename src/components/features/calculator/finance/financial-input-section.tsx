"use client";

import { useState, useEffect, SetStateAction } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    Wallet, Banknote, Calculator, CreditCard, User, Briefcase, Users,
    ShoppingBag, Car, Gem, Phone, Umbrella, PiggyBank, ShieldCheck,
    Landmark, DollarSign, TrendingUp, Home, Coins, Plane, Activity,
    ArrowLeft, ArrowRight, Loader2, Sparkles, AlertCircle
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InfoPopover } from "@/components/ui/info-popover";

import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/financial-math";
import { FINANCIAL_HELP_DATA } from "@/lib/financial-dictionary";
import { FinancialAnnualState } from "@/lib/types/financial-checkup";
import { financialService } from "@/services/financial.service";
import { HelpContent } from "@/lib/types";
import { MonthlyHelperModal } from "./monthly-helper-modal";
import { toast } from "sonner";

// ============================================================================
// TYPES & PROPS
// ============================================================================

// Ubah definisi ini:
interface FinancialInputProps {
    data: FinancialAnnualState;
    onUpdate: (field: keyof FinancialAnnualState, value: number) => void;
    // onComplete: () => void;  <-- UBAH BARIS INI MENJADI:
    onComplete: (latestData?: FinancialAnnualState) => void;
    onBack: () => void;
    isLoading?: boolean;
}

// ============================================================================
// HELPER COMPONENTS (PREMIUM UI/UX)
// ============================================================================

function SectionHeader({ title, desc, icon: Icon, color = "indigo" }: { title: string, desc: string, icon?: any, color?: string }) {
    const colorStyles: Record<string, string> = {
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        rose: "text-rose-600 bg-rose-50 border-rose-100",
        amber: "text-amber-600 bg-amber-50 border-amber-100",
        slate: "text-slate-600 bg-slate-50 border-slate-200",
    };

    const selectedStyle = colorStyles[color] || colorStyles.indigo;

    return (
        <div className="flex items-center gap-3 mb-5 mt-2">
            {Icon && (
                <div className={cn("p-2.5 rounded-xl border shadow-sm shrink-0", selectedStyle)}>
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <div>
                <h3 className="font-black text-slate-800 text-base md:text-lg tracking-tight">{title}</h3>
                <p className="text-[11px] md:text-xs text-slate-500 font-medium">{desc}</p>
            </div>
        </div>
    );
}

function ReviewRow({ label, value, isTotal, color }: { label: string, value: number, isTotal?: boolean, color?: string }) {
    // LOGIKA ELASTISITAS PWA & RESPONSIVE BREAKPOINT
    if (isTotal) {
        return (
            <div className="flex flex-col md:flex-row md:justify-between md:items-center py-3 px-2 gap-1.5 md:gap-4 transition-all hover:bg-slate-50/50 rounded-lg -mx-2">
                <span className="text-xs md:text-sm text-slate-800 uppercase tracking-widest md:tracking-wide font-black shrink-0">
                    {label}
                </span>
                <span className={cn(
                    "font-mono font-black text-2xl md:text-xl tracking-tighter md:tracking-normal truncate",
                    color === "emerald" ? "text-emerald-600" : color === "rose" ? "text-rose-600" : "text-slate-800"
                )}>
                    {formatRupiah(value)}
                </span>
            </div>
        );
    }

    return (
        <div className="flex justify-between items-center py-2.5 transition-all hover:bg-slate-50/50 px-2 rounded-lg -mx-2 gap-3">
            <span className="text-xs md:text-sm text-slate-500 font-medium leading-tight">{label}</span>
            <span className={cn(
                "font-mono font-bold text-slate-700 text-right text-sm md:text-base shrink-0",
                color === "emerald" && "text-emerald-600",
                color === "rose" && "text-rose-600"
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
    const safeValue = (value === undefined || value === null || isNaN(value)) ? 0 : value;

    return (
        <div className="group space-y-1.5 flex flex-col justify-end">
            <div className="flex justify-between items-end mb-1">
                <div className="flex items-center">
                    <Label className="text-[11px] md:text-xs font-black text-slate-500 uppercase tracking-wider group-focus-within:text-indigo-600 transition-colors">
                        {label}
                    </Label>
                    {helpContent && <InfoPopover content={helpContent} />}
                </div>
                {showCalculator && onMonthlyClick && (
                    <button
                        type="button"
                        onClick={onMonthlyClick}
                        className="text-[9px] font-bold text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                    >
                        <Calculator className="w-3 h-3" /> Bantu Hitung
                    </button>
                )}
            </div>

            <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02] origin-bottom">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 group-focus-within:rotate-3 transition-all z-10">
                    {icon}
                </div>
                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 font-light text-xl z-10">|</div>
                <div className="absolute left-14 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px] z-10">Rp</div>

                <Input
                    type="text"
                    inputMode="numeric"
                    value={safeValue === 0 ? "" : safeValue.toLocaleString("id-ID")}
                    onChange={(e) => onChange(e.target.value)}
                    // PREVENT iOS ZOOM: Diubah menjadi text-base minimum
                    className="pl-20 h-12 md:h-14 bg-slate-50/70 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white font-black text-slate-800 text-base shadow-sm rounded-xl transition-all"
                    placeholder="0"
                />
            </div>
            {desc && <p className="text-[9px] text-slate-400 leading-tight pl-1 font-medium">{desc}</p>}
        </div>
    );
}

function InputGroupNoLabel({ icon, value, onChange, autoFocus }: { icon: React.ReactNode, value: number, onChange: (val: string) => void, autoFocus?: boolean }) {
    const safeValue = (value === undefined || value === null || isNaN(value)) ? 0 : value;
    return (
        <div className="relative transition-all duration-300 group-focus-within:scale-[1.02]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500">{icon}</div>
            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 font-light text-xl">|</div>
            <div className="absolute left-14 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rp</div>
            <Input
                autoFocus={autoFocus}
                type="text"
                inputMode="numeric"
                value={safeValue === 0 ? "" : safeValue.toLocaleString("id-ID")}
                onChange={(e) => onChange(e.target.value)}
                // PREVENT iOS ZOOM: Diubah menjadi text-base
                className="pl-20 h-14 bg-slate-50 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white font-black text-base md:text-lg text-slate-800 rounded-xl transition-all shadow-sm"
                placeholder="0"
            />
        </div>
    );
}

// ============================================================================
// MAIN COMPONENT (THE WIZARD ENGINE)
// ============================================================================

export function FinancialInputSection({ data, onUpdate, onComplete, onBack, isLoading }: FinancialInputProps) {
    const [step, setStep] = useState(0);

    const [monthlyHelperTarget, setMonthlyHelperTarget] = useState<keyof FinancialAnnualState | null>(null);
    const [showDebtModal, setShowDebtModal] = useState<{ show: boolean, target: keyof FinancialAnnualState | null }>({ show: false, target: null });

    const [tempMonthly, setTempMonthly] = useState("");
    const [tempTenor, setTempTenor] = useState("");
    const [showGoldModal, setShowGoldModal] = useState(false);
    const [currentGoldPrice, setCurrentGoldPrice] = useState<number>(0);
    const [goldWeight, setGoldWeight] = useState("");

    useEffect(() => {
        const fetchGold = async () => {
            try {
                const res = await financialService.getLatestGoldPrice();
                const price = Number(res?.data?.buyPrice);
                if (!isNaN(price) && price > 0) {
                    setCurrentGoldPrice(price);
                } else {
                    setCurrentGoldPrice(1350000);
                }
            } catch (e) {
                console.error("Gold price fetch failed, using fallback", e);
                setCurrentGoldPrice((prev) => (prev > 0 ? prev : 1350000));
            }
        };
        fetchGold();
    }, []);

    const handleLocalChange = (field: keyof FinancialAnnualState, valueString: string) => {
        const numericValue = parseFloat(valueString.replace(/[^0-9]/g, "")) || 0;
        onUpdate(field, numericValue);
    };

    const applyMonthlyToAnnual = (annualValue: number) => {
        if (monthlyHelperTarget) {
            onUpdate(monthlyHelperTarget, annualValue);
            setMonthlyHelperTarget(null);
        }
    };

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

    const applyGoldCalculation = () => {
        const cleanWeight = goldWeight.replace(/[^0-9,.]/g, "").replace(",", ".");
        const weight = parseFloat(cleanWeight) || 0;
        const validPrice = !isNaN(currentGoldPrice) && currentGoldPrice > 0 ? currentGoldPrice : 1350000;
        if (weight <= 0) {
            toast.error("Masukkan jumlah gram emas yang valid.");
            return;
        }
        const totalPrice = Math.round(weight * validPrice);
        if (!isNaN(totalPrice)) {
            onUpdate("assetGold", totalPrice);
            setShowGoldModal(false);
            setGoldWeight("");
        }
    };

    const num = (n: any) => Number(n) || 0;

    // Kalkulasi Total
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

    const pageVariants: Variants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0, transition: { stiffness: 300, damping: 30 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    return (
        <div className="w-full flex flex-col h-full">
            <div className="flex-1 overflow-hidden pb-[calc(env(safe-area-inset-bottom)+1rem)]">

                {/* 1. COMPACT HEADER */}
                <div className="bg-slate-50/80 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 rounded-t-3xl">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "p-3 rounded-3xl shadow-sm flex items-center justify-center shrink-0",
                            step === 0 ? "bg-indigo-600 text-white" : step === 1 ? "bg-emerald-500 text-white" : "bg-brand-600 text-white"
                        )}>
                            {step === 0 && <Wallet className="w-5 h-5" />}
                            {step === 1 && <Banknote className="w-5 h-5" />}
                            {step === 2 && <Calculator className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                                {step === 0 ? "Neraca Klien" : step === 1 ? "Arus Kas Tahunan" : "Verifikasi Data"}
                            </h2>
                            <p className="text-[11px] md:text-xs text-slate-500 font-medium uppercase tracking-widest">
                                Tahap {step + 1} dari 3
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-8">
                    <AnimatePresence mode="wait">

                        {/* ==================================================
                            STEP 0: NERACA (ASET & UTANG)
                            ================================================== */}
                        {step === 0 && (
                            <motion.div key="step-0" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-10">

                                {/* A. DAFTAR ASET (Bento Container) */}
                                <div className="bg-slate-50/40 p-5 md:p-6 rounded-3xl border border-slate-100 space-y-6 overflow-hidden">
                                    <SectionHeader icon={Wallet} color="indigo" title="Aset Likuid (Kas & Setara Kas)" desc="Harta yang sangat mudah dicairkan saat darurat." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                        <InputGroup label="Kas / Tabungan / Deposito" value={num(data.assetCash)} onChange={(v) => handleLocalChange("assetCash", v)} icon={<Wallet className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetCash} />
                                    </div>

                                    <div className="border-t border-slate-200/60 my-6" />

                                    <SectionHeader icon={Home} color="emerald" title="Aset Personal" desc="Aset guna pakai (rumah tinggal, mobil pribadi)." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                        <InputGroup label="Rumah / Tanah (Ditempati)" value={num(data.assetHome)} onChange={(v) => handleLocalChange("assetHome", v)} icon={<Home className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetHome} />
                                        <InputGroup label="Kendaraan Pribadi" value={num(data.assetVehicle)} onChange={(v) => handleLocalChange("assetVehicle", v)} icon={<Car className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetVehicle} />
                                        <InputGroup label="Emas Perhiasan" value={num(data.assetJewelry)} onChange={(v) => handleLocalChange("assetJewelry", v)} icon={<Gem className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetJewelry} />
                                        <InputGroup label="Barang Antik / Koleksi" value={num(data.assetAntique)} onChange={(v) => handleLocalChange("assetAntique", v)} icon={<Coins className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetAntique} />
                                        <InputGroup label="Aset Personal Lain" value={num(data.assetPersonalOther)} onChange={(v) => handleLocalChange("assetPersonalOther", v)} icon={<Wallet className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetPersonalOther} />
                                    </div>

                                    <div className="border-t border-slate-200/60 my-6" />

                                    <SectionHeader icon={TrendingUp} color="amber" title="Aset Investasi" desc="Aset yang diharapkan terus bertumbuh nilainya." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                        <InputGroup label="Rumah / Tanah Investasi" value={num(data.assetInvHome)} onChange={(v) => handleLocalChange("assetInvHome", v)} icon={<Home className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetInvHome} />

                                        {/* EMAS (Special Component) */}
                                        <div className="group space-y-1.5 flex flex-col justify-end bg-amber-50/50 p-3 md:p-4 rounded-2xl border border-amber-100">
                                            <div className="flex justify-between items-end mb-1">
                                                <div className="flex items-center">
                                                    <Label className="text-[11px] md:text-xs font-black text-amber-700 uppercase tracking-wider">Logam Mulia</Label>
                                                    <InfoPopover content={FINANCIAL_HELP_DATA.assetGold} />
                                                </div>
                                                <button type="button" onClick={() => setShowGoldModal(true)} className="text-[9px] font-bold text-amber-600 bg-white shadow-sm hover:text-amber-700 hover:bg-amber-100 px-2 py-1 rounded-md transition-all flex items-center gap-1 active:scale-95">
                                                    <Sparkles className="w-3 h-3" /> Konversi Gram
                                                </button>
                                            </div>
                                            <InputGroupNoLabel value={num(data.assetGold)} onChange={(v) => handleLocalChange("assetGold", v)} icon={<Coins className="w-4 h-4 text-amber-500" />} />
                                            {currentGoldPrice > 0 && !isNaN(currentGoldPrice) && <p className="text-[9px] text-amber-600/70 italic ml-1 font-medium">*Ref harga: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(currentGoldPrice)}/gr</p>}
                                        </div>

                                        <InputGroup label="Saham" value={num(data.assetStocks)} onChange={(v) => handleLocalChange("assetStocks", v)} icon={<TrendingUp className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetStocks} />
                                        <InputGroup label="Reksadana" value={num(data.assetMutualFund)} onChange={(v) => handleLocalChange("assetMutualFund", v)} icon={<TrendingUp className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetMutualFund} />
                                        <InputGroup label="Obligasi / SBN" value={num(data.assetBonds)} onChange={(v) => handleLocalChange("assetBonds", v)} icon={<Landmark className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetBonds} />
                                        <InputGroup label="Aset Investasi Lain" value={num(data.assetInvOther)} onChange={(v) => handleLocalChange("assetInvOther", v)} icon={<Briefcase className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetInvOther} />
                                    </div>
                                </div>

                                {/* B. DAFTAR UTANG */}
                                <div className="bg-rose-50/30 p-5 md:p-6 rounded-3xl border border-rose-100 space-y-6 overflow-hidden">
                                    <SectionHeader icon={CreditCard} color="rose" title="Utang Konsumtif" desc="Sisa pokok utang berjalan (bukan cicilan bulanannya)." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

                                        {/* KPR (Special Component) */}
                                        <div className="group space-y-1.5 flex flex-col justify-end bg-white p-3 md:p-4 rounded-2xl border border-rose-100 shadow-sm">
                                            <div className="flex justify-between items-end mb-1">
                                                <div className="flex items-center">
                                                    <Label className="text-[11px] md:text-xs font-black text-rose-700 uppercase tracking-wider">KPR (Rumah)</Label>
                                                </div>
                                                <button type="button" onClick={() => setShowDebtModal({ show: true, target: 'debtKPR' })} className="text-[9px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-md transition-all flex items-center gap-1 active:scale-95">
                                                    <Calculator className="w-3 h-3" /> Hitung Sisa
                                                </button>
                                            </div>
                                            <InputGroupNoLabel value={num(data.debtKPR)} onChange={(v) => handleLocalChange("debtKPR", v)} icon={<Home className="w-4 h-4 text-rose-400" />} />
                                        </div>

                                        {/* KPM (Special Component) */}
                                        <div className="group space-y-1.5 flex flex-col justify-end bg-white p-3 md:p-4 rounded-2xl border border-rose-100 shadow-sm">
                                            <div className="flex justify-between items-end mb-1">
                                                <div className="flex items-center">
                                                    <Label className="text-[11px] md:text-xs font-black text-rose-700 uppercase tracking-wider">KPM (Kendaraan)</Label>
                                                </div>
                                                <button type="button" onClick={() => setShowDebtModal({ show: true, target: 'debtKPM' })} className="text-[9px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-md transition-all flex items-center gap-1 active:scale-95">
                                                    <Calculator className="w-3 h-3" /> Hitung Sisa
                                                </button>
                                            </div>
                                            <InputGroupNoLabel value={num(data.debtKPM)} onChange={(v) => handleLocalChange("debtKPM", v)} icon={<Car className="w-4 h-4 text-rose-400" />} />
                                        </div>

                                        <InputGroup label="Kartu Kredit" value={num(data.debtCC)} onChange={(v) => handleLocalChange("debtCC", v)} icon={<CreditCard className="w-4 h-4 text-rose-400" />} helpContent={FINANCIAL_HELP_DATA.debtCC} />
                                        <InputGroup label="Koperasi / Pinjol" value={num(data.debtCoop)} onChange={(v) => handleLocalChange("debtCoop", v)} icon={<Users className="w-4 h-4 text-rose-400" />} helpContent={FINANCIAL_HELP_DATA.debtCoop} />
                                    </div>

                                    <div className="border-t border-rose-200/60 my-6" />

                                    <SectionHeader icon={Briefcase} color="rose" title="Utang Usaha" desc="Utang untuk kepentingan modal bisnis." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                        <InputGroup label="Utang Usaha / UMKM" value={num(data.debtBusiness)} onChange={(v) => handleLocalChange("debtBusiness", v)} icon={<Briefcase className="w-4 h-4 text-rose-400" />} helpContent={FINANCIAL_HELP_DATA.debtBusiness} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ==================================================
                            STEP 1: ARUS KAS (TAHUNAN)
                            ================================================== */}
                        {step === 1 && (
                            <motion.div key="step-1" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-10">

                                <div className="bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-4 md:p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                                    <div className="bg-white p-2 rounded-xl shadow-sm text-emerald-600 shrink-0"><AlertCircle className="w-6 h-6" /></div>
                                    <div>
                                        <h4 className="font-black text-emerald-800 tracking-tight text-sm md:text-base">MENGGUNAKAN MODE TAHUNAN</h4>
                                        <p className="text-xs md:text-sm text-emerald-700/80 mt-1 font-medium leading-relaxed">
                                            Masukkan seluruh total pemasukan & pengeluaran untuk jangka waktu <strong>1 Tahun</strong>.
                                            Jika klien hanya hafal pengeluaran bulanan, klik tombol <strong className="bg-white px-1.5 py-0.5 rounded text-indigo-600 shadow-sm"><Calculator className="w-3 h-3 inline mr-1" />Bantu Hitung</strong>.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-50/40 p-5 md:p-6 rounded-3xl border border-slate-100 space-y-6 overflow-hidden">
                                    <SectionHeader icon={DollarSign} color="emerald" title="I. Total Pemasukan" desc="Pendapatan bruto klien selama setahun terakhir." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                        <InputGroup label="1. Pendapatan Tetap" value={num(data.incomeFixed)} onChange={(v) => handleLocalChange("incomeFixed", v)} icon={<DollarSign className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.incomeFixed} onMonthlyClick={() => setMonthlyHelperTarget("incomeFixed")} showCalculator />
                                        <InputGroup label="2. Pendapatan Variabel" value={num(data.incomeVariable)} onChange={(v) => handleLocalChange("incomeVariable", v)} icon={<TrendingUp className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.incomeVariable} onMonthlyClick={() => setMonthlyHelperTarget("incomeVariable")} showCalculator />
                                    </div>

                                    <div className="border-t border-slate-200/60 my-6" />

                                    <SectionHeader icon={CreditCard} color="rose" title="1. Cicilan Utang" desc="Total uang yang dibayarkan untuk angsuran selama setahun." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                        {[
                                            { k: 'installmentKPR', l: 'Cicilan KPR', i: <Home className="w-4 h-4" /> },
                                            { k: 'installmentKPM', l: 'Cicilan KPM', i: <Car className="w-4 h-4" /> },
                                            { k: 'installmentCC', l: 'Cicilan Kartu Kredit', i: <CreditCard className="w-4 h-4" /> },
                                            { k: 'installmentBusiness', l: 'Cicilan Usaha', i: <Briefcase className="w-4 h-4" /> }
                                        ].map((item) => (
                                            <InputGroup
                                                key={item.k} label={item.l} value={num(data[item.k as keyof FinancialAnnualState])}
                                                onChange={(v) => handleLocalChange(item.k as keyof FinancialAnnualState, v)}
                                                icon={item.i} helpContent={FINANCIAL_HELP_DATA[item.k as keyof typeof FINANCIAL_HELP_DATA]}
                                                onMonthlyClick={() => setMonthlyHelperTarget(item.k as keyof FinancialAnnualState)} showCalculator
                                            />
                                        ))}
                                    </div>

                                    <div className="border-t border-slate-200/60 my-6" />

                                    <SectionHeader icon={Umbrella} color="indigo" title="2. Premi Asuransi" desc="Uang yang disisihkan untuk proteksi setahun." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                        {[
                                            { k: 'insuranceLife', l: 'Asuransi Jiwa', i: <Umbrella className="w-4 h-4" /> },
                                            { k: 'insuranceHealth', l: 'Asuransi Kesehatan', i: <Activity className="w-4 h-4" /> },
                                            { k: 'insuranceHome', l: 'Asuransi Rumah', i: <Home className="w-4 h-4" /> },
                                            { k: 'insuranceVehicle', l: 'Asuransi Kendaraan', i: <Car className="w-4 h-4" /> },
                                            { k: 'insuranceBPJS', l: 'BPJS Kes / TK', i: <ShieldCheck className="w-4 h-4" /> },
                                            { k: 'insuranceOther', l: 'Asuransi Lainnya', i: <Briefcase className="w-4 h-4" /> }
                                        ].map((item) => (
                                            <InputGroup
                                                key={item.k} label={item.l} value={num(data[item.k as keyof FinancialAnnualState])}
                                                onChange={(v) => handleLocalChange(item.k as keyof FinancialAnnualState, v)}
                                                icon={item.i} helpContent={FINANCIAL_HELP_DATA[item.k as keyof typeof FINANCIAL_HELP_DATA]}
                                                onMonthlyClick={() => setMonthlyHelperTarget(item.k as keyof FinancialAnnualState)} showCalculator
                                            />
                                        ))}
                                    </div>

                                    <div className="border-t border-slate-200/60 my-6" />

                                    <SectionHeader icon={PiggyBank} color="amber" title="3. Tabungan & Investasi" desc="Uang yang berhasil disisihkan selama setahun." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                        {[
                                            { k: 'savingEducation', l: 'Dana Pendidikan', i: <PiggyBank className="w-4 h-4" /> },
                                            { k: 'savingRetirement', l: 'Dana Hari Tua / Pensiun', i: <TrendingUp className="w-4 h-4" /> },
                                            { k: 'savingPilgrimage', l: 'Dana Ibadah', i: <Sparkles className="w-4 h-4" /> },
                                            { k: 'savingHoliday', l: 'Dana Liburan', i: <Plane className="w-4 h-4" /> },
                                            { k: 'savingEmergency', l: 'Dana Darurat', i: <ShieldCheck className="w-4 h-4" /> },
                                            { k: 'savingOther', l: 'Dana Lainnya', i: <Wallet className="w-4 h-4" /> }
                                        ].map((item) => (
                                            <InputGroup
                                                key={item.k} label={item.l} value={num(data[item.k as keyof FinancialAnnualState])}
                                                onChange={(v) => handleLocalChange(item.k as keyof FinancialAnnualState, v)}
                                                icon={item.i} helpContent={FINANCIAL_HELP_DATA[item.k as keyof typeof FINANCIAL_HELP_DATA]}
                                                onMonthlyClick={() => setMonthlyHelperTarget(item.k as keyof FinancialAnnualState)} showCalculator
                                            />
                                        ))}
                                    </div>

                                    <div className="border-t border-slate-200/60 my-6" />

                                    <SectionHeader icon={ShoppingBag} color="slate" title="4. Biaya Hidup (Living Cost)" desc="Total konsumsi keluarga dalam setahun." />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                        {[
                                            { k: 'expenseFood', l: 'Makan / Dapur', i: <ShoppingBag className="w-4 h-4" /> },
                                            { k: 'expenseSchool', l: 'Uang Sekolah Anak', i: <User className="w-4 h-4" /> },
                                            { k: 'expenseTransport', l: 'Transportasi', i: <Car className="w-4 h-4" /> },
                                            { k: 'expenseCommunication', l: 'Listrik & Internet', i: <Phone className="w-4 h-4" /> },
                                            { k: 'expenseHelpers', l: 'Asisten RT / Driver', i: <Users className="w-4 h-4" /> },
                                            { k: 'expenseTax', l: 'Pajak & Retribusi', i: <Landmark className="w-4 h-4" /> },
                                            { k: 'expenseLifestyle', l: 'Gaya Hidup & Lainnya', i: <ShoppingBag className="w-4 h-4" /> }
                                        ].map((item) => (
                                            <InputGroup
                                                key={item.k} label={item.l} value={num(data[item.k as keyof FinancialAnnualState])}
                                                onChange={(v) => handleLocalChange(item.k as keyof FinancialAnnualState, v)}
                                                icon={item.i} helpContent={FINANCIAL_HELP_DATA[item.k as keyof typeof FINANCIAL_HELP_DATA]}
                                                onMonthlyClick={() => setMonthlyHelperTarget(item.k as keyof FinancialAnnualState)} showCalculator
                                            />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ==================================================
                            STEP 2: REVIEW REKAPITULASI (SIMETRIS & SEJAJAR)
                            ================================================== */}
                        {step === 2 && (
                            <motion.div key="step-2" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                                <div className="text-center mb-8 mt-4">
                                    <div className="w-20 h-20 bg-linear-to-br from-brand-100 to-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-white">
                                        <Activity className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Verifikasi Akhir</h3>
                                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed px-4">
                                        Pastikan rincian kalkulasi sistem di bawah ini sudah merepresentasikan realitas kondisi keuangan klien Anda.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-6">

                                    {/* CARD 1: NERACA (POSTUR KEKAYAAN) */}
                                    <div className="bg-white border border-slate-200 p-5 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
                                        <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-4 mb-6">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0"><Wallet className="w-6 h-6" /></div>
                                            <div>
                                                <h4 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Postur Neraca</h4>
                                                <p className="text-[10px] md:text-[11px] uppercase font-bold tracking-widest text-slate-400">Rincian Harta & Beban Utang</p>
                                            </div>
                                        </div>

                                        {/* Rincian Items */}
                                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mb-4">
                                            {/* Kiri: ASET */}
                                            <div className="space-y-2">
                                                <h5 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4" /> Distribusi Aset
                                                </h5>
                                                <ReviewRow label="Aset Likuid" value={num(data.assetCash)} />
                                                <ReviewRow label="Aset Personal" value={num(data.assetHome) + num(data.assetVehicle) + num(data.assetJewelry) + num(data.assetAntique) + num(data.assetPersonalOther)} />
                                                <ReviewRow label="Aset Investasi" value={totalAssets - num(data.assetCash) - (num(data.assetHome) + num(data.assetVehicle) + num(data.assetJewelry) + num(data.assetAntique) + num(data.assetPersonalOther))} />
                                            </div>

                                            {/* Kanan: UTANG */}
                                            <div className="space-y-2">
                                                <h5 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4" /> Distribusi Utang
                                                </h5>
                                                <ReviewRow label="Utang Konsumtif" value={num(data.debtKPR) + num(data.debtKPM) + num(data.debtCC) + num(data.debtCoop) + num(data.debtConsumptiveOther)} />
                                                <ReviewRow label="Utang Usaha" value={num(data.debtBusiness)} />
                                            </div>
                                        </div>

                                        {/* Total Section - Dikunci Susun Kolom di HP, Berjajar di Tablet */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 border-t border-slate-200 pt-5 mb-6">
                                            <div className="bg-emerald-50/50 p-2 md:p-3 rounded-xl border border-emerald-100/50 shadow-sm">
                                                <ReviewRow label="Total Aset" value={totalAssets} color="emerald" isTotal />
                                            </div>
                                            <div className="bg-rose-50/50 p-2 md:p-3 rounded-xl border border-rose-100/50 shadow-sm">
                                                <ReviewRow label="Total Utang" value={totalDebt} color="rose" isTotal />
                                            </div>
                                        </div>

                                        {/* Result Bottom Indicator */}
                                        <div className="border-t-2 border-dashed border-indigo-100 bg-indigo-50/50 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                            <div className="shrink-0">
                                                <p className="text-xs md:text-sm font-black text-indigo-500 uppercase tracking-widest">Kekayaan Bersih</p>
                                                <p className="text-[10px] md:text-xs text-indigo-600/70 font-bold mt-0.5">(Total Aset - Total Utang)</p>
                                            </div>
                                            <span className={cn("text-2xl sm:text-3xl md:text-4xl font-black wrap-break-word w-full sm:w-auto sm:text-right leading-none", netWorth >= 0 ? "text-indigo-700" : "text-rose-600")}>
                                                {formatRupiah(netWorth)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* CARD 2: ARUS KAS (POSTUR CASHFLOW) */}
                                    <div className="bg-white border border-slate-200 p-5 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
                                        <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-4 mb-6">
                                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0"><Banknote className="w-6 h-6" /></div>
                                            <div>
                                                <h4 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Postur Arus Kas</h4>
                                                <p className="text-[10px] md:text-[11px] uppercase font-bold tracking-widest text-slate-400">Rincian Pemasukan & Pengeluaran</p>
                                            </div>
                                        </div>

                                        {/* Rincian Items */}
                                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mb-4">
                                            {/* Kiri: PEMASUKAN */}
                                            <div className="space-y-2">
                                                <h5 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4" /> Sumber Pemasukan
                                                </h5>
                                                <ReviewRow label="Pendapatan Tetap" value={num(data.incomeFixed)} />
                                                <ReviewRow label="Pendapatan Variabel" value={num(data.incomeVariable)} />
                                            </div>

                                            {/* Kanan: PENGELUARAN */}
                                            <div className="space-y-2">
                                                <h5 className="text-xs font-black text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <ShoppingBag className="w-4 h-4" /> Pos Pengeluaran
                                                </h5>
                                                <ReviewRow label="Cicilan Utang" value={totalInstallmentsAnnual} />
                                                <ReviewRow label="Premi Asuransi" value={totalInsuranceAnnual} />
                                                <ReviewRow label="Tabungan & Investasi" value={totalSavingsAnnual} />
                                                <ReviewRow label="Biaya Hidup (Konsumsi)" value={totalLivingExpenseAnnual} />
                                            </div>
                                        </div>

                                        {/* Total Section - Dikunci Susun Kolom di HP, Berjajar di Tablet */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 border-t border-slate-200 pt-5 mb-6">
                                            <div className="bg-emerald-50/50 p-2 md:p-3 rounded-xl border border-emerald-100/50 shadow-sm">
                                                <ReviewRow label="Total Pemasukan" value={totalIncomeAnnual} color="emerald" isTotal />
                                            </div>
                                            <div className="bg-rose-50/50 p-2 md:p-3 rounded-xl border border-rose-100/50 shadow-sm">
                                                <ReviewRow label="Total Pengeluaran" value={totalExpenseAnnual} color="rose" isTotal />
                                            </div>
                                        </div>

                                        {/* Result Bottom Indicator */}
                                        <div className={cn("border-t-2 border-dashed rounded-2xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3", surplusDeficitAnnual >= 0 ? "border-emerald-100 bg-emerald-50/50" : "border-rose-100 bg-rose-50/50")}>
                                            <div className="shrink-0">
                                                <p className={cn("text-xs md:text-sm font-black uppercase tracking-widest", surplusDeficitAnnual >= 0 ? "text-emerald-600" : "text-rose-600")}>Surplus / Defisit</p>
                                                <p className={cn("text-[10px] md:text-xs font-bold mt-0.5", surplusDeficitAnnual >= 0 ? "text-emerald-600/70" : "text-rose-600/70")}>
                                                    (Total Pemasukan - Total Pengeluaran)
                                                </p>
                                            </div>
                                            <span className={cn("text-2xl sm:text-3xl md:text-4xl font-black wrap-break-word w-full sm:w-auto sm:text-right leading-none", surplusDeficitAnnual >= 0 ? "text-emerald-600" : "text-rose-600")}>
                                                {formatRupiah(surplusDeficitAnnual)}
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* ==================================================
                    IN-FLOW FOOTER ACTIONS (NAVIGATION)
                    ================================================== */}
                <div className="bg-slate-50/80 p-5 md:p-6 border-t border-slate-100 flex items-center justify-between rounded-b-3xl">
                    <Button
                        variant="outline"
                        onClick={step === 0 ? onBack : () => { window.scrollTo({ top: 0, behavior: "smooth" }); setStep(prev => prev - 1); }}
                        disabled={isLoading}
                        className="h-12 px-4 md:px-6 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-white active:scale-95 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 md:mr-2" />
                        <span className="hidden md:inline">{step === 0 ? "Kembali" : "Sebelumnya"}</span>
                    </Button>

                    {step < 2 ? (
                        <Button
                            onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setStep(prev => prev + 1); }}
                            className="h-12 px-6 md:px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                        >
                            Selanjutnya <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={() => onComplete(data)}
                            disabled={isLoading}
                            className="h-12 px-6 md:px-8 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-black shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menganalisa...</>
                            ) : (
                                <><Calculator className="w-5 h-5 mr-2" /> Diagnosa Sekarang</>
                            )}
                        </Button>
                    )}
                </div>

            </div>

            {/* ==================================================
                MODALS (GLASSMORPHISM)
                ================================================== */}
            <MonthlyHelperModal
                isOpen={!!monthlyHelperTarget}
                onClose={() => setMonthlyHelperTarget(null)}
                onApply={(val) => applyMonthlyToAnnual(val)}
                title="Kalkulator Auto-Tahunan"
            />
            {showDebtModal.show && (
                <div className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDebtModal({ show: false, target: null })} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2rem] p-6 md:p-8 shadow-2xl"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm border border-rose-100">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">
                                    Hitung Sisa {
                                        showDebtModal.target === 'debtKPR' ? 'KPR' :
                                            showDebtModal.target === 'debtKPM' ? 'KPM' :
                                                'Utang'
                                    }
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Hitung otomatis sisa pokok {
                                        showDebtModal.target === 'debtKPR' ? 'KPR (Rumah)' :
                                            showDebtModal.target === 'debtKPM' ? 'KPM (Kendaraan)' :
                                                'utang'
                                    } dari cicilan x tenor.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cicilan Per Bulan</label>
                                <InputGroupNoLabel autoFocus value={tempMonthly ? parseInt(tempMonthly.replace(/\./g, "")) : 0} onChange={(v: SetStateAction<string>) => setTempMonthly(v)} icon={<Banknote className="w-4 h-4 text-slate-400" />} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sisa Tenor (Bulan)</label>
                                <div className="relative">
                                    <Input type="number" inputMode="numeric" value={tempTenor} onChange={(e) => setTempTenor(e.target.value)} className="h-14 pl-4 rounded-xl font-black text-base md:text-lg bg-slate-50 border-slate-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 focus:bg-white pr-16 transition-all" placeholder="Contoh: 12" />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 uppercase">Bulan</span>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-slate-200" onClick={() => setShowDebtModal({ show: false, target: null })}>Batal</Button>
                                <Button className="flex-2 h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-lg shadow-rose-600/20" onClick={applyDebtCalculation}>Terapkan Utang</Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {showGoldModal && (
                <div className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowGoldModal(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2rem] p-6 md:p-8 shadow-2xl border border-slate-100"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Kalkulator Emas</h3>
                                <p className="text-xs text-slate-500 font-medium">Konversi otomatis gram ke rupiah.</p>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Harga Server Hari Ini</p>
                                    <p className="text-lg font-black text-slate-700">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(!isNaN(currentGoldPrice) && currentGoldPrice > 0 ? currentGoldPrice : 1350000)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Satuan</p>
                                    <p className="text-sm font-bold text-slate-500">Per Gram</p>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah Emas Anda</label>
                                <div className="relative group">
                                    <Input autoFocus type="text" inputMode="decimal" value={goldWeight} onChange={(e) => setGoldWeight(e.target.value)} className="h-14 pl-4 rounded-xl font-black text-base md:text-lg bg-white border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 pr-14 transition-all shadow-sm" placeholder="Misal: 5.5" />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-amber-600">GR</span>
                                </div>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex justify-between items-center">
                                <p className="text-[10px] font-black text-amber-600/70 uppercase">Estimasi Nilai Harta</p>
                                <p className="text-xl font-black text-amber-700">{formatRupiah(Math.round((parseFloat(goldWeight.replace(",", ".")) || 0) * (!isNaN(currentGoldPrice) && currentGoldPrice > 0 ? currentGoldPrice : 1350000)))}</p>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-slate-200" onClick={() => setShowGoldModal(false)}>Batal</Button>
                                <Button className="flex-2 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black shadow-lg shadow-amber-500/20" onClick={applyGoldCalculation} disabled={isNaN(currentGoldPrice) || currentGoldPrice <= 0}>Terapkan Aset</Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}