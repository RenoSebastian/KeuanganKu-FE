"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
import { generateSimulationFilename } from "@/lib/formatters";

// Imports Sub-Components
import { ClientIdentityForm } from "./client-identity-form";
import { CheckupResult } from "./checkup-result";
import { FinancialInputSection } from "./financial-input-section";

// Hooks & Utils
import { useSimulationPersistence, SIMULATION_STORAGE_KEYS } from "@/hooks/use-simulation-persistence";
import { cn } from "@/lib/utils";
import { executeUniversalExport } from "@/utils/universal-export-engine";

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

const STEP_MAP: Record<WizardStep, { id: number, label: string, icon: any }> = {
    IDENTITY: { id: 1, label: "Identitas", icon: User },
    FINANCIAL: { id: 2, label: "Keuangan", icon: Wallet },
    RESULT: { id: 3, label: "Analisa", icon: Activity }
};

// ============================================================================
// MAIN SMART CONTROLLER (WIZARD)
// ============================================================================

export interface CheckupWizardProps {
    onComplete?: (data: any) => Promise<void> | void;
    onBack?: () => void;
    isLoading?: boolean;
}

export function CheckupWizard({ onComplete, onBack, isLoading = false }: CheckupWizardProps) {
    const [currentStep, setCurrentStep] = useState<WizardStep>("IDENTITY");
    const [internalLoading, setInternalLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [clientData, setClientData] = useState<any | null>(null);
    const [financialRecord, setFinancialRecord] = useState<FinancialFormState>(INITIAL_FINANCIAL_STATE);
    const [simulationData, setSimulationData] = useState<CheckupSimulationResponse | null>(null);

    const [generatedFiles, setGeneratedFiles] = useState<{
        pdfBlob: Blob | null;
        mgcBlob: Blob | null;
        filenameMgc: string | null;
        filenamePdf: string | null;
    } | null>(null);

    const isProcessing = isLoading || internalLoading;

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
        setInternalLoading(true);
        const toastId = toast.loading("Dekripsi Token MGC...", { description: "Mengekstrak profil klien..." });

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const tokenString = event.target?.result as string;
                try {
                    const decoded = await financialService.decodeSimulationToken(tokenString);

                    if (decoded.client) {
                        setClientData({
                            client: decoded.client,
                            spouse: decoded.spouse || undefined
                        });
                    }
                    if (decoded.financial) setFinancialRecord(decoded.financial);

                    const standardizedData: CheckupSimulationResponse = {
                        ...decoded,
                        data: decoded,
                        mgcToken: tokenString,
                        filename: file.name,
                    };

                    // Menyiapkan Memory Blob yang efisien untuk Export
                    const memoryMgcBlob = new Blob([tokenString], { type: 'text/plain' });

                    setGeneratedFiles({
                        pdfBlob: null,
                        mgcBlob: memoryMgcBlob,
                        filenameMgc: file.name,
                        filenamePdf: file.name.replace('.mgc', '.pdf')
                    });

                    setSimulationData(standardizedData);
                    setCurrentStep("FINANCIAL");
                    toast.success("Import Berhasil!", { id: toastId, description: "Klik 'Diagnosa Sekarang' untuk memuat laporan." });
                } catch (err: any) {
                    const beMessage = err.response?.data?.message;
                    let finalMessage = "Token MGC rusak atau tidak valid.";
                    if (Array.isArray(beMessage)) finalMessage = beMessage[0];
                    else if (typeof beMessage === "string") finalMessage = beMessage;
                    toast.error("Dekripsi Gagal", { id: toastId, description: finalMessage });
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
            setGeneratedFiles(null);
            setCurrentStep("IDENTITY");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const onIdentitySubmit = (data: any) => {
        setClientData(data);
        setCurrentStep("FINANCIAL");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onFinancialSubmit = async (latestFinancialData?: FinancialFormState) => {
        if (!clientData) {
            toast.error("Integritas Data Hilang", { description: "Profil klien tidak ditemukan. Harap isi identitas." });
            setCurrentStep("IDENTITY");
            return;
        }

        const dataToSubmit = latestFinancialData || financialRecord;
        const sessionId = crypto.randomUUID();

        const payload = {
            ...dataToSubmit,
            ...clientData,
            sessionId: sessionId
        };

        if (onComplete) {
            await onComplete(payload);
            return;
        }

        setInternalLoading(true);
        const toastId = toast.loading("Memproses Kalkulasi...", { description: "Menganalisis matriks kesehatan finansial..." });

        try {
            const response = await financialService.simulateAgentCheckup(payload);

            const token = response.mgcToken;
            const pdfBase64 = response.pdfBase64;
            const filename = response.filename;
            const analysisData = response.analysisResult;

            if (!token) throw new Error("Server gagal mengembalikan Token MGC.");

            const byteCharacters = atob(pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            const memoryPdfBlob = new Blob([byteArray], { type: 'application/pdf' });
            // Gunakan text/plain agar iOS lebih ramah menerimanya
            const memoryMgcBlob = new Blob([token], { type: 'text/plain' });

            setSimulationData({
                mgcToken: token,
                filename: filename,
                data: {
                    client: clientData.client,
                    spouse: clientData.spouse,
                    financial: payload,
                    result: analysisData
                }
            } as any);

            setGeneratedFiles({
                pdfBlob: memoryPdfBlob,
                mgcBlob: memoryMgcBlob,
                filenameMgc: filename ? filename.replace('.pdf', '.mgc') : "Checkup.mgc",
                filenamePdf: filename || "Checkup.pdf"
            });

            setCurrentStep("RESULT");
            toast.success("Analisis Selesai", { id: toastId, description: "Laporan rasio kesehatan siap dicetak." });
        } catch (error: any) {
            let finalMessage = "Gagal memproses kalkulasi mesin.";
            if (!error.response) finalMessage = "Koneksi ke peladen terputus. Periksa jaringan Anda.";
            else {
                const beMessage = error.response?.data?.message;
                if (Array.isArray(beMessage)) finalMessage = beMessage[0];
                else if (typeof beMessage === "string") finalMessage = beMessage;
            }
            toast.error("Kalkulasi Gagal", { id: toastId, description: finalMessage });
        } finally {
            setInternalLoading(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleDownloadFile = async (type: 'PDF' | 'MGC') => {
        if (!generatedFiles) {
            toast.error("File belum siap diunduh.");
            return;
        }

        try {
            if (type === 'PDF' && generatedFiles.pdfBlob && generatedFiles.filenamePdf) {
                const exportStatus = await executeUniversalExport(generatedFiles.pdfBlob, generatedFiles.filenamePdf);
                if (exportStatus === 'SHARED') toast.success("Dokumen PDF siap dibagikan.");
                else if (exportStatus === 'DOWNLOADED') toast.success("Dokumen PDF berhasil diunduh.");
            } else if (type === 'MGC' && generatedFiles.mgcBlob && generatedFiles.filenameMgc) {
                const exportStatus = await executeUniversalExport(generatedFiles.mgcBlob, generatedFiles.filenameMgc);
                if (exportStatus === 'SHARED') toast.success("File Backup (.mgc) siap dibagikan.");
                else if (exportStatus === 'DOWNLOADED') toast.success("File Backup (.mgc) berhasil disimpan.");
            }
        } catch (error) {
            console.error(`Export Error (${type}):`, error);
            toast.error(`Gagal memproses file ${type}.`);
        }
    };

    const getInitialIdentityData = () => {
        if (!clientData) return undefined;
        return clientData.client ? { ...clientData.client, spouse: clientData.spouse } : clientData;
    };

    const pageVariants: Variants = {
        initial: { opacity: 0, y: 20, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { stiffness: 300, damping: 25 } },
        exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }
    };

    return (
        <div className="w-full flex flex-col gap-6 md:gap-8 pb-10">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".mgc" className="hidden" />

            <div className="sticky top-16 md:top-20 z-30 mx-auto w-full max-w-sm">
                <div className="bg-white/80 backdrop-blur-2xl rounded-full p-1.5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] border border-white/40 flex items-center justify-between relative overflow-hidden">
                    <div
                        className="absolute top-1.5 bottom-1.5 rounded-full bg-slate-900 transition-all duration-500"
                        style={{
                            width: 'calc(33.33% - 4px)',
                            left: currentStep === "IDENTITY" ? '4px' : currentStep === "FINANCIAL" ? 'calc(33.33% + 2px)' : 'calc(66.66%)'
                        }}
                    />

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

            <div className="w-full relative min-h-[60vh]">
                <AnimatePresence mode="wait">
                    {currentStep === "IDENTITY" && (
                        <motion.div key="identity" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-6">

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

                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-1">
                                <ClientIdentityForm
                                    initialData={getInitialIdentityData()}
                                    onComplete={onIdentitySubmit}
                                />
                            </div>
                        </motion.div>
                    )}

                    {currentStep === "FINANCIAL" && (
                        <motion.div key="financial" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-1 overflow-hidden">
                                <FinancialInputSection
                                    data={financialRecord}
                                    onUpdate={handleFinancialUpdate}
                                    onComplete={(latestData?: FinancialFormState) => {
                                        onFinancialSubmit(latestData);
                                    }}
                                    onBack={() => setCurrentStep("IDENTITY")}
                                    isLoading={isProcessing}
                                />
                            </div>
                        </motion.div>
                    )}

                    {currentStep === "RESULT" && simulationData && !onComplete && (
                        <motion.div key="result" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                            <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-900/5 border border-slate-100 overflow-hidden">
                                <CheckupResult
                                    data={simulationData}
                                    generatedFiles={generatedFiles}
                                    mode="AGENT_SIMULATION"
                                    onReset={handleReset}
                                    onEditData={() => {
                                        setCurrentStep("FINANCIAL");
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    onDownloadFile={handleDownloadFile}
                                />
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}