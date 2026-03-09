"use client";

import { useState, useEffect, useRef } from "react";
import { Plane, Heart, Star, Target, Lock } from "lucide-react";
import { v4 as uuidv4 } from 'uuid'; // [NEW] Import UUID
import Link from "next/link"; // [NEW] Untuk link ke pricing

import { GoalSimulationResult, CreateGoalSimulationDto } from "@/lib/types";
import { financialService } from "@/services/financial.service";
import { useAuthUser } from "@/hooks/use-auth-user"; // [NEW] Auth Hook

// UI Components
import { PdfLoadingModal } from "@/components/features/calculator/finance/pdf-loading-modal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import Micro-Components
import { GoalHeader } from "@/components/features/calculator/goals/goal-header";
import { GoalInputForm } from "@/components/features/calculator/goals/goal-input-form";
import { GoalResults } from "@/components/features/calculator/goals/goal-results";
import { generateSimulationFilename } from "@/lib/formatters";

// --- KONFIGURASI PILIHAN ---
const GOAL_OPTIONS = [
    { id: "IBADAH", label: "Ibadah", icon: Star, desc: "Haji, Umrah, Ziarah" },
    { id: "LIBURAN", label: "Liburan", icon: Plane, desc: "Traveling & Wisata" },
    { id: "PERNIKAHAN", label: "Pernikahan", icon: Heart, desc: "Resepsi & Acara" },
    { id: "LAINNYA", label: "Custom", icon: Target, desc: "Gadget, Rumah, Kendaraan" },
];

