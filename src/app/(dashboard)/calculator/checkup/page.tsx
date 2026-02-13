"use client";

import { Briefcase } from "lucide-react";
import { CheckupWizard } from "@/components/features/finance/checkup-wizard";

/**
 * AGENT CHECKUP PAGE
 * ------------------
 * Halaman ini bertindak sebagai "Container" untuk fitur Financial Checkup Simulator.
 * * Logika Bisnis, State Management, Persistence, dan API Call 
 * telah dienkapsulasi sepenuhnya di dalam component <CheckupWizard />.
 * * Hal ini mencegah duplikasi logic dan mismatch tipe data antara Page dan Component.
 */

export default function AgentCheckupPage() {
    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">

            {/* --- HEADER PAGE --- */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-brand-200 shadow-lg">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-800 leading-none tracking-tight">
                                Agent Simulator
                            </h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                                Financial Checkup v2.0
                            </p>
                        </div>
                    </div>

                    {/* Note: Tombol "Load Data / Import .MGC" dan "Reset" 
                        sudah ditangani secara internal oleh <CheckupWizard /> 
                        sehingga tidak perlu diduplikasi di header ini.
                    */}
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="container max-w-5xl mx-auto px-4 py-8">

                {/* Render Wizard yang sudah "Pintar" (Smart Component).
                    Ia akan otomatis mendeteksi draft tersimpan (Persistence) 
                    dan menangani seluruh flow dari Identitas -> Input -> Hasil.
                */}
                <CheckupWizard />

                {/* Footer Disclaimer */}
                <div className="mt-12 pt-6 border-t border-slate-200 text-center">
                    <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        <strong>Disclaimer:</strong> Hasil simulasi ini adalah indikasi awal kesehatan finansial berdasarkan data yang diinput saat ini.
                        Hasil ini bukan merupakan saran investasi final. Keputusan finansial tetap berada di tangan klien.
                        Sebagai Agen, Anda wajib menjelaskan asumsi yang digunakan dalam perhitungan ini.
                    </p>
                </div>

            </div>
        </div>
    );
}