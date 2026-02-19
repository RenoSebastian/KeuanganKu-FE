"use client";

import { useState } from "react";
import { TrendingUp, Wallet, Info, RefreshCcw, Download, ChevronDown, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { EducationSimulationResponse } from "@/lib/types/education";
import { financialService } from "@/services/financial.service";
import { toast } from "sonner";

interface SimulationResultProps {
  result: EducationSimulationResponse;
  onReset: () => void;
}

export function SimulationResultStep({ result, onReset }: SimulationResultProps) {
  // State untuk toggle accordion detail per anak
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleDetail = (childName: string) => {
    setShowDetails(prev => ({
      ...prev,
      [childName]: !prev[childName]
    }));
  };

  // --- DATA PREPARATION ---
  // Transformasi data mentah dari API menjadi format yang siap render
  const simulationData = result.data;
  const childrenData = simulationData.childrenPlans.map(child => {
    const totalFutureCost = child.stages.reduce((acc, s) => acc + (s.calculatedFutureValue || 0), 0);
    const totalMonthlySaving = child.stages.reduce((acc, s) => acc + (s.calculatedMonthlySaving || 0), 0);
    const currentYear = new Date().getFullYear();

    return {
      name: child.childName,
      totalFutureCost,
      monthlySaving: totalMonthlySaving,
      stages: child.stages.map(stage => ({
        level: stage.level,
        costType: stage.costType || "MONTHLY",
        yearsToStart: Math.max(0, stage.startYear - currentYear),
        futureCost: stage.calculatedFutureValue || 0,
        monthlySaving: stage.calculatedMonthlySaving || 0,
      }))
    };
  });

  // --- HANDLER DOWNLOAD ---
  const handleDownload = async () => {
    try {
      if (!result.simulationId) {
        toast.error("ID Simulasi tidak ditemukan.", {
          description: "Gagal mengidentifikasi data di database."
        });
        return;
      }

      setIsDownloading(true);
      toast.loading("Menyiapkan dokumen...");

      // 1. Download PDF (Request Stream ke Backend)
      await financialService.downloadEducationSimulationPdf(result.simulationId);

      // 2. Download File Sesi .mgc (Generate lokal dari token jika ada logic-nya)
      // financialService.downloadSimulationFiles(result); // Uncomment jika fitur ini ada

      toast.dismiss();
      toast.success("Dokumen berhasil diunduh!", {
        description: "Laporan PDF telah tersimpan."
      });
    } catch (error) {
      console.error("Download error:", error);
      toast.dismiss();
      toast.error("Gagal mengunduh dokumen. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500 ease-out">

      {/* --- HEADER SECTION --- */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-2 border border-blue-100">
          <Target className="w-3 h-3" /> Hasil Analisa AI
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Rencana Dana Pendidikan</h2>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
          Strategi pemenuhan biaya pendidikan untuk <span className="font-bold text-slate-900">{childrenData.length} orang anak</span> dengan metode <i>Sinking Fund</i>.
        </p>
      </div>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Card 1: Total Future Cost */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-6 border border-slate-200 shadow-lg shadow-slate-200/50 group hover:border-blue-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-1 text-blue-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Dana Dibutuhkan (FV)</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                {formatCurrency(simulationData.totalFutureCost)}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 2: Total Monthly Investment */}
        <div className="relative overflow-hidden bg-linear-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 shadow-lg shadow-emerald-100/50 group hover:ring-2 hover:ring-emerald-200 transition-all duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-1 text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Investasi Rutin</p>
              <h3 className="text-3xl md:text-4xl font-black text-emerald-700 tracking-tighter">
                {formatCurrency(simulationData.totalMonthlySaving)}
                <span className="text-lg font-bold text-emerald-600/70 ml-1">/bln</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* --- DETAILS PER CHILD --- */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Rincian Per Anak</h4>

        {childrenData.map((child, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">

            <button
              onClick={() => toggleDetail(child.name)}
              className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  {index + 1}
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800 text-base">{child.name}</div>
                  <div className="text-xs text-slate-500">
                    Kebutuhan: <span className="font-semibold text-slate-700">{formatCurrency(child.totalFutureCost)}</span> •
                    Investasi: <span className="font-semibold text-emerald-600">{formatCurrency(child.monthlySaving)}/bln</span>
                  </div>
                </div>
              </div>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                showDetails[child.name] ? "rotate-180 bg-slate-200" : "bg-white border hover:bg-slate-100"
              )}>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </div>
            </button>

            {showDetails[child.name] && (
              <div className="border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="px-4 py-3 pl-16">Jenjang</th>
                        <th className="px-4 py-3">Estimasi Masuk</th>
                        <th className="px-4 py-3 text-right">Biaya Nanti (FV)</th>
                        <th className="px-4 py-3 text-right">Tabungan (PMT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {child.stages.map((stage, sIdx) => (
                        <tr key={sIdx} className="hover:bg-blue-50/20 transition-colors">
                          <td className="px-4 py-3 pl-16 font-medium text-slate-700">
                            {stage.level}
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 border border-slate-200">
                              {stage.costType === "ENTRY" ? "Pangkal" : "SPP"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {stage.yearsToStart} tahun lagi
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-slate-600">
                            {formatCurrency(stage.futureCost)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-600">
                            {formatCurrency(stage.monthlySaving)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- TIPS SECTION --- */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex gap-4 text-sm text-indigo-900/80">
        <Info className="w-5 h-5 shrink-0 text-indigo-600 mt-0.5" />
        <p className="leading-relaxed">
          Angka di atas adalah estimasi menggunakan asumsi inflasi pendidikan dan return investasi yang wajar.
          Disarankan untuk meninjau ulang rencana ini secara berkala setiap tahun (Financial Checkup).
        </p>
      </div>

      {/* --- ACTION BUTTONS --- */}
      <div className="flex flex-col md:flex-row w-full gap-4 pt-4 border-t">
        <Button
          variant="outline"
          onClick={onReset}
          disabled={isDownloading}
          className="flex-1 h-12 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          <RefreshCcw className="w-4 h-4 mr-2" /> Buat Simulasi Baru
        </Button>

        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 h-12 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 group"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2 group-hover:animate-bounce" />
          )}
          {isDownloading ? "Mengunduh..." : "Unduh Laporan PDF"}
        </Button>
      </div>
    </div>
  );
}