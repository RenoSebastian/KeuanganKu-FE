"use client";

import { useEffect, useState } from "react";
import { FileText, Sparkles, ServerCrash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PdfLoadingModalProps {
    isOpen: boolean;
    onClose?: () => void;
}

export function PdfLoadingModal({ isOpen }: PdfLoadingModalProps) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("Memulai permintaan...");

    // ===========================================================================
    // 1. ENGINE PROGRES (Hanya bertanggung jawab menaikkan angka)
    // ===========================================================================
    useEffect(() => {
        if (isOpen) {
            setProgress(0);
            setStatus("Menghubungkan ke server...");

            const interval = setInterval(() => {
                setProgress((prev) => {
                    // Mentok di 90% sampai API Backend selesai memproses PDF
                    if (prev >= 90) return 90;

                    // Kecepatan progress melambat seiring waktu untuk UX realistis
                    const increment = prev < 40 ? 5 : prev < 70 ? 3 : 1;
                    return prev + increment;
                });
            }, 600); // Update setiap 600ms

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    // ===========================================================================
    // 2. ENGINE STATUS (Bereaksi murni terhadap perubahan progress) - BEST PRACTICE
    // ===========================================================================
    useEffect(() => {
        if (!isOpen) return;

        // Menggunakan rentang threshold (>=) mencegah bug status terlewat
        if (progress >= 90) {
            setStatus("Finalisasi dokumen PDF...");
        } else if (progress >= 70) {
            setStatus("Menyusun halaman laporan...");
        } else if (progress >= 45) {
            setStatus("Merender grafik & kalkulasi...");
        } else if (progress >= 20) {
            setStatus("Mengumpulkan data finansial...");
        }
    }, [progress, isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* BACKDROP GELAP (Blur) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
                    />

                    {/* MODAL KONTEN */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full border border-slate-100 text-center overflow-hidden"
                    >
                        {/* AMBIENT GLOW EFFECTS */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />

                        {/* Top Decorative Line */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-indigo-500 via-cyan-400 to-emerald-400" />

                        {/* =========================================
                            ICON CHOREOGRAPHY
                            ========================================= */}
                        <div className="mb-8 relative mx-auto w-24 h-24 flex items-center justify-center">
                            {/* Radar Waves Effect */}
                            <div className="absolute inset-0 border-2 border-indigo-100 rounded-full animate-ping opacity-30" style={{ animationDuration: "2s" }} />
                            <div className="absolute inset-2 border-2 border-cyan-100 rounded-full animate-ping opacity-40" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />

                            {/* Main Icon Container */}
                            <div className="relative z-10 bg-linear-to-br from-indigo-50 to-white rounded-[1.5rem] p-5 shadow-lg border border-indigo-100">
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                >
                                    <FileText className="w-10 h-10 text-indigo-600 drop-shadow-sm" />
                                </motion.div>
                                {/* Sparkle Accents */}
                                <motion.div
                                    animate={{ rotate: 180, scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm"
                                >
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                </motion.div>
                            </div>
                        </div>

                        {/* =========================================
                            TEXT & STATUS
                            ========================================= */}
                        <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 tracking-tight">
                            Memproses Laporan
                        </h3>

                        <div className="h-6 mb-6">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={status} // Key menyebabkan animasi reset saat teks berubah
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="text-slate-500 text-sm font-medium"
                                >
                                    {status}
                                </motion.p>
                            </AnimatePresence>
                        </div>

                        {/* =========================================
                            PROGRESS BAR
                            ========================================= */}
                        <div className="w-full bg-slate-100 rounded-full h-3 md:h-4 mb-3 overflow-hidden relative shadow-inner">
                            <motion.div
                                className="h-full bg-linear-to-r from-indigo-500 via-blue-500 to-cyan-400 rounded-full relative"
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: "circOut", duration: 0.5 }}
                            >
                                {/* Shimmer Reflection Inside the Bar */}
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent w-full h-full -skew-x-12 animate-[shimmer_1.5s_infinite]" />
                            </motion.div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                            <span>Status</span>
                            <span className="text-indigo-600">{progress}%</span>
                        </div>

                        {/* Footer Warning */}
                        <div className="mt-8 bg-amber-50/50 border border-amber-100 p-3 rounded-xl flex items-start gap-2 text-left">
                            <ServerCrash className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] md:text-xs text-amber-700/80 font-medium leading-relaxed">
                                Mohon jangan menutup halaman atau merefresh *browser* hingga unduhan selesai.
                            </p>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}