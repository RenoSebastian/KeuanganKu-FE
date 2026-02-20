"use client";

import React from 'react';
import { Building2, Mail, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { cn } from "@/lib/utils";

const SupportSection = () => {
    return (
        // 1. Diubah menjadi Dark Glassmorphism Container (Bukan solid #0B1120)
        // Menambahkan border-y border-white/10 agar transisinya terasa seperti lembaran kaca
        <section id="support" className="relative py-24 lg:py-32 overflow-hidden bg-slate-900/80 backdrop-blur-3xl border-t border-white/20 text-white z-10">

            {/* 2. Background Blob lokal dihapus agar tidak bentrok dengan Global Blobs di page.tsx */}

            {/* Grid Pattern Overlay dipertahankan karena memberi tekstur "Premium Tech" yang halus */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    {/* SISI KIRI: COPYWRITING & CONTACT */}
                    <div className="text-left space-y-8">
                        {/* Glassmorphism Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-400/20 text-blue-300 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md shadow-lg shadow-blue-900/20">
                            <Sparkles className="w-3 h-3 animate-pulse" /> Strategic Partnership
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tighter">
                            Ingin Bergabung Sebagai <br />
                            {/* Diperbaiki: bg-linear-to-* menjadi bg-gradient-to-* */}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300 drop-shadow-sm">
                                Early Adopter?
                            </span>
                        </h2>

                        <p className="text-slate-300 text-lg leading-relaxed max-w-xl font-medium">
                            Kami sedang melakukan uji coba eksklusif untuk <span className="text-white font-bold underline decoration-blue-500/50 underline-offset-8">30 agen aktif pertama</span>. Jadilah pionir dalam transformasi agen asuransi berbasis data di Indonesia.
                        </p>

                        <div className="pt-4">
                            {/* Glass Contact Box */}
                            <div className="group relative flex items-start gap-6 p-1 rounded-[2.5rem] bg-linear-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 transition-all duration-500 hover:border-blue-500/40 hover:bg-white/10 max-w-md shadow-xl">
                                <div className="flex items-center gap-5 p-5 w-full">
                                    <div className="bg-linear-to-br from-blue-500 to-blue-700 p-4 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        <Mail className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-1">Kemitraan Strategis</h4>
                                        <p className="text-xl font-black text-white tracking-tight group-hover:text-blue-300 transition-colors">admin@geocitra.id</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SISI KANAN: THE CARD (Premium White Glass Card) */}
                    <div className="relative">
                        {/* Efek Cahaya di belakang Card diredam sedikit agar tidak 'lebay' */}
                        <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-cyan-500 rounded-[3.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                        {/* 3. Card Utama diubah menjadi White Glassmorphism Card */}
                        <div className="relative bg-white/90 backdrop-blur-2xl text-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-white/60">

                            <div className="flex items-center gap-3 mb-10">
                                <div className="h-1 w-12 bg-blue-600 rounded-full" />
                                <h3 className="text-2xl font-black tracking-tight">
                                    Keunggulan <span className="text-blue-600">Pro-Agent</span>
                                </h3>
                            </div>

                            <ul className="grid grid-cols-1 gap-6 mb-12">
                                {[
                                    "Visualisasi kebutuhan & manajemen risiko berbasis data riil klien",
                                    "Akses fleksibel kapan saja dengan UI/UX yang user-friendly",
                                    "Sistem agnostik: Dapat digunakan oleh seluruh agen asuransi",
                                    "Enkripsi data tingkat tinggi yang aman dan dapat dipercaya"
                                ].map((item, idx) => (
                                    <li key={idx} className="group/list flex items-start gap-4">
                                        <div className="mt-1 bg-blue-500/10 p-1 rounded-full group-hover/list:bg-blue-600 transition-colors duration-300 border border-blue-500/20">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 group-hover/list:text-white transition-colors" />
                                        </div>
                                        <span className="text-slate-700 font-bold text-[15px] leading-snug group-hover/list:text-slate-900 transition-colors">
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-10 border-t border-slate-200/60 space-y-4">
                                <Link href="/login" className="block">
                                    {/* Tombol dimodifikasi agar menyatu dengan Glass Theme */}
                                    <Button size="lg" className="w-full bg-slate-900/95 text-white hover:bg-blue-600 rounded-2xl h-18 text-xl font-black shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group/btn border border-slate-800 hover:border-blue-500">
                                        Login Dashboard <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                                    </Button>
                                </Link>
                                <div className="flex items-center justify-center gap-2 pt-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                                        Verified Professional Access Only
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default SupportSection;