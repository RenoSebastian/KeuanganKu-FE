"use client";

import { useState } from "react";
import { TrendingUp, Wallet, Info, RefreshCcw, Save, ChevronDown, ChevronUp, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/financial-math";
import { StageBreakdownItem } from "@/lib/types"; // Import tipe breakdown yang sudah dibuat
import { cn } from "@/lib/utils";

// Interface Props yang diterima dari Page
export interface SimulationResultData {
  childName: string;
  totalFutureCost: number; 
  monthlySaving: number;   
  inflationRate: number;
  returnRate: number;
  stagesBreakdown?: StageBreakdownItem[]; // Data Granular (Optional biar aman kalau null)
}

interface SimulationResultProps {
  data: SimulationResultData;
  onReset: () => void;
  onSave?: () => void;
}

export function SimulationResult({ data, onReset, onSave }: SimulationResultProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
       
       {/* Result Header */}
       <div className="text-center">
         <h2 className="text-2xl font-black text-slate-800">Hasil Simulasi Pendidikan</h2>
         <p className="text-slate-500 font-medium">
           Rencana Dana Pendidikan untuk Ananda <span className="text-blue-600 font-bold">{data.childName}</span>
         </p>
       </div>

       {/* CARD GRID UTAMA */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
         {/* Future Cost Card */}
         <div className="bg-red-50 rounded-3xl p-6 border border-red-100 flex flex-col justify-center items-center text-center space-y-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="p-3 bg-white rounded-full shadow-sm mb-2 z-10 group-hover:scale-110 transition-transform">
               <TrendingUp className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest z-10">Total Estimasi Biaya Nanti</p>
            <h3 className="text-2xl md:text-4xl font-black text-slate-800 z-10">
               {formatRupiah(data.totalFutureCost)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-2 max-w-xs mx-auto z-10">
               *Total akumulasi biaya (TK s/d Kuliah) dengan inflasi {data.inflationRate}% per tahun.
            </p>
         </div>

         {/* Monthly Saving Card */}
         <div className="bg-green-50 rounded-3xl p-6 border border-green-100 flex flex-col justify-center items-center text-center space-y-2 shadow-lg shadow-green-100 ring-2 ring-green-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="p-3 bg-white rounded-full shadow-sm mb-2 z-10 group-hover:scale-110 transition-transform">
               <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest z-10">Target Nabung Bulanan</p>
            <h3 className="text-2xl md:text-4xl font-black text-green-700 z-10">
               {formatRupiah(data.monthlySaving)}
               <span className="text-lg font-medium text-green-600">/bln</span>
            </h3>
            <p className="text-xs font-medium text-green-800 mt-2 bg-green-200/50 px-3 py-1 rounded-full z-10 border border-green-200">
               Investasi Return {data.returnRate}%/thn
            </p>
         </div>
       </div>

       {/* --- BAGIAN DRILL DOWN (RINCIAN) --- */}
       {data.stagesBreakdown && data.stagesBreakdown.length > 0 && (
         <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
           <button 
             onClick={() => setShowDetails(!showDetails)}
             className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
           >
             <div className="flex items-center gap-2">
               <Target className="w-5 h-5 text-blue-600" />
               <span className="font-bold text-slate-700 text-sm">Lihat Rincian Per Jenjang (Breakdown)</span>
             </div>
             {showDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
           </button>

           {showDetails && (
             <div className="p-0 animate-in slide-in-from-top-2">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold border-b border-slate-100">
                   <tr>
                     <th className="px-4 py-3">Jenjang</th>
                     <th className="px-4 py-3 text-right">Biaya Nanti (FV)</th>
                     <th className="px-4 py-3 text-right">Nabung (PMT)</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {data.stagesBreakdown.map((item, idx) => (
                     <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-4 py-3">
                         <div className="font-bold text-slate-700">{item.level}</div>
                         <div className="text-[10px] text-slate-400 flex items-center gap-1">
                           <Clock className="w-3 h-3" /> {item.yearsToStart} thn lagi
                           <span className={cn(
                             "px-1.5 py-0.5 rounded ml-1 font-bold",
                             item.costType === "ENTRY" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                           )}>
                             {item.costType === "ENTRY" ? "Pangkal" : "SPP"}
                           </span>
                         </div>
                       </td>
                       <td className="px-4 py-3 text-right font-medium text-slate-600">
                         {formatRupiah(item.futureCost)}
                       </td>
                       <td className="px-4 py-3 text-right font-bold text-green-600">
                         {formatRupiah(item.monthlySaving)}
                       </td>
                     </tr>
                   ))}
                   {/* Row Total untuk Cross Check */}
                   <tr className="bg-slate-50 font-bold border-t border-slate-200">
                      <td className="px-4 py-3 text-slate-800">TOTAL</td>
                      <td className="px-4 py-3 text-right text-slate-800">{formatRupiah(data.totalFutureCost)}</td>
                      <td className="px-4 py-3 text-right text-green-700">{formatRupiah(data.monthlySaving)}</td>
                   </tr>
                 </tbody>
               </table>
               
               <div className="p-4 bg-yellow-50 text-[10px] text-yellow-700 border-t border-yellow-100 flex gap-2">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <p>
                    <b>Metode Sinking Fund:</b> Tabungan di atas dihitung terpisah untuk setiap jenjang. 
                    Contoh: Tabungan TK hanya dilakukan selama {Math.min(...data.stagesBreakdown.map(s => s.yearsToStart))} tahun, 
                    sedangkan tabungan Kuliah dicicil lebih panjang. Ini menjamin dana <b>tersedia tepat waktu</b> saat anak mau masuk sekolah.
                  </p>
               </div>
             </div>
           )}
         </div>
       )}

       {/* Insight Box */}
       <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
         <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
         <div>
            <h4 className="font-bold text-blue-900 text-sm">Tips Perencana Keuangan:</h4>
            <p className="text-sm text-blue-700/80 leading-relaxed mt-1 text-justify">
              Biaya pendidikan naiknya gila-gilaan, Pak/Bu! Angka <b>{formatRupiah(data.monthlySaving)}</b> mungkin terlihat besar, 
              tapi itu adalah angka <b>realistis</b> agar Anda tidak kaget nanti. 
              Segera buka rekening investasi (Reksadana Saham/Obligasi) sekarang juga!
            </p>
         </div>
       </div>

       {/* Action Buttons */}
       <div className="flex w-full gap-4 pt-4">
           <Button 
             variant="outline" 
             onClick={onReset}
             className="flex-1 h-12 rounded-xl font-bold border-slate-300 text-slate-600 hover:bg-slate-100"
           >
             <RefreshCcw className="w-4 h-4 mr-2" /> Hitung Anak Lain
           </Button>
           
           <Button 
             className="flex-1 h-12 rounded-xl font-bold bg-slate-800 hover:bg-slate-900 shadow-lg text-white"
             onClick={() => alert("Fitur Download PDF segera hadir!")}
           >
             <Save className="w-4 h-4 mr-2" /> Download PDF
           </Button>
        </div>
    </div>
  );
}