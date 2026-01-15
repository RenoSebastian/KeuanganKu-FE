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
  colorClass?: string; // "accent-blue-600" atau "accent-green-600"
}

export function Slider({ 
  value, min = 0, max = 100, step = 1, onChange, className, 
  label, valueLabel, colorClass = "accent-blue-600" 
}: SliderProps) {
  
  // Hitung persentase untuk background gradient track
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full space-y-2", className)}>
      {(label || valueLabel) && (
        <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
          <span>{label}</span>
          <span className={cn("font-bold", colorClass.replace("accent-", "text-"))}>{valueLabel}</span>
        </div>
      )}
      
      <div className="relative w-full h-6 flex items-center">
        {/* Track Background */}
        <div className="absolute w-full h-2 bg-slate-200 rounded-lg overflow-hidden pointer-events-none">
           <div 
             className={cn("h-full transition-all duration-100", colorClass.replace("accent-", "bg-"))} 
             style={{ width: `${percentage}%` }} 
           />
        </div>

        {/* Native Input Range (Styled) */}
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            "w-full h-2 bg-transparent appearance-none cursor-pointer z-10",
            "focus:outline-none focus:ring-0",
            // Thumb Styling (Chrome/Safari/Edge)
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white",
            "[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2",
            `[&::-webkit-slider-thumb]:${colorClass.replace("accent-", "border-")}`,
            "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110",
            // Thumb Styling (Firefox)
            "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white",
            "[&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-md"
          )}
        />
      </div>
    </div>
  );
}