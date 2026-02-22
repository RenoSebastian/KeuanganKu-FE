"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calculator, Wallet, BadgePercent, TrendingUp,
  AlertTriangle, ShieldCheck, PiggyBank, RefreshCcw, Download,
  Loader2, Upload, FileJson, User, MapPin, Briefcase, Calendar,
  Play, CheckCircle2, Sparkles, HeartPulse, CreditCard, Landmark, Banknote, Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/financial-math";
import { BudgetResult, BudgetAllocation, CreateBudgetSimulationDto } from "@/lib/types";
import { financialService } from "@/services/financial.service";
import { BudgetGuide } from "@/components/features/calculator/budget-guide";
import { MonthlyHelperModal } from "@/components/features/finance/monthly-helper-modal";
import { PdfLoadingModal } from "@/components/features/finance/pdf-loading-modal";
import { toast } from "sonner";

// --- 1. HELPER: MAPPING VISUAL (FIXED ICONS) ---
const getAllocationStyle = (type: BudgetAllocation["type"]) => {
  switch (type) {
    case "NEEDS": return { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-700", icon: Wallet, iconColor: "text-blue-600", accent: "bg-blue-600" };
    case "DEBT_PROD": return { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-700", icon: TrendingUp, iconColor: "text-amber-600", accent: "bg-amber-600" };
    case "DEBT_CONS": return { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-700", icon: CreditCard, iconColor: "text-rose-600", accent: "bg-rose-600" };
    case "INSURANCE": return { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-700", icon: HeartPulse, iconColor: "text-indigo-600", accent: "bg-indigo-600" };
    case "SAVING": return { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-700", icon: Landmark, iconColor: "text-emerald-600", accent: "bg-emerald-600" };
    default: return { bg: "bg-slate-50", border: "border-slate-100", text: "text-slate-700", icon: Banknote, iconColor: "text-slate-500", accent: "bg-slate-500" };
  }
};

// --- 2. COMPONENT: ANIMATED NUMBER (FLUID TEXT) ---
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
    // Gunakan break-all agar memotong teks secara natural jika mentok frame
    <span className={cn("font-mono tracking-tighter break-all w-full", className)}>
      {value < 0 ? "-" : ""}{formatValue(displayVal)}
    </span>
  );
}

// --- 3. MAIN PAGE COMPONENT ---
export default function AgentBudgetPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE: CLIENT IDENTITY ---
  const [clientData, setClientData] = useState({
    clientName: "",
    clientDob: "",
    clientCity: "",
    clientJob: "",
    clientPhone: ""
  });

  // --- STATE: FINANCIAL (Input Tahunan) ---
  const [fixedIncome, setFixedIncome] = useState("");
  const [variableIncome, setVariableIncome] = useState("");

  // --- STATE: RESULT & OUTPUT ---
  const [viewMode, setViewMode] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [recommendation, setRecommendation] = useState<string>("");

  const [generatedFiles, setGeneratedFiles] = useState<{
    pdfUrl: string | null;
    mgcToken: string | null;
    filenameMgc: string | null;
    filenamePdf: string | null;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [monthlyHelperTarget, setMonthlyHelperTarget] = useState<"fixedIncome" | "variableIncome" | null>(null);

  // --- BACKGROUND SLIDESHOW ---
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const backgroundImages = [
    '/images/budgeting/rancanganggaran1.webp',
    '/images/budgeting/rancanganggaran2.webp'
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
    const rawValue = val.replace(/\D/g, "");
    if (!rawValue) { setter(""); return; }
    setter(new Intl.NumberFormat("id-ID").format(parseInt(rawValue)));

    if (result) {
      setResult(null);
      setGeneratedFiles(null);
    }
  };

  const handleHelperApply = (annualValue: number) => {
    const formatted = new Intl.NumberFormat("id-ID").format(annualValue);
    if (monthlyHelperTarget === "fixedIncome") setFixedIncome(formatted);
    else if (monthlyHelperTarget === "variableIncome") setVariableIncome(formatted);
    setMonthlyHelperTarget(null);

    if (result) {
      setResult(null);
      setGeneratedFiles(null);
    }
  };

  // ===========================================================================
  // CORE LOGIC: PREVIEW / HITUNG 
  // ===========================================================================
  const handleCalculateOnly = async () => {
    if (!clientData.clientName || !clientData.clientCity || !fixedIncome) {
      toast.error("Data Belum Lengkap", { description: "Mohon isi Nama, Kota, dan Gaji Tetap (Meski estimasi)." });
      return;
    }

    setIsLoading(true);
    setShowPdfModal(true);

    try {
      const fixedRaw = parseInt(fixedIncome.replace(/\./g, "")) || 0;
      const variableRaw = parseInt(variableIncome.replace(/\./g, "")) || 0;

      const fixedMonthly = Math.round(fixedRaw / 12);
      const variableMonthly = Math.round(variableRaw / 12);

      const payload: CreateBudgetSimulationDto = {
        ...clientData,
        fixedIncome: fixedMonthly,
        variableIncome: variableMonthly,
      };

      const response = await financialService.simulateAgentBudget(payload);

      const token = response.headers['x-mgc-token'];
      if (!token) throw new Error("Token data tidak ditemukan dalam response.");

      const payloadBase64 = token.split('.')[0];
      const jsonString = atob(payloadBase64);
      const decodedData = JSON.parse(jsonString);
      const beResult = decodedData.result;

      const mappedResult: BudgetResult = {
        safeToSpend: beResult.allocation.livingCost,
        totalFixedAllocated:
          beResult.allocation.debtConsumptive +
          beResult.allocation.debtProductive +
          beResult.allocation.insurance +
          beResult.allocation.saving,
        surplus: beResult.meta.variableIncome,
        allocations: [
          { type: "NEEDS", label: "Biaya Hidup Pokok", percentage: 45, amount: beResult.allocation.livingCost, description: "Kebutuhan harian, dapur, & transport." },
          { type: "DEBT_PROD", label: "Utang Produktif", percentage: 20, amount: beResult.allocation.debtProductive, description: "Cicilan KPR, Kendaraan kerja." },
          { type: "DEBT_CONS", label: "Utang Konsumtif", percentage: 15, amount: beResult.allocation.debtConsumptive, description: "Kartu kredit, Paylater, Lifestyle." },
          { type: "INSURANCE", label: "Dana Proteksi", percentage: 10, amount: beResult.allocation.insurance, description: "Premi asuransi jiwa & kesehatan." },
          { type: "SAVING", label: "Tabungan & Investasi", percentage: 10, amount: beResult.allocation.saving, description: "Dana darurat & alokasi masa depan." },
        ]
      };

      setResult(mappedResult);
      setRecommendation(beResult.analysis.variableIncomeRecommendation);

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      const cleanName = clientData.clientName.replace(/[^a-zA-Z0-9]/g, '_') || 'Klien';

      setGeneratedFiles({
        pdfUrl,
        mgcToken: token,
        filenameMgc: `Backup_Budget_${cleanName}.mgc`,
        filenamePdf: `Budget_Plan_${cleanName}.pdf`
      });

      toast.success("Analisa Selesai", {
        description: "Hasil simulasi anggaran telah diperbarui secara otomatis."
      });

    } catch (error) {
      console.error(error);
      toast.error("Gagal Simulasi", { description: "Terjadi kesalahan sistem saat memproses data server." });
    } finally {
      setIsLoading(false);
      setShowPdfModal(false);
      if (window.innerWidth < 1024) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  // ===========================================================================
  // CORE LOGIC: DOWNLOAD MANUAL (DARI MEMORY)
  // ===========================================================================
  const handleDownloadFile = (type: 'PDF' | 'MGC') => {
    if (!generatedFiles) return;

    if (type === 'PDF' && generatedFiles.pdfUrl) {
      const link = document.createElement('a');
      link.href = generatedFiles.pdfUrl;
      link.setAttribute('download', generatedFiles.filenamePdf || "Budget_Plan.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    else if (type === 'MGC' && generatedFiles.mgcToken) {
      const blob = new Blob([generatedFiles.mgcToken], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generatedFiles.filenameMgc || "Backup.mgc";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  // ===========================================================================
  // CORE LOGIC: IMPORT .MGC
  // ===========================================================================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileInputRef.current) fileInputRef.current.value = "";

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const rawContent = event.target?.result as string;
        const tokenContent = rawContent ? rawContent.trim() : "";

        if (!tokenContent) throw new Error("File kosong");

        const response = await financialService.decodeSimulationToken(tokenContent);

        if (response.data?.meta?.module && response.data.meta.module !== 'BUDGETING') {
          toast.warning("Modul Tidak Cocok", {
            description: `File ini untuk modul ${response.data.meta.module}, bukan Budgeting.`
          });
        }

        const rootData = response.data || response;
        const client = rootData.client;
        const financial = rootData.financial;

        if (!client || !financial) throw new Error("Struktur file tidak dikenali.");

        setClientData({
          clientName: client.name || "",
          clientDob: client.dob || "",
          clientCity: client.city || "",
          clientJob: client.job || "",
          clientPhone: client.phone || ""
        });

        const fixedAnnual = (Number(financial.fixedIncome) || 0) * 12;
        const variableAnnual = (Number(financial.variableIncome) || 0) * 12;

        setFixedIncome(new Intl.NumberFormat("id-ID").format(fixedAnnual));
        setVariableIncome(new Intl.NumberFormat("id-ID").format(variableAnnual));

        toast.success("Import Berhasil", { description: `Data klien ${client.name} berhasil dimuat.` });

        setResult(null);
        setGeneratedFiles(null);

      } catch (error: any) {
        const backendMessage = error.response?.data?.message || error.message;
        toast.error("Gagal Import File", {
          description: backendMessage || "File .mgc tidak valid atau rusak."
        });
      } finally {
        setIsImporting(false);
      }
    };

    reader.readAsText(file);
  };

  const resetForm = () => {
    if (confirm("Hapus seluruh data input dan mulai dari awal?")) {
      setClientData({ clientName: "", clientDob: "", clientCity: "", clientJob: "", clientPhone: "" });
      setFixedIncome("");
      setVariableIncome("");
      setResult(null);
      setGeneratedFiles(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const displayedResult = viewMode === "MONTHLY" ? result : (result ? {
    ...result,
    safeToSpend: result.safeToSpend * 12,
    totalFixedAllocated: result.totalFixedAllocated * 12,
    surplus: result.surplus * 12,
    allocations: result.allocations.map(a => ({ ...a, amount: a.amount * 12 }))
  } : null);

  // Variants Animasi Framer Motion yang aman untuk TS
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen w-full pb-24 md:pb-12 bg-slate-50/50 font-sans selection:bg-indigo-100 selection:text-indigo-900">

      <PdfLoadingModal isOpen={showPdfModal} />

      <MonthlyHelperModal
        isOpen={monthlyHelperTarget !== null}
        onClose={() => setMonthlyHelperTarget(null)}
        onApply={handleHelperApply}
        title={monthlyHelperTarget === "fixedIncome" ? "Konversi Gaji Tahunan" : "Konversi Bonus Tahunan"}
      />

      {/* =========================================
                HEADER SECTION (Holographic Glassmorphism)
                ========================================= */}
      <div className="relative pt-12 pb-36 px-5 overflow-hidden bg-slate-900 shadow-2xl">
        <div className="absolute inset-0 w-full h-full z-0">
          {backgroundImages.map((image, index) => (
            <div key={image}
              className={cn("absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-2000 ease-in-out", index === currentImageIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100')}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-slate-900/50" />
        </div>

        <div className="relative z-20 max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mt-4">
          <div className="text-left animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-4 shadow-lg">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-black text-cyan-100 uppercase tracking-[0.2em]">Agent Tool</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 tracking-tighter drop-shadow-md">
              Budget <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-emerald-400">Simulator</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-lg font-medium leading-relaxed">
              Rancang proporsi keuangan klien secara logis (Aturan 45-20-15-10-10) untuk masa depan yang terukur dan aman.
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-[1.5rem] flex items-center gap-5 max-w-sm w-full cursor-pointer group shadow-2xl animate-in fade-in slide-in-from-right-8 duration-700 delay-150"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-inner group-hover:rotate-12 transition-all duration-300 shrink-0">
              {isImporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
            </div>
            <div className="text-left flex-1">
              <h4 className="text-base font-black text-white tracking-tight">Restore Sesi (.mgc)</h4>
              <p className="text-[11px] text-cyan-200 font-medium">Muat ulang data simulasi klien.</p>
            </div>
            <input type="file" ref={fileInputRef} accept=".mgc" className="hidden" onChange={handleFileUpload} />
          </motion.div>
        </div>
      </div>

      {/* =========================================
                MAIN CONTENT 
                ========================================= */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 md:px-6 -mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* KIRI: INPUT FORM */}
          <div className="lg:col-span-5 space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">

            <Card className="p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border-0 bg-white/95 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-inner"><User className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Profil Klien</h3>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Identitas Dasar</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="group space-y-1.5">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Nama Lengkap <span className="text-rose-500">*</span></Label>
                  <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
                    <Input name="clientName" placeholder="Cth: Budi Santoso" value={clientData.clientName} onChange={handleClientChange} className="pl-12 h-14 bg-slate-50 border-slate-200 rounded-2xl font-black text-lg text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group space-y-1.5">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Tgl Lahir</Label>
                    <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
                      <Input type="date" name="clientDob" value={clientData.clientDob} onChange={handleClientChange} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400" />
                    </div>
                  </div>
                  <div className="group space-y-1.5">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Kota <span className="text-[9px] font-normal lowercase">(Opsional)</span></Label>
                    <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
                      <Input name="clientCity" placeholder="Bandung" value={clientData.clientCity} onChange={handleClientChange} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400" />
                    </div>
                  </div>
                </div>

                {/* RESTORED FIELDS: No HP & Pekerjaan */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="group space-y-1.5">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">No. HP <span className="text-[9px] font-normal lowercase">(Opsional)</span></Label>
                    <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
                      <Input type="tel" inputMode="numeric" name="clientPhone" placeholder="0812..." value={clientData.clientPhone} onChange={handleClientChange} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400" />
                    </div>
                  </div>
                  <div className="group space-y-1.5">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-indigo-600 transition-colors">Pekerjaan</Label>
                    <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
                      <Input name="clientJob" placeholder="PNS" value={clientData.clientJob} onChange={handleClientChange} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-sm text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border-0 bg-white/95 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-inner"><Wallet className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Kondisi Keuangan</h3>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Input dalam Skala TAHUNAN</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="group space-y-2 flex flex-col justify-end">
                  <div className="flex justify-between items-end mb-1">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-emerald-600 transition-colors">
                      Gaji Tetap <span className="text-rose-500">*</span>
                    </Label>
                    <button onClick={() => setMonthlyHelperTarget("fixedIncome")} className="text-[9px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all shadow-sm">
                      <Calculator className="w-3 h-3" /> Konversi Bulan
                    </button>
                  </div>
                  <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs group-focus-within:text-emerald-600 transition-colors">Rp</div>
                    <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 font-light text-xl">|</div>
                    <Input className="pl-14 h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 focus:bg-white font-black text-xl text-slate-800 transition-all shadow-sm" placeholder="0" value={fixedIncome} onChange={(e) => handleMoneyInput(e.target.value, setFixedIncome)} inputMode="numeric" />
                  </div>
                </div>

                <div className="group space-y-2 flex flex-col justify-end">
                  <div className="flex justify-between items-end mb-1">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 group-focus-within:text-emerald-600 transition-colors">
                      Bonus / THR <span className="text-[9px] font-normal lowercase text-slate-400">(Opsional)</span>
                    </Label>
                    <button onClick={() => setMonthlyHelperTarget("variableIncome")} className="text-[9px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all shadow-sm">
                      <Calculator className="w-3 h-3" /> Konversi Bulan
                    </button>
                  </div>
                  <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs group-focus-within:text-emerald-600 transition-colors">Rp</div>
                    <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 font-light text-xl">|</div>
                    <Input className="pl-14 h-14 rounded-2xl bg-slate-50 border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 focus:bg-white font-black text-xl text-slate-800 transition-all shadow-sm" placeholder="0" value={variableIncome} onChange={(e) => handleMoneyInput(e.target.value, setVariableIncome)} inputMode="numeric" />
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 pt-6 mt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={resetForm} className="h-14 w-14 rounded-2xl border-slate-300 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shrink-0 shadow-sm active:scale-95 transition-all">
                    <RefreshCcw className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={handleCalculateOnly}
                    disabled={isLoading || !fixedIncome || !clientData.clientName}
                    className="h-14 flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-5 h-5 mr-2 fill-white" />}
                    Jalankan Kalkulasi
                  </Button>
                </div>
              </div>
            </Card>
            <BudgetGuide />
          </div>

          {/* KANAN: RESULT DISPLAY */}
          <div className="lg:col-span-7 space-y-6">
            {!displayedResult ? (
              <div className="h-full min-h-100 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-300/60 rounded-[2.5rem] bg-white/40 backdrop-blur-sm animate-in fade-in duration-1000">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                  <BadgePercent className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-700 tracking-tight">Kalkulator Standby</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-sm font-medium leading-relaxed">
                  Silakan isi profil dan angka keuangan klien di panel kiri, lalu tekan <strong>Jalankan Kalkulasi</strong> untuk melihat rekayasa algoritma kami.
                </p>
              </div>
            ) : (
              <div className="space-y-6">

                {/* 1. BANNER SUKSES & DOWNLOAD */}
                {generatedFiles && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-linear-to-r from-emerald-500 to-teal-500 p-0.75 rounded-[1.5rem] shadow-xl shadow-emerald-500/20">
                    <div className="bg-white p-4 md:p-5 rounded-[1.35rem] flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 w-full">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-slate-800 text-sm md:text-base tracking-tight">Analisa Berhasil Dirender!</h4>
                          <p className="text-[11px] md:text-xs text-slate-500 font-medium mt-0.5">Laporan resmi siap untuk dipresentasikan ke klien.</p>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleDownloadFile('MGC')} className="h-11 px-4 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-xl font-bold shadow-sm active:scale-95 transition-all" title="Simpan File Simulasi (.mgc)">
                          <FileJson className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Backup .MGC</span>
                        </Button>
                        <Button size="sm" onClick={() => handleDownloadFile('PDF')} className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/30 active:scale-95 transition-all">
                          <Download className="w-4 h-4 mr-2" /> Unduh PDF
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. TOGGLE PERIODE & TITLE */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Rekomendasi Anggaran</h2>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sistem Ideal 45-20-15-10-10</p>
                  </div>
                  <div className="bg-white p-1.5 rounded-xl border border-slate-200 flex shadow-sm">
                    <button onClick={() => setViewMode("MONTHLY")} className={cn("px-4 py-2 rounded-lg text-xs font-black transition-all", viewMode === "MONTHLY" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50")}>Bulanan</button>
                    <button onClick={() => setViewMode("ANNUAL")} className={cn("px-4 py-2 rounded-lg text-xs font-black transition-all", viewMode === "ANNUAL" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50")}>Tahunan</button>
                  </div>
                </motion.div>

                {/* 3. BENTO GRID RESULTS (TUMPUK VERTIKAL & WRAP ANGKA BESAR) */}
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

                  {/* Safe to Spend (Hero Bento) */}
                  <motion.div variants={itemVariants} className="md:col-span-2">
                    <Card className="bg-linear-to-br from-indigo-900 via-slate-900 to-indigo-950 p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden border-0">
                      {/* Glow Effects */}
                      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] pointer-events-none" />
                      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none" />

                      <div className="relative z-10 flex flex-col gap-6">
                        <div className="space-y-3 w-full">
                          <div className="flex items-center gap-2 text-indigo-200">
                            <Wallet className="w-5 h-5 shrink-0" />
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.15em]">Safe to Spend ({viewMode === "MONTHLY" ? "Bulan Ini" : "Setahun"})</span>
                          </div>
                          <div className="w-full">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[48px] font-black text-white tracking-tighter drop-shadow-lg leading-none break-all">
                              <AnimatedNumber value={displayedResult.safeToSpend} isCurrency={true} />
                            </h2>
                          </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-5 rounded-2xl w-full">
                          <p className="text-xs md:text-sm text-indigo-100 font-medium leading-relaxed">
                            Uang murni (<strong className="text-white font-black bg-indigo-500/50 px-1.5 py-0.5 rounded">45%</strong> dari total) yang boleh Anda habiskan untuk membiayai hidup tanpa mengorbankan keamanan masa depan finansial.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Surplus (Side Bento) */}
                  <motion.div variants={itemVariants} className="md:col-span-2">
                    <Card className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-full space-y-2">
                        <div className="flex items-center gap-2 text-emerald-600 mb-1.5">
                          <PiggyBank className="w-4 h-4 shrink-0" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Potensi Tabungan Ekstra (Surplus)</span>
                        </div>
                        <div className="w-full">
                          <h3 className="text-3xl md:text-4xl font-black text-emerald-600 tracking-tighter break-all leading-none">
                            <AnimatedNumber value={displayedResult.surplus} isCurrency={true} />
                          </h3>
                        </div>
                        <p className="text-[10px] md:text-xs text-slate-400 font-medium">Berasal dari alokasi murni Penghasilan Tidak Tetap (Bonus/THR).</p>
                      </div>

                      {recommendation && (
                        <div className="bg-slate-50 p-4 md:p-5 rounded-[1.5rem] text-[11px] md:text-xs text-slate-600 font-medium w-full border border-slate-100">
                          <span className="font-black text-slate-800 uppercase tracking-widest text-[9px] flex items-center gap-1.5 mb-1.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Catatan Analis:
                          </span>
                          <span className="leading-relaxed">{recommendation}</span>
                        </div>
                      )}
                    </Card>
                  </motion.div>

                  {/* List Alokasi Lainnya */}
                  {displayedResult.allocations.filter(a => a.type !== "NEEDS").map((item, idx) => {
                    const style = getAllocationStyle(item.type);
                    const Icon = style.icon;
                    return (
                      <motion.div key={idx} variants={itemVariants}>
                        <Card className={cn("p-6 rounded-[2rem] border flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden group", style.bg, style.border)}>
                          <Icon className={cn("absolute -bottom-4 -right-4 w-28 h-28 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none", style.text)} />

                          <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                              <div className={cn("p-3 rounded-2xl bg-white shadow-sm border border-white/50", style.iconColor)}>
                                <Icon className="w-6 h-6" />
                              </div>
                              <span className={cn("text-xs font-black px-3 py-1.5 rounded-lg bg-white shadow-sm border border-white/50", style.text)}>
                                {item.percentage}%
                              </span>
                            </div>
                            <div className="mt-auto">
                              <h4 className={cn("font-bold text-xs md:text-sm mb-1 uppercase tracking-widest", style.text)}>{item.label}</h4>
                              <div className="w-full">
                                <p className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter break-all leading-none flex items-center">
                                  <AnimatedNumber value={item.amount} isCurrency={true} />
                                </p>
                              </div>
                              <p className="text-[10px] md:text-[11px] text-slate-500 font-medium mt-3 leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}