"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calculator, Wallet, BadgePercent, TrendingUp,
  AlertTriangle, ShieldCheck, PiggyBank, RefreshCcw, Download,
  CalendarDays, CalendarRange, Loader2, Save, Upload, FileJson,
  User, MapPin, Briefcase, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/financial-math";
import { BudgetResult, BudgetAllocation, CreateBudgetSimulationDto } from "@/lib/types";
import { financialService } from "@/services/financial.service";
import { BudgetGuide } from "@/components/features/calculator/budget-guide";
import { MonthlyHelperModal } from "@/components/features/finance/monthly-helper-modal";
import { toast } from "sonner";

// --- 1. HELPER: MAPPING VISUAL ---
const getAllocationStyle = (type: BudgetAllocation["type"]) => {
  switch (type) {
    case "NEEDS": return { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", icon: Wallet, iconColor: "text-blue-500" };
    case "DEBT_PROD": return { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", icon: TrendingUp, iconColor: "text-amber-500" };
    case "DEBT_CONS": return { bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-700", icon: AlertTriangle, iconColor: "text-rose-500" };
    case "INSURANCE": return { bg: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-700", icon: ShieldCheck, iconColor: "text-indigo-500" };
    case "SAVING": return { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", icon: PiggyBank, iconColor: "text-emerald-500" };
    default: return { bg: "bg-slate-50", border: "border-slate-100", text: "text-slate-700", icon: Wallet, iconColor: "text-slate-500" };
  }
};

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

  // State untuk file yang "baru saja" di-generate (untuk tombol re-download manual)
  const [lastGeneratedPdfUrl, setLastGeneratedPdfUrl] = useState<string | null>(null);
  const [lastMgcToken, setLastMgcToken] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Helper Modal State
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
    }, 5000);
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
  };

  const handleHelperApply = (annualValue: number) => {
    const formatted = new Intl.NumberFormat("id-ID").format(annualValue);
    if (monthlyHelperTarget === "fixedIncome") setFixedIncome(formatted);
    else if (monthlyHelperTarget === "variableIncome") setVariableIncome(formatted);
    setMonthlyHelperTarget(null);
  };

  // --- CORE LOGIC 1: SIMULATE & DOWNLOAD (STATELESS) ---
  const handleSimulate = async () => {
    // 1. Validasi Input
    if (!clientData.clientName || !clientData.clientCity || !fixedIncome) {
      toast.error("Data Tidak Lengkap", { description: "Mohon isi Nama, Kota, dan Gaji Tetap." });
      return;
    }

    setIsLoading(true);
    try {
      // 2. Prepare Payload (Konversi Tahunan -> Bulanan untuk logic BE)
      const fixedRaw = parseInt(fixedIncome.replace(/\./g, "")) || 0;
      const variableRaw = parseInt(variableIncome.replace(/\./g, "")) || 0;

      const fixedMonthly = Math.round(fixedRaw / 12);
      const variableMonthly = Math.round(variableRaw / 12);

      const payload: CreateBudgetSimulationDto = {
        ...clientData,
        fixedIncome: fixedMonthly,
        variableIncome: variableMonthly,
      };

      // 3. Call API (Menerima Blob PDF + Header Token)
      const response = await financialService.simulateAgentBudget(payload);

      // --- STEP A: HANDLE PDF (BODY) ---
      // Buat URL object dari Blob yang diterima
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      // Trigger Auto-Download PDF
      const pdfLink = document.createElement('a');
      pdfLink.href = pdfUrl;
      const cleanName = clientData.clientName.replace(/[^a-zA-Z0-9]/g, '_');
      pdfLink.setAttribute('download', `Simulasi_Budget_${cleanName}.pdf`);
      document.body.appendChild(pdfLink);
      pdfLink.click();
      pdfLink.remove();

      setLastGeneratedPdfUrl(pdfUrl); // Simpan referensi untuk re-download

      // --- STEP B: HANDLE TOKEN (HEADER) ---
      const token = response.headers['x-mgc-token'];

      if (token) {
        setLastMgcToken(token);

        // 1. Auto-Download File .mgc (Backup)
        const mgcBlob = new Blob([token], { type: 'text/plain' });
        const mgcUrl = window.URL.createObjectURL(mgcBlob);
        const mgcLink = document.createElement('a');
        mgcLink.href = mgcUrl;
        mgcLink.setAttribute('download', `Backup_Data_${cleanName}.mgc`);
        document.body.appendChild(mgcLink);
        mgcLink.click();
        mgcLink.remove();
        window.URL.revokeObjectURL(mgcUrl);

        // 2. Client-Side Decoding untuk Update UI
        // Format Token: payloadBase64.signature
        try {
          const payloadBase64 = token.split('.')[0];
          const jsonString = atob(payloadBase64); // Decode Base64
          const decodedData = JSON.parse(jsonString);

          // Struktur data dari backend: { meta, client, financial, result: { allocation, analysis, meta } }
          const beResult = decodedData.result;

          // Map Result ke UI Component
          const mappedResult: BudgetResult = {
            safeToSpend: beResult.allocation.livingCost,
            totalFixedAllocated:
              beResult.allocation.debtConsumptive +
              beResult.allocation.debtProductive +
              beResult.allocation.insurance +
              beResult.allocation.saving,
            surplus: beResult.meta.variableIncome, // Variable income = Surplus/Tabungan Tambahan
            allocations: [
              { type: "NEEDS", label: "Biaya Hidup (45%)", percentage: 45, amount: beResult.allocation.livingCost, description: "Kebutuhan harian, makan, transport." },
              { type: "DEBT_PROD", label: "Hutang Produktif (20%)", percentage: 20, amount: beResult.allocation.debtProductive, description: "Cicilan KPR, Modal kerja." },
              { type: "DEBT_CONS", label: "Hutang Konsumtif (15%)", percentage: 15, amount: beResult.allocation.debtConsumptive, description: "Cicilan HP, Paylater." },
              { type: "INSURANCE", label: "Proteksi (10%)", percentage: 10, amount: beResult.allocation.insurance, description: "Premi asuransi keluarga." },
              { type: "SAVING", label: "Tabungan (10%)", percentage: 10, amount: beResult.allocation.saving, description: "Investasi rutin & Dana darurat." },
            ]
          };

          setResult(mappedResult);
          setRecommendation(beResult.analysis.variableIncomeRecommendation);

          toast.success("Dokumen Siap", { description: "PDF Laporan dan File Backup berhasil diunduh." });

        } catch (decodeErr) {
          console.error("Gagal decode token UI:", decodeErr);
          toast.warning("Download Parsial", { description: "PDF berhasil, namun gagal menampilkan preview grafik." });
        }
      } else {
        toast.error("Warning", { description: "PDF diterima, tetapi Token Data tidak ditemukan pada header." });
      }

    } catch (error) {
      console.error(error);
      toast.error("Gagal Simulasi", { description: "Terjadi kesalahan sistem saat memproses data." });
    } finally {
      setIsLoading(false);
    }
  };

  // --- CORE LOGIC 2: IMPORT .MGC ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const tokenContent = event.target?.result as string;
        // Panggil Service Decode (Validasi ke Server)
        const response = await financialService.decodeSimulationToken(tokenContent);

        const { client, financial } = response.data;

        // Auto-fill Form
        setClientData({
          clientName: client.name,
          clientDob: client.dob,
          clientCity: client.city,
          clientJob: client.job,
          clientPhone: client.phone || ""
        });

        // Restore Angka (Input Form = Tahunan)
        // Data dari backend = Bulanan (div 12). Kita kali 12 lagi.
        const fixedAnnual = (financial.fixedIncome || 0) * 12;
        const variableAnnual = (financial.variableIncome || 0) * 12;

        setFixedIncome(new Intl.NumberFormat("id-ID").format(fixedAnnual));
        setVariableIncome(new Intl.NumberFormat("id-ID").format(variableAnnual));

        toast.success("Import Berhasil", { description: `Data klien ${client.name} berhasil dimuat.` });

        // Reset Result agar user klik "Hitung" lagi untuk re-validasi & generate PDF baru
        setResult(null);
        setLastGeneratedPdfUrl(null);
        setLastMgcToken(null);

      } catch (error) {
        toast.error("File Corrupt", { description: "File .mgc tidak valid atau telah dimodifikasi." });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
      }
    };

    reader.readAsText(file);
  };

  // --- HELPER: MANUAL RE-DOWNLOAD ---
  const triggerManualDownload = (type: 'PDF' | 'MGC') => {
    if (type === 'PDF' && lastGeneratedPdfUrl) {
      const link = document.createElement('a');
      link.href = lastGeneratedPdfUrl;
      const cleanName = clientData.clientName.replace(/[^a-zA-Z0-9]/g, '_') || 'Simulasi';
      link.setAttribute('download', `Simulasi_Budget_${cleanName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    else if (type === 'MGC' && lastMgcToken) {
      const blob = new Blob([lastMgcToken], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = clientData.clientName.replace(/[^a-zA-Z0-9]/g, '_') || 'Backup';
      a.download = `Backup_Data_${cleanName}.mgc`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const resetForm = () => {
    if (confirm("Reset seluruh data input?")) {
      setClientData({ clientName: "", clientDob: "", clientCity: "", clientJob: "", clientPhone: "" });
      setFixedIncome("");
      setVariableIncome("");
      setResult(null);
      setLastGeneratedPdfUrl(null);
      setLastMgcToken(null);
    }
  };

  // --- PREPARE DATA FOR DISPLAY (SWITCHABLE VIEW) ---
  const displayedResult = viewMode === "MONTHLY" ? result : (result ? {
    ...result,
    safeToSpend: result.safeToSpend * 12,
    totalFixedAllocated: result.totalFixedAllocated * 12,
    surplus: result.surplus * 12,
    allocations: result.allocations.map(a => ({ ...a, amount: a.amount * 12 }))
  } : null);

  return (
    <div className="min-h-full w-full pb-24 md:pb-12 bg-slate-50/50">

      {/* Helper Modal */}
      <MonthlyHelperModal
        isOpen={monthlyHelperTarget !== null}
        onClose={() => setMonthlyHelperTarget(null)}
        onApply={handleHelperApply}
        title={monthlyHelperTarget === "fixedIncome" ? "Hitung Gaji Tahunan" : "Hitung Bonus Tahunan"}
      />

      {/* HEADER SECTION */}
      <div className="relative pt-10 pb-32 px-5 overflow-hidden shadow-2xl bg-brand-900">
        {/* Background Layers */}
        <div className="absolute inset-0 w-full h-full z-0">
          {backgroundImages.map((image, index) => (
            <div key={image}
              className={cn("absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000", index === currentImageIndex ? 'opacity-100' : 'opacity-0')}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          <div className="absolute inset-0 bg-brand-900/90 mix-blend-multiply" />
        </div>

        {/* Header Content */}
        <div className="relative z-20 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-4">
              <Calculator className="w-4 h-4 text-cyan-300" />
              <span className="text-[10px] font-bold text-cyan-100 uppercase">Agent Tools</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Budget Simulator</h1>
            <p className="text-brand-100 text-sm max-w-lg">Alat bantu agen untuk merancang anggaran ideal bagi klien.</p>
          </div>

          {/* IMPORT ZONE */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 rounded-xl flex items-center gap-4 max-w-sm w-full hover:bg-white/15 transition-colors cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              {isImporting ? <Loader2 className="w-5 h-5 text-cyan-300 animate-spin" /> : <Upload className="w-5 h-5 text-cyan-300" />}
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-white">Import File .mgc</h4>
              <p className="text-xs text-brand-200">Load data simulasi klien sebelumnya</p>
            </div>
            <input type="file" ref={fileInputRef} accept=".mgc" className="hidden" onChange={handleFileUpload} />
          </Card>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 md:px-6 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: INPUT FORM */}
          <div className="lg:col-span-5 space-y-6">

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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Tanggal Lahir</Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <Input type="date" name="clientDob" value={clientData.clientDob} onChange={handleClientChange} className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Nomor HP (Opsional)</Label>
                    <Input name="clientPhone" placeholder="0812..." value={clientData.clientPhone} onChange={handleClientChange} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Kota Domisili</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <Input name="clientCity" placeholder="Bandung" value={clientData.clientCity} onChange={handleClientChange} className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Pekerjaan</Label>
                    <div className="relative mt-1">
                      <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <Input name="clientJob" placeholder="PNS" value={clientData.clientJob} onChange={handleClientChange} className="pl-9" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 2. DATA KEUANGAN */}
            <Card className="p-6 rounded-[2rem] shadow-xl border-white/60 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-brand-600" /> Data Keuangan
                </h3>
              </div>

              <div className="space-y-5">
                {/* FIXED INCOME */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs text-slate-500 font-semibold">Pemasukan Tetap (Setahun)</Label>
                    <button onClick={() => setMonthlyHelperTarget("fixedIncome")} className="text-[10px] text-brand-600 font-bold hover:underline flex gap-1 items-center">
                      <Calculator className="w-3 h-3" /> Bantu Hitung
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded">Rp</div>
                    <Input className="pl-12 font-bold text-lg h-12" placeholder="0" value={fixedIncome} onChange={(e) => handleMoneyInput(e.target.value, setFixedIncome)} />
                  </div>
                </div>

                {/* VARIABLE INCOME */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label className="text-xs text-slate-500 font-semibold">Pemasukan Tidak Tetap (Setahun)</Label>
                    <button onClick={() => setMonthlyHelperTarget("variableIncome")} className="text-[10px] text-brand-600 font-bold hover:underline flex gap-1 items-center">
                      <Calculator className="w-3 h-3" /> Bantu Hitung
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">Rp</div>
                    <Input className="pl-12 font-bold h-11" placeholder="0" value={variableIncome} onChange={(e) => handleMoneyInput(e.target.value, setVariableIncome)} />
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <Button variant="outline" onClick={resetForm} className="col-span-1 rounded-xl h-12 border-slate-300">
                    <RefreshCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleSimulate}
                    disabled={isLoading}
                    className="col-span-3 rounded-xl h-12 bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20 font-bold"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Simulasi & Download
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT: RESULT DISPLAY */}
          <div className="lg:col-span-7 space-y-6">
            {!displayedResult ? (
              <div className="h-full min-h-100 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-300 rounded-[2rem] bg-white/50">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <BadgePercent className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Area Hasil Simulasi</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-xs">Isi data klien dan keuangan di sebelah kiri, lalu klik "Simulasi" untuk mengunduh laporan PDF dan melihat rekomendasi.</p>
              </div>
            ) : (
              <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-6">

                {/* 1. DOWNLOAD CENTER (Muncul setelah sukses) */}
                <Card className="bg-green-50 border-green-200 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <FileJson className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-800 text-sm">Dokumen Tersimpan</h4>
                      <p className="text-xs text-green-600">File telah diunduh ke perangkat Anda.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button size="sm" variant="outline" onClick={() => triggerManualDownload('MGC')} className="flex-1 border-green-300 text-green-700 bg-white hover:bg-green-100">
                      <Download className="w-3 h-3 mr-2" /> .mgc
                    </Button>
                    <Button size="sm" onClick={() => triggerManualDownload('PDF')} className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm">
                      <Download className="w-3 h-3 mr-2" /> PDF
                    </Button>
                  </div>
                </Card>

                {/* 2. VIEW TOGGLE & HEADER */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black text-slate-800">Preview Analisa</h2>
                  <div className="bg-white p-1 rounded-lg border border-slate-200 flex">
                    <button onClick={() => setViewMode("MONTHLY")} className={cn("px-3 py-1.5 rounded-md text-xs font-bold transition-all", viewMode === "MONTHLY" ? "bg-brand-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>Bulanan</button>
                    <button onClick={() => setViewMode("ANNUAL")} className={cn("px-3 py-1.5 rounded-md text-xs font-bold transition-all", viewMode === "ANNUAL" ? "bg-cyan-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>Tahunan</button>
                  </div>
                </div>

                {/* 3. SAFE TO SPEND CARD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={cn("text-white p-6 rounded-[2rem] shadow-lg relative overflow-hidden border-0 flex flex-col justify-center", viewMode === "MONTHLY" ? "bg-brand-600" : "bg-cyan-600")}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <p className="text-white/80 font-bold uppercase tracking-widest text-[10px] mb-1">Safe to Spend ({viewMode === "MONTHLY" ? "Bulan Ini" : "Setahun"})</p>
                    <h2 className="text-3xl font-black tracking-tight mb-2 truncate">{formatRupiah(displayedResult.safeToSpend)}</h2>
                    <p className="text-[10px] text-white/90">Batas aman untuk gaya hidup agar tidak boncos.</p>
                  </Card>

                  {/* SURPLUS INFO */}
                  <Card className="bg-white p-5 rounded-[2rem] border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Potensi Tabungan (Surplus)</p>
                      <h3 className="text-xl font-black text-emerald-600 truncate">{formatRupiah(displayedResult.surplus)}</h3>
                      <p className="text-[10px] text-slate-400 mt-1">Termasuk alokasi gaji tidak tetap</p>
                    </div>
                    <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                      <PiggyBank className="w-6 h-6" />
                    </div>
                  </Card>
                </div>

                {/* 4. ALLOCATION GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayedResult.allocations.map((item, idx) => {
                    const style = getAllocationStyle(item.type);
                    const Icon = style.icon;
                    return (
                      <div key={idx} className={cn("p-5 rounded-2xl border flex flex-col justify-between h-full transition-all hover:scale-[1.02]", style.bg, style.border)}>
                        <div className="flex justify-between items-start mb-3">
                          <div className={cn("p-2 rounded-xl bg-white shadow-sm", style.iconColor)}><Icon className="w-5 h-5" /></div>
                          <span className={cn("text-xs font-black px-2 py-1 rounded-lg bg-white/50 border border-black/5", style.text)}>{item.percentage}%</span>
                        </div>
                        <div>
                          <h4 className={cn("font-bold text-sm mb-1", style.text)}>{item.label}</h4>
                          <p className="text-xl font-black text-slate-800 tracking-tight truncate">{formatRupiah(item.amount)}</p>
                          <p className="text-[10px] text-slate-500 mt-2">{item.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 5. RECOMMENDATION BOX */}
                {recommendation && (
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
                    <div className="p-1 bg-blue-100 rounded-full text-blue-600 mt-0.5"><ShieldCheck className="w-4 h-4" /></div>
                    <div>
                      <h4 className="text-xs font-bold text-blue-800 uppercase mb-1">Catatan Analis</h4>
                      <p className="text-sm text-blue-700 leading-relaxed">{recommendation}</p>
                    </div>
                  </div>
                )}

              </div>
            )}
            <BudgetGuide />
          </div>

        </div>
      </div>
    </div>
  );
}