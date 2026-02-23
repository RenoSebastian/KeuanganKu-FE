"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence, Variants } from "framer-motion"; // Tambahkan import Variants
import {
    CheckCircle2,
    User, Wallet, Activity, FileSearch, Upload, Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";

// Imports from Lib/Services
import {
    CheckupSimulationResponse,
    FinancialFormState
} from "@/lib/types/financial-checkup";

import { financialService } from "@/services/financial.service";

// Imports Sub-Components
import { ClientIdentityForm } from "./checkup/client-identity-form";
import { CheckupResult } from "./checkup-result";
import { FinancialInputSection } from "./financial-input-section";

// Hooks
import { useSimulationPersistence, SIMULATION_STORAGE_KEYS } from "@/hooks/use-simulation-persistence";
import { cn } from "@/lib/utils";

// ============================================================================
// CONSTANTS & INITIAL STATE
// ============================================================================

const INITIAL_FINANCIAL_STATE: FinancialFormState = {
    assetCash: 0, assetHome: 0, assetVehicle: 0, assetJewelry: 0, assetAntique: 0, assetPersonalOther: 0,
    assetInvHome: 0, assetInvVehicle: 0, assetGold: 0, assetInvAntique: 0,
    assetStocks: 0, assetMutualFund: 0, assetBonds: 0, assetDeposit: 0, assetInvOther: 0,
    debtKPR: 0, debtKPM: 0, debtCC: 0, debtCoop: 0, debtConsumptiveOther: 0, debtBusiness: 0,
    incomeFixed: 0, incomeVariable: 0,
    installmentKPR: 0, installmentKPM: 0, installmentCC: 0, installmentCoop: 0, installmentConsumptiveOther: 0, installmentBusiness: 0,
    insuranceLife: 0, insuranceHealth: 0, insuranceHome: 0, insuranceVehicle: 0, insuranceBPJS: 0, insuranceOther: 0,
    savingEducation: 0, savingRetirement: 0, savingPilgrimage: 0, savingHoliday: 0, savingEmergency: 0, savingOther: 0,
    expenseFood: 0, expenseSchool: 0, expenseTransport: 0, expenseCommunication: 0, expenseHelpers: 0, expenseTax: 0, expenseLifestyle: 0,
};

type WizardStep = "IDENTITY" | "FINANCIAL" | "RESULT";

// Pemetaan Step untuk UI Logic
const STEP_MAP: Record<WizardStep, { id: number, label: string, icon: any }> = {
    IDENTITY: { id: 1, label: "Identitas", icon: User },
    FINANCIAL: { id: 2, label: "Keuangan", icon: Wallet },
    RESULT: { id: 3, label: "Analisa", icon: Activity }
};

// ============================================================================
// MAIN SMART CONTROLLER (WIZARD)
// ============================================================================

// [FIX 1] DEFINISI PROPS YANG KONSISTEN DENGAN PAGE.TSX
export interface CheckupWizardProps {
    onComplete?: (data: any) => Promise<void> | void; // Dibuat opsional agar kompatibel dengan pemanggilan manapun
    onBack?: () => void;
    isLoading?: boolean;
}

export function CheckupWizard({ onComplete, onBack, isLoading = false }: CheckupWizardProps) {
    // --- STATE MANAGEMENT ---
    const [currentStep, setCurrentStep] = useState<WizardStep>("IDENTITY");
    // Internal Loading State untuk proses yang tidak melibatkan parent (seperti import file)
    const [internalLoading, setInternalLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [clientData, setClientData] = useState<any | null>(null);
    const [financialRecord, setFinancialRecord] = useState<FinancialFormState>(INITIAL_FINANCIAL_STATE);
    const [simulationData, setSimulationData] = useState<CheckupSimulationResponse | null>(null);

    // Boolean komposit untuk status loading (menggabungkan parent dan internal)
    const isProcessing = isLoading || internalLoading;

    // --- FULL PERSISTENCE INTEGRATION ---
    const { isHydrated, clearStorage } = useSimulationPersistence<
        any,
        FinancialFormState,
        CheckupSimulationResponse
    >(
        SIMULATION_STORAGE_KEYS.CHECKUP,
        clientData,
        financialRecord,
        currentStep === "IDENTITY" ? 0 : currentStep === "FINANCIAL" ? 1 : 2,
        simulationData,
        null,
        null,
        (restoredClient, restoredInput, restoredStep, restoredResult) => {
            if (restoredClient) setClientData(restoredClient);
            if (restoredInput) setFinancialRecord(restoredInput);
            if (restoredResult) setSimulationData(restoredResult);

            if (restoredStep === 2 && restoredResult) setCurrentStep("RESULT");
            else if (restoredStep === 1 && restoredClient) setCurrentStep("FINANCIAL");
            else setCurrentStep("IDENTITY");
        }
    );

    // --- ACTION HANDLERS ---
    const handleFinancialUpdate = (field: keyof FinancialFormState, value: number) => {
        setFinancialRecord(prev => ({ ...prev, [field]: value }));
    };

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".mgc")) {
            toast.error("Format tidak valid", { description: "Harap gunakan file .mgc" });
            return;
        }

        clearStorage();
        setInternalLoading(true); // Gunakan internal loading
        const toastId = toast.loading("Dekripsi Token MGC...", { description: "Mengekstrak profil klien..." });

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const tokenString = event.target?.result as string;
                try {
                    const decoded = await financialService.decodeSimulationToken(tokenString);

                    if (decoded.client) setClientData(decoded.client);
                    if (decoded.financial) setFinancialRecord(decoded.financial);

                    const standardizedData: CheckupSimulationResponse = {
                        data: decoded,
                        mgcToken: tokenString,
                        filename: file.name,
                        pdfBuffer: undefined
                    };

                    setSimulationData(standardizedData);
                    setCurrentStep("RESULT");
                    toast.success("Import Berhasil!", { id: toastId, description: "Data siap dianalisa ulang." });
                } catch (err: any) {
                    toast.error("Dekripsi Gagal", { id: toastId, description: "Token MGC rusak atau tidak valid." });
                } finally {
                    setInternalLoading(false);
                }
            };
            reader.readAsText(file);
        } catch (error) {
            setInternalLoading(false);
            toast.error("Sistem gagal membaca file fisik.");
        }
        if (e.target) e.target.value = "";
    };

    const handleReset = () => {
        if (confirm("Mulai sesi baru? Semua input saat ini akan dihapus permanen.")) {
            clearStorage();
            setClientData(null);
            setFinancialRecord(INITIAL_FINANCIAL_STATE);
            setSimulationData(null);
            setCurrentStep("IDENTITY");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const onIdentitySubmit = (data: any) => {
        setClientData(data);
        setCurrentStep("FINANCIAL");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // [FIX] Mengintegrasikan properti onComplete dari Parent (page.tsx)
    const onFinancialSubmit = async () => {
        if (!clientData) {
            toast.error("Integritas Data Hilang", { description: "Profil klien tidak ditemukan. Harap isi identitas." });
            setCurrentStep("IDENTITY");
            return;
        }

        const payload = { ...financialRecord, ...clientData };

        // Prioritaskan onComplete dari parent (legacy support/controller terpisah)
        if (onComplete) {
            await onComplete(payload);
            // Catatan: Transisi ke RESULT dan penyimpanan data hasil ditangani oleh parent
            return;
        }

        // --- Logika Fallback Jika Tidak Ada Controller Parent ---
        setInternalLoading(true);
        const toastId = toast.loading("Memproses Kalkulasi...", { description: "Menganalisis matriks kesehatan finansial..." });

        try {
            const response = await financialService.simulateAgentCheckup(payload);

            setSimulationData(response);
            setCurrentStep("RESULT");
            toast.success("Analisis Selesai", { id: toastId, description: "Laporan rasio kesehatan siap dicetak." });
        } catch (error: any) {
            const message = error.response?.data?.message || "Gagal memproses kalkulasi mesin.";
            toast.error(Array.isArray(message) ? message[0] : message, { id: toastId });
        } finally {
            setInternalLoading(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const getInitialIdentityData = () => {
        if (!clientData) return undefined;
        return clientData.client ? { ...clientData.client, spouse: clientData.spouse } : clientData;
    };

    // [FIX 2] MENGGUNAKAN TIPE VARIANTS DARI FRAMER MOTION
    const pageVariants: Variants = {
        initial: { opacity: 0, y: 20, scale: 0.98 },
        // Menghapus asersi string untuk type: "spring" yang menyebabkan bentrok tipe
        animate: { opacity: 1, y: 0, scale: 1, transition: { stiffness: 300, damping: 25 } },
        exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }
    };

    return (
        <div className="w-full flex flex-col gap-6 md:gap-8 pb-10">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".mgc" className="hidden" />

            {/* ========================================================
                1. FLOATING DYNAMIC ISLAND STEPPER
                ======================================================== */}
            <div className="sticky top-16 md:top-20 z-30 mx-auto w-full max-w-sm">
                <div className="bg-white/80 backdrop-blur-2xl rounded-full p-1.5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] border border-white/40 flex items-center justify-between relative overflow-hidden">

                    {/* Animated Active Background Pill */}
                    <div
                        className="absolute top-1.5 bottom-1.5 rounded-full bg-slate-900 transition-all duration-500"
                        style={{
                            width: 'calc(33.33% - 4px)',
                            left: currentStep === "IDENTITY" ? '4px' : currentStep === "FINANCIAL" ? 'calc(33.33% + 2px)' : 'calc(66.66%)'
                        }}
                    />

                    {/* Step Items */}
                    {(Object.keys(STEP_MAP) as WizardStep[]).map((stepKey) => {
                        const step = STEP_MAP[stepKey];
                        const isActive = currentStep === stepKey;
                        const isDone = STEP_MAP[currentStep].id > step.id;
                        const Icon = step.icon;

                        return (
                            <div key={stepKey} className="relative z-10 flex-1 flex items-center justify-center py-2.5">
                                <div className={cn(
                                    "flex items-center gap-2 transition-colors duration-300",
                                    isActive ? "text-white" : isDone ? "text-emerald-500" : "text-slate-400"
                                )}>
                                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                    <span className="text-[11px] font-black uppercase tracking-wider hidden md:block">
                                        {step.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ========================================================
                2. MAIN CONTENT AREA (Framer Motion Wrapper)
                ======================================================== */}
            <div className="w-full relative min-h-[60vh]">
                <AnimatePresence mode="wait">

                    {/* STEP 1: IDENTITY & IMPORT */}
                    {currentStep === "IDENTITY" && (
                        <motion.div key="identity" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-6">

                            {/* Glassmorphism Pro Tool Import Banner */}
                            {/* [FIX 3] Mengganti bg-gradient-to-br menjadi bg-linear-to-br sesuai rekomendasi linter */}
                            <div className="group relative overflow-hidden bg-linear-to-br from-indigo-600 via-blue-600 to-indigo-800 rounded-[1.5rem] p-5 shadow-xl shadow-indigo-900/20 border border-indigo-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/20 blur-3xl rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700" />

                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20 shadow-inner">
                                        <FileSearch className="w-6 h-6 text-cyan-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                            Restore Sesi Klien <Sparkles className="w-3 h-3 text-yellow-300" />
                                        </h4>
                                        <p className="text-indigo-100/80 text-[11px] font-medium mt-0.5">
                                            Lanjutkan simulasi dari file <code className="bg-indigo-900/50 px-1 py-0.5 rounded text-cyan-200">.mgc</code>
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleImportClick}
                                    disabled={isProcessing}
                                    className="w-full md:w-auto relative z-10 bg-white text-indigo-700 hover:bg-indigo-50 hover:scale-[1.02] active:scale-95 transition-all rounded-xl h-11 px-5 shadow-lg font-black tracking-wide text-xs"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import File
                                </Button>
                            </div>

                            {/* Form Render */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-1">
                                <ClientIdentityForm
                                    initialData={getInitialIdentityData()}
                                    onComplete={onIdentitySubmit}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: FINANCIAL DATA */}
                    {currentStep === "FINANCIAL" && (
                        <motion.div key="financial" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-1 overflow-hidden">
                                <FinancialInputSection
                                    data={financialRecord}
                                    onUpdate={handleFinancialUpdate}
                                    onComplete={onFinancialSubmit}
                                    onBack={() => setCurrentStep("IDENTITY")}
                                    isLoading={isProcessing} // Menyampaikan status loading ke form anak
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: RESULT DASHBOARD (Jika tidak ditangani parent) */}
                    {currentStep === "RESULT" && simulationData && !onComplete && (
                        <motion.div key="result" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                            <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-900/5 border border-slate-100 overflow-hidden">
                                <CheckupResult
                                    data={simulationData}
                                    mode="AGENT_SIMULATION"
                                    onReset={handleReset}
                                />
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}