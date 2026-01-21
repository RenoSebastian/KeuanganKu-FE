"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, calculateAge } from "@/lib/financial-math";
import { ChildProfile, ChildSimulationResult } from "@/lib/types"; // Pastikan types sudah diupdate
import { Baby, Trash2, ChevronDown, ChevronUp, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Interface Props
interface ChildCardProps {
  profile: ChildProfile;
  result?: any; // Menggunakan 'any' sementara agar fleksibel menerima structure baru (stagesBreakdown) maupun lama
  onDelete: (id: string) => void;
}

export function ChildCard({ profile, result, onDelete }: ChildCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const age = calculateAge(profile.dob);
  
  const avatarBg = profile.gender === "L" ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600";

  // Data breakdown bisa datang dari 'stages' (legacy) atau 'stagesBreakdown' (new granular)
  // Kita normalisasi di sini agar UI tidak error
  const stagesData = result?.stagesBreakdown || result?.stages || [];

  return (
    <Card className="group relative bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 rounded-3xl overflow-hidden">
       
       {/* Background accent */}
       <div className={cn(
         "absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50",
         profile.gender === "L" ? "bg-blue-200" : "bg-pink-200"
       )} />

       <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
             <div className="flex items-center gap-3">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl", avatarBg)}>
                   {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                   <h3 className="font-bold text-slate-800 text-lg leading-tight">{profile.name}</h3>
                   <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                     <Baby className="w-3 h-3" /> Usia {age} Tahun
                   </p>
                </div>
             </div>
             
             <button 
               onClick={() => onDelete(profile.id)}
               className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors z-10"
             >
               <Trash2 className="w-4 h-4" />
             </button>
          </div>

          {/* Result Section (Footer) */}
          <div className="bg-slate-50 -mx-5 -mb-5 border-t border-slate-100">
             <div className="p-4 flex justify-between items-end">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Tabungan</p>
                   <p className="text-xl font-black text-slate-800">
                      {result ? formatRupiah(result.monthlySaving || result.totalMonthlySaving) : "Rp 0"}
                      <span className="text-xs font-medium text-slate-500">/bln</span>
                   </p>
                </div>
                
                {/* Expand Toggle (Hanya muncul jika ada data rincian) */}
                {result && stagesData.length > 0 && (
                  <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {isOpen ? "Tutup Detail" : "Lihat Rincian"}
                    {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
             </div>

             {/* DETAIL DROPDOWN (GRANULAR TABLE) */}
             {isOpen && result && (
               <div className="animate-in slide-in-from-top-2 border-t border-slate-100">
                 <table className="w-full text-left">
                    <thead className="bg-slate-100/50 text-[10px] text-slate-500 uppercase font-bold">
                      <tr>
                        <th className="px-4 py-2">Jenjang</th>
                        <th className="px-4 py-2 text-right">Biaya Nanti</th>
                        <th className="px-4 py-2 text-right">Nabung</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {stagesData.map((item: any, idx: number) => {
                        // Normalisasi Field (Handle legacy vs new props)
                        const level = item.level || item.stageId;
                        const typeLabel = item.costType === "ENTRY" ? "Pangkal" : "SPP";
                        const typeColor = item.costType === "ENTRY" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600";
                        const years = item.yearsToStart !== undefined ? item.yearsToStart : item.dueYear;
                        
                        // FV & PMT
                        const fv = item.futureCost || item.totalFutureCost || 0;
                        const pmt = item.monthlySaving || 0;

                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                             <td className="px-4 py-3">
                                <div className="font-bold text-slate-700">{level}</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {/* Badge Tipe Biaya */}
                                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold", typeColor)}>
                                    {typeLabel}
                                  </span>
                                  {/* Badge Waktu */}
                                  <span className="text-[9px] text-slate-400 flex items-center gap-0.5 bg-slate-100 px-1.5 py-0.5 rounded">
                                    <Clock className="w-2.5 h-2.5" /> {years} thn lagi
                                  </span>
                                </div>
                             </td>
                             <td className="px-4 py-3 text-right font-medium text-slate-500">
                                {formatRupiah(fv)}
                             </td>
                             <td className="px-4 py-3 text-right font-bold text-green-600">
                                {formatRupiah(pmt)}
                             </td>
                          </tr>
                        );
                      })}
                    </tbody>
                 </table>
                 
                 {/* Tips Footer */}
                 <div className="p-3 bg-yellow-50 text-[10px] text-yellow-700 flex gap-2 items-start border-t border-yellow-100">
                    <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <p>
                      Angka tabungan di atas dihitung <b>terpisah per jenjang</b> (Sinking Fund) agar dana tersedia tepat waktu saat anak masuk sekolah.
                    </p>
                 </div>
               </div>
             )}
          </div>
       </div>
    </Card>
  );
}