"use client";

import { useState, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Loader2, Play, RefreshCcw, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// --- HOOKS & SERVICES ---
import { useAuthUser } from "@/hooks/use-auth-user";
import { financialService } from "@/services/financial.service";
import { PensionSimulationResult } from "@/lib/types";

// --- COMPONENTS ---
import { PensionHeader } from "@/components/features/calculator/pension/pension-header";
import { PensionFormSection } from "@/components/features/calculator/pension/pension-form-section";
import { PensionResultSection } from "@/components/features/calculator/pension/pension-result-section";
import { PensionGuide } from "@/components/features/calculator/guide/pension-guide";
import { PdfLoadingModal } from "@/components/features/calculator/finance/pdf-loading-modal";
import { QuotaAlert } from "@/components/features/calculator/pension/quota-alert";

export default function PensionPage() {
  const { isPro, quota, refreshUser, isLoading: isAuthLoading } = useAuthUser();
  const hasAccess = isPro || quota > 0;
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

  const [currentAge, setCurrentAge] = useState<string>("");
  const [retirementAge, setRetirementAge] = useState<string>("55");
  const [lifeExpectancy, setLifeExpectancy] = useState<string>("75");
  const [currentExpense, setCurrentExpense] = useState<string>("");
  const [currentSaving, setCurrentSaving] = useState<string>("");
  const [inflation, setInflation] = useState(5);
  const [returnRate, setReturnRate] = useState(10);

  // --- STATE: RESULTS ---
  const [result, setResult] = useState<PensionSimulationResult | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<{
    pdfUrl: string | null;
    mgcToken: string | null;
    filenameMgc: string | null;
    filenamePdf: string | null;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // --- HELPERS ---
  const parseMoney = (val: string) => parseInt(val.replace(/\./g, "")) || 0;
  const parseNum = (val: string) => parseInt(val) || 0;

  const handleMoneyInput = (val: string, setter: (v: string) => void) => {
    let num = val.replace(/\D/g, "");
    if (num.length > 1 && num.startsWith("0")) num = num.substring(1);
    setter(num.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    if (result) { setResult(null); setGeneratedFiles(null); }
  };

  const handleSimulate = async () => {
    if (!hasAccess) return toast.error("Kuota Habis");
    if (!clientData.clientName || !currentExpense) return toast.error("Data Belum Lengkap");

    const cAge = parseNum(currentAge);
    const rAge = parseNum(retirementAge);
    if (cAge >= rAge) return toast.error("Logika Usia Salah");

    setIsLoading(true);
    setShowPdfModal(true);

    try {
      const payload = {
        ...clientData,
        currentAge: cAge,
        retirementAge: rAge,
        lifeExpectancy: parseNum(lifeExpectancy),
        currentExpense: parseMoney(currentExpense),
        currentSaving: parseMoney(currentSaving),
        inflationRate: inflation,
        returnRate: returnRate,
        sessionId: sessionId.current
      };

      const response = await financialService.simulateAgentPension(payload);
      await refreshUser();
      window.dispatchEvent(new Event('refresh_user_data'));

      const token = response.headers['x-mgc-token'];
      const decodedData = JSON.parse(atob(token.split('.')[0]));
      setResult(decodedData.result);

      const pdfUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const cleanName = clientData.clientName.replace(/[^a-zA-Z0-9]/g, '_');

      setGeneratedFiles({
        pdfUrl, mgcToken: token,
        filenameMgc: `Backup_Pensiun_${cleanName}.mgc`,
        filenamePdf: `Rencana_Pensiun_${cleanName}.pdf`
      });

      toast.success("Analisa Selesai");
    } catch (error: any) {
      toast.error("Gagal Simulasi");
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
        const response = await financialService.decodeSimulationToken(content);
        const data = response.data || response;

        if (data.meta?.module !== 'PENSION') throw new Error("Format file salah.");

        setClientData({ ...data.client, clientName: data.client.name });
        setCurrentAge(String(data.financial.currentAge || ""));
        setRetirementAge(String(data.financial.retirementAge || "55"));
        setLifeExpectancy(String(data.financial.lifeExpectancy || "75"));

        const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
        setCurrentExpense(fmt(data.financial.currentExpense || 0));
        setCurrentSaving(fmt(data.financial.currentSaving || 0));
        setInflation(data.financial.inflationRate || 5);
        setReturnRate(data.financial.returnRate || 10);

        sessionId.current = uuidv4();
        setResult(null); setGeneratedFiles(null);
        toast.success("Data Berhasil Dimuat");
      } catch (err: any) {
        toast.error("Gagal Import");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!confirm("Reset form?")) return;
    setClientData({ clientName: "", clientDob: "", clientCity: "", clientJob: "", clientPhone: "" });
    setCurrentAge(""); setRetirementAge("55"); setLifeExpectancy("75");
    setCurrentExpense(""); setCurrentSaving("");
    setResult(null); setGeneratedFiles(null);
    sessionId.current = uuidv4();
  };

  return (
    <div className="min-h-full w-full pb-24 md:pb-12 bg-slate-50/50">
      <PdfLoadingModal isOpen={showPdfModal} />

      <PensionHeader
        isImporting={isImporting}
        onImportClick={() => fileInputRef.current?.click()}
        fileInputRef={fileInputRef}
        onFileUpload={handleFileUpload}
      />

      <div className="relative z-20 max-w-6xl mx-auto px-4 md:px-6 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-6 space-y-6">
            <QuotaAlert hasAccess={hasAccess} isLoading={isAuthLoading} />

            <PensionFormSection
              clientData={clientData}
              onClientChange={(e) => setClientData({ ...clientData, [e.target.name]: e.target.value })}
              currentAge={currentAge}
              setCurrentAge={setCurrentAge}
              retirementAge={retirementAge}
              setRetirementAge={setRetirementAge}
              lifeExpectancy={lifeExpectancy}
              setLifeExpectancy={setLifeExpectancy}
              currentExpense={currentExpense}
              currentSaving={currentSaving}
              onMoneyInput={handleMoneyInput}
              setCurrentExpense={setCurrentExpense}
              setCurrentSaving={setCurrentSaving}
              inflation={inflation}
              setInflation={setInflation}
              returnRate={returnRate}
              setReturnRate={setReturnRate}
              onDataChange={() => { setResult(null); setGeneratedFiles(null); }}
            />

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleReset} className="flex-1 h-12 rounded-xl border-slate-300">
                <RefreshCcw className="w-4 h-4 mr-2" /> Reset
              </Button>
              <Button
                onClick={handleSimulate}
                disabled={isLoading || !hasAccess}
                className={cn("flex-2 h-12 font-bold text-lg shadow-lg rounded-xl text-white", hasAccess ? "bg-brand-600 hover:bg-brand-700 shadow-brand-500/20" : "bg-slate-400")}
              >
                {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Play className="w-5 h-5 mr-2" />}
                {hasAccess ? "Lihat Analisa" : "Kuota Habis"}
              </Button>
            </div>
            <PensionGuide />
          </div>

          <div className="lg:col-span-6 space-y-6">
            {!result ? (
              <div className="h-full min-h-100 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 bg-white/50 rounded-[2rem]">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Hourglass className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">Area Hasil Simulasi</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-xs leading-relaxed">Klik <strong>"Lihat Analisa"</strong> untuk menampilkan strategi pensiun.</p>
              </div>
            ) : (
              <PensionResultSection
                result={result}
                generatedFiles={generatedFiles}
                onDownload={handleDownloadFile}
                currentAge={parseNum(currentAge)}
                retirementAge={parseNum(retirementAge)}
                lifeExpectancy={parseNum(lifeExpectancy)}
                currentMonthlyExpense={parseMoney(currentExpense)}
                currentSaving={parseMoney(currentSaving)}
                returnRate={returnRate}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}