"use client";

import React, { useState } from 'react';
import { Check, X, Zap, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link'; // Import Link untuk routing

const PricingSection = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'semi-annual' | 'yearly'>('monthly');

    const basePrice = 79000;

    const plans = [
        {
            name: 'Free Trial',
            price: 0,
            originalPrice: 0,
            description: 'Eksplorasi fitur dasar tanpa biaya.',
            features: [
                { text: 'Akses Fitur Dasar', included: true },
                { text: 'Limit Analisis Dasar', included: true },
                { text: 'Download File (PDF/Excel)', included: false },
                { text: 'Priority Support', included: false },
            ],
            cta: 'Mulai Gratis',
            highlight: false,
            href: '/register' // Tambahkan path tujuan
        },
        {
            name: 'Pro Plan',
            price: { monthly: 79000, 'semi-annual': 59000, yearly: 49000 },
            description: 'Analisis penuh tanpa batasan untuk hasil maksimal.',
            features: [
                { text: 'Semua Fitur Pro', included: true },
                { text: 'Unlimited Analisis', included: true },
                { text: 'Download File Sepuasnya', included: true },
                { text: 'Priority Support 24/7', included: true },
            ],
            cta: 'Berlangganan Pro',
            highlight: true,
            href: '/register' // Tambahkan path tujuan
        }
    ];

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    return (
        <section id="pricing" className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <Badge variant="outline" className="mb-4 border-blue-200 text-blue-700 bg-blue-50 px-4 py-1">
                    Pricing Plans
                </Badge>
                <h2 className="text-4xl font-black text-slate-900 sm:text-5xl tracking-tight">
                    Investasi Kecil, <span className="text-blue-600">Dampak Besar.</span>
                </h2>
                <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                    Pilih paket yang sesuai dengan kebutuhan finansial Anda. Mulai gratis dan upgrade kapan saja.
                </p>

                {/* Toggle Billing */}
                <div className="mt-12 flex justify-center">
                    <div className="inline-flex items-center bg-slate-200/50 p-1.5 rounded-2xl backdrop-blur-sm border border-slate-200">
                        {(['monthly', 'semi-annual', 'yearly'] as const).map((cycle) => (
                            <button
                                key={cycle}
                                onClick={() => setBillingCycle(cycle)}
                                className={`relative px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${billingCycle === cycle
                                    ? 'bg-white shadow-lg text-blue-600'
                                    : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                {cycle === 'monthly' ? '1 Bulan' : cycle === 'semi-annual' ? '6 Bulan' : '1 Tahun'}
                                {cycle === 'yearly' && (
                                    <span className="absolute -top-3 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                                        HEMAT 38%
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 max-w-5xl mx-auto">
                    {plans.map((plan) => {
                        const isFree = plan.price === 0;
                        const currentPrice = isFree ? 0 : (plan.price as any)[billingCycle];
                        const showDiscount = !isFree && billingCycle !== 'monthly';

                        return (
                            <div
                                key={plan.name}
                                className={`group relative flex flex-col p-8 bg-white border rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 ${plan.highlight
                                    ? 'border-blue-500 shadow-2xl shadow-blue-100 ring-1 ring-blue-500/20'
                                    : 'border-slate-200 shadow-xl shadow-slate-200/50 hover:border-blue-200'
                                    }`}
                            >
                                {plan.highlight && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                                        <Star size={14} className="fill-white" /> Paling Populer
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                                    <p className="mt-2 text-slate-500 font-medium text-sm">{plan.description}</p>

                                    <div className="mt-8 flex flex-col items-center">
                                        {showDiscount && (
                                            <span className="text-slate-400 line-through text-lg font-medium decoration-red-400/50">
                                                {formatCurrency(basePrice)}
                                            </span>
                                        )}
                                        <div className="flex items-baseline justify-center">
                                            <span className="text-5xl font-black text-slate-900 tracking-tighter">
                                                {isFree ? "Gratis" : formatCurrency(currentPrice)}
                                            </span>
                                            {!isFree && (
                                                <span className="ml-1 text-slate-500 font-bold text-lg">/bln</span>
                                            )}
                                        </div>
                                        {!isFree && billingCycle !== 'monthly' && (
                                            <p className="mt-2 text-green-600 text-xs font-bold bg-green-50 px-3 py-1 rounded-full">
                                                Total {formatCurrency(currentPrice * (billingCycle === 'semi-annual' ? 6 : 12))} dibayar per {billingCycle === 'semi-annual' ? '6 bulan' : 'tahun'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full h-px bg-slate-100 mb-8" />

                                <ul className="space-y-4 mb-10 text-left flex-1">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start text-sm font-medium transition-colors group-hover:text-slate-900">
                                            <div className={`mr-4 mt-0.5 rounded-full p-1 ${f.included ? 'bg-green-100' : 'bg-slate-100'}`}>
                                                {f.included ? (
                                                    <Check className="text-green-600 h-3.5 w-3.5 stroke-[3px]" />
                                                ) : (
                                                    <X className="text-slate-400 h-3.5 w-3.5 stroke-[3px]" />
                                                )}
                                            </div>
                                            <span className={f.included ? 'text-slate-700' : 'text-slate-400 line-through'}>
                                                {f.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Ganti button menjadi Link dari Next.js */}
                                <Link href={plan.href} className="w-full">
                                    <Button
                                        variant={plan.highlight ? 'default' : 'outline'}
                                        className={`w-full py-7 rounded-2xl text-lg font-black transition-all duration-300 transform active:scale-95 ${plan.highlight
                                            ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 border-none'
                                            : 'border-2 border-slate-200 hover:bg-slate-50 hover:border-blue-400 text-slate-700'
                                            }`}
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </div>
                        );
                    })}
                </div>

                <p className="mt-12 text-slate-500 text-sm">
                    Butuh paket custom untuk perusahaan? <Link href="/register" className="text-blue-600 font-bold hover:underline">Hubungi Tim Sales</Link>
                </p>
            </div>
        </section>
    );
};

export default PricingSection;