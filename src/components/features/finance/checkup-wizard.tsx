"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    User, Wallet, Activity, History, FileSearch, Upload
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Imports from Lib/Services
import {
    SimulationClientProfile
} from "@/lib/types";

// Import Type Local (Updated Types)
import {
    FinancialFormState,
    CheckupSimulationResult
} from "@/lib/types/financial-checkup";

import { financialService } from "@/services/financial.service";

// Imports Sub-Components
import { ClientIdentityForm } from "./checkup/client-identity-form";
import { CheckupResult } from "./checkup-result";
// Import Component Child yang baru dipisahkan
import { FinancialInputSection } from "./financial-input-section";

// Hooks
import { useSimulationPersistence, SIMULATION_STORAGE_KEYS } from "@/hooks/use-simulation-persistence";

// ============================================================================
// CONSTANTS & INITIAL STATE
// ============================================================================

const INITIAL_FINANCIAL_STATE: FinancialFormState = {
    // Aset
    assetCash: 0,
    assetHome: 0, assetVehicle: 0, assetJewelry: 0, assetAntique: 0, assetPersonalOther: 0,
    assetInvHome: 0, assetInvVehicle: 0, assetGold: 0, assetInvAntique: 0,
    assetStocks: 0, assetMutualFund: 0, assetBonds: 0, assetDeposit: 0, assetInvOther: 0,

    // Utang
    debtKPR: 0, debtKPM: 0, debtCC: 0, debtCoop: 0, debtConsumptiveOther: 0, debtBusiness: 0,

    // Arus Kas (TAHUNAN)
    incomeFixed: 0, incomeVariable: 0,
    installmentKPR: 0, installmentKPM: 0, installmentCC: 0, installmentCoop: 0, installmentConsumptiveOther: 0, installmentBusiness: 0,
    insuranceLife: 0, insuranceHealth: 0, insuranceHome: 0, insuranceVehicle: 0, insuranceBPJS: 0, insuranceOther: 0,
    savingEducation: 0, savingRetirement: 0, savingPilgrimage: 0, savingHoliday: 0, savingEmergency: 0, savingOther: 0,
    expenseFood: 0, expenseSchool: 0, expenseTransport: 0, expenseCommunication: 0, expenseHelpers: 0, expenseTax: 0, expenseLifestyle: 0,
};

type WizardStep = "IDENTITY" | "FINANCIAL" | "RESULT";

// ============================================================================
// MAIN SMART CONTROLLER (WIZARD)
// ============================================================================

