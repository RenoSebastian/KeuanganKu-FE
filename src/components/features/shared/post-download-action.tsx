"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Download,
    FileText,
    FileCode,
    Check,
    Copy,
    X,
    AlertCircle,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

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

    if (!fileData) return null;

    const isPdf = fileData.filename.toLowerCase().endsWith('.pdf');
    const fileSize = (fileData.file.size / 1024).toFixed(1) + " KB";

    const handleShare = async () => {
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
            setShareError("Gagal membuka sistem penyimpanan. Pastikan browser Anda mengizinkan unduhan.");
        } finally {
            setIsSharing(false);
        }
    };

    const handleCopyName = () => {
        navigator.clipboard.writeText(fileData.filename);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-105 p-0 overflow-hidden border-none bg-transparent shadow-none focus:outline-none">
                {/* 
                   STRATEGI PWA: Menggunakan animasi slide-up dari bawah 
                   dan rounded corners besar agar terasa seperti native iOS/Android sheet 
                */}
                <div className="bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] p-6 pb-10 animate-in slide-in-from-bottom-20 duration-500 shadow-2xl border-t border-slate-100 dark:border-slate-800">

                    {/* Handle Bar (Visual cue untuk pengguna mobile) */}
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8 sm:hidden" />

                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-8 text-center sm:text-left">
                        <div className="w-full sm:w-auto">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                Berhasil Dibuat!
                            </h2>
                            <p className="text-slate-500 text-sm mt-2 font-medium">Klik tombol di bawah untuk menyimpan.</p>
                        </div>
                        <button onClick={onClose} className="absolute right-6 top-6 p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Visual File Card: Fokus pada nama file dan tipe */}
                    <div className="relative group mb-8">
                        <div className="absolute -inset-2 bg-linear-to-r from-emerald-500 to-blue-500 rounded-[2rem] blur-xl opacity-10" />
                        <div className="relative flex items-center p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-[2rem]">
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center mr-4 shadow-sm shrink-0",
                                isPdf ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                            )}>
                                {isPdf ? <FileText size={36} strokeWidth={2.5} /> : <FileCode size={36} strokeWidth={2.5} />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate pr-2">
                                    {fileData.filename}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 text-slate-400">
                                        {isPdf ? 'PDF' : 'MGC'}
                                    </span>
                                    <span className="text-xs text-slate-400 font-bold">{fileSize}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleCopyName}
                                className="p-3 text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                            >
                                {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* 
                        SINGLE ACTION BUTTON (PWA OPTIMIZED)
                        Menggunakan icon Download tapi narasi "Bagikan / Simpan"
                    */}
                    <div className="space-y-4">
                        {shareError && (
                            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[11px] font-bold">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <p>{shareError}</p>
                            </div>
                        )}

                        <Button
                            onClick={handleShare}
                            disabled={isSharing}
                            className={cn(
                                "w-full h-20 rounded-[2rem] text-lg font-black shadow-2xl transition-all active:scale-95 flex items-center justify-between px-8",
                                isSharing
                                    ? "bg-slate-100 text-slate-400"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none"
                            )}
                        >
                            {isSharing ? (
                                <div className="flex items-center gap-3 mx-auto">
                                    <div className="w-6 h-6 border-4 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                                    <span>Menyiapkan...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/20 p-2.5 rounded-xl">
                                            <Download className="w-6 h-6" strokeWidth={3} />
                                        </div>
                                        <div className="text-left">
                                            <span className="block leading-none">Bagikan / Simpan</span>
                                            <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Ke Perangkat Anda</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-6 h-6 opacity-50" />
                                </>
                            )}
                        </Button>

                        {/* Hint for PWA Users */}
                        <div className="flex flex-col items-center gap-2 pt-2">
                            <p className="text-[11px] text-slate-400 text-center font-bold uppercase tracking-tighter leading-relaxed">
                                Fitur simpan ini terintegrasi langsung dengan <br />
                                <span className="text-emerald-600">Sistem Operasi Perangkat Anda</span>
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="text-slate-400 font-bold text-xs hover:bg-transparent"
                            >
                                Selesai
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}