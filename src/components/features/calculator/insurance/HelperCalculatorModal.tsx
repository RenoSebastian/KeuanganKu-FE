import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator } from "lucide-react";
import { InputGroup } from "./InputGroup";

interface HelperCalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'KPR' | 'KPM' | 'INCOME' | null;
    tempMonthly: string;
    tempTenor: string;
    onMonthlyChange: (val: string) => void;
    onTenorChange: (val: string) => void;
    onApply: (type: 'KPR' | 'KPM' | 'INCOME') => void;
}

export const HelperCalculatorModal = ({
    isOpen,
    onClose,
    type,
    tempMonthly,
    tempTenor,
    onMonthlyChange,
    onTenorChange,
    onApply
}: HelperCalculatorModalProps) => {
    if (!isOpen || !type) return null;

    const isIncome = type === 'INCOME';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 animate-in fade-in duration-200">
            {/* Overlay Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600">
                        <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800">
                            {isIncome ? "Kalkulator Gaji Tahunan" : "Asisten Kalkulator Utang"}
                        </h3>
                        <p className="text-xs text-slate-500">
                            {isIncome
                                ? "Hitung total gaji setahun dari gaji bulanan."
                                : "Hitung sisa utang dari cicilan rutin."}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            {isIncome ? "Gaji Bersih Per Bulan" : "Cicilan Per Bulan"}
                        </label>
                        <InputGroup
                            value={tempMonthly}
                            onChange={(e) => onMonthlyChange(e.target.value)}
                            placeholder="0"
                        />
                    </div>

                    {!isIncome && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Sisa Tenor (Bulan)
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={tempTenor}
                                    onChange={(e) => onTenorChange(e.target.value)}
                                    className="h-12 rounded-xl font-bold bg-slate-50 border-slate-200 focus:border-brand-500 pr-12"
                                    placeholder="Contoh: 120"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">
                                    Bln
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-xl font-bold border-slate-200"
                            onClick={onClose}
                        >
                            Batal
                        </Button>
                        <Button
                            className="flex-2 h-12 rounded-xl font-bold bg-brand-600 shadow-lg shadow-brand-500/30 text-white"
                            onClick={() => onApply(type)}
                        >
                            Terapkan Hasil
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};