"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { formatRupiah, calculateAge } from "@/lib/financial-math";
import { ChildProfile, StageBreakdownItem } from "@/lib/types"; 
import { 
  Baby, Trash2, ChevronDown, ChevronUp, Clock, Info, 
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ChildCardProps {
  profile: ChildProfile;
  result?: { 
    totalMonthlySaving: number;
    stagesBreakdown?: StageBreakdownItem[]; 
    stages?: any[]; 
  }; 
  onDelete: (id: string) => void;
}

export function ChildCard({ profile, result, onDelete }: ChildCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Defensive check: pastikan profile.dob valid sebelum masuk calculateAge
  const age = profile.dob ? calculateAge(profile.dob) : 0;
  
  // UBAH: Warna avatar lebih soft cyan/blue
  const avatarGradient = "bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-700 border border-cyan-100";

  // Prioritaskan Data Backend
  const breakdownData = result?.stagesBreakdown || []; 
  
  // FIX: Bungkus dengan Number() untuk memastikan string "434113.35" dari backend terbaca sebagai angka
  const totalSaving = Number(result?.totalMonthlySaving || 0);

  return (
    <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-2xl group">
      
      {/* --- HEADER CARD --- */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 flex items-center justify-between cursor-pointer select-none bg-white relative z-10"
      >
        <div className="flex items-center gap-4">
           {/* Avatar */}
           <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", avatarGradient)}>
              <Baby className="w-6 h-6" />
           </div>
           
           {/* Info */}
           <div>
              <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                {profile.name}
                <span className="text-[10px] font-normal px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                  {age} tahun
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                 Target Dana: <span className="font-semibold text-cyan-600">{formatRupiah(totalSaving)}</span> / bulan
              </p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <Button
             variant="ghost"
             size="icon"
             className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
             onClick={(e) => {
               e.stopPropagation();
               onDelete(profile.id);
             }}
           >
             <Trash2 className="w-4 h-4" />
           </Button>
           
           <div className={cn(
             "w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center transition-transform duration-300",
             isOpen ? "rotate-180 bg-cyan-50 text-cyan-600" : "text-slate-400"
           )}>
              <ChevronDown className="w-4 h-4" />
           </div>
        </div>
      </div>

      {/* --- DETAIL EXPANSION --- */}
      <div className={cn(
        "grid transition-all duration-300 ease-in-out bg-slate-50/50 border-t border-slate-100",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
         <div className="overflow-hidden">
           
           {/* Wrapper overflow-x-auto agar tabel bisa di-scroll di mobile */}
           <div className="w-full overflow-x-auto">
             <table className="w-full text-left min-w-[500px]"> 
               <thead className="bg-slate-100/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                 <tr>
                   <th className="pl-6 py-3 rounded-tl-lg">Jenjang</th>
                   <th className="py-3">Biaya Saat Ini</th>
                   <th className="py-3 text-right">Biaya Masa Depan</th>
                   <th className="pr-6 py-3 text-right rounded-tr-lg">Nabung / Bln</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 text-sm">
                 {breakdownData.map((item, idx) => {
                   // FIX: Bungkus semua field keuangan dengan Number()
                   const currentCost = Number(item.currentCost || 0);
                   const fv = Number(item.futureCost || 0);
                   const pmt = Number(item.monthlySaving || 0);
                   const years = Number(item.yearsToStart || 0);

                   return (
                     <tr key={idx} className="hover:bg-white transition-colors group/row">
                         <td className="pl-6 py-4">
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                               <span className="font-bold text-slate-700">{item.level}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 pl-3.5">
                              {item.costType === "ENTRY" ? "Uang Pangkal" : "SPP Tahunan"}
                            </span>
                         </td>
                         <td className="py-4 text-slate-500 font-medium">
                            {formatRupiah(currentCost)}
                         </td>
                         <td className="py-4 text-right">
                            <div className="font-bold text-slate-700 text-sm whitespace-nowrap">
                                {formatRupiah(fv)}
                            </div>
                            <div className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md mt-1">
                               <Clock className="w-2.5 h-2.5" /> {years} thn lagi
                            </div>
                         </td>
                         <td className="pl-4 pr-6 py-4 text-right bg-cyan-50/30 group-hover/row:bg-cyan-50/60 transition-colors">
                            <div className="font-black text-cyan-700 text-sm whitespace-nowrap">
                                {formatRupiah(pmt)}
                            </div>
                            <div className="text-[9px] text-slate-400 font-medium mt-0.5">/bulan</div>
                         </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
           
           {/* Insight Footer */}
           <div className="px-6 py-4 bg-yellow-50/50 border-t border-yellow-100 flex gap-3 items-start">
              <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-yellow-800/80 leading-relaxed">
                 Strategi <b>Sinking Fund:</b> Anda menabung secara terpisah untuk setiap jenjang pendidikan mulai hari ini.
                 Total tabungan di atas adalah akumulasi dari semua cicilan jenjang pendidikan anak ini.
              </p>
           </div>

         </div>
      </div>
    </Card>
  );
}