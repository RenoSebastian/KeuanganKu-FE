"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
    Target, Plane, Heart, Star,
    RefreshCcw, Download, CalendarDays, Coins,
    TrendingUp, Wallet, ArrowRight, Loader2, Sparkles, Upload, FileJson, CheckCircle2, User, Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/financial-math";
import { GoalSimulationResult, CreateGoalSimulationDto } from "@/lib/types";
import { financialService } from "@/services/financial.service";
import { GoalsGuide } from "@/components/features/calculator/goals-guide";
import { PdfLoadingModal } from "@/components/features/finance/pdf-loading-modal";
import { toast } from "sonner";

// Components Visual (Fase 2)
import { GoalRealityCard } from "@/components/features/calculator/goals/goal-reality-card";
import { GoalStrategyCard } from "@/components/features/calculator/goals/goal-strategy-card";
import { GoalSolutionCard } from "@/components/features/calculator/goals/goal-solution-card";

// --- KONFIGURASI TEMA PER TUJUAN ---
const GOAL_OPTIONS = [
    {
        id: "IBADAH",
        label: "Ibadah",
        icon: Star,
        color: "text-emerald-600",
        gradient: "from-emerald-500 to-teal-700",
        desc: "Haji, Umrah, atau Ziarah"
    },
    {
        id: "LIBURAN",
        label: "Liburan",
        icon: Plane,
        color: "text-sky-600",
        gradient: "from-sky-500 to-blue-700",
        desc: "Traveling & Wisata Impian"
    },
    {
        id: "PERNIKAHAN",
        label: "Pernikahan",
        icon: Heart,
        color: "text-rose-600",
        gradient: "from-rose-500 to-pink-700",
        desc: "Resepsi & Honeymoon"
    },
    {
        id: "LAINNYA",
        label: "Lainnya",
        icon: Target,
        color: "text-violet-600",
        gradient: "from-violet-500 to-purple-700",
        desc: "Gadget, Hobi, Renovasi, DP Rumah"
    },
];

