"use client";

import { useState } from "react";
import { TrendingUp, Wallet, Info, RefreshCcw, Download, ChevronDown, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/financial-math";
import { StageBreakdownItem } from "@/lib/types";
import { cn } from "@/lib/utils";

// Interface Props
export interface SimulationResultData {
  childName: string;
  totalFutureCost: number;
  monthlySaving: number;
  inflationRate: number;
  returnRate: number;
  stagesBreakdown?: StageBreakdownItem[]; // Opsional: Data detail dari Backend
}

interface SimulationResultProps {
  data: SimulationResultData;
  onReset: () => void;
  onSave?: () => void;
}

export function SimulationResult({ data, onReset, onSave }: SimulationResultProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Cek apakah ada data detail (stagesBreakdown) untuk ditampilkan
  const hasDetails = data.stagesBreakdown && data.stagesBreakdown.length > 0;

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500 ease-out">

      {/* --- HEADER --- */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-2">
          <Target className="w-3 h-3" /> Hasil Analisa AI
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Hasil Simulasi Pendidikan</h2>
        <p className="text-slate-500 font-medium">
          Rencana Strategis untuk Ananda <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">{data.childName}</span>
        </p>
      </div>

      {/* --- CARD GRID UTAMA --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Future Cost Card */}
        <div className="relative overflow-hidden bg-linear-to-br from-white to-red-50/50 rounded-[2rem] p-6 border border-red-100 shadow-xl shadow-red-100/50 group hover:border-red-200 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-6 h-6 text-red-500" />
            </div>

            <div>
              <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Total Estimasi Biaya</p>
              <h3 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">
                {formatRupiah(data.totalFutureCost)}
              </h3>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-red-100 px-3 py-1.5 rounded-lg text-[10px] text-slate-500 font-medium inline-flex items-center gap-1.5">
              <Info className="w-3 h-3 text-red-400" />
              Termasuk Inflasi {data.inflationRate}% / tahun
            </div>
          </div>
        </div>

        {/* 2. Monthly Saving Card */}
        <div className="relative overflow-hidden bg-linear-to-br from-emerald-50 to-teal-50 rounded-[2rem] p-6 border border-emerald-100 shadow-xl shadow-emerald-100/50 ring-1 ring-emerald-200/50 group hover:ring-emerald-300 transition-all duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-1 group-hover:scale-110 transition-transform duration-300">
              <Wallet className="w-6 h-6 text-emerald-600" />
            </div>

            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Rekomendasi Nabung</p>
              <h3 className="text-3xl md:text-5xl font-black text-emerald-700 tracking-tighter drop-shadow-sm">
                {formatRupiah(data.monthlySaving)}
                <span className="text-lg font-bold text-emerald-600/70 ml-1">/bln</span>
              </h3>
            </div>

            <div className="bg-emerald-100/50 backdrop-blur-sm border border-emerald-200 px-3 py-1.5 rounded-lg text-[10px] text-emerald-800 font-bold inline-flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" />
              Asumsi Return Investasi {data.returnRate}% / tahun
            </div>
          </div>
        </div>
      </div>

      {/* --- BAGIAN DRILL DOWN (RINCIAN) --- */}
      {hasDetails && (
        <div className="bg-white border border-slate-200 rounded-[1.5rem] shadow-sm overflow-hidden transition-all duration-300">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm group-hover:border-blue-200 transition-colors">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-slate-700 text-sm group-hover:text-blue-700 transition-colors">Rincian Per Jenjang (Breakdown)</span>
                <span className="text-xs text-slate-400">Klik untuk melihat detail perhitungan sinking fund</span>
              </div>
            </div>
            <div className={cn(
              "w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center transition-all duration-300",
              showDetails ? "rotate-180 bg-slate-100" : "group-hover:translate-y-1"
            )}>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {showDetails && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-t border-slate-100">
                  <thead className="bg-slate-50/80 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Jenjang Pendidikan</th>
                      <th className="px-6 py-4 text-right">Biaya Masa Depan (FV)</th>
                      <th className="px-6 py-4 text-right">Cicilan Tabungan (PMT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.stagesBreakdown!.map((item, idx) => {
                      // Data sudah bersih (number), tidak perlu casting
                      // [FIX] Defensive coding: Default 0 jika null/undefined
                      const years = item.yearsToStart ?? 0;

                      // [FIX] Menggunakan item.level langsung dari API (S1/S2 sudah benar)
                      // Tidak perlu lookup ke STAGES_DB yang berisiko null
                      return (
                        <tr key={idx} className="group/row hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-700 text-sm mb-1">{item.level}</div>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border",
                                item.costType === "ENTRY" ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-blue-50 text-blue-600 border-blue-100"
                              )}>
                                {item.costType === "ENTRY" ? "Uang Pangkal" : "SPP Bulanan"}
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                <Clock className="w-3 h-3" /> {years} thn lagi
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-bold text-slate-600">{formatRupiah(item.futureCost)}</div>
                            <div className="text-[10px] text-slate-400 font-medium">Target Dana</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-black text-emerald-600">{formatRupiah(item.monthlySaving)}</div>
                            <div className="text-[10px] text-emerald-600/70 font-medium">/bulan</div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Row Total */}
                    <tr className="bg-slate-50/80 font-bold border-t border-slate-200">
                      <td className="px-6 py-4 text-slate-800 text-right uppercase text-xs tracking-wider">Total Keseluruhan</td>
                      <td className="px-6 py-4 text-right text-slate-800">{formatRupiah(data.totalFutureCost)}</td>
                      <td className="px-6 py-4 text-right text-emerald-700 bg-emerald-50/50">{formatRupiah(data.monthlySaving)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Insight Note */}
              <div className="p-5 bg-yellow-50 text-xs text-yellow-800 border-t border-yellow-100 flex gap-3 leading-relaxed">
                <Info className="w-5 h-5 shrink-0 text-yellow-600" />
                <p>
                  <b>Strategi Sinking Fund:</b> Perhitungan di atas memecah target menabung berdasarkan kapan dana tersebut dibutuhkan.
                  Misalnya, tabungan untuk TK akan selesai dalam waktu singkat, sementara tabungan Kuliah memiliki tenor lebih panjang sehingga cicilannya lebih ringan.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TIPS SECTION --- */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row gap-5 shadow-sm">
        <div className="p-3 bg-white rounded-xl shadow-sm h-fit w-fit text-indigo-600">
          <Info className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
            Tips Perencana Keuangan
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] rounded-full uppercase tracking-wide">Pro Tip</span>
          </h4>
          <p className="text-sm text-indigo-800/80 leading-relaxed text-justify">
            "Biaya pendidikan memiliki inflasi rata-rata 10-15% per tahun, jauh di atas inflasi umum. Angka <b>{formatRupiah(data.monthlySaving)}</b> adalah jumlah yang perlu Anda sisihkan mulai hari ini agar dana tersedia tepat waktu. Pertimbangkan instrumen investasi seperti <b>Reksadana Saham</b> atau <b>Obligasi Negara</b> untuk mengejar return di atas inflasi."
          </p>
        </div>
      </div>

      {/* --- FOOTER ACTION BUTTONS --- */}
      <div className="flex flex-col md:flex-row w-full gap-4 pt-2">
        <Button
          variant="outline"
          onClick={onReset}
          className="flex-1 h-12 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
        >
          <RefreshCcw className="w-4 h-4 mr-2" /> Hitung Ulang / Tambah
        </Button>

        <Button
          className="flex-1 h-12 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 active:scale-95 group"
          onClick={() => alert("Fitur Download PDF segera hadir!")}
        >
          <Download className="w-4 h-4 mr-2 group-hover:animate-bounce" /> Simpan PDF Laporan
        </Button>
      </div>
    </div>
  );
}