"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Download, BarChart3, Users, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

// Components
import PricingSection from "@/components/features/marketing/pricing-section";
import TestimonialsCarouselSection from "@/components/features/marketing/testimonials-carousel-section";
import ContactSupportModal from "@/components/features/marketing/contact-support-modal";

export default function PricingPage() {
    const [isContactOpen, setIsContactOpen] = useState(false);

    return (
        <div className="bg-white selection:bg-indigo-100 selection:text-indigo-900">

            {/* 1. HERO SECTION (Clean & Impactful) */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Sparkles size={12} />
                        <span>Upgrade Karir Agen Anda</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        Tingkatkan Closing Rate <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-blue-500">
                            Secara Signifikan.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                        Platform all-in-one untuk agen asuransi modern. Buat simulasi keuangan akurat, kelola prospek, dan cetak laporan profesional dalam hitungan detik.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in zoom-in duration-1000 delay-200">
                        <Button
                            size="lg"
                            className="h-14 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1"
                            onClick={() => document.getElementById('pricing-grid')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Lihat Paket Harga
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-14 px-8 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-lg"
                            onClick={() => setIsContactOpen(true)}
                        >
                            Hubungi Sales
                        </Button>
                    </div>

                    {/* Social Proof */}
                    <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center animate-in fade-in duration-1000 delay-300">
                        <p className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-widest">
                            Dipercaya oleh agen dari perusahaan terkemuka
                        </p>
                        <div className="flex -space-x-3 overflow-hidden">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-slate-100 overflow-hidden shadow-sm">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                            <div className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-white bg-slate-50 text-[10px] font-bold text-slate-500 shadow-sm">
                                +500
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. PRICING SECTION */}
            <div id="pricing-grid" className="relative z-10 bg-slate-50/50 pt-20 pb-32">
                <PricingSection />
            </div>

            {/* 3. FEATURE HIGHLIGHT (Bento Grid) */}
            <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
                {/* Background glow */}
                <div className="absolute top-0 left-1/4 w-125 h-125 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="max-w-2xl">
                            <Badge variant="outline" className="mb-4 text-indigo-300 border-indigo-500/30">PRO FEATURES</Badge>
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
                                Kenapa Agen Top Memilih <br />Paket <span className="text-indigo-400">Professional?</span>
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Investasi kecil untuk hasil yang masif. Fitur Pro membuka potensi penuh dari setiap interaksi dengan calon nasabah Anda.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1: PDF Export */}
                        <div className="md:col-span-2 group relative p-8 md:p-10 bg-slate-800/50 border border-slate-700/50 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/50 transition-all duration-500">
                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                                <div className="flex-1 space-y-4">
                                    <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 mb-2">
                                        <Download className="text-indigo-400 w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold">PDF Report Generator</h3>
                                    <p className="text-slate-400 leading-relaxed">
                                        Kirim proposal keuangan yang cantik dan mudah dipahami langsung ke WhatsApp nasabah. Tanpa watermark, terlihat profesional.
                                    </p>
                                    <ul className="space-y-2 mt-4">
                                        <li className="flex items-center text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 mr-2 text-indigo-500" /> Branding Personal</li>
                                        <li className="flex items-center text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 mr-2 text-indigo-500" /> Visualisasi Grafik Premium</li>
                                    </ul>
                                </div>
                                {/* Visual Placeholder */}
                                <div className="w-full md:w-64 h-40 bg-slate-700/30 rounded-xl border border-slate-600/30 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                    <div className="absolute inset-2 bg-slate-800 rounded-lg flex items-center justify-center">
                                        <span className="text-xs font-mono text-slate-500">PDF PREVIEW</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Unlimited */}
                        <div className="p-8 md:p-10 bg-linear-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] shadow-xl shadow-indigo-900/20 group hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between">
                            <div>
                                <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-6">
                                    <BarChart3 className="text-white w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Unlimited Access</h3>
                                <p className="text-indigo-100 text-sm leading-relaxed">
                                    Lupakan batasan kuota harian. Lakukan simulasi sebanyak apapun yang Anda butuhkan untuk prospek.
                                </p>
                            </div>
                            <div className="mt-8 flex items-center text-xs font-bold tracking-widest text-indigo-200 uppercase">
                                Best Value <ArrowRight className="ml-2 w-4 h-4" />
                            </div>
                        </div>

                        {/* Card 3: Lead Management */}
                        <div className="md:col-span-3 p-8 md:p-10 bg-slate-800/50 border border-slate-700/50 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-10 hover:border-indigo-500/50 transition-all duration-500">
                            <div className="flex-1 space-y-4">
                                <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 mb-2">
                                    <Users className="text-indigo-400 w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold">Smart Lead Database</h3>
                                <p className="text-slate-400 leading-relaxed max-w-xl">
                                    Simpan data klien dengan aman. Dapatkan notifikasi kapan waktu terbaik untuk follow-up berdasarkan hasil checkup finansial mereka.
                                </p>
                            </div>

                            {/* Abstract UI Representation */}
                            <div className="flex-1 w-full max-w-sm">
                                <div className="space-y-3">
                                    <div className="h-14 w-full bg-slate-700/30 rounded-xl border border-slate-600/30 flex items-center px-4 gap-3">
                                        <div className="h-8 w-8 rounded-full bg-indigo-500/20" />
                                        <div className="h-2 w-24 bg-slate-600 rounded-full" />
                                        <div className="ml-auto h-2 w-12 bg-emerald-500/50 rounded-full" />
                                    </div>
                                    <div className="h-14 w-full bg-slate-700/30 rounded-xl border border-slate-600/30 flex items-center px-4 gap-3 opacity-60">
                                        <div className="h-8 w-8 rounded-full bg-slate-500/20" />
                                        <div className="h-2 w-20 bg-slate-600 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. TESTIMONIALS */}
            <section className="py-20 bg-slate-50/50">
                <TestimonialsCarouselSection />
            </section>

            {/* 5. CTA FOOTER */}
            <section className="py-24 md:py-32 bg-white relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        Mulai Perjalanan Sukses Anda.
                    </h2>
                    <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
                        Jangan biarkan keraguan menghambat potensi closing Anda. Coba sekarang dan rasakan perbedaannya dalam 30 hari.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="h-14 px-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-200 transition-all hover:scale-105"
                            onClick={() => setIsContactOpen(true)}
                        >
                            <MessageSquare className="w-5 h-5 mr-2" /> Chat Admin
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="h-14 px-10 rounded-full text-slate-600 hover:bg-slate-50 font-semibold text-lg"
                        >
                            Tanya Jawab (FAQ)
                        </Button>
                    </div>
                </div>
            </section>

            {/* Modals */}
            <ContactSupportModal
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
            />
        </div>
    );
}