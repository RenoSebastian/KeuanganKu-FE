"use client";

import React from 'react';
import { Check, X, Star, ShieldCheck, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { cn } from "@/lib/utils";

const PricingSection = () => {
    const pricingData = [
        {
            duration: "Free Trial",
            price: 0,
            total: 0,
            savings: null,
            isPopular: false,
            tag: "Starter",
            description: "Eksplorasi fitur dasar tanpa biaya.",
            isFree: true
        },
        {
            duration: "1 Bulan",
            price: 79000,
            total: 79000,
            savings: null,
            isPopular: false,
            tag: "Fleksibel",
            description: "Cocok untuk mencoba efektivitas sistem."
        },
        {
            duration: "6 Bulan",
            price: 59000,
            total: 354000, // 59k * 6
            savings: "Hemat 25%",
            isPopular: false,
            tag: "Paling Diminati",
            description: "Ideal untuk target semesteran."
        },
        {
            duration: "1 Tahun",
            price: 49000,
            total: 588000, // 49k * 12
            savings: "Hemat 38%",
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
        <section id="pricing" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="mb-16">
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">
                        Pilih Paket <span className="text-blue-600">Kesuksesan Anda.</span>
                    </h2>
                    <p className="text-slate-500 text-lg max-w-3xl mx-auto font-medium">
                        Bandingkan manfaat setiap rencana. Mulai gratis dan upgrade kapan saja untuk performa agensi yang tak terbendung.
                    </p>
                </div>

                {/* Grid Perbandingan 4 Kolom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                    {pricingData.map((item, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "relative p-6 rounded-[2.5rem] transition-all duration-500 border flex flex-col justify-between",
                                item.isPopular
                                    ? "bg-slate-900 text-white shadow-2xl lg:scale-105 z-10 border-slate-800"
                                    : item.isFree
                                        ? "bg-white border-slate-100 opacity-80"
                                        : "bg-slate-50 border-slate-100 hover:border-blue-200"
                            )}
                        >
                            {item.isPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Recommended
                                </div>
                            )}

                            <div>
                                <div className="mb-6">
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                                        item.isPopular ? "bg-blue-500/20 text-blue-400" : "bg-white text-slate-500 shadow-sm"
                                    )}>
                                        {item.tag}
                                    </span>
                                    <h3 className="text-xl font-black mt-4">{item.duration}</h3>
                                    <p className={cn("text-[11px] mt-2 leading-relaxed", item.isPopular ? "text-slate-400" : "text-slate-500")}>
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-3xl font-black">
                                            {item.isFree ? "Gratis" : formatCurrency(item.price)}
                                        </span>
                                        {!item.isFree && <span className="text-xs opacity-60">/bln</span>}
                                    </div>

                                    {/* Keterangan Total Biaya */}
                                    <div className="min-h-10 mt-2 flex flex-col items-center justify-center">
                                        {item.price > 0 && item.duration !== "1 Bulan" ? (
                                            <p className={cn("text-[10px] font-bold", item.isPopular ? "text-blue-400" : "text-slate-400")}>
                                                Total {formatCurrency(item.total)} per {item.duration === "6 Bulan" ? "semester" : "tahun"}
                                            </p>
                                        ) : item.price > 0 ? (
                                            <p className="text-[10px] font-bold text-slate-400 italic">Bayar bulanan</p>
                                        ) : null}

                                        {item.savings && (
                                            <span className="inline-block mt-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                                                {item.savings}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Link href="/register">
                                <Button className={cn(
                                    "w-full py-5 rounded-2xl font-black text-sm transition-all",
                                    item.isPopular
                                        ? "bg-blue-600 hover:bg-white hover:text-blue-600"
                                        : item.isFree
                                            ? "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                            : "bg-white text-slate-900 hover:bg-slate-900 hover:text-white border-none shadow-sm"
                                )}>
                                    {item.isFree ? "Mulai Gratis" : "Pilih Paket"}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Checklist Fitur Perbandingan Tetap Sama */}
                <div className="max-w-5xl mx-auto bg-slate-50 rounded-[3rem] p-8 md:p-12 border border-slate-100">
                    {/* ... (bagian checklist yang sudah ada) ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        <div className="space-y-4 text-left">
                            <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs mb-6">Fitur Paket Gratis</h4>
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
                                    <span className={cn("text-sm font-bold", f.included ? "text-slate-600" : "text-slate-300 line-through")}>
                                        {f.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 text-left">
                            <h4 className="font-black text-blue-600 uppercase tracking-widest text-xs mb-6">Fitur Paket Pro (Semua Siklus)</h4>
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

                    <div className="mt-12 pt-8 border-t border-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="text-emerald-500" size={20} />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Garansi Keamanan Data 100%</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium italic">
                            *Pembayaran dilakukan di awal sesuai dengan siklus pilihan Anda.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;