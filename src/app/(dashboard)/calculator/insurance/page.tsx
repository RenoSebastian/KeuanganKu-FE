"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, HeartPulse, Play, Lock, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// --- HOOKS & SERVICES ---
import { useAuthUser } from "@/hooks/use-auth-user";
import { financialService } from "@/services/financial.service";
import { CreateInsuranceSimulationDto, InsuranceSimulationResult } from "@/lib/types";

// --- SHARED UI COMPONENTS ---
import { InsuranceGuide } from "@/components/features/calculator/insurance-guide";
import { PdfLoadingModal } from "@/components/features/finance/pdf-loading-modal";
import { GapAnalysisGauge } from "@/components/features/calculator/insurance/gap-analysis-gauge";
import { InsuranceResultCard } from "@/components/features/calculator/insurance/insurance-result-card";

// --- NEW MODULAR COMPONENTS (REFACTORED) ---
import { InsurancePageHeader } from "@/components/features/calculator/insurance/InsurancePageHeader";
import { ClientProfileForm } from "@/components/features/calculator/insurance/ClientProfileForm";
import { DebtInputForm } from "@/components/features/calculator/insurance/DebtInputForm";
import { IncomeProtectionForm } from "@/components/features/calculator/insurance/IncomeProtectionForm";
import { OtherCostsForm } from "@/components/features/calculator/insurance/OtherCostsForm";
import { DownloadCenter } from "@/components/features/calculator/insurance/DownloadCenter";
import { RecommendationCard } from "@/components/features/calculator/insurance/RecommendationCard";
import { HelperCalculatorModal } from "@/components/features/calculator/insurance/HelperCalculatorModal";

