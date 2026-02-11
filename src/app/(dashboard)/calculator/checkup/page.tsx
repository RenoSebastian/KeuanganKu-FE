"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
    FileUp,
    RefreshCcw,
    ShieldCheck,
    Briefcase
} from "lucide-react";

// Components
import { ClientIdentityForm } from "@/components/features/finance/checkup/client-identity-form";
import { CheckupWizard } from "@/components/features/finance/checkup-wizard";
import { CheckupResult } from "@/components/features/finance/checkup-result";
import { Button } from "@/components/ui/button";

// Types & Services
import {
    FinancialRecord,
    CreateCheckupSimulationDto,
    SimulationClientProfile,
    CheckupSimulationResult,
    SimulationSpouseProfile // Pastikan type ini ada di types.ts atau gunakan any jika darurat
} from "@/lib/types";
import { financialService } from "@/services/financial.service";

// Definisi Tipe State yang Benar
type ClientDataState = {
    client: SimulationClientProfile;
    spouse?: SimulationSpouseProfile;
};

export default function AgentCheckupPage() {
    // --- 1. STATE MANAGEMENT ---

    const [step, setStep] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    // [FIX] Perbaikan Type State agar sesuai output form
    const [clientData, setClientData] = useState<ClientDataState | null>(null);

    const [financialData, setFinancialData] = useState<Partial<FinancialRecord>>({});
    const [simulationResult, setSimulationResult] = useState<CheckupSimulationResult | null>(null);

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [mgcToken, setMgcToken] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- 2. HANDLERS ---

    const handleIdentitySubmit = (data: any) => {
        // Data dari form sudah terstruktur { client: ..., spouse: ... }
        setClientData(data);
        setStep(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBackToIdentity = () => {
        setStep(0);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // --- 3. SIMULATION LOGIC ---

    const handleSimulation = async (financialInput: any) => {
        // [FIX] Validasi yang aman
        if (!clientData || !clientData.client) {
            toast.error("Data identitas klien belum lengkap.");
            setStep(0);
            return;
        }

        setIsLoading(true);
        setFinancialData(financialInput);

        try {
            // [FIX] Akses properti .client sekarang aman karena Typescript sudah tau strukturnya
            const payload: CreateCheckupSimulationDto = {
                client: clientData.client,
                spouse: clientData.spouse,
                ...financialInput
            };

            const response = await financialService.simulateAgentCheckup(payload);

            const token = response.headers['x-mgc-token'];
            const pdfBlob = response.data;

            if (!token) throw new Error("Security Token tidak ditemukan.");

            const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' }));
            setPdfUrl(url);
            setMgcToken(token);

            const [payloadBase64] = token.split('.');
            const decodedJson = JSON.parse(atob(payloadBase64));

            // Calculate simple surplus for display
            const totalIncome = (decodedJson.financial?.incomeFixed || 0) + (decodedJson.financial?.incomeVariable || 0);

            // Calculate total expense (rough estimate from token financial data)
            const expenseKeys = [
                'installmentKPR', 'installmentKPM', 'installmentCC', 'installmentCoop', 'installmentConsumptiveOther', 'installmentBusiness',
                'insuranceLife', 'insuranceHealth', 'insuranceHome', 'insuranceVehicle', 'insuranceBPJS', 'insuranceOther',
                'savingEducation', 'savingRetirement', 'savingPilgrimage', 'savingHoliday', 'savingEmergency', 'savingOther',
                'expenseFood', 'expenseSchool', 'expenseTransport', 'expenseCommunication', 'expenseHelpers', 'expenseTax', 'expenseLifestyle'
            ];

            const totalExpense = expenseKeys.reduce((acc, key) => acc + (Number(decodedJson.financial?.[key]) || 0), 0);

            const resultData: CheckupSimulationResult = {
                score: decodedJson.result?.score || 0,
                globalStatus: decodedJson.result?.status || 'WASPADA',
                netWorth: decodedJson.result?.netWorth || 0,
                surplusDeficit: totalIncome - totalExpense,
                ratios: decodedJson.result?.ratios || []
            };

            setSimulationResult(resultData);
            setStep(2);
            toast.success("Simulasi berhasil!");

        } catch (error: any) {
            console.error("Simulation Error:", error);
            toast.error(error.response?.data?.message || "Gagal memproses simulasi.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- 4. IMPORT LOGIC ---

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.mgc')) {
            toast.error("Format file harus .mgc");
            return;
        }

        const toastId = toast.loading("Membaca file...");

        try {
            const token = await file.text();
            const response = await financialService.decodeSimulationToken(token);
            const { client, spouse, financial } = response.data;

            // [FIX] Set structure correctly
            setClientData({ client, spouse });
            setFinancialData(financial);

            if (fileInputRef.current) fileInputRef.current.value = "";
            setStep(1);
            toast.dismiss(toastId);
            toast.success("Data berhasil dipulihkan.");

        } catch (error) {
            console.error("Import Error:", error);
            toast.dismiss(toastId);
            toast.error("File rusak atau tidak valid.");
        }
    };

    // --- 5. DOWNLOAD LOGIC ---

    const handleDownloadAction = () => {
        if (pdfUrl && clientData) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            const filename = `Checkup_${clientData.client.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            if (mgcToken) {
                const blobMgc = new Blob([mgcToken], { type: 'text/plain' });
                const urlMgc = window.URL.createObjectURL(blobMgc);
                const linkMgc = document.createElement('a');
                linkMgc.href = urlMgc;
                linkMgc.setAttribute('download', filename.replace('.pdf', '.mgc'));
                document.body.appendChild(linkMgc);
                linkMgc.click();
                linkMgc.remove();
            }
        }
    };

    const handleReset = () => {
        if (confirm("Reset formulir? Data hilang.")) {
            setStep(0);
            setClientData(null);
            setFinancialData({});
            setSimulationResult(null);
            setPdfUrl(null);
            setMgcToken(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
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
                        <input type="file" ref={fileInputRef} className="hidden" accept=".mgc" onChange={handleFileChange} />

                        {step < 2 && (
                            <Button variant="outline" size="sm" onClick={handleImportClick} className="hidden md:flex border-slate-300">
                                <FileUp className="w-4 h-4 mr-2" /> Load Data
                            </Button>
                        )}

                        {step > 0 && (
                            <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-500 hover:text-red-600">
                                <RefreshCcw className="w-4 h-4 mr-1" /> Reset
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container max-w-5xl mx-auto px-4 py-8">
                {step === 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            <span>Data klien bersifat rahasia dan tidak disimpan permanen (Stateless).</span>
                        </div>
                        <ClientIdentityForm
                            initialData={clientData as any}
                            onComplete={handleIdentitySubmit}
                        />
                    </div>
                )}

                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="mb-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Input Data Keuangan</h2>
                                <p className="text-sm text-slate-500">
                                    Klien: <span className="font-semibold text-brand-600">{clientData?.client.name}</span>
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setStep(0)}>Edit Profil</Button>
                        </div>
                        <CheckupWizard
                            initialData={financialData}
                            onBack={handleBackToIdentity}
                            onComplete={handleSimulation}
                            isLoading={isLoading}
                        />
                    </div>
                )}

                {step === 2 && simulationResult && (
                    <div className="animate-in zoom-in-95 duration-500">
                        <CheckupResult
                            data={simulationResult}
                            rawData={financialData as FinancialRecord}
                            mode="AGENT_SIMULATION"
                            onReset={() => setStep(1)}
                            onDownloadPdf={handleDownloadAction}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}