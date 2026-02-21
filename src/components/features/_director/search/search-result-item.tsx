"use client";

import { SearchResult } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Building, User, ChevronRight, Zap, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResultItemProps {
  result: SearchResult;
  onClick: () => void;
}

export default function SearchResultItem({ result, onClick }: SearchResultItemProps) {
  // Tentukan Icon berdasarkan Tipe
  const Icon = result.type === "UNIT" ? Building : User;
  
  // Tentukan Badge Source (Untuk Debugging/Informasi Direksi)
  const isMeili = result.metadata.source === "MEILI_ENGINE";

  return (
    <div 
      onClick={onClick}
      className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group border-b border-slate-50 last:border-0 transition-colors"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Avatar / Icon Placeholder */}
        <div className={cn(
          "w-9 h-9 min-w-9 rounded-full flex items-center justify-center border",
          result.type === "UNIT" 
            ? "bg-orange-50 border-orange-100 text-orange-600" 
            : "bg-blue-50 border-blue-100 text-blue-600"
        )}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Text Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900 truncate">
              {result.title}
            </h4>
            
            {/* Tech Badge: Menunjukkan kecanggihan sistem ke User */}
            {result.metadata.isFuzzy && (
              <Badge variant="outline" className="h-4 px-1 text-[9px] border-amber-200 bg-amber-50 text-amber-700">
                Typo?
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-slate-500 truncate">
            {result.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pl-2">
        {/* Source Indicator (Optional: Bisa dihapus jika terlalu teknis) */}
        <div className="text-[10px] text-slate-300 flex flex-col items-end">
          {isMeili ? (
            <span className="flex items-center gap-0.5 text-emerald-600/70" title="Powered by Meilisearch Engine">
              <Zap className="w-3 h-3" /> Fast
            </span>
          ) : (
             <span className="flex items-center gap-0.5 text-slate-400" title="Fallback to Database Trigram">
              <Database className="w-3 h-3" /> Deep
            </span>
          )}
        </div>
        
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
    </div>
  );
}