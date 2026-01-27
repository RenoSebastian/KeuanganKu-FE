"use client";

import { useState, useEffect } from "react";
import { Calculator, X, ArrowRight, CalendarDays, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MonthlyHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (annualValue: number) => void;
  title?: string; // Opsional: Untuk judul spesifik, misal "Hitung Gaji"
}

export function MonthlyHelperModal({
  isOpen,
  onClose,
  onApply,
  title = "Asisten Hitung Tahunan",
}: MonthlyHelperModalProps) {
  const [monthlyValue, setMonthlyValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  // Efek animasi masuk/keluar
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset state saat modal dibuka kembali
  useEffect(() => {
    if (isOpen) {
      setMonthlyValue("");
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  // Logic Kalkulasi
  const rawValue = parseInt(monthlyValue.replace(/\D/g, "")) || 0;
  const annualValue = rawValue * 12;

  const handleApply = () => {
    onApply(annualValue);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format input tampilan (ribuan separator)
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setMonthlyValue("");
      return;
    }
    const formatted = new Intl.NumberFormat("id-ID").format(parseInt(raw));
    setMonthlyValue(formatted);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className={cn(
      "fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300",
      isOpen ? "opacity-100" : "opacity-0"
    )}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={cn(
        "relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden transform transition-all duration-300",
        isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
      )}>
        
        {/* Header */}
        <div className="bg-brand-50/50 p-6 border-b border-brand-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-600 shadow-sm ring-1 ring-brand-100">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg tracking-tight">{title}</h3>
              <p className="text-xs text-slate-500 font-medium">Konversi Bulanan ke Tahunan (x12)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Input Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Nominal Per Bulan
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-200 font-light text-xl">|</div>
              <div className="absolute left-14 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">Rp</div>
              <Input
                autoFocus
                type="text"
                inputMode="numeric"
                value={monthlyValue}
                onChange={handleInputChange}
                className="pl-20 h-14 bg-slate-50 border-slate-200 focus:border-brand-500 focus:bg-white font-bold text-lg text-slate-800 rounded-xl transition-all shadow-sm"
                placeholder="0"
              />
            </div>
          </div>

          {/* Visual Calculation */}
          <div className="flex items-center justify-center gap-4 text-slate-300">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-xs font-bold uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full text-slate-500">
              Dikali 12 Bulan
            </span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Result Preview */}
          <div className="bg-linear-to-br from-brand-600 to-brand-700 p-5 rounded-2xl text-white shadow-lg shadow-brand-600/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all duration-700" />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-1">
              <p className="text-brand-100 text-xs font-medium uppercase tracking-wide">Estimasi Per Tahun</p>
              <p className="text-2xl sm:text-3xl font-black tracking-tight">
                {formatRupiah(annualValue)}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="flex-1 h-12 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          >
            Batal
          </Button>
          <Button 
            onClick={handleApply}
            disabled={annualValue <= 0}
            className="flex-2 h-12 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-lg shadow-brand-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
          >
            <Banknote className="w-4 h-4 mr-2" />
            Gunakan Angka Ini
          </Button>
        </div>

      </div>
    </div>
  );
}