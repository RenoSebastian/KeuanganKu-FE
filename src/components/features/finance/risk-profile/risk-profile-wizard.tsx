"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    ClipboardList,
    FileText,
    ShieldCheck,
    Loader2
} from "lucide-react";

// Components
import { IdentityForm } from "./identity-form";
import { QuizSection } from "./quiz-section";
import { AnalysisResult } from "./analysis-result";

// Types & Services
import { RiskProfileResponse, RiskProfilePayload } from "@/lib/types/risk-profile";
import { riskProfileService } from "@/services/risk-profile.service";

// Definisi Step Flow untuk Manajemen State
type WizardStep = "IDENTITY" | "QUIZ" | "RESULT";

export function RiskProfileWizard() {
    // --- STATE MANAGEMENT ---
    const [currentStep, setCurrentStep] = useState<WizardStep>("IDENTITY");
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // State Data Sementara (Session-based memory)
    const [clientData, setClientData] = useState<{ name: string; age: number } | null>(null);
    const [simulationResult, setSimulationResult] = useState<RiskProfileResponse | null>(null);

    // --- HANDLERS ---

    const handleIdentitySubmit = (data: { name: string; age: number }) => {
        setClientData(data);
        setCurrentStep("QUIZ");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleQuizFinish = async (answers: string[]) => {
        if (!clientData) {
            toast.error("Data identitas klien hilang. Silakan mulai dari awal.");
            setCurrentStep("IDENTITY");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Menganalisis profil risiko klien...");

        const payload: RiskProfilePayload = {
            clientName: clientData.name,
            clientAge: clientData.age,
            answers: answers,
        };

        try {
            // Pemanggilan API untuk kalkulasi profil risiko
            const result = await riskProfileService.calculateProfile(payload);

            setSimulationResult(result);
            setCurrentStep("RESULT");
            toast.success("Analisis berhasil diselesaikan.", { id: toastId });

        } catch (error: any) {
            toast.error(error.message || "Gagal memproses analisis.", { id: toastId });
        } finally {
            setIsLoading(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleDownloadPdf = async () => {
        if (!simulationResult) return;

        setIsDownloading(true);
        const toastId = toast.loading("Menyiapkan dokumen PDF...");

        try {
            // Fungsi download laporan untuk kebutuhan agen dan klien
            await riskProfileService.downloadPdf(simulationResult);
            toast.success("Laporan berhasil diunduh.", { id: toastId });
        } catch (error: any) {
            toast.error("Gagal mengunduh laporan.", { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleRetake = () => {
        // Reset state untuk sesi konsultasi baru
        setClientData(null);
        setSimulationResult(null);
        setCurrentStep("IDENTITY");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // --- RENDER VIEW ---

    return (
        <div className="w-full py-4">
            {/* Step Indicator Visual */}
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
                        label="Analisis"
                    />
                    <div className={`flex-1 h-0.5 mx-4 transition-colors duration-500 ${currentStep === "RESULT" ? "bg-blue-600" : "bg-slate-200"}`} />
                    <StepItem
                        active={currentStep === "RESULT"}
                        done={false}
                        icon={<ShieldCheck size={20} />}
                        label="Hasil"
                    />
                </div>
            </div>

            {/* Transition Container */}
            <div className="min-h-100 relative">
                <AnimatePresence mode="wait">
                    {currentStep === "IDENTITY" && (
                        <motion.div
                            key="identity"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            <IdentityForm onSubmit={handleIdentitySubmit} />
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
                            <QuizSection
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
                                onDownloadPdf={handleDownloadPdf}
                                onRetake={handleRetake}
                                isDownloading={isDownloading}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Loading Overlay Global (Optional) */}
            {isLoading && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-100 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        <p className="text-sm font-bold text-slate-600 tracking-tight uppercase">Memproses Data Klien...</p>
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
        <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${active ? "bg-blue-600 text-white shadow-blue-200 scale-110" :
                done ? "bg-green-500 text-white" : "bg-white text-slate-300 border border-slate-100"
                }`}>
                {done ? <ShieldCheck size={24} /> : icon}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest text-center min-w-20 ${active ? "text-blue-600" : done ? "text-green-600" : "text-slate-400"
                }`}>
                {label}
            </span>
        </div>
    );
}