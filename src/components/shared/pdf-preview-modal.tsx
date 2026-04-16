'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X, Download, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PdfPreviewModalProps {
    isOpen: boolean;
    pdfUrl?: string | null;
    filename?: string;
    mgcToken?: string | null;
    fileSize?: number;
    onClose: () => void;
    onDownload?: (filename: string) => void;
    onShare?: (filename: string, mgcToken?: string) => void;
    isDownloading?: boolean;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
    isOpen,
    pdfUrl,
    filename = 'Document.pdf',
    mgcToken,
    fileSize,
    onClose,
    onDownload,
    onShare,
    isDownloading = false,
}) => {
    const [isLoadingPdf, setIsLoadingPdf] = useState(true);

    // ===========================================================================
    // SIKLUS HIDUP & MANAJEMEN MEMORI (MENCEGAH LOOP & LEAK)
    // ===========================================================================
    useEffect(() => {
        // Setiap kali URL baru masuk, pastikan state kembali ke "loading"
        if (pdfUrl) {
            setIsLoadingPdf(true);
        }

        // CLEANUP: Hapus Blob dari memori RAM saat modal ditutup atau URL berubah
        return () => {
            if (pdfUrl && pdfUrl.startsWith('blob:')) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    // Format file size untuk display
    const formattedFileSize = useMemo(() => {
        if (!fileSize) return 'N/A';
        if (fileSize < 1024) return `${fileSize} B`;
        if (fileSize < 1024 * 1024) return `${(fileSize / 1024).toFixed(1)} KB`;
        return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
    }, [fileSize]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full h-full max-w-4xl max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-slate-900 truncate">{filename}</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {formattedFileSize} • PDF Document
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-900"
                        aria-label="Close preview"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 bg-slate-50 flex items-center justify-center overflow-hidden relative">
                    {pdfUrl ? (
                        <iframe
                            // KEY SANGAT PENTING: Memaksa React mereset iframe sepenuhnya
                            // jika terjadi loop pada native PDF viewer browser
                            key={pdfUrl}
                            // Tambahkan parameter penampil PDF agar UI lebih bersih
                            src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
                            className="w-full h-full border-0 absolute inset-0 z-10"
                            title="PDF Preview"
                            // Hanya gunakan onLoad, hapus onLoadStart yang memicu bug re-render
                            onLoad={() => setIsLoadingPdf(false)}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-3" />
                            <p className="text-sm">Mempersiapkan PDF...</p>
                        </div>
                    )}

                    {/* Loading Overlay */}
                    {isLoadingPdf && pdfUrl && (
                        <div className="absolute inset-0 z-20 bg-slate-50 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                                <p className="text-sm font-medium text-slate-600">Me-render Dokumen...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                        {mgcToken && (
                            <p className="flex items-center gap-2">
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                Backup data (.mgc) tersedia
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="font-medium"
                        >
                            Tutup
                        </Button>

                        {mgcToken && onShare && (
                            <Button
                                variant="outline"
                                onClick={() => onShare(filename, mgcToken)}
                                className="font-medium gap-2"
                                disabled={isDownloading}
                            >
                                <Share2 className="w-4 h-4" />
                                Bagikan Backup
                            </Button>
                        )}

                        {onDownload && (
                            <Button
                                onClick={() => onDownload(filename)}
                                disabled={isDownloading || !pdfUrl}
                                className="font-medium gap-2 bg-cyan-600 hover:bg-cyan-700 text-white"
                            >
                                {isDownloading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                {isDownloading ? 'Mengunduh...' : 'Download PDF'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};