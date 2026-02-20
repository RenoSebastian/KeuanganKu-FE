"use client";

import React from 'react';
import { Check, X, ShieldCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { cn } from "@/lib/utils";

const PricingSection = () => {
    const pricingData = [
        {
            duration: "Free Trial",
            price: 0,
            monthlyBreakdown: 0,
            savings: null,
            isPopular: false,
            tag: "Starter",
            description: "Eksplorasi fitur dasar tanpa biaya.",
            isFree: true
        },
        {
            duration: "1 Bulan",
            price: 175000,
            monthlyBreakdown: 175000,
            savings: null,
            isPopular: false,
            tag: "Fleksibel",
            description: "Cocok untuk mencoba efektivitas sistem."
        },
        {
            duration: "6 Bulan",
            price: 840000,
            monthlyBreakdown: 140000,
            savings: "Hemat 20%",
            isPopular: false,
            tag: "Paling Diminati",
            description: "Ideal untuk target semesteran."
        },
        {
            duration: "1 Tahun",
            price: 1470000,
            monthlyBreakdown: 122500,
            savings: "Hemat 30%",
            isPopular: true,
            tag: "Investasi Terbaik",
            description: "Komitmen penuh untuk hasil maksimal."
        }
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        // 1. Hapus 'bg-white' dan ganti dengan 'relative z-10' agar background ambient bisa tembus
        <section id="pricing" className="py-6 relative z-10">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="mb-16">
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">
                        Pilih Paket <span className="text-blue-600">Kesuksesan Anda.</span>
                    </h2>
                    <p className="text-slate-600 text-lg max-w-3xl mx-auto font-medium">
                        Investasi cerdas untuk produktivitas tanpa batas. Upgrade sekarang untuk performa agensi yang tak terbendung.
                    </p>
                </div>

                {/* Grid Perbandingan 4 Kolom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                    {pricingData.map((item, idx) => (
                        <div
                            key={idx}
                            // 2. Terapkan Glassmorphism (backdrop-blur) pada semua Card
                            className={cn(
                                "relative p-6 rounded-[2.5rem] transition-all duration-500 border flex flex-col justify-between group backdrop-blur-xl",
                                item.isPopular
                                    // Kaca gelap elegan untuk paket populer
                                    ? "bg-slate-900/90 text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] lg:scale-105 z-10 border-white/20"
                                    : item.isFree
                                        // Kaca sangat tipis untuk versi Free
                                        ? "bg-white/40 border-white/40 opacity-90 shadow-sm"
                                        // Kaca medium untuk paket standar
                                        : "bg-white/60 border-white/60 hover:border-blue-300 hover:shadow-[0_20px_40px_rgb(0,0,0,0.05)] hover:-translate-y-1"
                            )}
                        >
                            {item.isPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/30">
                                    Recommended
                                </div>
                            )}

                            <div>
                                <div className="mb-6">
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-colors",
                                        item.isPopular ? "bg-blue-500/20 text-blue-300" : "bg-white/60 text-slate-600 shadow-sm"
                                    )}>
                                        {item.tag}
                                    </span>
                                    <h3 className="text-xl font-black mt-4">{item.duration}</h3>
                                    <p className={cn("text-[11px] mt-2 leading-relaxed font-medium", item.isPopular ? "text-slate-300" : "text-slate-500")}>
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mb-8">
                                    {/* LOGIC UTAMA DISPLAY HARGA */}
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black tracking-tight">
                                                {item.isFree ? "Gratis" : formatCurrency(item.price)}
                                            </span>
                                        </div>

                                        {/* Logic Subtext (Perhitungan Bulanan) */}
                                        {!item.isFree && (
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-wide",
                                                item.isPopular ? "text-slate-400" : "text-slate-400"
                                            )}>
                                                {item.duration === "1 Bulan" ? "/bulan" : "Tagihan Awal"}
                                            </span>
                                        )}
                                    </div>

                                    {/* Sub-informasi: Ekuivalensi Bulanan untuk paket jangka panjang */}
                                    <div className="min-h-12 mt-3 flex flex-col items-center justify-center border-t border-dashed border-slate-300/30 pt-3">
                                        {item.price > 0 && item.duration !== "1 Bulan" ? (
                                            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-700">
                                                <p className={cn("text-[11px] font-medium", item.isPopular ? "text-blue-200" : "text-blue-700")}>
                                                    Setara <span className="font-bold">{formatCurrency(item.monthlyBreakdown)}</span> /bln
                                                </p>
                                            </div>
                                        ) : item.price > 0 ? (
                                            <p className="text-[10px] font-bold text-slate-400 italic opacity-50">Langganan fleksibel</p>
                                        ) : null}

                                        {item.savings && (
                                            <span className="inline-block mt-2 text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-0.5 rounded-full uppercase tracking-tighter border border-emerald-500/20">
                                                {item.savings}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Link href="/register" className="mt-auto">
                                <Button className={cn(
                                    "w-full py-6 rounded-2xl font-black text-sm transition-all shadow-md backdrop-blur-md",
                                    item.isPopular
                                        ? "bg-blue-600 hover:bg-blue-500 text-white border border-transparent shadow-blue-500/25"
                                        : item.isFree
                                            ? "bg-white/50 text-slate-600 hover:bg-white/80 shadow-none border border-white/50"
                                            : "bg-white/70 text-slate-900 hover:bg-white hover:text-blue-700 border border-white/80"
                                )}>
                                    {item.isFree ? "Mulai Gratis" : "Pilih Paket"}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* 3. Checklist Fitur (Bagian Bawah) diubah menjadi Glass Card */}
                <div className="max-w-5xl mx-auto bg-white/50 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/60 shadow-[0_20px_50px_rgb(0,0,0,0.03)] relative overflow-hidden">
                    {/* Aksen kilauan halus di sudut dalam kotak checklist */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-3xl rounded-full pointer-events-none" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 relative z-10">
                        <div className="space-y-4 text-left">
                            <h4 className="font-black text-slate-500 uppercase tracking-widest text-xs mb-6">Fitur Paket Gratis</h4>
                            {[
                                { text: "Akses Fitur Dasar", included: true },
                                { text: "Limit Analisis Harian", included: true },
                                { text: "Download PDF/Excel", included: false },
                                { text: "Custom Branding", included: false },
                                { text: "Priority Support", included: false },
                            ].map((f, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    {f.included ? (
                                        <Check size={14} className="text-emerald-500" strokeWidth={4} />
                                    ) : (
                                        <X size={14} className="text-slate-300" strokeWidth={4} />
                                    )}
                                    <span className={cn("text-sm font-bold", f.included ? "text-slate-700" : "text-slate-400 line-through")}>
                                        {f.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 text-left">
                            <h4 className="font-black text-blue-700 uppercase tracking-widest text-xs mb-6">Fitur Paket Pro (Semua Siklus)</h4>
                            {[
                                "Akses Seluruh Fitur Analisis Pro",
                                "Tanpa Limit Analisis Harian",
                                "Unlimited Download PDF & Excel",
                                "Priority Support 24/7",
                                "Bebas Iklan & Watermark"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Check size={14} className="text-blue-600" strokeWidth={4} />
                                    <span className="text-sm font-bold text-slate-900">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/60 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="text-emerald-500" size={20} />
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Garansi Keamanan Data 100%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium italic">
                            *Harga sudah termasuk pajak & biaya layanan.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;