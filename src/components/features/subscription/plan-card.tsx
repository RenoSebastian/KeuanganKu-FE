"use client";

import { motion } from "framer-motion";
import {
    Star, Zap, Gem, Check, Crown,
    Sparkles, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SubscriptionPlan } from "@/services/subscription.service";

interface PlanCardProps {
    plan: SubscriptionPlan;
    index: number;
    currentPlanId: string | undefined;
    onSelect: (plan: SubscriptionPlan) => void;
    variants: any;
}

export function PlanCard({ plan, index, currentPlanId, onSelect, variants }: PlanCardProps) {
    const isActive = plan.id === currentPlanId;

    // Konfigurasi Tier (4-Tier Matrix)
    const tierConfig = [
        {
            icon: <Star size={24} />,
            color: "text-slate-400 bg-slate-50",
            glow: "from-slate-100 to-transparent",
            label: "Basic Entry"
        },
        {
            icon: <Zap size={24} fill="currentColor" />,
            color: "text-blue-600 bg-blue-50",
            glow: "from-blue-100 to-transparent",
            label: "Recommended"
        },
        {
            icon: <Gem size={24} />,
            color: "text-indigo-600 bg-indigo-50",
            glow: "from-indigo-200 to-transparent",
            label: "Professional"
        },
        {
            icon: <Crown size={24} />,
            color: "text-amber-600 bg-amber-50",
            glow: "from-amber-200 to-transparent",
            label: "Enterprise"
        }
    ];

    const currentTier = tierConfig[index] || tierConfig[0];

    return (
        <motion.div
            variants={variants}
            layout
            className={cn(
                "relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-700 border",
                isActive
                    ? "bg-white border-blue-500 shadow-[0_32px_64px_-12px_rgba(59,130,246,0.25)] scale-105 z-20 ring-12 ring-blue-50/50"
                    : "bg-white/80 backdrop-blur-sm border-slate-100 shadow-xl shadow-slate-200/40 hover:border-blue-200 z-10"
            )}
        >
            {/* EFEK ANIMASI GLOW UNTUK PAKET AKTIF */}
            {isActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className={cn("absolute inset-0 rounded-[2.5rem] bg-linear-to-b pointer-events-none", currentTier.glow)}
                />
            )}

            <div className="mb-8 relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-all duration-500",
                        currentTier.color,
                        isActive && "rotate-6 scale-110 shadow-lg shadow-blue-200"
                    )}>
                        {currentTier.icon}
                    </div>

                    {isActive ? (
                        <Badge className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full px-3 py-1.5 animate-pulse shadow-lg shadow-blue-200">
                            <UserCheck size={10} className="mr-1.5" /> Aktif Digunakan
                        </Badge>
                    ) : (
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">{currentTier.label}</span>
                    )}
                </div>

                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
                    {plan.durationMonths === 0 ? "Lifetime Access" : `${plan.durationMonths} Bulan`}
                </p>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{plan.name}</h4>
            </div>

            <div className="space-y-4 mb-12 relative z-10">
                {(plan.price === 0
                    ? ["Akses Kalkulator Dasar", "Laporan dengan Watermark", "Update Harga Manual", "Support Komunitas"]
                    : ["Full Access System Pro", "Laporan Tanpa Watermark", "Update Harga Emas Realtime", "Prioritas Render PDF"]
                ).map((f) => (
                    <div key={f} className="flex items-start gap-3 group">
                        <div className={cn(
                            "mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors",
                            plan.price === 0 ? "bg-slate-100 text-slate-400" : "bg-emerald-100 text-emerald-600"
                        )}>
                            <Check size={10} strokeWidth={4} />
                        </div>
                        <span className={cn(
                            "text-[11px] font-bold tracking-tight transition-colors",
                            isActive ? "text-slate-800" : "text-slate-500"
                        )}>{f}</span>
                    </div>
                ))}
            </div>

            <div className="mt-auto relative z-10">
                <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">
                            {plan.price === 0 ? "Free" : `Rp ${plan.price.toLocaleString('id-ID')}`}
                        </p>
                        {plan.price > 0 && <span className="text-[10px] font-black text-slate-400 uppercase">/Bulan</span>}
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 italic">
                        {plan.price === 0 ? "Selamanya tanpa biaya" : "Nett (Termasuk Biaya Layanan)"}
                    </p>
                </div>

                <Button
                    disabled={isActive}
                    onClick={() => onSelect(plan)}
                    className={cn(
                        "w-full h-15 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                        isActive
                            ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-200 cursor-default opacity-100"
                            : "bg-slate-900 hover:bg-blue-600 text-white shadow-xl active:scale-95"
                    )}
                >
                    {isActive ? (
                        <span className="flex items-center gap-2">Paket Sedang Aktif <Sparkles size={14} className="fill-current" /></span>
                    ) : (
                        "Pilih & Upgrade"
                    )}
                </Button>
            </div>
        </motion.div>
    );
}