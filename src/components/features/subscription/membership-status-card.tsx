"use client";

import { motion } from "framer-motion";
import {
    Crown, ShieldCheck, Calendar, Zap,
    CheckCircle2, AlertCircle, Sparkles, ArrowUpRight, User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MembershipStatusCardProps {
    isPro: boolean;
    planName: string;
    avatar?: string; // Menambahkan prop avatar
    endDate?: string;
    variants: any;
}

export function MembershipStatusCard({ isPro, planName, avatar, endDate, variants }: MembershipStatusCardProps) {
    const daysRemaining = endDate ? Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return (
        <motion.div
            variants={variants}
            className="relative group overflow-hidden rounded-[2.5rem] p-[1.5px] transition-all duration-500 shadow-2xl shadow-blue-900/10"
        >
            {/* Animated Border Gradient - Hanya aktif jika PRO */}
            <div className={cn(
                "absolute inset-0 bg-linear-to-r transition-all duration-500",
                isPro ? "from-indigo-500 via-purple-500 to-blue-500 animate-gradient-x" : "from-slate-200 via-slate-100 to-slate-200"
            )} />

            <div className="relative bg-white/90 backdrop-blur-2xl rounded-[2.45rem] overflow-hidden">
                <div className="p-6 md:p-10 flex flex-col lg:flex-row items-center lg:items-stretch gap-8 md:gap-10 relative z-10">

                    {/* AVATAR SECTION - Merombak Icon menjadi Foto Profil */}
                    <div className="relative shrink-0">
                        <div className={cn(
                            "w-28 h-28 md:w-36 md:h-36 rounded-[2.2rem] overflow-hidden flex items-center justify-center shadow-2xl relative transition-all duration-500 group-hover:rotate-2 border-4",
                            isPro ? "border-slate-900 shadow-indigo-500/20" : "border-white shadow-slate-200"
                        )}>
                            {avatar ? (
                                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                    <User size={48} />
                                </div>
                            )}

                            {/* Efek Overlay Putar khusus Pro */}
                            {isPro && (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-[3px] border-dashed border-indigo-400/40 rounded-[2rem] scale-90 pointer-events-none"
                                />
                            )}
                        </div>

                        {/* Badge Ikon Mengambang */}
                        <div className={cn(
                            "absolute -top-2 -right-2 p-2 rounded-xl shadow-lg border-4 border-white animate-bounce-subtle z-20",
                            isPro ? "bg-indigo-600 text-white" : "bg-slate-400 text-white"
                        )}>
                            {isPro ? <Crown size={16} /> : <ShieldCheck size={16} />}
                        </div>
                    </div>

                    {/* Content Section (Tetap sama, hanya penyesuaian font) */}
                    <div className="flex-1 flex flex-col justify-center text-center lg:text-left min-w-0 w-full">
                        <div className="flex flex-col md:flex-row items-center lg:items-start gap-3 mb-4">
                            <Badge className={cn(
                                "px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-[0.15em] border-none shadow-sm",
                                isPro ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                            )}>
                                {isPro ? "Premium Tier" : "Free Explorer"}
                            </Badge>
                            {isPro && (
                                <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                    <CheckCircle2 size={12} /> Account Verified
                                </div>
                            )}
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight mb-4 truncate">
                            {planName}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mx-auto lg:mx-0">
                            {isPro && endDate ? (
                                <div className="flex items-center gap-4 bg-indigo-50/50 border border-indigo-100 p-4 rounded-[1.5rem]">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                                        <Calendar size={18} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valid Until</p>
                                        <p className="text-xs font-bold text-slate-700">{new Date(endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 bg-amber-50/50 border border-amber-100 p-4 rounded-[1.5rem]">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                                        <AlertCircle size={18} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Limitasi Akun</p>
                                        <p className="text-xs font-bold text-slate-700 italic">Beberapa Fitur Terkunci</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-[1.5rem]">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm shrink-0">
                                    <Zap size={18} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Support Level</p>
                                    <p className="text-xs font-bold text-slate-700">{isPro ? "Priority (24/7)" : "Standard SLA"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}