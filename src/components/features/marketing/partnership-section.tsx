"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowUpRight, Sparkles } from 'lucide-react';

const PartnershipSection = () => {
    return (
        <section className="relative py-16 lg:py-24 z-10 overflow-hidden" id="partnership">
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* SISI KIRI: THE LOGO DISPLAY (Heavy Sandblasted Frosted Glass dengan Border Tegas) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        {/* THE SECRET SAUCE: Siluet warna di belakang kaca */}
                        <div className="absolute top-[20%] left-[10%] w-[60%] h-[60%] bg-blue-500/30 rounded-full blur-[60px] pointer-events-none -z-10" />
                        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-[50px] pointer-events-none -z-10" />

                        {/* PERBAIKAN BORDER: 
                           1. border-2 (Dipertebal)
                           2. border-slate-400/60 (Warnanya digelapkan menjadi abu-abu silver agar batas card terlihat jelas)
                           3. Shadow luar dinaikkan intensitasnya agar card lebih "mengambang"
                        */}
                        <div className="relative bg-white/20 backdrop-blur-3xl rounded-[3.5rem] p-12 lg:p-16 border-2 border-slate-400/60 shadow-[0_30px_60px_rgba(0,0,0,0.15)] overflow-hidden group">

                            {/* Efek Cahaya Internal */}
                            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-white/40 blur-[70px] rounded-full pointer-events-none" />

                            {/* Grainy Texture */}
                            <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                            <div className="flex flex-col items-center gap-14 relative z-10">
                                {/* Badge Kaca Tipis dengan border yang juga disesuaikan */}
                                <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-blue-800 bg-white/60 backdrop-blur-md border border-slate-300/80 px-6 py-3 rounded-full shadow-sm">
                                    <Sparkles size={12} className="text-blue-600 animate-pulse" />
                                    Verified Ecosystem
                                </span>

                                <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full">
                                    <div className="group/logo relative">
                                        <Image
                                            src="/images/maxipro.webp"
                                            alt="Maxipro"
                                            width={150}
                                            height={75}
                                            className="object-contain transition-transform duration-500 group-hover/logo:scale-110 drop-shadow-md"
                                        />
                                    </div>

                                    {/* Separator */}
                                    <div className="h-px w-24 md:w-px md:h-20 bg-slate-300 shadow-[1px_1px_0_rgba(255,255,255,0.8)]" />

                                    <div className="group/logo relative">
                                        <Image
                                            src="/images/logogeocitra.png"
                                            alt="Geocitra"
                                            width={170}
                                            height={170}
                                            className="object-contain transition-transform duration-500 group-hover/logo:scale-110 drop-shadow-lg"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-slate-800 text-sm font-black italic text-center tracking-tight drop-shadow-sm">
                                        "Bersama membangun standar baru industri asuransi"
                                    </p>
                                    <div className="h-1.5 w-12 bg-blue-600/30 mx-auto rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" />
                                </div>
                            </div>
                        </div>

                        {/* Floating "Security" Badge: Border digelapkan dikit */}
                        <div className="absolute -bottom-6 -right-6 bg-white/70 backdrop-blur-2xl p-5 rounded-[2rem] shadow-2xl border-2 border-slate-300/80 flex items-center gap-4 animate-float">
                            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/40">
                                <ShieldCheck size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Enterprise</p>
                                <p className="text-sm font-black text-slate-900 leading-none">Secure Data</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* SISI KANAN: TEXT */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black mb-8 uppercase tracking-[0.3em] shadow-xl">
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_#60a5fa]" />
                            Strategic Partnership
                        </div>

                        <h2 className="text-4xl md:text-6xl font-[1000] text-slate-900 mb-8 leading-[1.05] tracking-tighter">
                            Membangun Kepercayaan <br />
                            <span className="relative inline-block mt-3">
                                <span className="relative z-10 text-transparent bg-clip-text bg-linear-to-r from-blue-700 via-blue-600 to-cyan-500 drop-shadow-sm">
                                    Berbasis Data Akurat
                                </span>
                                <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-200/80 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 25 0 50 5 T 100 5" stroke="currentColor" strokeWidth="8" fill="transparent" />
                                </svg>
                            </span>
                        </h2>

                        <div className="space-y-10 relative">
                            <p className="text-xl text-slate-600 leading-relaxed font-medium">
                                <strong className="text-blue-700 font-black">KeuanganKu</strong> adalah ekosistem konsultasi digital yang dirancang untuk mendukung profesionalisme agen asuransi.
                            </p>

                            {/* THE QUOTE BOX: Border juga diselaraskan menjadi slate-400/60 */}
                            <div className="relative">
                                {/* Siluet belakang quote box */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-cyan-300/20 rounded-full blur-2xl pointer-events-none -z-10" />

                                {/* Kaca Quote Box */}
                                <div className="relative bg-white/20 backdrop-blur-3xl p-8 rounded-[2.5rem] border-2 border-slate-400/60 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)]">
                                    <p className="text-lg text-slate-800 leading-relaxed font-bold italic drop-shadow-sm">
                                        "Aplikasi ini membantu Anda beralih dari <span className="text-slate-900 font-black uppercase tracking-tighter underline decoration-blue-300 decoration-4">selling</span> ke <span className="text-blue-700 font-black uppercase tracking-tighter underline decoration-blue-200 decoration-4">consulting</span>."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default PartnershipSection;