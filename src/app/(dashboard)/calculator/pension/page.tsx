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
import { generateSimulationFilename } from "@/lib/formatters";

// [NEW ARCHITECTURE] Import mesin eksekutor Universal
import { executeUniversalExport } from "@/utils/universal-export-engine";

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

  // --- HELPERS ---
  const parseMoney = (val: string) => parseInt(val.replace(/\./g, "")) || 0;
  const parseNum = (val: string) => parseInt(val) || 0;

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientData(prev => ({ ...prev, [name]: value }));
    if (result) {
      setResult(null);
      setGeneratedFiles(null);
    }

    // Auto-sync currentAge when clientDob is selected
    if (name === "clientDob" && value) {
      const dob = new Date(value);
      if (!isNaN(dob.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age > 0 && age < 120) {
          setCurrentAge(String(age));
        }
      }
    }
  };

  const handleCurrentAgeChange = (val: string) => {
    setCurrentAge(val);
    if (result) {
      setResult(null);
      setGeneratedFiles(null);
    }
    const num = parseInt(val);
    if (num > 0 && num < 120 && !clientData.clientDob) {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - num;
      setClientData(prev => ({ ...prev, clientDob: `${birthYear}-01-01` }));
    }
  };

  const handleMoneyInput = (val: string, setter: (v: string) => void) => {
    let num = val.replace(/\D/g, "");
    if (num.length > 1 && num.startsWith("0")) num = num.substring(1);
    setter(num.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    if (result) { setResult(null); setGeneratedFiles(null); }
  };

  const handleSimulate = async () => {
    if (!hasAccess) {
      toast.error("Kuota Habis", { description: "Silakan upgrade akun Anda untuk melanjutkan simulasi." });
      return;
    }

    if (!clientData.clientName?.trim()) {
      toast.error("Data Belum Lengkap", { description: "Nama Lengkap klien wajib diisi." });
      return;
    }

    let cAge = parseNum(currentAge);
    // Jika currentAge belum terisi tapi clientDob ada, hitung otomatis
    if ((!cAge || cAge <= 0) && clientData.clientDob) {
      const dob = new Date(clientData.clientDob);
      if (!isNaN(dob.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        if (age > 0) {
          cAge = age;
          setCurrentAge(String(age));
        }
      }
    }

    if (!cAge || cAge <= 0) {
      toast.error("Data Belum Lengkap", { description: "Usia Kini wajib diisi (minimal 1 tahun)." });
      return;
    }

    const rAge = parseNum(retirementAge) || 55;
    if (cAge >= rAge) {
      toast.error("Logika Usia Salah", { description: "Target usia pensiun harus lebih besar dari usia saat ini." });
      return;
    }

    const lifeExp = Math.max(50, parseNum(lifeExpectancy) || 85);
    if (lifeExp <= rAge) {
      toast.error("Logika Usia Salah", { description: "Harapan hidup harus lebih besar dari usia pensiun." });
      return;
    }

    const expense = parseMoney(currentExpense);
    if (!expense || expense <= 0) {
      toast.error("Data Belum Lengkap", { description: "Biaya Hidup Bulanan saat ini wajib diisi." });
      return;
    }

    // Auto-generate DOB dan City jika belum diisi agar validasi backend selalu terpenuhi
    const dob = clientData.clientDob?.trim() || `${new Date().getFullYear() - cAge}-01-01`;
    const city = clientData.clientCity?.trim() || "Indonesia";

    setIsLoading(true);
    setShowPdfModal(true);

    try {
      const payload = {
        ...clientData,
        clientName: clientData.clientName.trim(),
        clientDob: dob,
        clientCity: city,
        clientJob: clientData.clientJob?.trim() || "-",
        clientPhone: clientData.clientPhone?.trim() || "",
        currentAge: cAge,
        retirementAge: rAge,
        lifeExpectancy: lifeExp,
        currentExpense: expense,
        currentSaving: parseMoney(currentSaving),
        inflationRate: inflation,
        returnRate: returnRate,
        sessionId: sessionId.current
      };

      const response = await financialService.simulateAgentPension(payload);

      // [SYNC QUOTA]
      await refreshUser();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('refresh_user_data'));

      const token = response.headers['x-mgc-token'];
      const disposition = response.headers['content-disposition'];

      if (!token) throw new Error("Token data simulasi tidak ditemukan pada response server.");

      // Safe base64 decoding dengan dukungan karakter UTF-8
      let decodedData: any;
      try {
        const payloadBase64 = token.split('.')[0];
        const binary = atob(payloadBase64);
        const bytes = Uint8Array.from(binary, (m) => m.charCodeAt(0));
        const jsonStr = new TextDecoder().decode(bytes);
        decodedData = JSON.parse(jsonStr);
      } catch {
        decodedData = JSON.parse(atob(token.split('.')[0]));
      }

      if (!decodedData?.result) {
        throw new Error("Hasil analisa simulasi tidak ditemukan di dalam token respon.");
      }

      setResult(decodedData.result);

      // Ekstraksi Nama File Secara Akurat dari Header
      let pdfFilename = generateSimulationFilename("Rencana Dana Hari Tua", clientData.clientName, "pdf");
      if (disposition) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) pdfFilename = match[1].replace(/['"]/g, "");
      }

      // [CLEAN ARCHITECTURE] Simpan Blob biner langsung ke state tanpa membuat Object URL
      setGeneratedFiles({
        pdfBlob: new Blob([response.data], { type: 'application/pdf' }),
        mgcToken: token,
        filenameMgc: generateSimulationFilename("Rencana Dana Hari Tua", clientData.clientName, "mgc"),
        filenamePdf: pdfFilename
      });

      toast.success("Analisa Selesai", { description: "Hasil simulasi pensiun berhasil dihitung." });

    } catch (error: any) {
      console.error("Pension Simulation Error:", error);
      let errorDescription = "Terjadi kesalahan sistem saat memproses simulasi.";

      // Periksa apakah respon error berupa Blob (karena responseType: 'blob')
      if (error?.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed.message)) {
            errorDescription = parsed.message.join(", ");
          } else if (parsed.message) {
            errorDescription = parsed.message;
          }
        } catch {
          // Abaikan jika bukan format JSON
        }
      } else if (error?.response?.data?.message) {
        errorDescription = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(", ")
          : error.response.data.message;
      } else if (error?.message) {
        errorDescription = error.message;
      }

      if (error?.response?.status === 403) {
        errorDescription = "Kuota simulasi telah habis. Silakan upgrade paket Anda.";
      }

      toast.error("Gagal Simulasi", { description: errorDescription });
    } finally {
      setIsLoading(false);
      setShowPdfModal(false);
      // Auto-scroll pada device kecil agar melihat hasil
      if (window.innerWidth < 1024) window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  // --- [REFACTORED DOWNLOAD ROUTER] ---
  const handleDownloadFile = async (type: 'PDF' | 'MGC') => {
    if (!generatedFiles) return;

    try {
      if (type === 'PDF' && generatedFiles.pdfBlob && generatedFiles.filenamePdf) {
        // Eksekusi Blob PDF via Engine
        const exportStatus = await executeUniversalExport(generatedFiles.pdfBlob, generatedFiles.filenamePdf);

        if (exportStatus === 'SHARED') {
          toast.success("Dokumen PDF siap dibagikan.");
        } else if (exportStatus === 'DOWNLOADED') {
          toast.success("Dokumen PDF berhasil diunduh.");
        }

      } else if (type === 'MGC' && generatedFiles.mgcToken) {
        // [HARDENED] Transformasi Token String menjadi Blob Biner
        const mgcBlob = new Blob([generatedFiles.mgcToken], { type: 'application/octet-stream' });
        const filename = generatedFiles.filenameMgc || "Pensiun.mgc";

        // Eksekusi Blob MGC melalui Universal Engine
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
        if (data.result) {
          setResult(data.result);
          setGeneratedFiles({
            pdfBlob: null,
            mgcToken: content,
            filenameMgc: generateSimulationFilename("Rencana Dana Hari Tua", data.client?.name || "Klien", "mgc"),
            filenamePdf: null
          });
        } else {
          setResult(null);
          setGeneratedFiles(null);
        }
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              onClientChange={handleClientChange}
              currentAge={currentAge}
              setCurrentAge={handleCurrentAgeChange}
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

      {/* [CLEANUP] Komponen PostDownloadAction dihapus dari DOM */}
    </div>
  );
}