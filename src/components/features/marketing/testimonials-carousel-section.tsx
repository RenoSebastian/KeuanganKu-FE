"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
    {
        name: "Mira Indrawati",
        role: "Agen Asuransi Berprestasi",
        content: "Sejak pakai KeuanganKu, prospek klien saya naik 2x lipat! Fitur analisis kebutuhan nasabah sangat akurat. Closing deal jadi jauh lebih gampang dan cepat. Ini tools wajib agen pro!",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&h=300&auto=format&fit=crop",
        rating: 5
    },
    {
        name: "Rudi Hartono",
        role: "Agen Asuransi Senior",
        content: "Dulu sering kehilangan jejak prospek. Sekarang semua terorganisir rapi, pengingat follow-up otomatis, dan saya bisa fokus bangun relasi. Hasilnya? Target penjualan tercapai tiap bulan!",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&h=300&auto=format&fit=crop",
        rating: 5
    },
    {
        name: "Citra Lestari",
        role: "Agen Asuransi Baru",
        content: "Aplikasi ini mempermudah saya memahami produk asuransi dan menyajikannya ke klien dengan lebih profesional. Saya merasa lebih percaya diri dan sudah berhasil closing beberapa klien pertama saya!",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&h=300&auto=format&fit=crop",
        rating: 4
    },
    {
        name: "Agus Salim",
        role: "Team Leader Asuransi",
        content: "Sebagai team leader, saya melihat produktivitas tim meningkat drastis. Fitur kolaborasi dan pelaporan progres agen sangat membantu kami dalam mentoring dan mencapai target tim.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&h=300&auto=format&fit=crop",
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
        <section id="testimonials-carousel" className="py-24 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-24">
                    <Badge
                        variant="outline"
                        className="mb-4 border-blue-200 text-blue-700 bg-blue-50 px-4 py-1 uppercase tracking-[0.2em] text-[10px] font-black"
                    >
                        Trusted by Professionals
                    </Badge>
                    <h2 className="text-4xl font-black text-slate-900 sm:text-5xl tracking-tighter leading-[1.1]">
                        Apa Kata Mereka yang <br />
                        <span className="relative inline-block mt-2">
                            <span className="relative z-10 text-blue-700">Telah Membuktikan?</span>
                            <div className="absolute -bottom-2 left-0 w-full h-3 bg-blue-100 -z-10 rounded-full opacity-60" />
                        </span>
                    </h2>
                    <p className="mt-6 text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
                        Dengarkan langsung pengalaman para agen dalam mentransformasi cara mereka berjualan menggunakan data.
                    </p>
                </div>

                <div className="relative group">
                    <div className="embla" ref={emblaRef}>
                        <div className="embla__container -ml-8">
                            {testimonials.map((t, i) => (
                                <div key={i} className="embla__slide pl-8 pt-16 pb-8"> {/* Padding top untuk ruang avatar mencuat */}
                                    <Card className="border-none shadow-2xl shadow-slate-200 rounded-[3rem] relative h-full flex flex-col bg-white hover:scale-[1.02] transition-all duration-500">

                                        {/* AVATAR BESAR - MENCUAT KE ATAS */}
                                        <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                                            <div className="relative">
                                                <Avatar className="h-32 w-32 border-[6px] border-white shadow-2xl ring-1 ring-slate-100">
                                                    <AvatarImage src={t.avatar} className="object-cover" />
                                                    <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg">
                                                    <Quote size={16} fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>

                                        <CardContent className="pt-20 px-8 pb-10 flex-1 flex flex-col text-center">
                                            {/* INFO AGEN */}
                                            <div className="mb-6">
                                                <h4 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">{t.name}</h4>
                                                <p className="text-sm text-blue-600 font-bold mt-1 tracking-widest">{t.role}</p>
                                            </div>

                                            <div className="flex justify-center gap-1 mb-6">
                                                {[...Array(5)].map((_, index) => (
                                                    <Star
                                                        key={index}
                                                        size={16}
                                                        className={`${index < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                                    />
                                                ))}
                                            </div>

                                            <p className="text-slate-600 leading-relaxed italic text-base">
                                                "{t.content}"
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <button
                        onClick={scrollPrev}
                        disabled={!prevBtnEnabled}
                        className="absolute top-1/2 -left-6 -translate-y-1/2 z-20 bg-white p-4 rounded-full shadow-2xl border border-slate-100 text-slate-400 hover:text-blue-600 disabled:hidden transition-all"
                    >
                        <ChevronLeft size={28} strokeWidth={3} />
                    </button>
                    <button
                        onClick={scrollNext}
                        disabled={!nextBtnEnabled}
                        className="absolute top-1/2 -right-6 -translate-y-1/2 z-20 bg-white p-4 rounded-full shadow-2xl border border-slate-100 text-slate-400 hover:text-blue-600 disabled:hidden transition-all"
                    >
                        <ChevronRight size={28} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsCarouselSection;