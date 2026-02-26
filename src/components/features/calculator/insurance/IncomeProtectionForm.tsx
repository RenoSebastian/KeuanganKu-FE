import React from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider"; // Komponen custom lo
import { InfoPopover } from "@/components/ui/info-popover";
import { Wallet, Calculator } from "lucide-react";
import { InputGroup } from "./InputGroup";

interface IncomeProtectionFormProps {
    annualIncome: string;
    protectionDuration: string;
    inflation: number;
    returnRate: number;
    onAnnualIncomeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onProtectionDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    // UPDATE: Ubah dari number[] ke number sesuai slider.tsx lo
    onInflationChange: (val: number) => void;
    onReturnRateChange: (val: number) => void;
    onShowIncomeModal: () => void;
}

export const IncomeProtectionForm = ({
    annualIncome,
    protectionDuration,
    inflation,
    returnRate,
    onAnnualIncomeChange,
    onProtectionDurationChange,
    onInflationChange,
    onReturnRateChange,
    onShowIncomeModal
}: IncomeProtectionFormProps) => {
    return (
        <Card className="p-6 rounded-[2rem] shadow-xl border-white/60 bg-white">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                <Wallet className="w-5 h-5 text-brand-600" /> 2. Dana Biaya Hidup Keluarga
            </h3>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1 md:col-span-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] font-bold text-brand-600 uppercase">Gaji Bersih Setahun</label>
                            <button
                                type="button"
                                onClick={onShowIncomeModal}
                                className="text-[9px] font-bold text-brand-600 hover:underline flex items-center gap-1"
                            >
                                <Calculator className="w-3 h-3" /> Bantu Hitung
                            </button>
                        </div>
                        <InputGroup
                            value={annualIncome}
                            onChange={onAnnualIncomeChange}
                        />
                        <p className="text-[9px] text-slate-400 ml-1 mt-1">*Total gaji 12 bulan (Take Home Pay)</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Lama Ditanggung</label>
                            <InfoPopover content={{
                                title: "Lama Ditanggung",
                                definition: "Jangka waktu terlama untuk menanggung biaya hidup anggota keluarga (tahun).",
                                example: "Misal: Anak bungsu usia 5 tahun, mandiri usia 22 tahun. Maka lama ditanggung = 17 tahun."
                            }} />
                        </div>
                        <div className="relative group">
                            <Input
                                type="number"
                                placeholder="10"
                                value={protectionDuration}
                                onChange={onProtectionDurationChange}
                                className="h-12 bg-slate-50 text-center font-bold text-slate-800 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 rounded-xl pr-12 pl-4"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Tahun</span>
                        </div>
                    </div>
                </div>

                <div className="bg-brand-50/50 p-5 rounded-xl space-y-6 border border-brand-100/50">
                    <div className="space-y-2">
                        <Slider
                            label="Asumsi Inflasi Tahunan"
                            valueLabel={`${inflation}%`}
                            value={inflation} // Langsung number, bukan array
                            onChange={onInflationChange} // Pakai onChange sesuai slider.tsx lo
                            min={0} max={20} step={0.5}
                            colorClass="accent-rose-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <Slider
                            label="Target Return Investasi"
                            valueLabel={`${returnRate}%`}
                            value={returnRate} // Langsung number, bukan array
                            onChange={onReturnRateChange} // Pakai onChange sesuai slider.tsx lo
                            min={0} max={20} step={0.5}
                            colorClass="accent-emerald-600"
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
};