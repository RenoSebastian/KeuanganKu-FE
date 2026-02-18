"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { StageBreakdownItem } from "@/lib/types/education";
import {
  Baby, Trash2, ChevronDown, Clock, Info,
  School, Calendar, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// --- INTERFACES ---
export interface ChildProfileData {
  id?: string;
  name: string;
  dob?: string;
  gender?: "L" | "P"; // Opsional, default neutral jika tidak ada
}

export interface ChildFinancialData {
  totalMonthlySaving: number;
  totalFutureCost?: number;
  stages: StageBreakdownItem[];
}

interface ChildCardProps {
  profile: ChildProfileData;
  financials?: ChildFinancialData; // Bisa undefined saat loading/initial
  onDelete?: () => void;
  className?: string;
}

// --- HELPER: Age Calculator ---
const calculateAge = (dob?: string) => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export function ChildCard({ profile, financials, onDelete, className }: ChildCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const age = calculateAge(profile.dob);

  // Tentukan warna berdasarkan gender (atau default)
  const isBoy = profile.gender === "L";
  const isGirl = profile.gender === "P";

  const avatarGradient = isBoy
    ? "from-blue-100 to-indigo-200 text-blue-700"
    : isGirl
      ? "from-pink-100 to-rose-200 text-pink-700"
      : "from-emerald-100 to-teal-200 text-emerald-700"; // Neutral

  const bgBlobColor = isBoy ? "bg-blue-300" : isGirl ? "bg-pink-300" : "bg-emerald-300";

  // Safe Access Data
  const totalMonthlySaving = financials?.totalMonthlySaving ?? 0;
  const stagesData = financials?.stages || [];

  return (
    <Card className={cn(
      "group relative bg-white/80 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 rounded-[2rem] overflow-hidden",
      className
    )}>

      {/* --- DECORATIVE BACKGROUND BLOB --- */}
      <div className={cn(
        "absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500",
        bgBlobColor
      )} />

      <div className="p-1">
        <div className="bg-linear-to-b from-white/50 to-white/20 rounded-[1.8rem]">

          {/* --- HEADER CARD --- */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="p-5 flex items-center justify-between cursor-pointer select-none bg-white/40 relative z-10 rounded-[1.8rem] hover:bg-white/60 transition-colors"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-linear-to-br", avatarGradient)}>
                <Baby className="w-6 h-6" />
              </div>

              {/* Info */}
              <div>
                <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  {profile.name}
                  <span className="text-[10px] font-normal px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200">
                    {age} tahun
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  Target Dana: <span className="font-bold text-primary">{formatCurrency(totalMonthlySaving)}</span> / bulan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}

              <div className={cn(
                "w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center transition-all duration-300 shadow-sm",
                isOpen ? "rotate-180 bg-primary/10 text-primary border-primary/20" : "text-slate-400"
              )}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- DETAILED TABLE (ACCORDION) --- */}
      {isOpen && financials && (
        <div className="animate-in slide-in-from-top-4 duration-500 ease-out border-t border-slate-100/50 bg-slate-50/50">

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="pl-6 pr-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100/50">Jenjang</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100/50 text-right">Target Dana (FV)</th>
                  <th className="pl-4 pr-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100/50 text-right">Nabung</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stagesData.map((item, idx) => {
                  const typeLabel = item.costType === "ENTRY" ? "Uang Pangkal" : "Biaya Bulanan";
                  const isEntry = item.costType === "ENTRY";

                  return (
                    <tr key={idx} className="group/row hover:bg-white transition-colors border-b border-slate-100/50 last:border-0">
                      <td className="pl-6 pr-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ring-1 ring-inset ring-black/5",
                            isEntry ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {isEntry ? <School className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-700 text-xs md:text-sm">{item.level}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{typeLabel}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="font-bold text-slate-600 text-xs md:text-sm">{formatCurrency(item.futureCost)}</div>
                        <div className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md mt-1">
                          <Clock className="w-2.5 h-2.5" /> {item.yearsToStart} thn lagi
                        </div>
                      </td>
                      <td className="pl-4 pr-6 py-4 text-right">
                        <div className="font-black text-emerald-600 text-xs md:text-sm">{formatCurrency(item.monthlySaving)}</div>
                        <div className="text-[9px] text-slate-400 font-medium mt-0.5">/bulan</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Insight Footer */}
          <div className="px-6 py-4 bg-primary/5 border-t border-primary/10 flex gap-3 items-start">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-primary/80 leading-relaxed">
              <b>Tips:</b> Angka di atas menggunakan asumsi inflasi. Semakin dini Anda mulai, semakin ringan beban bulanan karena efek <i>compound interest</i>.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}