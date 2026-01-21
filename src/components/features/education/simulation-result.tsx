"use client";

import { TrendingUp, Wallet, Info, RefreshCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/financial-math";

// Sesuaikan interface dengan data yang dikirim dari Parent (Page)
export interface SimulationResultData {
  childName: string;
  totalFutureCost: number; // Total FV dari semua stage
  monthlySaving: number;   // Total PMT
  inflationRate: number;
  returnRate: number;
}

interface SimulationResultProps {
  data: SimulationResultData;
  onReset: () => void;
  onSave?: () => void; // Opsional jika tombol save ada di sini
}

export function SimulationResult({ data, onReset, onSave }: SimulationResultProps) {
  
  // Hitung "Biaya Sekarang" (Present Value Total) secara kasar untuk perbandingan
  // FV = PV * (1+r)^n  => PV = FV / (1+r)^n
  // Karena 'n' berbeda tiap stage, kita pakai simplifikasi atau ambil selisihnya
  // Tapi untuk UX, menampilkan "Biaya Nanti" vs "Tabungan Bulanan" sudah cukup kuat.
  
  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
       
       {/* Result Header */}
       <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800">Hasil Simulasi Pendidikan</h2>
          <p className="text-slate-500 font-medium">
            Rencana Dana Pendidikan untuk Ananda <span className="text-blue-600 font-bold">{data.childName}</span>
          </p>
       </div>

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
               *Total akumulasi biaya (TK s/d Kuliah) yang sudah memperhitungkan inflasi pendidikan sebesar {data.inflationRate}% per tahun.
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

       {/* Insight Box */}
       <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
             <h4 className="font-bold text-blue-900 text-sm">Tips Perencana Keuangan:</h4>
             <p className="text-sm text-blue-700/80 leading-relaxed mt-1 text-justify">
               Biaya pendidikan naiknya gila-gilaan, Pak/Bu! Angka <b>{formatRupiah(data.monthlySaving)}</b> mungkin terlihat besar, 
               tapi jika Anda mulai menunda 1 tahun saja, angkanya akan naik drastis karena efek bunga majemuk berkurang. 
               Segera buka rekening investasi khusus pendidikan sekarang juga!
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
           
           {/* Tombol Simpan biasanya sudah di-handle di Wizard, 
               tapi jika mau fitur "Download PDF" bisa ditaruh di sini */}
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