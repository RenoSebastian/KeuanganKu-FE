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
    X
} from "lucide-react";
import { cn } from "@/lib/utils"; // Utilitas Tailwind

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

    if (!fileData) return null;

    const isPdf = fileData.filename.toLowerCase().endsWith('.pdf');
    const fileSize = (fileData.file.size / 1024).toFixed(1) + " KB";

    const handleShare = async () => {
        setIsSharing(true);
        try {
            if (navigator.share && navigator.canShare({ files: [fileData.file] })) {
                await navigator.share({
                    title: 'Simpan Dokumen',
                    files: [fileData.file],
                });
            }
        } catch (error) {
            console.log("Share cancelled or failed");
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
            <DialogContent className="sm:max-w-100 p-0 overflow-hidden border-none bg-transparent shadow-none">
                {/* Container Utama dengan Efek Glassmorphism di Mobile/Desktop */}
                <div className="bg-white dark:bg-slate-900 rounded-t-[24px] sm:rounded-[24px] p-6 pb-8 animate-in slide-in-from-bottom-10 duration-300">

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
                                    Menghubungkan...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Share2 className="w-5 h-5" />
                                    Bagikan Sekarang
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
                                    Pratinjau
                                </Button>
                            )}

                            {/* Secondary: Browser Download */}
                            <Button
                                onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = fileData.url;
                                    a.download = fileData.filename;
                                    a.click();
                                }}
                                variant="outline"
                                className={cn(
                                    "h-12 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50",
                                    !isPdf && "col-span-2"
                                )}
                            >
                                <Download className="mr-2 w-4 h-4" />
                                Simpan Folder
                            </Button>
                        </div>
                    </div>

                    {/* Hint Footer */}
                    <p className="text-[11px] text-slate-400 text-center mt-6 leading-relaxed">
                        Gunakan <span className="font-bold text-slate-500">Bagikan</span> untuk mengirim langsung ke WhatsApp <br /> atau menyimpan ke Cloud Storage Anda.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}