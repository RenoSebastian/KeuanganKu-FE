"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileJson, CheckCircle2, AlertCircle } from "lucide-react";
import { PensionTimelineCard } from "./pension-timeline-card";
import { PensionSolutionCard } from "./pension-solution-card";
import { PensionRealityCard } from "./pension-reality-card";
import { PensionSimulationResult } from "@/lib/types";

interface PensionResultSectionProps {
    result: PensionSimulationResult;
    generatedFiles: any;
    onDownload: (type: 'PDF' | 'MGC') => void;
    currentAge: number;
    retirementAge: number;
    lifeExpectancy: number;
    currentMonthlyExpense: number;
    currentSaving: number;
    returnRate: number;
}

export function PensionResultSection({
    result, generatedFiles, onDownload,
    currentAge, retirementAge, lifeExpectancy,
    currentMonthlyExpense, currentSaving, returnRate
}: PensionResultSectionProps) {
    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
            {/* 1. DOWNLOAD CENTER */}
            {generatedFiles && (
                <Card className="bg-emerald-50 border-emerald-200 p-4 rounded-xl flex flex-col items-center gap-4 shadow-sm">
                    <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="grow">
                            <h4 className="font-bold text-emerald-800 text-sm">Analisa Selesai</h4>
                            <p className="text-xs text-emerald-600">Dokumen siap diunduh.</p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full">
                        <Button size="sm" onClick={() => onDownload('PDF')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-10 rounded-lg">
                            <Download className="w-4 h-4 mr-2" /> Download PDF
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onDownload('MGC')} className="w-12 h-10 border-emerald-300 text-emerald-700 bg-white">
                            <FileJson className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>
            )}

            {/* 2. TIMELINE CARD */}
            <PensionTimelineCard
                currentAge={currentAge}
                retirementAge={retirementAge}
                lifeExpectancy={lifeExpectancy}
            />

            {/* 3. SOLUTION CARD */}
            <PensionSolutionCard
                monthlySaving={result.monthlySaving}
                totalFundNeeded={result.totalFundNeeded}
                shortfall={result.shortfall}
                returnRate={returnRate}
                isSafe={result.shortfall <= 0}
            />

            {/* 4. REALITY CHECK */}
            <PensionRealityCard
                data={result}
                currentMonthlyExpense={currentMonthlyExpense}
                currentSaving={currentSaving}
            />

            {/* 5. NOTES */}
            <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex gap-4 items-start">
                <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-1 shrink-0"><AlertCircle className="w-5 h-5" /></div>
                <div>
                    <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Penting Diingat</h4>
                    <p className="text-sm text-blue-800 leading-relaxed font-medium">
                        Perhitungan ini menggunakan asumsi bunga majemuk (compound interest). Semakin awal memulai, semakin ringan beban tabungan bulanan.
                    </p>
                </div>
            </div>
        </div>
    );
}