"use client";

import { useState } from "react";
import { 
  CheckCircle2, AlertTriangle, XCircle, 
  Save, RefreshCcw, FileText, ChevronDown, ChevronUp, Share2,
  TrendingUp, Shield, Activity
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HealthAnalysisResult, HealthStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CheckupResultProps {
  data: HealthAnalysisResult;
  onReset: () => void;
}

export function CheckupResult({ data, onReset }: CheckupResultProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    setSaved(true);
  };

  const getStatusColor = (status: HealthStatus) => {
    switch(status) {
      case "SEHAT": return "border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50";
      case "WASPADA": return "border-amber-500 bg-amber-50/50 hover:bg-amber-50";
      case "BAHAYA": return "border-red-500 bg-red-50/50 hover:bg-red-50";
      default: return "border-slate-200 bg-white";
    }
  };

  const getStatusIcon = (status: HealthStatus) => {
    switch(status) {
      case "SEHAT": return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "WASPADA": return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case "BAHAYA": return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: HealthStatus) => {
    switch(status) {
        case "SEHAT": return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">SEHAT</Badge>;
        case "WASPADA": return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">WASPADA</Badge>;
        case "BAHAYA": return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-0">BAHAYA</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* --- HERO SECTION: SPLIT CARD --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-0 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
        
        {/* LEFT: GAUGE & SCORE */}
        <div className="lg:col-span-1 p-8 flex flex-col items-center justify-center bg-white relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-100">
             {/* Background Gradient Mesh */}
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500" />
             <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl z-0" />

             <div className="relative z-10 w-48 h-48 flex items-center justify-center mb-6">
                {/* SVG Gauge */}
                <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
                  {/* Track */}
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
                  {/* Progress */}
                  <circle 
                    cx="50" cy="50" r="42" fill="none" 
                    stroke={data.score >= 80 ? "#10b981" : data.score >= 50 ? "#f59e0b" : "#ef4444"} 
                    strokeWidth="8" 
                    strokeDasharray={`${data.score * 2.64} 264`} // ~264 is circum
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("text-5xl font-black tracking-tighter", 
                        data.score >= 80 ? "text-emerald-600" : data.score >= 50 ? "text-amber-500" : "text-red-500"
                    )}>{data.score}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Health Score</span>
                </div>
             </div>

             <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                    Status: <span className={cn(
                        data.globalStatus === "SEHAT" ? "text-emerald-600" : 
                        data.globalStatus === "WASPADA" ? "text-amber-600" : "text-red-600"
                    )}>{data.globalStatus}</span>
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed px-4">
                    {data.globalStatus === "SEHAT" ? "Kondisi keuangan Anda prima! Pertahankan performa ini." : 
                     data.globalStatus === "WASPADA" ? "Ada beberapa indikator yang perlu perhatian khusus." : 
                     "Kondisi kritis. Segera lakukan perbaikan struktur keuangan."}
                </p>
             </div>
        </div>

        {/* RIGHT: NET WORTH & DIAGNOSIS */}
        <div className="lg:col-span-2 p-8 bg-slate-900 text-white relative overflow-hidden flex flex-col justify-center">
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 p-40 bg-emerald-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
             <div className="absolute bottom-0 left-0 p-32 bg-blue-500/10 rounded-full blur-[60px] -ml-16 -mb-16 pointer-events-none" />
             <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05]" />
             
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/10 pb-6">
                 <div>
                     <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <TrendingUp className="w-4 h-4" />
                        Total Kekayaan Bersih (Net Worth)
                     </div>
                     <div className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-white">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(data.netWorth)}
                     </div>
                 </div>
                 <div className="hidden md:block">
                    <Shield className="w-12 h-12 text-emerald-500/20" />
                 </div>
             </div>
             
             <div className="relative z-10 bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-md">
                <div className="flex gap-4">
                    <div className="p-3 bg-emerald-500/20 rounded-xl h-fit shrink-0">
                        <Activity className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-emerald-100 text-lg mb-2">Diagnosa Dokter Keuangan</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            "Berdasarkan analisa 8 rasio, Anda memiliki <strong className="text-emerald-400">{data.ratios.filter(r => r.status === "SEHAT").length} indikator SEHAT</strong>, 
                            <strong className="text-amber-400"> {data.ratios.filter(r => r.status === "WASPADA").length} WASPADA</strong>, dan 
                            <strong className="text-red-400"> {data.ratios.filter(r => r.status === "BAHAYA").length} BAHAYA</strong>. 
                            Prioritas utama perbaikan Anda saat ini adalah pada sektor 
                            <span className="text-white border-b border-dashed border-slate-500 pb-0.5 ml-1">
                                {data.ratios.find(r => r.status === "BAHAYA" || r.status === "WASPADA")?.label || "Pertumbuhan Aset"}
                            </span>."
                        </p>
                    </div>
                </div>
             </div>
        </div>
      </div>

      {/* --- DETAIL RATIOS GRID --- */}
      <div>
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" /> 
                Rincian 8 Indikator Vital
            </h3>
            <span className="text-xs text-slate-500 hidden md:inline-block">*Klik kartu untuk melihat saran</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {data.ratios.map((ratio) => (
                <div 
                    key={ratio.id}
                    className={cn(
                        "group relative rounded-2xl p-5 border-l-4 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 bg-white",
                        getStatusColor(ratio.status),
                        expandedCard === ratio.id ? "col-span-1 md:col-span-2 lg:col-span-2 row-span-2 ring-2 ring-indigo-500/20 z-10" : ""
                    )}
                    onClick={() => setExpandedCard(expandedCard === ratio.id ? null : ratio.id)}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            {getStatusBadge(ratio.status)}
                            {getStatusIcon(ratio.status)}
                        </div>
                        
                        <h4 className="font-bold text-xs uppercase tracking-wide text-slate-500 mb-1">{ratio.label}</h4>
                        <div className="text-2xl font-bold text-slate-800 mb-2 truncate">
                            {ratio.id === "liquidity_ratio" ? `${ratio.value}x` : `${ratio.value}%`}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                            <span>Target:</span>
                            <span className="font-mono font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{ratio.benchmark}</span>
                        </div>
                        
                        {/* Expandable Section */}
                        <div className={cn(
                            "mt-auto pt-4 border-t border-slate-200/60 transition-all duration-500 ease-in-out overflow-hidden",
                            expandedCard === ratio.id ? "opacity-100 max-h-40" : "opacity-0 max-h-0 lg:opacity-100 lg:max-h-20" // On desktop show snippet, mobile hide
                        )}>
                            <p className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Rekomendasi:
                            </p>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {ratio.recommendation}
                            </p>
                        </div>
                        
                        {/* Mobile Hint */}
                        <div className="lg:hidden mt-2 flex justify-center text-slate-300 group-hover:text-indigo-400 transition-colors">
                            {expandedCard === ratio.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- ACTION BAR --- */}
      <Card className="p-4 bg-white border-t border-slate-200 fixed bottom-0 left-0 w-full z-50 md:static md:border md:rounded-2xl md:shadow-sm md:z-0">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-3 justify-between">
              <div className="hidden md:block text-sm text-slate-500">
                  <span className="font-bold text-slate-700">Tips:</span> Simpan hasil diagnosa ini untuk memantau perkembangan kekayaan Anda bulan depan.
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                 <Button 
                    variant="outline" 
                    onClick={onReset}
                    className="flex-1 md:flex-none border-slate-300 text-slate-600 hover:bg-slate-50"
                 >
                    <RefreshCcw className="w-4 h-4 mr-2" /> Hitung Ulang
                 </Button>
                 
                 <Button 
                    variant="ghost" 
                    className="flex-1 md:flex-none text-slate-500 hover:text-indigo-600"
                 >
                    <Share2 className="w-4 h-4 mr-2" /> Bagikan
                 </Button>

                 <Button 
                    onClick={handleSave}
                    disabled={saving || saved}
                    className={cn(
                        "flex-[2] md:flex-none min-w-[180px] font-bold shadow-lg transition-all text-white",
                        saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"
                    )}
                 >
                    {saving ? "Menyimpan..." : saved ? (
                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Tersimpan</>
                    ) : (
                        <><Save className="w-4 h-4 mr-2" /> Simpan Hasil</>
                    )}
                 </Button>
              </div>
          </div>
      </Card>
      
      {/* Spacer for fixed bottom bar on mobile */}
      <div className="h-20 md:hidden" />

    </div>
  );
}