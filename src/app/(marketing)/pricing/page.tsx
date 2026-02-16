"use client";

import React, { useState } from 'react';
import PricingSection from "@/components/features/marketing/pricing-section";
import TestimonialsCarouselSection from "@/components/features/marketing/testimonials-carousel-section";
import FAQSection from "@/components/features/marketing/faq-section";
import ContactSupportModal from "@/components/features/marketing/contact-support-modal";
import { Button } from "@/components/ui/button";
import { MessageSquare, Download, BarChart3, Users, Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
    const [isContactOpen, setIsContactOpen] = useState(false);

    return (
        <div className="bg-white selection:bg-blue-100">
            {/* 1. Hero Section dengan Animated Background */}
            <section className="relative pt-24 pb-20 overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-50 via-white to-white">
                {/* Dekorasi Abstract - Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                    <div className="absolute top-0 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <Badge variant="secondary" className="mb-6 py-1.5 px-4 bg-blue-50 text-blue-600 border-blue-100 animate-fade-in shadow-sm">
                        <Sparkles size={14} className="mr-2 fill-blue-600" />
                        Investasi Cerdas untuk Karir Agen Profesional
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-[1000] text-slate-900 mb-8 tracking-tighter leading-[1.1]">
                        Tingkatkan Closing <br />
                        <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
                            Rate Anda Sekarang.
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
                        Berhenti menebak kebutuhan nasabah. Gunakan tools berbasis data yang dirancang khusus untuk memenangkan kepercayaan klien dalam hitungan menit.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <div className="flex -space-x-3 overflow-hidden py-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-slate-500 self-center font-bold tracking-tight">
                            Bergabung dengan <span className="text-blue-600">500+ Agen</span> Berhasil
                        </p>
                    </div>
                </div>
            </section>

            {/* 2. Main Pricing Section */}
            <div className="relative z-10 -mt-10">
                <PricingSection />
            </div>

            {/* 3. Why Pro? (Bento Grid Style) */}
            <section className="py-32 bg-slate-900 text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                        <div className="max-w-xl">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
                                Fitur Pro: Senjata <br />Rahasia Agen Top.
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed font-medium">
                                Dirancang berdasarkan masukan dari agen asuransi dengan kualifikasi MDRT untuk memastikan workflow Anda seefisien mungkin.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="border-slate-700 text-white bg-transparent hover:bg-white hover:text-black rounded-full px-10 py-7 text-lg font-bold transition-all duration-300"
                        >
                            Lihat Demo Fitur <ArrowRight className="ml-2" size={20} />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="md:col-span-2 group relative p-10 bg-slate-800/40 border border-slate-700/50 rounded-[3rem] overflow-hidden hover:border-blue-500/50 transition-all duration-500">
                            <div className="relative z-10">
                                <div className="p-4 bg-blue-500/10 rounded-2xl w-fit mb-8">
                                    <Download className="text-blue-500" size={40} />
                                </div>
                                <h3 className="text-3xl font-bold mb-4">Laporan PDF Instan & Profesional</h3>
                                <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                                    Kirim ringkasan analisis keuangan ke WhatsApp nasabah hanya dengan satu klik. Laporan lengkap dengan visualisasi yang mudah dimengerti.
                                </p>
                            </div>
                            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700" />
                        </div>

                        {/* Card 2 */}
                        <div className="p-10 bg-linear-to-br from-blue-600 to-indigo-700 border border-blue-400/30 rounded-[3rem] shadow-2xl shadow-blue-900/40 group hover:scale-[1.02] transition-transform duration-500">
                            <div className="p-4 bg-white/10 rounded-2xl w-fit mb-8">
                                <BarChart3 className="text-white" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Analisis Tanpa Batas</h3>
                            <p className="text-blue-100 text-lg leading-relaxed font-medium">
                                Bebas lakukan simulasi checkup untuk puluhan prospek setiap harinya. Tanpa limit kuota, tanpa hambatan closing.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="md:col-span-3 p-10 bg-slate-800/40 border border-slate-700/50 rounded-[3rem] flex flex-col lg:flex-row items-center gap-12 hover:border-blue-500/50 transition-all duration-500">
                            <div className="flex-1">
                                <div className="p-4 bg-blue-500/10 rounded-2xl w-fit mb-8">
                                    <Users className="text-blue-500" size={40} />
                                </div>
                                <h3 className="text-3xl font-bold mb-4 text-white">Smart Lead Management</h3>
                                <p className="text-slate-400 text-lg leading-relaxed">
                                    Kelola database prospek Anda berdasarkan profil risiko dan kebutuhan asuransi mereka. Follow-up jadi lebih personal, sistematis, dan tepat sasaran.
                                </p>
                            </div>

                            {/* Visual Representation of Lead Management */}
                            <div className="flex-1 w-full max-w-md flex flex-col gap-4">
                                {/* Card Simulasi 1 */}
                                <div className="bg-slate-800/80 p-6 rounded-3xl border border-blue-500/30 backdrop-blur-md shadow-2xl">
                                    <div className="flex justify-between items-center mb-5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Potential Closing</span>
                                        </div>
                                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] py-0 px-2">High Priority</Badge>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="h-3 w-32 bg-slate-100/20 rounded-full" />
                                            <div className="h-3 w-16 bg-slate-600 rounded-full" />
                                        </div>
                                        <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full w-[85%] bg-linear-to-r from-blue-600 to-indigo-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Card Simulasi 2 */}
                                <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700 opacity-60 scale-95 origin-top -translate-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="h-2 w-20 bg-slate-700 rounded-full" />
                                        <div className="h-4 w-10 bg-slate-700 rounded-full" />
                                    </div>
                                    <div className="h-2 w-full bg-slate-700/50 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Testimonials Section */}
            <div className="py-20 bg-white">
                <TestimonialsCarouselSection />
            </div>

            {/* 6. Footer CTA - Glassmorphism Style */}
            <section className="py-32 relative overflow-hidden bg-white">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="relative bg-blue-600 rounded-[4rem] p-12 md:p-24 text-center overflow-hidden shadow-[0_40px_100px_-20px_rgba(37,99,235,0.4)]">
                        {/* Animated Background Ornaments */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/20 rounded-full -ml-32 -mb-32 blur-3xl" />

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-[1000] text-white mb-8 tracking-tighter leading-tight">
                                Siap Jadi Agen <br />Masa Depan?
                            </h2>
                            <p className="text-blue-100 text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                                Bergabunglah dengan ratusan agen asuransi modern yang telah mendigitalisasi workflow mereka bersama KeuanganKu.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                <Button
                                    size="lg"
                                    className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-10 py-8 text-xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95 duration-300"
                                    onClick={() => setIsContactOpen(true)}
                                >
                                    <MessageSquare size={24} className="mr-3" /> Chat Admin Sekarang
                                </Button>
                                <button className="text-white/90 font-bold text-lg hover:text-white hover:underline underline-offset-8 decoration-2 transition-all">
                                    Konsultasi Paket Perusahaan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Support Modal Pop-up */}
            <ContactSupportModal
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
            />
        </div>
    );
}