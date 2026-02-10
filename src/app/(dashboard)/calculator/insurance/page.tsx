"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { InfoPopover } from "@/components/ui/info-popover";
import {
  ShieldCheck, HeartPulse, BadgeDollarSign,
  RefreshCcw, Download, Landmark, Wallet,
  TrendingUp, AlertCircle, CheckCircle2, Loader2,
  Calculator, User, MapPin, Briefcase, Calendar, Save, Upload, FileJson
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/financial-math";
import { CreateInsuranceSimulationDto, InsuranceSimulationResult } from "@/lib/types";
import { financialService } from "@/services/financial.service";
import { InsuranceGuide } from "@/components/features/calculator/insurance-guide";
import { PdfLoadingModal } from "@/components/features/finance/pdf-loading-modal";
import { toast } from "sonner";

// [NEW] Import Visual Components
import { GapAnalysisGauge } from "@/components/features/calculator/insurance/gap-analysis-gauge";
import { InsuranceResultCard } from "@/components/features/calculator/insurance/insurance-result-card";
import { Label } from "@/components/ui/label";

export default function InsurancePage() {
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
  // Card 1: Utang
  const [debtKPR, setDebtKPR] = useState("");
  const [debtKPM, setDebtKPM] = useState("");
  const [debtProductive, setDebtProductive] = useState("");
  const [debtConsumptive, setDebtConsumptive] = useState("");
  const [debtOther, setDebtOther] = useState("");

  // Card 2: Proteksi Penghasilan
  const [annualIncome, setAnnualIncome] = useState("");
  const [protectionDuration, setProtectionDuration] = useState("10");
  const [inflation, setInflation] = useState(5);
  const [returnRate, setReturnRate] = useState(6);

  // Card 3: Lainnya
  const [finalExpense, setFinalExpense] = useState("");
  const [existingInsurance, setExistingInsurance] = useState("");

  // --- STATE: RESULT & UI ---
  const [result, setResult] = useState<InsuranceSimulationResult | null>(null);

  // Data hasil generate untuk re-download
  const [generatedFiles, setGeneratedFiles] = useState<{
    pdfUrl: string | null;
    mgcToken: string | null;
    filenameMgc: string | null;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Helper Calculator State
  const [showKprModal, setShowKprModal] = useState(false);
  const [showKpmModal, setShowKpmModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [tempMonthly, setTempMonthly] = useState("");
  const [tempTenor, setTempTenor] = useState("");

  // --- BACKGROUND SLIDESHOW ---
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const backgroundImages = [
    '/images/asuransi/rancangproteksi1.webp',
    '/images/asuransi/rancangproteksi2.webp'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev === backgroundImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // --- HANDLERS ---
  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value });
  };

  const handleMoneyInput = (val: string, setter: (v: string) => void) => {
    let num = val.replace(/\D/g, "");
    if (num.length > 1 && num.startsWith("0")) num = num.substring(1);
    setter(num.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    // Reset result jika input berubah agar data konsisten
    if (result) {
      setResult(null);
      setGeneratedFiles(null);
    }
  };

  const parseMoney = (val: string) => parseInt(val.replace(/\./g, "")) || 0;

  // --- CORE LOGIC 1: SIMULATE & DOWNLOAD (STATELESS) ---
  const handleSimulate = async () => {
    // 1. Validasi Input Dasar
    if (!clientData.clientName || !clientData.clientCity || !annualIncome) {
      toast.error("Data Tidak Lengkap", { description: "Mohon isi Nama, Kota, dan Penghasilan." });
      return;
    }

    setIsLoading(true);
    setShowPdfModal(true); // Tampilkan indikator loading PDF

    try {
      // 2. Prepare Payload
      const totalDebt =
        parseMoney(debtKPR) +
        parseMoney(debtKPM) +
        parseMoney(debtProductive) +
        parseMoney(debtConsumptive) +
        parseMoney(debtOther);

      const monthlyExpense = parseMoney(annualIncome) / 12; // Asumsi Income = Expense untuk Replacement

      const payload: CreateInsuranceSimulationDto = {
        ...clientData,
        type: 'LIFE', // Default logic saat ini
        dependentCount: 2, // Default atau bisa ditambah input field nanti
        monthlyExpense,
        existingDebt: totalDebt,
        existingCoverage: parseMoney(existingInsurance),
        protectionDuration: parseInt(protectionDuration) || 10,
        finalExpense: parseMoney(finalExpense),
        inflationRate: inflation,
        returnRate: returnRate
      };

      // 3. Call API (Stateless Stream)
      const response = await financialService.simulateAgentInsurance(payload);

      // --- STEP A: HANDLE PDF (BODY) ---
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      // Auto-Download PDF
      const pdfLink = document.createElement('a');
      pdfLink.href = pdfUrl;
      const cleanName = clientData.clientName.replace(/[^a-zA-Z0-9]/g, '_');
      pdfLink.setAttribute('download', `Simulasi_Asuransi_${cleanName}.pdf`);
      document.body.appendChild(pdfLink);
      pdfLink.click();
      pdfLink.remove();

      // --- STEP B: HANDLE TOKEN (HEADER) ---
      const token = response.headers['x-mgc-token'];

      if (token) {
        // 1. Auto-Download .mgc
        const mgcBlob = new Blob([token], { type: 'text/plain' });
        const mgcUrl = window.URL.createObjectURL(mgcBlob);
        const mgcLink = document.createElement('a');
        mgcLink.href = mgcUrl;
        const filenameMgc = `Backup_Asuransi_${cleanName}.mgc`;
        mgcLink.setAttribute('download', filenameMgc);
        document.body.appendChild(mgcLink);
        mgcLink.click();
        mgcLink.remove();
        window.URL.revokeObjectURL(mgcUrl);

        // Simpan state untuk re-download
        setGeneratedFiles({ pdfUrl, mgcToken: token, filenameMgc });

        // 2. Client-Side Hydration (Decode Token -> UI Update)
        try {
          const payloadBase64 = token.split('.')[0];
          const jsonString = atob(payloadBase64);
          const decodedData = JSON.parse(jsonString);

          // Struktur data: { meta, client, financial, result: InsuranceSimulationResult }
          const beResult = decodedData.result;

          // Set Result State untuk Panel Kanan
          setResult(beResult);

          toast.success("Dokumen Siap", { description: "Laporan PDF dan File Backup berhasil diunduh." });

        } catch (decodeErr) {
          console.error("Gagal decode token UI:", decodeErr);
          toast.warning("Download Parsial", { description: "PDF berhasil, namun gagal menampilkan preview grafik." });
        }
      } else {
        toast.error("Warning", { description: "PDF diterima, tetapi Token Data tidak ditemukan." });
      }

    } catch (error) {
      console.error("Simulasi Error:", error);
      toast.error("Gagal Simulasi", { description: "Terjadi kesalahan sistem saat memproses data." });
    } finally {
      setIsLoading(false);
      setShowPdfModal(false);
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
        // Panggil Service Decode
        const response = await financialService.decodeSimulationToken(tokenContent);

        // Cek Tipe Modul (Safety Check)
        if (response.data.meta?.module && response.data.meta.module !== 'INSURANCE') {
          toast.error("Format Salah", { description: "File ini bukan data simulasi Asuransi." });
          return;
        }

        const { client, financial } = response.data;

        // Auto-fill Form Identity
        setClientData({
          clientName: client.name,
          clientDob: client.dob,
          clientCity: client.city,
          clientJob: client.job,
          clientPhone: client.phone || ""
        });

        // Auto-fill Financial Data
        // Convert number to formatted string IDR
        const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);

        // Breakdown Hutang (Jika ada detail di 'financial', kita coba map)
        // Note: DTO simpanan hanya menyimpan 'existingDebt' total.
        // Jadi kita taruh totalnya di 'debtOther' atau 'debtProductive' sebagai fallback,
        // atau kosongkan rincian dan isi salah satu field agar totalnya pas.
        setDebtKPR(""); setDebtKPM(""); setDebtProductive(""); setDebtConsumptive("");
        setDebtOther(fmt(financial.existingDebt || 0)); // Taruh total di Other agar aman

        // Income & Expense
        // 'monthlyExpense' di DTO adalah basisnya. Kita asumsikan annualIncome = monthly * 12
        setAnnualIncome(fmt((financial.monthlyExpense || 0) * 12));

        setProtectionDuration(String(financial.protectionDuration || 10));
        setInflation(financial.inflationRate || 5);
        setReturnRate(financial.returnRate || 6);

        setFinalExpense(fmt(financial.finalExpense || 0));
        setExistingInsurance(fmt(financial.existingCoverage || 0));

        toast.success("Import Berhasil", { description: `Data klien ${client.name} berhasil dimuat.` });

        // Reset Result agar user klik "Hitung" lagi (re-validasi)
        setResult(null);
        setGeneratedFiles(null);

      } catch (error) {
        toast.error("File Corrupt", { description: "File .mgc tidak valid atau rusak." });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  // --- HELPER: MANUAL RE-DOWNLOAD ---
  const triggerManualDownload = (type: 'PDF' | 'MGC') => {
    if (!generatedFiles) return;

    if (type === 'PDF' && generatedFiles.pdfUrl) {
      const link = document.createElement('a');
      link.href = generatedFiles.pdfUrl;
      const cleanName = clientData.clientName.replace(/[^a-zA-Z0-9]/g, '_') || 'Simulasi';
      link.setAttribute('download', `Simulasi_Asuransi_${cleanName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    else if (type === 'MGC' && generatedFiles.mgcToken) {
      const blob = new Blob([generatedFiles.mgcToken], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = clientData.clientName.replace(/[^a-zA-Z0-9]/g, '_') || 'Backup';
      a.download = generatedFiles.filenameMgc || `Backup_Asuransi_${cleanName}.mgc`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    if (confirm("Reset seluruh data input?")) {
      setClientData({ clientName: "", clientDob: "", clientCity: "", clientJob: "", clientPhone: "" });
      setDebtKPR(""); setDebtKPM(""); setDebtProductive(""); setDebtConsumptive(""); setDebtOther("");
      setAnnualIncome(""); setProtectionDuration("10");
      setFinalExpense(""); setExistingInsurance("");
      setResult(null);
      setGeneratedFiles(null);
    }
  };

  // --- MODAL CALCULATOR HELPER ---
  const applyCalculation = (type: 'KPR' | 'KPM' | 'INCOME') => {
    const monthly = parseInt(tempMonthly.replace(/\./g, "")) || 0;
    let tenor = 0;

    if (type === 'INCOME') {
      tenor = 12;
    } else {
      tenor = parseInt(tempTenor) || 0;
    }

    const total = monthly * tenor;
    const formatted = new Intl.NumberFormat("id-ID").format(total);

    if (type === 'KPR') {
      setDebtKPR(formatted);
      setShowKprModal(false);
    } else if (type === 'KPM') {
      setDebtKPM(formatted);
      setShowKpmModal(false);
    } else if (type === 'INCOME') {
      setAnnualIncome(formatted);
      setShowIncomeModal(false);
    }

    setTempMonthly("");
    setTempTenor("");
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
          <div className="absolute inset-0 bg-brand-500/85 mix-blend-multiply" />
          <div className="absolute inset-0 bg-linear-to-t from-brand-600 via-brand-600/40 to-transparent" />
        </div>

        <div className="relative z-20 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-4 shadow-lg">
              <ShieldCheck className="w-4 h-4 text-cyan-300" />
              <span className="text-[10px] font-bold text-cyan-100 tracking-widest uppercase">Agent Tools</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3 drop-shadow-xl">
              Insurance Planner
            </h1>
            <p className="text-brand-100 text-sm md:text-base max-w-lg leading-relaxed opacity-90 drop-shadow-md">
              Hitung kebutuhan Uang Pertanggungan (UP) ideal klien Anda secara profesional dan akurat.
            </p>
          </div>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 p-4 rounded-xl flex items-center gap-4 max-w-sm w-full hover:bg-white/15 transition-colors cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              {isImporting ? <Loader2 className="w-5 h-5 text-cyan-300 animate-spin" /> : <Upload className="w-5 h-5 text-cyan-300" />}
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-white">Import File .mgc</h4>
              <p className="text-xs text-brand-200">Load data simulasi asuransi sebelumnya</p>
            </div>
            <input type="file" ref={fileInputRef} accept=".mgc" className="hidden" onChange={handleFileUpload} />
          </Card>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 md:px-6 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: INPUT FORM */}
          <div className="lg:col-span-7 space-y-6">

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

            {/* 2. KEWAJIBAN / UTANG */}
            <Card className="p-6 rounded-[2rem] shadow-xl border-white/60 bg-white">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                <BadgeDollarSign className="w-5 h-5 text-brand-600" /> 1. Sisa Utang Keluarga
              </h3>
              <p className="text-xs text-slate-500 mb-6 -mt-2">
                Masukkan sisa pokok utang (outstanding) agar keluarga tidak terbebani cicilan jika terjadi risiko.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Sisa KPR (Rumah)</label>
                    <button type="button" onClick={() => setShowKprModal(true)} className="text-[9px] font-bold text-brand-600 hover:underline flex items-center gap-1">
                      <Calculator className="w-3 h-3" /> Bantu Hitung
                    </button>
                  </div>
                  <InputGroup value={debtKPR} onChange={e => handleMoneyInput(e.target.value, setDebtKPR)} placeholder="0" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Sisa KPM (Kendaraan)</label>
                    <button type="button" onClick={() => setShowKpmModal(true)} className="text-[9px] font-bold text-brand-600 hover:underline flex items-center gap-1">
                      <Calculator className="w-3 h-3" /> Bantu Hitung
                    </button>
                  </div>
                  <InputGroup value={debtKPM} onChange={e => handleMoneyInput(e.target.value, setDebtKPM)} placeholder="0" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Utang Usaha / Modal</label>
                  <InputGroup value={debtProductive} onChange={e => handleMoneyInput(e.target.value, setDebtProductive)} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Utang Kartu Kredit</label>
                  <InputGroup value={debtConsumptive} onChange={e => handleMoneyInput(e.target.value, setDebtConsumptive)} placeholder="0" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Utang Lainnya</label>
                  <InputGroup value={debtOther} onChange={e => handleMoneyInput(e.target.value, setDebtOther)} placeholder="0" />
                </div>
              </div>
            </Card>

            {/* 3. DANA BIAYA HIDUP */}
            <Card className="p-6 rounded-[2rem] shadow-xl border-white/60 bg-white">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                <Wallet className="w-5 h-5 text-brand-600" /> 2. Dana Biaya Hidup Keluarga
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-bold text-brand-600 uppercase">Gaji Bersih Setahun</label>
                      <button
                        type="button"
                        onClick={() => { setTempMonthly(""); setShowIncomeModal(true); }}
                        className="text-[9px] font-bold text-brand-600 hover:underline flex items-center gap-1"
                      >
                        <Calculator className="w-3 h-3" /> Bantu Hitung
                      </button>
                    </div>
                    <InputGroup
                      value={annualIncome}
                      onChange={e => handleMoneyInput(e.target.value, setAnnualIncome)}
                    />
                    <p className="text-[9px] text-slate-400 ml-1 mt-1">*Total gaji 12 bulan (Take Home Pay)</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Lama Ditanggung</label>
                      <InfoPopover content={{
                        title: "Lama Ditanggung",
                        definition: "Jangka waktu terlama untuk menanggung biaya hidup anggota keluarga (tahun).",
                        example: "Misal: Anak bungsu usia 5 tahun, mandiri usia 22 tahun. Maka lama ditanggung = 17 tahun."
                      }} />
                    </div>
                    <div className="relative group">
                      <Input
                        type="number"
                        placeholder="10"
                        value={protectionDuration}
                        onChange={e => {
                          let num = e.target.value.replace(/\D/g, "");
                          if (num.length > 1 && num.startsWith("0")) num = num.substring(1);
                          setProtectionDuration(num);
                          if (result) setResult(null);
                        }}
                        className="h-12 bg-slate-50 text-center font-bold text-slate-800 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl pr-12 pl-4"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Tahun</span>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-50/50 p-5 rounded-xl space-y-6 border border-brand-100/50">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                      <span>Asumsi Inflasi Tahunan</span>
                      <span>{inflation}%</span>
                    </div>
                    <Slider
                      value={inflation}
                      onChange={(val) => { setInflation(val); setResult(null); }}
                      min={0} max={20} step={0.5}
                      className="accent-rose-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                      <span>Target Return Investasi</span>
                      <span>{returnRate}%</span>
                    </div>
                    <Slider
                      value={returnRate}
                      onChange={(val) => { setReturnRate(val); setResult(null); }}
                      min={0} max={20} step={0.5}
                      className="accent-emerald-600"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* 4. LAINNYA */}
            <Card className="p-6 rounded-[2rem] shadow-xl border-white/60 bg-white">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                <Landmark className="w-5 h-5 text-brand-600" /> 3. Biaya Duka & Asuransi Existing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Biaya Pemakaman & RS</label>
                  <InputGroup value={finalExpense} onChange={e => handleMoneyInput(e.target.value, setFinalExpense)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-emerald-600 uppercase">Asuransi Jiwa yg Sudah Punya</label>
                  <InputGroup value={existingInsurance} onChange={e => handleMoneyInput(e.target.value, setExistingInsurance)} />
                </div>
              </div>
            </Card>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleReset} className="flex-1 h-12 rounded-xl border-slate-300">
                <RefreshCcw className="w-4 h-4 mr-2" /> Reset
              </Button>
              <Button
                onClick={handleSimulate}
                disabled={isLoading}
                className="flex-2 h-12 bg-brand-600 hover:bg-brand-700 font-bold text-lg shadow-lg shadow-brand-500/20 rounded-xl transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                Simulasi & Download
              </Button>
            </div>

          </div>

          {/* RIGHT: RESULT DISPLAY */}
          <div className="lg:col-span-5 space-y-6">
            {!result ? (
              <div className="h-full min-h-100 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 bg-white/50 rounded-[2rem]">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <HeartPulse className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">Area Hasil Simulasi</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-xs leading-relaxed">
                  Isi data klien di samping, lalu klik "Simulasi & Download" untuk melihat analisa.
                </p>
              </div>
            ) : (
              <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">

                {/* 1. DOWNLOAD CENTER */}
                {generatedFiles && (
                  <Card className="bg-green-50 border-green-200 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <FileJson className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-800 text-sm">Dokumen Terbentuk</h4>
                        <p className="text-xs text-green-600">File PDF & Backup telah diunduh.</p>
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
                )}

                {/* 2. GAP GAUGE */}
                <GapAnalysisGauge
                  totalNeeded={result.totalNeeded}
                  existingCoverage={parseMoney(existingInsurance)}
                  coverageGap={result.coverageGap}
                />

                {/* 3. BREAKDOWN CARD (Pilar A & B) */}
                <InsuranceResultCard
                  incomeReplacement={result.incomeReplacementValue}
                  annualExpense={result.annualExpense}
                  duration={parseInt(protectionDuration)}
                  debtClearance={result.debtClearanceValue + result.otherNeeds}
                  existingDebt={result.debtClearanceValue}
                  finalExpense={result.otherNeeds}
                />

                {/* 4. RECOMMENDATION */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
                  <div className="p-1 bg-blue-100 rounded-full text-blue-600 mt-0.5"><ShieldCheck className="w-4 h-4" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-800 uppercase mb-1">Catatan Analis</h4>
                    <p className="text-sm text-blue-700 leading-relaxed">{result.recommendation}</p>
                  </div>
                </div>

              </div>
            )}
            <InsuranceGuide />
          </div>

        </div>
      </div>

      {/* --- MODAL HELPER (GENERIC) --- */}
      {(showKprModal || showKpmModal || showIncomeModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => { setShowKprModal(false); setShowKpmModal(false); setShowIncomeModal(false); }} />

          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  {showIncomeModal ? "Kalkulator Gaji Tahunan" : "Asisten Kalkulator Utang"}
                </h3>
                <p className="text-xs text-slate-500">
                  {showIncomeModal ? "Hitung total gaji setahun dari gaji bulanan." : "Hitung sisa utang dari cicilan rutin."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {showIncomeModal ? "Gaji Bersih Per Bulan" : "Cicilan Per Bulan"}
                </label>
                <InputGroup
                  value={tempMonthly}
                  onChange={(e) => handleMoneyInput(e.target.value, setTempMonthly)}
                  placeholder="0"
                />
              </div>

              {!showIncomeModal && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Sisa Tenor (Bulan)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={tempTenor}
                      onChange={(e) => setTempTenor(e.target.value)}
                      className="h-12 rounded-xl font-bold bg-slate-50 border-slate-200 focus:border-brand-500 pr-12"
                      placeholder="Contoh: 120"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">
                      Bln
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-slate-200"
                  onClick={() => { setShowKprModal(false); setShowKpmModal(false); setShowIncomeModal(false); }}>
                  Batal
                </Button>
                <Button className="flex-2 h-12 rounded-xl font-bold bg-brand-600 shadow-lg shadow-brand-500/30"
                  onClick={() => applyCalculation(showIncomeModal ? 'INCOME' : showKprModal ? 'KPR' : 'KPM')}>
                  Terapkan Hasil
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENT: INPUT GROUP ---
interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const InputGroup = ({ value, onChange, className, ...props }: InputGroupProps) => {
  return (
    <div className={cn("relative group w-full", className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs transition-colors group-focus-within:bg-brand-600 group-focus-within:text-white">
        Rp
      </div>
      <Input
        {...props}
        value={value}
        onChange={onChange}
        className="pl-14 h-12 font-bold bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl transition-all"
      />
    </div>
  );
};