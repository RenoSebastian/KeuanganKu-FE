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
import api from "@/lib/axios"; // [ADDED] Untuk fetch Blob langsung dari pdfUrl

// Hooks
import { useSimulationPersistence, SIMULATION_STORAGE_KEYS } from "@/hooks/use-simulation-persistence";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/hooks/use-auth-user";

// [NEW ARCHITECTURE] Import Formatter dan Universal Export Engine
import { generateSimulationFilename } from "@/lib/formatters";
import { executeUniversalExport } from "@/utils/universal-export-engine";

type WizardStep = "IDENTITY" | "QUIZ" | "RESULT";

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

    const savedDraftName = (draftData as any)?.clientData?.name || "Klien";

    // --- REFACTORED UNIVERSAL EXPORT HANDLERS ---

    const handleDownloadPdf = async () => {
        if (!pdfUrl) {
            toast.error("Laporan PDF belum tersedia.");
            return;
        }

        setIsDownloading(true);
        try {
            const clientName = clientData?.name || "Klien";
            const filename = generateSimulationFilename("Profil Risiko", clientName, "pdf");

            // [FIXED] Tarik data blob secara langsung menggunakan axios, karena URL PDF sudah ada.
            const response = await api.get(pdfUrl, { responseType: 'blob' });

            // Eksekusi Blob PDF via Engine
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const exportStatus = await executeUniversalExport(pdfBlob, filename);

            if (exportStatus === 'SHARED') toast.success("Dokumen PDF siap dibagikan.");
            else if (exportStatus === 'DOWNLOADED') toast.success("Dokumen PDF berhasil diunduh.");

        } catch (error) {
            toast.error("Gagal mengunduh dokumen PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadMgc = async () => {
        if (!mgcToken) {
            toast.error("Data token MGC tidak tersedia.");
            return;
        }
        try {
            const clientName = clientData?.name || "Klien";
            const filename = generateSimulationFilename("Profil Risiko", clientName, "mgc");

            // Transformasi string ke Blob Biner untuk Universal Engine
            const mgcBlob = new Blob([mgcToken], { type: 'application/octet-stream' });
            const exportStatus = await executeUniversalExport(mgcBlob, filename);

            if (exportStatus === 'SHARED') toast.success("File Backup (.mgc) siap dibagikan.");
            else if (exportStatus === 'DOWNLOADED') toast.success("File Backup (.mgc) berhasil disimpan.");
        } catch (error) {
            toast.error("Gagal memproses file backup.");
        }
    };

    // --- HANDLERS LAINNYA ---
    const handleImportClick = () => fileInputRef.current?.click();

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
            toast.error("Kalkulasi Gagal", { id: toastId, description: error.response?.data?.message || "Terjadi kesalahan sistem." });
        } finally {
            setIsLoading(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleReset = () => {
        if (confirm("Mulai sesi baru? Semua data klien dan kuesioner akan di-reset.")) {
            clearStorage();
            setClientData(null);
            setAnswers([]);
            setSimulationResult(null);
            setPdfUrl(null);
            setMgcToken(null);
            setCurrentStep("IDENTITY");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const pageVariants: Variants = {
        initial: { opacity: 0, y: 20, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { stiffness: 300, damping: 25 } },
        exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }
    };

    return (
        <div className="w-full flex flex-col gap-6 md:gap-8 pb-10">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".mgc" className="hidden" />

            {/* STEPPER INDICATOR */}
            <div className="sticky top-16 md:top-20 z-30 mx-auto w-full max-w-sm">
                <div className="bg-white/80 backdrop-blur-2xl rounded-full p-1.5 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] border border-white/40 flex items-center justify-between relative overflow-hidden">
                    <div
                        className="absolute top-1.5 bottom-1.5 rounded-full bg-slate-900 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                        style={{
                            width: 'calc(33.33% - 4px)',
                            left: currentStep === "IDENTITY" ? '4px' : currentStep === "QUIZ" ? 'calc(33.33% + 2px)' : 'calc(66.66%)'
                        }}
                    />

                    {(Object.keys(STEP_MAP) as WizardStep[]).map((stepKey) => {
                        const step = STEP_MAP[stepKey];
                        const isActive = currentStep === stepKey;
                        const isDone = STEP_MAP[currentStep].id > step.id;
                        const Icon = step.icon;

                        return (
                            <div key={stepKey} className="relative z-10 flex-1 flex items-center justify-center py-2.5">
                                <div className={cn("flex items-center gap-2 transition-colors duration-300", isActive ? "text-white" : isDone ? "text-emerald-500" : "text-slate-400")}>
                                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                    <span className="text-[11px] font-black uppercase tracking-wider hidden md:block">{step.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="w-full relative min-h-[60vh]">
                <AnimatePresence mode="wait">

                    {/* DRAFT ALERT */}
                    {draftAvailable && currentStep === "IDENTITY" && (
                        <motion.div key="draft-alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                            <Alert className="bg-amber-50 border-amber-200 text-amber-900">
                                <History className="h-5 w-5 text-amber-600" />
                                <AlertTitle className="font-bold text-sm">Draft Tersimpan Ditemukan</AlertTitle>
                                <AlertDescription className="text-xs mt-1">
                                    Sistem menemukan sesi simulasi yang belum selesai atas nama <strong>{savedDraftName}</strong>. Apakah Anda ingin melanjutkannya?
                                    <div className="flex gap-3 mt-4">
                                        <Button onClick={restoreDraft} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6">Lanjutkan Draft</Button>
                                        <Button onClick={ignoreDraft} variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100 font-bold px-6">Abaikan & Mulai Baru</Button>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}

                    {currentStep === "IDENTITY" && (
                        <motion.div key="identity" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-6">
                            <div className="group relative overflow-hidden bg-linear-to-br from-indigo-600 via-blue-600 to-indigo-800 rounded-[1.5rem] p-5 shadow-xl shadow-indigo-900/20 border border-indigo-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/20 blur-3xl rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20 shadow-inner">
                                        <FileSearch className="w-6 h-6 text-cyan-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm flex items-center gap-2">Restore Sesi Klien <Sparkles className="w-3 h-3 text-yellow-300" /></h4>
                                        <p className="text-indigo-100/80 text-[11px] font-medium mt-0.5">Lanjutkan simulasi dari file <code className="bg-indigo-900/50 px-1 py-0.5 rounded text-cyan-200">.mgc</code></p>
                                    </div>
                                </div>
                                <Button onClick={handleImportClick} disabled={isImporting} className="w-full md:w-auto relative z-10 bg-white text-indigo-700 hover:bg-indigo-50 hover:scale-[1.02] active:scale-95 transition-all rounded-xl h-11 px-5 shadow-lg font-black tracking-wide text-xs">
                                    {isImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />} Import File
                                </Button>
                            </div>

                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-1">
                                {/* [FIXED] Sesuai prop original: onSubmit */}
                                <IdentityForm initialData={clientData || undefined} onSubmit={handleIdentitySubmit} />
                            </div>
                        </motion.div>
                    )}

                    {currentStep === "QUIZ" && clientData && (
                        <motion.div key="quiz" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-1 overflow-hidden">
                                <QuizSection
                                    initialAnswers={answers}
                                    onFinish={handleQuizFinish}
                                    isLoading={isLoading}
                                />
                            </div>
                        </motion.div>
                    )}

                    {currentStep === "RESULT" && simulationResult && (
                        <motion.div key="result" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                            <AnalysisResult
                                data={simulationResult}
                                userAnswers={answers}
                                onDownloadPdf={handleDownloadPdf}
                                onDownloadMgc={handleDownloadMgc}
                                hasMgcToken={!!mgcToken}
                                onRetake={() => {
                                    setCurrentStep("QUIZ");
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
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