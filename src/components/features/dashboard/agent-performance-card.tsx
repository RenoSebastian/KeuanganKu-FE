"use client";

import { useRouter } from "next/navigation";
import { FileText, Target, Pencil, ChevronRight, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User as UserType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AgentPerformanceCard({ userData }: { userData: UserType | null }) {
    const router = useRouter();

    // Data Binding
    const subscriptionName = userData?.subscription?.plan?.name || "Free";
    const totalSimulations = userData?._count?.simulationLogs || 0;
    const hasGoal = !!userData?.goals;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">

            {/* --- HEADER: Simple & Clean --- */}
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md">
                        <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Performance</span>
                </div>
                {/* Status Badge Kecil */}
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                    LIVE
                </span>
            </div>

            <div className="p-4 flex flex-col gap-3">

                {/* --- STATS SECTION: List Style (Atas Bawah) --- */}
                {/* Layout ini memberikan ruang horizontal maksimal untuk konten */}

                {/* ITEM 1: Subscription Status */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                            <Crown className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Paket Saat Ini</span>
                            {/* Font size wajar, tidak raksasa */}
                            <span className="text-sm font-bold text-slate-800">{subscriptionName}</span>
                        </div>
                    </div>
                    {/* Visual Indicator Status Active */}
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                </div>

                {/* ITEM 2: Total Report */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Simulasi</span>
                            <span className="text-sm font-bold text-slate-800">{totalSimulations} Simulasi</span>
                        </div>
                    </div>
                </div>

                {/* --- GOAL SECTION: Compact --- */}
                <div className="mt-1">
                    {hasGoal ? (
                        <div className="group relative overflow-hidden rounded-lg bg-slate-900 p-3 flex items-start gap-3 transition-all hover:shadow-md">
                            <div className="shrink-0 mt-0.5">
                                <Target className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-slate-400 font-medium uppercase mb-0.5">Target Utama</p>
                                <p className="text-xs text-slate-100 italic leading-relaxed line-clamp-2">
                                    "{userData?.goals}"
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                                onClick={() => router.push('/profile')}
                            >
                                <Pencil className="w-3 h-3" />
                            </Button>
                        </div>
                    ) : (
                        <button
                            onClick={() => router.push('/profile')}
                            className="w-full py-3 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-slate-50 hover:border-slate-400 transition-all group"
                        >
                            <span className="text-xs font-medium text-slate-500 group-hover:text-slate-700">Belum ada target</span>
                            <div className="flex items-center text-[10px] text-blue-600 font-bold">
                                <Pencil className="w-3 h-3 mr-1" />
                                Set Target Sekarang
                            </div>
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}