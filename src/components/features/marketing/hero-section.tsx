"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

const HeroSection = () => {
    return (
        <section className="relative min-h-[90vh] flex items-center pt-20 pb-32 lg:pt-32 lg:pb-52 overflow-hidden bg-white">

            {/* BACKGROUND LAYER - Optimized with better masking */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/orang.png"
                    alt="Agent Consulting"
                    fill
                    className="object-cover object-[75%] md:object-center opacity-90"
                    priority
                />
                {/* Gradient Masking: Menjaga teks tetap kontras di kiri, gambar terlihat di kanan */}
                <div className="absolute inset-0 bg-linear-to-r from-white via-white/90 to-transparent md:from-white md:via-white/60 md:to-transparent" />
                <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent opacity-60" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl">

                    {/* BADGE - Animated */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-xl shadow-blue-500/20"
                    >
                        <Sparkles className="w-3 h-3" />
                        Professional Agent Toolkit
                    </motion.div>

                    {/* MAIN TITLE - Ultra Bold & Tight */}
                    <motion.h1
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.95] md:leading-none"
                    >
                        Bantu Klien <span className="text-blue-600">Menjelaskan,</span> <br />
                        <span className="relative inline-block mt-2">
                            <span className="relative z-10 text-transparent bg-clip-text bg-linear-to-r from-blue-700 via-blue-600 to-indigo-500">
                                Bukan Meyakinkan.
                            </span>
                            {/* Aksen visual di bawah teks utama */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1, delay: 1 }}
                                className="absolute -bottom-2 left-0 h-3 bg-blue-100 -z-10 rounded-full"
                            />
                        </span>
                    </motion.h1>

                    {/* DESKRIPSI - Dengan Efek Glassmorphism & Typewriter-ish feel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="relative max-w-2xl mb-12"
                    >
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-blue-600 rounded-full" />
                        <p className="pl-6 text-lg md:text-2xl text-slate-600 leading-relaxed font-medium italic">
                            {/* Kita pecah narasi agar lebih menjual */}
                            <span className="text-slate-900 font-bold">Alat bantu visual profesional</span> untuk agen asuransi.
                            Memetakan kondisi keuangan klien secara transparan dan
                            <span className="text-blue-600 font-bold"> mengubah skema proteksi menjadi kebutuhan nyata.</span>
                        </p>
                    </motion.div>

                    {/* CTA BUTTONS - Tablet Friendly Size */}
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
                            <Button variant="outline" size="lg" className="w-full h-18 px-10 text-lg rounded-2xl bg-white/40 backdrop-blur-xl border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 transition-all font-bold">
                                Pelajari Fitur
                            </Button>
                        </Link>
                    </motion.div>

                </div>
            </div>

            {/* FLOATING ELEMENT - Untuk pemanis di Tablet/Desktop */}
            <div className="absolute bottom-20 right-10 hidden xl:flex items-center gap-4 bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-slate-100 shadow-2xl animate-bounce-slow">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <Briefcase size={24} />
                </div>
                <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Target Market</p>
                    <p className="text-sm font-bold text-slate-900">High-Net-Worth Clients</p>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;