"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const testimonials = [
    {
        name: "Mira Indrawati",
        role: "Top Performer Agent",
        content: "Sejak pakai KeuanganKu, prospek klien saya naik 2x lipat! Analisisnya tajam, closing jadi jauh lebih cepat. Ini senjata rahasia saya.",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop", // Ganti ke foto portrait/body shot yang lebih professional
        rating: 5
    },
    {
        name: "Rudi Hartono",
        role: "Senior Partner",
        content: "Dulu data berantakan, sekarang saya memegang kendali penuh atas bisnis saya. Target bukan lagi wacana, tapi rutinitas bulanan.",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop",
        rating: 5
    },
    {
        name: "Citra Lestari",
        role: "Rising Star Agent",
        content: "Aplikasi ini membuat saya terlihat jauh lebih profesional di depan klien. Kepercayaan diri saya meningkat pesat saat presentasi.",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop",
        rating: 4
    },
    {
        name: "Agus Salim",
        role: "Agency Director",
        content: "Produktivitas tim adalah segalanya. Dengan tools ini, monitoring dan mentoring agen jadi sangat efisien dan berbasis data.",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
        rating: 5
    }
];

const TestimonialsCarouselSection = () => {
    // Logic carousel tetap sama, hanya styling slide yang berubah
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'center', // Center align biar fokus ke 'hero' card
        breakpoints: {
            '(min-width: 768px)': { align: 'start' }
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
        <section id="testimonials-carousel" className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background decoration - optional untuk nuansa premium */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-150 h-150 rounded-full bg-blue-900 blur-[120px]" />
                <div className="absolute top-[40%] -left-[10%] w-100 h-100 rounded-full bg-indigo-900 blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <Badge
                        variant="outline"
                        className="mb-6 border-blue-500/30 text-blue-400 bg-blue-950/30 px-4 py-1.5 uppercase tracking-[0.3em] text-[10px] font-bold backdrop-blur-sm"
                    >
                        Hall of Fame
                    </Badge>
                    <h2 className="text-4xl font-black text-white sm:text-5xl tracking-tighter leading-[1.1]">
                        Apa Kata Mereka <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">
                            Tentang Aplikasi Kami
                        </span>
                    </h2>
                </div>

                {/* Carousel Container */}
                <div className="relative group">
                    <div className="embla overflow-hidden" ref={emblaRef}>
                        <div className="embla__container flex touch-pan-y gap-6 ml-0">
                            {testimonials.map((t, i) => (
                                <div key={i} className="embla__slide flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] min-w-0 relative">

                                    {/* CARD UTAMA: Full Image Overlay Style */}
                                    <div className="relative h-137.5 w-full rounded-2xl overflow-hidden group/card cursor-pointer shadow-2xl shadow-black/50 border border-white/10">

                                        {/* 1. BACKGROUND IMAGE (Full) */}
                                        <div className="absolute inset-0 w-full h-full">
                                            <img
                                                src={t.avatar}
                                                alt={t.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110 filter brightness-[0.85] group-hover/card:brightness-100"
                                            />
                                        </div>

                                        {/* 2. GRADIENT OVERLAY (Supaya text terbaca) */}
                                        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-transparent opacity-90 transition-opacity duration-500" />

                                        {/* 3. CONTENT OVERLAY */}
                                        <div className="absolute inset-0 p-8 flex flex-col justify-end">

                                            {/* Quote Icon Besar di background (aesthetic) */}
                                            <div className="absolute top-6 right-6 text-white/10">
                                                <Quote size={80} fill="currentColor" />
                                            </div>

                                            <div className="relative z-10 translate-y-4 transition-transform duration-500 group-hover/card:translate-y-0">
                                                {/* Rating Stars */}
                                                <div className="flex gap-1 mb-4">
                                                    {[...Array(5)].map((_, index) => (
                                                        <Star
                                                            key={index}
                                                            size={14}
                                                            fill={index < t.rating ? "#fbbf24" : "transparent"} // Amber-400
                                                            className={index < t.rating ? "text-amber-400" : "text-slate-600"}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Quote Text */}
                                                <p className="text-lg text-slate-200 font-medium leading-relaxed italic mb-8 border-l-4 border-blue-500 pl-4">
                                                    "{t.content}"
                                                </p>

                                                {/* Divider */}
                                                <div className="h-px w-full bg-linear-to-r from-white/20 to-transparent mb-6" />

                                                {/* Personal Identity */}
                                                <div>
                                                    <h4 className="text-2xl font-black text-white uppercase tracking-wide">
                                                        {t.name}
                                                    </h4>
                                                    <p className="text-sm font-bold text-blue-400 tracking-[0.2em] mt-1 uppercase">
                                                        {t.role}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Buttons (Ditaruh diluar atau floating) */}
                    <div className="hidden md:flex items-center justify-end gap-2 mt-8 px-4">
                        <button
                            onClick={scrollPrev}
                            disabled={!prevBtnEnabled}
                            className="p-3 rounded-full border border-white/10 bg-white/5 text-white hover:bg-blue-600 hover:border-blue-600 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={scrollNext}
                            disabled={!nextBtnEnabled}
                            className="p-3 rounded-full border border-white/10 bg-white/5 text-white hover:bg-blue-600 hover:border-blue-600 disabled:opacity-30 transition-all"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsCarouselSection;