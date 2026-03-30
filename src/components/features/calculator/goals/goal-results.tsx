import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calculator, CheckCircle2, FileJson, Share2 } from "lucide-react"; // Ikon Download diganti dengan Share2
import { GoalSimulationResult } from "@/lib/types";
import { GoalRealityCard } from "./goal-reality-card";
import { GoalSolutionCard } from "./goal-solution-card";
import { GoalStrategyCard } from "./goal-strategy-card";
import { GoalsGuide } from "../guide/goals-guide";

interface GoalResultsProps {
    result: GoalSimulationResult | null;
    targetAmount: number;
    inflation: number;
    returnRate: number;
    generatedFiles: { pdfUrl: string | null, mgcToken: string | null } | null;
    handleDownloadFile: (type: 'PDF' | 'MGC') => void;
}

export function GoalResults({ result, targetAmount, inflation, returnRate, generatedFiles, handleDownloadFile }: GoalResultsProps) {

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { stiffness: 300, damping: 24 } }
    };

    return (
        <div className="lg:col-span-7 space-y-6">
            {!result ? (
                <div className="h-full min-h-125 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-300/60 rounded-[2.5rem] bg-white/40 backdrop-blur-sm animate-in fade-in duration-1000">
                    <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 bg-white">
                        <Calculator className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Kalkulator Siap Beraksi</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-sm font-medium leading-relaxed">
                        Silakan isi data klien dan parameter target di panel kiri, lalu tekan <strong>Jalankan Kalkulasi</strong> untuk melihat rekomendasi sistem.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* BANNER SUKSES & DOWNLOAD (Refactor untuk Web Share API UI) */}
                    {generatedFiles && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 p-1.5 rounded-[1.5rem] shadow-md shadow-emerald-500/10">
                            <div className="bg-white p-4 md:p-5 rounded-4xl flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 w-full">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-slate-800 text-sm md:text-base tracking-tight">Analisa Selesai!</h4>
                                        <p className="text-[11px] md:text-xs text-slate-500 font-medium mt-0.5">Sistem telah merakit dokumen. Silakan simpan atau bagikan.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto justify-end">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDownloadFile('MGC')}
                                        disabled={!generatedFiles.mgcToken}
                                        className="h-11 px-4 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-xl font-bold shadow-sm active:scale-95 transition-all"
                                        title="Simpan Backup Data Aman (.mgc)"
                                    >
                                        <FileJson className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">.MGC</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleDownloadFile('PDF')}
                                        disabled={!generatedFiles.pdfUrl}
                                        className="h-11 px-6 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold shadow-md active:scale-95 transition-all"
                                    >
                                        <Share2 className="w-4 h-4 mr-2" /> Simpan / Bagikan PDF
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* BENTO CARDS */}
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
                        <motion.div variants={itemVariants}>
                            <GoalRealityCard
                                targetAmount={targetAmount}
                                futureTargetAmount={result.futureTargetAmount}
                                inflationRate={inflation}
                                yearsDuration={result.yearsDuration || 0}
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <GoalSolutionCard
                                monthlySaving={result.monthlySaving}
                                totalTarget={result.futureTargetAmount || 0}
                                yearsDuration={result.yearsDuration || 0}
                                returnRate={returnRate}
                                isSurplus={(result.netTarget || 0) <= 0}
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <GoalStrategyCard
                                futureTargetAmount={result.futureTargetAmount || 0}
                                futureExistingFund={result.futureExistingFund || 0}
                                returnRate={returnRate}
                                netTarget={result.netTarget || 0}
                            />
                        </motion.div>
                    </motion.div>
                </div>
            )}
            <GoalsGuide />
        </div>
    );
}