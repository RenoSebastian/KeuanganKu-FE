import { Quote, User, Loader2, Award } from "lucide-react";
import { User as UserType } from "@/lib/types";

interface AgentHeroCardProps {
    userData: UserType | null;
    loadingUser: boolean;
    quote: string;
}

export function AgentHeroCard({ userData, loadingUser, quote }: AgentHeroCardProps) {
    const displayName = userData?.fullName || "Partner Agen";
    const agentLevel = userData?.agentLevel || "Financial Consultant";
    const agencyName = userData?.agencyName || "Agency Partner";
    const companyName = userData?.companyName || "Mitra Perusahaan";

    return (
        <div className="group/card bg-white rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100 overflow-hidden relative flex flex-col md:flex-row w-full items-stretch transition-all duration-500 hover:shadow-xl hover:shadow-blue-900/5">

            {/* =========================================
          LEFT SIDE: QUOTES & TEXT CONTENT
          Di layar Tablet/PC, ini akan menentukan tinggi card.
          Di layar HP, ini akan berada di bawah foto.
          ========================================= */}
            <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-center relative z-10 order-2 md:order-1 bg-white">

                {/* Latar Belakang Abstrak Halus */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-blue-50 to-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                {/* Ikon Watermark Raksasa */}
                <Quote className="absolute top-4 left-4 w-20 h-20 md:w-28 md:h-28 text-slate-50 -rotate-6 pointer-events-none -z-10 transition-transform duration-700 group-hover/card:-rotate-12 group-hover/card:scale-110" />

                {/* Identitas / Badge Agency */}
                <div className="flex items-center gap-3 mb-5 md:mb-6">
                    <div className="h-1.5 w-6 bg-linear-to-r from-blue-600 to-indigo-600 rounded-full" />
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full border border-blue-100/50 flex items-center gap-1.5">
                        <Award className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        {agencyName}
                    </span>
                </div>

                {/* Tipografi yang diukur presisi agar tidak memakan ruang vertikal berlebih */}
                <h2 className="text-lg md:text-xl lg:text-2xl font-extrabold text-slate-800 mb-6 md:mb-8 leading-relaxed md:leading-snug">
                    "{quote}"
                </h2>

                {/* Footer Motivasi */}
                <div className="flex items-center gap-3 mt-auto">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-indigo-400 group-hover/card:bg-indigo-50 transition-colors">
                        <Quote className="w-4 h-4 fill-indigo-400/20" />
                    </div>
                    <div>
                        <p className="text-xs md:text-sm font-bold text-slate-700">Daily Motivation</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">Semangat melayani nasabah hari ini</p>
                    </div>
                </div>
            </div>

            {/* =========================================
          RIGHT SIDE: FULL BLEED PROFILE SECTION
          Foto tidak lagi ngambang, melainkan mengisi PENUH 
          sisi kanan (PC/Tablet) atau sisi atas (HP).
          ========================================= */}
            <div className="w-full md:w-65 lg:w-[320px] min-h-65 md:min-h-0 relative order-1 md:order-2 shrink-0 bg-slate-100 overflow-hidden border-b md:border-b-0 md:border-l border-slate-200">

                {/* Image Renderer dengan Object-Cover */}
                {loadingUser ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Memuat</span>
                    </div>
                ) : userData?.avatar ? (
                    <img
                        src={userData.avatar}
                        alt="Agen Profile"
                        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-1000 group-hover/card:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-br from-slate-100 to-slate-200">
                        <User className="w-20 h-20 text-slate-300 opacity-50 mb-2" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No Photo</span>
                    </div>
                )}

                {/* Overlay Gradasi Hitam (Agar teks profil selalu terbaca) */}
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/95 via-slate-900/20 to-transparent pointer-events-none" />

                {/* Strip Jabatan Corporate (Menempel di dinding kiri foto) */}
                <div className="absolute top-0 bottom-0 left-0 w-10 md:w-12 bg-slate-900/80 backdrop-blur-md z-20 flex flex-col items-center border-r border-white/10 shadow-[4px_0_15px_rgba(0,0,0,0.2)] py-4">
                    <div className="flex-1 flex items-center justify-center">
                        <span className="text-white/90 font-black tracking-[0.3em] text-[9px] md:text-[10px] -rotate-90 whitespace-nowrap uppercase">
                            {agentLevel}
                        </span>
                    </div>
                    {/* Aksen Garis Modern */}
                    <div className="w-1 h-8 bg-linear-to-t from-blue-500 to-cyan-400 rounded-full" />
                </div>

                {/* Area Nama (Name Tag terintegrasi dengan mulus di pojok kanan bawah) */}
                <div className="absolute bottom-0 right-0 left-10 md:left-12 p-5 z-30 flex flex-col items-end text-right">
                    <p className="text-[9px] font-bold text-blue-300 uppercase tracking-widest leading-none mb-1 shadow-sm">
                        {companyName}
                    </p>
                    <h3 className="text-white font-black text-sm md:text-base uppercase tracking-wider truncate w-full shadow-sm drop-shadow-md">
                        {displayName}
                    </h3>
                </div>

                {/* Indikator Online */}
                <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-slate-900/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-[8px] font-bold text-emerald-50 uppercase tracking-wider">Active</span>
                </div>

            </div>
        </div>
    );
}