export default function InsurancePage() {
  // --- AUTH & QUOTA ---
  const { isPro, quota, refreshUser, isLoading: isAuthLoading } = useAuthUser();
  const hasAccess = isPro || quota > 0;

  // --- REFS ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(uuidv4());

  // --- STATE: INPUT DATA ---
  const [clientData, setClientData] = useState({
    clientName: "",
    clientDob: "",
    clientCity: "",
    clientJob: "",
    clientPhone: ""
  });
  const [dependents, setDependents] = useState(0);

  const [debtData, setDebtData] = useState({
    debtKPR: "",
    debtKPM: "",
    debtProductive: "",
    debtConsumptive: "",
    debtOther: "",
  });

  const [annualIncome, setAnnualIncome] = useState("");
  const [protectionDuration, setProtectionDuration] = useState("10");
  const [inflation, setInflation] = useState(5);
  const [returnRate, setReturnRate] = useState(6);
  const [finalExpense, setFinalExpense] = useState("");
  const [existingInsurance, setExistingInsurance] = useState("");

  // --- STATE: UI & RESULTS ---
  const [result, setResult] = useState<InsuranceSimulationResult | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<{
    pdfUrl: string | null;
    mgcToken: string | null;
    filenameMgc: string | null;
    filenamePdf: string | null;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Modal Control
  const [showKprModal, setShowKprModal] = useState(false);
  const [showKpmModal, setShowKpmModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [tempMonthly, setTempMonthly] = useState("");
  const [tempTenor, setTempTenor] = useState("");

  // --- HELPERS ---
  const parseMoney = (val: string) => parseInt(val.replace(/\./g, "")) || 0;

  const handleMoneyInput = (val: string, setter: (v: string) => void) => {
    let num = val.replace(/\D/g, "");
    if (num.length > 1 && num.startsWith("0")) num = num.substring(1);
    setter(num.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    if (result) { setResult(null); setGeneratedFiles(null); }
  };

  const handleDebtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let num = value.replace(/\D/g, "");
    if (num.length > 1 && num.startsWith("0")) num = num.substring(1);
    const formattedValue = num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setDebtData(prev => ({ ...prev, [name]: formattedValue }));
    if (result) { setResult(null); setGeneratedFiles(null); }
  };

  // --- CORE HANDLERS ---
  const handleCalculateOnly = async () => {
    if (!hasAccess) {
      toast.error("Kuota Habis", { description: "Silakan upgrade ke PRO untuk simulasi lagi." });
      return;
    }
    if (!clientData.clientName || !annualIncome) {
      toast.error("Data Belum Lengkap", { description: "Nama Klien dan Gaji wajib diisi." });
      return;
    }

    setIsLoading(true);
    setShowPdfModal(true);

    try {
      const totalDebt = Object.values(debtData).reduce((acc, val) => acc + parseMoney(val), 0);

      const payload: CreateInsuranceSimulationDto & { sessionId: string } = {
        ...clientData,
        type: 'LIFE',
        dependents,
        monthlyExpense: parseMoney(annualIncome) / 12,
        existingDebt: totalDebt,
        existingCoverage: parseMoney(existingInsurance),
        protectionDuration: parseInt(protectionDuration) || 10,
        finalExpense: parseMoney(finalExpense),
        inflationRate: inflation,
        returnRate: returnRate,
        sessionId: sessionId.current
      };

      const response = await financialService.simulateAgentInsurance(payload);
      await refreshUser();
      window.dispatchEvent(new Event('refresh_user_data'));

      const token = response.headers['x-mgc-token'];
      if (!token) throw new Error("Token tidak ditemukan.");

      const decodedData = JSON.parse(atob(token.split('.')[0]));
      setResult(decodedData.result);

      const pdfUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const cleanName = clientData.clientName.replace(/[^a-zA-Z0-9]/g, '_') || 'Klien';

      setGeneratedFiles({
        pdfUrl, mgcToken: token,
        filenameMgc: `Backup_Asuransi_${cleanName}.mgc`,
        filenamePdf: `Laporan_Asuransi_${cleanName}.pdf`
      });

      toast.success("Analisa Selesai");
    } catch (error: any) {
      toast.error("Gagal Menghitung", { description: error.response?.status === 403 ? "Kuota habis." : "Terjadi kesalahan sistem." });
    } finally {
      setIsLoading(false);
      setShowPdfModal(false);
    }
  };

  const handleDownloadFile = (type: 'PDF' | 'MGC') => {
    if (!generatedFiles) return;
    const isPdf = type === 'PDF';
    const link = document.createElement('a');
    link.href = isPdf ? generatedFiles.pdfUrl! : window.URL.createObjectURL(new Blob([generatedFiles.mgcToken!], { type: 'text/plain' }));
    link.setAttribute('download', isPdf ? generatedFiles.filenamePdf! : generatedFiles.filenameMgc!);
    document.body.appendChild(link); link.click(); link.remove();
    toast.success(`${type} Berhasil Diunduh`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = (event.target?.result as string).trim();
        const { data } = await financialService.decodeSimulationToken(content);
        if (data.meta?.module !== 'INSURANCE') throw new Error("Format file salah.");

        setClientData({ ...data.client, clientName: data.client.name });
        setDependents(data.financial.dependents || 0);
        setDebtData({ debtKPR: "", debtKPM: "", debtProductive: "", debtConsumptive: "", debtOther: new Intl.NumberFormat("id-ID").format(data.financial.existingDebt || 0) });
        setAnnualIncome(new Intl.NumberFormat("id-ID").format((data.financial.monthlyExpense || 0) * 12));
        setProtectionDuration(String(data.financial.protectionDuration || 10));
        setInflation(data.financial.inflationRate || 5);
        setReturnRate(data.financial.returnRate || 6);
        setFinalExpense(new Intl.NumberFormat("id-ID").format(data.financial.finalExpense || 0));
        setExistingInsurance(new Intl.NumberFormat("id-ID").format(data.financial.existingCoverage || 0));

        sessionId.current = uuidv4();
        setResult(null); setGeneratedFiles(null);
        toast.success("Data Berhasil Dimuat");
      } catch (err: any) { toast.error("Gagal Import", { description: err.message }); }
      finally { setIsImporting(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!confirm("Reset form?")) return;
    setClientData({ clientName: "", clientDob: "", clientCity: "", clientJob: "", clientPhone: "" });
    setDependents(0);
    setDebtData({ debtKPR: "", debtKPM: "", debtProductive: "", debtConsumptive: "", debtOther: "" });
    setAnnualIncome(""); setProtectionDuration("10"); setFinalExpense(""); setExistingInsurance("");
    setResult(null); setGeneratedFiles(null);
    sessionId.current = uuidv4();
  };

  const applyCalculation = (type: 'KPR' | 'KPM' | 'INCOME') => {
    const total = (parseInt(tempMonthly.replace(/\./g, "")) || 0) * (type === 'INCOME' ? 12 : parseInt(tempTenor) || 0);
    const formatted = new Intl.NumberFormat("id-ID").format(total);
    if (type === 'KPR') setDebtData(p => ({ ...p, debtKPR: formatted }));
    else if (type === 'KPM') setDebtData(p => ({ ...p, debtKPM: formatted }));
    else setAnnualIncome(formatted);
    setShowKprModal(false); setShowKpmModal(false); setShowIncomeModal(false);
    setTempMonthly(""); setTempTenor("");
  };

  return (
    <div className="min-h-full w-full pb-24 md:pb-12 bg-slate-50/50">
      <PdfLoadingModal isOpen={showPdfModal} />

      <InsurancePageHeader
        isImporting={isImporting}
        onFileUpload={handleFileUpload}
        fileInputRef={fileInputRef}
      />

      <div className="relative z-20 max-w-6xl mx-auto px-4 md:px-6 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: INPUT FORM */}
          <div className="lg:col-span-7 space-y-6">
            {!hasAccess && !isAuthLoading && (
              <Card className="p-5 rounded-2xl bg-red-50 border border-red-200 shadow-sm animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-100 rounded-xl text-red-600"><Lock className="w-6 h-6" /></div>
                  <div className="grow">
                    <h3 className="text-sm font-bold text-red-800">Kuota Simulasi Habis</h3>
                    <p className="text-xs text-red-600 mt-1">Upgrade ke PRO untuk akses tanpa batas.</p>
                    <Link href="/pricing"><Button size="sm" className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold w-full rounded-xl">Upgrade Sekarang</Button></Link>
                  </div>
                </div>
              </Card>
            )}

            <ClientProfileForm
              clientData={clientData}
              dependents={dependents}
              onClientChange={(e) => setClientData({ ...clientData, [e.target.name]: e.target.value })}
              onDependentsChange={(e) => setDependents(Number(e.target.value))}
            />

            <DebtInputForm
              debtData={debtData}
              onDebtChange={handleDebtChange}
              onShowKprModal={() => setShowKprModal(true)}
              onShowKpmModal={() => setShowKpmModal(true)}
            />

            <IncomeProtectionForm
              annualIncome={annualIncome}
              protectionDuration={protectionDuration}
              inflation={inflation}
              returnRate={returnRate}
              onAnnualIncomeChange={(e) => handleMoneyInput(e.target.value, setAnnualIncome)}
              onProtectionDurationChange={(e) => {
                let num = e.target.value.replace(/\D/g, "");
                if (num.length > 1 && num.startsWith("0")) num = num.substring(1);
                setProtectionDuration(num);
                if (result) { setResult(null); setGeneratedFiles(null); }
              }}
              onInflationChange={(val) => { setInflation(val); if (result) { setResult(null); setGeneratedFiles(null); } }}
              onReturnRateChange={(val) => { setReturnRate(val); if (result) { setResult(null); setGeneratedFiles(null); } }}
              onShowIncomeModal={() => { setTempMonthly(""); setShowIncomeModal(true); }}
            />

            <OtherCostsForm
              finalExpense={finalExpense}
              existingInsurance={existingInsurance}
              onFinalExpenseChange={(e) => handleMoneyInput(e.target.value, setFinalExpense)}
              onExistingInsuranceChange={(e) => handleMoneyInput(e.target.value, setExistingInsurance)}
            />

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleReset} className="flex-1 h-12 rounded-xl border-slate-300">
                <RefreshCcw className="w-4 h-4 mr-2" /> Reset
              </Button>
              <Button
                onClick={handleCalculateOnly}
                disabled={isLoading || !hasAccess}
                className={cn("flex-2 h-12 font-bold text-lg shadow-lg rounded-xl text-white", hasAccess ? "bg-brand-600 hover:bg-brand-700 shadow-brand-500/20" : "bg-slate-400 cursor-not-allowed")}
              >
                {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Play className="w-5 h-5 mr-2" />}
                {hasAccess ? "Lihat Analisa" : "Kuota Habis"}
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
                <p className="text-slate-500 text-sm mt-2 max-w-xs leading-relaxed">Klik <strong>"Lihat Analisa"</strong> untuk menampilkan perhitungan.</p>
              </div>
            ) : (
              <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                <DownloadCenter
                  pdfUrl={generatedFiles?.pdfUrl || null}
                  mgcToken={generatedFiles?.mgcToken || null}
                  filenamePdf={generatedFiles?.filenamePdf || null}
                  filenameMgc={generatedFiles?.filenameMgc || null}
                  onDownload={handleDownloadFile}
                />
                <GapAnalysisGauge totalNeeded={result.totalNeeded} existingCoverage={parseMoney(existingInsurance)} coverageGap={result.coverageGap} />
                <InsuranceResultCard
                  incomeReplacement={result.incomeReplacementValue}
                  annualExpense={result.annualExpense}
                  duration={parseInt(protectionDuration)}
                  debtClearance={result.debtClearanceValue + result.otherNeeds}
                  existingDebt={result.debtClearanceValue}
                  finalExpense={result.otherNeeds}
                />
                <RecommendationCard recommendation={result.recommendation} />
              </div>
            )}
            <InsuranceGuide />
          </div>
        </div>
      </div>

      <HelperCalculatorModal
        isOpen={showKprModal || showKpmModal || showIncomeModal}
        onClose={() => { setShowKprModal(false); setShowKpmModal(false); setShowIncomeModal(false); }}
        type={showIncomeModal ? 'INCOME' : showKprModal ? 'KPR' : showKpmModal ? 'KPM' : null}
        tempMonthly={tempMonthly}
        tempTenor={tempTenor}
        onMonthlyChange={setTempMonthly}
        onTenorChange={setTempTenor}
        onApply={applyCalculation}
      />
    </div>
  );
}