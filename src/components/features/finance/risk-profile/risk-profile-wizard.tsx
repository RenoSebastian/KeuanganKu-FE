"use client";

import { useState } from "react";
import { toast } from "sonner"; // Library toast notifikasi
import { motion, AnimatePresence } from "framer-motion"; // Untuk animasi transisi halus

// Components
import { IdentityForm } from "./identity-form";
import { QuizSection } from "./quiz-section";
import { AnalysisResult } from "./analysis-result";

// Types & Services
import { RiskProfileResponse, RiskProfilePayload } from "@/lib/types/risk-profile";
import { riskProfileService } from "@/services/risk-profile.service";

// Definisi Step Flow
type WizardStep = "IDENTITY" | "QUIZ" | "RESULT";

export function RiskProfileWizard() {
    // --- STATE MANAGEMENT ---
    const [currentStep, setCurrentStep] = useState<WizardStep>("IDENTITY");
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // State Data Sementara (Client Side Memory)
    const [clientData, setClientData] = useState<{ name: string; age: number } | null>(null);
    const [simulationResult, setSimulationResult] = useState<RiskProfileResponse | null>(null);

    // --- HANDLERS (LOGIC FLOW) ---

    /**
     * Step 1: Handle Submit Identitas
     * Validasi sudah dilakukan di dalam component IdentityForm
     */
    const handleIdentitySubmit = (data: { name: string; age: number }) => {
        setClientData(data);
        setCurrentStep("QUIZ");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /**
     * Step 2: Handle Selesai Kuis
     * Menerima array jawaban ['A', 'B', ...], menyusun payload, dan tembak API.
     */
    const handleQuizFinish = async (answers: string[]) => {
        if (!clientData) {
            toast.error("Data identitas hilang. Silakan ulangi.");
            setCurrentStep("IDENTITY");
            return;
        }

        setIsLoading(true);

        // 1. Susun Payload sesuai DTO Backend
        const payload: RiskProfilePayload = {
            clientName: clientData.name,
            clientAge: clientData.age,
            answers: answers, // Backend sudah handle validasi ArrayMinSize(10)
        };

        try {
            // 2. Panggil API Calculation (Stateless)
            const result = await riskProfileService.calculateProfile(payload);

            // 3. Simpan Hasil & Pindah ke Result View
            setSimulationResult(result);
            setCurrentStep("RESULT");
            toast.success("Analisis profil risiko berhasil!");

        } catch (error: any) {
            toast.error(error.message || "Gagal melakukan perhitungan.");
        } finally {
            setIsLoading(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    /**
     * Step 3: Handle Download PDF
     * Mengirim ulang data hasil (simulationResult) ke backend untuk dirender jadi PDF.
     */
    const handleDownloadPdf = async () => {
        if (!simulationResult) return;

        setIsDownloading(true);
        const toastId = toast.loading("Sedang membuat laporan PDF...");

        try {
            await riskProfileService.downloadPdf(simulationResult);
            toast.success("Laporan berhasil diunduh!", { id: toastId });
        } catch (error: any) {
            toast.error(error.message || "Gagal download PDF.", { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };

    /**
     * Reset Flow: Mulai dari awal lagi
     * Menghapus semua state temporer.
     */
    const handleRetake = () => {
        // Opsional: clientData bisa di-keep jika ingin user tidak perlu input nama lagi
        // Disini saya reset total untuk privasi.
        setClientData(null);
        setSimulationResult(null);
        setCurrentStep("IDENTITY");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // --- RENDER VIEW SWITCHER ---

    return (
        <div className="min-h-150 w-full py-8 px-4 md:px-0">
            {/* AnimatePresence memungkinkan animasi exit saat komponen diganti.
        Ini memberikan UX yang lebih 'fluid' seperti aplikasi mobile.
      */}
            <AnimatePresence mode="wait">

                {currentStep === "IDENTITY" && (
                    <motion.div
                        key="identity"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <IdentityForm onSubmit={handleIdentitySubmit} />
                    </motion.div>
                )}

                {currentStep === "QUIZ" && (
                    <motion.div
                        key="quiz"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
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
                        initial={{ opacity: 0, scale: 0.95 }}
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
    );
}