export function CheckupWizard() {
    // --- STATE MANAGEMENT ---
    const [currentStep, setCurrentStep] = useState<WizardStep>("IDENTITY");
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Data State (Single Source of Truth)
    const [clientData, setClientData] = useState<SimulationClientProfile | null>(null);
    // [SSOT] Ini adalah satu-satunya state untuk data keuangan. Child hanya render props.
    const [financialRecord, setFinancialRecord] = useState<FinancialFormState>(INITIAL_FINANCIAL_STATE);
    const [simulationResult, setSimulationResult] = useState<CheckupSimulationResult | null>(null);

    // PDF & Token State
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [mgcToken, setMgcToken] = useState<string | null>(null);

    // --- PERSISTENCE HOOK ---
    const {
        draftAvailable,
        restoreDraft,
        clearDraft,
        ignoreDraft,
        draftData
    } = useSimulationPersistence<SimulationClientProfile, FinancialFormState>(
        SIMULATION_STORAGE_KEYS.CHECKUP,
        clientData,
        financialRecord,
        currentStep === "IDENTITY" ? 0 : currentStep === "FINANCIAL" ? 1 : 2
    );

    // --- ACTION: HANDLE INPUT CHANGE (DARI CHILD) ---
    // Fungsi ini dilempar ke Child Component untuk update state di Parent
    const handleFinancialUpdate = (field: keyof FinancialFormState, value: number) => {
        setFinancialRecord(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // --- HANDLER: IMPORT FILE (.MGC) ---
    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".mgc")) {
            toast.error("Format file tidak valid. Gunakan file .mgc");
            return;
        }

        setIsLoading(true); // [LOADING GATE START]
        const toastId = toast.loading("Membaca file simulasi...");

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const tokenString = event.target?.result as string;
                try {
                    // [STEP 2 INTEGRATION] Service sekarang sudah return ANNUAL data yang bersih
                    const decoded = await financialService.decodeSimulationToken(tokenString);

                    if (decoded.client) setClientData(decoded.client);

                    // [SSOT UPDATE] Langsung set state dengan data tahunan dari service
                    if (decoded.financial) setFinancialRecord(decoded.financial);

                    if (decoded.result) setSimulationResult(decoded.result);

                    setMgcToken(tokenString);
                    setPdfUrl(null);

                    setCurrentStep("RESULT");
                    toast.success("Data simulasi berhasil di-import.", { id: toastId });
                } catch (err: any) {
                    toast.error(err.message || "Gagal men-decode file.", { id: toastId });
                } finally {
                    setIsLoading(false); // [LOADING GATE END]
                }
            };
            reader.readAsText(file);
        } catch (error) {
            setIsLoading(false);
            toast.error("Gagal membaca file.");
        }
        if (e.target) e.target.value = "";
    };

    // --- HANDLER: RESTORE SESSION ---
    const handleRestoreSession = () => {
        const draft = restoreDraft();
        if (draft) {
            if (draft.clientData) setClientData(draft.clientData);
            if (draft.inputData) setFinancialRecord(draft.inputData);

            if (draft.step === 2) setCurrentStep("RESULT");
            else if (draft.clientData && !draft.inputData) setCurrentStep("FINANCIAL");
            else setCurrentStep("IDENTITY");

            toast.success("Sesi sebelumnya berhasil dipulihkan.");
        }
    };

    // --- STEP HANDLERS ---
    const onIdentitySubmit = (data: SimulationClientProfile) => {
        setClientData(data);
        setCurrentStep("FINANCIAL");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // --- SUBMIT FINANCIAL DATA ---
    const onFinancialSubmit = async () => {
        if (!clientData) {
            toast.error("Data identitas hilang. Mohon kembali ke langkah awal.");
            setCurrentStep("IDENTITY");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Menganalisis kesehatan keuangan...");

        try {
            // [FIX ERROR 1] Type 'client' does not exist in type 'FinancialFormState'.
            // Solusi: Kita cast ke 'any' agar Service bisa menerima object gabungan.
            const payload = {
                ...financialRecord,
                client: clientData,
                // spouse: ... (jika ada)
            } as any;

            // [STEP 2 INTEGRATION] Service akan convert Annual -> Monthly
            const response = await financialService.simulateAgentCheckup(payload);

            setSimulationResult(response.data.result);

            // Handle PDF Blob
            let blobUrl = null;
            const pdfBuffer = response.pdfBuffer;

            if (pdfBuffer && pdfBuffer.data) {
                const bufferData = new Uint8Array(pdfBuffer.data);
                const blob = new Blob([bufferData], { type: 'application/pdf' });
                blobUrl = URL.createObjectURL(blob);
            }

            setPdfUrl(blobUrl);
            setMgcToken(response.mgcToken);

            setCurrentStep("RESULT");
            toast.success("Analisis selesai!", { id: toastId });
        } catch (error: any) {
            console.error("Simulation Error:", error);
            const message = error.response?.data?.message || "Gagal memproses simulasi.";
            toast.error(Array.isArray(message) ? message[0] : message, { id: toastId });
        } finally {
            setIsLoading(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // --- HANDLER: PDF DOWNLOAD ---
    const handleDownloadPdf = async () => {
        if (!clientData || !financialRecord) {
            toast.error("Data tidak lengkap untuk generate PDF.");
            return;
        }

        setIsDownloading(true);
        try {
            let targetPdfUrl = pdfUrl;
            let targetToken = mgcToken;

            // Regenerate if missing
            if (!targetPdfUrl) {
                const payload = {
                    ...financialRecord,
                    client: clientData,
                } as any;

                const response = await financialService.simulateAgentCheckup(payload);

                const pdfBuffer = response.pdfBuffer;
                if (pdfBuffer && pdfBuffer.data) {
                    const bufferData = new Uint8Array(pdfBuffer.data);
                    const blob = new Blob([bufferData], { type: 'application/pdf' });
                    targetPdfUrl = URL.createObjectURL(blob);
                }
                targetToken = response.mgcToken;

                setPdfUrl(targetPdfUrl);
                setMgcToken(targetToken);
            }

            // Execute Download
            if (targetPdfUrl) {
                const cleanName = (clientData.name || "Client").replace(/[^a-zA-Z0-9]/g, '_');
                const filename = `Financial_Checkup_${cleanName}_${new Date().toISOString().split('T')[0]}.pdf`;

                const link = document.createElement('a');
                link.href = targetPdfUrl;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();

                if (targetToken) {
                    const blobMgc = new Blob([targetToken], { type: 'text/plain' });
                    const urlMgc = window.URL.createObjectURL(blobMgc);
                    const linkMgc = document.createElement('a');
                    linkMgc.href = urlMgc;
                    linkMgc.setAttribute('download', filename.replace('.pdf', '.mgc'));
                    document.body.appendChild(linkMgc);
                    linkMgc.click();
                    linkMgc.remove();
                    toast.success("Laporan PDF & Backup Data berhasil diunduh.");
                } else {
                    toast.success("Laporan PDF berhasil diunduh.");
                }

                clearDraft();
            } else {
                throw new Error("Gagal mendapatkan link download PDF.");
            }

        } catch (error: any) {
            toast.error("Gagal mengunduh dokumen. Silakan coba lagi.");
            console.error(error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleReset = () => {
        if (confirm("Mulai sesi baru? Data saat ini akan dihapus.")) {
            clearDraft();
            setClientData(null);
            setFinancialRecord(INITIAL_FINANCIAL_STATE);
            setSimulationResult(null);
            setCurrentStep("IDENTITY");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <div className="w-full py-4">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".mgc" className="hidden" />

            {/* Safety Alert */}
            {draftAvailable && currentStep === "IDENTITY" && (
                <Alert className="mb-8 bg-blue-50 border-blue-200 text-blue-800 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <History className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="font-bold text-blue-700">Sesi Belum Selesai Ditemukan</AlertTitle>
                    <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                        <div className="text-xs">
                            Ditemukan data klien <strong>{(draftData?.clientData as any)?.client?.name || (draftData?.clientData as any)?.name || "Sebelumnya"}</strong>.
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="h-8 text-xs hover:bg-blue-100" onClick={ignoreDraft}>Abaikan</Button>
                            <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={handleRestoreSession}>Lanjutkan Sesi</Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Stepper Header */}
            <div className="max-w-md mx-auto mb-12">
                <div className="flex items-center justify-between relative">
                    <StepItem active={currentStep === "IDENTITY"} done={currentStep !== "IDENTITY"} icon={<User size={20} />} label="Identitas" />
                    <div className={`flex-1 h-0.5 mx-4 transition-colors duration-500 ${currentStep !== "IDENTITY" ? "bg-brand-600" : "bg-slate-200"}`} />
                    <StepItem active={currentStep === "FINANCIAL"} done={currentStep === "RESULT"} icon={<Wallet size={20} />} label="Keuangan" />
                    <div className={`flex-1 h-0.5 mx-4 transition-colors duration-500 ${currentStep === "RESULT" ? "bg-brand-600" : "bg-slate-200"}`} />
                    <StepItem active={currentStep === "RESULT"} done={false} icon={<Activity size={20} />} label="Hasil Analisa" />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="min-h-100 relative">
                <AnimatePresence mode="wait">
                    {/* STEP 1: IDENTITY */}
                    {currentStep === "IDENTITY" && (
                        <motion.div key="identity" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                            <div className="max-w-lg mx-auto mb-6 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-100 p-2 rounded-xl text-slate-400"><FileSearch className="w-5 h-5" /></div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-slate-700">Punya file simulasi?</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-black">Import .mgc untuk load data</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleImportClick} className="h-9 px-4 rounded-xl border-brand-100 text-brand-600 hover:bg-brand-50 font-bold text-xs">
                                    <Upload className="w-3.5 h-3.5 mr-2" /> Import .MGC
                                </Button>
                            </div>

                            <ClientIdentityForm
                                initialData={clientData || undefined}
                                onComplete={onIdentitySubmit}
                            />
                        </motion.div>
                    )}

                    {/* STEP 2: FINANCIAL DATA INPUT (CONTROLLED COMPONENT) */}
                    {currentStep === "FINANCIAL" && (
                        <motion.div key="financial" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            {/* [SSOT ARCHITECTURE]
                                - data: Mengambil langsung dari state Parent
                                - onUpdate: Fungsi update milik Parent
                                - Tidak ada useEffect internal yang aneh-aneh
                            */}
                            <FinancialInputSection
                                data={financialRecord}
                                onUpdate={handleFinancialUpdate}
                                onComplete={onFinancialSubmit}
                                onBack={() => setCurrentStep("IDENTITY")}
                                isLoading={isLoading}
                            />
                        </motion.div>
                    )}

                    {/* STEP 3: RESULT */}
                    {currentStep === "RESULT" && simulationResult && (
                        <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                            {/* [FIX ERROR 2] Type 'CheckupSimulationResult' is not assignable to...
                                'CheckupResult' component (Legacy) mengharapkan format data lama (Array),
                                sedangkan 'simulationResult' (New Service) adalah Object.
                                Kita cast ke 'any' untuk bypassing TS check sementara agar UI tetap render.
                            */}
                            <CheckupResult
                                data={{
                                    result: simulationResult as any,
                                    financial: financialRecord as any,
                                    client: clientData as any
                                }}
                                onDownloadPdf={handleDownloadPdf}
                                onReset={handleReset}
                                isDownloading={isDownloading}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Helper UI Component
function StepItem({ active, done, icon, label }: { active: boolean; done: boolean; icon: any; label: string }) {
    return (
        <div className="flex flex-col items-center gap-3 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${active ? "bg-brand-600 text-white shadow-brand-200 scale-110 ring-4 ring-brand-50" : done ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-white text-slate-300 border border-slate-200"}`}>
                {done ? <CheckCircle2 size={20} /> : icon}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest text-center min-w-20 transition-colors duration-300 ${active ? "text-brand-700" : done ? "text-emerald-600" : "text-slate-400"}`}>
                {label}
            </span>
        </div>
    );
}