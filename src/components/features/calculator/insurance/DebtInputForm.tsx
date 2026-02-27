import React from 'react';
import { Card } from "@/components/ui/card";
import { InputGroup } from "./InputGroup"; // Import komponen yang baru kita buat
import { BadgeDollarSign, Calculator } from "lucide-react";

// Tipe data untuk props
interface DebtInputFormProps {
    debtData: {
        debtKPR: string;
        debtKPM: string;
        debtProductive: string;
        debtConsumptive: string;
        debtOther: string;
    };
    onDebtChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onShowKprModal: () => void;
    onShowKpmModal: () => void;
}

export const DebtInputForm = ({
    debtData,
    onDebtChange,
    onShowKprModal,
    onShowKpmModal,
}: DebtInputFormProps) => {
    return (
        <Card className="p-6 rounded-[2rem] shadow-xl border-white/60 bg-white">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                <BadgeDollarSign className="w-5 h-5 text-brand-600" /> 1. Sisa Utang Keluarga
            </h3>
            <p className="text-xs text-slate-500 mb-6 -mt-2">
                Masukkan sisa pokok utang (outstanding) agar keluarga tidak terbebani cicilan jika terjadi risiko.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Sisa KPR (Rumah)</label>
                        <button type="button" onClick={onShowKprModal} className="text-[9px] font-bold text-brand-600 hover:underline flex items-center gap-1">
                            <Calculator className="w-3 h-3" /> Bantu Hitung
                        </button>
                    </div>
                    <InputGroup name="debtKPR" value={debtData.debtKPR} onChange={onDebtChange} placeholder="0" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Sisa KPM (Kendaraan)</label>
                        <button type="button" onClick={onShowKpmModal} className="text-[9px] font-bold text-brand-600 hover:underline flex items-center gap-1">
                            <Calculator className="w-3 h-3" /> Bantu Hitung
                        </button>
                    </div>
                    <InputGroup name="debtKPM" value={debtData.debtKPM} onChange={onDebtChange} placeholder="0" />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Utang Usaha / Modal</label>
                    <InputGroup name="debtProductive" value={debtData.debtProductive} onChange={onDebtChange} placeholder="0" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Utang Kartu Kredit</label>
                    <InputGroup name="debtConsumptive" value={debtData.debtConsumptive} onChange={onDebtChange} placeholder="0" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Utang Lainnya</label>
                    <InputGroup name="debtOther" value={debtData.debtOther} onChange={onDebtChange} placeholder="0" />
                </div>
            </div>
        </Card>
    );
};