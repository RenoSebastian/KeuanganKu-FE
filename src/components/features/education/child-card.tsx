"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, calculateAge } from "@/lib/financial-math";
import { ChildProfile, ChildSimulationResult } from "@/lib/types";
import { Baby, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChildCardProps {
  profile: ChildProfile;
  result?: ChildSimulationResult; 
  onDelete: (id: string) => void;
}

export function ChildCard({ profile, result, onDelete }: ChildCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const age = calculateAge(profile.dob);
  
  const avatarBg = profile.gender === "L" ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600";

  // --- HELPER LOGIC LABEL ---
  const getBadgeLabel = (stageId: string, grade: number) => {
    // 1. Logic Khusus TK
    if (stageId === "TK") {
        return ` (Mulai TK ${grade === 1 ? 'A' : 'B'})`;
    }

    // 2. Logic Khusus Kuliah (S1 / S2)
    // Cek ID string karena plan tidak punya info paymentFrequency
    if (["KULIAH", "S2"].includes(stageId)) {
        // Tampilkan badge semester jika mulai bukan dari semester 1
        return grade > 1 ? ` (Mulai Smt ${grade})` : "";
    }

    // 3. Logic Sekolah Umum (SD, SMP, SMA)
    // Tampilkan hanya jika loncat kelas (Misal mulai kelas 3)
    return grade > 1 ? ` (Mulai Kls ${grade})` : "";
  };

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
               className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
             >
               <Trash2 className="w-4 h-4" />
             </button>
          </div>

          {/* Tags (Ringkasan Jenjang) */}
          <div className="flex flex-wrap gap-2 mb-4">
             {profile.plans.map(plan => (
               <Badge key={plan.stageId} variant="secondary" className="bg-slate-50 text-slate-600 border-slate-100 text-[10px] font-semibold">
                 {plan.stageId}
                 {getBadgeLabel(plan.stageId, plan.startGrade)}
               </Badge>
             ))}
          </div>

          {/* Result Section (Footer) */}
          <div className="bg-slate-50 -mx-5 -mb-5 border-t border-slate-100">
             <div className="p-4 flex justify-between items-end">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Tabungan</p>
                   <p className="text-xl font-black text-slate-800">
                      {result ? formatRupiah(result.totalMonthlySaving) : "Rp 0"}
                      <span className="text-xs font-medium text-slate-500">/bln</span>
                   </p>
                </div>
                
                {/* Expand Toggle */}
                {result && (
                  <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {isOpen ? "Tutup Detail" : "Lihat Rincian"}
                    {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
             </div>

             {/* DETAIL DROPDOWN */}
             {isOpen && result && (
               <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                 <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-3">
                    {result.stages.map((stage) => {
                      // Logic Label Detail (Disamakan dengan Badge)
                      let startLabel = "";
                      if (stage.stageId === "TK") {
                         startLabel = stage.startGrade === 1 ? "Mulai TK A" : "Mulai TK B";
                      } else if (stage.paymentFrequency === "SEMESTER") {
                         startLabel = `Mulai Smt ${stage.startGrade}`;
                      } else {
                         startLabel = `Mulai Kls ${stage.startGrade}`;
                      }

                      return (
                        <div key={stage.stageId} className="text-xs">
                           <div className="flex justify-between font-bold text-slate-700 mb-1">
                              <span>{stage.label}</span>
                              <span>{formatRupiah(stage.monthlySaving)}/bln</span>
                           </div>
                           <div className="text-[10px] text-slate-400 flex justify-between">
                              <span>{startLabel}</span>
                              <span>Target: {formatRupiah(stage.totalFutureCost)}</span>
                           </div>
                        </div>
                      );
                    })}
                 </div>
               </div>
             )}
          </div>
       </div>
    </Card>
  );
}