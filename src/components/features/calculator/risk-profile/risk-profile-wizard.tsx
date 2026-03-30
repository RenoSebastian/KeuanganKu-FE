"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    User,
    FileText,
    ShieldCheck,
    Loader2,
    RefreshCcw,
    History,
    Upload,
    FileSearch,
    CheckCircle2,
    Sparkles
} from "lucide-react";

// Components
import { IdentityForm } from "./identity-form";
import { QuizSection } from "./quiz-section";
import { AnalysisResult } from "./analysis-result";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Types & Services
import {
    RiskProfileAnswerItem,
    RiskProfileSimulationResult
} from "@/lib/types/risk-profile";
import { riskProfileService } from "@/services/risk-profile.service";

// Hooks
import { useSimulationPersistence, SIMULATION_STORAGE_KEYS } from "@/hooks/use-simulation-persistence";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/hooks/use-auth-user";

// [NEW] Import Formatter Terstandarisasi
import { generateSimulationFilename } from "@/lib/formatters";

// Definisi Step Flow
type WizardStep = "IDENTITY" | "QUIZ" | "RESULT";

// Pemetaan Step untuk UI Logic (Dynamic Island Stepper)
const STEP_MAP: Record<WizardStep, { id: number, label: string, icon: any }> = {
    IDENTITY: { id: 1, label: "Identitas", icon: User },
    QUIZ: { id: 2, label: "Kuesioner", icon: FileText },
    RESULT: { id: 3, label: "Analisa", icon: ShieldCheck }
};

interface ClientIdentity {
    name: string;
    dob: string;
    phone?: string;
    job?: string;
    city?: string;
}

