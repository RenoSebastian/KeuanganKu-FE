"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Briefcase, ArrowRight, Sparkles, CreditCard, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const HeroSection = () => {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            // Dibiarkan tanpa background agar menyatu dengan global ambient mesh di page.tsx
            className="relative min-h-[90vh] flex items-center pt-20 pb-32 lg:pt-32 lg:pb-52 overflow-hidden"
        >

            {/* BACKGROUND LAYER - Optimized for Seamless Glass Theme */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Image
                    src="/images/orang.png"
                    alt="Agent Consulting"
                    fill
                    className="object-cover object-[75%] md:object-center opacity-[0.85]"
                    priority
                />
                {/* Diperbaiki: 
                  1. Menggunakan bg-gradient-to-* yang merupakan standar Tailwind.
                  2. Memakai white/60 dan white/30 agar tidak memblokir warna blob dari belakang, 
                     tetapi tetap memberikan kontras yang cukup untuk teks.
                */}
                <div className="absolute inset-0 bg-linear-to-r from-white/80 via-white/50 to-transparent md:from-white/60 md:via-white/20 md:to-transparent backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-linear-to-t from-slate-50/80 via-transparent to-transparent opacity-90" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl">

                    {/* BADGE - Animated */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-xl shadow-blue-500/20 border border-blue-400/30"
                    >
                        <Sparkles className="w-3 h-3" />
                        Professional Agent Toolkit
                    </motion.div>

                    {/* MAIN TITLE */}
                    <motion.h1
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.95] md:leading-none"
                    >
                        Bantu Klien <span className="text-blue-600">Menjelaskan,</span> <br />
                        <span className="relative inline-block mt-2">
                            {/* Diperbaiki: bg-linear-to-r menjadi bg-gradient-to-r */}
                            <span className="relative z-10 text-transparent bg-clip-text bg-linear-to-r from-blue-700 via-blue-600 to-indigo-500">
                                Bukan Meyakinkan.
                            </span>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1, delay: 1 }}
                                className="absolute -bottom-2 left-0 h-3 bg-blue-200/50 -z-10 rounded-full"
                            />
                        </span>
                    </motion.h1>

                    {/* DESKRIPSI */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="relative max-w-2xl mb-12"
                    >
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-blue-600 rounded-full" />
                        <p className="pl-6 text-lg md:text-2xl text-slate-700 leading-relaxed font-medium italic">
                            <span className="text-slate-900 font-bold">Alat bantu visual profesional</span> untuk agen asuransi.
                            Memetakan kondisi keuangan klien secara transparan dan
                            <span className="text-blue-600 font-bold"> mengubah skema proteksi menjadi kebutuhan nyata.</span>
                        </p>
                    </motion.div>

                    {/* CTA BUTTONS */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="flex flex-col sm:flex-row items-center gap-5"
                    >
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full h-18 px-12 text-xl rounded-2xl bg-slate-900 hover:bg-blue-600 shadow-2xl shadow-slate-900/30 transition-all duration-300 font-black group">
                                Mulai Konsultasi <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        </Link>

                        <Link href="#features" className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="w-full h-18 px-10 text-lg rounded-2xl bg-white/40 backdrop-blur-xl border border-white/50 hover:border-blue-400 hover:bg-white/60 text-slate-800 hover:text-blue-700 transition-all font-bold shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                Pelajari Fitur
                            </Button>
                        </Link>
                    </motion.div>

                </div>
            </div>

            {/* --- SMART FLOATING SUBSCRIBE BUTTON --- */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute bottom-20 right-10 hidden xl:block z-30"
            >
                <Link href="/pricing" className="group">
                    <div className={cn(
                        "flex items-center gap-5 bg-white/70 backdrop-blur-2xl p-2 pr-8 rounded-[2.5rem]",
                        "border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.05)]",
                        "hover:shadow-[0_20px_60px_rgba(37,99,235,0.15)] hover:border-blue-300 hover:-translate-y-2",
                        "transition-all duration-500 ease-out cursor-pointer"
                    )}>
                        {/* Icon Container with Pulse Effect */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20 group-hover:opacity-40" />
                            {/* Diperbaiki: bg-linear-to-tr menjadi bg-gradient-to-tr */}
                            <div className="relative w-14 h-14 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/40 group-hover:rotate-12 transition-transform duration-500">
                                <Zap size={24} fill="currentColor" />
                            </div>
                        </div>

                        {/* Text Label */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em]">Ambil manfaat sekarang</span>
                            </div>
                            <p className="text-base font-black text-slate-900 leading-tight">
                                Langganan Sekarang
                            </p>
                        </div>

                        {/* Arrow Hover Visual */}
                        <div className="ml-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            <ChevronRight size={18} strokeWidth={3} />
                        </div>
                    </div>
                </Link>
            </motion.div>
        </motion.section>
    );
};

// Helper component for internal use
const ChevronRight = ({ size, strokeWidth }: { size: number, strokeWidth: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
);

export default HeroSection;