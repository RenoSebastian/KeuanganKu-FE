import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Share2, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";

// [MODIFIED INTERFACE]
// Mengganti `pdfUrl` menjadi `pdfBlob` agar sesuai dengan 
// Universal Export Engine yang mendelegasikan Blob langsung.
interface DownloadCenterProps {
    pdfBlob: Blob | null;
    mgcToken: string | null;
    filenamePdf: string | null;
    filenameMgc: string | null;
    onDownload: (type: 'PDF' | 'MGC') => void;
}

export function DownloadCenter({
    pdfBlob,
    mgcToken,
    filenamePdf,
    filenameMgc,
    onDownload
}: DownloadCenterProps) {

    // Jangan merender komponen jika belum ada file yang siap
    if (!pdfBlob && !mgcToken) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 p-1.5 rounded-[1.5rem] shadow-md shadow-emerald-500/10"
        >
            <div className="bg-white p-4 md:p-5 rounded-4xl flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Status Indicator */}
                <div className="flex items-center gap-4 w-full">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-black text-slate-800 text-sm md:text-base tracking-tight">Analisa Selesai!</h4>
                        <p className="text-[11px] md:text-xs text-slate-500 font-medium mt-0.5">Sistem telah merakit dokumen. Silakan simpan atau bagikan.</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full md:w-auto justify-end">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownload('MGC')}
                        disabled={!mgcToken}
                        className="h-11 px-4 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-xl font-bold shadow-sm active:scale-95 transition-all"
                        title="Simpan Backup Data Aman (.mgc)"
                    >
                        <FileJson className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">.MGC</span>
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onDownload('PDF')}
                        disabled={!pdfBlob} // [MODIFIED] Memeriksa eksistensi blob
                        className="h-11 px-6 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold shadow-md active:scale-95 transition-all"
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Simpan / Bagikan PDF
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}