import { Metadata } from "next";
import { RiskProfileWizard } from "@/components/features/finance/risk-profile/risk-profile-wizard";
import { Separator } from "@/components/ui/separator";
import { Info, PenLine, Sparkles, UserCheck, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
    title: "Analisis Profil Risiko | KeuanganKu Pro",
    description: "Kenali gaya investasi klien untuk strategi proteksi yang logis.",
};

export default function RiskProfilePage() {
    return (
        // 1. DYNAMIC THEMATIC BACKGROUND
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">

            {/* Background Ambient Shapes (Hanya terlihat samar) */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-[120px] pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-cyan-200/30 blur-[100px] pointer-events-none" />

            {/* 2. PWA SAFE CONTAINER */}
            <div className="container mx-auto px-4 sm:px-6 py-6 md:py-10 max-w-4xl space-y-8 relative z-10">

                {/* --- HEADER SECTION --- */}
                <div className="space-y-5 md:space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">

                    {/* Eyebrow Label */}
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 p-1.5 rounded-lg">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                        </div>
                        <span className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em]">
                            Interactive Discovery Tool
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
                        Analisis Profil Risiko
                    </h1>

                    {/* --- NARASI KLIEN (GLASSMORPHISM PANEL) --- */}
                    <div className="relative bg-white/60 backdrop-blur-xl border border-white p-6 md:p-8 shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden group">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] transition-all" />

                        <div className="relative z-10 flex flex-col md:flex-row gap-5 md:gap-6 items-start">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-linear-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0 transform -rotate-6">
                                <UserCheck className="w-6 h-6 md:w-7 md:h-7" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
                                    Halo! Mari Kenali Gaya Investasi Anda.
                                </h2>
                                <p className="text-slate-600 leading-relaxed text-sm md:text-base font-medium">
                                    Kuesioner ini dirancang untuk memahami tingkat kenyamanan Anda terhadap fluktuasi nilai investasi.
                                    Tidak ada jawaban benar atau salah. Hasil ini akan menjadi landasan kami menyusun
                                    <span className="text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded ml-1">strategi perencanaan yang akurat</span> untuk masa depan Anda.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- INSTRUKSI AGEN --- */}
                <div className="animate-in fade-in duration-700 delay-150 flex items-start md:items-center gap-3 px-5 py-3 bg-slate-800 rounded-2xl text-[11px] md:text-xs text-slate-300 font-medium shadow-md">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 md:mt-0" />
                    <p className="leading-relaxed">
                        <span className="font-bold text-white uppercase tracking-wider mr-1">Instruksi Agen:</span>
                        Berikan *device* ini kepada klien untuk pengisian mandiri, atau pandu secara lisan untuk membangun keakraban (*engagement*).
                    </p>
                </div>

                <Separator className="bg-slate-200/60 my-2" />

                {/* --- WIZARD CONTAINER --- */}
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 relative">

                    {/* WIZARD RENDERER */}
                    <div className="bg-white/80 backdrop-blur-md rounded-[2rem] md:rounded-[2.5rem] border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-visible relative z-10">
                        {/* Inner stroke for premium feel */}
                        <div className="absolute inset-0 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100/50 pointer-events-none" />

                        {/* Komponen Wizard Inti */}
                        <RiskProfileWizard />
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div className="text-center space-y-3 pt-12 pb-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
                    <div className="flex justify-center mb-2">
                        <ShieldCheck className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                        Analisis ini menggunakan algoritma standar perencana keuangan profesional.
                    </p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">
                        Powered by <span className="text-indigo-600">KeuanganKu System</span>
                    </p>
                </div>

            </div>
        </div>
    );
}