"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    User, Wallet, Activity, FileSearch, Upload, Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";

// Imports from Lib/Services
import {
    SimulationClientProfile
} from "@/lib/types";

// Import Type Local
import {
    FinancialFormState,
    CheckupSimulationResult
} from "@/lib/types/financial-checkup";

import { financialService } from "@/services/financial.service";

// Imports Sub-Components
import { ClientIdentityForm } from "./checkup/client-identity-form";
import { CheckupResult } from "./checkup-result";
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
    const [clientData, setClientData] = useState<any | null>(null);
    const [financialRecord, setFinancialRecord] = useState<FinancialFormState>(INITIAL_FINANCIAL_STATE);
    const [simulationResult, setSimulationResult] = useState<CheckupSimulationResult | null>(null);

    // PDF & Token State
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [mgcToken, setMgcToken] = useState<string | null>(null);

    // --- FULL PERSISTENCE INTEGRATION ---
    const { isHydrated, clearStorage } = useSimulationPersistence<
        any,
        FinancialFormState,
        CheckupSimulationResult
    >(
        SIMULATION_STORAGE_KEYS.CHECKUP,
        clientData,
        financialRecord,
        currentStep === "IDENTITY" ? 0 : currentStep === "FINANCIAL" ? 1 : 2,
        simulationResult,
        pdfUrl,
        mgcToken,
        // Callback: Restore data from storage
        (restoredClient, restoredInput, restoredStep, restoredResult, restoredPdf, restoredToken) => {
            if (restoredClient) setClientData(restoredClient);
            if (restoredInput) setFinancialRecord(restoredInput);

            if (restoredResult) setSimulationResult(restoredResult);

            // [FIX DEAD BLOB] Jika URL adalah Blob (bukan https), buang karena pasti sudah expired setelah refresh
            if (restoredPdf && restoredPdf.startsWith('blob:')) {
                setPdfUrl(null);
            } else {
                setPdfUrl(restoredPdf);
            }

            if (restoredToken) setMgcToken(restoredToken);

            // Auto-Navigate Logic
            if (restoredStep === 2 && restoredResult) {
                setCurrentStep("RESULT");
            } else if (restoredStep === 1 && restoredClient) {
                setCurrentStep("FINANCIAL");
            } else {
                setCurrentStep("IDENTITY");
            }
        }
    );

    // --- HELPER: CLEAN PAYLOAD (FIX ID TIDAK DITEMUKAN) ---
    // Fungsi ini membuang 'id', 'createdAt', dll agar Backend tidak bingung mencari record lama
    const createCleanPayload = () => {
        // 1. Ratakan struktur client (menghindari double nesting)
        // 2. Hapus properti 'id' agar dianggap CREATE baru
        const cleanClient = { ...clientData };
        if (cleanClient.id) delete cleanClient.id;

        // Hapus id di level nested jika ada
        if (cleanClient.client && cleanClient.client.id) delete cleanClient.client.id;
        if (cleanClient.spouse && cleanClient.spouse.id) delete cleanClient.spouse.id;

        const cleanFinancial = { ...financialRecord };
        // @ts-ignore
        if (cleanFinancial.id) delete cleanFinancial.id;

        return {
            ...cleanFinancial,
            ...cleanClient, // Spread agar flat
        };
    };

    // --- ACTION HANDLERS ---
    const handleFinancialUpdate = (field: keyof FinancialFormState, value: number) => {
        setFinancialRecord(prev => ({ ...prev, [field]: value }));
    };

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".mgc")) {
            toast.error("Format file tidak valid. Gunakan file .mgc");
            return;
        }

        // Destructive Reset
        clearStorage();
        setClientData(null);
        setFinancialRecord(INITIAL_FINANCIAL_STATE);
        setSimulationResult(null);

        setIsLoading(true);
        const toastId = toast.loading("Membaca file simulasi...");

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const tokenString = event.target?.result as string;
                try {
                    const decoded = await financialService.decodeSimulationToken(tokenString);

                    if (decoded.client) setClientData(decoded.client);
                    if (decoded.financial) setFinancialRecord(decoded.financial);
                    if (decoded.result) setSimulationResult(decoded.result);

                    setMgcToken(tokenString);
                    setPdfUrl(null); // Reset PDF url saat import baru

                    setCurrentStep("RESULT");
                    toast.success("Data simulasi berhasil di-import.", { id: toastId });
                } catch (err: any) {
                    console.error(err);
                    toast.error(err.message || "Gagal men-decode file.", { id: toastId });
                } finally {
                    setIsLoading(false);
                }
            };
            reader.readAsText(file);
        } catch (error) {
            setIsLoading(false);
            toast.error("Gagal membaca file.");
        }
        if (e.target) e.target.value = "";
    };

    const handleReset = () => {
        if (confirm("Mulai sesi baru? Data saat ini akan dihapus permanen.")) {
            clearStorage();
            setClientData(null);
            setFinancialRecord(INITIAL_FINANCIAL_STATE);
            setSimulationResult(null);
            setPdfUrl(null);
            setMgcToken(null);

            setCurrentStep("IDENTITY");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const onIdentitySubmit = (data: any) => {
        setClientData(data);
        setCurrentStep("FINANCIAL");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onFinancialSubmit = async () => {
        if (!clientData) {
            toast.error("Data identitas hilang. Mohon kembali ke langkah awal.");
            setCurrentStep("IDENTITY");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Menganalisis kesehatan keuangan...");

        try {
            // [FIX] Gunakan payload bersih tanpa ID
            const payload = createCleanPayload();

            const response = await financialService.simulateAgentCheckup(payload);

            setSimulationResult(response.data.result);

            // Generate PDF Blob URL
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

    // ... kode lainnya ...

    // GANTI FUNCTION handleDownloadPdf DENGAN INI:
    const handleDownloadPdf = async () => {
        if (!clientData || !financialRecord) {
            toast.error("Data tidak lengkap.");
            return;
        }

        setIsDownloading(true);
        try {
            let targetPdfUrl = pdfUrl;
            let targetToken = mgcToken;

            // --- [CRITICAL FIX: SANITASI PAYLOAD] ---
            // Kita buat payload bersih KHUSUS untuk download.
            // Kita buang semua ID agar Backend menganggap ini data BARU (CREATE), bukan UPDATE.
            const cleanPayload = {
                ...financialRecord,
                ...clientData, // Spread agar flat
            } as any;

            // Hapus properti yang bisa bikin Backend bingung (Error: ID not found)
            delete cleanPayload.id;
            delete cleanPayload.simulationId;
            delete cleanPayload.createdAt;
            delete cleanPayload.updatedAt;

            // Bersihkan nested ID di object client (jika ada)
            if (cleanPayload.client && cleanPayload.client.id) delete cleanPayload.client.id;
            if (cleanPayload.spouse && cleanPayload.spouse.id) delete cleanPayload.spouse.id;
            // ----------------------------------------

            // Jika PDF URL belum ada atau invalid (blob), generate ulang pakai data bersih
            if (!targetPdfUrl || (targetPdfUrl && targetPdfUrl.startsWith('blob:'))) {

                // Panggil Service dengan PAYLOAD BERSIH
                const response = await financialService.simulateAgentCheckup(cleanPayload);

                const pdfBuffer = response.pdfBuffer;
                if (pdfBuffer && pdfBuffer.data) {
                    const bufferData = new Uint8Array(pdfBuffer.data);
                    const blob = new Blob([bufferData], { type: 'application/pdf' });
                    targetPdfUrl = URL.createObjectURL(blob);
                }
                targetToken = response.mgcToken;

                // Update state biar sinkron
                setPdfUrl(targetPdfUrl);
                setMgcToken(targetToken);
            }

            if (targetPdfUrl) {
                // Ambil nama client dengan aman
                const clientName = clientData.client?.name || clientData.name || "Client";
                const cleanName = clientName.replace(/[^a-zA-Z0-9]/g, '_');
                const filename = `Financial_Checkup_${cleanName}_${new Date().toISOString().split('T')[0]}.pdf`;

                // Proses Download PDF
                const link = document.createElement('a');
                link.href = targetPdfUrl;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();

                // Proses Download MGC (Backup Data)
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
            } else {
                throw new Error("Gagal mendapatkan link download PDF.");
            }

        } catch (error: any) {
            console.error("Download Error:", error);
            const message = error.response?.data?.message;
            // Tampilkan pesan error yang lebih manusiawi
            if (message) {
                toast.error(Array.isArray(message) ? message[0] : message);
            } else {
                toast.error("Gagal generate dokumen. Data simulasi mungkin kadaluarsa, coba hitung ulang.");
            }
        } finally {
            setIsDownloading(false);
        }
    };

    // Helper untuk menyiapkan data ke form agar saat BACK tidak kosong
    const getInitialIdentityData = () => {
        if (!clientData) return undefined;
        if ('client' in clientData) {
            return {
                ...clientData.client,
                spouse: clientData.spouse
            };
        }
        return clientData;
    };

    return (
        <div className="w-full py-4">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".mgc" className="hidden" />

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
                                initialData={getInitialIdentityData()}
                                onComplete={onIdentitySubmit}
                            />
                        </motion.div>
                    )}

                    {/* STEP 2: FINANCIAL DATA INPUT */}
                    {currentStep === "FINANCIAL" && (
                        <motion.div key="financial" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
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
                            <CheckupResult
                                data={{
                                    result: simulationResult as any,
                                    financial: financialRecord as any,
                                    client: clientData ? (clientData.client || clientData) : {}, // Fallback yang lebih aman
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