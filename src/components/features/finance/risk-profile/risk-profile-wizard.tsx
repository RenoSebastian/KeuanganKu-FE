"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    ClipboardList,
    FileText,
    ShieldCheck,
    Loader2,
    RefreshCcw,
    History
} from "lucide-react";

// Components
import { IdentityForm } from "./identity-form";
import { QuizSection } from "./quiz-section";
import { AnalysisResult } from "./analysis-result";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Types & Services
import {
    RiskProfilePayload,
    RiskProfileSimulationResult,
    RiskProfileAnswerItem
} from "@/lib/types/risk-profile";
import { riskProfileService } from "@/services/risk-profile.service";

// Hooks
import { useSimulationPersistence, SIMULATION_STORAGE_KEYS } from "@/hooks/use-simulation-persistence";

// Definisi Step Flow
type WizardStep = "IDENTITY" | "QUIZ" | "RESULT";

// Interface State Data untuk Persistence
interface ClientIdentity {
    name: string;
    dob: string; // YYYY-MM-DD
    phone?: string;
    job?: string;
    city?: string;
}

export function RiskProfileWizard() {
    // --- STATE MANAGEMENT ---
    const [currentStep, setCurrentStep] = useState<WizardStep>("IDENTITY");
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Data Input (Lifted State)
    const [clientData, setClientData] = useState<ClientIdentity | null>(null);
    const [answers, setAnswers] = useState<RiskProfileAnswerItem[]>([]);

    // Hasil Simulasi (Transient - tidak perlu dipersist karena bisa dihitung ulang)
    const [simulationResult, setSimulationResult] = useState<RiskProfileSimulationResult | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [mgcToken, setMgcToken] = useState<string | null>(null);

    // --- PERSISTENCE HOOK (SAFETY NET) ---
    // Step mapping: IDENTITY=0, QUIZ=1, RESULT=2
    const stepIndex = currentStep === "IDENTITY" ? 0 : currentStep === "QUIZ" ? 1 : 2;

    const {
        draftAvailable,
        restoreDraft,
        clearDraft,
        ignoreDraft,
        draftData
    } = useSimulationPersistence<ClientIdentity, RiskProfileAnswerItem[]>(
        SIMULATION_STORAGE_KEYS.RISK_PROFILE,
        clientData,
        answers,
        stepIndex
    );

    // --- HANDLERS: RESTORE ---
    const handleRestoreSession = () => {
        const draft = restoreDraft();
        if (draft) {
            if (draft.clientData) setClientData(draft.clientData);
            if (draft.inputData) setAnswers(draft.inputData);

            // Restore step logic
            if (draft.step === 1) setCurrentStep("QUIZ");
            // Jika step 2 (Result), kembalikan ke Quiz agar user hitung ulang (karena result tidak dipersist)
            else if (draft.step === 2) setCurrentStep("QUIZ");
            else setCurrentStep("IDENTITY");

            toast.success("Sesi sebelumnya berhasil dipulihkan.");
        }
    };

    // --- HANDLERS: FLOW ---

    const handleIdentitySubmit = (data: ClientIdentity) => {
        setClientData(data);
        setCurrentStep("QUIZ");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleQuizFinish = async (submittedAnswers: RiskProfileAnswerItem[]) => {
        if (!clientData) {
            toast.error("Data identitas klien hilang. Silakan mulai dari awal.");
            setCurrentStep("IDENTITY");
            return;
        }

        setAnswers(submittedAnswers); // Update state agar tersimpan di persistence
        setIsLoading(true);
        // toastId untuk update status loading
        const toastId = toast.loading("Menganalisis profil risiko klien...");

        const payload: RiskProfilePayload = {
            clientName: clientData.name,
            clientDob: clientData.dob,
            clientPhone: clientData.phone,
            clientJob: clientData.job,
            clientCity: clientData.city,
            answers: submittedAnswers,
        };

        try {
            // 1. Call Service (Stateless Simulation)
            const response = await riskProfileService.simulateRiskProfile(payload);

            // 2. Set State Result dari hasil decode token
            setSimulationResult(response.data);
            setPdfUrl(response.pdfUrl);
            setMgcToken(response.token);

            // 3. Pindah Halaman
            setCurrentStep("RESULT");
            toast.success("Analisis selesai! Grafik profil risiko siap.", { id: toastId });

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Gagal memproses simulasi.", { id: toastId });
        } finally {
            setIsLoading(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleDownloadAction = () => {
        if (pdfUrl && clientData) {
            // 1. Download PDF Report
            const link = document.createElement('a');
            link.href = pdfUrl;
            const cleanName = clientData.name.replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `RiskProfile_${cleanName}_${new Date().toISOString().split('T')[0]}.pdf`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            // 2. Optional: Download Token Backup (.mgc)
            if (mgcToken) {
                const blobMgc = new Blob([mgcToken], { type: 'text/plain' });
                const urlMgc = window.URL.createObjectURL(blobMgc);
                const linkMgc = document.createElement('a');
                linkMgc.href = urlMgc;
                linkMgc.setAttribute('download', filename.replace('.pdf', '.mgc'));
                document.body.appendChild(linkMgc);
                linkMgc.click();
                linkMgc.remove();
                toast.info("File backup (.mgc) juga diunduh.");
            }

            // 3. Clear persistence (Flow selesai)
            clearDraft();
        } else {
            toast.error("Dokumen belum siap diunduh.");
        }
    };

    const handleRetake = () => {
        // Mode "Trial & Error": Kembali ke Quiz tanpa reset data identitas
        setCurrentStep("QUIZ");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleResetFull = () => {
        if (confirm("Mulai sesi baru? Data saat ini akan dihapus.")) {
            setClientData(null);
            setAnswers([]);
            setSimulationResult(null);
            setPdfUrl(null);
            setMgcToken(null);
            clearDraft(); // Hapus storage
            setCurrentStep("IDENTITY");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // --- RENDER VIEW ---

    return (
        <div className="w-full py-4">

            {/* 1. SAFETY NET BANNER */}
            {draftAvailable && currentStep === "IDENTITY" && (
                <Alert className="mb-8 bg-blue-50 border-blue-200 text-blue-800 shadow-sm">
                    <History className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="font-bold text-blue-700">Sesi Belum Selesai Ditemukan</AlertTitle>
                    <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                        <div className="text-xs">
                            Ditemukan data klien <strong>{draftData?.clientData?.name}</strong> yang belum selesai diproses.
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="h-8 text-xs hover:bg-blue-100 hover:text-blue-800" onClick={ignoreDraft}>
                                Abaikan
                            </Button>
                            <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={handleRestoreSession}>
                                Lanjutkan Sesi
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* 2. STEPPER VISUAL */}
            <div className="max-w-md mx-auto mb-12">
                <div className="flex items-center justify-between relative">
                    <StepItem
                        active={currentStep === "IDENTITY"}
                        done={currentStep !== "IDENTITY"}
                        icon={<ClipboardList size={20} />}
                        label="Data Klien"
                    />
                    <div className={`flex-1 h-0.5 mx-4 transition-colors duration-500 ${currentStep !== "IDENTITY" ? "bg-blue-600" : "bg-slate-200"}`} />
                    <StepItem
                        active={currentStep === "QUIZ"}
                        done={currentStep === "RESULT"}
                        icon={<FileText size={20} />}
                        label="Kuesioner"
                    />
                    <div className={`flex-1 h-0.5 mx-4 transition-colors duration-500 ${currentStep === "RESULT" ? "bg-blue-600" : "bg-slate-200"}`} />
                    <StepItem
                        active={currentStep === "RESULT"}
                        done={false}
                        icon={<ShieldCheck size={20} />}
                        label="Hasil Analisa"
                    />
                </div>
            </div>

            {/* 3. MAIN CONTENT (ANIMATED TRANSITION) */}
            <div className="min-h-125 relative">
                <AnimatePresence mode="wait">

                    {currentStep === "IDENTITY" && (
                        <motion.div
                            key="identity"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            <IdentityForm
                                initialData={clientData || undefined}
                                onSubmit={handleIdentitySubmit}
                            />
                        </motion.div>
                    )}

                    {currentStep === "QUIZ" && (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Header Info Klien Kecil */}
                            <div className="mb-6 flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="text-sm">
                                    <span className="text-slate-500 mr-2">Klien:</span>
                                    <span className="font-bold text-slate-700">{clientData?.name}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setCurrentStep("IDENTITY")} className="h-6 text-xs text-slate-400 hover:text-slate-600">
                                    Edit Data
                                </Button>
                            </div>

                            <QuizSection
                                initialAnswers={answers}
                                onFinish={handleQuizFinish}
                                isLoading={isLoading}
                            />
                        </motion.div>
                    )}

                    {currentStep === "RESULT" && simulationResult && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <AnalysisResult
                                data={simulationResult}
                                onDownloadPdf={handleDownloadAction}
                                onRetake={handleRetake}
                                onReset={handleResetFull}
                                isDownloading={isDownloading}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 4. LOADING OVERLAY */}
            {isLoading && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-2xl border border-slate-100">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-slate-800 text-lg">Menganalisis Profil</h3>
                            <p className="text-slate-500 text-sm">Mohon tunggu sebentar...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Sub-component untuk visualisasi langkah (Steppers)
 */
function StepItem({ active, done, icon, label }: { active: boolean; done: boolean; icon: any; label: string }) {
    return (
        <div className="flex flex-col items-center gap-3 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${active
                ? "bg-blue-600 text-white shadow-blue-200 scale-110 ring-4 ring-blue-50"
                : done
                    ? "bg-emerald-500 text-white shadow-emerald-200"
                    : "bg-white text-slate-300 border border-slate-200"
                }`}>
                {done ? <ShieldCheck size={20} /> : icon}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest text-center min-w-20 transition-colors duration-300 ${active ? "text-blue-700" : done ? "text-emerald-600" : "text-slate-400"
                }`}>
                {label}
            </span>
        </div>
    );
}