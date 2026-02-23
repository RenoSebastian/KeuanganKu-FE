"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
    Target, Plane, Heart, Star,
    RefreshCcw, Download, CalendarDays,
    Wallet, Loader2, Sparkles, Upload, FileJson, CheckCircle2, User, Briefcase, MapPin, Calculator, Calendar, ArrowRight,
    Play, Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/financial-math";
import { GoalSimulationResult, CreateGoalSimulationDto } from "@/lib/types";
import { financialService } from "@/services/financial.service";
import { GoalsGuide } from "@/components/features/calculator/goals-guide";
import { PdfLoadingModal } from "@/components/features/finance/pdf-loading-modal";
import { toast } from "sonner";

// Components Visual
import { GoalRealityCard } from "@/components/features/calculator/goals/goal-reality-card";
import { GoalStrategyCard } from "@/components/features/calculator/goals/goal-strategy-card";
import { GoalSolutionCard } from "@/components/features/calculator/goals/goal-solution-card";

// --- KONFIGURASI PILIHAN (Warna Warni Dihilangkan, Fokus ke Profesional) ---
const GOAL_OPTIONS = [
    { id: "IBADAH", label: "Ibadah", icon: Star, desc: "Haji, Umrah, Ziarah" },
    { id: "LIBURAN", label: "Liburan", icon: Plane, desc: "Traveling & Wisata" },
    { id: "PERNIKAHAN", label: "Pernikahan", icon: Heart, desc: "Resepsi & Acara" },
    { id: "LAINNYA", label: "Lainnya", icon: Target, desc: "Gadget, Rumah, Kendaraan" },
];

// --- COMPONENT: ANIMATED NUMBER ---
function AnimatedNumber({ value, className, isCurrency = true }: { value: number, className?: string, isCurrency?: boolean }) {
    const formatValue = (val: number) => {
        if (isCurrency) {
            return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0
            }).format(Math.abs(val));
        }
        return Math.round(val).toString();
    };

    const [displayVal, setDisplayVal] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1000;

        if (value === 0) {
            setDisplayVal(0);
            return;
        }

        const increment = value / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if ((increment > 0 && start >= value) || (increment < 0 && start <= value)) {
                setDisplayVal(value);
                clearInterval(timer);
            } else {
                setDisplayVal(start);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <span className={cn("font-mono tracking-tighter break-all w-full overflow-hidden", className)}>
            {value < 0 ? "-" : ""}{formatValue(displayVal)}
        </span>
    );
}

