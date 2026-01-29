"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
    Target, Plane, Heart, Star,
    RefreshCcw, Download, CalendarDays, Coins,
    TrendingUp, Wallet, ArrowRight, Loader2, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/financial-math";
import { GoalSimulationResult, GoalType, GoalSimulationInput } from "@/lib/types";
import { financialService } from "@/services/financial.service";
import { GoalsGuide } from "@/components/features/calculator/goals-guide";
import { PdfLoadingModal } from "@/components/features/finance/pdf-loading-modal";

// --- KONFIGURASI TEMA PER TUJUAN ---
const GOAL_OPTIONS: { id: GoalType; label: string; icon: any; color: string; gradient: string; desc: string }[] = [
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
        desc: "Gadget, Hobi, Renovasi"
    },
];

export default function GoalsPage() {
    // --- STATE INPUT & RESULT ---
    const [selectedGoal, setSelectedGoal] = useState<GoalType>("LAINNYA");
    const [currentCost, setCurrentCost] = useState("");
    const [duration, setDuration] = useState("5");
    const [inflation, setInflation] = useState(5);
    const [investmentRate, setInvestmentRate] = useState(6);

    const [result, setResult] = useState<GoalSimulationResult | null>(null);

    // State UI
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedId, setSavedId] = useState<string | null>(null); // ID for PDF
    const [showPdfModal, setShowPdfModal] = useState(false);     // Modal PDF

    // --- STATE BACKGROUND SLIDESHOW (HEADER) ---
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const backgroundImages = [
        '/images/goals/rancangtujuanlainnya1.webp',
        '/images/goals/rancangtujuanlainnya2.webp'
    ];

    // --- EFFECT: BACKGROUND ROTATION ---
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // Ganti gambar setiap 5 detik

        return () => clearInterval(interval);
    }, [backgroundImages.length]);

    // --- HANDLERS ---
    const handleMoneyInput = (val: string) => {
        let num = val.replace(/\D/g, "");
        if (num.length > 1 && num.startsWith("0")) num = num.substring(1);
        setCurrentCost(num.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        // Reset result jika input berubah agar user menghitung ulang
        if (result) {
            setResult(null);
            setSavedId(null);
        }
    };

    const handleCalculate = async () => {
        const cost = parseInt(currentCost.replace(/\./g, "")) || 0;
        const years = parseInt(duration) || 0;

        if (cost === 0 || years === 0) {
            alert("Mohon lengkapi estimasi biaya dan jangka waktu.");
            return;
        }

        setIsLoading(true);

        try {
            const payload: GoalSimulationInput = {
                currentCost: cost,
                years: years,
                inflationRate: inflation,
                returnRate: investmentRate
            };

            // Call API Service (Simulasi)
            const data = await financialService.simulateGoal(payload);

            setResult({
                futureValue: data.futureValue,
                monthlySaving: data.monthlySaving
            });

        } catch (error) {
            console.error("Gagal menghitung goals:", error);
            alert("Terjadi kesalahan saat melakukan simulasi.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setCurrentCost("");
        setDuration("5");
        setResult(null);
        setSavedId(null);
    };

    // --- PDF DOWNLOAD HANDLER (SERVER-SIDE) ---
    const handleDownloadPDF = async () => {
        if (showPdfModal) return;

        try {
            let targetId = savedId;

            // 1. AUTO-SAVE jika belum ada ID
            if (!targetId) {
                const cost = parseInt(currentCost.replace(/\./g, "")) || 0;
                const years = parseInt(duration) || 0;

                if (cost === 0 || years === 0) {
                    alert("Mohon lengkapi data terlebih dahulu.");
                    return;
                }

                setIsSaving(true);
                try {
                    const futureValue = cost * Math.pow(1 + (inflation / 100), years);

                    const targetDateObj = new Date();
                    targetDateObj.setFullYear(targetDateObj.getFullYear() + years);
                    const targetDateStr = targetDateObj.toISOString().split('T')[0];

                    const response = await financialService.saveGoalPlan({
                        goalName: GOAL_OPTIONS.find(g => g.id === selectedGoal)?.label || 'Goal',
                        targetAmount: Math.round(futureValue),
                        targetDate: targetDateStr,
                        inflationRate: inflation,
                        returnRate: investmentRate
                    });

                    if (response && (response as any).plan?.id) {
                        targetId = (response as any).plan.id;
                        setSavedId(targetId);
                    }
                } catch (e) {
                    console.error("Auto-save failed", e);
                    alert("Gagal menyimpan data otomatis.");
                    return;
                } finally {
                    setIsSaving(false);
                }
            }

            // 2. Open Modal & Download
            setShowPdfModal(true);

            if (targetId) {
                await financialService.downloadGoalPdf(targetId);
            }

            // 3. Close Modal
            setTimeout(() => setShowPdfModal(false), 500);

        } catch (error) {
            console.error("PDF Error:", error);
            setShowPdfModal(false);
            alert("Gagal mengunduh PDF. Server sibuk atau timeout.");
        }
    };

    const currentTheme = GOAL_OPTIONS.find(g => g.id === selectedGoal) || GOAL_OPTIONS[3];

    return (
        <div className="min-h-full w-full pb-24 md:pb-12">

            {/* 1. MOUNT MODAL LOADING */}
            <PdfLoadingModal isOpen={showPdfModal} />

            {/* --- HEADER (DYNAMIC BACKGROUND SLIDESHOW) --- */}
            <div className="relative pt-10 pb-32 px-5 overflow-hidden shadow-2xl bg-brand-900">

                {/* 1. LAYER GAMBAR (ABSOLUTE) */}
                <div className="absolute inset-0 w-full h-full z-0">
                    {backgroundImages.map((image, index) => (
                        <div
                            key={image}
                            className={cn(
                                "absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out",
                                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                            )}
                            style={{ backgroundImage: `url(${image})` }}
                        />
                    ))}

                    {/* Overlay: Gelap + Pattern Wave */}
                    <div className="absolute inset-0 bg-brand-500/85 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-linear-to-t from-brand-600 via-transparent to-transparent" />

                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-[0.05] mix-blend-overlay"></div>
                </div>

                {/* 2. LAYER DEKORASI (Z-10) */}
                <div className="absolute top-0 right-0 w-125 h-125 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none z-10" />

                {/* 3. LAYER KONTEN (Z-20) */}
                <div className="relative z-20 max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-4 shadow-lg">
                        <Target className="w-4 h-4 text-cyan-300" />
                        <span className="text-[10px] font-bold text-cyan-100 tracking-widest uppercase">Special Goal Planner</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3 drop-shadow-xl">
                        Wujudkan Mimpi Anda
                    </h1>
                    <p className="text-brand-100 text-sm md:text-base max-w-lg mx-auto leading-relaxed opacity-90 drop-shadow-md">
                        Apapun impiannya, mari kita hitung strategi menabung yang tepat untuk mencapainya bersama MAXIPRO.
                    </p>
                </div>
            </div>

            <div className="relative z-20 max-w-6xl mx-auto px-5 -mt-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* --- LEFT COLUMN: INPUTS --- */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* 1. Goal Selector (Clean Grid) */}
                        <div className="bg-white p-5 rounded-[2rem] shadow-xl border border-slate-100 relative overflow-hidden">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Pilih Jenis Tujuan</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
                                {GOAL_OPTIONS.map((option) => {
                                    const isSelected = selectedGoal === option.id;
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => { setSelectedGoal(option.id); setResult(null); setSavedId(null); }}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 gap-2 h-28",
                                                isSelected
                                                    ? "bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-600/20 scale-105"
                                                    : "bg-white border-slate-100 text-slate-500 hover:border-brand-200 hover:bg-brand-50/50"
                                            )}
                                        >
                                            <div className={cn("p-2 rounded-full transition-colors", isSelected ? "bg-white/20" : "bg-slate-50")}>
                                                <option.icon className={cn("w-5 h-5", isSelected ? "text-white" : option.color)} />
                                            </div>
                                            <span className="text-xs font-bold">{option.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                            {/* Dynamic Description Footer */}
                            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                                <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                    <span className="italic">"{currentTheme.desc}"</span>
                                </p>
                            </div>
                        </div>

                        {/* 2. Input Parameters (Glassy Card) */}
                        <Card className="card-clean p-6 md:p-8 space-y-6 bg-white/95 backdrop-blur-xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Cost Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                        <Coins className="w-3 h-3" /> Biaya Saat Ini
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs transition-colors group-focus-within:bg-brand-600 group-focus-within:text-white">Rp</div>
                                        <Input
                                            placeholder="0"
                                            value={currentCost}
                                            onChange={(e) => handleMoneyInput(e.target.value)}
                                            className="pl-14 h-14 text-lg font-bold text-slate-800 bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl transition-all"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 pl-1">Harga jika Anda membelinya hari ini.</p>
                                </div>

                                {/* Duration Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                        <CalendarDays className="w-3 h-3" /> Target Waktu
                                    </label>
                                    <div className="relative group">
                                        <Input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => { setDuration(e.target.value); setResult(null); setSavedId(null); }}
                                            className="h-14 text-lg font-bold text-center text-slate-800 bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl pr-16 pl-4"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">Tahun</div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 pl-1">Berapa lama lagi ingin tercapai?</p>
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-slate-100">
                                {/* Inflation Slider */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-slate-600">Asumsi Inflasi (Kenaikan Harga)</label>
                                        <span className="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-1 rounded-md border border-rose-100">{inflation}% / thn</span>
                                    </div>
                                    <Slider
                                        value={inflation}
                                        onChange={(val: number) => { setInflation(val); setResult(null); setSavedId(null); }}
                                        min={0} max={20} step={0.5}
                                        className="accent-rose-500 py-2"
                                    />
                                </div>

                                {/* Investment Slider */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-slate-600">Estimasi Return Investasi</label>
                                        <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-100">{investmentRate}% / thn</span>
                                    </div>
                                    <Slider
                                        value={investmentRate}
                                        onChange={(val: number) => { setInvestmentRate(val); setResult(null); setSavedId(null); }}
                                        min={0} max={20} step={0.5}
                                        className="accent-emerald-500 py-2"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleCalculate}
                                disabled={isLoading || isSaving}
                                className={cn(
                                    "w-full h-12 text-base font-bold shadow-lg shadow-brand-500/20 rounded-xl text-white transition-all hover:scale-[1.02] bg-brand-600 hover:bg-brand-700 disabled:opacity-70 disabled:cursor-not-allowed"
                                )}
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menghitung...</>
                                ) : (
                                    "Hitung Strategi Menabung"
                                )}
                            </Button>
                        </Card>
                    </div>

                    {/* --- RIGHT COLUMN: RESULT --- */}
                    <div className="lg:col-span-5 space-y-6">
                        {!result ? (
                            <div className="h-full min-h-100 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 bg-white/50 rounded-[2rem]">
                                <div className={cn("w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-slate-100 transition-colors duration-500", currentTheme.color.replace("text-", "bg-").replace("600", "50"))}>
                                    <currentTheme.icon className={cn("w-10 h-10 opacity-50", currentTheme.color)} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700">Belum Ada Hasil</h3>
                                <p className="text-slate-500 text-sm max-w-xs mt-2 leading-relaxed">
                                    Masukkan estimasi biaya <b>{currentTheme.label}</b> dan target waktu pada form di samping untuk melihat analisanya.
                                </p>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">

                                {/* MAIN RESULT CARD (Theme Based) */}
                                <Card className={cn(
                                    "text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden border-0 bg-linear-to-br flex flex-col justify-center min-h-70",
                                    currentTheme.gradient
                                )}>
                                    {/* Decoration */}
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3" />

                                    <div className="relative z-10 text-center">
                                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 mb-4">
                                            <Wallet className="w-3 h-3 text-white" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Rekomendasi Setoran</span>
                                        </div>

                                        {/* [FIXED] Layout & Break Words */}
                                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-sm break-words leading-tight">
                                            {formatRupiah(result.monthlySaving)}
                                        </h2>
                                        <p className="text-white/80 font-medium text-m mb-8">per bulan</p>

                                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md text-left">
                                            <div className="flex justify-between items-center text-sm mb-1 gap-2">
                                                <span className="text-white/80 font-medium">Biaya Hari Ini</span>
                                                <span className="font-bold break-all text-right">{formatRupiah(parseInt(currentCost.replace(/\./g, "")))}</span>
                                            </div>
                                            <div className="flex justify-center my-2 opacity-50">
                                                <ArrowRight className="w-4 h-4 text-white rotate-90" />
                                            </div>
                                            <div className="flex justify-between items-center gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-white/80 text-xs font-medium">Estimasi Masa Depan</span>
                                                    <span className="text-[10px] opacity-70">({duration} Tahun, Inflasi {inflation}%)</span>
                                                </div>
                                                {/* [FIXED] Break words untuk angka future value */}
                                                <span className="text-lg sm:text-sm font-bold text-white bg-white/20 px-2 py-1 rounded break-all text-right">
                                                    {formatRupiah(result.futureValue)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* STRATEGY INFO */}
                                <Card className="p-6 rounded-2xl shadow-sm border border-slate-100 bg-white space-y-4">
                                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-brand-600" /> Analisa Investasi
                                    </h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Untuk mencapai <b>{currentTheme.label}</b> dalam {duration} tahun, uang Anda harus ditempatkan pada instrumen investasi dengan return minimal <b>{investmentRate}% per tahun</b>.
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Pokok</p>
                                            <p className="text-sm font-black text-slate-700 break-words">
                                                {formatRupiah(result.monthlySaving * 12 * parseInt(duration))}
                                            </p>
                                        </div>
                                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                            <p className="text-[10px] text-emerald-600 uppercase font-bold mb-1">Hasil Bunga</p>
                                            <p className="text-sm font-black text-emerald-700 break-words">
                                                {formatRupiah(Math.max(0, result.futureValue - (result.monthlySaving * 12 * parseInt(duration))))}
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                {/* ACTIONS */}
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={handleReset} disabled={showPdfModal} className="flex-1 rounded-xl h-11 border-slate-300 text-slate-600 hover:bg-slate-50">
                                        <RefreshCcw className="w-4 h-4 mr-2" /> Reset
                                    </Button>
                                    <Button
                                        className="flex-2 rounded-xl h-11 bg-slate-800 hover:bg-slate-900 shadow-xl text-white font-bold"
                                        onClick={handleDownloadPDF}
                                        disabled={isSaving || showPdfModal}
                                    >
                                        {showPdfModal ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4 mr-2" />
                                        )}
                                        {showPdfModal ? "Memproses..." : "Simpan Analisa PDF"}
                                    </Button>
                                </div>

                            </div>
                        )}
                        <GoalsGuide />
                    </div>

                </div>
            </div>
        </div>
    );
}