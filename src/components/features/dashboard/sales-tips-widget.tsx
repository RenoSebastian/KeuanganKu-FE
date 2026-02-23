"use client";

import { Lightbulb, Sparkles } from "lucide-react";

export function SalesTipsWidget() {
    return (
        // 1. Hapus 'hidden md:block' agar tampil di HP.
        // 2. Gunakan rounded-[1.5rem] hingga [2rem] untuk konsistensi Bento Box dengan elemen lain.
        <div className="group relative w-full overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 p-5 md:p-6 shadow-xl shadow-indigo-900/10 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-indigo-900/20 hover:-translate-y-1">

            {/* =========================================
                AMBIENT GLOW EFFECTS (Pencahayaan Latar)
                ========================================= */}
            {/* Cahaya kuning dari arah lampu (kiri atas) */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none transition-transform duration-700 ease-out group-hover:scale-150 group-hover:bg-yellow-400/30" />

            {/* Cahaya biru di sudut berlawanan untuk kontras kedalaman */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Subtle Grid / Noise Pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

            {/* =========================================
                CONTENT WRAPPER
                ========================================= */}
            <div className="relative z-10 flex flex-col h-full justify-between gap-4 md:gap-5">

                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Ikon Glassmorphism dengan animasi pijar */}
                        <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-[0.8rem] md:rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
                            <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)] animate-pulse" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm md:text-base text-white tracking-wide">
                                Insight Harian
                            </h4>
                            <p className="text-[9px] md:text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
                                Sales Hacks
                            </p>
                        </div>
                    </div>
                    {/* Hiasan Bintang */}
                    <Sparkles className="w-5 h-5 text-slate-500/40 group-hover:text-yellow-400/60 transition-colors duration-500" />
                </div>

                {/* The Tip / Quote Section */}
                <div className="relative pl-4 border-l-[3px] border-yellow-400/30 transition-colors duration-500 group-hover:border-yellow-400">
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                        "Fokuslah pada masalah yang dihadapi klien, bukan produk yang Anda jual. <span className="text-white font-bold drop-shadow-sm">Solusi</span> adalah kunci closing."
                    </p>
                </div>

            </div>
        </div>
    );
}