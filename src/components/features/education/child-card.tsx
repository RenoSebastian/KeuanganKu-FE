"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { StageBreakdownItem } from "@/lib/types/education";
import {
  Baby, Trash2, ChevronDown, Clock, Info,
  School, Calendar, TrendingUp, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// --- INTERFACES ---
export interface ChildProfileData {
  id?: string;
  name: string;
  dob?: string;
  gender?: "L" | "P";
}

export interface ChildFinancialData {
  totalMonthlySaving: number;
  totalFutureCost?: number;
  stages: StageBreakdownItem[];
}

interface ChildCardProps {
  profile: ChildProfileData;
  financials?: ChildFinancialData;
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

  // Tentukan warna tema berdasarkan gender (Opsional: Bisa diseragamkan biru jika mau strict theme)
  // Di sini saya buat nuansa Biru (Laki) dan Pink (Perempuan) tapi tetap soft agar masuk ke tema global
  const isBoy = profile.gender === "L";
  const isGirl = profile.gender === "P";

  const avatarBg = isBoy
    ? "bg-blue-100 text-blue-600"
    : isGirl
      ? "bg-pink-100 text-pink-600"
      : "bg-indigo-100 text-indigo-600";

  // Safe Access Data
  const totalMonthlySaving = financials?.totalMonthlySaving ?? 0;
  const stagesData = financials?.stages || [];

  return (
    <Card className={cn(
      "group relative bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 rounded-2xl overflow-hidden",
      className
    )}>
      {/* Header Card */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 flex items-center justify-between cursor-pointer select-none bg-linear-to-r from-white to-slate-50/50"
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", avatarBg)}>
            <Baby className="w-6 h-6" />
          </div>

          {/* Info */}
          <div>
            <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
              {profile.name}
              <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200">
                {age} tahun
              </span>
            </h4>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span>Target:</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-1.5 rounded">
                {formatCurrency(totalMonthlySaving)}
              </span>
              <span>/bln</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}

          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
            isOpen ? "bg-blue-100 text-blue-600 rotate-180" : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm"
          )}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* --- DETAILED TABLE (ACCORDION) --- */}
      {isOpen && financials && (
        <div className="animate-in slide-in-from-top-2 duration-300 ease-out border-t border-slate-100">

          <div className="bg-slate-50/30">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="pl-6 pr-4 py-3">Jenjang</th>
                    <th className="px-4 py-3 text-right">Target Dana (FV)</th>
                    <th className="pl-4 pr-6 py-3 text-right">Nabung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stagesData.map((item, idx) => {
                    const typeLabel = item.costType === "ENTRY" ? "Uang Pangkal" : "Biaya Bulanan";
                    const isEntry = item.costType === "ENTRY";

                    return (
                      <tr key={idx} className="hover:bg-blue-50/40 transition-colors group/row">
                        <td className="pl-6 pr-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ring-1 ring-inset ring-black/5 bg-white",
                              isEntry ? "text-orange-500" : "text-blue-500"
                            )}>
                              {isEntry ? <School className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-700 text-xs">{item.level}</div>
                              <div className="text-[10px] text-slate-400">{typeLabel}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-medium text-slate-600 text-xs">{formatCurrency(item.futureCost)}</div>
                          <div className="inline-flex items-center gap-1 text-[9px] text-slate-400 mt-0.5">
                            <Clock className="w-2.5 h-2.5" /> {item.yearsToStart} thn lagi
                          </div>
                        </td>
                        <td className="pl-4 pr-6 py-3 text-right">
                          <div className="font-bold text-emerald-600 text-xs">{formatCurrency(item.monthlySaving)}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5">/bulan</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insight Footer */}
          <div className="px-5 py-3 bg-blue-50/50 border-t border-blue-100 flex gap-3 items-start">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-600 leading-relaxed">
              <span className="font-semibold text-blue-700">Tips Cerdas:</span> Angka di atas sudah memperhitungkan inflasi. Semakin dini Anda mulai menabung, semakin ringan beban bulanan berkat efek <i>compound interest</i>.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}