// --- MAIN PAGE COMPONENT ---
export default function GoalsPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- STATE 1: IDENTITY ---
    const [clientData, setClientData] = useState({
        clientName: "",
        clientDob: "",
        clientCity: "",
        clientJob: "",
        clientPhone: ""
    });

    // --- STATE 2: GOAL PARAMETERS ---
    const [selectedGoal, setSelectedGoal] = useState<string>("LAINNYA");
    const [goalNameCustom, setGoalNameCustom] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [targetDate, setTargetDate] = useState("");
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
        }, 6000);
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
        if (result) {
            setResult(null);
            setGeneratedFiles(null);
        }
    };

    const parseMoney = (val: string) => parseInt(val.replace(/\./g, "")) || 0;

    // --- CORE LOGIC 1: SIMULATE ---
    const handleSimulate = async () => {
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

            const payload: CreateGoalSimulationDto = {
                ...clientData,
                goalName: finalGoalName,
                targetAmount: parseMoney(targetAmount),
                targetDate: targetDate,
                currentSaving: parseMoney(currentSaving),
                inflationRate: inflation,
                returnRate: returnRate
            };

            const response = await financialService.simulateAgentGoal(payload);

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
                pdfUrl,
                mgcToken: token,
                filenameMgc: `Backup_Goal_${cleanName}.mgc`,
                filenamePdf: `Rencana_Goal_${cleanName}.pdf`
            });

            toast.success("Analisa Selesai", { description: "Sistem telah menemukan strategi terbaik untuk klien Anda." });

        } catch (error) {
            console.error("Simulation Error:", error);
            toast.error("Gagal Simulasi", { description: "Terjadi kesalahan pada server kalkulasi." });
        } finally {
            setIsLoading(false);
            setShowPdfModal(false);
            if (window.innerWidth < 1024) {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
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
            toast.success("Download File Berhasil");
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
                const rawContent = event.target?.result as string;
                const tokenContent = rawContent ? rawContent.trim() : "";

                if (!tokenContent) throw new Error("File kosong");

                const response = await financialService.decodeSimulationToken(tokenContent);
                const rootData = response.data || response;

                if (rootData.meta?.module && rootData.meta.module !== 'GOAL') {
                    toast.error("Format Salah", { description: `File ini adalah data ${rootData.meta.module}, bukan Tujuan Keuangan.` });
                    return;
                }

                const { client, financial } = rootData;

                setClientData({
                    clientName: client.name || "",
                    clientDob: client.dob || "",
                    clientCity: client.city || "",
                    clientJob: client.job || "",
                    clientPhone: client.phone || ""
                });

                if (financial.goalName) {
                    const foundCategory = GOAL_OPTIONS.find(opt => opt.label === financial.goalName);
                    if (foundCategory) {
                        setSelectedGoal(foundCategory.id);
                        setGoalNameCustom("");
                    } else {
                        setSelectedGoal("LAINNYA");
                        setGoalNameCustom(financial.goalName);
                    }
                }

                if (financial.targetDate) {
                    const dateObj = new Date(financial.targetDate);
                    const dateStr = dateObj.toISOString().split('T')[0];
                    setTargetDate(dateStr);
                }

                const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
                setTargetAmount(fmt(Number(financial.targetAmount) || 0));
                setCurrentSaving(fmt(Number(financial.currentSaving) || 0));

                setInflation(Number(financial.inflationRate) || 5);
                setReturnRate(Number(financial.returnRate) || 6);

                toast.success("Restore Berhasil", { description: "Data simulasi telah dimuat kembali." });
                setResult(null);
                setGeneratedFiles(null);

            } catch (error: any) {
                console.error("Import Error:", error);
                const backendMessage = error.response?.data?.message || error.message;
                toast.error("Gagal Import File", { description: backendMessage });
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen w-full pb-20 bg-slate-50/50 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">

            <PdfLoadingModal isOpen={showPdfModal} />

            {/* =========================================
                EXECUTIVE HEADER SECTION 
                ========================================= */}
            <div className="relative pt-12 pb-36 px-5 overflow-hidden bg-slate-900 shadow-2xl">
                <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                    {backgroundImages.map((image, index) => (
                        <div key={image}
                            className={cn("absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-2000 ease-in-out", index === currentImageIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100')}
                            style={{ backgroundImage: `url(${image})` }}
                        />
                    ))}
                    <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply backdrop-blur-[2px]" />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent" />
                </div>

                <div className="relative z-20 max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mt-4">
                    <div className="text-left animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="inline-flex items-center gap-2 bg-indigo-500/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-indigo-500/30 mb-4 shadow-lg">
                            <Sparkles className="w-4 h-4 text-indigo-300" />
                            <span className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em]">Goal Simulator</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 tracking-tighter drop-shadow-md">
                            Rencana <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-cyan-300">Masa Depan</span>
                        </h1>
                        <p className="text-slate-300 text-sm md:text-base max-w-lg font-medium leading-relaxed drop-shadow-sm">
                            Kalkulasi strategis berbasis inflasi untuk mewujudkan impian finansial klien Anda secara pasti.
                        </p>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-white/10 backdrop-blur-xl border border-white/10 p-5 rounded-[1.5rem] flex items-center gap-5 max-w-sm w-full cursor-pointer group shadow-2xl animate-in fade-in slide-in-from-right-8 duration-700 delay-150"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/80 border border-indigo-400/50 flex items-center justify-center text-white shadow-inner group-hover:rotate-12 transition-all duration-300 shrink-0">
                            {isImporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                        </div>
                        <div className="text-left flex-1">
                            <h4 className="text-base font-black text-white tracking-tight">Restore Sesi (.mgc)</h4>
                            <p className="text-[11px] text-slate-300 font-medium">Muat ulang data kalkulasi klien.</p>
                        </div>
                        <input type="file" ref={fileInputRef} accept=".mgc" className="hidden" onChange={handleFileUpload} />
                    </motion.div>
                </div>
            </div>

            {/* =========================================
                MAIN CONTENT (Two Columns)
                ========================================= */}
            <div className="relative z-20 max-w-6xl mx-auto px-4 md:px-6 -mt-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

                    {/* KIRI: INPUT FORM */}
                    <div className="lg:col-span-5 space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300 flex flex-col">

                        {/* 1. GOAL SELECTOR */}
                        <Card className="p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border-0 bg-white/95 backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-inner"><Target className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Pilih Impian</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Kategori Tujuan Finansial</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {GOAL_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => { setSelectedGoal(option.id); setResult(null); }}
                                        className={cn(
                                            "flex flex-col items-start justify-center p-4 rounded-2xl border-2 transition-all duration-300 gap-2 overflow-hidden relative group active:scale-95",
                                            selectedGoal === option.id
                                                ? "border-transparent shadow-lg shadow-indigo-600/20 bg-indigo-600 text-white"
                                                : "bg-white border-slate-100 text-slate-500 hover:border-indigo-100"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-2 rounded-xl transition-colors z-10",
                                            selectedGoal === option.id ? "bg-white/20 text-white" : "bg-slate-50 text-slate-400 group-hover:text-indigo-500"
                                        )}>
                                            <option.icon className="w-5 h-5" />
                                        </div>
                                        <div className="text-left relative z-10">
                                            <span className="text-sm font-black tracking-tight block">{option.label}</span>
                                            <span className={cn("text-[9px] font-medium leading-tight block mt-0.5", selectedGoal === option.id ? "text-indigo-100" : "text-slate-400")}>{option.desc}</span>
                                        </div>

                                        {selectedGoal === option.id && (
                                            <motion.div layoutId="goalSelector" className="absolute inset-0 bg-white/10 w-full h-full z-0 pointer-events-none" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence>
                                {selectedGoal === "LAINNYA" && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mt-4"
                                    >
                                        <div className="group space-y-1.5 pt-2">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Nama Impian Spesifik <span className="text-rose-500">*</span></Label>
                                            <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                                <Input value={goalNameCustom} onChange={e => setGoalNameCustom(e.target.value)} placeholder="Misal: Beli Mobil SUV" className="pl-11 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 transition-all shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>

                        {/* 2. DATA KLIEN */}
                        <Card className="p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border-0 bg-white/95 backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl shadow-inner"><User className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Profil Klien</h3>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="group space-y-1.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Nama Lengkap <span className="text-rose-500">*</span></Label>
                                    <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                                        <Input name="clientName" placeholder="Cth: Budi Santoso" value={clientData.clientName} onChange={handleClientChange} className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl font-black text-lg text-slate-800 transition-all shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="group space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Tgl Lahir <span className="text-rose-500">*</span></Label>
                                        <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                                            <Input type="date" name="clientDob" value={clientData.clientDob} onChange={handleClientChange} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 transition-all shadow-sm block w-full focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white" />
                                        </div>
                                    </div>
                                    <div className="group space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Kota <span className="text-rose-500">*</span></Label>
                                        <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                                            <Input name="clientCity" placeholder="Bandung" value={clientData.clientCity} onChange={handleClientChange} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 transition-all shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="group space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">No. HP <span className="text-[9px] font-normal lowercase">(Opsional)</span></Label>
                                        <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                                            <Input type="tel" inputMode="numeric" name="clientPhone" placeholder="0812..." value={clientData.clientPhone} onChange={handleClientChange} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 transition-all shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white" />
                                        </div>
                                    </div>
                                    <div className="group space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Pekerjaan <span className="text-[9px] font-normal lowercase">(Opsional)</span></Label>
                                        <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                                            <Input name="clientJob" placeholder="PNS" value={clientData.clientJob} onChange={handleClientChange} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 transition-all shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* 3. FINANCIAL PARAMETERS */}
                        <Card className="p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border-0 bg-white/95 backdrop-blur-xl flex-1 flex flex-col">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl shadow-inner"><Wallet className="w-5 h-5" /></div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Kalkulasi Finansial</h3>
                                </div>
                            </div>

                            <div className="space-y-6 flex-1 flex flex-col justify-between">
                                <div className="space-y-6">
                                    {/* Uang Target */}
                                    <div className="group space-y-1.5">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">
                                            Estimasi Biaya Saat Ini <span className="text-rose-500">*</span>
                                        </Label>
                                        <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs group-focus-within:text-indigo-600 transition-colors">Rp</div>
                                            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 font-light text-xl">|</div>
                                            <Input className="pl-14 h-14 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white font-black text-xl text-slate-800 transition-all shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400" placeholder="0" value={targetAmount} onChange={(e) => handleMoneyInput(e.target.value, setTargetAmount)} inputMode="numeric" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                        {/* Target Date */}
                                        <div className="group space-y-1.5">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Target Tercapai <span className="text-rose-500">*</span></Label>
                                            <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                                                <Input type="date" value={targetDate} onChange={e => { setTargetDate(e.target.value); setResult(null); }} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 transition-all shadow-sm block w-full focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white" min={new Date().toISOString().split("T")[0]} />
                                            </div>
                                        </div>

                                        {/* Current Saving */}
                                        <div className="group space-y-1.5">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Tabungan Awal <span className="text-[9px] font-normal lowercase text-slate-400">(Opsional)</span></Label>
                                            <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-[10px] group-focus-within:text-indigo-600 transition-colors">Rp</div>
                                                <Input value={currentSaving} onChange={e => handleMoneyInput(e.target.value, setCurrentSaving)} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 transition-all shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white" placeholder="0" inputMode="numeric" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Asumsi Makro Ekonomi */}
                                    <div className="mt-6 space-y-6 pt-6 border-t border-slate-100">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                <span>Asumsi Inflasi Tahunan</span>
                                                <span className="text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">{inflation}%</span>
                                            </div>
                                            <Slider value={inflation} onChange={(v) => { setInflation(v); setResult(null); }} min={0} max={15} step={0.5} className="py-2" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                <span>Return Investasi Tahunan</span>
                                                <span className="text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">{returnRate}%</span>
                                            </div>
                                            <Slider value={returnRate} onChange={(v) => { setReturnRate(v); setResult(null); }} min={0} max={20} step={0.5} className="py-2" />
                                        </div>
                                    </div>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="flex gap-3 pt-8 mt-6 border-t border-slate-100 w-full">
                                    <Button variant="outline" onClick={handleReset} className="h-14 w-14 rounded-2xl border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-rose-600 shrink-0 shadow-sm active:scale-95 transition-all" title="Reset Semua">
                                        <RefreshCcw className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        onClick={handleSimulate}
                                        disabled={isLoading}
                                        className="h-14 flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-5 h-5 mr-2 fill-white" />}
                                        Jalankan Kalkulasi
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* KANAN: RESULT DISPLAY */}
                    <div className="lg:col-span-7 space-y-6">
                        {!result ? (
                            <div className="h-full min-h-125 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-300/60 rounded-[2.5rem] bg-white/40 backdrop-blur-sm animate-in fade-in duration-1000">
                                <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 bg-white">
                                    <Calculator className="w-12 h-12 text-slate-300" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Kalkulator Siap</h3>
                                <p className="text-slate-500 text-sm mt-2 max-w-sm font-medium leading-relaxed">
                                    Silakan lengkapi profil dan tujuan klien di sisi kiri, lalu tekan <strong>Jalankan Kalkulasi</strong>.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">

                                {/* 1. BANNER SUKSES & DOWNLOAD (Profesional Green) */}
                                {generatedFiles && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 p-1.5 rounded-[1.5rem] shadow-md shadow-emerald-500/10">
                                        <div className="bg-white p-4 md:p-5 rounded-4xl flex flex-col md:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 w-full">
                                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200">
                                                    <CheckCircle2 className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black text-slate-800 text-sm md:text-base tracking-tight">Analisa Tersimpan!</h4>
                                                    <p className="text-[11px] md:text-xs text-slate-500 font-medium mt-0.5">Laporan siap dipresentasikan.</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 w-full md:w-auto justify-end">
                                                <Button size="sm" variant="outline" onClick={() => handleDownloadFile('MGC')} className="h-11 px-4 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-xl font-bold shadow-sm active:scale-95 transition-all" title="Simpan File Simulasi (.mgc)">
                                                    <FileJson className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">.MGC</span>
                                                </Button>
                                                <Button size="sm" onClick={() => handleDownloadFile('PDF')} className="h-11 px-6 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold shadow-md active:scale-95 transition-all">
                                                    <Download className="w-4 h-4 mr-2" /> Unduh PDF
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* RESULT CARDS (Imported Components) */}
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="show"
                                    className="space-y-6"
                                >
                                    {/* Component 1: Dampak Inflasi (Reality Check) */}
                                    <motion.div variants={itemVariants}>
                                        <GoalRealityCard
                                            targetAmount={parseMoney(targetAmount)}
                                            futureTargetAmount={result.futureTargetAmount}
                                            inflationRate={inflation}
                                            yearsDuration={result.yearsDuration}
                                        />
                                    </motion.div>

                                    {/* Component 2: Solusi Nabung (Hero Bento) */}
                                    <motion.div variants={itemVariants}>
                                        <GoalSolutionCard
                                            monthlySaving={result.monthlySaving}
                                            totalTarget={result.futureTargetAmount}
                                            yearsDuration={result.yearsDuration}
                                            returnRate={returnRate}
                                            isSurplus={result.netTarget <= 0}
                                        />
                                    </motion.div>

                                    {/* Component 3: Strategic Gap */}
                                    <motion.div variants={itemVariants}>
                                        <GoalStrategyCard
                                            futureTargetAmount={result.futureTargetAmount}
                                            futureExistingFund={result.futureExistingFund}
                                            returnRate={returnRate}
                                            netTarget={result.netTarget}
                                        />
                                    </motion.div>
                                </motion.div>

                            </div>
                        )}

                        <GoalsGuide />
                    </div>

                </div>
            </div>
        </div>
    );
}