"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AgentWorkstation() {
    const router = useRouter();

    // Arsitektur Data: Diperkaya dengan tema warna spesifik (High Cohesion) dan subtitle
    const menus = [
        {
            label: "Analisa Keuangan",
            sub: "Financial Checkup",
            emoji: "📝",
            href: "/finance/checkup",
            theme: {
                blob: "bg-cyan-400/20 group-hover:bg-cyan-400/40",
                iconBg: "bg-cyan-50 border-cyan-100/50 text-cyan-600"
            }
        },
        {
            label: "Rancang Anggaran",
            sub: "Cashflow Bulanan",
            emoji: "🧮",
            href: "/calculator/budget",
            theme: {
                blob: "bg-emerald-400/20 group-hover:bg-emerald-400/40",
                iconBg: "bg-emerald-50 border-emerald-100/50 text-emerald-600"
            }
        },
        {
            label: "Dana Pendidikan",
            sub: "Masa Depan Anak",
            emoji: "🎓",
            href: "/calculator/education",
            theme: {
                blob: "bg-amber-400/20 group-hover:bg-amber-400/40",
                iconBg: "bg-amber-50 border-amber-100/50 text-amber-600"
            }
        },
        {
            label: "Dana Hari Tua",
            sub: "Pensiun Sejahtera",
            emoji: "🛡️",
            href: "/calculator/insurance",
            theme: {
                blob: "bg-rose-400/20 group-hover:bg-rose-400/40",
                iconBg: "bg-rose-50 border-rose-100/50 text-rose-600"
            }
        },
        {
            label: "Rancang Proteksi",
            sub: "Asuransi Jiwa",
            emoji: "☂️",
            href: "/calculator/pension",
            theme: {
                blob: "bg-purple-400/20 group-hover:bg-purple-400/40",
                iconBg: "bg-purple-50 border-purple-100/50 text-purple-600"
            }
        },
        {
            label: "Rencana Khusus",
            sub: "Impian Lainnya",
            emoji: "🎯",
            href: "/calculator/goals",
            theme: {
                blob: "bg-indigo-400/20 group-hover:bg-indigo-400/40",
                iconBg: "bg-indigo-50 border-indigo-100/50 text-indigo-600"
            }
        },
    ];

    return (
        <div className="space-y-5">
            {/* Header Section */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <h3 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-2.5 tracking-tight">
                        <div className="w-1.5 h-6 bg-linear-to-b from-blue-500 to-indigo-600 rounded-full shadow-sm" />
                        Alat Simulasi Klien
                    </h3>
                    <p className="text-[11px] md:text-xs text-slate-500 font-medium mt-1 ml-4">
                        Pilih modul kalkulator untuk sesi konsultasi Anda
                    </p>
                </div>
            </div>

            {/* Grid Layout: 
                - Di HP (Mobile): 2 Kolom agar tombol membesar dan mudah disentuh (Thumb Zone)
                - Di Tablet/Desktop (md): 3 Kolom agar proporsional
            */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 px-1">
                {menus.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => router.push(item.href)}
                        className="
                            group relative overflow-hidden flex flex-col justify-between 
                            text-left p-4 md:p-5 h-36 md:h-40
                            bg-white rounded-[1.5rem] md:rounded-[2rem] 
                            border border-slate-100/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]
                            transition-all duration-300 ease-out
                            hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-slate-200
                            active:scale-[0.96] outline-none
                        "
                    >
                        {/* THEMATIC GLOW BLOB (Cahaya di sudut kanan atas) */}
                        <div className={cn(
                            "absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl transition-all duration-500 ease-out group-hover:scale-[1.5]",
                            item.theme.blob
                        )} />

                        {/* Top Section: Icon & Arrow */}
                        <div className="flex justify-between items-start w-full relative z-10">
                            {/* Kotak Ikon (Squircle) */}
                            <div className={cn(
                                "w-12 h-12 md:w-14 md:h-14 rounded-3xl md:rounded-[1.2rem] flex items-center justify-center text-xl md:text-2xl border shadow-xs transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-3",
                                item.theme.iconBg
                            )}>
                                {item.emoji}
                            </div>

                            {/* Hover Arrow Indicator (Khas Gen Z / Fintech App) */}
                            <div className="w-8 h-8 rounded-full bg-slate-50/50 backdrop-blur-sm flex items-center justify-center border border-slate-100 opacity-0 -translate-x-2 translate-y-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0">
                                <ArrowUpRight className="w-4 h-4 text-slate-600" />
                            </div>
                        </div>

                        {/* Bottom Section: Text Hierarchy */}
                        <div className="relative z-10 mt-4 md:mt-0">
                            <h4 className="text-[12px] md:text-[14px] font-bold text-slate-800 leading-tight mb-0.5 group-hover:text-slate-900 transition-colors">
                                {item.label}
                            </h4>
                            <p className="text-[9px] md:text-[11px] font-medium text-slate-400 group-hover:text-slate-500 transition-colors">
                                {item.sub}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}