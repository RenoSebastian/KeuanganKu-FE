"use client";

import { Info, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelpContent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface InfoPopoverProps {
  content?: HelpContent;
  className?: string;
}

export function InfoPopover({ content, className }: InfoPopoverProps) {
  // Jika tidak ada konten help, jangan render apapun agar UI bersih
  if (!content) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "ml-2 text-slate-400 hover:text-brand-600 transition-colors focus:outline-none",
            className
          )}
          type="button" // Penting: type button agar tidak men-submit form saat diklik
          aria-label="Informasi lebih lanjut"
        >
          <Info className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0 overflow-hidden rounded-xl shadow-xl border-slate-200" 
        side="top" 
        align="start"
      >
        {/* Header: Title */}
        <div className="bg-slate-50 p-4 border-b border-slate-100">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-brand-600" />
            {content.title}
          </h4>
        </div>

        {/* Body: Definition & Details */}
        <div className="p-4 space-y-4 text-xs text-slate-600 leading-relaxed">
          
          {/* 1. Definisi Utama */}
          <p className="font-medium">{content.definition}</p>

          {/* 2. Includes (Apa yang termasuk) */}
          {content.includes && content.includes.length > 0 && (
            <div className="space-y-1.5">
              <p className="font-bold text-[10px] text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Termasuk
              </p>
              <ul className="space-y-1 pl-1">
                {content.includes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. Excludes (Apa yang TIDAK termasuk) */}
          {content.excludes && content.excludes.length > 0 && (
            <div className="space-y-1.5 bg-rose-50/50 p-2 rounded-lg border border-rose-100">
              <p className="font-bold text-[10px] text-rose-600 uppercase tracking-wider flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Tidak Termasuk
              </p>
              <ul className="space-y-1 pl-1">
                {content.excludes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-rose-800/80">
                    <span className="w-1 h-1 rounded-full bg-rose-300 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 4. Contoh (Example) */}
          {content.example && (
            <div className="pt-2 border-t border-slate-100 mt-2">
              <p className="italic text-slate-400 text-[10px]">
                <span className="font-bold">Contoh: </span>
                "{content.example}"
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}