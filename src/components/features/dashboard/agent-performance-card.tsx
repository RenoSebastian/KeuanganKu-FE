"use client";

import { useRouter } from "next/navigation";
import { Users, FileText, Target, Pencil, TrendingUp, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User as UserType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AgentPerformanceCard({ userData }: { userData: UserType | null }) {
    const router = useRouter();

    return (
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.04)] border border-slate-100/80 flex flex-col gap-5 md:gap-6 relative overflow-hidden">

            {/* Latar Belakang Halus (Ambient Light) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            {/* --- HEADER SECTION --- */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 relative z-10">
                <h3 className="text-sm md:text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-emerald-400 rounded-full" />
                    Kinerja Bulan Ini
                </h3>
                <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100/50 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                    LIVE
                </div>
            </div>

            {/* --- STATS GRID (BENTO MINI CARDS) --- */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 relative z-10">

                {/* Stat 1: Total Klien */}
                <div className="group relative overflow-hidden bg-linear-to-b from-blue-50/50 to-white p-4 md:p-5 rounded-2xl border border-blue-100/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/5 hover:-translate-y-1">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-100/50 rounded-full blur-xl transition-transform group-hover:scale-150" />
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-[0.8rem] flex items-center justify-center bg-blue-100 text-blue-600 shadow-inner">
                            <Users className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <TrendingUp className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0" />
                    </div>
                    <div className="relative z-10 mt-3 md:mt-4">
                        <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Total Klien</p>
                        <p className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter">12</p>
                    </div>
                </div>

                {/* Stat 2: Total Report */}
                <div className="group relative overflow-hidden bg-linear-to-b from-orange-50/50 to-white p-4 md:p-5 rounded-2xl border border-orange-100/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-900/5 hover:-translate-y-1">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-orange-100/50 rounded-full blur-xl transition-transform group-hover:scale-150" />
                    <div className="flex justify-between items-start mb-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-[0.8rem] flex items-center justify-center bg-orange-100 text-orange-600 shadow-inner">
                            <FileText className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <TrendingUp className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0" />
                    </div>
                    <div className="relative z-10 mt-3 md:mt-4">
                        <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Total Report</p>
                        <p className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter">45</p>
                    </div>
                </div>

            </div>

            {/* --- GOAL CARD (VIBRANT PREMIUM FINTECH STYLE) --- */}
            <div className="group relative overflow-hidden rounded-[1.2rem] md:rounded-[1.5rem] bg-linear-to-br from-blue-600 via-indigo-600 to-indigo-800 p-5 md:p-6 shadow-xl shadow-indigo-900/20 transition-transform duration-500 hover:scale-[1.02]">

                {/* Holographic Glowing Orbs */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-400/30 rounded-full blur-2xl pointer-events-none transition-transform duration-700 group-hover:scale-150" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl pointer-events-none" />

                {/* Grid Pattern untuk tekstur teknikal */}
                <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '12px 12px' }} />

                <div className="flex justify-between items-start mb-4 md:mb-5 relative z-10">
                    <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm">
                        Target Utama
                    </span>
                    <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
                        <Target className="w-4 h-4 md:w-5 md:h-5 text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
                    </div>
                </div>

                <div className="relative z-10">
                    {userData?.goals ? (
                        <div className="relative">
                            <Quote className="absolute -top-2 -left-2 w-8 h-8 text-white/10 -scale-x-100" />
                            <p className="text-sm md:text-base font-bold text-white leading-relaxed md:leading-normal italic line-clamp-3 pl-2 drop-shadow-sm">
                                "{userData.goals}"
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-4 bg-black/10 rounded-xl border border-white/10 backdrop-blur-sm">
                            <p className="text-[11px] md:text-xs text-indigo-100 mb-3 font-medium">Belum ada target yang ditetapkan.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs bg-white text-indigo-700 border-transparent hover:bg-indigo-50 hover:text-indigo-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 rounded-xl font-bold"
                                onClick={() => router.push('/profile')}
                            >
                                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Set Target Baru
                            </Button>
                        </div>
                    )}
                </div>

                {/* Dekorasi Raksasa Tersembunyi */}
                <Target className="absolute right-0 bottom-0 w-32 h-32 -mr-8 -mb-8 text-white opacity-[0.03] pointer-events-none transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110" />
            </div>

        </div>
    );
}