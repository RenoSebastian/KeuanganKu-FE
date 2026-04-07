"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Download,
    FileText,
    FileCode,
    Check,
    Copy,
    X,
    AlertCircle,
    ArrowRight,
    Sparkles,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface DownloadResultData {
    file: File;
    url: string;
    filename: string;
}

interface PostDownloadActionProps {
    isOpen: boolean;
    onClose: () => void;
    fileData: DownloadResultData | null;
}

export function PostDownloadAction({ isOpen, onClose, fileData }: PostDownloadActionProps) {
    const [isSharing, setIsSharing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [shareError, setShareError] = useState<string | null>(null);

    // Otomatis bersihkan RAM saat modal ditutup
    useEffect(() => {
        return () => {
            if (fileData?.url) {
                window.URL.revokeObjectURL(fileData.url);
            }
        };
    }, [fileData?.url]);

    const isPdf = fileData?.filename.toLowerCase().endsWith('.pdf');
    const fileSize = fileData ? (fileData.file.size / 1024).toFixed(1) + " KB" : "0 KB";

    const handleShare = async () => {
        if (!fileData) return;

        setIsSharing(true);
        setShareError(null);

        try {
            const supportsShare = typeof navigator.share === 'function';
            const supportsCanShare = typeof navigator.canShare === 'function';

            let canShareFile = false;
            if (supportsShare && supportsCanShare) {
                canShareFile = navigator.canShare({ files: [fileData.file] });
            }

            if (supportsShare && canShareFile) {
                await navigator.share({
                    title: 'Simpan Dokumen KeuanganKu',
                    text: `Dokumen ${fileData.filename} siap disimpan.`,
                    files: [fileData.file],
                });
            } else {
                // Fallback otomatis jika Share API gagal (PWA di browser tertentu)
                const link = document.createElement('a');
                link.href = fileData.url;
                link.setAttribute('download', fileData.filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        } catch (error: any) {
            if (error.name === 'AbortError' || error.message.includes('abort')) return;
            setShareError("Gagal membuka sistem penyimpanan. Pastikan perangkat mendukung fitur ini.");
        } finally {
            setIsSharing(false);
        }
    };

    const handleCopyName = () => {
        if (!fileData) return;
        navigator.clipboard.writeText(fileData.filename);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && fileData && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
                    {/* BACKDROP GELAP (Blur) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm cursor-pointer"
                    />

                    {/* MODAL KONTEN */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-6 sm:p-8 max-w-md w-full border border-slate-100 dark:border-slate-800 text-center overflow-hidden"
                    >
                        {/* AMBIENT GLOW EFFECTS */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 dark:bg-blue-400/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />

                        {/* Top Decorative Line */}
                        <div className={cn(
                            "absolute top-0 left-0 w-full h-1.5",
                            isPdf ? "bg-linear-to-r from-rose-500 via-red-400 to-orange-400" : "bg-linear-to-r from-emerald-500 via-teal-400 to-blue-400"
                        )} />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors z-20"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        </button>

                        {/* =========================================
                            ICON CHOREOGRAPHY
                            ========================================= */}
                        <div className="mt-2 mb-6 sm:mb-8 relative mx-auto w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                            {/* Radar Waves Effect */}
                            <div className={cn(
                                "absolute inset-0 border-2 rounded-full animate-ping opacity-30",
                                isPdf ? "border-rose-100 dark:border-rose-900" : "border-emerald-100 dark:border-emerald-900"
                            )} style={{ animationDuration: "2s" }} />
                            <div className={cn(
                                "absolute inset-2 border-2 rounded-full animate-ping opacity-40",
                                isPdf ? "border-red-100 dark:border-red-900" : "border-teal-100 dark:border-teal-900"
                            )} style={{ animationDuration: "2s", animationDelay: "0.5s" }} />

                            {/* Main Icon Container */}
                            <div className={cn(
                                "relative z-10 rounded-[1.5rem] p-4 sm:p-5 shadow-lg border",
                                isPdf ? "bg-linear-to-br from-rose-50 to-white dark:from-rose-950/50 dark:to-slate-900 border-rose-100 dark:border-rose-800"
                                    : "bg-linear-to-br from-emerald-50 to-white dark:from-emerald-950/50 dark:to-slate-900 border-emerald-100 dark:border-emerald-800"
                            )}>
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                >
                                    {isPdf ? (
                                        <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-rose-600 dark:text-rose-400 drop-shadow-sm" />
                                    ) : (
                                        <FileCode className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 dark:text-emerald-400 drop-shadow-sm" />
                                    )}
                                </motion.div>

                                {/* Sparkle Accents */}
                                <motion.div
                                    animate={{ rotate: 180, scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm border border-slate-100 dark:border-slate-700"
                                >
                                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                                </motion.div>
                            </div>
                        </div>

                        {/* =========================================
                            TEXT & STATUS
                            ========================================= */}
                        <div className="mb-6 sm:mb-8">
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight leading-tight">
                                Berhasil Dibuat!
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium px-4">
                                Dokumen Anda telah siap. Silakan simpan ke perangkat Anda untuk akses *offline*.
                            </p>
                        </div>

                        {shareError && (
                            <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] sm:text-xs font-bold mb-6 text-left">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>{shareError}</p>
                            </div>
                        )}

                        {/* Visual File Card */}
                        <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl mb-6 sm:mb-8">
                            <div className="flex items-center overflow-hidden">
                                <div className="flex flex-col items-start overflow-hidden px-2">
                                    <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate max-w-45 sm:max-w-55">
                                        {fileData.filename}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 text-slate-400">
                                            {isPdf ? 'PDF' : 'MGC'}
                                        </span>
                                        <span className="text-[10px] sm:text-xs text-slate-400 font-bold">{fileSize}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleCopyName}
                                className="p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors shrink-0 shadow-sm"
                            >
                                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                            </button>
                        </div>

                        {/* =========================================
                            ACTION BUTTON (PWA OPTIMIZED)
                            ========================================= */}
                        <Button
                            onClick={handleShare}
                            disabled={isSharing}
                            className={cn(
                                "w-full h-16 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem] text-base sm:text-lg font-black shadow-xl transition-all active:scale-95 flex items-center justify-between px-6 sm:px-8",
                                isSharing
                                    ? "bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                                    : "bg-linear-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-200 dark:shadow-none border border-emerald-400 dark:border-none"
                            )}
                        >
                            {isSharing ? (
                                <div className="flex items-center gap-3 mx-auto">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                                    <span>Membuka Sistem...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="bg-white/20 p-2 rounded-xl">
                                            <Download className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
                                        </div>
                                        <div className="text-left">
                                            <span className="block leading-none mb-1">Simpan File</span>
                                            <span className="text-[9px] sm:text-[10px] opacity-80 font-bold uppercase tracking-widest text-emerald-50">Ke Perangkat</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 opacity-50" />
                                </>
                            )}
                        </Button>

                        {/* Footer Warning */}
                        <div className="mt-6 sm:mt-8 flex justify-center items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
                            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                Aman & Terenkripsi
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}