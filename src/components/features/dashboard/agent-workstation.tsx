"use client";

import { useRouter } from "next/navigation";
import { Calculator, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AgentWorkstation() {
    const router = useRouter();

    const menus = [
        {
            label: "Checkup",
            emoji: "📝",
            href: "/calculator/checkup",
            theme: "bg-cyan-50 border-cyan-100 text-cyan-600 hover:border-cyan-300"
        },
        {
            label: "Anggaran",
            emoji: "🧮",
            href: "/calculator/budget",
            theme: "bg-emerald-50 border-emerald-100 text-emerald-600 hover:border-emerald-300"
        },
        {
            label: "Pendidikan",
            emoji: "🎓",
            href: "/calculator/education",
            theme: "bg-amber-50 border-amber-100 text-amber-600 hover:border-amber-300"
        },
        {
            label: "Hari Tua",
            emoji: "🛡️",
            href: "/calculator/pension",
            theme: "bg-rose-50 border-rose-100 text-rose-600 hover:border-rose-300"
        },
        {
            label: "Proteksi",
            emoji: "☂️",
            href: "/calculator/insurance",
            theme: "bg-purple-50 border-purple-100 text-purple-600 hover:border-purple-300"
        },
        {
            label: "Goals",
            emoji: "🎯",
            href: "/calculator/goals",
            theme: "bg-indigo-50 border-indigo-100 text-indigo-600 hover:border-indigo-300"
        },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">

            {/* Header Mini */}
            <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <Calculator className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Workstation</span>
                </div>
            </div>

            {/* Grid 1x6 (Responsive: Mobile 3x2, Desktop 6x1) */}
            <div className="p-3 grid grid-cols-3 md:grid-cols-6 gap-3">
                {menus.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => router.push(item.href)}
                        className={cn(
                            "group flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
                            item.theme
                        )}
                    >
                        {/* Icon */}
                        <div className="text-2xl drop-shadow-sm transition-transform group-hover:scale-110">
                            {item.emoji}
                        </div>

                        {/* Label */}
                        <span className="text-[10px] md:text-[11px] font-bold text-slate-700 text-center leading-tight">
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}