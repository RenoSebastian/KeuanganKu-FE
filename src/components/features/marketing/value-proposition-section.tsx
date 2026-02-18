"use client";

import React from 'react';
import { BarChart3, Users2, ShieldCheck } from 'lucide-react';

const values = [
    {
        icon: <BarChart3 className="w-8 h-8" />,
        title: "Visualisasi Arus Kas",
        desc: "Tampilkan grafik kebocoran keuangan klien secara instan dan logis.",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        hoverBg: "group-hover:bg-blue-600"
    },
    {
        icon: <Users2 className="w-8 h-8" />,
        title: "Multi-Klien Profiling",
        desc: "Kelola database prospek dan ringkasan diskusi keuangan dalam satu dashboard.",
        color: "text-cyan-600",
        bgColor: "bg-cyan-50",
        hoverBg: "group-hover:bg-cyan-600",
        highlight: true
    },
    {
        icon: <ShieldCheck className="w-8 h-8" />,
        title: "Simulasi Risiko Nyata",
        desc: "Ubah risiko abstrak menjadi angka nyata yang dipahami klien kurang dari 10 menit.",
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
        hoverBg: "group-hover:bg-indigo-600"
    }
];

const ValuePropositionSection = () => {
    return (
        <section className="relative z-20 -mt-24 pb-24">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {values.map((v, i) => (
                        <div
                            key={i}
                            className="relative bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-500 group overflow-hidden"
                        >
                            {v.highlight && (
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-blue-500 to-cyan-500" />
                            )}

                            <div className={cn(
                                "w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500",
                                v.bgColor, v.color, v.hoverBg, "group-hover:text-white group-hover:rotate-6 group-hover:shadow-xl"
                            )}>
                                {v.icon}
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
                                {v.title}
                            </h3>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                {v.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Helper function untuk class merging (asumsi lo pake lib/utils)
import { cn } from "@/lib/utils";

export default ValuePropositionSection;