"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    User, Wallet, Activity, FileSearch, Upload
} from "lucide-react";

import { Button } from "@/components/ui/button";

// Imports from Lib/Services
import {
    CheckupSimulationResponse, // Menggunakan tipe yang sudah distandarisasi
    FinancialFormState
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Data State (Single Source of Truth)
    const [clientData, setClientData] = useState<any | null>(null);
    const [financialRecord, setFinancialRecord] = useState<FinancialFormState>(INITIAL_FINANCIAL_STATE);

    // [FIX] Menggunakan tipe data eksplisit untuk mencegah struktur objek yang salah
    const [simulationData, setSimulationData] = useState<CheckupSimulationResponse | null>(null);

    // --- FULL PERSISTENCE INTEGRATION ---
    const { isHydrated, clearStorage } = useSimulationPersistence<
        any,
        FinancialFormState,
        CheckupSimulationResponse // Update Generic Type
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

        clearStorage();
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

                    // [FIX Phase 2] Rekonstruksi struktur data agar KONSISTEN dengan API Response
                    // Kita membungkus 'decoded' (isi: client, financial, result) ke dalam properti 'data'
                    const standardizedData: CheckupSimulationResponse = {
                        data: decoded, // decoded berisi { client, financial, result }
                        mgcToken: tokenString,
                        filename: file.name,
                        pdfBuffer: undefined // File import tidak membawa buffer PDF (harus generate ulang jika perlu)
                    };

                    setSimulationData(standardizedData);

                    setCurrentStep("RESULT");
                    toast.success("Data simulasi berhasil di-import.", { id: toastId });
                } catch (err: any) {
                    toast.error("Gagal men-decode file.", { id: toastId });
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

    const onFinancialSubmit = async () => {
        if (!clientData) {
            toast.error("Data identitas hilang.");
            setCurrentStep("IDENTITY");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Menganalisis kesehatan keuangan...");

        try {
            // Gabungkan data identitas dan finansial
            const payload = {
                ...financialRecord,
                ...clientData,
            };

            // Request ke Backend 
            // Return JSON Hybrid: { pdfBuffer, mgcToken, data: { result: ... } }
            const response = await financialService.simulateAgentCheckup(payload);

            // Simpan seluruh response (penting untuk download nanti)
            setSimulationData(response);

            setCurrentStep("RESULT");
            toast.success("Analisis selesai!", { id: toastId });
        } catch (error: any) {
            const message = error.response?.data?.message || "Gagal memproses simulasi.";
            toast.error(Array.isArray(message) ? message[0] : message, { id: toastId });
        } finally {
            setIsLoading(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const getInitialIdentityData = () => {
        if (!clientData) return undefined;
        return clientData.client ? { ...clientData.client, spouse: clientData.spouse } : clientData;
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

                    {currentStep === "RESULT" && simulationData && (
                        <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                            <CheckupResult
                                // Kita mengirimkan FULL WRAPPER 'simulationData' agar fitur Download PDF berfungsi
                                // Komponen CheckupResult telah diperbarui untuk mengekstrak 'ratios' dari dalamnya.
                                data={simulationData}
                                mode="AGENT_SIMULATION"
                                onReset={handleReset}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

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