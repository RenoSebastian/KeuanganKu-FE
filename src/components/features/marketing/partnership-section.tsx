"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';

const PartnershipSection = () => {
    return (
        <section className="relative py-32 bg-white overflow-hidden">
            {/* Background Decor - Minimalist & Techy */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* SISI KIRI: THE LOGO DISPLAY (Elevated Design) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        {/* Decorative Badge melayang */}
                        <div className="absolute -top-8 -left-8 bg-blue-600 text-white p-4 rounded-2xl shadow-2xl z-20 animate-bounce-slow hidden md:block">
                            <ShieldCheck size={32} />
                        </div>

                        <div className="relative bg-linear-to-br from-white to-slate-50 rounded-[3rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white overflow-hidden">
                            {/* Grainy Texture Overlay */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                            <div className="flex flex-col items-center gap-12 relative z-10">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                                    Verified Ecosystem
                                </span>

                                <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full">
                                    <div className="group relative">
                                        <Image
                                            src="/images/maxipro.webp"
                                            alt="Maxipro"
                                            width={160}
                                            height={80}
                                            className="object-contain transition-all duration-500 group-hover:scale-110 filter grayscale group-hover:grayscale-0"
                                        />
                                    </div>

                                    <div className="h-px w-20 md:w-px md:h-20 bg-slate-200" />

                                    <div className="group relative">
                                        <Image
                                            src="/images/logogeocitra.png"
                                            alt="Geocitra"
                                            width={180}
                                            height={180}
                                            className="object-contain transition-all duration-500 group-hover:scale-110 drop-shadow-xl"
                                        />
                                    </div>
                                </div>

                                <p className="text-slate-400 text-sm font-medium italic">
                                    Bersama membangun standar baru industri asuransi
                                </p>
                            </div>
                        </div>

                        {/* Floating Card Kecil */}
                        <div className="absolute -bottom-14 -right-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 z-20 hidden md:flex items-center gap-4">
                            <div className="w-14 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                <ArrowUpRight size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase">Growth</p>
                                <p className="text-lg font-black text-slate-900">+120% Efficiency</p>
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold mb-8 uppercase tracking-widest shadow-lg">
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                            Strategic Partnership
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tighter">
                            Membangun Kepercayaan Klien <br />
                            <span className="relative inline-block mt-2">
                                <span className="relative z-10 text-transparent bg-clip-text bg-linear-to-r from-blue-700 via-blue-600 to-cyan-500">
                                    Melalui Pendekatan Berbasis Data
                                </span>
                                <svg className="absolute -bottom-2 left-0 w-full h-3 text-blue-100 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 25 0 50 5 T 100 5" stroke="currentColor" strokeWidth="8" fill="transparent" />
                                </svg>
                            </span>
                        </h2>

                        <div className="space-y-6">
                            <p className="text-xl text-slate-700 leading-relaxed">
                                <strong className="text-blue-700 font-black">KeuanganKu</strong> adalah alat bantu konsultasi yang dirancang khusus untuk agen asuransi profesional lintas perusahaan.
                            </p>

                            <div className="p-1 bg-linear-to-r from-slate-200 to-transparent rounded-2xl">
                                <div className="bg-white p-6 rounded-xl">
                                    <p className="text-lg text-slate-600 leading-relaxed italic">
                                        "Aplikasi ini membantu Anda beralih dari <strong className="text-slate-900 font-bold uppercase tracking-tight">selling</strong> ke <strong className="text-slate-900 font-bold uppercase tracking-tight">consulting</strong>, membuat diskusi asuransi menjadi kebutuhan logis bagi klien."
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