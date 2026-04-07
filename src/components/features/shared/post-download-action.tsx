"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Share2,
    Download,
    ExternalLink,
    FileText,
    FileCode,
    Check,
    Copy,
    X,
    AlertCircle
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

    // ====================================================================
    // [TAHAP 1] ENKAPSULASI GARBAGE COLLECTION (Memory Management)
    // ====================================================================
    useEffect(() => {
        // Membersihkan Blob URL dari RAM setiap kali modal ditutup atau file berubah
        // Ini memastikan tidak ada Memory Leak di PWA/Browser tanpa bergantung pada parent component
        return () => {
            if (fileData?.url) {
                window.URL.revokeObjectURL(fileData.url);
            }
        };
    }, [fileData?.url]); // Hanya re-run jika URL pointer berubah

    if (!fileData) return null;

    const isPdf = fileData.filename.toLowerCase().endsWith('.pdf');
    const fileSize = (fileData.file.size / 1024).toFixed(1) + " KB";

    // ====================================================================
    // [TAHAP 3] FILTRASI EXCEPTION PADA WEB SHARE API & CAPABILITY DETECTION
    // ====================================================================
    const handleShare = async () => {
        setIsSharing(true);
        setShareError(null);

        try {
            // Evaluasi aman: Pastikan object navigator mendukung share dan canShare spesifik untuk file
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
                setShareError("Sistem OS memblokir atau tidak mendukung fitur simpan via Share Sheet.");
            }
        } catch (error: any) {
            // Abaikan jika user secara sadar menekan 'Cancel' / 'Back' pada sistem operasi
            if (error.name === 'AbortError' || error.message.includes('abort')) {
                console.log("Share operation was cancelled by user (Normal behavior).");
                return;
            }

            // Catat error sungguhan dan tampilkan ke layar
            console.error("Web Share API Failed:", error);
            setShareError("Terjadi penolakan keamanan saat memanggil menu berbagi sistem.");
        } finally {
            setIsSharing(false);
        }
    };

    const handleCopyName = () => {
        navigator.clipboard.writeText(fileData.filename);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ====================================================================
    // [TAHAP 2] HARDENING DOM MANIPULATION (Fallback / Legacy Download)
    // ====================================================================
    const handleLegacyDownload = () => {
        // 1. Buat elemen
        const link = document.createElement('a');

        // 2. Sembunyikan secara CSS agar aman (Hidden DOM)
        link.style.display = 'none';

        // 3. Set atribut
        link.href = fileData.url;
        link.setAttribute('download', fileData.filename);

        // 4. Inject ke dokumen untuk mematuhi aturan strict security policy browser tertentu
        document.body.appendChild(link);

        // 5. Eksekusi klik simulasi
        link.click();

        // 6. Cleanup instan (Menghapus node)
        document.body.removeChild(link);

        // Catatan: revokeObjectURL kita delegasikan ke useEffect() agar tidak bentrok 
        // jika user belum selesai mengekstrak file namun RAM sudah keburu dihapus.
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-100 p-0 overflow-hidden border-none bg-transparent shadow-none">
                {/* Container Utama dengan Efek Glassmorphism di Mobile/Desktop */}
                <div className="bg-white dark:bg-slate-900 rounded-t-[24px] sm:rounded-[24px] p-6 pb-8 animate-in slide-in-from-bottom-10 duration-300 shadow-2xl">

                    {/* Handle Bar untuk Mobile Look */}
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 sm:hidden" />

                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                                Siap Dikirim!
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">Pilih cara untuk menyimpan dokumen Anda.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Alert Banner for Share Error */}
                    {shareError && (
                        <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-medium mb-6">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <p>{shareError}</p>
                        </div>
                    )}

                    {/* Visual File Card (Immersive UI) */}
                    <div className="relative group mb-8">
                        <div className="absolute -inset-1 bg-linear-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                        <div className="relative flex items-center p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl">
                            <div className={cn(
                                "w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-sm",
                                isPdf ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                            )}>
                                {isPdf ? <FileText size={32} /> : <FileCode size={32} />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                                    {fileData.filename}
                                </p>
                                <p className="text-xs text-slate-400 font-medium">{fileSize} • {isPdf ? 'PDF Document' : 'MGC File'}</p>
                            </div>
                            <button
                                onClick={handleCopyName}
                                className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                            >
                                {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons Stack */}
                    <div className="space-y-3">
                        {/* Primary Action: Share (Paling Nyaman untuk PWA/Mobile) */}
                        <Button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-lg font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-[0.98]"
                        >
                            {isSharing ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Membuka Sistem...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Share2 className="w-5 h-5" />
                                    Bagikan / Simpan ke Perangkat
                                </span>
                            )}
                        </Button>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Secondary: Preview (Hanya PDF) */}
                            {isPdf && (
                                <Button
                                    onClick={() => window.open(fileData.url, '_blank')}
                                    variant="outline"
                                    className="h-12 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50"
                                >
                                    <ExternalLink className="mr-2 w-4 h-4" />
                                    Buka Langsung
                                </Button>
                            )}

                            {/* Secondary: Browser Download */}
                            <Button
                                onClick={handleLegacyDownload}
                                variant="outline"
                                className={cn(
                                    "h-12 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50",
                                    !isPdf && "col-span-2"
                                )}
                            >
                                <Download className="mr-2 w-4 h-4" />
                                Unduh (Browser)
                            </Button>
                        </div>
                    </div>

                    {/* Hint Footer */}
                    <p className="text-[11px] text-slate-400 text-center mt-6 leading-relaxed">
                        Gunakan <strong className="text-slate-500">"Bagikan / Simpan"</strong> untuk menghindari <br /> hilangnya file jika Anda membuka aplikasi ini dari Layar Utama.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}