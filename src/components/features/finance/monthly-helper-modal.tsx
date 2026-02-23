"use client";

import { useState, useEffect } from "react";
import { Calculator, X, CalendarDays, Banknote, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface MonthlyHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (annualValue: number) => void;
  title?: string;
}

export function MonthlyHelperModal({
  isOpen,
  onClose,
  onApply,
  title = "Asisten Hitung Tahunan",
}: MonthlyHelperModalProps) {
  const [monthlyValue, setMonthlyValue] = useState("");

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setMonthlyValue("");
    }
  }, [isOpen]);

  // Logic Kalkulasi
  const rawValue = parseInt(monthlyValue.replace(/\D/g, "")) || 0;
  const annualValue = rawValue * 12;

  const handleApply = () => {
    onApply(annualValue);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6">

          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* MODAL CENTER PANEL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full md:max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* HEADER */}
            <div className="relative pt-6 pb-5 px-6 bg-linear-to-b from-indigo-50/50 to-white flex items-start justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg md:text-xl tracking-tight">{title}</h3>
                  <p className="text-[11px] md:text-xs text-slate-500 font-medium">Bantu konversi bulanan ke tahunan</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BODY CONTENT */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Input Nominal Bulanan */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Nominal Per Bulan
                </label>
                <div className="relative group transition-all duration-300 transform focus-within:scale-[1.02]">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-200 font-light text-2xl">|</div>
                  <div className="absolute left-16 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">Rp</div>
                  <Input
                    autoFocus
                    type="text"
                    inputMode="numeric"
                    value={monthlyValue}
                    onChange={handleInputChange}
                    className="pl-24 h-16 bg-slate-50/50 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white font-black text-xl text-slate-800 rounded-2xl transition-all shadow-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Separator / Visual Math */}
              <div className="flex items-center justify-center gap-4">
                <div className="h-px bg-slate-100 flex-1" />
                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full text-indigo-500 flex items-center gap-1.5">
                  <X className="w-3 h-3" /> 12 Bulan
                </span>
                <div className="h-px bg-slate-100 flex-1" />
              </div>

              {/* Result Output Card */}
              <div className="relative bg-linear-to-br from-indigo-600 via-blue-600 to-indigo-800 p-6 rounded-[1.5rem] text-white shadow-xl shadow-indigo-900/20 overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 blur-3xl rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-150" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-400/20 blur-2xl rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center text-center space-y-1">
                  <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3 text-yellow-300" /> Hasil Estimasi Tahunan
                  </p>
                  <p className="text-3xl sm:text-4xl font-black tracking-tighter truncate w-full px-2">
                    {formatRupiah(annualValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="p-6 pt-2 pb-6 flex gap-3 border-t border-slate-50 bg-white">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-14 rounded-2xl font-bold text-slate-500 border-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
              >
                Batal
              </Button>
              <Button
                onClick={handleApply}
                disabled={annualValue <= 0}
                className="flex-2 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                <Banknote className="w-5 h-5 mr-2" />
                Terapkan Nilai
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}