export default function GoalsPage() {
    // [NEW] Auth & Quota Logic
    const { isPro, quota, refreshUser, isLoading: isAuthLoading } = useAuthUser();
    const hasAccess = isPro || quota > 0;

    const fileInputRef = useRef<HTMLInputElement>(null);
    // [NEW] Idempotency Key untuk mencegah pemotongan kuota ganda saat edit
    const sessionId = useRef(uuidv4());

    const [clientData, setClientData] = useState({ clientName: "", clientDob: "", clientCity: "", clientJob: "", clientPhone: "" });
    const [selectedGoal, setSelectedGoal] = useState<string>("LAINNYA");
    const [goalNameCustom, setGoalNameCustom] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [currentSaving, setCurrentSaving] = useState("");

    const [inflation, setInflation] = useState(5);
    const [returnRate, setReturnRate] = useState(6);

    const [result, setResult] = useState<GoalSimulationResult | null>(null);
    const [generatedFiles, setGeneratedFiles] = useState<{ pdfUrl: string | null; mgcToken: string | null; filenameMgc: string | null; filenamePdf: string | null; } | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const backgroundImages = ['/images/goals/rancangtujuanlainnya1.webp', '/images/goals/rancangtujuanlainnya2.webp'];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev === backgroundImages.length - 1 ? 0 : prev + 1));
        }, 6000);
        return () => clearInterval(interval);
    }, [backgroundImages.length]);

    const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClientData({ ...clientData, [e.target.name]: e.target.value });
    };

    const handleMoneyInput = (val: string, setter: (v: string) => void) => {
        const num = val.replace(/\D/g, "");
        setter(num.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        if (result) { setResult(null); setGeneratedFiles(null); }
    };

    const parseMoney = (val: string) => parseInt(val.replace(/\./g, "")) || 0;

    // --- CORE LOGIC: SIMULASI ---
    const handleSimulate = async () => {
        // 1. Cek Kuota
        if (!hasAccess) {
            toast.error("Kuota Habis", { description: "Silakan upgrade ke PRO untuk melakukan simulasi lagi." });
            return;
        }

        // 2. Validasi Input
        if (!clientData.clientName || !clientData.clientDob || !clientData.clientCity || !targetAmount || !targetDate) {
            toast.error("Data Belum Lengkap", { description: "Nama, Tanggal Lahir, Kota, dan Target wajib diisi." });
            return;
        }

        if (new Date(targetDate) <= new Date()) {
            toast.error("Tanggal Invalid", { description: "Target waktu harus di masa depan." });
            return;
        }

        setIsLoading(true);
        setShowPdfModal(true);

        try {
            const activeOption = GOAL_OPTIONS.find(g => g.id === selectedGoal) || GOAL_OPTIONS[3];
            const finalGoalName = selectedGoal === "LAINNYA" && goalNameCustom ? goalNameCustom : activeOption.label;

            const payload: CreateGoalSimulationDto & { sessionId: string } = {
                ...clientData,
                goalName: finalGoalName,
                targetAmount: parseMoney(targetAmount),
                targetDate: targetDate,
                currentSaving: parseMoney(currentSaving),
                inflationRate: inflation,
                returnRate: returnRate,
                sessionId: sessionId.current // [NEW] Kirim Session ID
            };

            const response = await financialService.simulateAgentGoal(payload);

            // [UPDATE: REALTIME SYNC]
            // 1. Update state di hook halaman ini
            await refreshUser();

            // 2. Kirim sinyal ke Sidebar agar progress bar kuota berkurang otomatis
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('refresh_user_data'));
            }

            const token = response.headers['x-mgc-token'];
            if (!token) throw new Error("Token data tidak ditemukan.");

            const payloadBase64 = token.split('.')[0];
            const jsonString = atob(payloadBase64);
            const decodedData = JSON.parse(jsonString);

            setResult(decodedData.result);

            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = window.URL.createObjectURL(pdfBlob);
            const cleanName = clientData.clientName.replace(/[^a-zA-Z0-9]/g, '_') || 'Klien';

            setGeneratedFiles({
                pdfUrl, mgcToken: token,
                filenameMgc: generateSimulationFilename("Rencana Khusus", clientData.clientName, "mgc"),
                filenamePdf: generateSimulationFilename("Rencana Khusus", clientData.clientName, "pdf")
            });

            toast.success("Analisa Selesai", { description: "Sistem telah menemukan strategi terbaik untuk klien Anda." });
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 403) {
                toast.error("Akses Ditolak", { description: "Kuota simulasi Anda telah habis. Mohon upgrade akun." });
                await refreshUser();
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('refresh_user_data'));
                }
            } else {
                toast.error("Gagal Simulasi", { description: "Terjadi kesalahan pada server kalkulasi." });
            }
        } finally {
            setIsLoading(false);
            setShowPdfModal(false);
            if (window.innerWidth < 1024) window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    };

    const handleDownloadFile = (type: 'PDF' | 'MGC') => {
        if (!generatedFiles) return;
        if (type === 'PDF' && generatedFiles.pdfUrl) {
            const link = document.createElement('a');
            link.href = generatedFiles.pdfUrl;
            link.setAttribute('download', generatedFiles.filenamePdf || "Laporan_Goal.pdf");
            document.body.appendChild(link); link.click(); link.remove();
            toast.success("Download File Berhasil");
        } else if (type === 'MGC' && generatedFiles.mgcToken) {
            const blob = new Blob([generatedFiles.mgcToken], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = generatedFiles.filenameMgc || "Backup_Goal.mgc";
            a.click(); window.URL.revokeObjectURL(url);
            toast.info("Backup Data Disimpan");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const tokenContent = (event.target?.result as string)?.trim();
                if (!tokenContent) throw new Error("File kosong");
                const response = await financialService.decodeSimulationToken(tokenContent);
                const rootData = response.data || response;

                if (rootData.meta?.module && rootData.meta.module !== 'GOAL') {
                    toast.error("Format Salah", { description: `File ini adalah data ${rootData.meta.module}, bukan Tujuan Keuangan.` });
                    return;
                }

                const { client, financial } = rootData;
                setClientData({
                    clientName: client.name || "", clientDob: client.dob || "",
                    clientCity: client.city || "", clientJob: client.job || "", clientPhone: client.phone || ""
                });

                if (financial.goalName) {
                    const foundCat = GOAL_OPTIONS.find(opt => opt.label === financial.goalName);
                    setSelectedGoal(foundCat ? foundCat.id : "LAINNYA");
                    setGoalNameCustom(foundCat ? "" : financial.goalName);
                }

                if (financial.targetDate) setTargetDate(new Date(financial.targetDate).toISOString().split('T')[0]);

                const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
                setTargetAmount(fmt(Number(financial.targetAmount) || 0));
                setCurrentSaving(fmt(Number(financial.currentSaving) || 0));
                setInflation(Number(financial.inflationRate) || 5);
                setReturnRate(Number(financial.returnRate) || 6);

                sessionId.current = uuidv4(); // Reset session ID saat import
                toast.success("Restore Berhasil", { description: "Data simulasi telah dimuat kembali." });
                setResult(null); setGeneratedFiles(null);
            } catch (error: any) {
                toast.error("Gagal Import File", { description: error.response?.data?.message || error.message });
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        if (confirm("Hapus seluruh data form dan mulai dari awal?")) {
            setClientData({ clientName: "", clientDob: "", clientCity: "", clientJob: "", clientPhone: "" });
            setTargetAmount(""); setTargetDate(""); setCurrentSaving("");
            setResult(null); setGeneratedFiles(null);
            sessionId.current = uuidv4(); // Reset session ID
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen w-full pb-20 bg-slate-50/50 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
            <PdfLoadingModal isOpen={showPdfModal} />
            <input type="file" ref={fileInputRef} accept=".mgc" className="hidden" onChange={handleFileUpload} />

            <GoalHeader
                backgroundImages={backgroundImages}
                currentImageIndex={currentImageIndex}
                isImporting={isImporting}
                onImportClick={() => fileInputRef.current?.click()}
            />

            <div className="relative z-20 max-w-6xl mx-auto px-4 md:px-6 -mt-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* WRAPPER KIRI (FORM) */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* [NEW] Quota Alert Card */}
                        {!hasAccess && !isAuthLoading && (
                            <Card className="p-5 rounded-2xl bg-red-50 border border-red-200 shadow-sm animate-pulse">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-red-100 rounded-xl text-red-600"><Lock className="w-6 h-6" /></div>
                                    <div>
                                        <h3 className="text-sm font-bold text-red-800">Kuota Habis</h3>
                                        <p className="text-xs text-red-600 mt-1">Upgrade ke PRO untuk akses tanpa batas.</p>
                                        <Link href="/pricing"><Button size="sm" className="mt-3 bg-red-600 w-full rounded-xl">Upgrade</Button></Link>
                                    </div>
                                </div>
                            </Card>
                        )}

                        <GoalInputForm
                            clientData={clientData} handleClientChange={handleClientChange}
                            goalOptions={GOAL_OPTIONS} selectedGoal={selectedGoal} setSelectedGoal={setSelectedGoal}
                            goalNameCustom={goalNameCustom} setGoalNameCustom={setGoalNameCustom}
                            targetAmount={targetAmount} setTargetAmount={setTargetAmount} handleMoneyInput={handleMoneyInput}
                            targetDate={targetDate} setTargetDate={setTargetDate} resetResult={() => setResult(null)}
                            currentSaving={currentSaving} setCurrentSaving={setCurrentSaving}
                            inflation={inflation} setInflation={setInflation}
                            returnRate={returnRate} setReturnRate={setReturnRate}
                            handleReset={handleReset} handleSimulate={handleSimulate} isLoading={isLoading}
                        />
                    </div>

                    {/* WRAPPER KANAN (HASIL) */}
                    <div className="lg:col-span-7">
                        <GoalResults
                            result={result}
                            targetAmount={parseMoney(targetAmount)}
                            inflation={inflation} returnRate={returnRate}
                            generatedFiles={generatedFiles} handleDownloadFile={handleDownloadFile}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}