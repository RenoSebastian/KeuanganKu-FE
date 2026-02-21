"use client";

import { useState, useRef, useEffect } from "react";
import { Filter, X, Check, ChevronDown, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

interface RiskFilterBarProps {
  label: string;
  options: FilterOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export default function RiskFilterBar({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = "Semua Data"
}: RiskFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Click Outside Handler (Menutup dropdown jika klik di luar)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Selection Handler
  const handleSelect = (val: string) => {
    onValueChange(val);
    setIsOpen(false);
  };

  // 3. Clear Filter Handler
  const clearFilter = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah dropdown terbuka/tertutup saat klik tombol X
    onValueChange("");
  };

  // Cari label untuk value yang sedang dipilih
  const selectedLabel = options.find(opt => opt.value === selectedValue)?.label;

  return (
    <div className="flex items-center gap-3">
      {/* Label Kategori */}
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:inline-block">
        {label}
      </span>
      
      <div ref={containerRef} className="relative">
        
        {/* TRIGGER BUTTON */}
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-9 px-3 text-xs font-medium border-dashed transition-all flex items-center gap-2 rounded-lg",
            // Style jika ada filter aktif vs tidak
            selectedValue 
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300" 
              : "border-slate-300 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-white"
          )}
        >
          {selectedValue ? (
             <div className="flex items-center gap-1.5">
                <Badge className="h-5 px-1.5 bg-white text-emerald-700 hover:bg-white border border-emerald-200 rounded text-[10px] uppercase font-bold shadow-sm">
                    {selectedLabel}
                </Badge>
             </div>
          ) : (
             <>
               <ListFilter className="w-3.5 h-3.5 mr-1" />
               <span>{placeholder}</span>
             </>
          )}
          
          {/* Icons: Clear (X) atau Chevron */}
          {selectedValue ? (
            <div 
                role="button"
                onClick={clearFilter}
                className="ml-1 p-0.5 rounded-full hover:bg-emerald-200/50 text-emerald-600 transition-colors"
            >
                <X className="w-3 h-3" />
            </div>
          ) : (
            <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
          )}
        </Button>

        {/* DROPDOWN MENU POPOVER */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-55 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 slide-in-from-top-2 origin-top-left">
             <div className="p-1 max-h-75 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                
                {/* Option: Reset / Semua */}
                <div 
                  className={cn(
                    "px-3 py-2.5 text-xs rounded-lg cursor-pointer flex items-center justify-between transition-colors",
                    selectedValue === "" ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-600 hover:bg-slate-50"
                  )}
                  onClick={() => handleSelect("")}
                >
                   <span>{placeholder}</span>
                   {selectedValue === "" && <Check className="w-3.5 h-3.5 text-slate-500" />}
                </div>
                
                <div className="h-px bg-slate-100 my-1 mx-2" />

                {/* List Options */}
                {options.map((opt) => (
                   <div 
                     key={opt.value}
                     className={cn(
                       "px-3 py-2.5 text-xs rounded-lg cursor-pointer flex items-center justify-between transition-colors",
                       selectedValue === opt.value 
                        ? "bg-emerald-50 text-emerald-700 font-bold" 
                        : "text-slate-600 hover:bg-slate-50"
                     )}
                     onClick={() => handleSelect(opt.value)}
                   >
                      <span className="truncate mr-2">{opt.label}</span>
                      {selectedValue === opt.value && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                   </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}