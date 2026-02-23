"use client";

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, ChevronLeft, ChevronRight, Quote, Hand } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
            // Pada mode loop, lebih stabil menggunakan 'center' untuk semua breakpoint 
            // agar jarak kloningan Embla tidak asimetris di ujung layar.
            '(min-width: 768px)': { align: 'center' }
        }
    });

    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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
        <section id="testimonials-carousel" className="py-20 relative z-10 overflow-hidden">

            {/* BAGIAN 1: HEADER */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12 lg:mb-16">
                <div className="flex flex-col items-center justify-center text-center gap-4">
                    <Badge
                        variant="outline"
                        className="mb-2 border-blue-400/30 text-blue-600 bg-blue-500/10 px-4 py-1.5 uppercase tracking-[0.3em] text-[10px] font-black backdrop-blur-md shadow-sm"
                    >
                        Ulasan
                    </Badge>

                    <h2 className="text-4xl lg:text-5xl font-[1000] text-slate-900 tracking-tighter leading-[1.1]">
                        Apa Kata Mereka <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-700 to-indigo-600">
                            Tentang Aplikasi Kami
                        </span>
                    </h2>

                    {/* Instruksi Geser untuk Mobile */}
                    <div className="md:hidden flex items-center justify-center gap-2 text-slate-500 mt-2 bg-slate-200/50 px-4 py-2 rounded-full border border-slate-300 shadow-sm">
                        <Hand size={14} className="animate-bounce text-blue-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Geser untuk melihat</span>
                    </div>
                </div>
            </div>

            {/* BAGIAN 2: CAROUSEL WRAPPER WITH FLOATING NAVIGATION */}
            <div
                className="relative w-full max-w-[100vw]"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Navigasi Kiri */}
                <button
                    onClick={scrollPrev}
                    disabled={!prevBtnEnabled}
                    className={cn(
                        "absolute left-4 md:left-8 lg:left-[calc((100vw-1280px)/2+2rem)] top-1/2 -translate-y-1/2 z-20",
                        "flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full",
                        "bg-white/80 backdrop-blur-xl border-2 border-white shadow-[0_10px_30px_rgba(0,0,0,0.15)]",
                        "text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:scale-110",
                        "disabled:opacity-30 disabled:scale-100",
                        "transition-all duration-300",
                        "md:opacity-0 md:-translate-x-4",
                        isHovered && "md:opacity-100 md:translate-x-0"
                    )}
                >
                    <ChevronLeft size={28} strokeWidth={3} className="ml-0.5 md:ml-1" />
                </button>

                <div className="embla overflow-hidden" ref={emblaRef}>
                    {/* PERBAIKAN GAP ASIMETRIS: 
                        1. Hapus px dinamis (px-4 md:px-8 dst) dari container ini yang merusak sambungan loop.
                        2. Biarkan container membentang penuh tanpa margin aneh.
                        3. Jarak antar kartu dikendalikan murni oleh `pl-4 md:pl-6` di dalam setiap slide.
                    */}
                    <div className="embla__container flex touch-pan-y py-4">
                        {testimonials.map((t, i) => (
                            // Jarak gap sekarang diletakkan sebagai padding left (pl) pada setiap slide.
                            // Ini adalah trik Embla standar untuk memastikan loop yang mulus tanpa patah.
                            <div key={i} className="embla__slide pl-4 md:pl-6 flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0 relative">

                                {/* CARD UTAMA */}
                                <div className="relative h-104 md:h-128 w-full rounded-3xl overflow-hidden group/card cursor-grab active:cursor-grabbing shadow-[0_15px_40px_rgb(0,0,0,0.1)] hover:shadow-[0_20px_50px_rgb(37,99,235,0.2)] border border-white/60 transition-all duration-500 hover:-translate-y-2">

                                    <div className="absolute inset-0 w-full h-full">
                                        <img
                                            src={t.avatar}
                                            alt={t.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105 filter brightness-[0.75] group-hover/card:brightness-[0.85] pointer-events-none"
                                        />
                                    </div>

                                    <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/70 to-transparent opacity-95 pointer-events-none" />

                                    <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end pointer-events-none">
                                        <div className="absolute top-6 right-6 text-white/10 group-hover/card:text-blue-400/30 transition-colors duration-500 transform group-hover/card:rotate-12">
                                            <Quote size={64} fill="currentColor" />
                                        </div>

                                        <div className="relative z-10 translate-y-4 transition-transform duration-500 group-hover/card:translate-y-0">
                                            <div className="flex gap-1 mb-4">
                                                {[...Array(5)].map((_, index) => (
                                                    <Star
                                                        key={index}
                                                        size={14}
                                                        fill={index < t.rating ? "#fbbf24" : "transparent"}
                                                        className={index < t.rating ? "text-amber-400 drop-shadow-sm" : "text-slate-600/50"}
                                                    />
                                                ))}
                                            </div>

                                            <div className="mb-6 border-l-[3px] border-blue-500 pl-4">
                                                <p className="text-[15px] md:text-base text-slate-200 font-medium leading-relaxed italic drop-shadow-md line-clamp-4">
                                                    "{t.content}"
                                                </p>
                                            </div>

                                            <div className="h-px w-full bg-linear-to-r from-white/30 to-transparent mb-5" />

                                            <div>
                                                <h4 className="text-lg md:text-xl font-black text-white uppercase tracking-wide truncate">
                                                    {t.name}
                                                </h4>
                                                <p className="text-[10px] md:text-xs font-black text-blue-400 tracking-[0.2em] mt-1.5 uppercase drop-shadow-sm truncate">
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

                {/* Navigasi Kanan */}
                <button
                    onClick={scrollNext}
                    disabled={!nextBtnEnabled}
                    className={cn(
                        "absolute right-4 md:right-8 lg:right-[calc((100vw-1280px)/2+2rem)] top-1/2 -translate-y-1/2 z-20",
                        "flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full",
                        "bg-white/80 backdrop-blur-xl border-2 border-white shadow-[0_10px_30px_rgba(0,0,0,0.15)]",
                        "text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:scale-110",
                        "disabled:opacity-30 disabled:scale-100",
                        "transition-all duration-300",
                        "md:opacity-0 md:translate-x-4",
                        isHovered && "md:opacity-100 md:translate-x-0"
                    )}
                >
                    <ChevronRight size={28} strokeWidth={3} className="-mr-0.5 md:mr-1" />
                </button>
            </div>

            {/* Mobile Progress Bar (Opsional tapi sangat Best Practice) */}
            <div className="flex md:hidden items-center justify-center gap-2 mt-6">
                {[0, 1, 2].map((_, i) => (
                    <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === 0 ? "w-6 bg-blue-600" : "w-1.5 bg-slate-300")} />
                ))}
            </div>

        </section>
    );
};

export default TestimonialsCarouselSection;