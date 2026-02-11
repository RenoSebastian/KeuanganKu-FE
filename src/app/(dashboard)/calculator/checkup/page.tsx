"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
    FileUp,
    RefreshCcw,
    ShieldCheck,
    Loader2,
    Briefcase
} from "lucide-react";

// Components
import { ClientIdentityForm } from "@/components/features/finance/checkup/client-identity-form";
import { CheckupWizard } from "@/components/features/finance/checkup-wizard";
import { CheckupResult } from "@/components/features/finance/checkup-result";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Types & Services
import {
    FinancialRecord,
    CreateCheckupSimulationDto,
    SimulationClientProfile,
    CheckupSimulationResult
} from "@/lib/types";
import { financialService } from "@/services/financial.service";

/**
 * ------------------------------------------------------------------
 * AGENT FINANCIAL CHECKUP PAGE (STATELESS CONTROLLER)
 * ------------------------------------------------------------------
 * Halaman ini berfungsi sebagai orkestrator state untuk simulasi.
 * Data tidak disimpan di database (kecuali log aktivitas),
 * melainkan "hidup" di memori browser selama sesi berlangsung.
 */
export default function AgentCheckupPage() {
    // --- 1. STATE MANAGEMENT ---

    // Step 0: Identitas, Step 1: Keuangan, Step 2: Result
    const [step, setStep] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    // Data Input (State Lifting)
    const [clientData, setClientData] = useState<SimulationClientProfile & { spouse?: any } | null>(null);
    const [financialData, setFinancialData] = useState<Partial<FinancialRecord>>({});

    // Hasil Simulasi (Output)
    const [simulationResult, setSimulationResult] = useState<CheckupSimulationResult | null>(null);

    // Artifacts (Token & Blob)
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [mgcToken, setMgcToken] = useState<string | null>(null);

    // Ref untuk File Input (Import Feature)
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- 2. HANDLERS: NAVIGATION & INPUT ---

    const handleIdentitySubmit = (data: any) => {
        setClientData(data);
        setStep(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBackToIdentity = () => {
        setStep(0);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // --- 3. CORE LOGIC: SIMULATION EXECUTION ---

    const handleSimulation = async (financialInput: any) => {
        if (!clientData) {
            toast.error("Data identitas klien belum lengkap.");
            setStep(0);
            return;
        }

        setIsLoading(true);
        setFinancialData(financialInput); // Simpan state terbaru agar bisa diedit nanti

        try {
            // 1. Construct Payload DTO
            const payload: CreateCheckupSimulationDto = {
                client: clientData.client || clientData, // Handle struktur nested/flat
                spouse: (clientData as any).spouse,
                ...financialInput // Spread flat financial fields
            };

            // 2. Call API (Response Type: Blob)
            const response = await financialService.simulateAgentCheckup(payload);

            // 3. Extract Headers & Body
            const token = response.headers['x-mgc-token'];
            const pdfBlob = response.data;

            if (!token) {
                throw new Error("Security Token (MGC) tidak ditemukan dalam respon server.");
            }

            // 4. Create Blob URL for Preview/Download
            const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
            setPdfUrl(url);
            setMgcToken(token);

            // 5. Decode Token untuk mendapatkan Preview Data (Tanpa fetch ulang)
            // Format Token: Base64Payload.Signature
            const [payloadBase64] = token.split('.');
            const decodedString = atob(payloadBase64);
            const decodedJson = JSON.parse(decodedString);

            // 6. Set Result State
            // Note: Backend saat ini mengirim { result: { score, status, netWorth }, financial: {...} }
            // Kita perlu construct object result yang sesuai dengan props CheckupResult
            const resultData: CheckupSimulationResult = {
                score: decodedJson.result?.score || 0,
                globalStatus: decodedJson.result?.status || 'WASPADA',
                netWorth: decodedJson.result?.netWorth || 0,
                surplusDeficit: (decodedJson.financial?.incomeFixed + decodedJson.financial?.incomeVariable) -
                    (Object.values(decodedJson.financial || {}).reduce((acc: number, val: any) => {
                        // Simple client-side sum expense approximation for visual if needed, 
                        // but ideally rely on what BE sent.
                        // Since BE token 'result' is minimal, we assume visual feedback is limited 
                        // OR we rely on the PDF mainly.
                        return acc;
                    }, 0) as number),
                // Fallback kosong untuk ratios jika tidak ada di token (UI akan handle gracefully)
                ratios: decodedJson.result?.ratios || []
            };

            setSimulationResult(resultData);
            setStep(2); // Pindah ke halaman Result
            toast.success("Simulasi berhasil! Laporan siap dicetak.");

        } catch (error: any) {
            console.error("Simulation Error:", error);
            toast.error(error.response?.data?.message || "Gagal memproses simulasi. Periksa koneksi.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- 4. HANDLER: IMPORT / RESTORE DATA ---

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi ekstensi
        if (!file.name.endsWith('.mgc')) {
            toast.error("Format file tidak valid. Harap unggah file .mgc");
            return;
        }

        const toastId = toast.loading("Membaca file simulasi...");

        try {
            // Baca isi file sebagai text (Token String)
            const token = await file.text();

            // Validasi ke Server (Decode)
            const response = await financialService.decodeSimulationToken(token);

            const { client, spouse, financial } = response.data;

            // Hydrate State
            setClientData({
                ...client,
                spouse: spouse
            });

            setFinancialData(financial);

            // Reset Input File
            if (fileInputRef.current) fileInputRef.current.value = "";

            // Navigasi ke Step 1 (Wizard) untuk review angka
            setStep(1);
            toast.dismiss(toastId);
            toast.success("Data berhasil dipulihkan. Silakan review kembali.");

        } catch (error) {
            console.error("Import Error:", error);
            toast.dismiss(toastId);
            toast.error("File rusak atau tidak valid.");
        }
    };

    // --- 5. HANDLER: DOWNLOAD & RESET ---

    const handleDownloadAction = () => {
        if (pdfUrl && clientData) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            const filename = `Checkup_${clientData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Opsional: Download Token .mgc juga sebagai backup
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
        } else {
            toast.error("Dokumen belum siap.");
        }
    };

    const handleReset = () => {
        if (confirm("Apakah Anda yakin ingin mereset formulir? Data yang belum disimpan akan hilang.")) {
            setStep(0);
            setClientData(null);
            setFinancialData({});
            setSimulationResult(null);
            setPdfUrl(null);
            setMgcToken(null);
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
                        {/* Hidden File Input */}
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
                                <RefreshCcw className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Reset</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container max-w-5xl mx-auto px-4 py-8">

                {/* --- STEP 0: CLIENT IDENTITY --- */}
                {step === 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            <span>Data klien bersifat rahasia dan tidak disimpan permanen di server (Stateless).</span>
                        </div>

                        <ClientIdentityForm
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
                                    Klien: <span className="font-semibold text-brand-600">{clientData?.name}</span>
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

                {/* --- STEP 2: RESULT PREVIEW --- */}
                {step === 2 && simulationResult && (
                    <div className="animate-in zoom-in-95 duration-500">
                        <CheckupResult
                            data={simulationResult}
                            rawData={financialData as FinancialRecord} // Cast partial as full for display safety
                            mode="AGENT_SIMULATION"
                            onReset={() => setStep(1)} // Kembali ke wizard untuk edit angka
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