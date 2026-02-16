"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Calculator, User, Briefcase, TrendingUp,
  RefreshCcw, Download, Hourglass, PiggyBank,
  AlertCircle, Loader2, Upload, FileJson,
  MapPin, Calendar, CheckCircle2, Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreatePensionSimulationDto, PensionSimulationResult } from "@/lib/types";
import { financialService } from "@/services/financial.service";
import { PensionGuide } from "@/components/features/calculator/pension-guide";
import { PdfLoadingModal } from "@/components/features/finance/pdf-loading-modal";
import { toast } from "sonner";

// Import Visual Components
import { PensionTimelineCard } from "@/components/features/calculator/pension/pension-timeline-card";
import { PensionRealityCard } from "@/components/features/calculator/pension/pension-reality-card";
import { PensionSolutionCard } from "@/components/features/calculator/pension/pension-solution-card";

export default function PensionPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE: CLIENT IDENTITY ---
  const [clientData, setClientData] = useState({
    clientName: "",
    clientDob: "",
    clientCity: "",
    clientJob: "",
    clientPhone: ""
  });

  // --- STATE: FINANCIAL PARAMETERS ---
  const [currentAge, setCurrentAge] = useState<string>("");
  const [retirementAge, setRetirementAge] = useState<string>("55");
  const [lifeExpectancy, setLifeExpectancy] = useState<string>("75");

  const [currentExpense, setCurrentExpense] = useState<string>("");
  const [currentSaving, setCurrentSaving] = useState<string>("");

  const [inflation, setInflation] = useState(5);
  const [returnRate, setReturnRate] = useState(10);

  // --- STATE: RESULT & FILES ---
  const [result, setResult] = useState<PensionSimulationResult | null>(null);

  // State file di memory (Blob URL)
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
    '/images/pensiun/rancangdanaharitua1.webp',
    '/images/pensiun/rancangdanaharitua2.webp'
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

    // Reset result jika input berubah (Force user to re-calculate)
    if (result) {
      setResult(null);
      setGeneratedFiles(null);
    }
  };

  const parseMoney = (val: string) => parseInt(val.replace(/\./g, "")) || 0;
  const parseNum = (val: string) => parseInt(val) || 0;

  // ===========================================================================
  // 1. CORE LOGIC: SIMULATE / PREVIEW
  // ===========================================================================
  const handleSimulate = async () => {
    // 1. Validasi
    if (!clientData.clientName || !clientData.clientCity || !currentExpense) {
      toast.error("Data Belum Lengkap", { description: "Nama, Kota, dan Pengeluaran Saat Ini wajib diisi." });
      return;
    }

    const cAge = parseNum(currentAge);
    const rAge = parseNum(retirementAge);

    if (cAge >= rAge) {
      toast.error("Logika Usia Salah", { description: "Usia pensiun harus lebih besar dari usia saat ini." });
      return;
    }

    setIsLoading(true);
    setShowPdfModal(true);

    try {
      // 2. Prepare Payload
      const payload: CreatePensionSimulationDto = {
        ...clientData,
        currentAge: cAge,
        retirementAge: rAge,
        lifeExpectancy: parseNum(lifeExpectancy),
        currentExpense: parseMoney(currentExpense),
        currentSaving: parseMoney(currentSaving),
        inflationRate: inflation,
        returnRate: returnRate
      };

      // 3. Call API (Stateless)
      const response = await financialService.simulateAgentPension(payload);

      // --- STEP A: HANDLE TOKEN (HEADER) -> UI UPDATE ---
      const token = response.headers['x-mgc-token'];
      if (!token) throw new Error("Token data tidak ditemukan.");

      const payloadBase64 = token.split('.')[0];
      const jsonString = atob(payloadBase64);
      const decodedData = JSON.parse(jsonString);

      setResult(decodedData.result); // Update UI Kanan

      // --- STEP B: HANDLE PDF BLOB -> MEMORY ---
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      const cleanName = clientData.clientName.replace(/[^a-zA-Z0-9]/g, '_') || 'Klien';

      setGeneratedFiles({
        pdfUrl,
        mgcToken: token,
        filenameMgc: `Backup_Pensiun_${cleanName}.mgc`,
        filenamePdf: `Rencana_Pensiun_${cleanName}.pdf`
      });

      toast.success("Analisa Selesai", { description: "Silakan cek hasil perhitungan di panel kanan." });

    } catch (error) {
      console.error("Simulation error:", error);
      toast.error("Gagal Simulasi", { description: "Terjadi kesalahan saat memproses data." });
    } finally {
      setIsLoading(false);
      setShowPdfModal(false);
    }
  };

  // ===========================================================================
  // 2. CORE LOGIC: DOWNLOAD MANUAL
  // ===========================================================================
  const handleDownloadFile = (type: 'PDF' | 'MGC') => {
    if (!generatedFiles) {
      toast.error("Belum Ada Data", { description: "Silakan lakukan simulasi terlebih dahulu." });
      return;
    }

    if (type === 'PDF' && generatedFiles.pdfUrl) {
      const link = document.createElement('a');
      link.href = generatedFiles.pdfUrl;
      link.setAttribute('download', generatedFiles.filenamePdf || "Laporan_Pensiun.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Download PDF", { description: "Laporan resmi berhasil diunduh." });
    }
    else if (type === 'MGC' && generatedFiles.mgcToken) {
      const blob = new Blob([generatedFiles.mgcToken], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generatedFiles.filenameMgc || "Backup_Data.mgc";
      a.click();
      window.URL.revokeObjectURL(url);
      toast.info("Download Backup", { description: "File data (.mgc) berhasil disimpan." });
    }
  };

  // ===========================================================================
  // 3. CORE LOGIC: IMPORT .MGC (DIPERBAIKI)
  // ===========================================================================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset value input agar file yang sama bisa dipilih ulang jika gagal
    if (fileInputRef.current) fileInputRef.current.value = "";

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const rawContent = event.target?.result as string;

        // [FIX] Sanitasi Input: Hapus spasi/newline agar signature match
        const tokenContent = rawContent ? rawContent.trim() : "";

        if (!tokenContent) throw new Error("File kosong");

        const response = await financialService.decodeSimulationToken(tokenContent);

        // [FIX] Handling Unwrapping Data
        const rootData = response.data || response;

        // Validasi Module Type
        if (rootData.meta?.module && rootData.meta.module !== 'PENSION') {
          toast.error("Modul Tidak Cocok", {
            description: `File ini adalah data ${rootData.meta.module}, bukan Pensiun.`
          });
          return;
        }

        const client = rootData.client;
        const financial = rootData.financial;

        if (!client || !financial) {
          throw new Error("Struktur data tidak valid.");
        }

        // Populate Form Identity
        setClientData({
          clientName: client.name || "",
          clientDob: client.dob || "",
          clientCity: client.city || "",
          clientJob: client.job || "",
          clientPhone: client.phone || ""
        });

        // Numeric Inputs (Konversi ke string agar input field membaca nilai)
        setCurrentAge(String(financial.currentAge || ""));
        setRetirementAge(String(financial.retirementAge || "55"));
        setLifeExpectancy(String(financial.lifeExpectancy || "75"));

        // Financials (Format Rupiah)
        // Note: Untuk Pensiun, 'currentExpense' adalah BULANAN. Tidak perlu dikali 12.
        const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
        setCurrentExpense(fmt(Number(financial.currentExpense) || 0));
        setCurrentSaving(fmt(Number(financial.currentSaving) || 0));

        // Sliders
        setInflation(Number(financial.inflationRate) || 5);
        setReturnRate(Number(financial.returnRate) || 10);

        toast.success("Import Berhasil", { description: `Data pensiun ${client.name} berhasil dimuat.` });

        // Reset result agar user dipaksa klik "Hitung" lagi (memastikan kalkulasi fresh)
        setResult(null);
        setGeneratedFiles(null);

      } catch (error: any) {
        console.error("Import Error:", error);
        // Tampilkan pesan error spesifik dari backend (misal: "Signature Mismatch")
        const backendMessage = error.response?.data?.message || error.message;
        toast.error("Gagal Import File", { description: backendMessage });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm("Reset seluruh form?")) {
      setClientData({ clientName: "", clientDob: "", clientCity: "", clientJob: "", clientPhone: "" });
      setCurrentAge(""); setRetirementAge("55"); setLifeExpectancy("75");
      setCurrentExpense(""); setCurrentSaving("");
      setResult(null);
      setGeneratedFiles(null);
    }
  };

  return (
    <div className="min-h-full w-full pb-24 md:pb-12 bg-slate-50/50">

      <PdfLoadingModal isOpen={showPdfModal} />

      {/* --- HEADER SECTION --- */}
      <div className="relative pt-10 pb-32 px-5 overflow-hidden shadow-2xl bg-brand-900">
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
              <Calculator className="w-4 h-4 text-cyan-300" />
              <span className="text-[10px] font-bold text-cyan-100 tracking-widest uppercase">Pension Planner</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3 drop-shadow-xl">
              Dana Pensiun
            </h1>
            <p className="text-brand-100 text-sm md:text-base max-w-lg leading-relaxed opacity-90 drop-shadow-md">
              Rencanakan masa depan sejahtera dengan kekuatan dana Anda saat ini bersama MAXIPRO.
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

          {/* LEFT: INPUT FORM */}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Tanggal Lahir</Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <Input type="date" name="clientDob" value={clientData.clientDob} onChange={handleClientChange} className="pl-9" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Kota Domisili</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <Input name="clientCity" placeholder="Bandung" value={clientData.clientCity} onChange={handleClientChange} className="pl-9" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-500">Pekerjaan</Label>
                  <div className="relative mt-1">
                    <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <Input name="clientJob" placeholder="Swasta" value={clientData.clientJob} onChange={handleClientChange} className="pl-9" />
                  </div>
                </div>
              </div>
            </Card>

            {/* 2. PARAMETER PENSIUN */}
            <Card className="p-6 rounded-[2rem] shadow-xl border-white/60 bg-white">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-brand-600" /> Target Waktu
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Usia Kini</Label>
                  <Input
                    type="number"
                    value={currentAge}
                    onChange={e => { setCurrentAge(e.target.value); setResult(null); }}
                    className="h-12 bg-slate-50 text-center font-bold border-slate-200 focus:border-brand-500"
                    placeholder="30"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-indigo-500 uppercase">Usia Pensiun</Label>
                  <Input
                    type="number"
                    value={retirementAge}
                    onChange={e => { setRetirementAge(e.target.value); setResult(null); }}
                    className="h-12 bg-indigo-50 text-center font-bold text-indigo-700 border-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Harapan Hidup</Label>
                  <Input
                    type="number"
                    value={lifeExpectancy}
                    onChange={e => { setLifeExpectancy(e.target.value); setResult(null); }}
                    className="h-12 bg-slate-50 text-center font-bold border-slate-200"
                  />
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-brand-600" /> Kondisi Keuangan
              </h3>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Biaya Hidup Bulanan (Saat Ini)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                    <Input
                      value={currentExpense}
                      onChange={e => handleMoneyInput(e.target.value, setCurrentExpense)}
                      className="pl-12 h-12 font-bold text-lg"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">*Gaya hidup yang ingin dipertahankan saat pensiun</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-emerald-600 uppercase">Aset Pensiun Yang Sudah Ada</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-500">Rp</span>
                    <Input
                      value={currentSaving}
                      onChange={e => handleMoneyInput(e.target.value, setCurrentSaving)}
                      className="pl-12 h-12 font-bold text-lg border-emerald-200 bg-emerald-50/30 text-emerald-800 focus:border-emerald-500"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-[10px] text-emerald-600/70">*Saldo JHT, DPLK, atau Reksadana</p>
                </div>
              </div>
            </Card>

            {/* 3. ASUMSI EKONOMI */}
            <Card className="p-6 rounded-[2rem] shadow-xl border-white/60 bg-white">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" /> Asumsi Ekonomi
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                    <span>Inflasi Tahunan</span>
                    <span>{inflation}%</span>
                  </div>
                  <Slider value={inflation} onChange={(v) => { setInflation(v); setResult(null); }} min={0} max={15} step={0.5} className="accent-rose-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
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
                className="flex-2 h-12 bg-brand-600 hover:bg-brand-700 font-bold text-lg shadow-lg shadow-brand-500/20 rounded-xl transition-all text-white"
              >
                {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Play className="w-5 h-5 mr-2" />}
                Lihat Analisa
              </Button>
            </div>

          </div>

          {/* RIGHT: RESULT DISPLAY */}
          <div className="lg:col-span-6 space-y-6">
            {!result ? (
              <div className="h-full min-h-100 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 bg-white/50 rounded-[2rem]">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Hourglass className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">Area Hasil Simulasi</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-xs leading-relaxed">
                  Lengkapi data di samping, lalu klik <strong>"Lihat Analisa"</strong> untuk menampilkan strategi pensiun.
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

                {/* 2. TIMELINE CARD */}
                <PensionTimelineCard
                  currentAge={parseNum(currentAge)}
                  retirementAge={parseNum(retirementAge)}
                  lifeExpectancy={parseNum(lifeExpectancy)}
                />

                {/* 3. SOLUTION CARD (THE HERO) */}
                <PensionSolutionCard
                  monthlySaving={result.monthlySaving}
                  totalFundNeeded={result.totalFundNeeded}
                  shortfall={result.shortfall}
                  returnRate={returnRate}
                  isSafe={result.shortfall <= 0}
                />

                {/* 4. REALITY CHECK (SHOCK THERAPY) */}
                <PensionRealityCard
                  currentMonthlyExpense={parseMoney(currentExpense)}
                  futureMonthlyExpense={result.futureMonthlyExpense}
                  inflationRate={inflation}
                  yearsDuration={result.yearsToRetire}
                />

                {/* 5. NOTES */}
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex gap-4 items-start">
                  <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-1 shrink-0"><AlertCircle className="w-5 h-5" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Penting Diingat</h4>
                    <p className="text-sm text-blue-800 leading-relaxed font-medium">
                      Perhitungan ini menggunakan asumsi bunga majemuk (compound interest).
                      Semakin awal memulai, semakin ringan beban tabungan bulanan karena efek waktu.
                    </p>
                  </div>
                </div>

              </div>
            )}
            <PensionGuide />
          </div>

        </div>
      </div>
    </div>
  );
}