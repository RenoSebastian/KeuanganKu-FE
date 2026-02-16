"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Data Testimoni khusus Agen Asuransi dengan Foto Wajah Asli (Unsplash)
const testimonials = [
    {
        name: "Mira Indrawati",
        role: "Agen Asuransi Berprestasi",
        content: "Sejak pakai KeuanganKu, prospek klien saya naik 2x lipat! Fitur analisis kebutuhan nasabah sangat akurat. Closing deal jadi jauh lebih gampang dan cepat. Ini tools wajib agen pro!",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop",
        rating: 5
    },
    {
        name: "Rudi Hartono",
        role: "Agen Asuransi Senior",
        content: "Dulu sering kehilangan jejak prospek. Sekarang semua terorganisir rapi, pengingat follow-up otomatis, dan saya bisa fokus bangun relasi. Hasilnya? Target penjualan tercapai tiap bulan!",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&auto=format&fit=crop",
        rating: 5
    },
    {
        name: "Citra Lestari",
        role: "Agen Asuransi Baru",
        content: "Aplikasi ini mempermudah saya memahami produk asuransi dan menyajikannya ke klien dengan lebih profesional. Saya merasa lebih percaya diri dan sudah berhasil closing beberapa klien pertama saya!",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&h=150&auto=format&fit=crop",
        rating: 4
    },
    {
        name: "Agus Salim",
        role: "Team Leader Asuransi",
        content: "Sebagai team leader, saya melihat produktivitas tim meningkat drastis. Fitur kolaborasi dan pelaporan progres agen sangat membantu kami dalam mentoring dan mencapai target tim.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&h=150&auto=format&fit=crop",
        rating: 5
    }
];

const TestimonialsCarouselSection = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'start',
        dragFree: false,
        breakpoints: {
            '(min-width: 768px)': { slidesToScroll: 2 },
            '(min-width: 1024px)': { slidesToScroll: 3 },
        }
    });

    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback((emblaApi: any) => {
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect(emblaApi);
        emblaApi.on('reInit', onSelect);
        emblaApi.on('select', onSelect);
    }, [emblaApi, onSelect]);

    return (
        <section id="testimonials-carousel" className="py-24 bg-linear-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Dekorasi Latar Belakang */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <Badge variant="outline" className="mb-4 border-blue-300 text-blue-800 bg-blue-100 px-4 py-1">
                        Dampak Nyata
                    </Badge>
                    <h2 className="text-4xl font-black text-slate-900 sm:text-5xl tracking-tight leading-tight">
                        Apa Kata <span className="text-blue-700">Agen Berhasil</span>?
                    </h2>
                    <p className="mt-4 text-slate-700 max-w-2xl mx-auto text-lg leading-relaxed">
                        Dengarkan kisah sukses para agen asuransi yang telah merasakan langsung peningkatan performa dan closing rate bersama KeuanganKu.
                    </p>
                </div>

                <div className="relative group">
                    <div className="embla" ref={emblaRef}>
                        <div className="embla__container -ml-4">
                            {testimonials.map((t, i) => (
                                <div key={i} className="embla__slide pl-4">
                                    <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-[2.5rem] relative h-full flex flex-col hover:border-blue-300 hover:shadow-blue-100 transition-all duration-500 group/card">
                                        <CardContent className="p-8 flex-1 flex flex-col relative overflow-hidden">
                                            {/* Watermark Quote */}
                                            <Quote className="absolute top-8 right-8 text-blue-50 h-16 w-16 z-0 group-hover/card:text-blue-100 group-hover/card:scale-110 transition-all duration-500" />

                                            <div className="flex gap-1 mb-6 relative z-10">
                                                {[...Array(5)].map((_, index) => (
                                                    <Star
                                                        key={index}
                                                        size={18}
                                                        className={`${index < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                                    />
                                                ))}
                                            </div>

                                            <p className="text-slate-700 leading-relaxed mb-8 relative z-10 italic flex-1 text-base">
                                                "{t.content}"
                                            </p>

                                            <div className="flex items-center gap-4 mt-auto relative z-10">
                                                <Avatar className="h-14 w-14 border-2 border-white shadow-md ring-2 ring-blue-50">
                                                    <AvatarImage
                                                        src={t.avatar}
                                                        alt={t.name}
                                                        className="object-cover"
                                                    />
                                                    <AvatarFallback className="bg-blue-200 text-blue-700 font-bold text-lg">
                                                        {t.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 leading-tight">{t.name}</h4>
                                                    <p className="text-sm text-blue-600 font-semibold mt-1 uppercase tracking-wider text-[11px]">{t.role}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Buttons - Tampil saat hover area carousel */}
                    <div className="absolute inset-y-0 left-0 flex items-center -ml-4 lg:-ml-12 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={scrollPrev}
                            disabled={!prevBtnEnabled}
                            className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl border border-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                        >
                            <ChevronLeft size={24} strokeWidth={3} />
                        </button>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center -mr-4 lg:-mr-12 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={scrollNext}
                            disabled={!nextBtnEnabled}
                            className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl border border-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                        >
                            <ChevronRight size={24} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsCarouselSection;