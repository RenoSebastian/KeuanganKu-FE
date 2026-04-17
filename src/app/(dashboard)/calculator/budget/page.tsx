"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import { motion } from "framer-motion";
import { Sparkles, Upload, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

// Hooks & Services
import { useAuthUser } from "@/hooks/use-auth-user";
import { useUnifiedDownload } from "@/hooks/useUnifiedDownload";
import { financialService } from "@/services/financial.service";
import { BudgetResult, CreateBudgetSimulationDto } from "@/lib/types";

// Components
import { BudgetGuide } from "@/components/features/calculator/guide/budget-guide";
import { MonthlyHelperModal } from "@/components/features/calculator/finance/monthly-helper-modal";
import { PdfLoadingModal } from "@/components/features/calculator/finance/pdf-loading-modal";
import { BudgetForm } from "@/components/features/calculator/budget/budget-form";
import { BudgetResults } from "@/components/features/calculator/budget/budget-results";
import { generateSimulationFilename } from "@/lib/formatters";

// [NEW ARCHITECTURE] Import mesin eksekutor Universal
import { executeUniversalExport } from "@/utils/universal-export-engine";

export default function AgentBudgetPage() {
  const { isPro, quota, refreshUser, isLoading: isAuthLoading } = useAuthUser();
  const hasAccess = isPro || quota > 0;

  // --- [PHASE 3] Unified Download Hook ---
  const { downloadMgc: downloadMgcUnified, triggerPdfDownload } = useUnifiedDownload({
    autoToast: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(uuidv4());

  // Existing States
  const [clientData, setClientData] = useState({ clientName: "", clientDob: "", clientCity: "", clientJob: "", clientPhone: "" });
  const [fixedIncome, setFixedIncome] = useState("");
  const [variableIncome, setVariableIncome] = useState("");
  const [viewMode, setViewMode] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [recommendation, setRecommendation] = useState<string>("");

  // [MODIFIED STATE] Menyimpan raw Blob alih-alih URL untuk mencegah memory leak
  const [generatedFiles, setGeneratedFiles] = useState<{
    pdfBlob: Blob | null;
    mgcToken: string | null;
    filenameMgc: string | null;
    filenamePdf: string | null;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [monthlyHelperTarget, setMonthlyHelperTarget] = useState<"fixedIncome" | "variableIncome" | null>(null);

  // Background Slideshow
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const backgroundImages = ['/images/budgeting/rancanganggaran1.webp', '/images/budgeting/rancanganggaran2.webp'];
  useEffect(() => {
    const interval = setInterval(() => setCurrentImageIndex(prev => (prev === backgroundImages.length - 1 ? 0 : prev + 1)), 6000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Logic Handlers
  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => setClientData({ ...clientData, [e.target.name]: e.target.value });

  const handleMoneyInput = (val: string, setter: (v: string) => void) => {
    const rawValue = val.replace(/\D/g, "");
    if (!rawValue) { setter(""); return; }
    setter(new Intl.NumberFormat("id-ID").format(parseInt(rawValue)));
    if (result) { setResult(null); setGeneratedFiles(null); }
  };

  const handleHelperApply = (annualValue: number) => {
    const formatted = new Intl.NumberFormat("id-ID").format(annualValue);
    if (monthlyHelperTarget === "fixedIncome") setFixedIncome(formatted);
    else if (monthlyHelperTarget === "variableIncome") setVariableIncome(formatted);
    setMonthlyHelperTarget(null);
    if (result) { setResult(null); setGeneratedFiles(null); }
  };

  // --- [REFACTORED CALCULATION LOGIC] ---
  const handleCalculateOnly = async () => {
    if (!hasAccess) { toast.error("Kuota Habis", { description: "Silakan upgrade ke PRO." }); return; }
    if (!clientData.clientName || !clientData.clientCity || !fixedIncome) { toast.error("Data Belum Lengkap", { description: "Isi Nama, Kota, dan Gaji Tetap." }); return; }

    setIsLoading(true);
    setShowPdfModal(true);

    try {
      const fixedRaw = parseInt(fixedIncome.replace(/\./g, "")) || 0;
      const variableRaw = parseInt(variableIncome.replace(/\./g, "")) || 0;
      const payload: CreateBudgetSimulationDto & { sessionId: string } = {
        ...clientData, fixedIncome: Math.round(fixedRaw / 12), variableIncome: Math.round(variableRaw / 12), sessionId: sessionId.current
      };

      // 1. Fetch data
      const response = await financialService.simulateAgentBudget(payload);

      // [SYNC QUOTA]
      await refreshUser();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('refresh_user_data'));

      // 2. Ekstrak Metadata
      const token = response.headers['x-mgc-token'];
      const disposition = response.headers['content-disposition'];
      if (!token) throw new Error("Token data tidak ditemukan.");

      // 3. Tentukan Nama File
      let pdfFilename = generateSimulationFilename("Budget Plan", clientData.clientName, "pdf");
      if (disposition) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) pdfFilename = match[1].replace(/['"]/g, "");
      }

      // 4. Transformasi Hasil UI
      const decodedData = JSON.parse(atob(token.split('.')[0]));
      const beResult = decodedData.result;

      const mappedResult: BudgetResult = {
        safeToSpend: beResult.allocation.livingCost,
        totalFixedAllocated: beResult.allocation.debtConsumptive + beResult.allocation.debtProductive + beResult.allocation.insurance + beResult.allocation.saving,
        surplus: beResult.meta.variableIncome,
        allocations: [
          { type: "NEEDS", label: "Biaya Hidup Pokok", percentage: 45, amount: beResult.allocation.livingCost, description: "Kebutuhan harian & transport." },
          { type: "DEBT_PROD", label: "Utang Produktif", percentage: 20, amount: beResult.allocation.debtProductive, description: "Cicilan KPR, Kendaraan kerja." },
          { type: "DEBT_CONS", label: "Utang Konsumtif", percentage: 15, amount: beResult.allocation.debtConsumptive, description: "Kartu kredit, Lifestyle." },
          { type: "INSURANCE", label: "Dana Proteksi", percentage: 10, amount: beResult.allocation.insurance, description: "Asuransi jiwa & kesehatan." },
          { type: "SAVING", label: "Tabungan & Investasi", percentage: 10, amount: beResult.allocation.saving, description: "Dana darurat & masa depan." },
        ]
      };

      setResult(mappedResult);
      setRecommendation(beResult.analysis.variableIncomeRecommendation);

      // 5. [CLEAN ARCHITECTURE] Simpan Blob biner langsung ke state tanpa membuat Object URL
      setGeneratedFiles({
        pdfBlob: new Blob([response.data], { type: 'application/pdf' }),
        mgcToken: token,
        filenameMgc: generateSimulationFilename("Budget Plan", clientData.clientName, "mgc"),
        filenamePdf: pdfFilename
      });

      toast.success("Analisa Selesai");

    } catch (error: any) {
      console.error(error);
      toast.error("Gagal Simulasi");
    } finally {
      setIsLoading(false);
      setShowPdfModal(false);
      if (window.innerWidth < 1024) window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  // --- [REFACTORED DOWNLOAD ROUTER] ---
  const handleDownloadFile = async (type: 'PDF' | 'MGC') => {
    if (!generatedFiles) return;

    try {
      if (type === 'PDF' && generatedFiles.pdfBlob && generatedFiles.filenamePdf) {
        // Eksekusi Blob PDF
        const exportStatus = await executeUniversalExport(generatedFiles.pdfBlob, generatedFiles.filenamePdf);

        if (exportStatus === 'SHARED') {
          toast.success("Dokumen PDF siap dibagikan.");
        } else if (exportStatus === 'DOWNLOADED') {
          toast.success("Dokumen PDF berhasil diunduh.");
        }

      } else if (type === 'MGC' && generatedFiles.mgcToken) {
        // [HARDENED] Transformasi Token String menjadi Blob Biner agar sesuai dengan parameter Engine
        const mgcBlob = new Blob([generatedFiles.mgcToken], { type: 'application/octet-stream' });
        const filename = generatedFiles.filenameMgc || "Backup.mgc";

        // Eksekusi Blob MGC melalui Universal Engine (Bypass Permission Denied Android PWA)
        const exportStatus = await executeUniversalExport(mgcBlob, filename);

        if (exportStatus === 'SHARED') {
          toast.success("File Backup (.mgc) siap dibagikan.");
        } else if (exportStatus === 'DOWNLOADED') {
          toast.success("File Backup (.mgc) berhasil disimpan.");
        }
      }
    } catch (error) {
      console.error(`Export Error (${type}):`, error);
      toast.error(`Gagal memproses file ${type}.`);
    }
  };

  // ... (Sisa fungsi handleFileUpload dan resetForm tetap sama)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const response = await financialService.decodeSimulationToken(event.target?.result as string || "");
        if (response.data?.meta?.module !== 'BUDGETING') toast.warning("Modul Tidak Cocok");
        const { client, financial } = response.data || response;
        setClientData({ clientName: client.name || "", clientDob: client.dob || "", clientCity: client.city || "", clientJob: client.job || "", clientPhone: client.phone || "" });
        setFixedIncome(new Intl.NumberFormat("id-ID").format((Number(financial.fixedIncome) || 0) * 12));
        setVariableIncome(new Intl.NumberFormat("id-ID").format((Number(financial.variableIncome) || 0) * 12));
        sessionId.current = uuidv4();
        toast.success("Import Berhasil"); setResult(null); setGeneratedFiles(null);
      } catch { toast.error("Gagal Import File"); } finally { setIsImporting(false); }
    };
    reader.readAsText(file);
  };

  const resetForm = () => {
    if (confirm("Reset data?")) {
      setClientData({ clientName: "", clientDob: "", clientCity: "", clientJob: "", clientPhone: "" });
      setFixedIncome(""); setVariableIncome(""); setResult(null); setGeneratedFiles(null);
      sessionId.current = uuidv4();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const displayedResult = viewMode === "MONTHLY" ? result : (result ? {
    ...result, safeToSpend: result.safeToSpend * 12, totalFixedAllocated: result.totalFixedAllocated * 12, surplus: result.surplus * 12,
    allocations: result.allocations.map(a => ({ ...a, amount: a.amount * 12 }))
  } : null);

  return (
    <div className="min-h-screen w-full pb-24 md:pb-12 bg-slate-50/50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <PdfLoadingModal isOpen={showPdfModal} />
      <MonthlyHelperModal isOpen={monthlyHelperTarget !== null} onClose={() => setMonthlyHelperTarget(null)} onApply={handleHelperApply} title="Konversi Tahunan ke Bulanan" />

      {/* HERO HEADER */}
      <div className="relative pt-12 pb-36 px-5 overflow-hidden bg-slate-900 shadow-2xl">
        <div className="absolute inset-0 w-full h-full z-0">
          {backgroundImages.map((image, index) => (
            <div key={image} className={cn("absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-2000 ease-in-out", index === currentImageIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100')} style={{ backgroundImage: `url(${image})` }} />
          ))}
          <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-slate-900/50" />
        </div>
        <div className="relative z-20 max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mt-4">
          <div className="text-left animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-4 shadow-lg">
              <Sparkles className="w-4 h-4 text-cyan-400" /><span className="text-[10px] font-black text-cyan-100 uppercase tracking-[0.2em]">Agent Tool</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 tracking-tighter drop-shadow-md">Budget <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-emerald-400">Simulator</span></h1>
            <p className="text-slate-300 text-sm md:text-base max-w-lg font-medium leading-relaxed">Rancang proporsi keuangan klien secara logis (Aturan 45-20-15-10-10).</p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-[1.5rem] flex items-center gap-5 max-w-sm w-full cursor-pointer group shadow-2xl" onClick={() => fileInputRef.current?.click()}>
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-inner group-hover:rotate-12 transition-all duration-300 shrink-0">
              {isImporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
            </div>
            <div className="text-left flex-1"><h4 className="text-base font-black text-white tracking-tight">Restore Sesi (.mgc)</h4><p className="text-[11px] text-cyan-200 font-medium">Muat ulang data simulasi.</p></div>
            <input type="file" ref={fileInputRef} accept=".mgc" className="hidden" onChange={handleFileUpload} />
          </motion.div>
        </div>
      </div>

      <div className="relative z-20 max-w-6xl mx-auto px-4 md:px-6 -mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            {!hasAccess && !isAuthLoading && (
              <Card className="p-5 rounded-2xl bg-red-50 border border-red-200 shadow-sm animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-100 rounded-xl text-red-600"><Lock className="w-6 h-6" /></div>
                  <div><h3 className="text-sm font-bold text-red-800">Kuota Habis</h3><p className="text-xs text-red-600 mt-1">Upgrade ke PRO untuk akses tanpa batas.</p><Link href="/pricing"><Button size="sm" className="mt-3 bg-red-600 w-full rounded-xl">Upgrade</Button></Link></div>
                </div>
              </Card>
            )}
            <BudgetForm
              clientData={clientData} setClientData={setClientData}
              fixedIncome={fixedIncome} setFixedIncome={setFixedIncome}
              variableIncome={variableIncome} setVariableIncome={setVariableIncome}
              isLoading={isLoading} hasAccess={hasAccess} onCalculate={handleCalculateOnly} onReset={resetForm}
              onOpenHelper={setMonthlyHelperTarget} handleMoneyInput={handleMoneyInput} handleClientChange={handleClientChange}
            />
            <BudgetGuide />
          </div>
          <div className="lg:col-span-7">
            <BudgetResults
              displayedResult={displayedResult} viewMode={viewMode} setViewMode={setViewMode}
              generatedFiles={generatedFiles} recommendation={recommendation} onDownload={handleDownloadFile}
            />
          </div>
        </div>
      </div>

      {/* [CLEANUP] <PostDownloadAction /> telah dihapus sepenuhnya dari DOM.
        Tidak ada lagi modal tumpang tindih. Seluruh logika export ditangani
        di belakang layar oleh Universal Export Engine.
      */}
    </div>
  );
}