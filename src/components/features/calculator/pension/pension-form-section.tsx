"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { User, Briefcase, MapPin, Calendar, Hourglass, PiggyBank, TrendingUp } from "lucide-react";

interface PensionFormSectionProps {
    clientData: any;
    onClientChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    currentAge: string;
    setCurrentAge: (val: string) => void;
    retirementAge: string;
    setRetirementAge: (val: string) => void;
    lifeExpectancy: string;
    setLifeExpectancy: (val: string) => void;
    currentExpense: string;
    currentSaving: string;
    onMoneyInput: (val: string, setter: (v: string) => void) => void;
    setCurrentExpense: (val: string) => void;
    setCurrentSaving: (val: string) => void;
    inflation: number;
    setInflation: (val: number) => void;
    returnRate: number;
    setReturnRate: (val: number) => void;
    onDataChange: () => void;
}

export function PensionFormSection({
    clientData, onClientChange, currentAge, setCurrentAge,
    retirementAge, setRetirementAge, lifeExpectancy, setLifeExpectancy,
    currentExpense, currentSaving, onMoneyInput, setCurrentExpense, setCurrentSaving,
    inflation, setInflation, returnRate, setReturnRate, onDataChange
}: PensionFormSectionProps) {

    return (
        <div className="space-y-6">
            {/* 1. DATA KLIEN */}
            <Card className="p-6 rounded-[2rem] shadow-xl border-white/60 bg-white">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-600" /> Profil Klien
                </h3>
                <div className="space-y-4">
                    <div>
                        <Label className="text-xs font-semibold text-slate-500">Nama Lengkap <span className="text-rose-500">*</span></Label>
                        <Input name="clientName" placeholder="Contoh: Budi Santoso" value={clientData.clientName} onChange={onClientChange} className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-xs font-semibold text-slate-500">Tanggal Lahir <span className="text-rose-500">*</span></Label>
                            <div className="relative mt-1">
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <Input type="date" name="clientDob" value={clientData.clientDob} onChange={onClientChange} className="pl-9" />
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs font-semibold text-slate-500">Kota Domisili</Label>
                            <div className="relative mt-1">
                                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <Input name="clientCity" placeholder="Bandung" value={clientData.clientCity} onChange={onClientChange} className="pl-9" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs font-semibold text-slate-500">Pekerjaan</Label>
                        <div className="relative mt-1">
                            <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <Input name="clientJob" placeholder="Swasta" value={clientData.clientJob} onChange={onClientChange} className="pl-9" />
                        </div>
                    </div>
                </div>
            </Card>

            {/* 2. PARAMETER PENSIUN */}
            <Card className="p-6 rounded-[2rem] shadow-xl border-white/60 bg-white">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Hourglass className="w-4 h-4 text-brand-600" /> Target Waktu
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Usia Kini <span className="text-rose-500">*</span></Label>
                        <Input type="number" value={currentAge} onChange={e => { setCurrentAge(e.target.value); onDataChange(); }} className="h-12 bg-slate-50 text-center font-bold" />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-indigo-500 uppercase">Usia Pensiun <span className="text-rose-500">*</span></Label>
                        <Input type="number" value={retirementAge} onChange={e => { setRetirementAge(e.target.value); onDataChange(); }} className="h-12 bg-indigo-50 text-center font-bold text-indigo-700" />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">Harapan Hidup <span className="text-rose-500">*</span></Label>
                        <Input type="number" value={lifeExpectancy} onChange={e => { setLifeExpectancy(e.target.value); onDataChange(); }} className="h-12 bg-slate-50 text-center font-bold" />
                    </div>
                </div>

                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2 pt-2 border-t border-slate-50">
                    <PiggyBank className="w-4 h-4 text-brand-600" /> Kondisi Keuangan
                </h3>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-slate-500 uppercase">Biaya Hidup Bulanan (Saat Ini) <span className="text-rose-500">*</span></Label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                            <Input value={currentExpense} onChange={e => onMoneyInput(e.target.value, setCurrentExpense)} className="pl-12 h-12 font-bold text-lg" placeholder="0" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-bold text-emerald-600 uppercase">Aset Pensiun Yang Sudah Ada</Label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-500">Rp</span>
                            <Input value={currentSaving} onChange={e => onMoneyInput(e.target.value, setCurrentSaving)} className="pl-12 h-12 font-bold text-lg border-emerald-200 bg-emerald-50/30 text-emerald-800" placeholder="0" />
                        </div>
                    </div>
                </div>
            </Card>

            {/* 3. ASUMSI EKONOMI */}
            <Card className="p-6 rounded-[2rem] shadow-xl border-white/60 bg-white">
                <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-600" /> Asumsi Ekonomi
                </h3>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                            <span>Inflasi Tahunan</span>
                            <span>{inflation}%</span>
                        </div>
                        <Slider value={inflation} onChange={(v) => { setInflation(v); onDataChange(); }} min={0} max={15} step={0.5} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                            <span>Return Investasi</span>
                            <span>{returnRate}%</span>
                        </div>
                        <Slider value={returnRate} onChange={(v) => { setReturnRate(v); onDataChange(); }} min={0} max={20} step={0.5} />
                    </div>
                </div>
            </Card>
        </div>
    );
}