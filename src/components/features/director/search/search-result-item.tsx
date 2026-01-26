"use client";

import { User } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Building, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchResultItem({ user, onClick }: { user: User; onClick: () => void; }) {
  const lastCheck = user.financialChecks?.[0];
  const status = lastCheck?.status;
  const score = lastCheck?.healthScore;

  const statusColors: Record<string, string> = {
    SEHAT: "bg-emerald-100 text-emerald-700",
    WASPADA: "bg-amber-100 text-amber-700",
    BAHAYA: "bg-rose-100 text-rose-700",
    UNKNOWN: "bg-slate-100 text-slate-600"
  };

  return (
    <div 
      onClick={onClick}
      className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group border-b border-slate-50 last:border-0"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
          {user.fullName.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{user.fullName}</h4>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Building className="w-3 h-3" /> {user.unitKerja?.name || "-"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {status ? (
          <div className="text-right">
             <Badge className={cn("text-[9px] px-1.5 h-4 border-0 font-bold", statusColors[status] || statusColors.UNKNOWN)}>
               {status}
             </Badge>
             <div className="text-[10px] text-slate-400 mt-0.5">Score: {score}</div>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 italic">No Data</span>
        )}
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
    </div>
  );
}