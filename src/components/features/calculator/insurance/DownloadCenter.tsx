"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Share2, FileJson } from "lucide-react";

interface DownloadCenterProps {
    pdfUrl: string | null; // Bertindak sebagai flag ketersediaan data PDF dari Parent
    mgcToken: string | null; // Bertindak sebagai flag ketersediaan data MGC dari Parent
    filenamePdf: string | null;
    filenameMgc: string | null;
    onDownload: (type: 'PDF' | 'MGC') => void;
}

export const DownloadCenter = ({
    pdfUrl,
    mgcToken,
    filenamePdf,
    filenameMgc,
    onDownload
}: DownloadCenterProps) => {
    // Jangan render apa pun jika tidak ada flag indikasi bahwa file siap
    if (!pdfUrl && !mgcToken) return null;

    return (
        <Card className="bg-emerald-50 border-emerald-200 p-4 rounded-xl flex flex-col items-center gap-4 shadow-sm animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="grow">
                    <h4 className="font-bold text-emerald-800 text-sm">Analisa Selesai</h4>
                    <p className="text-xs text-emerald-600">
                        Sistem telah merakit dokumen. Silakan simpan atau bagikan.
                    </p>
                </div>
            </div>

            <div className="flex gap-2 w-full">
                <Button
                    size="sm"
                    onClick={() => onDownload('PDF')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-10 rounded-lg transition-all"
                    disabled={!pdfUrl}
                >
                    <Share2 className="w-4 h-4 mr-2" /> Simpan / Bagikan PDF
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownload('MGC')}
                    className="w-12 h-10 border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-100 rounded-lg transition-all"
                    title="Simpan Backup Data Aman (.mgc)"
                    disabled={!mgcToken}
                >
                    <FileJson className="w-4 h-4" />
                </Button>
            </div>
        </Card>
    );
};