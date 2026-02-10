import React from "react";
import { Card } from "@/components/ui/card";
import { Hourglass, Briefcase, Palmtree } from "lucide-react";
import { cn } from "@/lib/utils";

interface PensionTimelineProps {
    currentAge: number;
    retirementAge: number;
    lifeExpectancy: number;
}

export function PensionTimelineCard({
    currentAge,
    retirementAge,
    lifeExpectancy
}: PensionTimelineProps) {
    // 1. Validasi Logika Waktu
    const yearsToWork = Math.max(0, retirementAge - currentAge);
    const yearsRetired = Math.max(0, lifeExpectancy - retirementAge);
    const totalDuration = yearsToWork + yearsRetired;

    // 2. Hitung Persentase Lebar Bar
    // Menghindari pembagian dengan nol jika input tidak valid
    const safeTotal = totalDuration > 0 ? totalDuration : 1;
    const workPercent = Math.round((yearsToWork / safeTotal) * 100);
    const retirePercent = 100 - workPercent;

    return (
        <Card className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <Hourglass className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800">Garis Waktu Kehidupan</h3>
                    <p className="text-xs text-slate-500">Masa produktif vs Masa pensiun</p>
                </div>
            </div>

            {/* TIMELINE VISUAL BAR */}
            <div className="relative h-12 w-full bg-slate-100 rounded-xl overflow-hidden flex mb-4 border border-slate-200">

                {/* Segment 1: Masa Bekerja (Accumulation Phase) */}
                <div
                    className="h-full bg-emerald-500 flex items-center justify-center relative group transition-all duration-500"
                    style={{ width: `${workPercent}%` }}
                >
                    <div className="absolute inset-0 bg-[url('/images/pattern-stripes.png')] opacity-10" />
                    <span className="relative z-10 text-[10px] md:text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> {yearsToWork} Thn
                    </span>

                    {/* Tooltip Hover */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Masa Mengumpulkan Aset
                    </div>
                </div>

                {/* Segment 2: Masa Pensiun (Decumulation Phase) */}
                <div
                    className="h-full bg-blue-500 flex items-center justify-center relative group transition-all duration-500"
                    style={{ width: `${retirePercent}%` }}
                >
                    <div className="absolute inset-0 bg-white/10" />
                    <span className="relative z-10 text-[10px] md:text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <Palmtree className="w-3 h-3" /> {yearsRetired} Thn
                    </span>

                    {/* Tooltip Hover */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Masa Menikmati Aset
                    </div>
                </div>
            </div>

            {/* LEGEND / KETERANGAN */}
            <div className="flex justify-between text-xs font-medium text-slate-500 px-1">
                <div className="text-left">
                    <p>Sekarang</p>
                    <p className="font-bold text-slate-800 text-sm">{currentAge} Thn</p>
                </div>
                <div className="text-center">
                    <p>Pensiun</p>
                    <p className="font-bold text-blue-600 text-sm">{retirementAge} Thn</p>
                </div>
                <div className="text-right">
                    <p>Target Usia</p>
                    <p className="font-bold text-slate-800 text-sm">{lifeExpectancy} Thn</p>
                </div>
            </div>
        </Card>
    );
}