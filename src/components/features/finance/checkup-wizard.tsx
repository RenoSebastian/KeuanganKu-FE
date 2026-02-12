"use client";

import { useState, useRef, useEffect, SetStateAction } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, ArrowRight, CheckCircle2,
    Wallet, Banknote, Calculator,
    CreditCard, User, Briefcase, Users,
    ShoppingBag, Car, Gem, Phone, Umbrella, PiggyBank, ShieldCheck,
    Landmark, DollarSign, TrendingUp, Home, Coins, Plane, Activity, History, FileSearch, Upload, Loader2
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Imports from Lib/Services
import {
    FinancialRecord,
    HelpContent,
    CreateCheckupSimulationDto,
    SimulationClientProfile,
    CheckupSimulationResult
} from "@/lib/types";
import { financialService } from "@/services/financial.service";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/financial-math";
import { FINANCIAL_HELP_DATA } from "@/lib/financial-dictionary";

// Imports Sub-Components
import { ClientIdentityForm } from "./checkup/client-identity-form";
import { CheckupResult } from "./checkup-result";
import { MonthlyHelperModal } from "./monthly-helper-modal";
import { InfoPopover } from "@/components/ui/info-popover";

// Hooks
import { useSimulationPersistence, SIMULATION_STORAGE_KEYS } from "@/hooks/use-simulation-persistence";

// ============================================================================
// HELPER COMPONENTS (MOVED TO TOP TO FIX VISIBILITY ISSUES)
// ============================================================================

function SectionHeader({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="mb-6 pb-2 border-b border-slate-100">
            <h3 className="font-black text-slate-800 text-lg tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
        </div>
    );
}

function ReviewRow({ label, value, isTotal, color }: { label: string, value: number, isTotal?: boolean, color?: string }) {
    return (
        <div className={cn("flex justify-between items-center py-1", isTotal && "py-2 font-bold")}>
            <span className={cn("text-sm", isTotal ? "text-slate-800 uppercase tracking-wide" : "text-slate-500 font-medium")}>{label}</span>
            <span className={cn(
                "font-mono font-medium text-slate-700",
                isTotal && "text-lg font-black",
                color === "emerald" && "text-emerald-700",
                color === "rose" && "text-rose-700"
            )}>
                {formatRupiah(value)}
            </span>
        </div>
    );
}

interface InputGroupProps {
    icon: React.ReactNode;
    label: string;
    desc?: string;
    value: number;
    onChange: (val: string) => void;
    helpContent?: HelpContent;
    onMonthlyClick?: () => void;
    showCalculator?: boolean;
}

function InputGroup({ icon, label, desc, value, onChange, helpContent, onMonthlyClick, showCalculator }: InputGroupProps) {
    const safeValue = (value === undefined || value === null || isNaN(value)) ? 0 : value;
    return (
        <div className="group space-y-1.5">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide group-focus-within:text-brand-600 transition-colors">{label}</Label>
                    <InfoPopover content={helpContent} />
                </div>
                {showCalculator && onMonthlyClick && (
                    <button
                        type="button"
                        onClick={onMonthlyClick}
                        className="text-[9px] font-bold text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                    >
                        <Calculator className="w-3 h-3" /> Hitung Bulanan
                    </button>
                )}
            </div>
            <div className="relative transition-all duration-300 group-focus-within:scale-[1.01]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">{icon}</div>
                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 font-light text-xl">|</div>
                <div className="absolute left-14 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">Rp</div>
                <Input
                    type="text"
                    value={safeValue === 0 ? "" : safeValue.toLocaleString("id-ID")}
                    onChange={(e) => onChange(e.target.value)}
                    className="pl-20 h-12 bg-slate-50/50 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:bg-white font-bold text-slate-800 shadow-sm rounded-xl transition-all"
                    placeholder="0"
                />
            </div>
            {desc && <p className="text-[10px] text-slate-400 leading-tight pl-1">{desc}</p>}
        </div>
    );
}

function InputGroupNoLabel({ icon, value, onChange, autoFocus }: { icon: React.ReactNode, value: number, onChange: (val: string) => void, autoFocus?: boolean }) {
    const safeValue = (value === undefined || value === null || isNaN(value)) ? 0 : value;
    return (
        <div className="relative transition-all duration-300 group-focus-within:scale-[1.01]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500">{icon}</div>
            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 font-light text-xl">|</div>
            <div className="absolute left-14 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">Rp</div>
            <Input
                autoFocus={autoFocus}
                type="text"
                value={safeValue === 0 ? "" : safeValue.toLocaleString("id-ID")}
                onChange={(e) => onChange(e.target.value)}
                className="pl-20 h-12 bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white font-bold text-slate-800 rounded-xl transition-all"
                placeholder="0"
            />
        </div>
    );
}

// ============================================================================
// PART 1: MAIN SMART CONTROLLER (WIZARD)
// ============================================================================

type WizardStep = "IDENTITY" | "FINANCIAL" | "RESULT";

