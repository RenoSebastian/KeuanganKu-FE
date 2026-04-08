"use client";

import React from 'react';
import { Check, X, ShieldCheck, Sparkles, TrendingDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { cn } from "@/lib/utils";

const PricingSection = () => {
    // DATA DI-BOOST: Disesuaikan dengan skema harga baru Fin.Cal
    const pricingData = [
        {
            duration: "Free Trial",
            price: 0,
            originalPrice: null,
            monthlyBreakdown: 0,
            savings: null,
            isPopular: false,
            tag: "🌟 STARTER",
            description: "Jelajahi fitur esensial tanpa risiko finansial.",
            isFree: true,
            billingText: "Selamanya"
        },
        {
            duration: "1 Bulan",
            price: 150000,
            originalPrice: null,
            monthlyBreakdown: 150000,
            savings: null,
            isPopular: false,
            tag: "⚡ FLEKSIBEL",
            description: "Akses penuh fitur kalkulator finansial selama 1 bulan.",
            billingText: "Per Bulan"
        },
        {
            duration: "6 Bulan",
            price: 750000,
            originalPrice: 900000, // 150.000 x 6
            monthlyBreakdown: 125000, // 750.000 / 6
            savings: "Hemat Rp 150.000",
            isPopular: false,
            tag: "🚀 SEMESTERAN",
            description: "Bayar 5 bulan dapat 6 bulan. Solusi tepat perencanaan menengah.",
            billingText: "Per 6 Bulan"
        },
        {
            duration: "12 Bulan",
            price: 1350000,
            originalPrice: 1800000, // 150.000 x 12
            monthlyBreakdown: 112500, // 1.350.000 / 12
            savings: "🔥 Hemat Rp 450.000",
            isPopular: true,
            tag: "💎 INVESTASI CERDAS",
            description: "Bayar 9 bulan dapat 12 bulan. Pilihan paling hemat akses setahun.",
            billingText: "Per 12 Bulan"
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
        <section id="pricing" className="py-6 relative z-10">

            {/* AKSEN JINGGA (ORANGE LIGHT SOURCE) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[10%] right-[10%] w-125 h-125 rounded-full bg-orange-500/40 blur-[120px]" />
                <div className="absolute bottom-[20%] left-[5%] w-100 h-100 rounded-full bg-orange-400/30 blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                <div className="mb-16">
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">
                        Pilih Paket <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-700 to-indigo-600 drop-shadow-sm">Kesuksesan Anda.</span>
                    </h2>
                    <p className="text-slate-600 text-lg max-w-3xl mx-auto font-medium">
                        Investasi cerdas untuk produktivitas tanpa batas. Upgrade sekarang untuk performa agensi yang tak terbendung.
                    </p>
                </div>

                {/* 1. GRID KARTU HARGA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16 relative z-10">
                    {pricingData.map((item, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "relative p-6 lg:p-8 rounded-[2.5rem] transition-all duration-500 flex flex-col justify-between group backdrop-blur-3xl border-2",
                                item.isPopular
                                    ? "bg-slate-900/90 text-white shadow-[0_30px_60px_rgba(0,0,0,0.4)] lg:scale-105 z-10 border-slate-600/80 ring-4 ring-blue-500/20"
                                    : item.isFree
                                        ? "bg-slate-300/30 border-slate-400/50 shadow-lg"
                                        : "bg-slate-400/40 border-slate-500/50 hover:border-blue-400/60 hover:bg-slate-400/50 hover:-translate-y-1 shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_rgba(37,99,235,0.2)]"
                            )}
                        >
                            {item.isPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-orange-500 to-red-500 text-white px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/40 border border-orange-300 flex items-center gap-1.5 whitespace-nowrap z-20">
                                    <Sparkles size={12} className="animate-pulse" /> Paling Diminati
                                </div>
                            )}

                            <div>
                                <div className="mb-6">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-colors border",
                                        item.isPopular ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-white/40 text-slate-800 shadow-sm border-white/50 backdrop-blur-md"
                                    )}>
                                        {item.tag}
                                    </span>
                                    <h3 className={cn(
                                        "text-xl font-black mt-5 tracking-tight",
                                        item.isPopular ? "text-white" : "text-slate-900"
                                    )}>
                                        {item.duration}
                                    </h3>
                                    <p className={cn(
                                        "text-xs mt-3 leading-relaxed font-semibold",
                                        item.isPopular ? "text-slate-300" : "text-slate-700"
                                    )}>
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mb-8">
                                    <div className="flex flex-col items-start justify-center gap-1">

                                        {/* HARGA CORET (Price Anchoring) & DISKON BADGE */}
                                        <div className="min-h-6 w-full flex items-center justify-between">
                                            {item.originalPrice ? (
                                                <span className="text-sm font-black text-slate-500 line-through decoration-red-500/80 decoration-[3px]">
                                                    {formatCurrency(item.originalPrice)}
                                                </span>
                                            ) : <span className="text-sm invisible">Rp 0</span>}

                                            {/* Badge Diskon dinaikkan ke atas supaya sejajar dengan harga coret */}
                                            {item.savings && (
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wide border shadow-sm",
                                                    item.isPopular
                                                        ? "bg-red-500 text-white border-red-400"
                                                        : "bg-red-100 text-red-700 border-red-300"
                                                )}>
                                                    {item.savings}
                                                </span>
                                            )}
                                        </div>

                                        {/* HARGA UTAMA: Ukuran diturunkan ke text-3xl agar tidak overflow di HP */}
                                        <div className="flex items-baseline gap-1 mt-1 w-full">
                                            <span className={cn(
                                                "text-3xl lg:text-4xl font-[1000] tracking-tighter drop-shadow-sm w-full text-left truncate",
                                                item.isPopular ? "text-transparent bg-clip-text bg-linear-to-r from-blue-300 to-indigo-200" : "text-slate-900"
                                            )}>
                                                {item.isFree ? "Gratis" : formatCurrency(item.price)}
                                            </span>
                                        </div>

                                        {/* SUBTEXT DURASI */}
                                        {!item.isFree && (
                                            <span className={cn(
                                                "text-[12px] font-black uppercase tracking-widest mt-1",
                                                item.isPopular ? "text-slate-400" : "text-slate-600"
                                            )}>
                                                {item.billingText}
                                            </span>
                                        )}
                                    </div>

                                    <div className="min-h-16 mt-5 flex flex-col items-start justify-center border-t border-dashed border-slate-500/40 pt-5 gap-3">
                                        {item.price > 0 && item.duration !== "1 Bulan" ? (
                                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
                                                <TrendingDown size={16} className={item.isPopular ? "text-emerald-400" : "text-emerald-600"} />

                                                {/* PERUBAHAN DI SINI: Tambahkan flex items-baseline gap-1 dan hapus <br /> */}
                                                <p className={cn("flex items-baseline gap-1 text-xs font-bold", item.isPopular ? "text-slate-300" : "text-slate-700")}>
                                                    Senilai
                                                    <span className={cn("font-black text-base", item.isPopular ? "text-white" : "text-slate-900")}>
                                                        {formatCurrency(item.monthlyBreakdown)}
                                                    </span>
                                                    / bulan
                                                </p>

                                            </div>
                                        ) : item.price > 0 ? (
                                            <p className="text-xs font-bold text-slate-600 italic opacity-80">Perpanjang kapan saja</p>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <Link href="/register" className="mt-auto">
                                <Button className={cn(
                                    "w-full py-7 rounded-2xl font-black text-sm transition-all shadow-md backdrop-blur-xl group/btn",
                                    item.isPopular
                                        ? "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/50 shadow-[0_10px_30px_rgba(37,99,235,0.4)]"
                                        : item.isFree
                                            ? "bg-white/40 text-slate-800 hover:bg-white/60 shadow-sm border border-white/60"
                                            : "bg-white/80 text-slate-900 hover:bg-slate-900 hover:text-white border border-white/60 shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
                                )}>
                                    {item.isFree ? "Mulai Eksplorasi" : "Ambil Penawaran"}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* 2. CHECKLIST FITUR */}
                <div className="max-w-5xl mx-auto bg-slate-400/40 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 border-2 border-slate-500/50 shadow-[0_30px_60px_rgba(0,0,0,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500/30 blur-[80px] rounded-full pointer-events-none" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 relative z-10">
                        <div className="space-y-4 text-left">
                            <h4 className="font-black text-slate-700 uppercase tracking-widest text-xs mb-6 drop-shadow-sm">Fitur Paket Gratis</h4>
                            {[
                                { text: "Akses Fitur Dasar", included: true },
                                { text: "Limit Analisis Harian", included: true },
                                { text: "Download PDF/Excel", included: false },
                                { text: "Custom Branding", included: false },
                                { text: "Priority Support", included: false },
                            ].map((f, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    {f.included ? (
                                        <div className="bg-white/60 p-1 rounded-full shadow-sm border border-white/30">
                                            <Check size={12} className="text-emerald-700" strokeWidth={4} />
                                        </div>
                                    ) : (
                                        <div className="bg-slate-400/40 p-1 rounded-full border border-slate-400/30">
                                            <X size={12} className="text-slate-600" strokeWidth={4} />
                                        </div>
                                    )}
                                    <span className={cn("text-sm font-bold", f.included ? "text-slate-900" : "text-slate-600 line-through")}>
                                        {f.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 text-left">
                            <h4 className="font-black text-blue-800 uppercase tracking-widest text-xs mb-6 drop-shadow-sm">Fitur Paket Pro (Semua Siklus)</h4>
                            {[
                                "Akses Seluruh Fitur Analisis Pro",
                                "Tanpa Limit Analisis Harian",
                                "Unlimited Download PDF & Excel",
                                "Priority Support 24/7",
                                "Bebas Iklan & Watermark"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="bg-white/80 p-1 rounded-full shadow-sm border border-white/50">
                                        <Check size={12} className="text-blue-700" strokeWidth={4} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-950">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-500/40 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-2 bg-white/40 px-4 py-2 rounded-full border border-white/50 shadow-md backdrop-blur-md">
                            <ShieldCheck className="text-emerald-700" size={18} />
                            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Garansi Keamanan Data 100%</span>
                        </div>
                        <p className="text-[10px] text-slate-700 font-bold italic">
                            *Harga sudah termasuk pajak & biaya layanan.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;