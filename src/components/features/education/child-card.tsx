"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { formatRupiah, calculateAge } from "@/lib/financial-math";
import { ChildProfile, StageBreakdownItem } from "@/lib/types"; 
import { 
  Baby, Trash2, ChevronDown, ChevronUp, Clock, Info, 
  GraduationCap, TrendingUp, Calendar, School 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ChildCardProps {
  profile: ChildProfile;
  // Result bisa dari Backend (stagesBreakdown) atau Lokal (stages)
  result?: { 
    totalMonthlySaving: number;
    stagesBreakdown?: StageBreakdownItem[]; 
    stages?: any[]; 
  }; 
  onDelete: (id: string) => void;
}

export function ChildCard({ profile, result, onDelete }: ChildCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const age = calculateAge(profile.dob);
  
  // Dynamic Gradient Avatar based on Gender
  const avatarGradient = profile.gender === "L" 
    ? "from-blue-100 to-indigo-200 text-blue-700" 
    : "from-pink-100 to-rose-200 text-pink-700";

  // Prioritaskan Data Backend (stagesBreakdown) -> Fallback ke Data Lokal (stages)
  // Logic: Backend biasanya mengirim 'stagesBreakdown', kalkulator lokal pakai 'stages'
  const totalMonthlySaving = result?.totalMonthlySaving ?? 0;
  const stagesData = result?.stagesBreakdown || result?.stages || [];
  

  return (
    <Card className="group relative bg-white/80 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 rounded-[2rem] overflow-hidden">
       
       {/* --- DECORATIVE BACKGROUND BLOB --- */}
       <div className={cn(
         "absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors duration-500",
         profile.gender === "L" ? "bg-blue-300" : "bg-pink-300"
       )} />

       <div className="p-1">
         <div className="bg-linear-to-b from-white/50 to-white/20 p-5 rounded-[1.8rem]">
           
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
                 Target Dana: <span className="font-semibold text-cyan-600">{formatRupiah(totalMonthlySaving)}</span> / bulan
              </p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <Button
             variant="ghost"
             size="icon"
             className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
             onClick={(e: { stopPropagation: () => void; }) => {
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
      </div>         </div>
       </div>

       {/* --- DETAILED TABLE (ACCORDION) --- */}
       {isOpen && result && (
         <div className="animate-in slide-in-from-top-4 duration-500 ease-out border-t border-slate-100 bg-slate-50/50">
           
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr>
                   <th className="pl-6 pr-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100/50">Jenjang</th>
                   <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100/50 text-right">Target Dana</th>
                   <th className="pl-4 pr-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100/50 text-right">Nabung</th>
                 </tr>
               </thead>
               <tbody className="text-sm">
                 {stagesData.map((item: any, idx: number) => {
                   // Normalisasi Data (Handle perbedaan nama field Backend vs Frontend)
                   const level = item.level || item.stageId || item.stage;
                   const typeLabel = item.costType === "ENTRY" ? "Uang Pangkal" : (item.item || "SPP Bulanan");
                   const isEntry = item.costType === "ENTRY" || (item.item && item.item.includes("Pangkal"));
                   
                   const years = item.yearsToStart !== undefined ? item.yearsToStart : item.dueYear;
                   const fv = item.futureCost !== undefined ? item.futureCost : item.totalFutureCost;
                   const pmt = item.monthlySaving !== undefined ? item.monthlySaving : item.requiredSaving;

                   return (
                     <tr key={idx} className="group/row hover:bg-white transition-colors border-b border-slate-100/50 last:border-0">
                         <td className="pl-6 pr-4 py-4">
                            <div className="flex items-center gap-3">
                               <div className={cn(
                                 "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                 isEntry ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                               )}>
                                  {isEntry ? <School className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                               </div>
                               <div>
                                 <div className="font-bold text-slate-700 text-xs md:text-sm">{level}</div>
                                 <div className="text-[10px] text-slate-400 font-medium">{typeLabel}</div>
                               </div>
                            </div>
                         </td>
                         <td className="px-4 py-4 text-right">
                            <div className="font-bold text-slate-600 text-xs md:text-sm">{formatRupiah(fv || 0)}</div>
                            <div className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md mt-1">
                               <Clock className="w-2.5 h-2.5" /> {years} thn lagi
                            </div>
                         </td>
                         <td className="pl-4 pr-6 py-4 text-right">
                            <div className="font-black text-green-600 text-xs md:text-sm">{formatRupiah(pmt || 0)}</div>
                            <div className="text-[9px] text-slate-400 font-medium mt-0.5">/bulan</div>
                         </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
           
           {/* Insight Footer */}
           <div className="px-6 py-4 bg-yellow-50/80 border-t border-yellow-100 flex gap-3 items-start">
              <Info className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-yellow-800/80 leading-relaxed">
                 Strategi <b>Sinking Fund:</b> Anda menabung secara terpisah untuk setiap jenjang pendidikan mulai hari ini. Total tabungan akan berkurang seiring lunasnya setiap tahapan sekolah.
              </p>
           </div>
         </div>
       )}
    </Card>
  );
}