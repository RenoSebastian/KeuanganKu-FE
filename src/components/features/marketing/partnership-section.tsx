"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowUpRight, Sparkles } from 'lucide-react';

const PartnershipSection = () => {
    return (
        <section className="relative py-16 lg:py-24 z-10" id="partnership">
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* SISI KIRI: THE LOGO DISPLAY (Thick Frosted Glassmorphism) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative perspective-1000"
                    >
                        {/* THE GLASS CARD: Ketebalan maksimal dengan inset shadow dan border-2 */}
                        <div className="relative bg-white/50 backdrop-blur-3xl rounded-[3rem] p-12 border-2 border-white/70 shadow-[0_30px_60px_rgba(0,0,0,0.08)] overflow-hidden group">

                            {/* Pendar cahaya internal agar kaca terasa tebal dan bereaksi terhadap cahaya */}
                            <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-white/60 blur-[60px] rounded-full pointer-events-none" />

                            {/* Grainy Texture Overlay untuk material feel yang realistis */}
                            <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                            <div className="flex flex-col items-center gap-12 relative z-10">
                                {/* Badge Kaca Tipis */}
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-blue-700 bg-white/60 backdrop-blur-md border border-white/80 px-5 py-2.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
                                    <Sparkles size={12} className="text-blue-500 animate-pulse" />
                                    Verified Ecosystem
                                </span>

                                <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full">
                                    {/* LOGO 1: Tanpa Grayscale, langsung berwarna */}
                                    <div className="group/logo relative">
                                        <Image
                                            src="/images/maxipro.webp"
                                            alt="Maxipro"
                                            width={160}
                                            height={80}
                                            className="object-contain transition-transform duration-500 group-hover/logo:scale-110 drop-shadow-md"
                                        />
                                    </div>

                                    {/* Separator Line: Dibuat seperti ukiran di dalam kaca */}
                                    <div className="h-px w-20 md:w-px md:h-20 bg-slate-300/60 shadow-[1px_1px_0_rgba(255,255,255,0.8)]" />

                                    {/* LOGO 2: Tanpa Grayscale, langsung berwarna */}
                                    <div className="group/logo relative">
                                        <Image
                                            src="/images/logogeocitra.png"
                                            alt="Geocitra"
                                            width={180}
                                            height={180}
                                            className="object-contain transition-transform duration-500 group-hover/logo:scale-110 drop-shadow-lg"
                                        />
                                    </div>
                                </div>

                                <p className="text-slate-600 text-sm font-bold italic text-center drop-shadow-sm">
                                    Bersama membangun standar baru industri asuransi
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* SISI KANAN: TEXT (Typography Focus) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold mb-8 uppercase tracking-widest shadow-lg shadow-slate-900/10">
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                            Strategic Partnership
                        </div>

                        <h2 className="text-4xl md:text-6xl font-[1000] text-slate-900 mb-8 leading-[1.1] tracking-tighter">
                            Membangun Kepercayaan Klien <br />
                            <span className="relative inline-block mt-2">
                                {/* Diperbaiki: bg-linear-to-* menjadi bg-gradient-to-* */}
                                <span className="relative z-10 text-transparent bg-clip-text bg-linear-to-r from-blue-700 via-blue-600 to-cyan-500 drop-shadow-sm">
                                    Melalui Pendekatan Berbasis Data
                                </span>
                                <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-200/60 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 25 0 50 5 T 100 5" stroke="currentColor" strokeWidth="8" fill="transparent" />
                                </svg>
                            </span>
                        </h2>

                        <div className="space-y-8">
                            <p className="text-xl text-slate-700 leading-relaxed font-medium">
                                <strong className="text-blue-700 font-black">KeuanganKu</strong> adalah alat bantu konsultasi yang dirancang khusus untuk agen asuransi profesional lintas perusahaan.
                            </p>

                            {/* THE QUOTE BOX: Diselaraskan menjadi Thick Frosted Glass */}
                            <div className="relative bg-white/60 backdrop-blur-2xl p-8 rounded-[2rem] border-2 border-white/80 shadow-[0_20px_40px_rgba(0,0,0,0.05)] overflow-hidden">
                                {/* Aksen gradient sangat halus di pojok quote */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 blur-2xl rounded-full pointer-events-none" />

                                <p className="relative z-10 text-lg text-slate-700 leading-relaxed font-medium italic">
                                    "Aplikasi ini membantu Anda beralih dari <strong className="text-slate-900 font-black uppercase tracking-tight">selling</strong> ke <strong className="text-blue-700 font-black uppercase tracking-tight">consulting</strong>, membuat diskusi asuransi menjadi kebutuhan logis bagi klien."
                                </p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default PartnershipSection;