export default function GoalsPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- STATE 1: IDENTITY ---
    const [clientData, setClientData] = useState({
        clientName: "",
        clientDob: "", // [FIXED] Wajib diisi via UI
        clientCity: "",
        clientJob: "",
        clientPhone: ""
    });

    // --- STATE 2: GOAL PARAMETERS ---
    const [selectedGoal, setSelectedGoal] = useState<string>("LAINNYA");
    const [goalNameCustom, setGoalNameCustom] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [targetDate, setTargetDate] = useState(""); // YYYY-MM-DD
    const [currentSaving, setCurrentSaving] = useState("");

    // --- STATE 3: ECONOMICS ---
    const [inflation, setInflation] = useState(5);
    const [returnRate, setReturnRate] = useState(6);

    // --- STATE 4: RESULT & FILES ---
    const [result, setResult] = useState<GoalSimulationResult | null>(null);

    const [generatedFiles, setGeneratedFiles] = useState<{
        pdfUrl: string | null;
        mgcToken: string | null;
        filenameMgc: string | null;
        filenamePdf: string | null;
    } | null>(null);

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);

    // --- BACKGROUND SLIDESHOW ---
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const backgroundImages = [
        '/images/goals/rancangtujuanlainnya1.webp',
        '/images/goals/rancangtujuanlainnya2.webp'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev === backgroundImages.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [backgroundImages.length]);

    // --- HANDLERS: INPUT ---
    const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClientData({ ...clientData, [e.target.name]: e.target.value });
    };

    const handleMoneyInput = (val: string, setter: (v: string) => void) => {
        const num = val.replace(/\D/g, "");
        if (num.length > 1 && num.startsWith("0")) {
            setter(num.substring(1).replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        } else {
            setter(num.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        }
        // Reset result jika input vital berubah
        if (result) {
            setResult(null);
            setGeneratedFiles(null);
        }
    };

    const parseMoney = (val: string) => parseInt(val.replace(/\./g, "")) || 0;

    // --- CORE LOGIC 1: SIMULATE (PREVIEW FIRST) ---
    const handleSimulate = async () => {
        // 1. Validasi
        if (!clientData.clientName || !clientData.clientDob || !clientData.clientCity || !targetAmount || !targetDate) {
            toast.error("Data Belum Lengkap", { description: "Nama, Tanggal Lahir, Kota, dan Target wajib diisi." });
            return;
        }

        // Cek tanggal harus masa depan
        if (new Date(targetDate) <= new Date()) {
            toast.error("Tanggal Invalid", { description: "Target waktu harus di masa depan." });
            return;
        }

        setIsLoading(true);
        setShowPdfModal(true);

        try {
            const selectedLabel = GOAL_OPTIONS.find(g => g.id === selectedGoal)?.label || "Goal";
            const finalGoalName = selectedGoal === "LAINNYA" && goalNameCustom ? goalNameCustom : selectedLabel;

            const payload: CreateGoalSimulationDto = {
                ...clientData,
                goalName: finalGoalName,
                targetAmount: parseMoney(targetAmount),
                targetDate: targetDate,
                currentSaving: parseMoney(currentSaving),
                inflationRate: inflation,
                returnRate: returnRate
            };

            // 2. Call API (Stateless)
            const response = await financialService.simulateAgentGoal(payload);

            // 3. Handle Token Header
            const token = response.headers['x-mgc-token'];
            if (!token) throw new Error("Token data tidak ditemukan.");

            const payloadBase64 = token.split('.')[0];
            const jsonString = atob(payloadBase64);
            const decodedData = JSON.parse(jsonString);

            setResult(decodedData.result);

            // 4. Handle PDF Blob
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = window.URL.createObjectURL(pdfBlob);
            const cleanName = clientData.clientName.replace(/[^a-zA-Z0-9]/g, '_') || 'Klien';

            setGeneratedFiles({
                pdfUrl,
                mgcToken: token,
                filenameMgc: `Backup_Goal_${cleanName}.mgc`,
                filenamePdf: `Rencana_Goal_${cleanName}.pdf`
            });

            toast.success("Analisa Selesai", { description: "Cek hasil perhitungan di panel kanan." });

        } catch (error) {
            console.error("Simulation Error:", error);
            toast.error("Gagal Simulasi", { description: "Terjadi kesalahan pada server." });
        } finally {
            setIsLoading(false);
            setShowPdfModal(false);
        }
    };

    // --- CORE LOGIC 2: DOWNLOAD ---
    const handleDownloadFile = (type: 'PDF' | 'MGC') => {
        if (!generatedFiles) return;

        if (type === 'PDF' && generatedFiles.pdfUrl) {
            const link = document.createElement('a');
            link.href = generatedFiles.pdfUrl;
            link.setAttribute('download', generatedFiles.filenamePdf || "Laporan_Goal.pdf");
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Download PDF Berhasil");
        }
        else if (type === 'MGC' && generatedFiles.mgcToken) {
            const blob = new Blob([generatedFiles.mgcToken], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = generatedFiles.filenameMgc || "Backup_Goal.mgc";
            a.click();
            window.URL.revokeObjectURL(url);
            toast.info("Backup Data Disimpan");
        }
    };

    // --- CORE LOGIC 3: IMPORT .MGC ---
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const tokenContent = event.target?.result as string;
                const response = await financialService.decodeSimulationToken(tokenContent);

                if (response.data.meta?.module && response.data.meta.module !== 'GOAL') {
                    toast.error("Format Salah", { description: "File ini bukan data simulasi Tujuan Keuangan." });
                    return;
                }

                const { client, financial } = response.data;

                // Populate Form
                setClientData({
                    clientName: client.name,
                    clientDob: client.dob, // Restore DOB
                    clientCity: client.city,
                    clientJob: client.job || "",
                    clientPhone: client.phone || ""
                });

                // Set Goal Params
                // Mencoba menebak kategori berdasarkan nama, default LAINNYA
                const foundCategory = GOAL_OPTIONS.find(opt => opt.label === financial.goalName);
                if (foundCategory) {
                    setSelectedGoal(foundCategory.id);
                    setGoalNameCustom("");
                } else {
                    setSelectedGoal("LAINNYA");
                    setGoalNameCustom(financial.goalName);
                }

                setTargetDate(financial.targetDate);

                const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
                setTargetAmount(fmt(financial.targetAmount));
                setCurrentSaving(fmt(financial.currentSaving || 0));

                setInflation(financial.inflationRate || 5);
                setReturnRate(financial.returnRate || 6);

                toast.success("Restore Berhasil", { description: "Data simulasi telah dimuat kembali." });
                setResult(null); // Force re-calculate
                setGeneratedFiles(null);

            } catch (error) {
                toast.error("File Rusak", { description: "Gagal membaca file backup." });
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        if (confirm("Reset seluruh form?")) {
            setClientData({ clientName: "", clientDob: "", clientCity: "", clientJob: "", clientPhone: "" });
            setTargetAmount(""); setTargetDate(""); setCurrentSaving("");
            setResult(null); setGeneratedFiles(null);
        }
    };

    const currentTheme = GOAL_OPTIONS.find(g => g.id === selectedGoal) || GOAL_OPTIONS[3];

    return (
        <div className="min-h-full w-full pb-24 md:pb-12 bg-slate-50/50">

            <PdfLoadingModal isOpen={showPdfModal} />

            {/* --- HEADER --- */}
            <div className="relative pt-10 pb-32 px-5 overflow-hidden shadow-2xl bg-brand-900">
                {/* Background Layers */}
                <div className="absolute inset-0 w-full h-full z-0">
                    {backgroundImages.map((image, index) => (
                        <div key={image}
                            className={cn("absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000", index === currentImageIndex ? 'opacity-100' : 'opacity-0')}
                            style={{ backgroundImage: `url(${image})` }}
                        />
                    ))}
                    <div className="absolute inset-0 bg-brand-900/85 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-linear-to-t from-brand-800 via-transparent to-transparent" />
                </div>

                <div className="relative z-20 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-4 shadow-lg">
                            <Target className="w-4 h-4 text-cyan-300" />
                            <span className="text-[10px] font-bold text-cyan-100 tracking-widest uppercase">Special Goal Planner</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3 drop-shadow-xl">
                            Wujudkan Mimpi
                        </h1>
                        <p className="text-brand-100 text-sm md:text-base max-w-lg leading-relaxed opacity-90 drop-shadow-md">
                            Apapun impiannya, mari kita hitung strategi menabung yang tepat untuk mencapainya bersama MAXIPRO.
                        </p>
                    </div>

                    {/* Import Button */}
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 rounded-xl flex items-center gap-4 max-w-sm w-full hover:bg-white/15 transition-colors cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            {isImporting ? <Loader2 className="w-5 h-5 text-cyan-300 animate-spin" /> : <Upload className="w-5 h-5 text-cyan-300" />}
                        </div>
                        <div className="text-left">
                            <h4 className="text-sm font-bold text-white">Import File .mgc</h4>
                            <p className="text-xs text-brand-200">Load data simulasi sebelumnya</p>
                        </div>
                        <input type="file" ref={fileInputRef} accept=".mgc" className="hidden" onChange={handleFileUpload} />
                    </Card>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="relative z-20 max-w-6xl mx-auto px-4 md:px-6 -mt-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT: INPUTS */}
                    <div className="lg:col-span-6 space-y-6">

                        {/* 1. DATA KLIEN */}
                        <Card className="p-6 rounded-[2rem] shadow-xl border-white/60 bg-white">
                            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <User className="w-4 h-4 text-brand-600" /> Profil Klien
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-xs font-semibold text-slate-500">Nama Lengkap</Label>
                                    <Input name="clientName" placeholder="Contoh: Budi Santoso" value={clientData.clientName} onChange={handleClientChange} className="mt-1" />
                                </div>
                                {/* [FIXED] Menambahkan Input Tanggal Lahir yang sebelumnya hilang */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-semibold text-slate-500">Tanggal Lahir</Label>
                                        <div className="relative mt-1">
                                            <CalendarDays className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                            <Input type="date" name="clientDob" value={clientData.clientDob} onChange={handleClientChange} className="pl-9" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-semibold text-slate-500">Kota Domisili</Label>
                                        <Input name="clientCity" placeholder="Jakarta" value={clientData.clientCity} onChange={handleClientChange} className="mt-1" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-semibold text-slate-500">Pekerjaan</Label>
                                        <div className="relative mt-1">
                                            <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                            <Input name="clientJob" placeholder="Swasta" value={clientData.clientJob} onChange={handleClientChange} className="pl-9" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-semibold text-slate-500">No. HP (Opsional)</Label>
                                        <Input name="clientPhone" placeholder="081..." value={clientData.clientPhone} onChange={handleClientChange} className="mt-1" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* 2. GOAL SELECTOR */}
                        <Card className="p-6 rounded-[2rem] shadow-xl border-white/60 bg-white">
                            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4 text-brand-600" /> Pilih Tujuan
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                {GOAL_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => { setSelectedGoal(option.id); setResult(null); }}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 gap-2 h-24",
                                            selectedGoal === option.id
                                                ? "bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-600/20 scale-105"
                                                : "bg-white border-slate-100 text-slate-500 hover:border-brand-200 hover:bg-brand-50/50"
                                        )}
                                    >
                                        <option.icon className={cn("w-5 h-5", selectedGoal === option.id ? "text-white" : option.color)} />
                                        <span className="text-xs font-bold">{option.label}</span>
                                    </button>
                                ))}
                            </div>

                            {selectedGoal === "LAINNYA" && (
                                <div className="mt-4 animate-in fade-in zoom-in duration-300">
                                    <Label className="text-xs font-semibold text-slate-500">Nama Tujuan Spesifik</Label>
                                    <Input
                                        placeholder="Misal: Renovasi Rumah, Beli Gadget"
                                        value={goalNameCustom}
                                        onChange={e => setGoalNameCustom(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                            )}
                        </Card>

                        {/* 3. FINANCIAL INPUTS */}
                        <Card className="p-6 rounded-[2rem] shadow-xl border-white/60 bg-white">
                            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-brand-600" /> Parameter Keuangan
                            </h3>
                            <div className="space-y-4">
                                {/* Cost */}
                                <div>
                                    <Label className="text-xs font-semibold text-slate-500 uppercase">Harga Saat Ini</Label>
                                    <div className="relative mt-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">Rp</span>
                                        <Input
                                            value={targetAmount}
                                            onChange={e => handleMoneyInput(e.target.value, setTargetAmount)}
                                            className="pl-10 font-bold text-lg h-12"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {/* Target Date */}
                                <div>
                                    <Label className="text-xs font-semibold text-slate-500 uppercase">Target Tercapai Pada</Label>
                                    <div className="relative mt-1">
                                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            type="date"
                                            value={targetDate}
                                            onChange={e => { setTargetDate(e.target.value); setResult(null); }}
                                            className="pl-10 h-12 font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Current Saving */}
                                <div>
                                    <Label className="text-xs font-semibold text-emerald-600 uppercase">Modal Awal / Tabungan Tersedia</Label>
                                    <div className="relative mt-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-500 text-sm">Rp</span>
                                        <Input
                                            value={currentSaving}
                                            onChange={e => handleMoneyInput(e.target.value, setCurrentSaving)}
                                            className="pl-10 font-bold text-lg h-12 border-emerald-200 bg-emerald-50/30 text-emerald-800 focus:border-emerald-500"
                                            placeholder="0 (Opsional)"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sliders */}
                            <div className="mt-6 space-y-6 pt-6 border-t border-slate-100">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-500">
                                        <span>Inflasi Tahunan</span>
                                        <span>{inflation}%</span>
                                    </div>
                                    <Slider value={inflation} onChange={(v) => { setInflation(v); setResult(null); }} min={0} max={15} step={0.5} className="accent-rose-500" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-500">
                                        <span>Return Investasi</span>
                                        <span>{returnRate}%</span>
                                    </div>
                                    <Slider value={returnRate} onChange={(v) => { setReturnRate(v); setResult(null); }} min={0} max={20} step={0.5} className="accent-emerald-500" />
                                </div>
                            </div>
                        </Card>

                        {/* ACTION BUTTONS */}
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" onClick={handleReset} className="flex-1 h-12 rounded-xl border-slate-300">
                                <RefreshCcw className="w-4 h-4 mr-2" /> Reset
                            </Button>
                            <Button
                                onClick={handleSimulate}
                                disabled={isLoading}
                                className="flex-2 h-12 bg-brand-600 hover:bg-brand-700 font-bold text-lg shadow-lg shadow-brand-500/20 rounded-xl transition-all"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                                Lihat Analisa
                            </Button>
                        </div>

                    </div>

                    {/* RIGHT: RESULTS */}
                    <div className="lg:col-span-6 space-y-6">
                        {!result ? (
                            <div className="h-full min-h-100 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 bg-white/50 rounded-[2rem]">
                                <div className={cn("w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-slate-100 transition-colors duration-500", currentTheme.color.replace("text-", "bg-").replace("600", "50"))}>
                                    <currentTheme.icon className={cn("w-10 h-10 opacity-50", currentTheme.color)} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700">Area Hasil Simulasi</h3>
                                <p className="text-slate-500 text-sm mt-2 max-w-xs leading-relaxed">
                                    Lengkapi form di samping untuk melihat strategi pencapaian tujuan keuangan Anda.
                                </p>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">

                                {/* 1. DOWNLOAD CENTER */}
                                {generatedFiles && (
                                    <Card className="bg-emerald-50 border-emerald-200 p-4 rounded-xl flex flex-col items-center gap-4 shadow-sm">
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <div className="grow">
                                                <h4 className="font-bold text-emerald-800 text-sm">Analisa Selesai</h4>
                                                <p className="text-xs text-emerald-600">Dokumen siap diunduh.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full">
                                            <Button size="sm" onClick={() => handleDownloadFile('PDF')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-10 rounded-lg">
                                                <Download className="w-4 h-4 mr-2" /> Download Laporan PDF
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleDownloadFile('MGC')} className="w-12 h-10 border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-100 rounded-lg" title="Simpan Backup (.mgc)">
                                                <FileJson className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                )}

                                {/* 2. REALITY CHECK */}
                                <GoalRealityCard
                                    targetAmount={parseMoney(targetAmount)}
                                    futureTargetAmount={result.futureTargetAmount}
                                    inflationRate={inflation}
                                    yearsDuration={result.yearsDuration}
                                />

                                {/* 3. SOLUTION CARD (HERO) */}
                                <GoalSolutionCard
                                    monthlySaving={result.monthlySaving}
                                    totalTarget={result.futureTargetAmount}
                                    yearsDuration={result.yearsDuration}
                                    returnRate={returnRate}
                                    isSurplus={result.netTarget <= 0}
                                />

                                {/* 4. STRATEGY GAP */}
                                <GoalStrategyCard
                                    futureTargetAmount={result.futureTargetAmount}
                                    futureExistingFund={result.futureExistingFund}
                                    returnRate={returnRate}
                                    netTarget={result.netTarget}
                                />

                            </div>
                        )}
                        <GoalsGuide />
                    </div>

                </div>
            </div>
        </div>
    );
}