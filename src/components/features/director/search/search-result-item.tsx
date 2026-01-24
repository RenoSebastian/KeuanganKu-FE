"use client";

import { User } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResultItemProps {
  user: User;
  onClick: () => void;
}

export default function SearchResultItem({ user, onClick }: SearchResultItemProps) {
  // Extract data dengan aman
  // Mengambil checkup terakhir (index 0)
  const lastCheck = user.financialChecks?.[0];
  const status = lastCheck?.status || "UNKNOWN";
  const score = lastCheck?.healthScore;

  // Helper untuk Warna Badge
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "SEHAT": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "WASPADA": return "bg-amber-100 text-amber-700 border-amber-200";
      case "BAHAYA": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div 
      onClick={onClick}
      className="p-3 hover:bg-slate-50 cursor-pointer transition-colors group flex items-center justify-between border-b border-slate-50 last:border-0"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Avatar Initials */}
        <div className="w-9 h-9 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors border border-slate-200 group-hover:border-brand-200">
          {user.fullName.substring(0, 2).toUpperCase()}
        </div>
        
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-brand-700">
            {user.fullName}
          </h4>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 truncate max-w-[150px]">
              <Building className="w-3 h-3" /> {user.unitKerja?.name || "Unit -"}
            </span>
          </div>
        </div>
      </div>

      {/* Status & Score Badge */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {status !== "UNKNOWN" ? (
          <>
            <Badge className={cn("text-[9px] px-1.5 py-0 border uppercase font-bold shadow-sm", getStatusColor(status))}>
              {status}
            </Badge>
            <span className="text-[10px] font-mono text-slate-400">
              Score: <span className={cn("font-bold", (score ?? 0) < 60 ? "text-rose-500" : "text-slate-600")}>
                {score ?? '-'}
              </span>
            </span>
          </>
        ) : (
          <span className="text-[9px] text-slate-400 italic bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
            Belum Checkup
          </span>
        )}
      </div>
    </div>
  );
}