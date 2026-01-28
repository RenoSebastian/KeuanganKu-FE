"use client";

import { useEffect, useState } from "react";
import { Loader2, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PdfLoadingModalProps {
    isOpen: boolean;
    onClose?: () => void; // Opsional, biasanya kita disable close saat loading
}

export function PdfLoadingModal({ isOpen }: PdfLoadingModalProps) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("Memulai permintaan...");

    // Reset state saat modal dibuka
    useEffect(() => {
        if (isOpen) {
            setProgress(0);
            setStatus("Menghubungkan ke server...");

            // SIMULASI PROGRESS BAR (Optimistic UI)
            // Kita jalankan progress sampai 90%, sisanya menunggu respon server
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        setStatus("Finalisasi dokumen PDF...");
                        return 90; // Mentok di 90% sampai data benar-benar diterima
                    }

                    // Update pesan status berdasarkan persentase
                    if (prev === 20) setStatus("Mengumpulkan data finansial...");
                    if (prev === 50) setStatus("Merender grafik & tabel...");
                    if (prev === 75) setStatus("Menyusun halaman PDF...");

                    // Kecepatan progress melambat seiring waktu
                    const increment = prev < 50 ? 5 : 2;
                    return prev + increment;
                });
            }, 800); // Update setiap 800ms

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-100 text-center relative overflow-hidden">

                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-brand-500 via-cyan-400 to-emerald-500 animate-pulse" />

                {/* Icon Animation */}
                <div className="mb-6 relative mx-auto w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 bg-brand-100 rounded-full animate-ping opacity-20"></div>
                    <div className="bg-brand-50 rounded-full p-4 relative z-10">
                        <FileText className="w-10 h-10 text-brand-600 animate-bounce" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                    </div>
                </div>

                {/* Title & Status */}
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Sedang Menyiapkan Laporan
                </h3>
                <p className="text-slate-500 text-sm mb-8 min-h-5 transition-all">
                    {status}
                </p>

                {/* Custom Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-4 mb-3 overflow-hidden relative inner-shadow">
                    <div
                        className="h-full bg-linear-to-r from-brand-600 to-cyan-500 rounded-full transition-all duration-500 ease-out relative"
                        style={{ width: `${progress}%` }}
                    >
                        {/* Shimmer Effect pada Bar */}
                        <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite] -skew-x-12" style={{ transform: 'translateX(-100%)' }}></div>
                    </div>
                </div>

                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Proses</span>
                    <span>{progress}%</span>
                </div>

                <p className="text-[10px] text-slate-400 mt-6 italic">
                    Mohon jangan tutup halaman ini. Proses mungkin memakan waktu hingga 1 menit.
                </p>
            </div>
        </div>
    );
}