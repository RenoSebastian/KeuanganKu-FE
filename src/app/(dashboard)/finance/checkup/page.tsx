"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Activity } from "lucide-react";
import { toast } from "sonner";

import { CheckupWizard } from "@/components/features/finance/checkup-wizard";
import { CheckupResult } from "@/components/features/finance/checkup-result";
import { financialService } from "@/services/financial.service";
import { FinancialRecord, HealthAnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function FinancialCheckupPage() {
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [result, setResult] = useState<HealthAnalysisResult | null>(null);
  const [rawData, setRawData] = useState<FinancialRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- LOGIKA BISNIS (CONTROLLER) ---
  const handleLegacyComplete = async (data: any) => {
    setIsLoading(true);

    // Tampilkan toast loading agar user tidak kebingungan saat menunggu API
    const loadingToastId = toast.loading("Memproses data finansial Anda...", {
      description: "Menganalisa rasio kesehatan keuangan..."
    });

    try {
      // 1. Data Cleaning (Hapus spouse jika single) - Menjaga integritas data
      const payload: any = { ...data };
      if (payload.userProfile?.maritalStatus !== "MARRIED") {
        delete payload.spouseProfile;
      }

      // 2. Call API (Save to DB)
      const analysis = await financialService.createCheckup(payload);

      setRawData(payload);
      setResult(analysis);

      toast.success("Analisis Berhasil!", {
        id: loadingToastId,
        description: "Laporan kesehatan finansial Anda telah siap."
      });

      // Gulir ke atas secara halus saat melihat hasil
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error: any) {
      console.error("Error creating checkup:", error);
      toast.error("Gagal memproses data", {
        id: loadingToastId,
        description: "Terjadi kesalahan pada sistem. Silakan coba lagi."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/finance");
  };

  const handleReset = () => {
    setResult(null);
    setRawData(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- RENDER ORCHESTRATION ---
  return (
    // 1. ROOT WRAPPER: Menggunakan 100dvh agar responsif terhadap URL bar mobile browser
    <div className="relative min-h-dvh w-full bg-surface-ground overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900 font-sans">

      {/* 2. AMBIENT BACKGROUND (Hanya muncul di atas untuk memberikan kesan premium) */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-linear-to-b from-indigo-50/80 via-blue-50/30 to-transparent pointer-events-none z-0" />

      {/* 3. NATIVE APP HEADER (Sticky) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-slate-100 active:scale-90 transition-transform -ml-2"
              onClick={result ? handleReset : handleBack}
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </Button>

            <div className="flex flex-col">
              <h1 className="text-sm md:text-base font-black text-slate-800 tracking-wide flex items-center gap-1.5">
                {result ? (
                  <>Hasil Analisis <Sparkles className="w-3.5 h-3.5 text-amber-500" /></>
                ) : (
                  <>Financial Checkup <Activity className="w-4 h-4 text-indigo-600" /></>
                )}
              </h1>
            </div>
          </div>

          {/* Indikator Mode */}
          <div className="hidden md:flex">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Pribadi
            </span>
          </div>

        </div>
      </header>

      {/* 4. MAIN CONTENT WAPPER 
          pb-[calc(env(safe-area-inset-bottom)+140px)] adalah kunci utama PWA. 
          Ini memastikan bagian bawah form tidak tertutup navigasi iOS/Android atau fixed button.
      */}
      <main className="relative z-10 w-full max-w-4xl mx-auto p-4 md:p-6 pb-[calc(env(safe-area-inset-bottom)+140px)] animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header Teks Pembuka (Hanya tampil jika belum ada hasil) */}
        {!result && (
          <div className="mb-6 md:mb-8 text-center md:text-left mt-2 md:mt-4">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-2">
              Kesehatan Finansial
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              Lengkapi data di bawah untuk mendapatkan laporan rasio keuangan yang akurat.
            </p>
          </div>
        )}

        {/* Dynamic Rendering */}
        {result && rawData ? (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <CheckupResult
              data={result}
              rawData={rawData}
              onReset={handleReset}
              mode="USER_VIEW"
            />
          </div>
        ) : (
          <CheckupWizard
            onComplete={handleLegacyComplete}
            onBack={handleBack}
            isLoading={isLoading}
          />
        )}
      </main>

    </div>
  );
}