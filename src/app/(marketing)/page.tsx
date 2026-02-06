"use client";

import { useState } from "react";
import {
  CheckCircle2, TrendingUp, Activity, Download,
  FileText, ArrowRight, Wallet, PieChart as PieChartIcon,
  ChevronDown, ChevronUp, Info
} from "lucide-react";

// UI Components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Recharts Components
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip, Legend
} from "recharts";

import { FinancialQuizView } from "./financial-quiz-view";

const ASSET_DATA = [
  { name: "Tabungan & Kas", value: 15, color: "#2563eb" }, // Blue 600
  { name: "Investasi", value: 35, color: "#7c3aed" },      // Violet 600
  { name: "Aset Guna (Rumah/Kendaraan)", value: 40, color: "#f59e0b" }, // Amber 500
  { name: "Lainnya", value: 10, color: "#64748b" },        // Slate 500
];

const MOCK_DATA = {
  score: 78,
  netWorth: 450000000,
  surplusDeficit: 7500000,
  ratios: [
    { id: "1", label: "Dana Darurat", value: 4.5, statusColor: "YELLOW", benchmark: "6x Pengeluaran" },
    { id: "2", label: "Rasio Menabung", value: 25, statusColor: "GREEN_DARK", benchmark: ">10%" },
    { id: "3", label: "Rasio Cicilan", value: 20, statusColor: "GREEN_LIGHT", benchmark: "<35%" },
    { id: "4", label: "Aset Lancar", value: 12, statusColor: "RED", benchmark: ">15%" },
  ]
};

export default function Page() {
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [viewMode, setViewMode] = useState<"MONTHLY" | "ANNUAL">("ANNUAL");
  const [showLegend, setShowLegend] = useState(false); // State untuk minimize legenda

  if (isQuizMode) return <FinancialQuizView onBack={() => setIsQuizMode(false)} />;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-32">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <Wallet className="w-8 h-8 text-blue-600" />
            Dashboard Finansial
          </h2>
          <p className="text-slate-500 text-sm">Analisa sebaran kekayaan tanpa perlu backend.</p>
        </div>

        <div className="flex bg-white border p-1 rounded-xl shadow-sm w-fit">
          <button onClick={() => setViewMode("MONTHLY")} className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", viewMode === "MONTHLY" ? "bg-slate-800 text-white shadow-md" : "text-slate-500")}>Bulanan</button>
          <button onClick={() => setViewMode("ANNUAL")} className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", viewMode === "ANNUAL" ? "bg-slate-800 text-white shadow-md" : "text-slate-500")}>Tahunan</button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white">

        {/* KIRI: PIE CHART AREA */}
        <div className="p-8 flex flex-col bg-slate-50/50 border-b lg:border-b-0 lg:border-r border-slate-100 min-h-[400px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Sebaran Aset</h4>
            </div>
            {/* Tombol Minimize Legenda */}
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 flex items-center gap-1 text-[10px] font-bold"
            >
              {showLegend ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              LEGENDA
            </button>
          </div>

          <div className="w-full h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ASSET_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={0} // 0 = Pie Chart Penuh (Tidak bolong)
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {ASSET_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} stroke="#fff" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                {showLegend && <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }} />}
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-200">
            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Info className="w-4 h-4 text-blue-500" /> Skor Kesehatan
              </div>
              <span className="text-xl font-black text-blue-600">{MOCK_DATA.score}%</span>
            </div>
          </div>
        </div>

        {/* KANAN: FINANCIAL INFO */}
        <div className="lg:col-span-2 p-8 bg-slate-900 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Kekayaan Bersih (Total Net Worth)</p>
              <h3 className="text-4xl font-mono font-bold tracking-tighter text-white">
                Rp {MOCK_DATA.netWorth.toLocaleString('id-ID')}
              </h3>
              <div className="h-1 w-16 bg-blue-500 rounded-full opacity-50" />
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Sisa Dana {viewMode === "ANNUAL" ? "Tahunan" : "Bulanan"}</p>
              <h3 className="text-4xl font-mono font-bold tracking-tighter text-emerald-400">
                +Rp {(viewMode === "ANNUAL" ? MOCK_DATA.surplusDeficit * 12 : MOCK_DATA.surplusDeficit).toLocaleString('id-ID')}
              </h3>
              <div className="h-1 w-16 bg-emerald-500 rounded-full opacity-50" />
            </div>
          </div>

          <div className="relative z-10 bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wide">
              <Activity className="w-4 h-4" /> Diagnosa Otomatis
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              "Struktur aset Anda didominasi oleh <strong className="text-amber-400">Aset Guna (Rumah/Kendaraan)</strong>. Untuk meningkatkan kesehatan finansial, pertimbangkan untuk meningkatkan porsi <strong className="text-blue-400">Investasi</strong> hingga menyentuh angka 40% dari total kekayaan bersih."
            </p>
          </div>
        </div>
      </div>

      {/* Indikator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_DATA.ratios.map((ratio) => (
          <Card key={ratio.id} className="p-5 border-0 shadow-sm bg-white hover:shadow-md transition-shadow group">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 group-hover:text-blue-500 transition-colors">{ratio.label}</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800">{ratio.value}</span>
              <span className="text-sm font-bold text-slate-400 uppercase">{ratio.id === "1" ? "kali" : "%"}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase bg-slate-50 w-fit px-2 py-1 rounded-md border border-slate-100">
              Target: {ratio.benchmark}
            </div>
          </Card>
        ))}
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50">
        <Card className="p-4 shadow-2xl bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 pl-2">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <PlayCircleIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-none mb-1">Edukasi Lanjutan</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Cek Level Literasi Keuangan Anda</p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none h-12 px-6 rounded-2xl font-bold text-slate-600 border-slate-200">
              <Download className="w-4 h-4 mr-2" /> PDF
            </Button>
            <Button
              onClick={() => setIsQuizMode(true)}
              className="flex-1 md:flex-none h-12 bg-blue-600 hover:bg-blue-700 text-white font-black px-10 rounded-2xl shadow-xl shadow-blue-200 uppercase tracking-widest text-xs"
            >
              Mulai Kuis <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Icon helper
function PlayCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  )
}