export function CheckupWizard() {
    // --- STATE MANAGEMENT ---
    const [currentStep, setCurrentStep] = useState<WizardStep>("IDENTITY");
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Data State (Lifted Up)
    const [clientData, setClientData] = useState<SimulationClientProfile | null>(null);
    const [financialRecord, setFinancialRecord] = useState<Partial<FinancialRecord> | null>(null);
    const [simulationResult, setSimulationResult] = useState<CheckupSimulationResult | null>(null);

    // PDF & Token State
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [mgcToken, setMgcToken] = useState<string | null>(null);

    // --- PERSISTENCE HOOK (Safety Net) ---
    const {
        draftAvailable,
        restoreDraft,
        clearDraft,
        ignoreDraft,
        draftData
    } = useSimulationPersistence<SimulationClientProfile, Partial<FinancialRecord>>(
        SIMULATION_STORAGE_KEYS.CHECKUP, // [FIX] Updated key
        clientData,
        financialRecord || {},
        currentStep === "IDENTITY" ? 0 : currentStep === "FINANCIAL" ? 1 : 2
    );

    // --- HANDLER: IMPORT FILE (.MGC) ---
    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".mgc")) {
            toast.error("Format file tidak valid. Gunakan file .mgc");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Membaca file simulasi...");

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const tokenString = event.target?.result as string;
                try {
                    // 1. Decode token via Service
                    const response = await financialService.decodeSimulationToken(tokenString);
                    const decoded = response.data; // Structure: { client, financial, result }

                    // 2. Hydrate State (Deep Hydration)
                    setClientData(decoded.client);
                    setFinancialRecord(decoded.financial);

                    // 3. Set Result (Bypass Calculation if exist)
                    if (decoded.result) {
                        setSimulationResult(decoded.result);
                    }

                    setMgcToken(tokenString);
                    setPdfUrl(null); // Reset PDF karena import tidak membawa blob PDF

                    // 4. Jump to Result
                    setCurrentStep("RESULT");
                    toast.success("Data simulasi berhasil di-import.", { id: toastId });
                } catch (err: any) {
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

    // --- HANDLER: RESTORE SESSION ---
    const handleRestoreSession = () => {
        const draft = restoreDraft();
        if (draft) {
            if (draft.clientData) setClientData(draft.clientData);
            if (draft.inputData) setFinancialRecord(draft.inputData);

            if (draft.step === 2) setCurrentStep("RESULT");
            else if (draft.clientData && !draft.inputData) setCurrentStep("FINANCIAL");
            else setCurrentStep("IDENTITY");

            toast.success("Sesi sebelumnya berhasil dipulihkan.");
        }
    };

    // --- STEP HANDLERS ---
    const onIdentitySubmit = (data: SimulationClientProfile) => {
        setClientData(data);
        setCurrentStep("FINANCIAL");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onFinancialSubmit = async (record: FinancialRecord) => {
        if (!clientData) {
            toast.error("Data identitas hilang. Mohon kembali ke langkah awal.");
            setCurrentStep("IDENTITY");
            return;
        }

        setFinancialRecord(record);
        setIsLoading(true);
        const toastId = toast.loading("Menganalisis kesehatan keuangan...");

        try {
            // Prepare Payload (Flattened Structure for Backend DTO)
            const payload: CreateCheckupSimulationDto = {
                client: clientData,
                ...record
            };

            // Call Backend [FIXED]
            const response = await financialService.simulateAgentCheckup(payload);

            // Backend now returns result object directly in `response` (SimulationApiResponse)
            setSimulationResult(response.data.result);

            // Handle PDF: Convert Buffer to Blob
            let blobUrl = null;
            if (response.pdfBuffer && response.pdfBuffer.data) {
                const bufferData = new Uint8Array(response.pdfBuffer.data);
                const blob = new Blob([bufferData], { type: 'application/pdf' });
                blobUrl = URL.createObjectURL(blob);
            }

            setPdfUrl(blobUrl);
            setMgcToken(response.mgcToken);

            setCurrentStep("RESULT");
            toast.success("Analisis selesai!", { id: toastId });
        } catch (error: any) {
            toast.error(error.message || "Gagal memproses simulasi.", { id: toastId });
        } finally {
            setIsLoading(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // --- HANDLER: LAZY PDF DOWNLOAD (Smart Logic) ---
    const handleDownloadPdf = async () => {
        if (!clientData || !financialRecord) {
            toast.error("Data tidak lengkap untuk generate PDF.");
            return;
        }

        setIsDownloading(true);
        try {
            let targetPdfUrl = pdfUrl;
            let targetToken = mgcToken;

            // KONDISI IMPORT: Jika PDF belum ada di memori, generate ulang
            if (!targetPdfUrl) {
                const payload: CreateCheckupSimulationDto = {
                    client: clientData,
                    ...financialRecord as FinancialRecord
                };

                // [FIXED] Call Backend
                const response = await financialService.simulateAgentCheckup(payload);

                // Convert Buffer to Blob
                if (response.pdfBuffer && response.pdfBuffer.data) {
                    const bufferData = new Uint8Array(response.pdfBuffer.data);
                    const blob = new Blob([bufferData], { type: 'application/pdf' });
                    targetPdfUrl = URL.createObjectURL(blob);
                }

                targetToken = response.mgcToken;

                setPdfUrl(targetPdfUrl);
                setMgcToken(targetToken);
            }

            // Execute Download
            if (targetPdfUrl) {
                const link = document.createElement('a');
                link.href = targetPdfUrl;
                const cleanName = clientData.name.replace(/[^a-zA-Z0-9]/g, '_');
                const filename = `Financial_Checkup_${cleanName}_${new Date().toISOString().split('T')[0]}.pdf`;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();

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

                clearDraft();
            } else {
                throw new Error("Gagal mendapatkan link download PDF.");
            }

        } catch (error: any) {
            toast.error("Gagal mengunduh dokumen. Silakan coba lagi.");
            console.error(error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleRetake = () => {
        setCurrentStep("FINANCIAL");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleReset = () => {
        if (confirm("Mulai sesi baru? Data saat ini akan dihapus.")) {
            clearDraft();
            setClientData(null);
            setFinancialRecord(null);
            setSimulationResult(null);
            setCurrentStep("IDENTITY");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <div className="w-full py-4">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".mgc" className="hidden" />

            {/* Safety Alert */}
            {draftAvailable && currentStep === "IDENTITY" && (
                <Alert className="mb-8 bg-blue-50 border-blue-200 text-blue-800 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <History className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="font-bold text-blue-700">Sesi Belum Selesai Ditemukan</AlertTitle>
                    <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                        <div className="text-xs">
                            Ditemukan data klien <strong>{draftData?.clientData?.name}</strong>.
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="h-8 text-xs hover:bg-blue-100" onClick={ignoreDraft}>Abaikan</Button>
                            <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={handleRestoreSession}>Lanjutkan Sesi</Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

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

                            {/* [FIX] Prop onSubmit diganti onComplete */}
                            <ClientIdentityForm
                                initialData={clientData || undefined}
                                onComplete={onIdentitySubmit}
                            />
                        </motion.div>
                    )}

                    {/* STEP 2: FINANCIAL DATA INPUT */}
                    {currentStep === "FINANCIAL" && (
                        <motion.div key="financial" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <FinancialInputSection
                                initialData={financialRecord || {}}
                                onComplete={onFinancialSubmit}
                                onBack={() => setCurrentStep("IDENTITY")}
                                isLoading={isLoading}
                            />
                        </motion.div>
                    )}

                    {/* STEP 3: RESULT */}
                    {currentStep === "RESULT" && simulationResult && (
                        <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                            {/* [FIX] Hapus onRetake karena tidak ada di interface CheckupResultProps */}
                            <CheckupResult
                                data={{
                                    result: simulationResult,
                                    financial: financialRecord as any,
                                    client: clientData as any
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


// ============================================================================
// PART 2: FINANCIAL INPUT SECTION (FULL IMPLEMENTATION)
// ============================================================================

interface FinancialInputProps {
    initialData?: Partial<FinancialRecord>;
    onComplete: (data: FinancialRecord) => void;
    onBack: () => void;
    isLoading?: boolean;
}

const INITIAL_DATA_FINANCIAL: Partial<FinancialRecord> = {
    // Aset
    assetCash: 0,
    assetHome: 0, assetVehicle: 0, assetJewelry: 0, assetAntique: 0, assetPersonalOther: 0,
    assetInvHome: 0, assetInvVehicle: 0, assetGold: 0, assetInvAntique: 0,
    assetStocks: 0, assetMutualFund: 0, assetBonds: 0, assetDeposit: 0, assetInvOther: 0,

    // Utang
    debtKPR: 0, debtKPM: 0, debtCC: 0, debtCoop: 0, debtConsumptiveOther: 0, debtBusiness: 0,

    // Arus Kas
    incomeFixed: 0, incomeVariable: 0,
    installmentKPR: 0, installmentKPM: 0, installmentCC: 0, installmentCoop: 0, installmentConsumptiveOther: 0, installmentBusiness: 0,
    insuranceLife: 0, insuranceHealth: 0, insuranceHome: 0, insuranceVehicle: 0, insuranceBPJS: 0, insuranceOther: 0,
    savingEducation: 0, savingRetirement: 0, savingPilgrimage: 0, savingHoliday: 0, savingEmergency: 0, savingOther: 0,
    expenseFood: 0, expenseSchool: 0, expenseTransport: 0, expenseCommunication: 0, expenseHelpers: 0, expenseTax: 0, expenseLifestyle: 0,
};

const FLOW_FIELDS: (keyof FinancialRecord)[] = [
    'incomeFixed', 'incomeVariable',
    'installmentKPR', 'installmentKPM', 'installmentCC', 'installmentCoop', 'installmentConsumptiveOther', 'installmentBusiness',
    'insuranceLife', 'insuranceHealth', 'insuranceHome', 'insuranceVehicle', 'insuranceBPJS', 'insuranceOther',
    'savingEducation', 'savingRetirement', 'savingPilgrimage', 'savingHoliday', 'savingEmergency', 'savingOther',
    'expenseFood', 'expenseSchool', 'expenseTransport', 'expenseCommunication', 'expenseHelpers', 'expenseTax', 'expenseLifestyle'
];

function FinancialInputSection({ initialData, onComplete, onBack, isLoading }: FinancialInputProps) {
    const [step, setStep] = useState(0); // 0: Neraca, 1: Arus Kas, 2: Review
    const [formData, setFormData] = useState<Partial<FinancialRecord>>({ ...INITIAL_DATA_FINANCIAL, ...initialData });

    // States untuk Modal Helper
    const [monthlyHelperTarget, setMonthlyHelperTarget] = useState<keyof FinancialRecord | null>(null);
    const [showDebtModal, setShowDebtModal] = useState<{ show: boolean, target: keyof FinancialRecord | null }>({ show: false, target: null });
    const [tempMonthly, setTempMonthly] = useState("");
    const [tempTenor, setTempTenor] = useState("");

    const [showGoldModal, setShowGoldModal] = useState(false);
    const [currentGoldPrice, setCurrentGoldPrice] = useState<number>(0);
    const [goldWeight, setGoldWeight] = useState("");

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    useEffect(() => {
        const fetchGold = async () => {
            try {
                const res = await financialService.getLatestGoldPrice();
                if (res.success && res.data) setCurrentGoldPrice(Number(res.data.buyPrice));
            } catch (e) { console.error("Gold price fetch failed", e); }
        };
        fetchGold();
    }, []);

    const handleFinancialChange = (field: keyof FinancialRecord, value: string) => {
        const numericValue = parseFloat(value.replace(/[^0-9]/g, "")) || 0;
        setFormData(prev => ({ ...prev, [field]: numericValue }));
    };

    const applyMonthlyToAnnual = (annualValue: number) => {
        if (monthlyHelperTarget) {
            setFormData(prev => ({ ...prev, [monthlyHelperTarget]: annualValue }));
            setMonthlyHelperTarget(null);
        }
    };

    const applyDebtCalculation = () => {
        if (!showDebtModal.target) return;
        const monthly = parseInt(tempMonthly.replace(/\./g, "")) || 0;
        const tenor = parseInt(tempTenor) || 0;
        const total = monthly * tenor;
        setFormData(prev => ({ ...prev, [showDebtModal.target!]: total }));
        setShowDebtModal({ show: false, target: null });
        setTempMonthly("");
        setTempTenor("");
    };

    const applyGoldCalculation = () => {
        const cleanWeight = goldWeight.replace(/[^0-9,.]/g, "").replace(",", ".");
        const weight = parseFloat(cleanWeight) || 0;
        if (!currentGoldPrice || currentGoldPrice <= 0) {
            alert("Harga emas belum tersedia dari server.");
            return;
        }
        const totalPrice = Math.round(weight * currentGoldPrice);
        if (!isNaN(totalPrice)) {
            handleFinancialChange("assetGold", totalPrice.toString());
            setShowGoldModal(false);
            setGoldWeight("");
        }
    };

    const handleSubmit = () => {
        const payload: any = { ...formData };
        FLOW_FIELDS.forEach(field => {
            if (typeof payload[field] === 'number') {
                payload[field] = Math.round(payload[field] / 12);
            }
        });
        onComplete(payload);
    };

    const num = (n: any) => Number(n) || 0;

    // Helper functions for Review Step
    const totalAssets = num(formData.assetCash) + num(formData.assetHome) + num(formData.assetVehicle) + num(formData.assetJewelry) + num(formData.assetAntique) + num(formData.assetPersonalOther) + num(formData.assetInvHome) + num(formData.assetInvVehicle) + num(formData.assetGold) + num(formData.assetInvAntique) + num(formData.assetStocks) + num(formData.assetMutualFund) + num(formData.assetBonds) + num(formData.assetDeposit) + num(formData.assetInvOther);
    const totalDebt = num(formData.debtKPR) + num(formData.debtKPM) + num(formData.debtCC) + num(formData.debtCoop) + num(formData.debtConsumptiveOther) + num(formData.debtBusiness);
    const netWorth = totalAssets - totalDebt;

    const totalIncomeAnnual = num(formData.incomeFixed) + num(formData.incomeVariable);
    const totalInstallmentsAnnual = num(formData.installmentKPR) + num(formData.installmentKPM) + num(formData.installmentCC) + num(formData.installmentCoop) + num(formData.installmentConsumptiveOther) + num(formData.installmentBusiness);
    const totalInsuranceAnnual = num(formData.insuranceLife) + num(formData.insuranceHealth) + num(formData.insuranceHome) + num(formData.insuranceVehicle) + num(formData.insuranceBPJS) + num(formData.insuranceOther);
    const totalSavingsAnnual = num(formData.savingEducation) + num(formData.savingRetirement) + num(formData.savingPilgrimage) + num(formData.savingHoliday) + num(formData.savingEmergency) + num(formData.savingOther);
    const totalLivingExpenseAnnual = num(formData.expenseFood) + num(formData.expenseSchool) + num(formData.expenseTransport) + num(formData.expenseCommunication) + num(formData.expenseHelpers) + num(formData.expenseLifestyle) + num(formData.expenseTax);
    const totalExpenseAnnual = totalInstallmentsAnnual + totalInsuranceAnnual + totalSavingsAnnual + totalLivingExpenseAnnual;
    const surplusDeficitAnnual = totalIncomeAnnual - totalExpenseAnnual;

    return (
        <div className="w-full">
            <div className="card-clean overflow-hidden">
                {/* SUB-HEADER FOR STEPS */}
                <div className="bg-slate-50/50 border-b border-slate-100 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl shadow-sm ring-1 ring-white/50", step === 0 ? "bg-brand-50 text-brand-600" : step === 1 ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600")}>
                            {step === 0 && <Wallet className="w-6 h-6" />}
                            {step === 1 && <Banknote className="w-6 h-6" />}
                            {step === 2 && <Calculator className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                {step === 0 ? "Neraca (Harta & Utang)" : step === 1 ? "Arus Kas (Tahunan)" : "Review Data"}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">Langkah {step + 1} dari 3</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    {/* STEP 0: NERACA (ASET & UTANG) */}
                    {step === 0 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* A. DAFTAR ASET */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b-2 border-brand-500 pb-2">
                                    <Wallet className="w-6 h-6 text-brand-600" />
                                    <h3 className="text-xl font-black text-slate-800">Daftar Aset (Harta)</h3>
                                </div>

                                <SectionHeader title="Aset Likuid" desc="Kas dan setara kas (Saldo Saat Ini)" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Kas / Tabungan / Deposito Cair" value={num(formData.assetCash)} onChange={(v) => handleFinancialChange("assetCash", v)} icon={<Wallet className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetCash} />
                                </div>

                                <div className="border-t border-dashed border-slate-200" />

                                <SectionHeader title="Aset Personal" desc="Aset guna pakai (tidak menghasilkan income)" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Rumah / Tanah (Ditempati)" value={num(formData.assetHome)} onChange={(v) => handleFinancialChange("assetHome", v)} icon={<Home className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetHome} />
                                    <InputGroup label="Kendaraan Pribadi" value={num(formData.assetVehicle)} onChange={(v) => handleFinancialChange("assetVehicle", v)} icon={<Car className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetVehicle} />
                                    <InputGroup label="Emas Perhiasan" value={num(formData.assetJewelry)} onChange={(v) => handleFinancialChange("assetJewelry", v)} icon={<Gem className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetJewelry} />
                                    <InputGroup label="Barang Antik / Koleksi" value={num(formData.assetAntique)} onChange={(v) => handleFinancialChange("assetAntique", v)} icon={<Coins className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetAntique} />
                                    <InputGroup label="Aset Personal Lain" value={num(formData.assetPersonalOther)} onChange={(v) => handleFinancialChange("assetPersonalOther", v)} icon={<Wallet className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetPersonalOther} />
                                </div>

                                <div className="border-t border-dashed border-slate-200" />

                                <SectionHeader title="Aset Investasi" desc="Aset yang diharapkan tumbuh nilainya" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Rumah / Tanah" value={num(formData.assetInvHome)} onChange={(v) => handleFinancialChange("assetInvHome", v)} icon={<Home className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetInvHome} />
                                    <InputGroup label="Kendaraan " value={num(formData.assetInvVehicle)} onChange={(v) => handleFinancialChange("assetInvVehicle", v)} icon={<Car className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetInvVehicle} />

                                    {/* LOGAM MULIA */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <div className="flex items-center gap-1">
                                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Logam Mulia (Emas)</Label>
                                                <InfoPopover content={FINANCIAL_HELP_DATA.assetGold} />
                                            </div>
                                            <button type="button" onClick={() => setShowGoldModal(true)} className="text-[9px] font-bold text-brand-600 hover:text-brand-700 underline flex items-center gap-1 transition-colors">
                                                <Calculator className="w-3 h-3" /> Bantu Hitung (Gram)
                                            </button>
                                        </div>
                                        <InputGroupNoLabel value={num(formData.assetGold)} onChange={(v) => handleFinancialChange("assetGold", v)} icon={<Coins className="w-4 h-4" />} />
                                        {currentGoldPrice > 0 && (
                                            <p className="text-[9px] text-slate-400 italic ml-1">*Harga referensi: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(currentGoldPrice)}/gr</p>
                                        )}
                                    </div>

                                    <InputGroup label="Barang Antik " value={num(formData.assetInvAntique)} onChange={(v) => handleFinancialChange("assetInvAntique", v)} icon={<Coins className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetInvAntique} />
                                    <InputGroup label="Saham" value={num(formData.assetStocks)} onChange={(v) => handleFinancialChange("assetStocks", v)} icon={<TrendingUp className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetStocks} />
                                    <InputGroup label="Reksadana" value={num(formData.assetMutualFund)} onChange={(v) => handleFinancialChange("assetMutualFund", v)} icon={<TrendingUp className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetMutualFund} />
                                    <InputGroup label="Obligasi" value={num(formData.assetBonds)} onChange={(v) => handleFinancialChange("assetBonds", v)} icon={<Landmark className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetBonds} />
                                    <InputGroup label="Deposito Jangka Panjang" value={num(formData.assetDeposit)} onChange={(v) => handleFinancialChange("assetDeposit", v)} icon={<Landmark className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetDeposit} />
                                    <InputGroup label="Aset Investasi Lain" value={num(formData.assetInvOther)} onChange={(v) => handleFinancialChange("assetInvOther", v)} icon={<Briefcase className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.assetInvOther} />
                                </div>
                            </div>

                            {/* B. DAFTAR UTANG */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b-2 border-rose-500 pb-2">
                                    <CreditCard className="w-6 h-6 text-rose-600" />
                                    <h3 className="text-xl font-black text-slate-800">Daftar Utang (Kewajiban)</h3>
                                </div>

                                <SectionHeader title="Utang Konsumtif" desc="Sisa Pokok Utang (Outstanding)" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* KPR */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <div className="flex items-center gap-1">
                                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">KPR (Rumah)</Label>
                                                <InfoPopover content={FINANCIAL_HELP_DATA.debtKPR} />
                                            </div>
                                            <button type="button" onClick={() => setShowDebtModal({ show: true, target: 'debtKPR' })} className="text-[9px] font-bold text-brand-600 hover:text-brand-700 underline flex items-center gap-1 transition-colors">
                                                <Calculator className="w-3 h-3" /> Bantu Hitung Sisa
                                            </button>
                                        </div>
                                        <InputGroupNoLabel value={num(formData.debtKPR)} onChange={(v) => handleFinancialChange("debtKPR", v)} icon={<Home className="w-4 h-4" />} />
                                    </div>

                                    {/* KPM */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <div className="flex items-center gap-1">
                                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">KPM (Kendaraan)</Label>
                                                <InfoPopover content={FINANCIAL_HELP_DATA.debtKPM} />
                                            </div>
                                            <button type="button" onClick={() => setShowDebtModal({ show: true, target: 'debtKPM' })} className="text-[9px] font-bold text-brand-600 hover:text-brand-700 underline flex items-center gap-1 transition-colors">
                                                <Calculator className="w-3 h-3" /> Bantu Hitung Sisa
                                            </button>
                                        </div>
                                        <InputGroupNoLabel value={num(formData.debtKPM)} onChange={(v) => handleFinancialChange("debtKPM", v)} icon={<Car className="w-4 h-4" />} />
                                    </div>

                                    <InputGroup label="Kartu Kredit" value={num(formData.debtCC)} onChange={(v) => handleFinancialChange("debtCC", v)} icon={<CreditCard className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.debtCC} />
                                    <InputGroup label="Koperasi" value={num(formData.debtCoop)} onChange={(v) => handleFinancialChange("debtCoop", v)} icon={<Users className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.debtCoop} />
                                    <InputGroup label="Utang Lainnya" value={num(formData.debtConsumptiveOther)} onChange={(v) => handleFinancialChange("debtConsumptiveOther", v)} icon={<User className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.debtConsumptiveOther} />
                                </div>

                                <SectionHeader title="Utang Usaha" desc="Utang Produktif / Bisnis" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Utang Usaha / UMKM" value={num(formData.debtBusiness)} onChange={(v) => handleFinancialChange("debtBusiness", v)} icon={<Briefcase className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.debtBusiness} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 1: ARUS KAS (TAHUNAN) */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl flex gap-3 text-brand-800 text-sm mb-4">
                                <div className="shrink-0"><Activity className="w-5 h-5" /></div>
                                <div>
                                    <p className="font-bold">MODE INPUT: TAHUNAN</p>
                                    <p>Masukkan total pendapatan & pengeluaran Anda dalam <strong>1 TAHUN</strong>. Gunakan tombol kalkulator untuk bantuan hitung dari bulanan.</p>
                                </div>
                            </div>

                            {/* I. PEMASUKAN */}
                            <SectionHeader title="I. Pemasukan (Per Tahun)" desc="Total pendapatan setahun (x12)" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="1. Pendapatan Tetap" value={num(formData.incomeFixed)} onChange={(v) => handleFinancialChange("incomeFixed", v)} icon={<DollarSign className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.incomeFixed} onMonthlyClick={() => setMonthlyHelperTarget("incomeFixed")} showCalculator />
                                <InputGroup label="2. Pendapatan Tidak Tetap" value={num(formData.incomeVariable)} onChange={(v) => handleFinancialChange("incomeVariable", v)} icon={<TrendingUp className="w-4 h-4" />} helpContent={FINANCIAL_HELP_DATA.incomeVariable} onMonthlyClick={() => setMonthlyHelperTarget("incomeVariable")} showCalculator />
                            </div>

                            <div className="border-t border-dashed border-slate-200" />

                            {/* 1. CICILAN UTANG */}
                            <SectionHeader title="1. Cicilan Utang (Per Tahun)" desc="Total bayar cicilan setahun" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { k: 'installmentKPR', l: 'KPR', i: <Home className="w-4 h-4" /> },
                                    { k: 'installmentKPM', l: 'KPM', i: <Car className="w-4 h-4" /> },
                                    { k: 'installmentCC', l: 'Kartu Kredit', i: <CreditCard className="w-4 h-4" /> },
                                    { k: 'installmentCoop', l: 'Koperasi', i: <Users className="w-4 h-4" /> },
                                    { k: 'installmentConsumptiveOther', l: 'Utang Konsumtif Lain', i: <User className="w-4 h-4" /> },
                                    { k: 'installmentBusiness', l: 'Utang Usaha/UMKM', i: <Briefcase className="w-4 h-4" /> }
                                ].map((item) => (
                                    <InputGroup
                                        key={item.k}
                                        label={item.l}
                                        value={num(formData[item.k as keyof FinancialRecord])}
                                        onChange={(v) => handleFinancialChange(item.k as keyof FinancialRecord, v)}
                                        icon={item.i}
                                        helpContent={FINANCIAL_HELP_DATA[item.k as keyof FinancialRecord]}
                                        onMonthlyClick={() => setMonthlyHelperTarget(item.k as keyof FinancialRecord)}
                                        showCalculator
                                    />
                                ))}
                            </div>

                            <div className="border-t border-dashed border-slate-200" />

                            {/* 2. PREMI ASURANSI */}
                            <SectionHeader title="2. Premi Asuransi (Per Tahun)" desc="Total premi setahun" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { k: 'insuranceLife', l: 'Asuransi Jiwa', i: <Umbrella className="w-4 h-4" /> },
                                    { k: 'insuranceHealth', l: 'Asuransi Kesehatan', i: <Umbrella className="w-4 h-4" /> },
                                    { k: 'insuranceHome', l: 'Asuransi Rumah', i: <Home className="w-4 h-4" /> },
                                    { k: 'insuranceVehicle', l: 'Asuransi Kendaraan', i: <Car className="w-4 h-4" /> },
                                    { k: 'insuranceBPJS', l: 'BPJS', i: <ShieldCheck className="w-4 h-4" /> },
                                    { k: 'insuranceOther', l: 'Asuransi Lainnya', i: <Umbrella className="w-4 h-4" /> }
                                ].map((item) => (
                                    <InputGroup
                                        key={item.k}
                                        label={item.l}
                                        value={num(formData[item.k as keyof FinancialRecord])}
                                        onChange={(v) => handleFinancialChange(item.k as keyof FinancialRecord, v)}
                                        icon={item.i}
                                        helpContent={FINANCIAL_HELP_DATA[item.k as keyof FinancialRecord]}
                                        onMonthlyClick={() => setMonthlyHelperTarget(item.k as keyof FinancialRecord)}
                                        showCalculator
                                    />
                                ))}
                            </div>

                            <div className="border-t border-dashed border-slate-200" />

                            {/* 3. TABUNGAN/INVESTASI */}
                            <SectionHeader title="3. Tabungan/Investasi (Per Tahun)" desc="Total tabungan setahun" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { k: 'savingEducation', l: 'Dana Pendidikan Anak', i: <PiggyBank className="w-4 h-4" /> },
                                    { k: 'savingRetirement', l: 'Dana Hari Tua', i: <TrendingUp className="w-4 h-4" /> },
                                    { k: 'savingPilgrimage', l: 'Dana Ibadah', i: <Coins className="w-4 h-4" /> },
                                    { k: 'savingHoliday', l: 'Dana Liburan', i: <Plane className="w-4 h-4" /> },
                                    { k: 'savingEmergency', l: 'Dana Darurat', i: <ShieldCheck className="w-4 h-4" /> },
                                    { k: 'savingOther', l: 'Dana Lainnya', i: <Wallet className="w-4 h-4" /> }
                                ].map((item) => (
                                    <InputGroup
                                        key={item.k}
                                        label={item.l}
                                        value={num(formData[item.k as keyof FinancialRecord])}
                                        onChange={(v) => handleFinancialChange(item.k as keyof FinancialRecord, v)}
                                        icon={item.i}
                                        helpContent={FINANCIAL_HELP_DATA[item.k as keyof FinancialRecord]}
                                        onMonthlyClick={() => setMonthlyHelperTarget(item.k as keyof FinancialRecord)}
                                        showCalculator
                                    />
                                ))}
                            </div>

                            <div className="border-t border-dashed border-slate-200" />

                            {/* 4. BELANJA KELUARGA */}
                            <SectionHeader title="4. Belanja Keluarga (Per Tahun)" desc="Total pengeluaran rutin setahun" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { k: 'expenseFood', l: 'Makan Keluarga', i: <ShoppingBag className="w-4 h-4" /> },
                                    { k: 'expenseSchool', l: 'Uang Sekolah', i: <User className="w-4 h-4" /> },
                                    { k: 'expenseTransport', l: 'Transportasi', i: <Car className="w-4 h-4" /> },
                                    { k: 'expenseCommunication', l: 'Telepon & Internet', i: <Phone className="w-4 h-4" /> },
                                    { k: 'expenseHelpers', l: 'ART / Supir', i: <User className="w-4 h-4" /> },
                                    { k: 'expenseLifestyle', l: 'Belanja RT Lainnya', i: <ShoppingBag className="w-4 h-4" /> },
                                    { k: 'expenseTax', l: 'Pajak (PBB/PKB)', i: <Landmark className="w-4 h-4" /> }
                                ].map((item) => (
                                    <InputGroup
                                        key={item.k}
                                        label={item.l}
                                        value={num(formData[item.k as keyof FinancialRecord])}
                                        onChange={(v) => handleFinancialChange(item.k as keyof FinancialRecord, v)}
                                        icon={item.i}
                                        helpContent={FINANCIAL_HELP_DATA[item.k as keyof FinancialRecord]}
                                        onMonthlyClick={() => setMonthlyHelperTarget(item.k as keyof FinancialRecord)}
                                        showCalculator
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* REVIEW CARDS */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* CARD 1: NERACA */}
                                <div className="bg-white border border-slate-200 p-6 rounded-2xl">
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                                        <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600"><Wallet className="w-4 h-4" /></div>
                                        <h4 className="font-bold text-slate-700">Laporan Neraca</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <ReviewRow label="Total Aset" value={totalAssets} color="emerald" />
                                        <ReviewRow label="Total Utang" value={totalDebt} color="rose" />
                                        <div className="border-t border-slate-100 pt-2 mt-2">
                                            <ReviewRow label="Kekayaan Bersih" value={netWorth} isTotal />
                                        </div>
                                    </div>
                                </div>

                                {/* CARD 2: ARUS KAS */}
                                <div className="bg-white border border-slate-200 p-6 rounded-2xl">
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><Banknote className="w-4 h-4" /></div>
                                        <h4 className="font-bold text-slate-700">Laporan Arus Kas</h4>
                                    </div>
                                    <div className="space-y-2">
                                        <ReviewRow label="Total Pemasukan" value={totalIncomeAnnual} color="emerald" />
                                        <ReviewRow label="Total Pengeluaran" value={totalExpenseAnnual} color="rose" />
                                        <div className="border-t border-slate-100 pt-2 mt-2">
                                            <ReviewRow label="Surplus / Defisit" value={surplusDeficitAnnual} isTotal />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER ACTIONS */}
                <div className="bg-white p-6 md:p-8 border-t border-slate-100 flex justify-between items-center rounded-b-2xl">
                    <Button variant="ghost" onClick={step === 0 ? onBack : () => setStep(prev => prev - 1)} disabled={isLoading} className="text-slate-500 hover:text-brand-600">
                        <ArrowLeft className="w-4 h-4 mr-2" /> {step === 0 ? "Kembali" : "Sebelumnya"}
                    </Button>

                    {step < 2 ? (
                        <Button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setStep(prev => prev + 1); }} className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/20 px-8 h-12 rounded-xl font-bold">
                            Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isLoading} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 px-8 h-12 rounded-xl font-bold">
                            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menganalisa...</> : <><Calculator className="w-4 h-4 mr-2" /> Diagnosa Sekarang</>}
                        </Button>
                    )}
                </div>
            </div>

            {/* Modals */}
            <MonthlyHelperModal
                isOpen={!!monthlyHelperTarget}
                onClose={() => setMonthlyHelperTarget(null)}
                onApply={(val) => { if (monthlyHelperTarget) setFormData(prev => ({ ...prev, [monthlyHelperTarget]: val })); setMonthlyHelperTarget(null); }}
                title="Asisten Hitung Tahunan"
            />

            {showDebtModal.show && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-5 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDebtModal({ show: false, target: null })} />
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Kalkulator Sisa Utang</h3>
                                <p className="text-xs text-slate-500">Bukan untuk arus kas tahunan, tapi saldo utang.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cicilan Per Bulan</label>
                                <InputGroupNoLabel autoFocus value={tempMonthly ? parseInt(tempMonthly.replace(/\./g, "")) : 0} onChange={(v: SetStateAction<string>) => setTempMonthly(v)} icon={<Banknote className="w-4 h-4" />} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sisa Tenor (Bulan)</label>
                                <div className="relative">
                                    <Input type="number" value={tempTenor} onChange={(e) => setTempTenor(e.target.value)} className="h-12 rounded-xl font-bold bg-slate-50 border-slate-200 focus:border-brand-500 pr-12" placeholder="Contoh: 120" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Bln</span>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setShowDebtModal({ show: false, target: null })}>Batal</Button>
                                <Button className="flex-2 h-12 rounded-xl bg-brand-600 font-bold" onClick={applyDebtCalculation}>Terapkan</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showGoldModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-5 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowGoldModal(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                                <Coins className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Kalkulator Emas</h3>
                                <p className="text-xs text-slate-500 font-medium">Konversi gram ke nilai rupiah terkini.</p>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Harga Emas Terkini</p>
                                <p className="text-lg font-bold text-slate-700">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(currentGoldPrice)}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah Emas (Gram)</label>
                                <div className="relative group">
                                    <Input autoFocus type="text" inputMode="decimal" value={goldWeight} onChange={(e) => setGoldWeight(e.target.value)} className="h-12 rounded-xl font-bold bg-white border-slate-200 focus:border-brand-500 pr-12 transition-all shadow-sm" placeholder="Contoh: 3.21" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">GR</span>
                                </div>
                            </div>
                            <div className="bg-brand-50/50 p-4 rounded-xl border border-brand-100">
                                <p className="text-[10px] font-black text-brand-400 uppercase mb-1">Estimasi Nilai</p>
                                <p className="text-xl font-black text-brand-700">{formatRupiah(Math.round((parseFloat(goldWeight.replace(",", ".")) || 0) * currentGoldPrice))}</p>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-slate-300 text-slate-600" onClick={() => setShowGoldModal(false)}>Batal</Button>
                                <Button className="flex-2 h-12 rounded-xl bg-brand-600 font-bold shadow-lg shadow-brand-500/20 text-white" onClick={applyGoldCalculation} disabled={!currentGoldPrice}>Terapkan Nilai</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}