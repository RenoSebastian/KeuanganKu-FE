import React from "react";
import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/lib/financial-math";
import { HeartHandshake, Landmark, Skull, CalendarClock, ShieldAlert } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ResultCardProps {
    incomeReplacement: number;
    annualExpense: number;
    duration: number;
    debtClearance: number;
    existingDebt: number;
    finalExpense: number;
}

export function InsuranceResultCard({
    incomeReplacement,
    annualExpense,
    duration,
    debtClearance,
    existingDebt,
    finalExpense
}: ResultCardProps) {
    return (
        <div className="space-y-6"> {/* [FIX] Menggunakan stack vertikal, bukan grid kolom */}

            {/* HEADER SECTION */}
            <div className="flex items-center gap-2 mb-2 px-1">
                <div className="h-6 w-1 bg-slate-800 rounded-full"></div>
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
                    Rincian Kebutuhan Dana
                </h3>
            </div>

            {/* --- PILAR A: INCOME REPLACEMENT (Living Cost) --- */}
            <Card className="relative overflow-hidden rounded-3xl border-0 shadow-lg bg-linear-to-br from-white to-cyan-50/50 hover:shadow-xl transition-all duration-300 group">
                {/* Left Accent Bar */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500" />

                <div className="p-6 pl-8"> {/* Padding left lebih besar untuk accent */}

                    {/* Top Row: Icon + Title + Hero Number */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center text-cyan-600 shadow-inner">
                                <HeartHandshake className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-slate-800">Dana Kehidupan</h4>
                                <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-700 text-[10px] font-bold uppercase tracking-wide mt-1">
                                    Pilar A - Income Replacement
                                </div>
                            </div>
                        </div>

                        {/* Hero Number (Total) */}

                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto bg-white/60 sm:bg-transparent p-4 sm:p-0 rounded-xl border border-white sm:border-0">
                        <p className="text-[10px] uppercase font-bold text-cyan-600 tracking-widest mb-1">
                            Total Biaya Pengganti Penghasilan
                        </p>
                        <p className="text-3xl font-black text-slate-800 tracking-tight">
                            {formatRupiah(incomeReplacement)}
                        </p>
                    </div>

                    {/* Middle Row: Breakdown Details */}
                    <div className="bg-white rounded-xl border border-cyan-100 p-4 space-y-3 shadow-sm">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 flex items-center gap-2">
                                <CalendarClock className="w-4 h-4 text-cyan-400" />
                                Biaya Hidup / Tahun
                            </span>
                            <span className="font-bold text-slate-700">{formatRupiah(annualExpense)}</span>
                        </div>

                        <Separator className="bg-slate-100" />

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                                Durasi Proteksi
                            </span>
                            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                                {duration} Tahun
                            </span>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <p className="text-[10px] text-slate-400 mt-3 italic text-right flex justify-end gap-1 items-center">
                        <ShieldAlert className="w-3 h-3" />
                        *Dana diinvestasikan (SBN/Deposito) agar bunganya menggantikan gaji bulanan.
                    </p>
                </div>
            </Card>

            {/* --- PILAR B: DEBT & FINAL EXPENSE (Liability) --- */}
            <Card className="relative overflow-hidden rounded-3xl border-0 shadow-lg bg-linear-to-br from-white to-rose-50/50 hover:shadow-xl transition-all duration-300 group">
                {/* Left Accent Bar */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />

                <div className="p-6 pl-8">

                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
                                <Landmark className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-slate-800">Dana Pelunasan</h4>
                                <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wide mt-1">
                                    Pilar B - Debt Clearance
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Number */}
                    <div className="text-left sm:text-right w-full sm:w-auto bg-white/60 sm:bg-transparent p-4 sm:p-0 rounded-xl border border-white sm:border-0">
                        <p className="text-[10px] uppercase font-bold text-rose-600 tracking-widest mb-1">
                            Total Biaya Segera
                        </p>
                        <p className="text-3xl font-black text-slate-800 tracking-tight">
                            {formatRupiah(debtClearance)}
                        </p>
                    </div>

                    {/* Breakdown Details */}
                    <div className="bg-white rounded-xl border border-rose-100 p-4 space-y-3 shadow-sm">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-400" />
                                Total Sisa Hutang
                            </span>
                            <span className="font-bold text-slate-700">{formatRupiah(existingDebt)}</span>
                        </div>

                        <Separator className="bg-slate-100" />

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 flex items-center gap-2">
                                <Skull className="w-4 h-4 text-rose-400" />
                                Biaya Pemakaman
                            </span>
                            <span className="font-bold text-slate-700">{formatRupiah(finalExpense)}</span>
                        </div>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-3 italic text-right flex justify-end gap-1 items-center">
                        <ShieldAlert className="w-3 h-3" />
                        *Dana ini harus cair tunai (Lumpsum) segera setelah risiko terjadi.
                    </p>
                </div>
            </Card>

        </div>
    );
}