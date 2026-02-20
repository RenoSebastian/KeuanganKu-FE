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
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
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
    },
    {
        name: "Budi Santoso",
        role: "Executive Financial Advisor",
        content: "Simulasi proteksi dan visualisasi budgeting-nya sangat intuitif. Klien yang tadinya menolak karena merasa tidak butuh, langsung paham dan setuju buka polis setelah melihat datanya.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop",
        rating: 5
    },
    {
        name: "Diana Putri",
        role: "Rookie Agent",
        content: "Sebagai agen baru, saya sering bingung menyusun proposal yang pas. KeuanganKu memberikan roadmap yang jelas, bikin saya berani jualan ke ring satu dari bulan pertama!",
        avatar: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?q=80&w=800&auto=format&fit=crop",
        rating: 5
    },
    {
        name: "Hendrik Wijaya",
        role: "Wealth Manager",
        content: "Fitur kalkulator pensiun dan Human Life Value-nya luar biasa detail. Ini bukan sekadar alat jualan biasa, tapi benar-benar financial conversation tool yang elegan untuk klien VVIP saya.",
        avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=800&auto=format&fit=crop",
        rating: 5
    },
    {
        name: "Siti Aminah",
        role: "Unit Manager",
        content: "Memantau aktivitas agen di tim saya kini semudah membuka satu dashboard. Kinerja tim meningkat tajam karena evaluasi didasarkan pada metrik yang riil.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
        rating: 4
    },
    {
        name: "Tirta Kusuma",
        role: "Independent Broker",
        content: "Sistemnya sangat agnostik. Saya bisa memetakan berbagai skenario risiko klien secara transparan. KeuanganKu benar-benar menaikkan standar profesionalisme industri asuransi.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
        rating: 5
    }
];

const TestimonialsCarouselSection = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'center',
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
        <section id="testimonials-carousel" className="py-12 relative z-10 overflow-hidden">

            {/* BAGIAN 1: HEADER (Terbatas di max-w-7xl agar rapi di tengah) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12">
                <div className="text-center">
                    <Badge
                        variant="outline"
                        className="mb-6 border-blue-400/30 text-blue-600 bg-blue-500/10 px-4 py-1.5 uppercase tracking-[0.3em] text-[10px] font-black backdrop-blur-md shadow-sm"
                    >
                        Hall of Fame
                    </Badge>

                    <h2 className="text-4xl font-black text-slate-900 sm:text-5xl tracking-tighter leading-[1.1]">
                        Apa Kata Mereka <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-700 to-indigo-600">
                            Tentang Aplikasi Kami
                        </span>
                    </h2>
                </div>
            </div>

            {/* BAGIAN 2: CAROUSEL (Dikeluarkan dari max-w-7xl agar lebarnya 100vw / edge-to-edge) */}
            <div className="relative group w-full">
                <div className="embla overflow-hidden" ref={emblaRef}>
                    {/* Padding dikembalikan ke container embla agar card pertama sejajar dengan text, tapi efek scrollnya tidak terpotong di tepi */}
                    <div className="embla__container flex touch-pan-y gap-4 px-4 md:px-8 lg:px-12 xl:px-[calc((100vw-1280px)/2+2rem)] ml-0">
                        {testimonials.map((t, i) => (
                            // Penyesuaian lebar card agar lebih proporsional saat di-scroll
                            <div key={i} className="embla__slide flex-[0_0_85%] sm:flex-[0_0_60%] md:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0 relative">

                                {/* CARD UTAMA */}
                                <div className="relative h-137.5 w-full rounded-2xl overflow-hidden group/card cursor-grab active:cursor-grabbing shadow-[0_20px_50px_rgb(0,0,0,0.1)] hover:shadow-[0_20px_60px_rgb(37,99,235,0.2)] border border-white/30 transition-all duration-500 hover:-translate-y-2">

                                    <div className="absolute inset-0 w-full h-full">
                                        <img
                                            src={t.avatar}
                                            alt={t.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105 filter brightness-[0.80] group-hover/card:brightness-90 pointer-events-none"
                                        />
                                    </div>

                                    <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-transparent opacity-90 transition-opacity duration-500 pointer-events-none" />

                                    <div className="absolute inset-0 p-6 flex flex-col justify-end pointer-events-none">
                                        <div className="absolute top-5 right-5 text-white/10 group-hover/card:text-blue-400/20 transition-colors duration-500">
                                            <Quote size={64} fill="currentColor" />
                                        </div>

                                        <div className="relative z-10 translate-y-3 transition-transform duration-500 group-hover/card:translate-y-0">
                                            <div className="flex gap-1 mb-3">
                                                {[...Array(5)].map((_, index) => (
                                                    <Star
                                                        key={index}
                                                        size={14}
                                                        fill={index < t.rating ? "#fbbf24" : "transparent"}
                                                        className={index < t.rating ? "text-amber-400" : "text-slate-600/50"}
                                                    />
                                                ))}
                                            </div>

                                            <div className="mb-6 border-l-4 border-blue-500 pl-4">
                                                <p className="text-base text-slate-100 font-medium leading-relaxed italic drop-shadow-md">
                                                    "{t.content}"
                                                </p>
                                            </div>

                                            <div className="h-px w-full bg-linear-to-r from-white/30 to-transparent mb-5" />

                                            <div>
                                                <h4 className="text-xl font-black text-white uppercase tracking-wide">
                                                    {t.name}
                                                </h4>
                                                <p className="text-xs font-bold text-blue-400 tracking-[0.2em] mt-1 uppercase drop-shadow-sm">
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
            </div>

            {/* BAGIAN 3: NAVIGASI BUTTON (Dimasukkan kembali ke container max-w-7xl agar tombol sejajar dengan batas pinggir layar) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="hidden md:flex items-center justify-end gap-3 mt-8">
                    <button
                        onClick={scrollPrev}
                        disabled={!prevBtnEnabled}
                        className="p-3 rounded-full border border-slate-200 bg-white/60 backdrop-blur-md text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 disabled:opacity-30 disabled:hover:bg-white/60 disabled:hover:text-slate-700 shadow-sm transition-all duration-300"
                    >
                        <ChevronLeft size={20} strokeWidth={3} />
                    </button>
                    <button
                        onClick={scrollNext}
                        disabled={!nextBtnEnabled}
                        className="p-3 rounded-full border border-slate-200 bg-white/60 backdrop-blur-md text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 disabled:opacity-30 disabled:hover:bg-white/60 disabled:hover:text-slate-700 shadow-sm transition-all duration-300"
                    >
                        <ChevronRight size={20} strokeWidth={3} />
                    </button>
                </div>
            </div>

        </section>
    );
};

export default TestimonialsCarouselSection;