"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
    FileUp,
    RefreshCcw,
    ShieldCheck,
    Briefcase,
    History
} from "lucide-react";

// Components
import { ClientIdentityForm } from "@/components/features/finance/checkup/client-identity-form";
import { CheckupWizard } from "@/components/features/finance/checkup-wizard";
import { CheckupResult } from "@/components/features/finance/checkup-result";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types & Services
import {
    FinancialRecord,
    CreateCheckupSimulationDto,
    SimulationClientProfile,
    CheckupSimulationResult,
    SimulationSpouseProfile
} from "@/lib/types";
import { financialService } from "@/services/financial.service";
import { useSimulationPersistence } from "@/hooks/use-simulation-persistence";

// Correct State Definition matching ClientIdentityForm output
type ClientDataState = {
    client: SimulationClientProfile;
    spouse?: SimulationSpouseProfile;
};

export default function AgentCheckupPage() {
    // --- 1. STATE MANAGEMENT ---

    // Step 0: Identity, Step 1: Financial Wizard, Step 2: Result Preview
    const [step, setStep] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    // Data Input (Lifted State)
    const [clientData, setClientData] = useState<ClientDataState | null>(null);
    const [financialData, setFinancialData] = useState<Partial<FinancialRecord>>({});

    // Hasil Simulasi (Transient)
    const [simulationResult, setSimulationResult] = useState<CheckupSimulationResult | null>(null);

    // Artifacts (Token & Blob URL for Download)
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [mgcToken, setMgcToken] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- 2. PERSISTENCE HOOK (SAFETY NET) ---
    const {
        draftAvailable,
        restoreDraft,
        clearDraft,
        ignoreDraft,
        draftData
    } = useSimulationPersistence(clientData, financialData, step);

    // --- 3. HANDLERS: RESTORE ---
    const handleRestoreSession = () => {
        const draft = restoreDraft();
        if (draft) {
            // Cast stored data to expected types
            setClientData(draft.clientData as ClientDataState);
            setFinancialData(draft.financialData);

            // Prevent jumping straight to result without re-calculating, 
            // safer to land on Wizard (Step 1) or Identity (Step 0)
            const targetStep = draft.step === 2 ? 1 : draft.step;
            setStep(targetStep);

            toast.success("Sesi sebelumnya berhasil dipulihkan.");
        }
    };

    // --- 4. HANDLERS: NAVIGATION & INPUT ---

    const handleIdentitySubmit = (data: any) => {
        // Data received from ClientIdentityForm: { client: ..., spouse: ... }
        setClientData(data);
        setStep(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBackToIdentity = () => {
        setStep(0);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // --- 5. CORE LOGIC: SIMULATION EXECUTION (NO AUTO DOWNLOAD) ---

    const handleSimulation = async (financialInput: any) => {
        // Validasi data identitas sebelum hitung
        if (!clientData || !clientData.client) {
            toast.error("Data identitas klien belum lengkap.");
            setStep(0);
            return;
        }

        setIsLoading(true);
        // Update state financial dengan input terbaru dari Wizard
        setFinancialData(financialInput);

        try {
            // 1. Construct Payload DTO
            const payload: CreateCheckupSimulationDto = {
                client: clientData.client,
                spouse: clientData.spouse,
                ...financialInput // Spread flat financial fields
            };

            // 2. Call API (Stateless Simulation)
            const response = await financialService.simulateAgentCheckup(payload);

            // 3. Extract Result from Response
            const token = response.headers['x-mgc-token'];
            const pdfBlob = response.data;

            if (!token) throw new Error("Security Token (MGC) tidak ditemukan.");

            // 4. Create Blob URL for future download (Explicit Action)
            const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
            setPdfUrl(url);
            setMgcToken(token);

            // 5. Decode Token for Live Preview (Client Side)
            const [payloadBase64] = token.split('.');
            const decodedJson = JSON.parse(atob(payloadBase64));

            // 6. Construct Result Object for UI
            const fin = decodedJson.financial || {};
            const totalIncome = (Number(fin.incomeFixed) || 0) + (Number(fin.incomeVariable) || 0);

            // Calculate expense for visualization
            const expenseKeys = [
                'installmentKPR', 'installmentKPM', 'installmentCC', 'installmentCoop', 'installmentConsumptiveOther', 'installmentBusiness',
                'insuranceLife', 'insuranceHealth', 'insuranceHome', 'insuranceVehicle', 'insuranceBPJS', 'insuranceOther',
                'savingEducation', 'savingRetirement', 'savingPilgrimage', 'savingHoliday', 'savingEmergency', 'savingOther',
                'expenseFood', 'expenseSchool', 'expenseTransport', 'expenseCommunication', 'expenseHelpers', 'expenseTax', 'expenseLifestyle'
            ];
            const totalExpense = expenseKeys.reduce((acc, key) => acc + (Number(fin[key]) || 0), 0);

            const resultData: CheckupSimulationResult = {
                score: decodedJson.result?.score || 0,
                globalStatus: decodedJson.result?.status || 'WASPADA',
                netWorth: decodedJson.result?.netWorth || 0,
                surplusDeficit: totalIncome - totalExpense,
                ratios: decodedJson.result?.ratios || []
            };

            setSimulationResult(resultData);

            // 7. Move to Result Step
            setStep(2);
            toast.success("Analisa selesai. Silakan review hasil sebelum mencetak.");

        } catch (error: any) {
            console.error("Simulation Error:", error);
            toast.error(error.response?.data?.message || "Gagal memproses simulasi. Periksa koneksi.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- 6. HANDLER: IMPORT / LOAD DATA ---

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.mgc')) {
            toast.error("Format file tidak valid. Harap unggah file .mgc");
            return;
        }

        const toastId = toast.loading("Membaca file simulasi...");

        try {
            const token = await file.text();
            // Decode via API to ensure integrity
            const response = await financialService.decodeSimulationToken(token);
            const { client, spouse, financial } = response.data;

            // Hydrate State
            setClientData({ client, spouse });
            setFinancialData(financial);

            // Reset File Input
            if (fileInputRef.current) fileInputRef.current.value = "";

            // Navigate to Wizard for review
            setStep(1);
            toast.dismiss(toastId);
            toast.success("Data berhasil dipulihkan. Silakan review kembali.");

        } catch (error) {
            console.error("Import Error:", error);
            toast.dismiss(toastId);
            toast.error("File rusak atau tidak valid.");
        }
    };

    // --- 7. HANDLER: EXPLICIT DOWNLOAD & RESET ---

    const handleDownloadAction = () => {
        if (pdfUrl && clientData) {
            // 1. Download PDF
            const link = document.createElement('a');
            link.href = pdfUrl;
            const safeName = clientData.client.name.replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `Checkup_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            // 2. Optional: Offer MGC Token download
            if (mgcToken) {
                const blobMgc = new Blob([mgcToken], { type: 'text/plain' });
                const urlMgc = window.URL.createObjectURL(blobMgc);
                const linkMgc = document.createElement('a');
                linkMgc.href = urlMgc;
                linkMgc.setAttribute('download', filename.replace('.pdf', '.mgc'));
                document.body.appendChild(linkMgc);
                linkMgc.click();
                linkMgc.remove();
                toast.info("File backup (.mgc) juga diunduh untuk arsip Anda.");
            }

            // 3. Clear persistence after successful download (Flow finalized)
            clearDraft();
        } else {
            toast.error("Dokumen belum siap.");
        }
    };

    const handleReset = () => {
        if (confirm("Mulai sesi baru? Data input saat ini akan dihapus.")) {
            setStep(0);
            setClientData(null);
            setFinancialData({});
            setSimulationResult(null);
            setPdfUrl(null);
            setMgcToken(null);

            clearDraft(); // Hard wipe storage
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // --- RENDER ---

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">

            {/* HEADER PAGE */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 leading-none">Agent Simulator</h1>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Financial Checkup</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".mgc"
                            onChange={handleFileChange}
                        />

                        {step < 2 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleImportClick}
                                className="hidden md:flex border-slate-300 text-slate-600 hover:bg-slate-50"
                            >
                                <FileUp className="w-4 h-4 mr-2" />
                                Load Data (.mgc)
                            </Button>
                        )}

                        {step > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="text-slate-500 hover:text-red-600"
                            >
                                <RefreshCcw className="w-4 h-4 mr-1" /> Reset
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container max-w-5xl mx-auto px-4 py-8">

                {/* --- RESTORE BANNER (SAFETY NET) --- */}
                {draftAvailable && step === 0 && (
                    <Alert className="mb-6 bg-brand-50 border-brand-200 text-brand-800 shadow-sm animate-in fade-in slide-in-from-top-2">
                        <History className="h-4 w-4 text-brand-600" />
                        <AlertTitle className="font-bold text-brand-700">Sesi Belum Selesai Ditemukan</AlertTitle>
                        <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                            <div className="text-xs">
                                Ditemukan data klien <strong>{draftData?.clientData?.client?.name || "Tanpa Nama"}</strong> yang belum selesai diproses.
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="h-8 text-xs hover:bg-brand-100 hover:text-brand-800" onClick={ignoreDraft}>
                                    Abaikan
                                </Button>
                                <Button size="sm" className="h-8 text-xs bg-brand-600 hover:bg-brand-700 text-white" onClick={handleRestoreSession}>
                                    Lanjutkan Sesi
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* --- STEP 0: IDENTITAS --- */}
                {step === 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            <span>Mode Agen: Data diproses secara stateless (tidak disimpan di database pusat).</span>
                        </div>

                        <ClientIdentityForm
                            // Explicit type casting or ensuring alignment. clientData matches the structure required.
                            initialData={clientData as any}
                            onComplete={handleIdentitySubmit}
                        />
                    </div>
                )}

                {/* --- STEP 1: FINANCIAL WIZARD --- */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* Info Bar Nama Klien */}
                        <div className="mb-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Input Data Keuangan</h2>
                                <p className="text-sm text-slate-500">
                                    Klien: <span className="font-semibold text-brand-600">{clientData?.client.name}</span>
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setStep(0)}>
                                Edit Profil
                            </Button>
                        </div>

                        <CheckupWizard
                            initialData={financialData}
                            onBack={handleBackToIdentity}
                            onComplete={handleSimulation}
                            isLoading={isLoading}
                        />
                    </div>
                )}

                {/* --- STEP 2: RESULT PREVIEW & ACTION --- */}
                {step === 2 && simulationResult && (
                    <div className="animate-in zoom-in-95 duration-500">
                        <CheckupResult
                            data={simulationResult}
                            rawData={financialData as FinancialRecord} // Cast partial as full for safe display
                            mode="AGENT_SIMULATION"
                            // Logic Trial & Error: Kembali ke step 1, data financialData tetap ada (tidak di-reset)
                            onReset={() => setStep(1)}
                            onDownloadPdf={handleDownloadAction}
                        />

                        {/* Disclaimer Footer */}
                        <div className="mt-8 text-center text-xs text-slate-400 max-w-2xl mx-auto">
                            <p>
                                Disclaimer: Hasil simulasi ini adalah indikasi awal berdasarkan data yang diinput.
                                Keputusan finansial tetap berada di tangan klien.
                                Agen wajib menjelaskan asumsi yang digunakan.
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}