export function RiskProfileWizard() {
    const { isPro, quota, refreshUser } = useAuthUser();
    const hasAccess = isPro || quota > 0;

    // --- STATE MANAGEMENT ---
    const [currentStep, setCurrentStep] = useState<WizardStep>("IDENTITY");
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Data Input
    const [clientData, setClientData] = useState<ClientIdentity | null>(null);
    const [answers, setAnswers] = useState<RiskProfileAnswerItem[]>([]);

    // Hasil Simulasi
    const [simulationResult, setSimulationResult] = useState<RiskProfileSimulationResult | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [mgcToken, setMgcToken] = useState<string | null>(null);

    // --- PERSISTENCE HOOK ---
    const stepIndex = currentStep === "IDENTITY" ? 0 : currentStep === "QUIZ" ? 1 : 2;

    const {
        draftAvailable,
        restoreDraft,
        clearStorage,
        ignoreDraft,
        draftData
    } = useSimulationPersistence<ClientIdentity, RiskProfileAnswerItem[]>(
        SIMULATION_STORAGE_KEYS.RISK_PROFILE,
        clientData,
        answers,
        stepIndex,
        simulationResult,
        pdfUrl,
        mgcToken
    );

    const clearDraft = clearStorage;
    const savedDraftName = (draftData as any)?.clientData?.name || "Klien";

    // --- HANDLERS: IMPORT .MGC ---
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        e.target.value = "";

        if (!file.name.endsWith(".mgc")) {
            toast.error("Format file tidak valid. Gunakan file .mgc");
            return;
        }

        setIsImporting(true);
        const toastId = toast.loading("Membaca file simulasi...", { description: "Mengekstrak token MGC..." });

        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const rawContent = event.target?.result as string;
                if (!rawContent) throw new Error("File kosong");

                const tokenString = rawContent.trim();
                const decoded = await riskProfileService.decodeSimulationToken(tokenString);

                if (decoded.meta?.module !== "RISK_PROFILE") {
                    throw new Error(`File ini adalah data ${decoded.meta?.module}, bukan Profil Risiko.`);
                }

                let normalizedAnswers: RiskProfileAnswerItem[] = [];
                const rawAnswers = decoded.financial?.answers;

                if (Array.isArray(rawAnswers)) {
                    normalizedAnswers = rawAnswers;
                } else if (typeof rawAnswers === 'object' && rawAnswers !== null) {
                    normalizedAnswers = Object.entries(rawAnswers).map(([key, val]) => ({
                        questionId: key,
                        value: Number(val)
                    }));
                }

                setClientData(decoded.client);
                setAnswers(normalizedAnswers);

                if (decoded.result) {
                    setSimulationResult(decoded);
                    setCurrentStep("RESULT");
                } else {
                    setCurrentStep("QUIZ");
                }

                setMgcToken(tokenString);
                setPdfUrl(null);

                toast.success("Import Berhasil!", { id: toastId, description: `Data simulasi ${decoded.client.name} berhasil dimuat.` });

            } catch (err: any) {
                console.error("Import Failed:", err);
                toast.error("Gagal Import", { id: toastId, description: err.message || "File rusak atau format tidak valid." });
            } finally {
                setIsImporting(false);
            }
        };

        reader.onerror = () => {
            toast.error("Gagal membaca file fisik.", { id: toastId });
            setIsImporting(false);
        };

        reader.readAsText(file);
    };

    const handleIdentitySubmit = (data: ClientIdentity) => {
        setClientData(data);
        setCurrentStep("QUIZ");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleQuizFinish = async (submittedAnswers: RiskProfileAnswerItem[]) => {
        if (!hasAccess) {
            toast.error("Kuota Habis", { description: "Upgrade ke PRO untuk melanjutkan." });
            return;
        }

        if (!clientData) {
            toast.error("Integritas Data Hilang", { description: "Data profil klien tidak ditemukan. Silakan mulai dari awal." });
            setCurrentStep("IDENTITY");
            return;
        }

        setAnswers(submittedAnswers);
        setIsLoading(true);
        const toastId = toast.loading("Menganalisis Profil...", { description: "Memproses matriks toleransi risiko..." });

        const sessionId = crypto.randomUUID();

        const payload = {
            sessionId: sessionId,
            clientName: clientData.name,
            clientDob: clientData.dob,
            clientPhone: clientData.phone || "",
            clientJob: clientData.job || "",
            clientCity: clientData.city || "",
            answers: submittedAnswers,
        };

        try {
            const response = await riskProfileService.simulateRiskProfile(payload);

            await refreshUser();
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('refresh_user_data'));

            setSimulationResult(response.data);
            setPdfUrl(response.pdfUrl);
            setMgcToken(response.token);

            setCurrentStep("RESULT");
            toast.success("Analisis Selesai", { id: toastId, description: "Laporan kesimpulan profil risiko siap dibaca." });
        } catch (error: any) {
            toast.error("Gagal Memproses", { id: toastId, description: error.message || "Terjadi kesalahan server." });
        } finally {
            setIsLoading(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleDownloadAction = async () => {
        if (!clientData || answers.length === 0) {
            toast.error("Data simulasi tidak lengkap.");
            return;
        }

        setIsDownloading(true);

        try {
            let targetPdfUrl = pdfUrl;
            let targetToken = mgcToken;

            if (!targetPdfUrl) {
                const sessionId = crypto.randomUUID();
                const payload = {
                    sessionId: sessionId,
                    clientName: clientData.name,
                    clientDob: clientData.dob,
                    clientPhone: clientData.phone || "",
                    clientJob: clientData.job || "",
                    clientCity: clientData.city || "",
                    answers: answers,
                };

                const response = await riskProfileService.simulateRiskProfile(payload);
                targetPdfUrl = response.pdfUrl;
                targetToken = response.token;

                setPdfUrl(targetPdfUrl);
                setMgcToken(targetToken);
            }

            if (targetPdfUrl) {
                const filenamePdf = generateSimulationFilename("Risk Profile", clientData.name, "pdf");
                const filenameMgc = generateSimulationFilename("Risk Profile", clientData.name, "mgc");

                const link = document.createElement('a');
                link.href = targetPdfUrl;
                link.setAttribute('download', filenamePdf);
                document.body.appendChild(link);
                link.click();
                link.remove();

                if (targetToken) {
                    const blobMgc = new Blob([targetToken], { type: 'application/octet-stream' });
                    const urlMgc = window.URL.createObjectURL(blobMgc);
                    const linkMgc = document.createElement('a');
                    linkMgc.href = urlMgc;
                    linkMgc.setAttribute('download', filenameMgc);
                    document.body.appendChild(linkMgc);
                    linkMgc.click();
                    linkMgc.remove();
                    window.URL.revokeObjectURL(urlMgc);
                }

                toast.success("Dokumen PDF berhasil diunduh.");
                clearDraft();
            } else {
                toast.error("Sistem gagal menghasilkan dokumen PDF.");
            }
        } catch (error: any) {
            toast.error("Gagal Download", { description: error.message || "Terjadi kesalahan teknis saat merender dokumen." });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleRetake = () => {
        setCurrentStep("QUIZ");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleResetFull = () => {
        if (confirm("Apakah Anda yakin ingin memulai sesi baru? Semua input saat ini akan dihapus permanen.")) {
            setClientData(null);
            setAnswers([]);
            setSimulationResult(null);
            setPdfUrl(null);
            setMgcToken(null);
            clearDraft();
            setCurrentStep("IDENTITY");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const pageVariants: Variants = {
        initial: { opacity: 0, y: 20, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { stiffness: 300, damping: 25 } },
        exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }
    };

    const getPillLeftPosition = (step: WizardStep) => {
        switch (step) {
            case "IDENTITY": return '4px';
            case "QUIZ": return 'calc(33.33% + 2px)';
            case "RESULT": return 'calc(66.66% - 2px)';
            default: return '4px';
        }
    };

    return (
        <div className="w-full flex flex-col gap-6 md:gap-8 pb-10">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".mgc" className="hidden" />

            {/* 1. FLOATING STEPPER */}
            {currentStep !== "QUIZ" && (
                <div className="sticky top-16 md:top-20 z-30 mx-auto w-full max-w-sm animate-in fade-in slide-in-from-top-4">
                    <div className="bg-white/80 backdrop-blur-2xl rounded-full p-1.5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] border border-white/40 flex items-center justify-between relative overflow-hidden">
                        <div
                            className="absolute top-1.5 bottom-1.5 rounded-full bg-slate-900 transition-all duration-500"
                            style={{
                                width: 'calc(33.33% - 4px)',
                                left: getPillLeftPosition(currentStep)
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
            )}

            {/* 3. MAIN CONTENT (FULL RESPONSIVE) */}
            <div className="w-full relative min-h-[60vh]">
                <AnimatePresence mode="wait">
                    {currentStep === "IDENTITY" && (
                        <motion.div
                            key="identity"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="flex flex-col gap-6 w-full max-w-5xl mx-auto px-2 md:px-0" // DIPERBAIKI: Menjadi 5xl agar lebar di desktop
                        >
                            {/* Card Import .MGC */}
                            <div className="group relative overflow-hidden bg-linear-to-br from-indigo-600 via-blue-600 to-indigo-800 rounded-[1.5rem] p-5 shadow-xl shadow-indigo-900/20 border border-indigo-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300">
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
                                    disabled={isImporting}
                                    className="w-full md:w-auto relative z-10 bg-white text-indigo-700 hover:bg-indigo-50 hover:scale-[1.02] active:scale-95 transition-all rounded-xl h-11 px-5 shadow-lg font-black tracking-wide text-xs"
                                >
                                    {isImporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                    {isImporting ? "Memuat..." : "Import File"}
                                </Button>
                            </div>

                            {/* Form Utama */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-1 w-full">
                                <IdentityForm initialData={clientData || undefined} onSubmit={handleIdentitySubmit} />
                            </div>
                        </motion.div>
                    )}

                    {currentStep === "QUIZ" && (
                        <motion.div
                            key="quiz"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="w-full max-w-6xl mx-auto" // Memastikan kuesioner bisa lebar
                        >
                            <QuizSection initialAnswers={answers} onFinish={handleQuizFinish} isLoading={isLoading} />
                        </motion.div>
                    )}

                    {currentStep === "RESULT" && simulationResult && (
                        <motion.div
                            key="result"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="w-full max-w-7xl mx-auto" // Hasil analisa paling lebar (immersive)
                        >
                            <AnalysisResult
                                data={simulationResult}
                                userAnswers={answers}
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
            {(isLoading || isImporting) && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-100 flex items-center justify-center animate-in fade-in duration-300">
                    <div className="flex flex-col items-center gap-5 p-8 bg-white rounded-[2rem] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500 max-w-sm w-full mx-4">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="font-black text-slate-800 text-xl tracking-tight">
                                {isImporting ? "Memuat Data" : "Kalkulasi Sistem"}
                            </h3>
                            <p className="text-slate-500 text-sm font-medium">
                                {isImporting ? "Mengekstrak file backup..." : "Menganalisis matriks profil risiko klien..."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}