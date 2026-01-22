"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  label?: string;     // Label kiri (misal: Inflasi)
  valueLabel?: string; // Label kanan (misal: 10%)
  colorClass?: string; // "accent-brand-600" atau "accent-emerald-600"
}

export function Slider({ 
  value, min = 0, max = 100, step = 1, onChange, className, 
  label, valueLabel, colorClass = "accent-brand-600" 
}: SliderProps) {
  
  // Hitung persentase untuk background gradient track
  const percentage = ((value - min) / (max - min)) * 100;
  
  // Helper untuk mendapatkan nama warna dasar (misal: "brand-600")
  // Asumsi format input selalu "accent-{warna}"
  const baseColor = colorClass.replace("accent-", "");

  return (
    <div className={cn("w-full space-y-3", className)}>
      {(label || valueLabel) && (
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
          <span className={cn("text-sm font-bold font-mono", `text-${baseColor}`)}>{valueLabel}</span>
        </div>
      )}
      
      <div className="relative w-full h-5 flex items-center group">
        {/* Track Background */}
        <div className="absolute w-full h-1.5 bg-slate-200 rounded-full overflow-hidden pointer-events-none">
           <div 
             className={cn("h-full transition-all duration-200 ease-out", `bg-${baseColor}`)} 
             style={{ width: `${percentage}%` }} 
           />
        </div>

        {/* Native Input Range (Styled with Tailwind) */}
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            "w-full h-1.5 bg-transparent appearance-none cursor-pointer z-10 absolute inset-0 my-auto",
            "focus:outline-none focus:ring-0",
            
            // --- Thumb Styling (Chrome/Safari/Edge) ---
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white",
            "[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-slate-400/20",
            "[&::-webkit-slider-thumb]:border-[3px]",
            `[&::-webkit-slider-thumb]:border-${baseColor}`,
            "[&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200",
            "[&::-webkit-slider-thumb]:hover:scale-110",
            
            // --- Thumb Styling (Firefox) ---
            "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white",
            "[&::-moz-range-thumb]:border-[3px]",
            `[&::-moz-range-thumb]:border-${baseColor}`,
            "[&::-moz-range-thumb]:shadow-lg"
          )}
        />
      </div>
    </div>
  );
}